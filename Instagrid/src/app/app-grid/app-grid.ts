import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageService } from '../images.service';
import { KtdDragEnd, KtdDragStart, ktdGridCompact, KtdGridComponent, KtdGridLayout, KtdGridLayoutItem, KtdGridModule } from '@katoid/angular-grid-layout';
import { ktdTrackById } from '@katoid/angular-grid-layout';
import { Subscription } from 'rxjs';
import { MatSelectChange } from '@angular/material/select';



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

  @ViewChild(KtdGridComponent, {static: true}) grid: KtdGridComponent | undefined;
  trackById = ktdTrackById;

  cols = 3;
  gridWidth = document.getElementById('image-grid-container')?.clientWidth || window.innerWidth*0.5;
  rowHeight = 1350 / 1010 * (this.gridWidth / this.cols);
  compactType: 'vertical' | 'horizontal' | null = 'vertical';
  selectedItems: string[] = [];
  layout: KtdGridLayout = this.placeholderLayout;

  private _isDraggingResizing: boolean = false;


  // Initiate items as an empty array of size 12
  items = Array.from({ length: 12 }, (_, i) => ({
    src: ``,
    alt: `Item ${i + 1}`,
    groupId: null // assign a number if part of a group
  }));

  ngOnInit() {
    // Update gridWidth and rowHeight on window resize
    window.addEventListener('resize', () => {
      this.gridWidth = document.getElementById('image-grid-container')?.clientWidth || window.innerWidth*0.5;
      this.rowHeight = 1350 / 1010 * (this.gridWidth / this.cols);
      console.log('Resized: ', this.gridWidth, this.rowHeight);
    });
  }

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

  onDragStarted(event: KtdDragStart) {
        this._isDraggingResizing = true;
        console.log('onDragStarted', event);
    }

    onDragEnded(event: KtdDragEnd) {
        this._isDraggingResizing = false;
        console.log('onDragEnded', event);
    }

    onCompactTypeChange(change: MatSelectChange) {
        console.log('onCompactTypeChange', change);
        this.compactType = change.value;
    }

    onLayoutUpdated(layout: KtdGridLayout) {
        console.log('onLayoutUpdated', layout);
        this.layout = layout;
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

    /**
     * Check if 'selectedItem' is on the multi item selection
     */
    isItemSelected(selectedItem: KtdGridLayoutItem): boolean {
        return this.selectedItems.includes(selectedItem.id);
    }

    /*
     * Select an item outside of the group
     */
    pointerDownItemSelection(
        event: MouseEvent,
        selectedItem: KtdGridLayoutItem
    ) {
        const ctrlOrCmd = event.ctrlKey;
        console.log('Clicked')
        if (!ctrlOrCmd) {
            const selectedItemExist = this.selectedItems.includes(
                selectedItem.id
            );
            if (!selectedItemExist) {
                // Click an element outside selection group
                // Clean all selections and select the new item
                if (event.button == 2) {
                    this.selectedItems = [];
                } else {
                    this.selectedItems = [selectedItem.id];
                }
            }
        }
    }

    /*
     * Select an item inside the group or multiselect with Control button
     */
    pointerUpItemSelection(event: MouseEvent, selectedItem: KtdGridLayoutItem) {
        const ctrlOrCmd = event.ctrlKey;
        if (event.button !== 2) {
            //Only select with primary button click
            const selectedItemExist = this.selectedItems.includes(
                selectedItem.id
            );
            if (ctrlOrCmd) {
                if (selectedItemExist) {
                    // Control + click an element inside the selection group
                    if (!this._isDraggingResizing) {
                        // If not dragging, remove the selected item from the group
                        // TODO: Fix
                        // this.selectedItems = ktdArrayRemoveItem(
                        //     this.selectedItems,
                        //   (itemId: string) => itemId === selectedItem.id
                        // );
                    }
                } else {
                    // Control + click an element outside the selection group
                    // Add the new selected item to the current group
                    this.selectedItems = [
                        ...this.selectedItems,
                        selectedItem.id
                    ];
                }
            } else if (!this._isDraggingResizing && selectedItemExist) {
                // Click an element inside the selection group
                this.selectedItems = [selectedItem.id];
            }
        }
    }
}

