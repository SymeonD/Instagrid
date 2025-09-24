import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ImageService {
    private imagesSubject = new BehaviorSubject<any[]>([]);
    images$ = this.imagesSubject.asObservable();

    private selectedImageSubject = new BehaviorSubject<any | null>(null);
    selectedImage$ = this.selectedImageSubject.asObservable();

    private gridItemsSubject = new BehaviorSubject<any[]>([]);
    gridItems$ = this.gridItemsSubject.asObservable();

    getImages() {
        return this.imagesSubject.value;
    }

    setImages(images: any[]) {
        this.imagesSubject.next(images);
    }

    addImage(image: any) {
        this.imagesSubject.next([...this.imagesSubject.value, image]);
    }

    removeImage(image: any) {
        this.imagesSubject.next(this.imagesSubject.value.filter(img => img !== image));
    }

    setSelectedImage(image: any) {
        this.selectedImageSubject.next(image);
    }

    getSelectedImage() {
        return this.selectedImageSubject.value;
    }

    editImage(oldImage: any, newSrc: string) {
        this.imagesSubject.next(this.imagesSubject.value.map(img => img === oldImage ? { ...img, src: newSrc } : img));
    }

    getGridItems() {
        return this.gridItemsSubject.value;
    }

    addGridItems(images: any) {
        console.log('Adding grid items:', images);
        this.gridItemsSubject.next(images);
    }

    setGridItems(images: any) {
        this.gridItemsSubject.next(images);
    }

    clearImages() {
        this.imagesSubject.next([]);
        this.selectedImageSubject.next(null);
        this.gridItemsSubject.next([]);
    }
}