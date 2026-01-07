import { Injectable, signal } from '@angular/core';

// High-precision WebAudio scheduler with lookahead and sample/synth playback
// Phase A foundation: transport, tempo, scheduler, sample player, basic synth, mixer buses

export type NoteEvent = {
  time: number; // seconds (AudioContext time)
  duration: number; // seconds
  midi: number; // 0-127
  velocity: number; // 0..1
  channel?: number; // track id
};

export type InstrumentType = 'sample' | 'synth';

export interface InstrumentDefinition {
  id: string;
  name: string;
  type: InstrumentType;
  // sample mapping or synth params
  sampleMapUrl?: string; // JSON map for multi-samples
  params?: Record<string, number | string>;
}

export interface TrackState {
  id: number;
  name: string;
  instrumentId: string;
  gain: number;
  pan: number;
  sendA: number; // reverb
  sendB: number; // delay
}

@Injectable({ providedIn: 'root' })
export class AudioEngineService {
  private ctx: AudioContext;
  private masterGain: GainNode;
  private analyser: AnalyserNode;
  private compressor: DynamicsCompressorNode;

  // FX buses
  private reverbConvolver: ConvolverNode;
  private delay: DelayNode;
  private delayFeedback: GainNode;
  private delayWet: GainNode;
  private reverbWet: GainNode;

  // scheduler
  private lookahead = 0.1; // s
  private scheduleAheadTime = 0.2; // s
  private timerId: number | null = null;
  private nextNoteTime = 0;

  // tempo/transport
  tempo = signal(120);
  isPlaying = signal(false);
  currentBeat = signal(0);
  loopStart = signal(0);
  loopEnd = signal(16); // 16 steps default
  stepsPerBeat = signal(4); // 16th notes

  // tracks
  private tracks = new Map<number, TrackState>();

  constructor() {
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.9;
    this.compressor = this.ctx.createDynamicsCompressor();
    this.analyser = this.ctx.createAnalyser();

    // FX setup
    this.reverbConvolver = this.ctx.createConvolver();
    this.reverbWet = this.ctx.createGain();
    this.reverbWet.gain.value = 0.15;
    this.delay = this.ctx.createDelay(5.0);
    this.delay.delayTime.value = 0.25; // quarter note-ish
    this.delayFeedback = this.ctx.createGain();
    this.delayFeedback.gain.value = 0.3;
    this.delayWet = this.ctx.createGain();
    this.delayWet.gain.value = 0.2;

    // wire FX graph
    this.delay.connect(this.delayFeedback);
    this.delayFeedback.connect(this.delay);
    this.delay.connect(this.delayWet);
    this.reverbConvolver.connect(this.reverbWet);

    // master chain
    this.reverbWet.connect(this.compressor);
    this.delayWet.connect(this.compressor);
    this.masterGain.connect(this.compressor);
    this.compressor.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    // basic small impulse for convolver placeholder
    this.loadDefaultImpulse();
  }

  getAnalyser(): AnalyserNode { return this.analyser; }
  getContext(): AudioContext { return this.ctx; }

  private async loadDefaultImpulse() {
    const rate = this.ctx.sampleRate;
    const len = rate * 1.2;
    const impulse = this.ctx.createBuffer(2, len, rate);
    for (let c = 0; c < 2; c++) {
      const ch = impulse.getChannelData(c);
      for (let i = 0; i < len; i++) {
        ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2); // quick decay noise
      }
    }
    this.reverbConvolver.buffer = impulse;
  }

  ensureTrack(track: TrackState) {
    this.tracks.set(track.id, track);
  }

  updateTrack(id: number, patch: Partial<TrackState>) {
    const t = this.tracks.get(id);
    if (!t) return;
    Object.assign(t, patch);
  }

  // Scheduling
  private scheduleTick() {
    const spb = 60 / this.tempo();
    const stepDur = spb / (this.stepsPerBeat());

    while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadTime) {
      const stepIndex = this.currentBeat();
      // Emit hook or call registered callbacks per track to request notes for this step
      this.onScheduleStep?.(stepIndex, this.nextNoteTime, stepDur);
      // advance
      const next = (stepIndex + 1) % this.loopEnd();
      this.currentBeat.set(next);
      this.nextNoteTime += stepDur;
      if (next === this.loopStart()) {
        // loop wrap ensured by modulo
      }
    }
  }

  onScheduleStep?: (stepIndex: number, when: number, stepDur: number) => void;

  start() {
    if (this.isPlaying()) return;
    this.isPlaying.set(true);
    this.nextNoteTime = this.ctx.currentTime + 0.05;
    this.timerId = window.setInterval(() => this.scheduleTick(), this.lookahead * 1000);
  }

  stop() {
    if (!this.isPlaying()) return;
    this.isPlaying.set(false);
    if (this.timerId) { clearInterval(this.timerId); this.timerId = null; }
  }

  // Playback primitives
  playSample(buffer: AudioBuffer, when: number, velocity = 1, pan = 0, outGain = 1, sendA = 0, sendB = 0) {
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const vca = this.ctx.createGain();
    vca.gain.value = velocity * outGain;
    const p = this.ctx.createStereoPanner();
    p.pan.value = pan;

    src.connect(vca).connect(p).connect(this.masterGain);
    if (sendA > 0) vca.connect(this.reverbConvolver).connect(this.reverbWet);
    if (sendB > 0) vca.connect(this.delay).connect(this.delayWet);

    src.start(when);
  }

  playSynth(when: number, freq: number, duration: number, velocity = 1, pan = 0, outGain = 0.6, sendA = 0.1, sendB = 0.05, params?: { type?: OscillatorType; attack?: number; decay?: number; sustain?: number; release?: number; cutoff?: number; q?: number; }) {
    const osc = this.ctx.createOscillator();
    osc.type = params?.type || 'sawtooth';
    const vca = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = params?.cutoff ?? 8000;
    filter.Q.value = params?.q ?? 0.707;

    const p = this.ctx.createStereoPanner();
    p.pan.value = pan;

    const a = params?.attack ?? 0.005;
    const d = params?.decay ?? 0.08;
    const s = params?.sustain ?? 0.7;
    const r = params?.release ?? 0.15;

    const now = when;
    vca.gain.setValueAtTime(0, now);
    vca.gain.linearRampToValueAtTime(velocity * outGain, now + a);
    vca.gain.linearRampToValueAtTime(velocity * outGain * s, now + a + d);
    vca.gain.setTargetAtTime(0, now + duration, r);

    osc.frequency.value = freq;
    osc.connect(filter).connect(vca).connect(p).connect(this.masterGain);
    if (sendA > 0) vca.connect(this.reverbConvolver).connect(this.reverbWet);
    if (sendB > 0) vca.connect(this.delay).connect(this.delayWet);

    osc.start(now);
    osc.stop(now + duration + 2.0);
  }

  midiToFreq(midi: number) { return 440 * Math.pow(2, (midi - 69) / 12); }
}
