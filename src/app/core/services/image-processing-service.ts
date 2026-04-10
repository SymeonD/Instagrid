import { Injectable } from '@angular/core';
import { GridImg } from '../../core/models/grid-img-class';
import JSZip from 'jszip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppControllerService } from './app-controller.service';
import { GlobalImg } from '../models/global-img-class';
import { RightColumnService } from './right-column-service';

@Injectable({ providedIn: 'root' })
export class ImageProcessingService {
  constructor(private _snackBar: MatSnackBar, private appControllerService: AppControllerService) {}

  async cropImage(image: GridImg, lowResolution: boolean): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!image) {
        resolve('');
        return;
      }

      const gridX = image.w;
      const gridY = image.h;
      const targetWidth = 1010 * gridX + 70;
      const targetHeight = 1350 * gridY;
      const aspectRatio = targetWidth / targetHeight;

      const img = new window.Image();
      img.crossOrigin = 'anonymous'; // if images are external
      img.src = lowResolution ? image.globalGridImg.lowResSrc! : image.globalGridImg.highResSrc;

      img.onload = () => {
        let cropWidth = img.width;
        let cropHeight = Math.round(cropWidth / aspectRatio);

        if (cropHeight > img.height) {
          cropHeight = img.height;
          cropWidth = Math.round(cropHeight * aspectRatio);
        }

        const sx = Math.floor((img.width - cropWidth) / 2);
        const sy = Math.floor((img.height - cropHeight) / 2);

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) {
          reject('Cannot get canvas context');
          return;
        }

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        context.drawImage(
          img,
          sx, sy, cropWidth, cropHeight,
          0, 0, targetWidth, targetHeight
        );

        // If the image is low resolution, draw white lines, 10px wide
        // they need to be drawn on top of the image, depending on the gridX and gridY
        // The number of horizontal lines is gridX - 1, the number of vertical lines is gridY - 1
        // They need to be spaced evenly on the canvas
        if (lowResolution) {
          const stepX = targetWidth / (gridX);
          const stepY = targetHeight / (gridY);
          // Get body background color
          const bgColor = window.getComputedStyle(document.body, null).getPropertyValue('background-color'); 
          context.strokeStyle = bgColor;
          // Grid line width, 10px for large screens, 15px for small screens
          context.lineWidth = window.innerWidth > 768 ? 10 : 15;
          for (let i = 0; i < gridX; i++) {
            context.beginPath();
            context.moveTo(i * stepX, 0);
            context.lineTo(i * stepX, targetHeight);
            context.stroke();
          }
          for (let i = 0; i < gridY; i++) {
            context.beginPath();
            context.moveTo(0, i * stepY);
            context.lineTo(targetWidth, i * stepY);
            context.stroke();
          }
        }

        const newSrc = canvas.toDataURL('image/jpeg');
        resolve(newSrc);
      };

      img.onerror = (err) => reject(err);
    });
  }

  async createLowResImage(src: string): Promise<string> {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const maxSize = Math.round(800 * dpr);

    try {
      // Decode the data URL back to a Blob so createImageBitmap can use Lanczos downscaling
      const blob = await fetch(src).then(r => r.blob());

      const tempBitmap = await createImageBitmap(blob);
      const { width, height } = tempBitmap;
      tempBitmap.close();

      const aspectRatio = width / height;
      const resizeWidth  = width > height ? maxSize : Math.round(maxSize * aspectRatio);
      const resizeHeight = width > height ? Math.round(maxSize / aspectRatio) : maxSize;

      const bitmap = await createImageBitmap(blob, { resizeWidth, resizeHeight, resizeQuality: 'high' });

      const canvas = document.createElement('canvas');
      canvas.width  = resizeWidth;
      canvas.height = resizeHeight;
      canvas.getContext('2d')!.drawImage(bitmap, 0, 0);
      bitmap.close();

      return canvas.toDataURL('image/webp', 0.85);

    } catch {
      // Fallback for browsers that don't support createImageBitmap resize options (e.g. Firefox)
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject('Cannot get canvas context');
          const aspectRatio = img.width / img.height;
          if (img.width > img.height) {
            canvas.width  = maxSize;
            canvas.height = Math.round(maxSize / aspectRatio);
          } else {
            canvas.height = maxSize;
            canvas.width  = Math.round(maxSize * aspectRatio);
          }
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/webp', 0.85));
        };
        img.onerror = reject;
      });
    }
  }

  divideImage(srcImage: string, cols: number, rows: number, overlap: number = 70): Promise<string[]> {

    if (!srcImage) throw new Error("Source image is null");

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = srcImage;

      img.onload = () => {
        const tileWidth = Math.floor(img.width / cols);
        const tileHeight = Math.floor(img.height / rows);

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject("Canvas context error");

        // Resize each tile to 1080x1350
        const outputWidth = 1080;
        const outputHeight = 1350;
        canvas.width = outputWidth;
        canvas.height = outputHeight;

        const results: string[] = [];

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const sx = c * (tileWidth - overlap);
            const sy = r * tileHeight;

            ctx.clearRect(0, 0, outputWidth, outputHeight);

            ctx.drawImage(
              img,
              sx, sy,
              tileWidth, tileHeight,
              0, 0,
              outputWidth, outputHeight
            );

            results.push(canvas.toDataURL("image/jpeg"));
          }
        }

        resolve(results);
      };

      img.onerror = (err) => reject(err);
    });
  }


  async createZip(images: string[]): Promise<Blob> {
    const zip = new JSZip();
    images.forEach((img, i) => {
      const base64 = img.split(',')[1];
      zip.file(`image-${i}.jpg`, base64, { base64: true });
    });
    return zip.generateAsync({ type: 'blob' });
  }

  // TODO: optimize this function to handle large number of images without blocking the UI
  // Use web workers if necessary
  importImages(rightColumnService? : RightColumnService): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;

    input.onchange = (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (!target.files) return;

      const files = Array.from(target.files);
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
      const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'svg'];

      files.forEach((file) => {
        const ext = file.name.toLowerCase().split('.').pop();

        // Check both MIME type and extension
        if (!allowedTypes.includes(file.type) || !allowedExtensions.includes(ext!)) {
          this._snackBar.open(
            `⚠️ ${file.type} is not supported. Please upload JPG, JPEG, PNG, WEBP, or SVG files.`,
            'Close',
            { duration: 50000, panelClass: ['snackbar-warning'] }
          );
          return;
        }

        const reader = new FileReader();
        reader.onload = () => {
          const image = { src: reader.result as string, alt: file.name };
          this.appControllerService.addGlobalImage(
            new GlobalImg(image.src, image.alt, this)
          );
          this._snackBar.open(`✅ Image imported successfully!`, 'Close', {
            duration: 3000,
            panelClass: ['snackbar-success']
          });

          rightColumnService?.open();
        };
        reader.readAsDataURL(file);
      });
    };
    input.click();
  }
}
