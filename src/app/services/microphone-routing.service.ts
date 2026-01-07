import { Injectable } from '@angular/core';
import { AudioEngineService } from './audio-engine.service';

export type StudioConnectionType = 'xlr' | 'midi' | 'usb';

export interface StudioMicChannelConfig {
  id: string;
  label: string;
  level: number;
  pan: number;
  connectionType: StudioConnectionType;
  phantomPower: boolean;
  latencyMs: number;
  noiseGate: number;
  distortionGuard: number;
  muted: boolean;
}

type MeterListener = (id: string, level: number) => void;

interface ChannelGraph {
  config?: StudioMicChannelConfig;
  stream?: MediaStream;
  source?: AudioNode;
  delay: DelayNode;
  gate: DynamicsCompressorNode;
  shaper: WaveShaperNode;
  gain: GainNode;
  analyser: AnalyserNode;
  pan: StereoPannerNode;
  meterBuffer: Float32Array;
  lastLevel: number;
  muted: boolean;
  phantomActive: boolean;
}

@Injectable({ providedIn: 'root' })
export class MicrophoneRoutingService {
  private readonly ctx = this.audioEngine.getContext();
  private readonly channels = new Map<string, ChannelGraph>();
  private phantomBusEnabled = false;
  private noiseSuppressionEnabled = true;
  private meterListeners = new Set<MeterListener>();
  private meterInterval: number | null = null;

  constructor(private readonly audioEngine: AudioEngineService) {}

  async ensureChannel(config: StudioMicChannelConfig): Promise<void> {
    const chain = this.getOrCreateChain(config.id);
    chain.config = config;
    chain.phantomActive = config.phantomPower || this.phantomBusEnabled;

    if (config.connectionType === 'midi') {
      // MIDI instruments are virtual; create a silent constant source to keep graph alive.
      if (!chain.source) {
        const constant = this.ctx.createConstantSource();
        constant.offset.value = 0;
        constant.connect(chain.delay);
        constant.start();
        chain.source = constant;
      }
      return;
    }

    // Already have a live stream
    if (chain.stream) {
      return;
    }

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      console.warn('Microphone capture is not supported in this runtime environment.');
      return;
    }

    try {
      chain.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: this.noiseSuppressionEnabled,
          autoGainControl: false,
          latency: Math.max(0.001, config.latencyMs / 1000),
        },
      });
      const source = this.ctx.createMediaStreamSource(chain.stream);
      source.connect(chain.delay);
      chain.source = source;
      await this.ctx.resume();
    } catch (error) {
      console.warn(`Unable to access microphone for channel "${config.label}"`, error);
    }
  }

  subscribeToMeters(listener: MeterListener): () => void {
    this.meterListeners.add(listener);
    this.startMeterLoop();
    return () => {
      this.meterListeners.delete(listener);
      if (this.meterListeners.size === 0) {
        this.stopMeterLoop();
      }
    };
  }

  setChannelLevel(id: string, percent: number): void {
    const chain = this.channels.get(id);
    if (!chain) return;
    chain.lastLevel = this.toGain(percent);
    if (!chain.muted) {
      chain.gain.gain.setTargetAtTime(chain.lastLevel, this.ctx.currentTime, 0.01);
    }
  }

  setChannelPan(id: string, percent: number): void {
    const chain = this.channels.get(id);
    if (!chain) return;
    const normalized = Math.max(-1, Math.min(1, percent / 50));
    chain.pan.pan.setTargetAtTime(normalized, this.ctx.currentTime, 0.01);
  }

  setChannelLatency(id: string, latencyMs: number): void {
    const chain = this.channels.get(id);
    if (!chain) return;
    const seconds = Math.max(0, latencyMs / 1000);
    chain.delay.delayTime.setTargetAtTime(seconds, this.ctx.currentTime, 0.01);
    if (chain.config) {
      chain.config.latencyMs = latencyMs;
    }
  }

  setChannelNoiseGate(id: string, percent: number): void {
    const chain = this.channels.get(id);
    if (!chain) return;
    const threshold = -80 + (percent / 100) * 40; // -80dB (open) -> -40dB (tight gate)
    chain.gate.threshold.setTargetAtTime(threshold, this.ctx.currentTime, 0.05);
    chain.gate.ratio.setTargetAtTime(20, this.ctx.currentTime, 0.05);
    chain.gate.attack.setTargetAtTime(0.005, this.ctx.currentTime, 0.05);
    chain.gate.release.setTargetAtTime(0.1, this.ctx.currentTime, 0.05);
  }

  setChannelDistortionGuard(id: string, percent: number): void {
    const chain = this.channels.get(id);
    if (!chain) return;
    chain.shaper.curve = this.createDistortionCurve(percent / 100);
  }

  setMuted(id: string, muted: boolean): void {
    const chain = this.channels.get(id);
    if (!chain) return;
    chain.muted = muted;
    const target = muted ? 0 : chain.lastLevel;
    chain.gain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.01);
    if (!muted && chain.config) {
      this.ensureChannel(chain.config);
    }
  }

  setChannelPhantomPower(id: string, enabled: boolean): void {
    const chain = this.channels.get(id);
    if (!chain || !chain.config) return;
    chain.config.phantomPower = enabled;
    chain.phantomActive = enabled || this.phantomBusEnabled;
  }

  setPhantomPowerBus(enabled: boolean): void {
    this.phantomBusEnabled = enabled;
    this.channels.forEach(chain => {
      chain.phantomActive = enabled || chain.config?.phantomPower === true;
    });
  }

  setNoiseSuppression(enabled: boolean): void {
    this.noiseSuppressionEnabled = enabled;
    // Existing streams keep previous constraints; future requests will use the new value.
  }

  async setRecordingActive(active: boolean): Promise<void> {
    if (active) {
      await this.ctx.resume();
      for (const chain of this.channels.values()) {
        if (chain.config && !chain.config.muted) {
          this.ensureChannel(chain.config);
        }
      }
      return;
    }

    if (!this.hasLiveChannels()) {
      try {
        await this.ctx.suspend();
      } catch (error) {
        console.warn('Unable to suspend audio context', error);
      }
    }
  }

  setConnectionType(id: string, connectionType: StudioConnectionType): void {
    const chain = this.getOrCreateChain(id);
    if (chain.config) {
      chain.config.connectionType = connectionType;
    }
    if (chain.stream) {
      this.teardownStream(chain);
      if (chain.config) {
        this.ensureChannel(chain.config);
      }
    }
  }

  disposeChannel(id: string): void {
    const chain = this.channels.get(id);
    if (!chain) return;
    this.teardownStream(chain);
    try {
      chain.delay.disconnect();
      chain.gate.disconnect();
      chain.shaper.disconnect();
      chain.gain.disconnect();
      chain.analyser.disconnect();
      chain.pan.disconnect();
    } catch (error) {
      console.warn('Failed to dispose channel graph', error);
    }
    this.channels.delete(id);
  }

  private teardownStream(chain: ChannelGraph): void {
    if (chain.source) {
      try {
        chain.source.disconnect();
      } catch {
        /* noop */
      }
      chain.source = undefined;
    }
    if (chain.stream) {
      chain.stream.getTracks().forEach(track => track.stop());
      chain.stream = undefined;
    }
  }

  private createDistortionCurve(amount: number): Float32Array {
    const k = amount * 100;
    const samples = 1024;
    const curve = new Float32Array(samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < samples; ++i) {
      const x = (i * 2) / samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  private getOrCreateChain(id: string): ChannelGraph {
    const existing = this.channels.get(id);
    if (existing) {
      return existing;
    }

    const delay = this.ctx.createDelay(1);
    const gate = this.ctx.createDynamicsCompressor();
    gate.threshold.value = -60;
    gate.knee.value = 10;
    gate.ratio.value = 20;
    gate.attack.value = 0.005;
    gate.release.value = 0.1;

    const shaper = this.ctx.createWaveShaper();
    shaper.curve = this.createDistortionCurve(0);

    const gain = this.ctx.createGain();
    gain.gain.value = 0;

    const pan = this.ctx.createStereoPanner();

    const analyser = this.ctx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.4;
    const meterBuffer = new Float32Array(analyser.fftSize);

    delay.connect(gate).connect(shaper).connect(gain).connect(analyser).connect(pan);
    this.audioEngine.connectExternalInput(pan);

    const chain: ChannelGraph = {
      delay,
      gate,
      shaper,
      gain,
      analyser,
      pan,
      meterBuffer,
      lastLevel: 0.7,
      muted: true,
      phantomActive: false,
    };

    this.channels.set(id, chain);
    return chain;
  }

  private startMeterLoop(): void {
    if (this.meterInterval !== null) return;
    const timerHost = typeof window !== 'undefined' ? window : globalThis;
    this.meterInterval = timerHost.setInterval(() => this.emitMeterLevels(), 120) as unknown as number;
  }

  private stopMeterLoop(): void {
    if (this.meterInterval === null) return;
    const timerHost = typeof window !== 'undefined' ? window : globalThis;
    timerHost.clearInterval(this.meterInterval);
    this.meterInterval = null;
  }

  private emitMeterLevels(): void {
    if (this.meterListeners.size === 0) {
      return;
    }
    this.channels.forEach((chain, id) => {
      chain.analyser.getFloatTimeDomainData(chain.meterBuffer);
      let sum = 0;
      for (let i = 0; i < chain.meterBuffer.length; i++) {
        const sample = chain.meterBuffer[i];
        sum += sample * sample;
      }
      const rms = Math.sqrt(sum / chain.meterBuffer.length);
      const level = Math.min(1, rms * 4);
      this.meterListeners.forEach(listener => listener(id, level));
    });
  }

  private hasLiveChannels(): boolean {
    for (const chain of this.channels.values()) {
      if (!chain.muted) {
        return true;
      }
    }
    return false;
  }

  private toGain(percent: number): number {
    const normalized = Math.max(0, Math.min(100, percent)) / 100;
    // Apply slight curve for finer resolution near zero.
    return Math.pow(normalized, 1.4);
  }
}
