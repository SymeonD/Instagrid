import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-header',
  templateUrl: './app-header.html',
  styleUrls: ['./app-header.scss'],
  imports: [MatIconModule, MatButtonModule],
})

export class AppHeader {
  darkMode = false;

  toggleDarkMode() {
    this.darkMode = !this.darkMode;
  }
}

