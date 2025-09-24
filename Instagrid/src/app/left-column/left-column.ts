import { Component } from '@angular/core';
import { ImageService } from '../images.service';
import { MatIcon } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'left-column',
  imports: [MatIcon, CommonModule],
  templateUrl: './left-column.html',
  styleUrl: './left-column.scss'
})
export class LeftColumn {
  // Get image selected from service
  selectedImage: any = null;

  constructor(private imageService: ImageService) {
    this.imageService.selectedImage$.subscribe(image => {
      this.selectedImage = image;
    });
  }

  // Download the selected image
  protected downloadImage(): void {
    if (this.selectedImage) {
      const link = document.createElement('a');
      link.href = this.selectedImage.src;
      link.download = this.selectedImage.alt || 'downloaded_image';
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
      this.imageService.removeImage(this.selectedImage);
      this.imageService.setSelectedImage(null);
    }
  }
}
