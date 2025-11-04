import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { AppControllerService } from '../../core/services/app-controller.service';
import { gridImg } from '../../core/models/grid-img-class';
import { ImageProcessingService } from '../../core/services/image-processing-service';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'left-column',
  imports: [MatIcon, CommonModule, MatButtonModule],
  templateUrl: './left-column.html',
  styleUrl: './left-column.scss'
})
export class LeftColumn {
  selectedImage: gridImg | null = null;

  constructor(
    private appControllerService: AppControllerService,
    private imageProcessing: ImageProcessingService
  ) {
    this.appControllerService.selectedGridImage$.subscribe(img => this.selectedImage = img);
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
    } catch (err) {
      console.error('Error downloading image:', err);
    }
  }

  protected deleteImage() {
    if (!this.selectedImage) return;
    this.appControllerService.removeGridImage(this.selectedImage.id!);
    this.selectedImage = null;
  }
}
