import { Injectable } from '@angular/core';
import { gridImg } from '../../core/models/grid-img-class';
import JSZip from 'jszip';

@Injectable({ providedIn: 'root' })
export class ImageProcessingService {
  constructor() {}

  async cropImage(image: gridImg, lowResolution: boolean): Promise<string> {
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
      img.src = lowResolution ? image.globalImg.lowResSrc! : image.globalImg.highResSrc;

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
          context.lineWidth = 10;
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
    const maxSize = 400;

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          if (!context) return;
          const aspectRatio = img.width / img.height;
          if (img.width > img.height) {
              canvas.width = maxSize;
              canvas.height = maxSize / aspectRatio;
          } else {
              canvas.height = maxSize;
              canvas.width = maxSize * aspectRatio;
          }
          context.drawImage(img, 0, 0, canvas.width, canvas.height);
          const newSrc = canvas.toDataURL('image/jpeg');
          resolve(newSrc);
      };
      img.onerror = (error) => {
          reject(error);
      };
    });
  }

  divideImage(srcImage: string, cols: number, rows: number, overlap: number = 70): Promise<string[]> {
    if (!srcImage) return Promise.reject('No image provided');

    const promises: Promise<string>[] = [];
    const targetWidth = 1080;
    const targetHeight = 1350;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        promises.push(
          new Promise<string>((resolve, reject) => {
            const img = new window.Image();
            img.src = srcImage;
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const context = canvas.getContext('2d');
              if (!context) return reject('Canvas context error');

              canvas.width = targetWidth;
              canvas.height = targetHeight;

              const sx = c * (targetWidth - overlap);
              const sy = r * targetHeight;

              context.drawImage(img, sx, sy, targetWidth, targetHeight, 0, 0, targetWidth, targetHeight);
              resolve(canvas.toDataURL('image/jpeg'));
            };
            img.onerror = reject;
          })
        );
      }
    }

    return Promise.all(promises);
  }

  async createZip(images: string[]): Promise<Blob> {
    const zip = new JSZip();
    images.forEach((img, i) => {
      const base64 = img.split(',')[1];
      zip.file(`image-${i}.jpg`, base64, { base64: true });
    });
    return zip.generateAsync({ type: 'blob' });
  }
}
