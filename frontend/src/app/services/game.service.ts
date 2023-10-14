import { Injectable } from '@angular/core';
import { Dialog } from '@angular/cdk/dialog';
import { BehaviorSubject, map, Observable, pluck } from 'rxjs';
import { BoardMap, GameState } from '../models/game-state.model';
import { Colors } from '../models/colors.enum';
import { Pieces } from '../models/pieces.enum';
import { Move, MoveActions } from '../models/move.model';
import { PromoteDialogComponent, } from '../components/promote-dialog/promote-dialog.component';
import { boardInitialPosition, squareNumber } from '../utils/board';
import { calculateLegalMoves, makeMove, promote, schachMattCheck } from '../utils/moves';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GameService {
  private gameStateSubject = new BehaviorSubject<GameState>({
    board: boardInitialPosition,
    active: Colors.White,
    history: [{
      count: 0,
      from: 0,
      to: 0,
      action: null as unknown as MoveActions,
      state: boardInitialPosition,
    }],
    availableMoves: [],
  });
  schachmattEvent = new Subject<void>();

  constructor(private dialog: Dialog, private snackbar: MatSnackBar) {
  }

  get activeColor$(): Observable<Colors> {
    return this.gameStateSubject.asObservable()
      .pipe(pluck('active'));
  }

  get availableMoves$(): Observable<Move[]> {
    return this.gameStateSubject.asObservable()
      .pipe(pluck('availableMoves'));
  }

  get selectedSquare$()
    : Observable<{ rank: number, file: number } | null | undefined> {
    return this.gameStateSubject.asObservable()
      .pipe(pluck('selectedSquare'));
  }

  getPieceInSquare$(rank: number, file: number)
    : Observable<[Pieces, Colors] | undefined> {
    const square = squareNumber(rank, file);

    return this.gameStateSubject.asObservable()
      .pipe(map(({ board }) => board.get(square)));
  }

  selectSquare(rank: number, file: number): void {
    let {
      board,
      active,
      history,
      availableMoves,
      selectedSquare,
    } = this.gameStateSubject.value;
    const squareNum = squareNumber(rank, file);

    if (availableMoves.some(move => move.square === squareNum)) {
      const isPawnPromoting = this.checkIsPawnPromoting(
        board,
        squareNumber(selectedSquare!.rank, selectedSquare!.file),
        squareNum,
      );
      if (isPawnPromoting) {
        const dialog = this.dialog.open<Pieces>(
          PromoteDialogComponent,
          {
            disableClose: true,
            data: {
              color: active,
            },
          },
        );

        dialog.closed
          .subscribe(piece => {
            const {
              board,
              active,
              history,
            } = this.gameStateSubject.value;

            const { board: newBoard, entry } = promote(
              board,
              history,
              squareNum,
              piece!,
            );

            this.gameStateSubject.next({
              board: newBoard,
              active,
              history: [...history, entry],
              availableMoves: [],
              selectedSquare: null,
            });
          });
      }

      const { board: newBoard, entry } = makeMove(
        board,
        availableMoves,
        history,
        active,
        squareNum,
        selectedSquare!,
      );
      board = newBoard;
      history = [...history, entry];
      active = active === Colors.White ? Colors.Black : Colors.White;
      availableMoves = [];
      selectedSquare = null;
    } else if (board.get(squareNum)?.[1] === active) {
      selectedSquare = { rank, file };
      availableMoves = calculateLegalMoves(board, history, rank, file);
    } else {
      selectedSquare = null;
      availableMoves = [];
    }

    this.gameStateSubject.next({
      board,
      active,
      history,
      availableMoves,
      selectedSquare,
    });

    const schachMattResult = schachMattCheck(board, active, history, rank, file);
    if (schachMattResult === "Kein Schachmatt") {
    } else if (schachMattResult === "Schachmatt White") {
      this.snackbar.open('Schwarz hat durch Schachmatt gewonnen', 'ok')
      this.schachmattEvent.next();
    } else if (schachMattResult === "Schachmatt Black") {
      this.snackbar.open('Weiß hat durch Schachmatt gewonnen', 'ok')
      this.schachmattEvent.next();
    }
  }

  private checkIsPawnPromoting(board: BoardMap,
    selectedSquareNum: number,
    toSelectSquareNum: number): boolean {
    return ((toSelectSquareNum >= 1 && toSelectSquareNum <= 8)
      || (toSelectSquareNum >= 57 && toSelectSquareNum <= 64))
      && board.get(selectedSquareNum)?.[0] === Pieces.Pawn;
  }

  private boardMapToString(boardMap: BoardMap): string {
    const serializedMap: [number, [Pieces, Colors]][] = Array.from(boardMap.entries());
    return JSON.stringify(serializedMap);
  }

  private stringToBoardMap(jsonString: string): BoardMap {
    const parsedArray: [number, [Pieces, Colors]][] = JSON.parse(jsonString);
    return new Map(parsedArray);
  }

  getGameState(): GameState {
    return this.gameStateSubject.getValue();
  }

  getGameStateBoard(): string {
    return this.boardMapToString(this.gameStateSubject.value.board);
  }

  setGameState(gameState: GameState, gameStateBoard: string) {
    const currentState = this.gameStateSubject.getValue();
    if (gameState.active == undefined) {
      gameState.active = Colors.White;
    }
    currentState.active = gameState.active;
    currentState.history = gameState.history;
    
    this.gameStateSubject.next(currentState);

    const boardMap = this.stringToBoardMap(gameStateBoard);
    currentState.board = boardMap;
    currentState.history[0].state = boardMap;
    this.gameStateSubject.next(currentState);
  }
}