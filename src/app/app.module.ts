import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { HubComponent } from './hub/hub.component';
import { GameService } from './hub/game.service';
import { WebsocketService } from './services/websocket.service';
import { GameListComponent } from './hub/game-list/game-list.component';
import { GameSearchComponent } from './hub/game-search/game-search.component';
import { ModalComponent } from './hub/modal.component';
import { ConnectionsComponent } from './hub/connections/connections.component';
import { DmComponent } from './hub/dm/dm.component';
import { GameViewComponent } from './hub/game-view/game-view.component';
import { LobbyComponent } from './hub/lobby/lobby.component';
import { AppRoutingModule } from './app-routing.module';
import { EqPanelComponent } from './components/eq-panel/eq-panel.component';
import { ChatbotComponent } from './components/chatbot/chatbot.component';
import { ImageEditorComponent } from './components/image-editor/image-editor.component';
import { AudioVisualizerComponent } from './components/audio-visualizer/audio-visualizer.component';
import { PianoRollComponent } from './components/piano-roll/piano-roll.component';
import { NetworkingComponent } from './components/networking/networking.component';
import { ProfileEditorComponent } from './components/profile-editor/profile-editor.component';
import { StudioInterfaceComponent } from './components/studio-interface/studio-interface.component';
import { AiService, API_KEY_TOKEN } from './services/ai.service';
import { ArtistProfileIntroComponent } from './components/artist-profile-intro/artist-profile-intro.component';
import { DjDeckComponent } from './components/dj-deck/dj-deck.component';
import { LoginComponent } from './components/login/login.component';
import { SampleLibraryComponent } from './components/sample-library/sample-library.component';
import { UserProfileBuilderComponent } from './components/user-profile-builder/user-profile-builder.component';
import { GameCardComponent } from './hub/game-card/game-card.component';
import { ProfileComponent } from './hub/profile/profile.component';

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
    LobbyComponent,
    EqPanelComponent,
    ChatbotComponent,
    ImageEditorComponent,
    AudioVisualizerComponent,
    PianoRollComponent,
    NetworkingComponent,
    ProfileEditorComponent,
    StudioInterfaceComponent,
    ArtistProfileIntroComponent,
    DjDeckComponent,
    LoginComponent,
    SampleLibraryComponent,
    UserProfileBuilderComponent,
    GameCardComponent,
    ProfileComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    AppRoutingModule,
    NoopAnimationsModule,
  ],
  providers: [
    GameService, 
    WebsocketService, 
    AiService, 
    { provide: API_KEY_TOKEN, useValue: '' }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
