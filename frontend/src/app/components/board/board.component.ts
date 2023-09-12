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
  whiteTimerFront: number = 180000;
  blackTimerFront: number = 180000;
  whiteTimer: number =  180000 //Die wahre Zeit
  blackTimer: number =  180000 // Die wahre Zeit
  timerInterval: any;
  whiteTimerInterval: any;
  blackTimerInterval: any;

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

      this.socketIoService.geUpdateTimers().subscribe(({ whiteTimer, blackTimer }) => {
        this.whiteTimerFront = whiteTimer;
        this.blackTimerFront = blackTimer;
      });
      this.startTimer(savedGameState);
    });
  }
  ngOnDestroy(): void {
    clearInterval(this.timerInterval);
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

  startTimer(savedGameState: GameState) {
    clearInterval(this.whiteTimerInterval);
    clearInterval(this.blackTimerInterval);
    if (savedGameState.active === 'Black' && this.blackTimer > 0) {
      this.blackTimerInterval = setInterval(() => {
        this.blackTimerFront -= 1000;
        if (this.blackTimerFront <= 0) {
          clearInterval(this.blackTimerInterval);
          this.blackTimerFront = 0;
        }
      }, 1000);
    } else if (savedGameState.active === 'White' && this.whiteTimer > 0) {
      this.whiteTimerInterval = setInterval(() => {
        this.whiteTimerFront -= 1000;
        if (this.whiteTimerFront <= 0) {
          clearInterval(this.whiteTimerInterval);
          this.whiteTimerFront = 0;
        }
      }, 1000);
    } else if (this.blackTimer <= 0 ){
      clearInterval(this.blackTimerInterval);
      this.blackTimerFront = 0;
      this.snackbar.open('Schwarz hat durch Zeit verloren', 'ok')
    } else if (this.whiteTimer <= 0){
      clearInterval(this.blackTimerInterval);
      this.whiteTimerFront = 0;
      this.snackbar.open('Schwarz hat durch Zeit verloren', 'ok')
    }
  }
}