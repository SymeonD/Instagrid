// Class of a baic image, with original src and lower resolution src for editing

import { globalImg } from "./global-img-class";

export class gridImg {
    constructor(public id: number, public globalImg: globalImg, public x: number, public y: number, public w: number, public h: number) {}
}
