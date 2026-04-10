// Class of a baic image, with original src and lower resolution src for editing

import { KtdGridLayoutItem } from "@katoid/angular-grid-layout";
import { GlobalImg } from "./global-img-class";

export class GridImg implements KtdGridLayoutItem {
    constructor(
        public globalGridImg: GlobalImg,
        public x: number,
        public y: number,
        public w: number,
        public h: number,
        public croppedSrc?: string,
        public id: string = crypto.randomUUID(),
        public cropX: number = 0.5,
        public cropY: number = 0.5,
        public cropZoom: number = 1.0
    ) {}

    resetCrop(): void {
        this.cropX = 0.5;
        this.cropY = 0.5;
        this.cropZoom = 1.0;
    }
}
