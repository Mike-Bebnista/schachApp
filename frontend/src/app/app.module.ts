import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { DialogModule } from '@angular/cdk/dialog';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BoardComponent } from './components/board/board.component';
import { PromoteDialogComponent } from './components/promote-dialog/promote-dialog.component';
import { SquareComponent } from './components/square/square.component';
import { SquareColorPipe } from './pipes/square-color.pipe';
import { LobbyComponent } from './components/lobby/lobby.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material/material.module';

@NgModule({
  declarations: [
    AppComponent,
    BoardComponent,
    PromoteDialogComponent,
    SquareComponent,
    SquareColorPipe,
    LobbyComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    DialogModule,
    BrowserAnimationsModule,
    MaterialModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
