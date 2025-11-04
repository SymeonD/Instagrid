// Class of a baic image, with original src and lower resolution src for editing
import { ImageProcessingService } from '../services/image-processing-service';

export class globalImg {
    constructor(public highResSrc: string, public alt: string,  private imageProcessing?: ImageProcessingService, public id: string = Math.random().toString(36).substr(2, 9), public lowResSrc?: string) {
        // Create a low resolution version of the image
        imageProcessing ? imageProcessing.createLowResImage(highResSrc).then((lowRes) => {
            this.lowResSrc = lowRes;
        }) : null;
    }
}
