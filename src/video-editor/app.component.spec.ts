
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { UserContextService } from '../services/user-context.service';
import { AiService } from '../services/ai.service';
import { AuthService } from '../services/auth.service';
import { UserProfileService } from '../services/user-profile.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Mock dependencies
class MockUserContextService {
  setMainViewMode = jasmine.createSpy('setMainViewMode');
  setTheme = jasmine.createSpy('setTheme');
  setLastImageUrl = jasmine.createSpy('setLastImageUrl');
}
class MockAiService {}
class MockAuthService {}
class MockUserProfileService {}

// Create dummy components for all the components imported in AppComponent
@Component({ selector: 'app-eq-panel', standalone: true, template: '' })
class DummyEqPanelComponent {}

@Component({ selector: 'app-matrix-background', standalone: true, template: '' })
class DummyMatrixBackgroundComponent {}

@Component({ selector: 'app-chatbot', standalone: true, template: '' })
class DummyChatbotComponent {}

@Component({ selector: 'app-image-editor', standalone: true, template: '' })
class DummyImageEditorComponent {}

@Component({ selector: 'app-video-editor', standalone: true, template: '' })
class DummyVideoEditorComponent {}

@Component({ selector: 'app-audio-visualizer', standalone: true, template: '' })
class DummyAudioVisualizerComponent {}

@Component({ selector: 'app-piano-roll', standalone: true, template: '' })
class DummyPianoRollComponent {}

@Component({ selector: 'app-networking', standalone: true, template: '' })
class DummyNetworkingComponent {}

@Component({ selector: 'app-profile-editor', standalone: true, template: '' })
class DummyProfileEditorComponent {}

@Component({ selector: 'app-hub', standalone: true, template: '' })
class DummyHubComponent {}

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent, CommonModule, FormsModule],
      providers: [
        { provide: UserContextService, useClass: MockUserContextService },
        { provide: AiService, useClass: MockAiService },
        { provide: AuthService, useClass: MockAuthService },
        { provide: UserProfileService, useClass: MockUserProfileService },
      ],
    })
    .overrideComponent(AppComponent, {
        set: {
            imports: [
                CommonModule,
                FormsModule,
                DummyEqPanelComponent,
                DummyMatrixBackgroundComponent,
                DummyChatbotComponent,
                DummyImageEditorComponent,
                DummyVideoEditorComponent,
                DummyAudioVisualizerComponent,
                DummyPianoRollComponent,
                DummyNetworkingComponent,
                DummyProfileEditorComponent,
                DummyHubComponent
            ]
        }
    })
    .compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'user-profile-builder' mainViewMode initially`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.mainViewMode()).toEqual('user-profile-builder');
  });

  it('should toggle main view mode', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    app.mainViewMode.set('player');
    app.toggleMainViewMode();
    expect(app.mainViewMode()).toEqual('dj');
    app.toggleMainViewMode();
    expect(app.mainViewMode()).toEqual('piano-roll');
  });

  it('should handle file input', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    const file = new File([''], 'test.mp3', { type: 'audio/mpeg' });
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    const input = document.createElement('input');
    input.files = dataTransfer.files;
    const event = { target: input } as any;
    app.handleFiles(event);
    expect(app.playlist().length).toBe(1);
    expect(app.playlist()[0].name).toBe('test.mp3');
  });

  it('should play next track', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    app.playlist.set([
        { name: 'test1', url: 'test1.mp3' },
        { name: 'test2', url: 'test2.mp3' }
    ]);
    app.currentTrackIndex.set(0);
    app.playNext();
    expect(app.currentTrackIndex()).toBe(1);
    app.playNext();
    expect(app.currentTrackIndex()).toBe(0); // wraps around
  });

  it('should play previous track', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    app.playlist.set([
        { name: 'test1', url: 'test1.mp3' },
        { name: 'test2', url: 'test2.mp3' }
    ]);
    app.currentTrackIndex.set(1);
    app.playPrevious();
    expect(app.currentTrackIndex()).toBe(0);
    app.playPrevious();
    expect(app.currentTrackIndex()).toBe(1); // wraps around
  });

  it('should randomize theme', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    const initialTheme = app.currentTheme();
    let differentTheme = false;
    for (let i = 0; i < 10; i++) { // try a few times to get a different theme
        app.randomizeTheme();
        if(app.currentTheme() !== initialTheme) {
            differentTheme = true;
            break;
        }
    }
    expect(differentTheme).toBe(true);
  });

});
