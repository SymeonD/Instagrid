import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { AppControllerService } from '../../core/services/app-controller.service';
import { GlobalImg } from '../../core/models/global-img-class';
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
  columns: GlobalImg[][] = [];
  images: GlobalImg[] = [];

  showImportPrompt = false;
  modalImage: GlobalImg | null = null;

  private destroyRef = inject(DestroyRef);

  constructor(private appControllerService: AppControllerService, private imageProcessing: ImageProcessingService, private _snackBar: MatSnackBar, private importPromptService: ImportPromptService) {}

  ngOnInit() {
    this.appControllerService.globalImages$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(GlobalImgs => {
      this.images = GlobalImgs;
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
  protected openImportPrompt(image: GlobalImg): void {
    this.importPromptService.openImportPrompt(image);
  }
}
