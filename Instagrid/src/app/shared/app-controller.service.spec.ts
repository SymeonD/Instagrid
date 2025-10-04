import { TestBed } from '@angular/core/testing';
import { AppControllerService } from './app-controller.service';
import { globalImg } from './global-img-class';
import { gridImg } from './grid-img-class';

describe('AppControllerService', () => {
  let service: AppControllerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppControllerService);
  });

  describe('Global Images', () => {
    it('should add a global image', (done) => {
      const img = new globalImg('highRes.jpg', 'alt text');

      // Wait for lowResSrc to be set
      setTimeout(() => {
        service.addGlobalImage(img);
        const images = service.getGlobalImages();
        expect(images.length).toBe(1);
        expect(images[0]).toEqual(img);
        done();
      }, 50); // Adjust timeout if needed for lowRes creation
    });

    it('should remove a global image by id', () => {
      const img1 = new globalImg('src1.jpg', 'alt1', 'id1');
      const img2 = new globalImg('src2.jpg', 'alt2', 'id2');

      service.addGlobalImage(img1);
      service.addGlobalImage(img2);

      service.removeGlobalImage('id1');
      const images = service.getGlobalImages();
      expect(images.length).toBe(1);
      expect(images[0]).toEqual(img2);
    });
  });

  describe('Grid Images', () => {
    it('should add a grid image', () => {
      const gImg = new globalImg('highRes.jpg', 'alt');
      const img = new gridImg(gImg, 0, 0, 2, 2);

      service.addGridImage(img);
      const images = service.getGridImages();
      expect(images.length).toBe(1);
      expect(images[0]).toEqual(img);
    });

    it('should set grid images', () => {
      const gImg = new globalImg('highRes.jpg', 'alt');
      const img1 = new gridImg(gImg, 0, 0, 1, 1);
      const img2 = new gridImg(gImg, 1, 1, 2, 2);

      service.setGridImages([img1, img2]);
      const images = service.getGridImages();
      expect(images.length).toBe(2);
      expect(images).toContain(img1);
      expect(images).toContain(img2);
    });

    it('should remove a grid image by id', () => {
      const gImg = new globalImg('highRes.jpg', 'alt');
      const img1 = new gridImg(gImg, 0, 0, 1, 1, undefined, 'id1');
      const img2 = new gridImg(gImg, 1, 1, 2, 2, undefined, 'id2');

      service.addGridImage(img1);
      service.addGridImage(img2);

      service.removeGridImage('id1');
      const images = service.getGridImages();
      expect(images.length).toBe(1);
      expect(images[0]).toEqual(img2);
    });

    it('should clear selected grid image if removed', () => {
      const gImg = new globalImg('highRes.jpg', 'alt');
      const img = new gridImg(gImg, 0, 0, 1, 1, undefined, 'id1');

      service.addGridImage(img);
      service.setSelectedGridImage(img);

      service.removeGridImage('id1');

      service.selectedGridImage$.subscribe(selected => {
        expect(selected).toBeNull();
      });
    });
  });

  describe('Selected Grid Image', () => {
    it('should set a selected grid image', () => {
      const gImg = new globalImg('highRes.jpg', 'alt');
      const img = new gridImg(gImg, 0, 0, 1, 1);

      service.setSelectedGridImage(img);

      service.selectedGridImage$.subscribe(selected => {
        expect(selected).toEqual(img);
      });
    });

    it('should reset the selected grid image', () => {
      const gImg = new globalImg('highRes.jpg', 'alt');
      const img = new gridImg(gImg, 0, 0, 1, 1);

      service.setSelectedGridImage(img);
      service.setSelectedGridImage(null);

      service.selectedGridImage$.subscribe(selected => {
        expect(selected).toBeNull();
      });
    });
  });
});
