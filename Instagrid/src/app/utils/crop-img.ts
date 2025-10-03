import { gridImg } from "../shared/grid-img-class";

export function cropImage(image: gridImg, lowResolution: boolean): Promise<string> {
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
        context.strokeStyle = 'white';
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
