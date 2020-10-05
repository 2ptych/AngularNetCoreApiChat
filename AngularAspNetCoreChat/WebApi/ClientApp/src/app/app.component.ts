import { Component } from '@angular/core';
import { SignalRService } from './services/signalr.service';
import { AuthenticationService } from './services/auth.service';

@Component({
  selector: 'app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor() { }
}
