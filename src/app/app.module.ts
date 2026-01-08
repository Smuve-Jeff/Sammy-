import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { HubComponent } from '../hub/hub.component';
import { GameService } from '../hub/game.service';
import { WebsocketService } from '../services/websocket.service';
import { GameListComponent } from '../hub/game-list/game-list.component';
import { GameSearchComponent } from '../hub/game-search/game-search.component';
import { ModalComponent } from '../hub/modal/modal.component';
import { ConnectionsComponent } from '../hub/connections/connections.component';
import { DmComponent } from '../hub/dm/dm.component';
import { GameViewComponent } from '../hub/game-view/game-view.component';

@NgModule({
  declarations: [
    AppComponent,
    HubComponent,
    GameListComponent,
    GameSearchComponent,
    ModalComponent,
    ConnectionsComponent,
    DmComponent,
    GameViewComponent,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  providers: [GameService, WebsocketService],
  bootstrap: [AppComponent]
})
export class AppModule { }
