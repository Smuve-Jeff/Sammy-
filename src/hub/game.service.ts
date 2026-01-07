import { Injectable } from '@angular/core';
import { signal } from '@angular/core';
import { Game } from './game';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private defaultGames: Game[] = [
    { id: 1, name: 'Babylon FPS', url: 'https://babylonjs-archive.github.io/simple-3d-fps/', image: 'https://raw.githubusercontent.com/BabylonJS/Babylon.js/master/dist/preview release/gui/screenshots/fps.png', genre: 'Shooter', tags: ['PvP','Arena'], rating: 4.2, playersOnline: 128, modes: ['duel','team'] },
    { id: 2, name: 'HexGL', url: 'https://hexgl.bkcore.com/', image: 'https://i.ytimg.com/vi/126JgG24n-A/maxresdefault.jpg', genre: 'Racing', tags: ['Time Trial'], rating: 4.0, playersOnline: 86, modes: ['solo'] },
    { id: 3, name: '3D Hartwig Chess', url: 'https://www.csszengarden.com/212', image: 'https://www.csszengarden.com/212/212.png', genre: 'Strategy', tags: ['Duel','Classic'], rating: 4.6, playersOnline: 42, modes: ['duel'] },
    { id: 4, name: 'Neon Arena', url: 'https://example.com/neon-arena', image: 'https://picsum.photos/seed/neon/640/360', genre: 'Arena', tags: ['PvP','Duel'], rating: 4.4, playersOnline: 220, modes: ['duel','team'], previewVideo: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4' },
    { id: 5, name: 'Grid Runner', url: 'https://example.com/grid-runner', image: 'https://picsum.photos/seed/grid/640/360', genre: 'Runner', tags: ['Time Trial'], rating: 3.9, playersOnline: 64, modes: ['solo'] },
    { id: 6, name: 'Cipher Clash', url: 'https://example.com/cipher-clash', image: 'https://picsum.photos/seed/cipher/640/360', genre: 'Puzzle', tags: ['Duel'], rating: 4.1, playersOnline: 73, modes: ['duel'] },
    { id: 7, name: 'Rhythm Rumble', url: 'https://example.com/rhythm-rumble', image: 'https://picsum.photos/seed/rhythm/640/360', genre: 'Rhythm', tags: ['PvP'], rating: 4.3, playersOnline: 95, modes: ['duel','team'] },
  ];

  games = signal<Game[]>([...this.defaultGames]);

  addGame(game: Omit<Game, 'id'>) {
    const newId = this.games().length > 0 ? Math.max(...this.games().map(g => g.id)) + 1 : 1;
    const newGame = { ...game, id: newId };
    this.games.update(games => [...games, newGame]);
  }
}
