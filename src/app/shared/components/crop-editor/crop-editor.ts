import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridImg } from '../../../core/models/grid-img-class';

export interface CropValues {
  cropX: number;
  cropY: number;
  cropZoom: number;
}

type DragMode = 'move' | 'resize-left' | 'resize-right' | 'resize-top' | 'resize-bottom';

@Component({
  selector: 'crop-editor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './crop-editor.html',
  styleUrl: './crop-editor.scss',
})
export class CropEditor implements OnChanges {
  @Input() gridImg!: GridImg;
  @Output() cropChange = new EventEmitter<CropValues>();

  @ViewChild('imageEl') imageEl!: ElementRef<HTMLImageElement>;
  @ViewChild('wrapper') wrapperEl!: ElementRef<HTMLDivElement>;

  // Actual rendered image dimensions (px)
  imageDisplayW = 0;
  imageDisplayH = 0;

  // Crop rectangle position and size (px)
  rectX = 0;
  rectY = 0;
  rectW = 0;
  rectH = 0;

  // Zoom derived from rect size — kept in sync for cropImage()
  cropZoom = 1.0;

  // Drag state
  isDragging = false;
  private dragMode: DragMode = 'move';
  private dragStartClientX = 0;
  private dragStartClientY = 0;
  private dragStartRectX = 0;
  private dragStartRectY = 0;
  private dragStartRectW = 0;
  private dragStartRectH = 0;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['gridImg']) return;

    const prev: GridImg | undefined = changes['gridImg'].previousValue;
    const curr: GridImg = changes['gridImg'].currentValue;

    const srcChanged =
      !prev ||
      prev.globalGridImg.lowResSrc !== curr.globalGridImg.lowResSrc;

    if (srcChanged) {
      // Different image — wait for onImageLoad to re-init
      this.imageDisplayW = 0;
      this.imageDisplayH = 0;
    } else if (this.imageDisplayW > 0) {
      // Same image, different span or crop — re-read actual dimensions and re-init
      const img = this.imageEl?.nativeElement;
      if (img) {
        this.imageDisplayW = img.clientWidth;
        this.imageDisplayH = img.clientHeight;
      }
      this.cropZoom = curr.cropZoom;
      this.computeRect();
      this.cdr.detectChanges();
    }
  }

  onImageLoad(): void {
    const img = this.imageEl.nativeElement;

    // Use the actual rendered dimensions so CSS constraints (max-height, etc.)
    // are accounted for — avoids the rect overflowing a capped wrapper.
    this.imageDisplayW = img.clientWidth;
    // Subtract 1px so the bottom border of the crop rect is never flush with
    // the overflow:hidden clip boundary (avoids subpixel rendering cutting it off)
    this.imageDisplayH = img.clientHeight - 1;

    this.cropZoom = this.gridImg.cropZoom;
    this.computeRect();
    this.cdr.detectChanges();
  }

  // ─── Geometry ─────────────────────────────────────────────────────────────

  private get tileAspect(): number {
    return (1010 * this.gridImg.w + 70) / (1350 * this.gridImg.h);
  }

  private get maxRectSize(): { w: number; h: number } {
    const imgAspect = this.imageDisplayW / this.imageDisplayH;
    if (this.tileAspect > imgAspect) {
      return { w: this.imageDisplayW, h: this.imageDisplayW / this.tileAspect };
    }
    return { w: this.imageDisplayH * this.tileAspect, h: this.imageDisplayH };
  }

  private get minRectSize(): { w: number; h: number } {
    const max = this.maxRectSize;
    return { w: max.w / 2, h: max.h / 2 }; // 2× max zoom
  }

  private get availableX(): number {
    return Math.max(0, this.imageDisplayW - this.rectW);
  }
  private get availableY(): number {
    return Math.max(0, this.imageDisplayH - this.rectH);
  }

  private computeRect(): void {
    const max = this.maxRectSize;
    this.rectW = max.w / this.cropZoom;
    this.rectH = max.h / this.cropZoom;
    this.rectX = Math.max(0, Math.min(this.availableX, this.availableX * this.gridImg.cropX));
    this.rectY = Math.max(0, Math.min(this.availableY, this.availableY * this.gridImg.cropY));
  }

  // ─── Drag start (move) ────────────────────────────────────────────────────

  onRectMouseDown(event: MouseEvent): void {
    event.preventDefault();
    this.startDrag('move', event.clientX, event.clientY);
  }

  onRectTouchStart(event: TouchEvent): void {
    event.preventDefault();
    const t = event.touches[0];
    this.startDrag('move', t.clientX, t.clientY);
  }

  // ─── Drag start (resize sides) ────────────────────────────────────────────

  onSideMouseDown(event: MouseEvent, side: DragMode): void {
    event.preventDefault();
    event.stopPropagation();
    this.startDrag(side, event.clientX, event.clientY);
  }

  onSideTouchStart(event: TouchEvent, side: DragMode): void {
    event.preventDefault();
    event.stopPropagation();
    const t = event.touches[0];
    this.startDrag(side, t.clientX, t.clientY);
  }

  private startDrag(mode: DragMode, clientX: number, clientY: number): void {
    this.isDragging = true;
    this.dragMode = mode;
    this.dragStartClientX = clientX;
    this.dragStartClientY = clientY;
    this.dragStartRectX = this.rectX;
    this.dragStartRectY = this.rectY;
    this.dragStartRectW = this.rectW;
    this.dragStartRectH = this.rectH;
  }

  // ─── Drag move ────────────────────────────────────────────────────────────

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (this.isDragging) this.handleDrag(event.clientX, event.clientY);
  }

  @HostListener('document:touchmove', ['$event'])
  onTouchMove(event: TouchEvent): void {
    if (this.isDragging) {
      const t = event.touches[0];
      this.handleDrag(t.clientX, t.clientY);
    }
  }

  @HostListener('document:mouseup')
  onMouseUp(): void {
    if (this.isDragging) { this.isDragging = false; this.emitCropChange(); }
  }

  @HostListener('document:touchend')
  onTouchEnd(): void {
    if (this.isDragging) { this.isDragging = false; this.emitCropChange(); }
  }

  private handleDrag(clientX: number, clientY: number): void {
    if (this.dragMode === 'move') {
      this.applyMove(clientX, clientY);
    } else {
      this.applyResize(clientX, clientY);
    }
  }

  private applyMove(clientX: number, clientY: number): void {
    const dx = clientX - this.dragStartClientX;
    const dy = clientY - this.dragStartClientY;
    this.rectX = Math.max(0, Math.min(this.availableX, this.dragStartRectX + dx));
    this.rectY = Math.max(0, Math.min(this.availableY, this.dragStartRectY + dy));
  }

  private applyResize(clientX: number, clientY: number): void {
    const dx = clientX - this.dragStartClientX;
    const dy = clientY - this.dragStartClientY;
    const max = this.maxRectSize;
    const min = this.minRectSize;

    // Edges of the rect at drag start — the opposite edge stays anchored
    const startRight  = this.dragStartRectX + this.dragStartRectW;
    const startBottom = this.dragStartRectY + this.dragStartRectH;
    const startCenterX = this.dragStartRectX + this.dragStartRectW / 2;
    const startCenterY = this.dragStartRectY + this.dragStartRectH / 2;

    let newW = this.dragStartRectW;
    let newH = this.dragStartRectH;

    if (this.dragMode === 'resize-right') {
      // Left fixed. Cap height so center stays at startCenterY (neither top nor bottom overflows).
      const maxH = Math.min(max.h, 2 * startCenterY, 2 * (this.imageDisplayH - startCenterY));
      const maxW = Math.min(max.w, this.imageDisplayW - this.dragStartRectX, maxH * this.tileAspect);
      newW = Math.max(min.w, Math.min(maxW, this.dragStartRectW + dx));
      newH = newW / this.tileAspect;
      this.rectX = this.dragStartRectX;
      this.rectY = startCenterY - newH / 2;
    } else if (this.dragMode === 'resize-left') {
      // Right fixed. Same perpendicular cap.
      const maxH = Math.min(max.h, 2 * startCenterY, 2 * (this.imageDisplayH - startCenterY));
      const maxW = Math.min(max.w, startRight, maxH * this.tileAspect);
      newW = Math.max(min.w, Math.min(maxW, this.dragStartRectW - dx));
      newH = newW / this.tileAspect;
      this.rectX = Math.max(0, startRight - newW);
      this.rectY = startCenterY - newH / 2;
    } else if (this.dragMode === 'resize-bottom') {
      // Top fixed. Cap width so center stays at startCenterX.
      const maxW = Math.min(max.w, 2 * startCenterX, 2 * (this.imageDisplayW - startCenterX));
      const maxH = Math.min(max.h, this.imageDisplayH - this.dragStartRectY, maxW / this.tileAspect);
      newH = Math.max(min.h, Math.min(maxH, this.dragStartRectH + dy));
      newW = newH * this.tileAspect;
      this.rectY = this.dragStartRectY;
      this.rectX = startCenterX - newW / 2;
    } else { // resize-top
      // Bottom fixed. Same perpendicular cap.
      const maxW = Math.min(max.w, 2 * startCenterX, 2 * (this.imageDisplayW - startCenterX));
      const maxH = Math.min(max.h, startBottom, maxW / this.tileAspect);
      newH = Math.max(min.h, Math.min(maxH, this.dragStartRectH - dy));
      newW = newH * this.tileAspect;
      this.rectY = Math.max(0, startBottom - newH);
      this.rectX = startCenterX - newW / 2;
    }

    this.rectW = newW;
    this.rectH = newH;
    this.cropZoom = Math.max(1.0, Math.min(2.0, max.w / newW));
  }

  // ─── Emit ─────────────────────────────────────────────────────────────────

  private emitCropChange(): void {
    const cropX = this.availableX > 0 ? this.rectX / this.availableX : 0.5;
    const cropY = this.availableY > 0 ? this.rectY / this.availableY : 0.5;
    this.cropChange.emit({ cropX, cropY, cropZoom: this.cropZoom });
  }
}
