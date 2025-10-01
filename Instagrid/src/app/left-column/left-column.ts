import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { AppControllerService } from '../shared/app-controller.service';
import { gridImg } from '../shared/grid-img-class';
import { cropImage } from '../utils/crop-img';

@Component({
  selector: 'left-column',
  imports: [MatIcon, CommonModule],
  templateUrl: './left-column.html',
  styleUrl: './left-column.scss'
})
export class LeftColumn {
  // Get image selected from service
  selectedImage: gridImg | null = null;

  constructor(private appControllerService: AppControllerService) {
    this.appControllerService.selectedGridImage$.subscribe(image => {
      this.selectedImage = image;
    });
  }

  // Download the selected image
  // The selected image will be cut in a (1010*cols+70) x (1350*rows) image, centered
  // Then this new image will be cut in segments of 1080 x 1350
  // From top left corner to bottom right corner
  protected downloadImage(): void {
    if(!this.selectedImage || this.selectedImage == null) return;
  
    cropImage(this.selectedImage, false).then(src => {
      const link = document.createElement('a');
      link.download = 'image.jpg';
      link.href = src;
      link.click();
    });
  }

  // Edit the selected image
  protected editImage(): void {
    // TODO: Implement image editing logic
  }

  // Delete the selected image
  protected deleteImage(): void {
    if (this.selectedImage) {
      this.appControllerService.removeGridImage(this.selectedImage.id!);
      this.appControllerService.setSelectedGridImage(null);
      this.selectedImage = null;
    }
  }
}
