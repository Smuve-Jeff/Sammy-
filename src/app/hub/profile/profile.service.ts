import { Injectable, signal } from '@angular/core';

export interface ShowcaseItem {
  type: 'music' | 'video' | 'project' | 'merch';
  title: string;
  url: string;
  imageUrl: string;
  price?: number;
  visibility: 'private' | 'public';
}

export interface GamingProfile {
  userId: string;
  handle: string;
  avatarUrl: string;
  bannerUrl: string;
  bio: string;
  tags: string[];
  links: { [key: string]: string };
  showcases: ShowcaseItem[];
  stats: { [key: string]: number };
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  myProfile = signal<GamingProfile | null>(null);

  constructor() {
    // Mock data for now
    this.myProfile.set({
      userId: '1',
      handle: 'SmuveJeff',
      avatarUrl: 'https://picsum.photos/seed/smuve/200/200',
      bannerUrl: 'https://picsum.photos/seed/smuve-banner/1200/400',
      bio: 'Just a simple artist trying to make it in the world.',
      tags: ['Music', 'Gaming', 'Art'],
      links: {
        twitter: 'https://twitter.com/smuvejeff',
        instagram: 'https://instagram.com/smuvejeff',
        youtube: 'https://youtube.com/smuvejeff'
      },
      showcases: [
        { type: 'music', title: 'My new track', url: 'https://soundcloud.com/smuvejeff/track1', imageUrl: 'https://picsum.photos/seed/track1/400/400', visibility: 'public' },
        { type: 'merch', title: 'My new shirt', url: 'https://smuvejeff.creator-spring.com/listing/smuve-logo', imageUrl: 'https://picsum.photos/seed/merch1/400/400', price: 25, visibility: 'public' },
        { type: 'music', title: 'Another banger', url: 'https://soundcloud.com/smuvejeff/track2', imageUrl: 'https://picsum.photos/seed/track2/400/400', visibility: 'private' },

      ],
      stats: {
        matchesPlayed: 123,
        wins: 45,
        rank: 12,
        followers: 1234,
        following: 123
      }
    });
  }

  getMyProfile() {
    return this.myProfile;
  }

  updateProfile(profile: Partial<GamingProfile>) {
    this.myProfile.update(p => (p ? { ...p, ...profile } : null));
  }

  addShowcaseItem(item: Omit<ShowcaseItem, 'visibility'>) {
    const newItem: ShowcaseItem = { ...item, visibility: 'private' };
    this.myProfile.update(p => (p ? { ...p, showcases: [...p.showcases, newItem] } : null));
  }

  updateShowcaseItem(item: ShowcaseItem) {
    this.myProfile.update(p => {
      if (!p) return null;
      const index = p.showcases.findIndex(s => s.url === item.url);
      if (index === -1) return p;
      const newShowcases = [...p.showcases];
      newShowcases[index] = item;
      return { ...p, showcases: newShowcases };
    });
  }

  follow(userId: string) {
    console.log(`Following user ${userId}`);
  }
}
