import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
  private destroyRef = inject(DestroyRef);
  protected readonly title = signal('Instagrid');
  protected selectedImage : gridImg | null = null;
  protected showImportPrompt = false;
  protected modalImage: globalImg | null = null;

  protected isRightColumnOpen = false;
  protected isLeftColumnOpen = false;

  constructor(private appControllerService: AppControllerService, private importPromptService: ImportPromptService, private imageProcessing: ImageProcessingService, private leftColumnService: LeftColumnService, private rightColumnService: RightColumnService) {}

  ngOnInit() {
    this.appControllerService.selectedGridImage$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(img => this.selectedImage = img);
    this.importPromptService.modalImage$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(img => this.modalImage = img);
    this.importPromptService.modalOpen$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(open => this.showImportPrompt = open);
    this.leftColumnService.openState$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(open => this.isLeftColumnOpen = open);
    this.rightColumnService.openState$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(open => this.isRightColumnOpen = open);
  }

  toggleLeftColumn() {
    this.leftColumnService.toggle();
  }

  toggleRightColumn() {
    this.rightColumnService.toggle();
  }

  onOutsideClick() {
    if (this.isLeftColumnOpen) this.leftColumnService.close();
    if (this.isRightColumnOpen) this.rightColumnService.close();
  }

  closeImportPrompt() {
    this.importPromptService.closeImportPrompt();
  }

  protected importImages(): void {
    // Open the right column to show imported images after import
    this.imageProcessing.importImages(this.rightColumnService);
  }
}
