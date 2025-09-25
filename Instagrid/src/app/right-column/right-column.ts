import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageService } from '../images.service';
import { MatIcon } from '@angular/material/icon';
import { ImportPrompt } from '../import-prompt/import-prompt';

@Component({
  selector: 'right-column',
  imports: [CommonModule, MatIcon, ImportPrompt],
  templateUrl: './right-column.html',
  styleUrl: './right-column.scss'
})
export class RightColumn {
  columns: any[][] = [];
  images: any[] = [];
  showImportPrompt = false;
  modalImage: any = null;

  constructor(private imageService: ImageService) {}

  ngOnInit() {
    this.imageService.images$.subscribe(images => {
      this.images = images;
      this.updateColumns();
    });
    // Remove local images array logic
  }

  // Method to import images, prompt file dialog
  protected importImages(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (target.files) {
        const files = Array.from(target.files);
        files.forEach((file) => {
          const reader = new FileReader();
          reader.onload = () => {
            const image = { src: reader.result as string, alt: file.name };
            // Use the service to add images
            this.imageService.addImage(image);
          };
          reader.readAsDataURL(file);
        });
      }
    };
    input.click();
  }

  private updateColumns(): void {
    const numColumns = 2;
    this.columns = Array.from({ length: numColumns }, () => []);
    this.images.forEach((img, i) => {
      this.columns[i % numColumns].push(img);
    });
  }

  // Open image prompt
  protected openImportPrompt(image: any): void {
    this.modalImage = image;
    this.showImportPrompt = true;
    // Set header z-index to 0
    document.querySelector('header')!.style.zIndex = '0';
  }

  protected closeImportPrompt(): void {
    this.showImportPrompt = false;
    this.modalImage = null;
    // Reset header z-index to 1
    document.querySelector('header')!.style.zIndex = '1';
  }
}
