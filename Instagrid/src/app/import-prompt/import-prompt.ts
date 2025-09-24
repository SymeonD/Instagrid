import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageService } from '../images.service';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'import-prompt',
  imports: [MatIcon, CommonModule],
  templateUrl: './import-prompt.html',
  styleUrl: './import-prompt.scss'
})
export class ImportPrompt {
  @Input() image: any;
  @Output() close = new EventEmitter<void>();
  constructor(private imageService: ImageService) {}

  // Method to download the selected image
  protected downloadImage(): void {
    if (this.image) {
      const link = document.createElement('a');
      link.href = this.image.src;
      link.download = this.image.alt || 'downloaded_image';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  // Method to edit the selected image
  protected editImage(): void {
    // TODO: Implement image editing logic
  }

  // Method to delete the selected image
  protected deleteImage(): void {
    if (this.image) {
      this.imageService.removeImage(this.image);
      this.imageService.setSelectedImage(null);
    }
  }

  // Call this method when you want to close the modal
  closePrompt() {
    this.close.emit();
  }
}
