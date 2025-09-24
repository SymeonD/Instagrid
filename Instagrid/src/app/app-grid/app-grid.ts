import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-grid',
  imports: [CommonModule],
  templateUrl: './app-grid.html',
  styleUrl: './app-grid.scss'
})

export class AppGrid {
  // Initiate items as an empty array of size 12
  protected readonly items = Array.from({ length: 12 }, (_, i) => ({
    src: ``,
    alt: `Item ${i + 1}`
  }));
}
