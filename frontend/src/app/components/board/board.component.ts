import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { GameState } from 'src/app/models/game-state.model';
import { SocketIoService } from 'src/app/services/socket.io.service';
import { GameService } from 'src/app/services/game.service';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit {
  gameId: string = '';
  
  boardDirectionArray = new Array(8).fill(0).map((_, i) => i + 1);

  constructor(
    private socketIoService: SocketIoService,
    private route: ActivatedRoute,
    private snackbar: MatSnackBar,
    private gameService: GameService
  ) { }

  ngOnInit(): void {
    this.gameId = this.route.snapshot.paramMap.get('id')!;
    this.socketIoService.connect(this.gameId);
    this.recieveJoinedPlayers();

    this.socketIoService.getGameStateFromSocket().subscribe(({ savedGameState, savedBoard }: { savedGameState: GameState, savedBoard: string }) => {
      this.gameService.setGameState(savedGameState);
      this.gameService.setGameStateBoard(savedBoard);
      console.log("Gamestate bekommen " + performance.now())
    });
  }

  recieveJoinedPlayers() {
    this.socketIoService.receivedJoinedPlayers().subscribe((message: string) => {
      this.snackbar.open(message, '', {
        duration: 1500,
      })
    })
  }

  newGame() {
    this.socketIoService.newGame(this.gameId);
  }

  flipBoard() {
    this.boardDirectionArray.reverse();
  }
}