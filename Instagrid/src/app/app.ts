import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppGrid } from './app-grid/app-grid';
import { LeftColumn } from './left-column/left-column';
import { RightColumn } from './right-column/right-column';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AppHeader } from "./app-header/app-header";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AppGrid, LeftColumn, RightColumn, CommonModule, MatIconModule, AppHeader],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('Instagrid');
}
