import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { AppControllerService } from '../../core/services/app-controller.service';
import { globalImg } from '../../core/models/global-img-class';
import { ImageProcessingService } from '../../core/services/image-processing-service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { ImportPromptService } from '../../core/services/import-prompt.service';


@Component({
  selector: 'right-column',
  imports: [CommonModule, MatIcon, MatSnackBarModule, MatButtonModule],
  templateUrl: './right-column.html',
  styleUrl: './right-column.scss'
})
export class RightColumn {
  columns: globalImg[][] = [];
  images: globalImg[] = [];

  showImportPrompt = false;
  modalImage: any = null;

  @Output() closeColumn = new EventEmitter<void>();

  constructor(private appControllerService: AppControllerService, private imageProcessing: ImageProcessingService, private _snackBar: MatSnackBar, private importPromptService: ImportPromptService) {}

  ngOnInit() {
    this.appControllerService.globalImages$.subscribe(globalImgs => {
      this.images = globalImgs;
      this.updateColumns();
    });
    // Remove local images array logic
  }

  // Used when 
  protected importImages(): void {
    this.imageProcessing.importImages();
  }

  protected updateColumns(): void {
    const numColumns = 2;
    this.columns = Array.from({ length: numColumns }, () => []);
    this.images.forEach((image, index) => {
      const column = index % numColumns;
      this.columns[column].push(image);
    });
  }

  // Open image prompt
  protected openImportPrompt(image: any): void {
    // Send callback to know when it is closed
    this.importPromptService.openImportPrompt(image).then((added) => {
      // Callback when modal is closed
      if (added) {
        this.closeColumn.emit();
      }
    });
  }
}
