import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HubComponent } from './hub.component';
import { GameListComponent } from './game-list/game-list.component';
import { GameSearchComponent } from './game-search/game-search.component';
import { GameService } from './game.service';
import { LobbyComponent } from './lobby/lobby.component';
import { ModalComponent } from '../hub/modal.component';
import { WebsocketService } from '../services/websocket.service';

@NgModule({
  declarations: [
    HubComponent,
    GameListComponent,
    GameSearchComponent,
    LobbyComponent,
    ModalComponent
  ],
  imports: [
    CommonModule
  ],
  providers: [GameService, WebsocketService],
  exports: [HubComponent]
})
export class ThaSpotModule { }
