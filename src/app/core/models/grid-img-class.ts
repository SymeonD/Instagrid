// Class of a baic image, with original src and lower resolution src for editing

import { KtdGridLayoutItem } from "@katoid/angular-grid-layout";
import { GlobalImg } from "./global-img-class";

export class GridImg implements KtdGridLayoutItem {
    constructor(public globalGridImg: GlobalImg, public x: number, public y: number, public w: number, public h: number, public croppedSrc?: string , public id: string = crypto.randomUUID()) {
        
    }
}
