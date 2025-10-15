import { TestBed } from '@angular/core/testing';
import { ImageProcessingService } from './image-processing-service';
import { gridImg } from './grid-img-class';
import { globalImg } from './global-img-class';

describe('ImageProcessingService', () => {
  let service: ImageProcessingService;

  // A minimal 1x1 PNG to use as test image
  const tinyImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAoMBgAGJX8IAAAAASUVORK5CYII=';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ImageProcessingService]
    });
    service = TestBed.inject(ImageProcessingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('createLowResImage() should return a base64 string', async () => {
    const result = await service.createLowResImage(tinyImageData);
    expect(result.startsWith('data:image/jpeg;base64')).toBeTrue();
  });

  it('cropImage() should return a cropped base64 string', async () => {
    const gImg = new globalImg(tinyImageData, 'alt');
    const img = new gridImg(gImg, 0, 0, 1, 1);
    const result = await service.cropImage(img, false);
    expect(result.startsWith('data:image/jpeg;base64')).toBeTrue();
  });

  it('divideImage() should split an image into multiple segments', async () => {
    const segments = await service.divideImage(tinyImageData, 2, 2);
    expect(segments.length).toBe(4); // 2x2 grid
    segments.forEach(seg => {
      expect(seg.startsWith('data:image/jpeg;base64')).toBeTrue();
    });
  });

  it('createZip() should generate a Blob containing the images', async () => {
    const images = [
      'data:image/jpeg;base64,aGVsbG8=',
      'data:image/jpeg;base64,d29ybGQ='
    ];
    const blob = await service.createZip(images);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(0);
  });
});
