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

  private originalSrc: string | null = null;

  constructor(private imageService: ImageService) {
    this.pieces = [this.image?.src];
    this.updateEditedImage(this.image?.src);
  }

  ngOnChanges() {
    // Store the original src only once, when the image input changes
    if (this.image) {
      if (!this.originalSrc) {
        this.originalSrc = this.image.src;
      }
      this.updateEditedImage(this.image.src); // Always update pieces when image changes
    }
  }

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
  gridX = 1;
  gridY = 1;
  pieces: { src: string }[] = [];
  private hoveredSize = 0; // Default to 0
  private selectedSize = 0; // Default to 0

  // Method to download the selected image
  protected downloadImages(): void {
    if (this.pieces && this.pieces.length > 0) {
      this.pieces.forEach((piece, index) => {
        const link = document.createElement('a');
        link.href = piece.src;
        link.download = `piece_${index}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    }
  }

  // Method to edit the selected image
  protected checkImage(): void {
    if (this.image) {
      this.gridX = this.gridImageSizes[this.selectedSize][0] || 1;
      this.gridY = this.gridImageSizes[this.selectedSize][1] || 1;
      const targetWidth = 1010 * this.gridX + 70;
      const targetHeight = 1350 * this.gridY;
      const aspectRatio = targetWidth / targetHeight;

      const img = new window.Image();
      img.src = this.originalSrc || this.image.src; // Always use original
      img.onload = () => {
        let cropWidth = img.width;
        let cropHeight = Math.round(cropWidth / aspectRatio);

        if (cropHeight > img.height) {
          cropHeight = img.height;
          cropWidth = Math.round(cropHeight * aspectRatio);
        }

        // Center crop coordinates
        const sx = Math.floor((img.width - cropWidth) / 2);
        const sy = Math.floor((img.height - cropHeight) / 2);

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) return;
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        // Draw the cropped rectangle, scaling to output size
        context.drawImage(
          img,
          sx, sy, cropWidth, cropHeight, // source: crop rectangle
          0, 0, targetWidth, targetHeight // destination: scale to output
        );
        const newSrc = canvas.toDataURL('image/jpeg');
        // Update local image property so modal preview updates
        this.updateEditedImage(newSrc);
      };
    }
  }

  // TODO: Refactor this method to cut image pieces of 1080x1350
  private updateEditedImage(newSrc: string): void {
    // Cut the image into x*y pieces and create a list with them
    const tempPieces: { src: string; }[] = [];
    const img = new window.Image();
    img.src = newSrc;
    img.onload = () => {
      const pieceWidth = img.width / this.gridX;
      const pieceHeight = img.height / this.gridY;
      for (let y = 0; y < this.gridY; y++) {
        for (let x = 0; x < this.gridX; x++) {
          const pieceX = x * pieceWidth;
          const pieceY = y * pieceHeight;
          const pieceCanvas = document.createElement('canvas');
          pieceCanvas.width = pieceWidth;
          pieceCanvas.height = pieceHeight;
          const pieceContext = pieceCanvas.getContext('2d');
          if (!pieceContext) return;
          pieceContext.drawImage(img, pieceX, pieceY, pieceWidth, pieceHeight, 0, 0, pieceWidth, pieceHeight);
          const pieceSrc = pieceCanvas.toDataURL('image/jpeg');
          tempPieces.push({ src: pieceSrc });
        }
      }
      this.pieces = tempPieces;
    };
  }

  // Method to delete the selected image
  protected deleteImage(): void {
    if (this.image) {
      this.imageService.removeImage(this.image);
      this.imageService.setSelectedImage(null);
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
    this.checkImage()
  }

  onPlaceholderClick(index: number): void {
    // Lock the selection
    this.selectedSize = index+1;
    console.log('Selected grid size:', this.selectedSize);
  }

  // Send the pieces to the grid
  sendImage(): void {
    if (this.pieces && this.pieces.length > 0) {
      // Remove the old image from the service
      this.imageService.addGridItems(this.pieces);
      this.close.emit();
    }
  }
}
