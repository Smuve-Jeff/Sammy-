
import { Component, OnInit, signal, computed } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Game } from './game';
import { GameService } from './game.service';
import { WebsocketService, Message } from '../services/websocket.service';

@Component({
  selector: 'app-hub',
  templateUrl: './hub.html',
  styleUrls: ['./hub.css']
})
export class HubComponent implements OnInit {
  // Signals for state management
  filteredGames = signal<Game[]>([]); 
  activityFeed = signal<string[]>([]);
  hoveredGame = signal<Game | null>(null);
  activeGame = signal<Game | null>(null);
  activeGameUrl = computed(() => {
    const game = this.activeGame();
    return game ? this.sanitizer.bypassSecurityTrustResourceUrl(game.url) : null;
  });

  // Modal visibility signals
  isDuelModalVisible = signal(false);
  isTeamModalVisible = signal(false);

  // Filter and sort states
  filterQuery = signal('');
  filterGenre = signal('');
  filterSort = signal<'Popular' | 'Rating' | 'Newest'>('Popular');

  matchmakingStatus = signal('');

  constructor(
    private gameService: GameService, 
    private sanitizer: DomSanitizer,
    private websocketService: WebsocketService
  ) {}

  ngOnInit() {
    this.loadGames();
    this.setupActivityFeed();
    this.connectToMatchmaking();
  }

  connectToMatchmaking() {
    this.websocketService.connect('wss://tha-spot-matchmaking.glitch.me');
    this.websocketService.messages.subscribe(message => {
      console.log('Received message from matchmaking server: ', message);
      this.matchmakingStatus.set('Challenge sent!');
      this.activityFeed.update(feed => ["You challenged a player to a duel.", ...feed]);
    });
  }

  // Fetches games from the service based on current filter & sort selections
  loadGames() {
    const filters = {
      query: this.filterQuery() || undefined,
      genre: this.filterGenre() || undefined,
    };
    const sort = this.filterSort();

    this.gameService.listGames(filters, sort).subscribe(games => {
      this.filteredGames.set(games);
    });
  }
  
  // This is called by the template when a filter value changes
  applyFilters() {
    this.loadGames();
  }

  setupActivityFeed() {
    this.activityFeed.set([
      "Player <strong>N00bM4ster</strong> challenged <strong>xX_Slayer_Xx</strong> to a duel in <em>Neon Arena</em>.",
      "Team <strong>Vortex</strong> is recruiting skilled players for <em>Rhythm Rumble</em>.",
      "Your friend <strong>CyberGamer</strong> just came online.",
      "A new high score has been set in <em>Grid Runner</em>!",
    ]);
  }

  playGame(game: Game) {
    if (game.url) {
      this.activeGame.set(game);
    }
  }

  closeGame() {
    this.activeGame.set(null);
  }

  // Modal control methods
  openDuelModal() {
    this.isDuelModalVisible.set(true);
  }

  openTeamModal() {
    this.isTeamModalVisible.set(true);
  }

  sendChallenge() {
    const message: Message = {
      source: 'tha-spot',
      content: 'challenge'
    };
    this.websocketService.messages.next(message);
    this.isDuelModalVisible.set(false);
  }

  createTeam() {
    const message: Message = {
      source: 'tha-spot',
      content: 'team_create'
    };
    this.websocketService.messages.next(message);
    this.isTeamModalVisible.set(false);
  }
}
