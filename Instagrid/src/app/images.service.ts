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

    setSelectedImage(imageId: any) {
        this.selectedImageSubject.next(imageId);
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

    addGridItems(id: any, image: any, gridX: number, gridY: number) {
        this.gridItemsSubject.next([...this.gridItemsSubject.value,[id, image, gridX, gridY, Math.random().toString(36).substr(2, 9)]]);
    }

    setGridItems(gridItems: any[]) {
        this.gridItemsSubject.next(gridItems);
    }

    removeGridItem(index: any) {
        this.gridItemsSubject.next(this.gridItemsSubject.value.filter(item => item[3] !== index));
    }

    clearImages() {
        this.imagesSubject.next([]);
        this.selectedImageSubject.next(null);
        this.gridItemsSubject.next([]);
    }
}