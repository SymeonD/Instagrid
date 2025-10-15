import { TestBed, ComponentFixture } from '@angular/core/testing';
import { LeftColumn } from './left-column';
import { AppControllerService } from '../shared/app-controller.service';
import { ImageProcessingService } from '../shared/image-processing-service';
import { gridImg } from '../shared/grid-img-class';
import { of } from 'rxjs';

describe('LeftColumn', () => {
  let component: LeftColumn;
  let fixture: ComponentFixture<LeftColumn>;
  let appControllerService: jasmine.SpyObj<AppControllerService>;
  let imageProcessing: jasmine.SpyObj<ImageProcessingService>;

  const mockGridImage = new gridImg(
    { highResSrc: 'high.jpg', alt: 'test', id: '1', lowResSrc: 'low.jpg' },
    0, 0, 2, 2
  );

  beforeEach(async () => {
    const appControllerSpy = jasmine.createSpyObj('AppControllerService', [
      'removeGridImage',
      'setSelectedGridImage'
    ]);
    Object.defineProperty(appControllerSpy, 'selectedGridImage$', {
      get: () => of(mockGridImage)
    });

    const imageProcessingSpy = jasmine.createSpyObj('ImageProcessingService', [
      'cropImage',
      'divideImage',
      'createZip'
    ]);

    await TestBed.configureTestingModule({
      imports: [LeftColumn], // Standalone component
      providers: [
        { provide: AppControllerService, useValue: appControllerSpy },
        { provide: ImageProcessingService, useValue: imageProcessingSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LeftColumn);
    component = fixture.componentInstance;
    appControllerService = TestBed.inject(AppControllerService) as jasmine.SpyObj<AppControllerService>;
    imageProcessing = TestBed.inject(ImageProcessingService) as jasmine.SpyObj<ImageProcessingService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set selectedImage from AppControllerService', () => {
    expect(component.selectedImage).toEqual(mockGridImage);
  });

  it('should delete the selected image', () => {
    component['deleteImage'](); // protected method accessed via bracket notation
    expect(appControllerService.removeGridImage).toHaveBeenCalledWith(mockGridImage.id);
    expect(component.selectedImage).toBeNull();
  });

  it('should download image as zip', async () => {
    const mockCropped = 'cropped-src';
    const mockDivided = ['part1', 'part2'];
    const mockBlob = new Blob(['zip'], { type: 'application/zip' });

    imageProcessing.cropImage.and.returnValue(Promise.resolve(mockCropped));
    imageProcessing.divideImage.and.returnValue(Promise.resolve(mockDivided));
    imageProcessing.createZip.and.returnValue(Promise.resolve(mockBlob));

    // Spy on URL.createObjectURL and revokeObjectURL
    spyOn(window.URL, 'createObjectURL').and.returnValue('blob-url');
    spyOn(window.URL, 'revokeObjectURL');

    // Spy on anchor click
    const clickSpy = jasmine.createSpy('click');
    spyOn(document, 'createElement').and.callFake((tag: string) => {
      if (tag === 'a') {
        return { href: '', download: '', click: clickSpy } as any;
      }
      return document.createElement(tag);
    });

    await component['downloadImage']();

    expect(imageProcessing.cropImage).toHaveBeenCalledWith(mockGridImage, false);
    expect(imageProcessing.divideImage).toHaveBeenCalledWith(mockCropped, mockGridImage.w, mockGridImage.h);
    expect(imageProcessing.createZip).toHaveBeenCalledWith(mockDivided);
    expect(clickSpy).toHaveBeenCalled();
    expect(window.URL.revokeObjectURL).toHaveBeenCalledWith('blob-url');
  });
});
