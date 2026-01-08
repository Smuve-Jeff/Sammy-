import { Component, OnInit, signal } from '@angular/core';
import { ConnectionsService, Connection } from './connections.service';

@Component({
  selector: 'app-connections',
  templateUrl: './connections.component.html',
  styleUrls: ['./connections.component.css']
})
export class ConnectionsComponent implements OnInit {
  connections = signal<Connection[]>([]);

  constructor(private connectionsService: ConnectionsService) { }

  ngOnInit(): void {
    this.connections.set(this.connectionsService.getConnections());
  }
}
