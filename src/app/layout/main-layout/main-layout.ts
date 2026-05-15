import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';
import { AppGrid } from '../../features/app-grid/app-grid';
import { LeftColumn } from '../../features/left-column/left-column';
import { RightColumn } from '../../features/right-column/right-column';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AppHeader } from "../app-header/app-header";
import { GridImg } from '../../core/models/grid-img-class';
import { AppControllerService } from '../../core/services/app-controller.service';
import { ImportPromptService } from '../../core/services/import-prompt.service';
import { ImportPrompt } from "../../features/modals/import-prompt/import-prompt";
import { GlobalImg } from '../../core/models/global-img-class';
import { ImageProcessingService } from '../../core/services/image-processing-service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { LeftColumnService } from '../../core/services/left-column-service';
import { RightColumnService } from '../../core/services/right-column-service';

@Component({
  selector: 'main-layout',
  imports: [RouterOutlet, AppGrid, LeftColumn, RightColumn, CommonModule, MatIconModule, AppHeader, ImportPrompt, MatSnackBarModule, MatButtonModule],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss'
})
export class MainLayout {
  private destroyRef = inject(DestroyRef);
  protected readonly title = signal('Instagrid');
  protected selectedImage: GridImg | null = null;
  protected showImportPrompt = false;
  protected modalImage: GlobalImg | null = null;

  protected isRightColumnOpen = false;
  protected isLeftColumnOpen = false;

  // Draggable sheet state (right panel on mobile)
  protected sheetDragY = 0;
  protected sheetDragging = false;
  private sheetTouchStartY = 0;
  private sheetDragStartY = 0;

  constructor(
    private appControllerService: AppControllerService,
    private importPromptService: ImportPromptService,
    private imageProcessing: ImageProcessingService,
    private leftColumnService: LeftColumnService,
    private rightColumnService: RightColumnService
  ) {}

  ngOnInit() {
    this.appControllerService.selectedGridImage$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(img => {
      this.selectedImage = img;
      // On mobile: auto-open the edit panel when an image is selected
      if (img && window.innerWidth <= 768) {
        setTimeout(() => this.leftColumnService.open(), 0);
      }
    });
    this.importPromptService.modalImage$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(img => this.modalImage = img);
    this.importPromptService.modalOpen$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(open => this.showImportPrompt = open);
    this.leftColumnService.openState$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(open => this.isLeftColumnOpen = open);
    this.rightColumnService.openState$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(open => {
      this.isRightColumnOpen = open;
      // Reset drag offset when sheet opens/closes
      this.sheetDragY = 0;
    });
  }

  toggleLeftColumn() { this.leftColumnService.toggle(); }
  toggleRightColumn() { this.rightColumnService.toggle(); }

  onOutsideClick() {
    if (this.isLeftColumnOpen) this.leftColumnService.close();
    if (this.isRightColumnOpen) this.rightColumnService.close();
    // If any was open, also clear the selected image to reset state
    if (this.isLeftColumnOpen || this.isRightColumnOpen) {
      this.appControllerService.setSelectedGridImage(null);
    }
  }

  closeImportPrompt() { this.importPromptService.closeImportPrompt(); }

  protected importImages(): void {
    this.imageProcessing.importImages(this.rightColumnService);
  }

  // ── Draggable sheet (right panel on mobile) ──────────────────────

  onSheetTouchStart(event: TouchEvent): void {
    this.sheetDragging = true;
    this.sheetTouchStartY = event.touches[0].clientY;
    this.sheetDragStartY = this.sheetDragY;
  }

  onSheetTouchMove(event: TouchEvent): void {
    if (!this.sheetDragging) return;
    const dy = event.touches[0].clientY - this.sheetTouchStartY;
    // Only allow dragging down (positive dy), not pulling further up
    this.sheetDragY = Math.max(0, this.sheetDragStartY + dy);
  }

  onSheetTouchEnd(): void {
    if (!this.sheetDragging) return;
    this.sheetDragging = false;
    // Snap: close if dragged more than 120px down, else snap back to open
    if (this.sheetDragY > 120) {
      this.sheetDragY = 0;
      this.rightColumnService.close();
    } else {
      this.sheetDragY = 0;
    }
  }

  get sheetTransform(): string {
    if (window.innerWidth > 768) return '';
    if (!this.isRightColumnOpen) return 'translateY(100%)';
    if (this.sheetDragY > 0) return `translateY(${this.sheetDragY}px)`;
    return 'translateY(0)';
  }

  get sheetTransition(): string {
    return this.sheetDragging ? 'none' : 'transform 0.3s ease';
  }
}
