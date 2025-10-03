import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { AppControllerService } from '../shared/app-controller.service';
import { gridImg } from '../shared/grid-img-class';
import { cropImage } from '../utils/crop-img';
import JSZip from 'jszip';

@Component({
  selector: 'left-column',
  imports: [MatIcon, CommonModule],
  templateUrl: './left-column.html',
  styleUrl: './left-column.scss'
})
export class LeftColumn {
  // Get image selected from service
  selectedImage: gridImg | null = null;

  constructor(private appControllerService: AppControllerService) {
    this.appControllerService.selectedGridImage$.subscribe(image => {
      this.selectedImage = image;
    });
  }

  // Download the selected image
  // The selected image will be cut in a (1010*cols+70) x (1350*rows) image, centered
  // Then this new image will be cut in segments of 1080 x 1350
  // From top left corner to bottom right corner
  protected downloadImage(): void {
    if(!this.selectedImage || this.selectedImage == null) return;
  
    cropImage(this.selectedImage, false).then(src => {
      this.divideImage(src, this.selectedImage!.w, this.selectedImage!.h).then(images => {
        const zip = new JSZip();
        images.forEach((image, index) => {
          const base64Data = image.split(',')[1];
          zip.file(`image-${index}.jpg`, base64Data, { base64: true });
        });
        zip.generateAsync({ type: 'blob' }).then(blob => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'images.zip';
          a.click();
          window.URL.revokeObjectURL(url);  
        });
      })
    });
  }

  // Edit the selected image
  protected editImage(): void {
    // TODO: Implement image editing logic
  }

  // Delete the selected image
  protected deleteImage(): void {
    if (this.selectedImage) {
      this.appControllerService.removeGridImage(this.selectedImage.id!);
      this.appControllerService.setSelectedGridImage(null);
      this.selectedImage = null;
    }
  }

  // Divide the image in segments of 1080 x 1350
  // From top left corner to bottom right corner
  protected divideImage(srcImage: string, cols: number, rows: number): Promise<string[]> {
    if (!srcImage) {
      return Promise.reject('No image selected');
    }

    const srcs: string[] = [];
    const promises: Promise<string>[] = [];

    const targetWidth = 1080;
    const targetHeight = 1350;

    for(let r = 0; r < rows; r++) {
      for(let c = 0; c < cols; c++) {

        promises.push(
          new Promise((resolve, reject) => {
            
            const img = new window.Image();
            img.src = srcImage;
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const context = canvas.getContext('2d');
              if (!context) return;
              canvas.width = targetWidth;
              canvas.height = targetHeight;
              const sx = c * (targetWidth - 70);
              const sy = r * targetHeight;
              context.drawImage(
                img,
                sx, sy,
                targetWidth, targetHeight,
                0, 0,
                targetWidth, targetHeight
              );
              const newSrc = canvas.toDataURL('image/jpeg');
              srcs.push(newSrc);
              resolve(newSrc);
            };
            img.onerror = (error) => reject(error);
          })
        )

      }
    }

    return Promise.all(promises);
    }
}
