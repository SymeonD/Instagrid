import { Component, signal } from '@angular/core';
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

@Component({
  selector: 'main-layout',
  imports: [RouterOutlet, AppGrid, LeftColumn, RightColumn, CommonModule, MatIconModule, AppHeader, ImportPrompt, MatSnackBarModule, MatButtonModule],
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

  constructor(private appControllerService: AppControllerService, private importPromptService: ImportPromptService, private imageProcessing: ImageProcessingService, private _snackBar: MatSnackBar) {}

  ngOnInit() {
    this.appControllerService.selectedGridImage$.subscribe(img => this.selectedImage = img);
    this.importPromptService.modalImage$.subscribe(img => this.modalImage = img);
    this.importPromptService.modalOpen$.subscribe(open => this.showImportPrompt = open);
  }

  toggleColumn() {
    if (this.isLeftColumnOpen) {
      this.toggleLeftColumn();
    } else if (this.isRightColumnOpen) {
      this.toggleRightColumn();
    }
  }

  toggleLeftColumn() {
    this.isLeftColumnOpen = !this.isLeftColumnOpen;
    if (this.isLeftColumnOpen) this.isRightColumnOpen = false;
  }

  toggleRightColumn() {
    this.isRightColumnOpen = !this.isRightColumnOpen;
    if (this.isRightColumnOpen) this.isLeftColumnOpen = false;
  }

  closeImportPrompt() {
    this.importPromptService.closeImportPrompt();
  }

  // TODO: Add to service
  protected importImages(): void {
    if (!this.isRightColumnOpen) {
      this.toggleRightColumn();
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;

    input.onchange = (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (!target.files) return;

      const files = Array.from(target.files);
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
      const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'svg'];

      files.forEach((file) => {
        const ext = file.name.toLowerCase().split('.').pop();

        // Check both MIME type and extension
        if (!allowedTypes.includes(file.type) || !allowedExtensions.includes(ext!)) {
          this._snackBar.open(
            `⚠️ ${file.type} is not supported. Please upload JPG, JPEG, PNG, WEBP, or SVG files.`,
            'Close',
            { duration: 50000, panelClass: ['snackbar-warning'] }
          );
          return;
        }

        const reader = new FileReader();
        reader.onload = () => {
          const image = { src: reader.result as string, alt: file.name };
          this.appControllerService.addGlobalImage(
            new globalImg(image.src, image.alt, this.imageProcessing)
          );
          this._snackBar.open(`✅ Image imported successfully!`, 'Close', {
            duration: 3000,
            panelClass: ['snackbar-success']
          });
        };
        reader.readAsDataURL(file);
      });
    };
    input.click();
  }
}
