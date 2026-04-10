import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ThemeService } from '../../shared/styles/themeService';

@Component({
  selector: 'app-header',
  templateUrl: './app-header.html',
  styleUrls: ['./app-header.scss'],
  imports: [MatIconModule, MatButtonModule],
})

export class AppHeader implements OnInit {
  darkMode = false;

  constructor(private themeService: ThemeService) {}

  ngOnInit() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.darkMode = prefersDark;
    this.themeService.setTheme(this.darkMode ? 'dark' : 'light');
  }

  toggleDarkMode() {
    this.darkMode = !this.darkMode;
    this.themeService.setTheme(this.darkMode ? 'dark' : 'light');
  }
}

