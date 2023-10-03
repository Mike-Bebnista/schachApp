import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SocketIoService } from 'src/app/services/socket.io.service';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss']
})
export class LobbyComponent {

  constructor(private router: Router, private socketIoService: SocketIoService,) { }

  createGame(gameTime: number) {
    const uuid = uuidv4();
    this.router.navigate(['/board', uuid]);
    this.socketIoService.connect(uuid);
    this.socketIoService.setTime(gameTime);
  }
}
