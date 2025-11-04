import { Component } from '@angular/core';
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

  constructor(private appControllerService: AppControllerService, private imageProcessing: ImageProcessingService, private _snackBar: MatSnackBar, private importPromptService: ImportPromptService) {}

  ngOnInit() {
    this.appControllerService.globalImages$.subscribe(globalImgs => {
      this.images = globalImgs;
      this.updateColumns();
    });
    // Remove local images array logic
  }

  protected importImages(): void {
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
    this.importPromptService.openImportPrompt(image);
  }
}
