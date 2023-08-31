import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss']
})
export class LobbyComponent {

  constructor(private router: Router){}

  createGame(){
    const uuid = uuidv4();
    this.router.navigate(['/board', uuid]);
  }
}
