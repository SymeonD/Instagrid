import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageService } from '../images.service';

@Component({
  selector: 'app-grid',
  imports: [CommonModule],
  templateUrl: './app-grid.html',
  styleUrl: './app-grid.scss'
})

export class AppGrid {
  // Initiate items as an empty array of size 12
  items = Array.from({ length: 12 }, (_, i) => ({
    src: ``,
    alt: `Item ${i + 1}`
  }));

  constructor(private imageService: ImageService) {
    this.imageService.gridItems$.subscribe(images => {
      // Add images received at the start of the items array
      this.items = images.concat(Array.from({ length: 12 - images.length }, (_, i) => ({
        src: ``,
        alt: `Item ${images.length + i + 1}`
      })));
    });
  }
}
