import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ThemeService } from '../styles/themeService';

@Component({
  selector: 'app-header',
  templateUrl: './app-header.html',
  styleUrls: ['./app-header.scss'],
  imports: [MatIconModule, MatButtonModule],
})

export class AppHeader {
  darkMode = false;

  private readonly ThemeService = new ThemeService();

  onInit() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.darkMode = prefersDark;
    this.ThemeService.setTheme(this.darkMode ? 'dark' : 'light');
  }

  toggleDarkMode() {
    this.darkMode = !this.darkMode;
    this.ThemeService.setTheme(this.darkMode ? 'dark' : 'light');
  }
}

