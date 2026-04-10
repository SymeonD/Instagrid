// Class of a baic image, with original src and lower resolution src for editing
import { ImageProcessingService } from '../services/image-processing-service';

export class GlobalImg {
    constructor(public highResSrc: string, public alt: string,  private imageProcessing?: ImageProcessingService, public id: string = crypto.randomUUID(), public lowResSrc?: string) {
        // Create a low resolution version of the image
        if (imageProcessing) {
            imageProcessing.createLowResImage(highResSrc)
                .then((lowRes) => { this.lowResSrc = lowRes; })
                .catch((err) => { console.error('Failed to create low-res image:', err); this.lowResSrc = highResSrc; });
        }
    }
}
