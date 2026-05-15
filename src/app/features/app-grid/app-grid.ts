import { ChangeDetectorRef, Component, HostListener, OnDestroy, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { KtdDragEnd, KtdDragStart, KtdGridBackgroundCfg, ktdGridCompact, KtdGridComponent, KtdGridItemComponent, KtdGridLayout, KtdGridLayoutItem, KtdGridModule, KtdResizeEnd, KtdResizeStart } from '@katoid/angular-grid-layout';
import { ktdTrackById } from '@katoid/angular-grid-layout';
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
  @ViewChildren(KtdGridItemComponent) gridItems!: QueryList<KtdGridItemComponent>;
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
    height = window.innerHeight;

    private _isDraggingResizing: boolean = false;

    // ─── Mobile touch state ────────────────────────────────────────────────────

    isMobile(): boolean { return window.innerWidth <= 768; }

    private touchState: {
        startX: number;
        startY: number;
        startTime: number;
        itemId: string;
        timer: ReturnType<typeof setTimeout> | null;
        startEvent: PointerEvent;
    } | null = null;

    private resizeState: {
        itemId: string;
        startX: number;
        startY: number;
        startW: number;
        startH: number;
    } | null = null;

    resizeActiveItemId: string | null = null;
    dragActiveItemId: string | null = null;

    private scrollMode = false;
    private lastScrollY = 0;
    private readonly onGridTouchStart = (e: TouchEvent) => e.preventDefault();
    scrollableParent: HTMLElement | null = null;

private updateGridHeight(): void {
        this.height = Math.max(this.getGridHeight(), window.innerHeight);
    }

    private readonly onResize = () => {
        this.gridWidth = document.getElementById('image-grid-container')?.clientWidth || window.innerWidth * 0.5;
        this.rowHeight = this.ASPECT_RATIO * (this.gridWidth / this.cols);
        this.updateGridHeight();
    };

    ngOnInit() {
        window.addEventListener('resize', this.onResize);
    }

    ngOnDestroy() {
        window.removeEventListener('resize', this.onResize);
        const gridEl = document.getElementById('image-grid-container');
        gridEl?.removeEventListener('touchstart', this.onGridTouchStart);
    }

    ngAfterViewInit() {
        this.gridWidth = document.getElementById('image-grid-container')?.clientWidth || window.innerWidth*0.5;
        this.rowHeight = this.ASPECT_RATIO * (this.gridWidth / this.cols);
        this.scrollableParent = document.querySelector('.center-column') as HTMLElement | null;
        this.updateGridHeight();
        this.cdr.detectChanges();
        // Non-passive touchstart prevents the Android OS long-press detection,
        // which fires pointercancel at ~500ms regardless of touch-action:none.
        // Safe because scroll is handled manually via onItemPointerMove.
        if (this.isMobile()) {
            const gridEl = document.getElementById('image-grid-container');
            gridEl?.addEventListener('touchstart', this.onGridTouchStart, { passive: false });
        }
    }

    constructor(protected appControllerService: AppControllerService, protected imageProcessing: ImageProcessingService, private cdr: ChangeDetectorRef) {
        // Clear grid selection when selected image is deselected externally (e.g. panel backdrop close)
        this.appControllerService.selectedGridImage$.pipe(takeUntilDestroyed()).subscribe(img => {
            if (!img) this.selectedItems = [];
        });

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

    // ─── Mobile pointer handlers ───────────────────────────────────────────────

    onItemPointerDown(event: PointerEvent, item: GridImg): void {
        if (!this.isMobile()) {
            this.pointerDownItemSelection(event as unknown as MouseEvent, item);
            return;
        }
        if (this._isDraggingResizing) return; // ignore mid-drag pointer re-issue (Android)
        this.cancelTouchState();
        this.touchState = {
            startX: event.clientX,
            startY: event.clientY,
            startTime: Date.now(),
            itemId: item.id,
            timer: setTimeout(() => this.activateDrag(item, event), 250),
            startEvent: event
        };
    }

    onCornerPointerDown(event: PointerEvent, item: GridImg): void {
        event.stopPropagation();
        event.preventDefault();
        this.cancelTouchState();
        this.touchState = {
            startX: event.clientX,
            startY: event.clientY,
            startTime: Date.now(),
            itemId: item.id,
            timer: setTimeout(() => this.activateResize(item, event), 500),
            startEvent: event
        };
    }

    onItemPointerMove(event: PointerEvent): void {
        if (this.scrollMode) {
            const scrollEl = document.querySelector('.center-column') as HTMLElement | null;
            if (scrollEl) scrollEl.scrollTop += this.lastScrollY - event.clientY;
            this.lastScrollY = event.clientY;
            return;
        }
        if (!this.touchState) return;
        const dx = Math.abs(event.clientX - this.touchState.startX);
        const dy = Math.abs(event.clientY - this.touchState.startY);
        if (dx + dy > 8) {
            this.scrollMode = true;
            this.lastScrollY = event.clientY;
            this.cancelTouchState();
        }
    }

    @HostListener('document:pointermove', ['$event'])
    onDocumentPointerMove(event: PointerEvent): void {
        // Mobile drag edge-scroll: ktd's scrollableParent uses getBoundingClientRect which
        // reports the full content height on mobile (not viewport height), so we handle it
        // ourselves using viewport coordinates instead.
        if (this._isDraggingResizing && this.isMobile()) {
            const edgeZone = 80;
            const vh = window.innerHeight;
            let scrollDelta = 0;
            if (event.clientY > vh - edgeZone) {
                scrollDelta = Math.round(8 * ((event.clientY - (vh - edgeZone)) / edgeZone));
            } else if (event.clientY < edgeZone) {
                scrollDelta = Math.round(-8 * ((edgeZone - event.clientY) / edgeZone));
            }
            if (scrollDelta !== 0 && this.scrollableParent) {
                this.scrollableParent.scrollTop += scrollDelta;
            }
        }

        if (!this.resizeState) return;
        const cellW = this.gridWidth / this.cols;
        const cellH = this.rowHeight;
        const deltaX = event.clientX - this.resizeState.startX;
        const deltaY = event.clientY - this.resizeState.startY;
        const item = this.layout.find(i => i.id === this.resizeState!.itemId);
        if (!item) return;
        const newW = Math.max(1, Math.min(this.cols - item.x,
            Math.round((this.resizeState.startW * cellW + deltaX) / cellW)));
        const newH = Math.max(1, Math.round((this.resizeState.startH * cellH + deltaY) / cellH));
        if (item.w !== newW || item.h !== newH) {
            item.w = newW;
            item.h = newH;
            this.layout = [...this.layout];
            this.updateGridHeight();
            this.cdr.detectChanges();
        }
    }

    @HostListener('document:pointerup')
    onDocumentPointerUp(): void {
        this.scrollMode = false;
        if (this.resizeState) {
            const itemId = this.resizeState.itemId;
            this.resizeState = null;
            this.resizeActiveItemId = null;
            this._isDraggingResizing = false;
            const idx = this.layout.findIndex(i => i.id === itemId);
            if (idx !== -1) {
                const old = this.layout[idx];
                // Create a new instance so Angular detects the reference change
                // in crop-editor's ngOnChanges (same pattern as desktop onResizeEnded)
                const updated = new GridImg(
                    old.globalGridImg,
                    old.x, old.y, old.w, old.h,
                    undefined, old.id
                    // cropX, cropY, cropZoom reset to defaults (0.5, 0.5, 1.0)
                );
                this.layout[idx] = updated;
                this.layout = [...this.layout];
                this.imageProcessing.cropImage(updated, true)
                    .then(src => {
                        updated.croppedSrc = src;
                        this.layout = [...this.layout];
                        this.cdr.detectChanges();
                    })
                    .catch(err => console.error('Crop error after resize:', err));
            }
        }
        this.cancelTouchState();
    }

    @HostListener('document:pointercancel')
    onDocumentPointerCancel(): void {
        this.scrollMode = false;
        this.cancelTouchState();
    }

    onItemPointerUp(event: PointerEvent, item: GridImg): void {
        this.scrollMode = false;
        if (!this.isMobile()) {
            this.pointerUpItemSelection(event as unknown as MouseEvent, item);
            return;
        }
        if (this.resizeState) return; // handled by document:pointerup

        // Safety reset: long press fired but user released before ktd emitted dragEnded
        if (this._isDraggingResizing && !this.resizeState) {
            this._isDraggingResizing = false;
            this.dragActiveItemId = null;
            this.cancelTouchState();
            return;
        }

        const wasTap = this.touchState &&
            Math.abs(event.clientX - this.touchState.startX) < 8 &&
            Math.abs(event.clientY - this.touchState.startY) < 8 &&
            Date.now() - this.touchState.startTime < 350 &&
            !this._isDraggingResizing;

        this.cancelTouchState();

        if (wasTap) {
            event.preventDefault();
            this.selectedItems = [item.id];
            this.appControllerService.setSelectedGridImage(item);
        }
    }

    onPointerCancel(): void {
        this.cancelTouchState();
    }

    private cancelTouchState(): void {
        if (this.touchState?.timer) clearTimeout(this.touchState.timer);
        this.touchState = null;
    }

    private activateDrag(item: GridImg, startEvent: PointerEvent): void {
        this.touchState = null;
        navigator.vibrate?.(30);
        this._isDraggingResizing = true;
        this.dragActiveItemId = item.id;
        this.cdr.detectChanges();
        // Capture the pointer before handing to ktd — prevents the browser from
        // firing pointercancel to reclaim the gesture for scrolling.
        try {
            (startEvent.target as Element)?.setPointerCapture(startEvent.pointerId);
        } catch {}
        const gridItem = this.gridItems?.find(gi => gi.id === item.id);
        gridItem?.startDragManually(startEvent as unknown as MouseEvent);
    }

    private activateResize(item: GridImg, event: PointerEvent): void {
        if (this.touchState) this.touchState.timer = null;
        navigator.vibrate?.(30);
        this._isDraggingResizing = true;
        this.resizeActiveItemId = item.id;
        this.resizeState = {
            itemId: item.id,
            startX: event.clientX,
            startY: event.clientY,
            startW: item.w,
            startH: item.h
        };
    }

    // ─── ktd drag/resize callbacks ─────────────────────────────────────────────

    onDragStarted(_event: KtdDragStart) {
        this._isDraggingResizing = true;
    }

    onDragEnded(_event: KtdDragEnd) {
        this._isDraggingResizing = false;
        this.dragActiveItemId = null;
    }

    onResizeStarted(_event: KtdResizeStart) {
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
        this.updateGridHeight();
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

