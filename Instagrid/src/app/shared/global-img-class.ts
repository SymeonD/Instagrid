// Class of a baic image, with original src and lower resolution src for editing

import { createLowResImage } from "../utils/low-res";
import { AppControllerService } from "./app-controller.service";

export class globalImg {
    constructor(public highResSrc: string, public alt: string, public id?: string, public lowResSrc?: string) {
        // Create an id for the image
        this.id = this.id ?? Math.random().toString(36).substr(2, 9);

        // Create a low resolution version of the image
        createLowResImage(highResSrc).then((lowRes) => {
            this.lowResSrc = lowRes;
        })
    }
}
