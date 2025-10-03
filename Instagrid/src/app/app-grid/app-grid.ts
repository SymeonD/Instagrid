import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KtdDragEnd, KtdDragStart, KtdGridBackgroundCfg, ktdGridCompact, KtdGridComponent, KtdGridLayout, KtdGridLayoutItem, KtdGridModule, KtdResizeEnd, KtdResizeStart } from '@katoid/angular-grid-layout';
import { ktdTrackById } from '@katoid/angular-grid-layout';
import { Subscription } from 'rxjs';
import { MatSelectChange } from '@angular/material/select';
import { AppControllerService } from '../shared/app-controller.service';
import { gridImg } from '../shared/grid-img-class';



@Component({
  selector: 'app-grid',
  imports: [CommonModule, KtdGridModule],
  templateUrl: './app-grid.html',
  styleUrl: './app-grid.scss'
})

export class AppGrid {

  private placeholderLayout: gridImg[] = [];

  @ViewChild(KtdGridComponent, {static: true}) grid: KtdGridComponent | undefined;
  trackById = ktdTrackById;

  // Settings for the grid
  cols = 3;
  gridWidth = document.getElementById('image-grid-container')?.clientWidth || window.innerWidth*0.5;
  rowHeight = 1350 / 1010 * (this.gridWidth / this.cols);
  compactType: 'vertical' | 'horizontal' | null = 'vertical';
  selectedItems: string[] = [];
  layout: gridImg[] = this.placeholderLayout;
  gridBackgroundConfig: Required<KtdGridBackgroundCfg> = { show: 'always',
        borderColor: 'rgba(128, 128, 128, 0.10)',
        gapColor: 'transparent',
        borderWidth: 1,
        rowColor: 'rgba(128, 128, 128, 0.10)',
        columnColor: 'rgba(128, 128, 128, 0.10)',};
    height = this.rowHeight;

  private _isDraggingResizing: boolean = false;

  ngOnInit() {
    // Update gridWidth and rowHeight on window resize
    window.addEventListener('resize', () => {
      this.gridWidth = document.getElementById('image-grid-container')?.clientWidth || window.innerWidth*0.5;
      this.rowHeight = 1350 / 1010 * (this.gridWidth / this.cols);
    });
  }

    constructor(protected appControllerService: AppControllerService) {
        // Subscription to the list of grid images
        this.appControllerService.gridImages$.subscribe(gridImgs => {
            // clear layout
            this.layout = [];

            gridImgs.forEach((gridImg) => {
            this.addItemToLayout(gridImg);
            });
        });
    };

  onDragStarted(event: KtdDragStart) {
        this._isDraggingResizing = true;
    }

    onDragEnded(event: KtdDragEnd) {
        this._isDraggingResizing = false;
    }

    onResizeStarted(event: KtdResizeStart) {
        this._isDraggingResizing = true;
        console.log(event.layoutItem);
    }

    onResizeEnded(event: KtdResizeEnd) {
        this._isDraggingResizing = false;
        // TODO: update the grid items specs in the list
        // Get the element that was resized
        const resizedItem = event.layoutItem;
        // change it in gridItems
        if (resizedItem && this.layout) {
            const itemIndex = this.layout.findIndex(item => item.id === event.layoutItem.id);
            if (itemIndex !== -1) {
                this.layout[itemIndex].w = event.layoutItem.w;
                this.layout[itemIndex].h = event.layoutItem.h;
                
                this.appControllerService.setGridImages(this.layout);
            }
        }
    }

    onCompactTypeChange(change: MatSelectChange) {
        this.compactType = change.value;
    }

    onLayoutUpdated(newLayout: KtdGridLayout) {
        if (!newLayout || !this.layout) return;

        newLayout.forEach(l => {
            const old = this.layout.find(i => i.id === l.id);
            if (old) {
            old.x = l.x;
            old.y = l.y;
            old.w = l.w;
            old.h = l.h;
            // keep old.src, old.title, etc.
            }
        });

        // set new grid height
        this.height = this.getGridHeight();
    }

    /** Adds a grid item to the layout */
    addItemToLayout(item: gridImg){
        // Important: Don't mutate the array, create new instance. This way notifies the Grid component that the layout has changed.
        this.layout = [item, ...this.layout];
        // const compacted: KtdGridLayout = ktdGridCompact(this.layout, this.compactType, this.cols);
        // this.onLayoutUpdated(compacted);
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
        selectedItem: gridImg
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
                    // Send to left column
                    this.appControllerService.setSelectedGridImage(selectedItem);
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

    getGridHeight() : number {
        if (!this.layout || this.layout.length === 0) {
            return this.rowHeight * 1; // at least one row
        }
        
        // Find the bottom-most point of all items
        const maxRow = this.layout.reduce((max, item) => Math.max(max, item.y + item.h), 0);
        
        // Add one extra row
        return (maxRow + 1) * this.rowHeight;
    }
}

