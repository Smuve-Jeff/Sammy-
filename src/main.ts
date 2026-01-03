import { bootstrapApplication } from '@angular/platform-browser';
import { provideZonelessChangeDetection } from '@angular/core';
import { AppComponent } from './video-editor/app.component';
import { provideAiService, API_KEY_TOKEN } from './services/ai.service';

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    provideAiService(),
    { provide: API_KEY_TOKEN, useValue: process.env.GEMINI_API_KEY },
  ],
}).catch(err => console.error(err));
