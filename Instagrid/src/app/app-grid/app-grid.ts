import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageService } from '../images.service';
import { KtdDragEnd, KtdDragStart, ktdGridCompact, KtdGridComponent, KtdGridLayout, KtdGridLayoutItem, KtdGridModule, KtdResizeEnd, KtdResizeStart } from '@katoid/angular-grid-layout';
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

  private placeholderLayout: KtdGridLayout = [];
  protected items: any[] = [];

  @ViewChild(KtdGridComponent, {static: true}) grid: KtdGridComponent | undefined;
  trackById = ktdTrackById;

  cols = 3;
  gridWidth = document.getElementById('image-grid-container')?.clientWidth || window.innerWidth*0.5;
  rowHeight = 1350 / 1010 * (this.gridWidth / this.cols);
  compactType: 'vertical' | 'horizontal' | null = 'vertical';
  selectedItems: string[] = [];
  layout: KtdGridLayout = this.placeholderLayout;

  private _isDraggingResizing: boolean = false;

  ngOnInit() {
    // Update gridWidth and rowHeight on window resize
    window.addEventListener('resize', () => {
      this.gridWidth = document.getElementById('image-grid-container')?.clientWidth || window.innerWidth*0.5;
      this.rowHeight = 1350 / 1010 * (this.gridWidth / this.cols);
    });
  }

  constructor(protected imageService: ImageService) {
    this.imageService.gridItems$.subscribe(gridItems => {
      let newItems : any = [];
      // clear layout
      this.layout = [];

      gridItems.forEach((gridItem) => {
        let newId : number = +this.addItemToLayout(gridItem[1], gridItem[2]);

        newItems.push({ id: newId, src: gridItem[0].src, alt: gridItem[0].alt });
      });

      this.items = newItems;
  })
};

  onDragStarted(event: KtdDragStart) {
        this._isDraggingResizing = true;
    }

    onDragEnded(event: KtdDragEnd) {
        this._isDraggingResizing = false;
    }

    onResizeStarted(event: KtdResizeStart) {
        this._isDraggingResizing = true;
        console.log('onResizeStarted', event);
    }

    onResizeEnded(event: KtdResizeEnd) {
        this._isDraggingResizing = false;
        console.log('onResizeEnded', event);
        // TODO: update the grid items specs in the list
    }

    onCompactTypeChange(change: MatSelectChange) {
        this.compactType = change.value;
    }

    onLayoutUpdated(layout: KtdGridLayout) {
        this.layout = layout;
    }

  /** Adds a grid item to the layout */
    addItemToLayout(width: number, height: number, item?: KtdGridLayoutItem) : string{
        let newLayoutItem: KtdGridLayoutItem | undefined = item;
        const maxId = this.layout.reduce(
                (acc, cur) => Math.max(acc, parseInt(cur.id, 10)),
                -1
            );
            const nextId = maxId + 1;
        if (!newLayoutItem) {
            newLayoutItem = {
                id: nextId.toString(),
                x: -1,
                y: -1,
                w: width,
                h: height
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
                    // Get selected image in the griditems
                    let imageId = this.imageService.getGridItems()[+selectedItem.id][3];
                    this.imageService.setSelectedImage(imageId);
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

