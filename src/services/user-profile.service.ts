
import { Injectable, signal, effect } from '@angular/core';

export interface UserProfile {
  artistName: string;
  primaryGenre: string;
  secondaryGenres: string[];
  skills: string[];
  careerGoals: string[];
  currentFocus: string;
  influences: string;
  bio: string;
  links: { [key: string]: string; };
}

export const initialProfile: UserProfile = {
  artistName: 'New Artist',
  primaryGenre: '',
  secondaryGenres: [],
  skills: [],
  careerGoals: [],
  currentFocus: '',
  influences: '',
  bio: 'Describe your musical journey...',
  links: {},
};

const USER_PROFILE_STORAGE_KEY = 'aura_user_profile';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  profile = signal<UserProfile>(initialProfile);

  constructor() {
    this.loadProfileFromStorage();
    effect(() => {
      this.saveProfileToStorage(this.profile());
    });
  }

  private loadProfileFromStorage(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedProfile = localStorage.getItem(USER_PROFILE_STORAGE_KEY);

      // FIX: Strictly validate that storedProfile is not "undefined" or "null" strings
      // and is not null/empty before attempting to parse.
      if (storedProfile &&
          storedProfile.trim() !== 'undefined' &&
          storedProfile.trim() !== 'null') {
        try {
          const parsedProfile = JSON.parse(storedProfile);

          // Validate parsed object structure to prevent runtime errors
          if (parsedProfile && typeof parsedProfile === 'object') {
             // Ensure that loaded profile has a links property
            if (!parsedProfile.links) {
              parsedProfile.links = {};
            }
            this.profile.set(parsedProfile);
          } else {
            // If parsed result is null or not an object, reset
             this.profile.set(initialProfile);
          }
        } catch (e) {
          console.warn('UserProfileService: Failed to parse stored profile. Resetting.', e);
          // If parsing fails, clear the corrupted data
          localStorage.removeItem(USER_PROFILE_STORAGE_KEY);
          this.profile.set(initialProfile);
        }
      }
    }
  }

  private saveProfileToStorage(profile: UserProfile): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        if (profile) {
          localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(profile));
        }
      } catch (e) {
        console.error('UserProfileService: Error saving profile', e);
      }
    }
  }

  updateProfile(newProfile: UserProfile): void {
    this.profile.set(newProfile);
  }
}
