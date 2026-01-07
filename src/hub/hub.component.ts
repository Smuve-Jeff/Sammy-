import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameService } from './game.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-hub',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './hub.component.html',
  styleUrls: ['./hub.component.css']
})
export class HubComponent {
  games = this.gameService.games;
  selectedGameUrl: SafeResourceUrl | null = null;

  // UI filter state
  query = signal('');
  genre = signal('All');
  sort = signal('Trending');

  filteredGames = computed(() => {
    const q = this.query().toLowerCase().trim();
    const g = this.genre();
    const s = this.sort();
    let list = [...this.games()];

    if (g && g !== 'All') {
      list = list.filter(x => (x.genre || '').toLowerCase() === g.toLowerCase());
    }
    if (q) {
      list = list.filter(x =>
        x.name.toLowerCase().includes(q) ||
        (x.tags || []).some(t => t.toLowerCase().includes(q)) ||
        (x.genre || '').toLowerCase().includes(q)
      );
    }

    switch (s) {
      case 'Popular':
        list.sort((a,b) => (b.playersOnline||0) - (a.playersOnline||0));
        break;
      case 'Newest':
        list.sort((a,b) => (b.id||0) - (a.id||0));
        break;
      case 'Rating':
        list.sort((a,b) => (b.rating||0) - (a.rating||0));
        break;
      default: // Trending (approx by playersOnline + rating weight)
        list.sort((a,b) => ((b.playersOnline||0)*1.0 + (b.rating||0)*20) - ((a.playersOnline||0)*1.0 + (a.rating||0)*20));
    }

    return list;
  });

  constructor(private gameService: GameService, private sanitizer: DomSanitizer) {}

  selectGame(url: string) {
    this.selectedGameUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  closeGame() {
    this.selectedGameUrl = null;
  }
}
