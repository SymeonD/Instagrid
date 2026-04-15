import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppControllerService } from '../../../core/services/app-controller.service';
import { GridImg } from '../../../core/models/grid-img-class';
import { GlobalImg } from '../../../core/models/global-img-class';
import { ImageProcessingService } from '../../../core/services/image-processing-service';
import { RightColumnService } from '../../../core/services/right-column-service';
import { CropEditor, CropValues } from '../../../shared/components/crop-editor/crop-editor';

@Component({
  selector: 'import-prompt',
  imports: [CommonModule, CropEditor],
  templateUrl: './import-prompt.html',
  styleUrl: './import-prompt.scss'
})
export class ImportPrompt implements OnChanges {
  @Input() image: GlobalImg | null = null;
  @Output() close = new EventEmitter<void>();

  // Grid selection logic
  private gridSizes: { [key: number]: number[] } = {
    0: [],
    1: [0],
    2: [0, 1],
    3: [0, 1, 2],
    4: [0, 3],
    5: [0, 1, 3, 4],
    6: [0, 1, 2, 3, 4, 5],
    7: [0, 3, 6],
    8: [0, 1, 3, 4, 6, 7],
    9: [0, 1, 2, 3, 4, 5, 6, 7, 8]
  };
  // [w, h] = [grid columns, grid rows]
  private gridImageSizes: { [key: number]: number[] } = {
    0: [],
    1: [1, 1],
    2: [2, 1],
    3: [3, 1],
    4: [1, 2],
    5: [2, 2],
    6: [3, 2],
    7: [1, 3],
    8: [2, 3],
    9: [3, 3]
  };

  private hoveredSize = 0;
  private selectedSize = 1;

  // Mobile step state
  mobileStep: 1 | 2 = 1;

  // The live GridImg used by the crop editor and for export
  cropGridImg: GridImg | null = null;

  constructor(
    private appControllerService: AppControllerService,
    private imageProcessing: ImageProcessingService,
    private rightColumnService: RightColumnService
  ) {}

  ngOnChanges(): void {
    if (this.image) {
      this.mobileStep = 1;
      this.buildCropGridImg(this.selectedSize);
    }
  }

  isMobile(): boolean {
    return window.innerWidth <= 768;
  }

  nextStep(): void {
    this.mobileStep = 2;
  }

  prevStep(): void {
    this.mobileStep = 1;
  }

  /** Build (or rebuild) cropGridImg for the given span, resetting crop to center */
  private buildCropGridImg(size: number): void {
    if (!this.image) return;
    const [w, h] = this.gridImageSizes[size];
    this.cropGridImg = new GridImg(this.image, -1, -1, w, h);
  }

  protected async downloadImages(): Promise<void> {
    if (!this.image || !this.cropGridImg) return;

    try {
      const cropped = await this.imageProcessing.cropImage(this.cropGridImg, false);
      const divided = await this.imageProcessing.divideImage(
        cropped, this.cropGridImg.w, this.cropGridImg.h
      );
      const zipBlob = await this.imageProcessing.createZip(divided);

      const url = window.URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'images.zip';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading image:', err);
    }
  }

  protected deleteImage(): void {
    if (this.image) {
      this.appControllerService.removeGlobalImage(this.image.id!);
      this.close.emit();
    }
  }

  isDarkened(index: number): boolean {
    return this.gridSizes[this.hoveredSize].includes(index);
  }

  isSelected(index: number): boolean {
    return this.gridSizes[this.selectedSize].includes(index);
  }

  onPlaceholderHover(index: number): void {
    this.hoveredSize = index + 1;
  }

  onPlaceholderClick(index: number): void {
    this.selectedSize = index + 1;
    this.buildCropGridImg(this.selectedSize);
    // On mobile, auto-advance to crop step
    if (this.isMobile()) {
      this.nextStep();
    }
  }

  /** Crop editor emits on drag/zoom end — store the new values */
  onCropChange(values: CropValues): void {
    if (!this.cropGridImg) return;
    this.cropGridImg.cropX = values.cropX;
    this.cropGridImg.cropY = values.cropY;
    this.cropGridImg.cropZoom = values.cropZoom;
  }

  /** Send the image to the grid with current span and crop */
  async sendImage(): Promise<void> {
    if (!this.image || !this.cropGridImg) return;

    const croppedSrc = await this.imageProcessing.cropImage(this.cropGridImg, true);

    this.appControllerService.addGridImage(new GridImg(
      this.image,
      -1, -1,
      this.cropGridImg.w,
      this.cropGridImg.h,
      croppedSrc,
      undefined,
      this.cropGridImg.cropX,
      this.cropGridImg.cropY,
      this.cropGridImg.cropZoom
    ));

    this.rightColumnService.close();
    this.close.emit();
  }
}
