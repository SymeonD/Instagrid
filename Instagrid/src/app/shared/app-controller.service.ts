// Injectable
import { Injectable } from '@angular/core';
import { globalImg } from './global-img-class';
import { gridImg } from './grid-img-class';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Injectable({ providedIn: 'root' })
export class AppControllerService {
    constructor() {}

    // Subscriptions
    private globalImagesSubject = new BehaviorSubject<globalImg[]>([]);
    globalImages$ = this.globalImagesSubject.asObservable();

    private gridImagesSubject = new BehaviorSubject<gridImg[]>([]);
    gridImages$ = this.gridImagesSubject.asObservable();

    // Global Images
    getGlobalImages(): globalImg[] {    
        return this.globalImagesSubject.value;
    }

    addGlobalImage(image: globalImg) {
        this.globalImagesSubject.next([...this.globalImagesSubject.value, image]);
    }

    removeGlobalImage(imageId: number) {
        this.globalImagesSubject.next(this.globalImagesSubject.value.filter(img => img.id !== imageId));}

    // Grid Images
    getGridImages(): gridImg[] {
        return this.gridImagesSubject.value;
    }

    addGridImage(image: gridImg) {
        this.gridImagesSubject.next([...this.gridImagesSubject.value, image]);
    }

    removeGridImage(imageId: number) {
        this.gridImagesSubject.next(this.gridImagesSubject.value.filter(img => img.id !== imageId));
    }
}