import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageService } from '../images.service';
import { ktdGridCompact, KtdGridLayout, KtdGridLayoutItem, KtdGridModule } from '@katoid/angular-grid-layout';
import { ktdTrackById } from '@katoid/angular-grid-layout';
import { Subscription } from 'rxjs';



@Component({
  selector: 'app-grid',
  imports: [CommonModule, KtdGridModule],
  templateUrl: './app-grid.html',
  styleUrl: './app-grid.scss'
})

export class AppGrid {

  private placeholderLayout: KtdGridLayout = [
    { id: '0', x: 0, y: 0, w: 1, h: 1 },
    { id: '1', x: 1, y: 0, w: 1, h: 1 },
    { id: '2', x: 2, y: 0, w: 1, h: 1 },
    { id: '3', x: 0, y: 1, w: 1, h: 1 },
    { id: '4', x: 1, y: 1, w: 1, h: 1 },
  ];
  
  trackById = ktdTrackById;

  cols = 3;
  rowHeight = 100;
  compactType: 'vertical' | 'horizontal' | null = 'vertical';
  selectedItems: string[] = [];
  // copiedItems: number
  layout: KtdGridLayout = this.placeholderLayout;

  resizeSubscription: Subscription | null = null;

  private _isDraggingResizing: boolean = false;


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
        // const targetIdx = Math.floor(img.num / 10) * 3 + img.num % 10;
        // Insert image at targetIdx, shifting others to the right
        // newItems.splice(targetIdx, 0, { ...img, groupId: groupId });

        // Add items to the grid
        let newId : number = +this.addItemToLayout();

        newItems.splice(newId, 0, { ...img, groupId: groupId });
      });

      // Truncate to grid size (12)
      newItems = newItems.slice(0, 12);

      // Fill any undefined slots with empty items
      this.items = Array.from({ length: 12 }, (_, i) =>
        newItems[i] ? newItems[i] : { src: ``, alt: `Item ${i + 1}`, groupId: null }
      );
    });
  }

  /** Adds a grid item to the layout */
    addItemToLayout(item?: KtdGridLayoutItem) : string{
        let newLayoutItem: KtdGridLayoutItem | undefined = item;
        if (!newLayoutItem) {


            const maxId = this.layout.reduce(
                (acc, cur) => Math.max(acc, parseInt(cur.id, 10)),
                -1
            );
            const nextId = maxId + 1;
            newLayoutItem = {
                id: nextId.toString(),
                x: -1,
                y: -1,
                w: 1,
                h: 1
            };
        }
        // Important: Don't mutate the array, create new instance. This way notifies the Grid component that the layout has changed.
        this.layout = [newLayoutItem, ...this.layout];
        this.layout = ktdGridCompact(this.layout, this.compactType, this.cols);
        console.log('addItemToLayout', newLayoutItem);

        return newLayoutItem.id;
    }
}
