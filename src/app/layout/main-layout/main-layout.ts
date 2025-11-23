import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppGrid } from '../../features/app-grid/app-grid';
import { LeftColumn } from '../../features/left-column/left-column';
import { RightColumn } from '../../features/right-column/right-column';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AppHeader } from "../app-header/app-header";
import { gridImg } from '../../core/models/grid-img-class';
import { AppControllerService } from '../../core/services/app-controller.service';
import { ImportPromptService } from '../../core/services/import-prompt.service';
import { ImportPrompt } from "../../features/modals/import-prompt/import-prompt";
import { globalImg } from '../../core/models/global-img-class';
import { ImageProcessingService } from '../../core/services/image-processing-service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { LeftColumnService } from '../../core/services/left-column-service';
import { RightColumnService } from '../../core/services/right-column-service';
import { ClickOutsideDirective } from '../../shared/directives/click-outside-directive';

@Component({
  selector: 'main-layout',
  imports: [RouterOutlet, AppGrid, LeftColumn, RightColumn, CommonModule, MatIconModule, AppHeader, ImportPrompt, MatSnackBarModule, MatButtonModule, ClickOutsideDirective],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss'
})
export class MainLayout {
  protected readonly title = signal('Instagrid');
  protected selectedImage : gridImg | null = null;
  protected showImportPrompt = false;
  protected modalImage: globalImg | null = null;

  protected isRightColumnOpen = false;
  protected isLeftColumnOpen = false;

  constructor(private appControllerService: AppControllerService, private importPromptService: ImportPromptService, private imageProcessing: ImageProcessingService, private leftColumnService: LeftColumnService, private rightColumnService: RightColumnService) {}

  ngOnInit() {
    this.appControllerService.selectedGridImage$.subscribe(img => this.selectedImage = img);
    this.importPromptService.modalImage$.subscribe(img => this.modalImage = img); 
    this.importPromptService.modalOpen$.subscribe(open => this.showImportPrompt = open);

    this.leftColumnService.openState$.subscribe(open => this.isLeftColumnOpen = open);
    this.rightColumnService.openState$.subscribe(open => this.isRightColumnOpen = open);
  }

  toggleLeftColumn() {
    this.leftColumnService.toggle();
  }

  toggleRightColumn() {
    this.rightColumnService.toggle();
  }

  onOutsideClick() {
    this.isLeftColumnOpen ? this.leftColumnService.close() : null;
    this.isRightColumnOpen ? this.rightColumnService.close() : null;
  }

  closeImportPrompt() {
    this.importPromptService.closeImportPrompt();
  }

  protected importImages(): void {
    // Open the right column to show imported images after import
    this.imageProcessing.importImages(this.rightColumnService);
  }
}
