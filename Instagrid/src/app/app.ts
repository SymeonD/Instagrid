import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppGrid } from './app-grid/app-grid';
import { LeftColumn } from './left-column/left-column';
import { RightColumn } from './right-column/right-column';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AppHeader } from "./app-header/app-header";
import { gridImg } from './shared/grid-img-class';
import { AppControllerService } from './shared/app-controller.service';
import { ImportPromptService } from './shared/import-prompt.service';
import { ImportPrompt } from "./import-prompt/import-prompt";
import { globalImg } from './shared/global-img-class';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AppGrid, LeftColumn, RightColumn, CommonModule, MatIconModule, AppHeader, ImportPrompt],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('Instagrid');
  protected selectedImage : gridImg | null = null;
  protected showImportPrompt = false;
  protected modalImage: globalImg | null = null;

  constructor(private appControllerService: AppControllerService, private importPromptService: ImportPromptService) {}

  ngOnInit() {
    this.appControllerService.selectedGridImage$.subscribe(img => this.selectedImage = img);
    this.importPromptService.modalImage$.subscribe(img => this.modalImage = img);
    this.importPromptService.modalOpen$.subscribe(open => this.showImportPrompt = open);
  }

  toggleLeftColumn() {
    document.querySelector('.left-column')
      ? (document.querySelector('.left-column') as HTMLElement).classList.toggle('show')
      : null;
    // If the left column is open, close the right column
    document.querySelector('.right-column')
      ? (document.querySelector('.right-column') as HTMLElement).classList.remove('show')
      : null;
  }

  toggleRightColumn() {
    document.querySelector('.right-column')
      ? (document.querySelector('.right-column') as HTMLElement).classList.toggle('show')
      : null;
    // If the right column is open, close the left column
    document.querySelector('.left-column')
      ? (document.querySelector('.left-column') as HTMLElement).classList.remove('show')
      : null;
  }

  closeImportPrompt() {
    this.importPromptService.closeImportPrompt();
  }
}
