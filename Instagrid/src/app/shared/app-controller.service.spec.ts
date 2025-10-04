import { TestBed } from '@angular/core/testing';
import { AppControllerService } from './app-controller.service';
import { gridImg } from './grid-img-class';
import { take } from 'rxjs/operators';
import { globalImg } from './global-img-class';

describe('AppControllerService', () => {
  let service: AppControllerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppControllerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set and get selectedGridImage$', (done) => {
    const testImage: gridImg = {
        id: '1', w: 1, h: 1, globalImg: new globalImg('low.jpg', 'high.jpg'),
        x: 0,
        y: 0
    };

    service.selectedGridImage$.pipe(take(1)).subscribe(selected => {
      expect(selected).toBeNull();
    });

    service.setSelectedGridImage(testImage);

    service.selectedGridImage$.pipe(take(1)).subscribe(selected => {
      expect(selected).toEqual(testImage);
      done();
    });
  });

  it('should add and remove images in gridImages$', (done) => {
    const img1: gridImg = {
        id: '1', w: 1, h: 1, globalImg: {
            lowResSrc: 'low1.jpg', highResSrc: 'high1.jpg',
            alt: '',
            id: ''
        },
        x: 0,
        y: 0
    };
    const img2: gridImg = {
        id: '2', w: 1, h: 1, globalImg: {
            lowResSrc: 'low2.jpg', highResSrc: 'high2.jpg',
            alt: '',
            id: ''
        },
        x: 0,
        y: 0
    };

    service.setGridImages([img1, img2]);

    service.gridImages$.pipe(take(1)).subscribe(images => {
      expect(images.length).toBe(2);
      expect(images).toContain(img1);
      expect(images).toContain(img2);
    });

    service.removeGridImage('1');

    service.gridImages$.pipe(take(1)).subscribe(images => {
      expect(images.length).toBe(1);
      expect(images).not.toContain(img1);
      expect(images).toContain(img2);
      done();
    });
  });

  it('should clear selected image when deleted', (done) => {
    const img: gridImg = {
        id: '1', w: 1, h: 1, globalImg: {
            lowResSrc: 'low.jpg', highResSrc: 'high.jpg',
            alt: '',
            id: ''
        },
        x: 0,
        y: 0
    };
    service.setSelectedGridImage(img);

    service.removeGridImage('1');

    service.selectedGridImage$.pipe(take(1)).subscribe(selected => {
      expect(selected).toBeNull();
      done();
    });
  });
});
