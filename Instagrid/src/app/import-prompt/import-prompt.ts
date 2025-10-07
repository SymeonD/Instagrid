import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { AppControllerService } from '../shared/app-controller.service';
import { gridImg } from '../shared/grid-img-class';
import { globalImg } from '../shared/global-img-class';
import { ImageProcessingService } from '../shared/image-processing-service';

@Component({
  selector: 'import-prompt',
  imports: [MatIcon, CommonModule],
  templateUrl: './import-prompt.html',
  styleUrl: './import-prompt.scss'
})
export class ImportPrompt {
  @Input() image!: globalImg;
  @Output() close = new EventEmitter<void>();

  // Grid selection logic
  private gridSizes: { [key: number]: number[] } = {
    0: [],
    1: [0],
    2: [0, 1],
    3: [0, 1, 2],
    4: [0, 3],
    5: [0, 1, 3, 4],
    6: [0, 1, 2, 3, 4, 5],
    7: [0, 3, 6],
    8: [0, 1, 3, 4, 6, 7],
    9: [0, 1, 2, 3, 4, 5, 6, 7, 8]
  };
  // number: [line, column]
  private gridImageSizes: { [key: number]: number[] } = {
    0: [],
    1: [1, 1],
    2: [2, 1],
    3: [3, 1],
    4: [1, 2],
    5: [2, 2],
    6: [3, 2],
    7: [1, 3],
    8: [2, 3],
    9: [3, 3]
  };

  private hoveredSize = 0; // Default to 0
  private selectedSize = 1; // Default to 0
  croppedImageSrc = '';

  constructor(private appControllerService: AppControllerService, private imageProcessing: ImageProcessingService) {
    // Pieces
    this.image && this.imageProcessing.cropImage(new gridImg(this.image, -1, -1, this.gridImageSizes[this.selectedSize][0], this.gridImageSizes[this.selectedSize][1]), true).then(src => this.croppedImageSrc = src);
  }

  ngOnChanges() {
    // Store the original src only once, when the image input changes
    if (this.image) {
      this.imageProcessing.cropImage(new gridImg(this.image, -1, -1, this.gridImageSizes[this.selectedSize][0], this.gridImageSizes[this.selectedSize][1]), true).then(src => this.croppedImageSrc = src); // Always update pieces when image changes
    }
  }

  //TODO:  Method to download the selected image, make it a util
  protected async downloadImages(): Promise<void> {
    if (!this.image) return;

    const downloadableImage : gridImg = new gridImg(this.image, -1, -1, this.gridImageSizes[this.selectedSize][0], this.gridImageSizes[this.selectedSize][1], this.croppedImageSrc)

    try {
      const cropped = await this.imageProcessing.cropImage(downloadableImage, false);
      const divided = await this.imageProcessing.divideImage(cropped, downloadableImage.w, downloadableImage.h);
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

  // Method to delete the selected image
  protected deleteImage(): void {
    if (this.image) {
      this.appControllerService.removeGlobalImage(this.image.id!);
      this.close.emit();
    }
  }

  // Call this method when you want to close the modal
  closePrompt() {
    this.close.emit();
  }

  // Method to set isDarkened for grid items
  isDarkened(index: number): boolean {
    return this.gridSizes[this.hoveredSize].includes(index);
  }

  isSelected(index: number): boolean {
    return this.gridSizes[this.selectedSize].includes(index);
  }

  onPlaceholderHover(index: number): void {
    this.hoveredSize = index+1;
  }

  onPlaceholderClick(index: number): void {
    // Lock the selection
    this.selectedSize = index+1;
    this.imageProcessing.cropImage(new gridImg(this.image, -1, -1, this.gridImageSizes[this.selectedSize][0], this.gridImageSizes[this.selectedSize][1]), true).then(src => this.croppedImageSrc = src);
  }

  // Send the pieces to the grid
  sendImage(): void {
    if (this.image && this.croppedImageSrc) {
      // Add the image to the grid
      this.appControllerService.addGridImage(new gridImg(this.image, -1, -1, this.gridImageSizes[this.selectedSize][0], this.gridImageSizes[this.selectedSize][1], this.croppedImageSrc));
      this.close.emit();
    }
  }
}
