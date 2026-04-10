import { Component } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIcon } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { AppControllerService } from '../../core/services/app-controller.service';
import { GridImg } from '../../core/models/grid-img-class';
import { ImageProcessingService } from '../../core/services/image-processing-service';
import { MatButtonModule } from '@angular/material/button';
import { LeftColumnService } from '../../core/services/left-column-service';
import { CropEditor, CropValues } from '../../shared/components/crop-editor/crop-editor';

@Component({
  selector: 'left-column',
  imports: [MatIcon, CommonModule, MatButtonModule, CropEditor],
  templateUrl: './left-column.html',
  styleUrl: './left-column.scss'
})
export class LeftColumn {
  selectedImage: GridImg | null = null;

  constructor(
    private appControllerService: AppControllerService,
    private imageProcessing: ImageProcessingService,
    private leftColumnService: LeftColumnService
  ) {
    this.appControllerService.selectedGridImage$.pipe(takeUntilDestroyed()).subscribe(img => {
      this.selectedImage = img;
    });
  }

  protected async onCropChange(values: CropValues): Promise<void> {
    if (!this.selectedImage) return;

    this.selectedImage.cropX = values.cropX;
    this.selectedImage.cropY = values.cropY;
    this.selectedImage.cropZoom = values.cropZoom;

    // Re-generate the low-res cropped preview and update the grid tile
    const newSrc = await this.imageProcessing.cropImage(this.selectedImage, true);
    this.selectedImage.croppedSrc = newSrc;

    // Emit a new array reference so the grid subscription picks up the mutation
    const current = this.appControllerService.getGridImages();
    this.appControllerService.setGridImages([...current]);
  }

  protected async downloadImage() {
    if (!this.selectedImage) return;

    try {
      const cropped = await this.imageProcessing.cropImage(this.selectedImage, false);
      const divided = await this.imageProcessing.divideImage(cropped, this.selectedImage.w, this.selectedImage.h);
      const zipBlob = await this.imageProcessing.createZip(divided);

      const url = window.URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'images.zip';
      a.click();
      window.URL.revokeObjectURL(url);
      this.leftColumnService.close();
    } catch (err) {
      console.error('Error downloading image:', err);
    }
  }

  protected deleteImage() {
    if (!this.selectedImage) return;
    this.leftColumnService.close();
    setTimeout(() => {
      this.appControllerService.removeGridImage(this.selectedImage!.id);
      this.selectedImage = null;
    }, 100);
  }
}
