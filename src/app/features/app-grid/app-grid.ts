import { ChangeDetectorRef, Component, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { KtdDragEnd, KtdDragStart, KtdGridBackgroundCfg, ktdGridCompact, KtdGridComponent, KtdGridLayout, KtdGridLayoutItem, KtdGridModule, KtdResizeEnd, KtdResizeStart } from '@katoid/angular-grid-layout';
import { ktdTrackById } from '@katoid/angular-grid-layout';
import { MatSelectChange } from '@angular/material/select';
import { AppControllerService } from '../../core/services/app-controller.service';
import { GridImg } from '../../core/models/grid-img-class';
import { ImageProcessingService } from '../../core/services/image-processing-service';



@Component({
  selector: 'app-grid',
  imports: [CommonModule, KtdGridModule],
  templateUrl: './app-grid.html',
  styleUrl: './app-grid.scss'
})

export class AppGrid implements OnDestroy {

  private placeholderLayout: GridImg[] = [];

  @ViewChild(KtdGridComponent, {static: true}) grid: KtdGridComponent | undefined;
  trackById = ktdTrackById;

  // Settings for the grid
  private readonly ASPECT_RATIO = 1350 / 1010;
  cols = 3;
  gridWidth = document.getElementById('image-grid-container')?.clientWidth || window.innerWidth*0.5;
  rowHeight = this.ASPECT_RATIO * (this.gridWidth / this.cols);
  compactType: 'vertical' | 'horizontal' | null = 'vertical';
  selectedItems: string[] = [];
  layout: GridImg[] = this.placeholderLayout;
  gridBackgroundConfig: Required<KtdGridBackgroundCfg> = { show: 'always',
        borderColor: 'rgba(128, 128, 128, 0.10)',
        gapColor: 'transparent',
        borderWidth: 1,
        rowColor: 'rgba(128, 128, 128, 0.10)',
        columnColor: 'rgba(128, 128, 128, 0.10)',
    };
    height = this.rowHeight;

    private _isDraggingResizing: boolean = false;

    private readonly onResize = () => {
        this.gridWidth = document.getElementById('image-grid-container')?.clientWidth || window.innerWidth * 0.5;
        this.rowHeight = this.ASPECT_RATIO * (this.gridWidth / this.cols);
    };

    ngOnInit() {
        window.addEventListener('resize', this.onResize);
    }

    ngOnDestroy() {
        window.removeEventListener('resize', this.onResize);
    }

    ngAfterViewInit() {
        this.gridWidth = document.getElementById('image-grid-container')?.clientWidth || window.innerWidth*0.5;
        this.rowHeight = this.ASPECT_RATIO * (this.gridWidth / this.cols);
        this.cdr.detectChanges();
    }

    constructor(protected appControllerService: AppControllerService, protected imageProcessing: ImageProcessingService, private cdr: ChangeDetectorRef) {
        // Subscription to the list of grid images — diff-based to preserve visual order
        this.appControllerService.gridImages$.pipe(takeUntilDestroyed()).subscribe(imgs => {
            const newIds  = new Set(imgs.map(i => i.id));
            const oldIds  = new Set(this.layout.map(l => l.id));

            // Items removed: drop them and recompact in-place (preserves relative order)
            if ([...oldIds].some(id => !newIds.has(id))) {
                this.layout = this.layout.filter(l => newIds.has(l.id));
                const compacted = ktdGridCompact(this.layout, this.compactType, this.cols);
                this.onLayoutUpdated(compacted);
            }

            // Items added: prepend so newest appears on top
            imgs.filter(i => !oldIds.has(i.id)).forEach(img => this.addItemToLayout(img));
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
    }

    onResizeEnded(event: KtdResizeEnd) {
        this._isDraggingResizing = false;
        // Get the element that was resized
        const resizedItem = event.layoutItem;
        // change it in gridItems
        if (resizedItem && this.layout) {
            const itemIndex = this.layout.findIndex(item => item.id === event.layoutItem.id);
            if (itemIndex !== -1) {
                const old = this.layout[itemIndex];

                // Create a new GridImg instance so that @Input change detection
                // fires in CropEditor (same reference would not trigger ngOnChanges)
                const updated = new GridImg(
                    old.globalGridImg,
                    old.x, old.y,
                    event.layoutItem.w, event.layoutItem.h,
                    undefined,  // croppedSrc — computed below
                    old.id      // preserve id so ktd trackById keeps the tile
                    // cropX, cropY, cropZoom default to 0.5, 0.5, 1.0 (reset)
                );
                this.layout[itemIndex] = updated;

                // If this tile was selected, push the new reference so the
                // left column and CropEditor re-init with the updated span
                const selected = this.appControllerService.getSelectedGridImage();
                if (selected?.id === updated.id) {
                    this.appControllerService.setSelectedGridImage(updated);
                }

                this.imageProcessing.cropImage(updated, true)
                    .then(src => {
                        updated.croppedSrc = src;
                        // Create a new array reference so ktd-grid picks up the change
                        // without corrupting the gridImages$ order via setGridImages.
                        this.layout = [...this.layout];
                        this.cdr.detectChanges();
                    })
                    .catch(err => console.error('Failed to crop resized image:', err));
            }
        }
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
    addItemToLayout(item: GridImg){
        // Important: Don't mutate the array, create new instance. This way notifies the Grid component that the layout has changed.
        this.layout = [item, ...this.layout];
        const compacted: KtdGridLayout = ktdGridCompact(this.layout, this.compactType, this.cols);
        this.onLayoutUpdated(compacted);
    }

    /**
     * Check if 'selectedItem' is on the multi item selection
     */
    isItemSelected(selectedItem: KtdGridLayoutItem): boolean {
        return this.selectedItems.includes(selectedItem.id);
    }

    @HostListener('document:keydown', ['$event'])
    handleKeyDown(event: KeyboardEvent) {
        if ((event.key === 'Delete' || event.key === 'Backspace') && this.selectedItems.length > 0) {
            this.selectedItems.forEach(item => {
                this.appControllerService.removeGridImage(item);
            })
            this.selectedItems = [];
            event.preventDefault();
        }
    }

    /*
     * Select an item outside of the group
     */
    pointerDownItemSelection(
        event: MouseEvent,
        selectedItem: GridImg
    ) {
        const ctrlOrCmd = event.ctrlKey;
        if (!ctrlOrCmd) {
            const selectedItemExist = this.selectedItems.includes(
                selectedItem.id
            );
            if (!selectedItemExist) {
                // Click an element outside selection group
                // Clean all selections and select the new item
                if (event.button === 2) {
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
                        this.selectedItems = this.selectedItems.filter(
                            item => item !== selectedItem.id
                        )
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

    onGridClick(event: MouseEvent) {
        // If event.target is a ktd-grid element
        if ((event.target as Element).tagName === 'KTD-GRID') {
            this.selectedItems = [];
            this.appControllerService.setSelectedGridImage(null);
        }
    }
}

