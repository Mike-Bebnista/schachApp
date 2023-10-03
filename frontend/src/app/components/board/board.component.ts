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
  whiteTimerFront: number = 0;
  blackTimerFront: number = 0;
  whiteBoardTimer: number = 0;
  blackBoardTimer: number = 0;
  timerInterval: any;
  whiteTimerInterval: any;
  blackTimerInterval: any;
  savedGameStateHier: any;
  savedBoardHier: any;
  schachMattBool = false;

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
      for (let h of savedGameState.history) {
        if (Object.keys(h.state).length > 0) {
          h.state = new Map(h.state);
        }
      }
      this.gameService.setGameState(savedGameState);
      this.savedGameStateHier = savedGameState
      this.savedBoardHier = savedBoard
      this.gameService.setGameStateBoard(savedBoard);
      //console.log("Gamestate bekommen " + performance.now())
      this.socketIoService.getUpdateTimers().subscribe(({ whiteTimer, blackTimer }) => {
        this.whiteTimerFront = whiteTimer;
        this.blackTimerFront = blackTimer;
        this.whiteBoardTimer = whiteTimer
        this.blackBoardTimer = blackTimer
        //console.log("gamelength " + savedGameState.history.length) //Gamelength stimmt noch nicht aktuell
        this.startTimer(savedGameState);
      });
    });

    this.gameService.schachmattEvent.subscribe(() => {
      this.schachMattBool = true;
    });

    this.socketIoService.onOpponentSurrendered().subscribe(() => {
      this.snackbar.open('Dein Gegner hat aufgegeben', 'ok');
      this.stopTimer()
      this.schachMattBool = true;
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
    this.whiteTimerFront = 0
    this.blackTimerFront = 0
    this.schachMattBool = false
  }

  flipBoard() {
    this.boardDirectionArray.reverse();
  }

  startTimer(savedGameState: GameState) {
    this.stopTimer();
    if (this.schachMattBool == false) {
      if (savedGameState.history.length >= 2) {
        if (savedGameState.active === 'Black' && this.blackBoardTimer > 0) {
          this.blackTimerInterval = setInterval(() => {
            this.blackTimerFront -= 10;
            if (this.blackTimerFront <= 0) {
              clearInterval(this.blackTimerInterval);
              this.blackTimerFront = 0;
              this.schachMattBool = true
            }
          }, 10);
        } else if (savedGameState.active === 'White' && this.whiteBoardTimer > 0) {
          this.whiteTimerInterval = setInterval(() => {
            this.whiteTimerFront -= 10;
            if (this.whiteTimerFront <= 0) {
              clearInterval(this.whiteTimerInterval);
              this.whiteTimerFront = 0;
              this.schachMattBool = true
            }
          }, 10);
        } else if (this.blackBoardTimer <= 0) {
          clearInterval(this.blackTimerInterval);
          this.blackTimerFront = 0;
          this.snackbar.open('Schwarz hat durch Zeit verloren', 'ok')
        } else if (this.whiteBoardTimer <= 0) {
          clearInterval(this.whiteTimerInterval);
          this.whiteTimerFront = 0;
          this.snackbar.open('Weiß hat durch Zeit verloren', 'ok')
        }
      }
    }
  }

  formatTime(whiteTimerFront: number) {
    const minutes = Math.floor(whiteTimerFront / 60000);
    const seconds = Math.floor((whiteTimerFront % 60000) / 1000);
    const milliseconds = whiteTimerFront % 1000;
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');
    const formattedMilliseconds = String(milliseconds).padStart(3, '0');
    return formattedMinutes + ':' + formattedSeconds + ':' + formattedMilliseconds;
  }

  stopTimer() {
    clearInterval(this.whiteTimerInterval);
    clearInterval(this.blackTimerInterval);
  }

  surrender() {
    this.schachMattBool = true
    this.stopTimer()
    this.snackbar.open('Du hast aufgegeben', 'ok')
    this.socketIoService.sendSurrender();
  }
}