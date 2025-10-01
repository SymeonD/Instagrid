// Injectable
import { Injectable } from '@angular/core';
import { globalImg } from './global-img-class';
import { gridImg } from './grid-img-class';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Injectable({ providedIn: 'root' })
export class AppControllerService {
    constructor() {}

    // List of images, accessible from outside and displayed in the right column
    private globalImagesSubject = new BehaviorSubject<globalImg[]>([]);
    globalImages$ = this.globalImagesSubject.asObservable();

    // List of images, accessible from outside and displayed in the grid
    private gridImagesSubject = new BehaviorSubject<gridImg[]>([]);
    gridImages$ = this.gridImagesSubject.asObservable();

    // Selected image, set in the grid and displayed in the left column 
    private selectedGridImageSubject = new BehaviorSubject<gridImg | null>(null);
    selectedGridImage$ = this.selectedGridImageSubject.asObservable();

    // Global Images
    getGlobalImages(): globalImg[] {    
        return this.globalImagesSubject.value;
    }

    addGlobalImage(image: globalImg) {
        this.globalImagesSubject.next([...this.globalImagesSubject.value, image]);
    }

    removeGlobalImage(imageId: string) {
        this.globalImagesSubject.next(this.globalImagesSubject.value.filter(img => img.id !== imageId));}

    // Grid Images
    getGridImages(): gridImg[] {
        return this.gridImagesSubject.value;
    }

    setGridImages(images: gridImg[]) {
        this.gridImagesSubject.next(images);
    }

    addGridImage(image: gridImg) {
        this.gridImagesSubject.next([...this.gridImagesSubject.value, image]);
    }

    removeGridImage(imageId: string) {
        this.gridImagesSubject.next(this.gridImagesSubject.value.filter(img => img.id !== imageId));
    }

    // Selected Image
    setSelectedGridImage(image: gridImg | null) {
        this.selectedGridImageSubject.next(image);
    }
}