// Class of a basic image, with original src and lower resolution src for editing
export class GlobalImg {
    constructor(public highResSrc: string, public alt: string, public id: string = crypto.randomUUID(), public lowResSrc?: string) {}
}
