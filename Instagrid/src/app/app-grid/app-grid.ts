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
    // { id: '0', x: 0, y: 0, w: 1, h: 1 },
    // { id: '1', x: 1, y: 0, w: 1, h: 1 },
    // { id: '2', x: 2, y: 0, w: 1, h: 1 },
    // { id: '3', x: 0, y: 1, w: 1, h: 1 },
    // { id: '4', x: 1, y: 1, w: 1, h: 1 },
    // { id: '5', x: 2, y: 2, w: 1, h: 1 },
    // { id: '6', x: 0, y: 0, w: 1, h: 1 },
    // { id: '7', x: 1, y: 0, w: 1, h: 1 },
    // { id: '8', x: 2, y: 1, w: 1, h: 1 },
    // { id: '9', x: 0, y: 1, w: 1, h: 1 },
    // { id: '10', x: 1, y: 0, w: 1, h: 1 },
    // { id: '11', x: 2, y: 0, w: 1, h: 1 },
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


  // Initiate items as an empty array
  items: any = []

  ngOnInit() {
    // Update gridWidth and rowHeight on window resize
    window.addEventListener('resize', () => {
      this.gridWidth = document.getElementById('image-grid-container')?.clientWidth || window.innerWidth*0.5;
      this.rowHeight = 1350 / 1010 * (this.gridWidth / this.cols);
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
        let newId : number = +this.addItemToLayout(undefined, img.num);

        newItems[newId] = { ...img, groupId: groupId };
      });

      this.items = newItems;
    });
  }

  onDragStarted(event: KtdDragStart) {
        this._isDraggingResizing = true;
    }

    onDragEnded(event: KtdDragEnd) {
        this._isDraggingResizing = false;
    }

    onCompactTypeChange(change: MatSelectChange) {
        this.compactType = change.value;
    }

    onLayoutUpdated(layout: KtdGridLayout) {
        this.layout = layout;
    }

  /** Adds a grid item to the layout */
    addItemToLayout(item?: KtdGridLayoutItem, index?: number) : string{
        let newLayoutItem: KtdGridLayoutItem | undefined = item;
        let xIndex = index ? index % 10 : -1;
        let yIndex = index ? Math.floor(index / 10) : -1;
        if (!newLayoutItem) {


            const maxId = this.layout.reduce(
                (acc, cur) => Math.max(acc, parseInt(cur.id, 10)),
                -1
            );
            const nextId = maxId + 1;
            newLayoutItem = {
                id: nextId.toString(),
                x: xIndex,
                y: yIndex,
                w: 1,
                h: 1
            };
        }
        // Important: Don't mutate the array, create new instance. This way notifies the Grid component that the layout has changed.
        this.layout = [newLayoutItem, ...this.layout];
        this.layout = ktdGridCompact(this.layout, this.compactType, this.cols);

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
                    this.imageService.setSelectedImage(this.items[+selectedItem.id]);
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

