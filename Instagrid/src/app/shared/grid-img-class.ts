// Class of a baic image, with original src and lower resolution src for editing

import { globalImg } from "./global-img-class";

export class gridImg {
    constructor(public globalImg: globalImg, public x: number, public y: number, public w: number, public h: number, public id?: number) {
        this.id ?? +Math.random().toString(36).substr(2, 9);
    }
}
