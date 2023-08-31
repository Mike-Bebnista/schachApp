import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { io, Socket } from 'socket.io-client'
import { Observable } from 'rxjs';
import { GameState } from '../models/game-state.model';

@Injectable({
  providedIn: 'root'
})
export class SocketIoService {

  socket: Socket | undefined;
  
  constructor() {}

  connect(gameId: string){
    this.socket = io(environment.SOCKET_ENDPOINT);
    this.socket.emit('joinGame', {gameId: gameId});
  }

  receivedJoinedPlayers(): Observable<string>{
    return new Observable((observer) => {
      if (this.socket) {
        this.socket.on('joinGame', (message: string) => {
          observer.next(message);
        });
      }
    });
  }

  updateGameStateBackend(data: { gameState: any, gameStateBoard: string }): void {
    if (this.socket) {
        this.socket.emit('updateGameStateBackend', data);
        //console.log('Zum Socket geschickt: ' + JSON.stringify(data));
    }
  }

  getGameStateFromSocket(): Observable<{gameState: GameState, savedBoard: string}> {
    return new Observable((observer) => {
      if (this.socket) {
        this.socket.on('gameStateVomSocket', ({ gameState, savedBoard }) => {
          observer.next({gameState, savedBoard});
        });
      }
    });
  }
}
