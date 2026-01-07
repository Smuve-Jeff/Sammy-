import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from './game.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-hub',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hub.component.html',
  styleUrls: ['./hub.component.css']
})
export class HubComponent {
  games = this.gameService.games;
  selectedGameUrl: SafeResourceUrl | null = null;

  // UI filter state (Phase 1 visual; not wired to service filters yet)
  query = signal('');
  genre = signal('All');
  sort = signal('Trending');

  constructor(private gameService: GameService, private sanitizer: DomSanitizer) {}

  selectGame(url: string) {
    this.selectedGameUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  closeGame() {
    this.selectedGameUrl = null;
  }
}
