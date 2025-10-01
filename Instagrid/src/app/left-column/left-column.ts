import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { AppControllerService } from '../shared/app-controller.service';
import { gridImg } from '../shared/grid-img-class';

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
  // TODO: Implement image cutting logic
  protected downloadImage(): void {
    if (this.selectedImage) {
      const link = document.createElement('a');
      link.href = this.selectedImage.globalImg.lowResSrc || this.selectedImage.globalImg.highResSrc;
      link.download = this.selectedImage.globalImg.alt || 'downloaded_image';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
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
