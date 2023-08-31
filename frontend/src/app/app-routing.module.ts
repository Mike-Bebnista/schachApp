import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LobbyComponent } from './components/lobby/lobby.component';
import { BoardComponent } from './components/board/board.component';

const routes: Routes = [
  {path: '', component: LobbyComponent},
  {path: 'board/:id', component: BoardComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
