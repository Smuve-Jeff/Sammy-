export interface Game {
  id: number;
  name: string;
  url: string;           // Play URL or route
  image?: string;        // Cover image
  genre?: string;
  description?: string;
  tags?: string[];       // e.g., ['PvP','Shooter','Duel']
  previewVideo?: string; // Short webm/mp4 for hover preview
  rating?: number;       // 0..5
  playersOnline?: number;
  modes?: Array<'duel'|'team'|'solo'>;
}
  