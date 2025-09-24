import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageService } from '../images.service';
import { KtdGridModule } from '@katoid/angular-grid-layout';

@Component({
  selector: 'app-grid',
  imports: [CommonModule, KtdGridModule],
  templateUrl: './app-grid.html',
  styleUrl: './app-grid.scss'
})

export class AppGrid {
  // Initiate items as an empty array of size 12
  items = Array.from({ length: 12 }, (_, i) => ({
    src: ``,
    alt: `Item ${i + 1}`,
    groupId: null // assign a number if part of a group
  }));

  constructor(private imageService: ImageService) {
    this.imageService.gridItems$.subscribe(images => {
      const generateGroupId = () => Math.floor(Math.random() * 1000000);
      const groupId = generateGroupId();

      // Clone the items array to avoid mutating while iterating
      let newItems = [...this.items];

      images.forEach((img) => {
        const targetIdx = Math.floor(img.num / 10) * 3 + img.num % 10;
        // Insert image at targetIdx, shifting others to the right
        newItems.splice(targetIdx, 0, { ...img, groupId: groupId });
      });

      // Truncate to grid size (12)
      newItems = newItems.slice(0, 12);

      // Fill any undefined slots with empty items
      this.items = Array.from({ length: 12 }, (_, i) =>
        newItems[i] ? newItems[i] : { src: ``, alt: `Item ${i + 1}`, groupId: null }
      );
    });
  }

  moveGroup(groupId: number, targetIndexes: number[]) {
    // Find all items in the group
    const groupItems = this.items.filter(item => item.groupId === groupId);

    // Remove group items from their current positions
    const otherItems = this.items.filter(item => item.groupId !== groupId);

    // Insert group items at the target indexes
    targetIndexes.forEach((targetIdx, i) => {
      otherItems[targetIdx] = groupItems[i];
    });

    // Fill any undefined slots with empty items
    this.items = otherItems.map((item, i) =>
      item ? item : { src: ``, alt: `Item ${i + 1}`, groupId: null }
    );
  }
}
