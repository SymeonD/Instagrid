// Class of a baic image, with original src and lower resolution src for editing

import { KtdGridLayoutItem } from "@katoid/angular-grid-layout";
import { globalImg } from "./global-img-class";

export class gridImg implements KtdGridLayoutItem {
    constructor(public globalImg: globalImg, public x: number, public y: number, public w: number, public h: number, public croppedSrc?: string , public id: string = Math.random().toString(36).substr(2, 9)) {
        
    }
}
