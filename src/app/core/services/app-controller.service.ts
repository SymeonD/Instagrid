// Injectable
import { Injectable } from '@angular/core';
import { GlobalImg } from '../../core/models/global-img-class';
import { GridImg } from '../../core/models/grid-img-class';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Injectable({ providedIn: 'root' })
export class AppControllerService {
    constructor() {}

    // List of images, accessible from outside and displayed in the right column
    private globalImagesSubject = new BehaviorSubject<GlobalImg[]>([]);
    globalImages$ = this.globalImagesSubject.asObservable();

    // List of images, accessible from outside and displayed in the grid
    private gridImagesSubject = new BehaviorSubject<GridImg[]>([]);
    gridImages$ = this.gridImagesSubject.asObservable();

    // Selected image, set in the grid and displayed in the left column 
    private selectedGridImageSubject = new BehaviorSubject<GridImg | null>(null);
    selectedGridImage$ = this.selectedGridImageSubject.asObservable();

    // Global Images
    getGlobalImages(): GlobalImg[] {    
        return this.globalImagesSubject.value;
    }

    addGlobalImage(image: GlobalImg) {
        this.globalImagesSubject.next([...this.globalImagesSubject.value, image]);
    }

    removeGlobalImage(imageId: string) {
        this.globalImagesSubject.next(this.globalImagesSubject.value.filter(img => img.id !== imageId));}

    // Grid Images
    getGridImages(): GridImg[] {
        return this.gridImagesSubject.value;
    }

    setGridImages(images: GridImg[]) {
        this.gridImagesSubject.next(images);
    }

    addGridImage(image: GridImg) {
        this.gridImagesSubject.next([...this.gridImagesSubject.value, image]);
    }

    removeGridImage(imageId: string) {
        this.gridImagesSubject.next(this.gridImagesSubject.value.filter(img => img.id !== imageId));

        const selected = this.selectedGridImageSubject.value;
        if (selected && selected.id === imageId) {
            this.selectedGridImageSubject.next(null);
        }
    }

    // Selected Image
    setSelectedGridImage(image: GridImg | null) {
        this.selectedGridImageSubject.next(image);
    }
}