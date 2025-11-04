import { TestBed } from '@angular/core/testing';
import { AppControllerService } from './app-controller.service';
import { globalImg } from '../../core/models/global-img-class';
import { gridImg } from '../../core/models/grid-img-class';
import { ImageProcessingService } from './image-processing-service';
import { firstValueFrom } from 'rxjs';

describe('AppControllerService', () => {
  let service: AppControllerService;
  let imageProcessingSpy: jasmine.SpyObj<ImageProcessingService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('ImageProcessingService', ['createLowResImage']);
    TestBed.configureTestingModule({
      providers: [
        AppControllerService,
        { provide: ImageProcessingService, useValue: spy }
      ]
    });

    service = TestBed.inject(AppControllerService);
    imageProcessingSpy = TestBed.inject(ImageProcessingService) as jasmine.SpyObj<ImageProcessingService>;
    imageProcessingSpy.createLowResImage.and.callFake(async (src: string) => `low-${src}`);
  });

  describe('Global Images', () => {
    it('should add a global image', async () => {
      const img = new globalImg('highRes.jpg', 'alt text', imageProcessingSpy);
      // Wait for lowResSrc to resolve
      await Promise.resolve();

      service.addGlobalImage(img);
      const images = service.getGlobalImages();
      expect(images.length).toBe(1);
      expect(images[0]).toEqual(img);
      expect(images[0].lowResSrc).toBe('low-highRes.jpg');
    });

    it('should remove a global image by id', () => {
      const img1 = new globalImg('src1.jpg', 'alt1', undefined, 'id1');
      const img2 = new globalImg('src2.jpg', 'alt2', undefined, 'id2');

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

    it('should clear selected grid image if removed', (done) => {
      const gImg = new globalImg('highRes.jpg', 'alt');
      const img = new gridImg(gImg, 0, 0, 1, 1, undefined, 'id1');

      service.addGridImage(img);
      service.setSelectedGridImage(img);

      service.selectedGridImage$.subscribe(selected => {
        if (selected === null) {
          expect(selected).toBeNull();
          done();
        }
      });

      service.removeGridImage('id1');
    });
  });

  describe('Selected Grid Image', () => {
    it('should set a selected grid image', async() => {
        const gImg = new globalImg('highRes.jpg', 'alt');
        const img = new gridImg(gImg, 0, 0, 1, 1);

        service.setSelectedGridImage(img);

        const selected = await firstValueFrom(service.selectedGridImage$); // <-- direct access
        expect(selected).toEqual(img);
    });

    it('should reset the selected grid image', async() => {
      const gImg = new globalImg('highRes.jpg', 'alt');
        const img = new gridImg(gImg, 0, 0, 1, 1);

        service.setSelectedGridImage(img);
        service.setSelectedGridImage(null);

        const selected = await firstValueFrom(service.selectedGridImage$);
        expect(selected).toBeNull();
    });
  });
});
