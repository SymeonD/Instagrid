import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImportPrompt } from './import-prompt';
import { AppControllerService } from '../shared/app-controller.service';
import { ImageProcessingService } from '../shared/image-processing-service';
import { gridImg } from '../shared/grid-img-class';
import { globalImg } from '../shared/global-img-class';
import { BehaviorSubject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';

class MockAppControllerService {
  globalImages$ = new BehaviorSubject<globalImg[]>([]);
  removeGlobalImage = jasmine.createSpy('removeGlobalImage');
  addGridImage = jasmine.createSpy('addGridImage');
}

class MockImageProcessingService {
  cropImage = jasmine.createSpy('cropImage').and.returnValue(Promise.resolve('croppedBase64String'));
}

describe('ImportPrompt', () => {
  let component: ImportPrompt;
  let fixture: ComponentFixture<ImportPrompt>;
  let mockAppController: MockAppControllerService;
  let mockImageProcessing: MockImageProcessingService;

  beforeEach(async () => {
    mockAppController = new MockAppControllerService();
    mockImageProcessing = new MockImageProcessingService();

    await TestBed.configureTestingModule({
      imports: [ImportPrompt, CommonModule, MatIcon],
      providers: [
        { provide: AppControllerService, useValue: mockAppController },
        { provide: ImageProcessingService, useValue: mockImageProcessing }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ImportPrompt);
    component = fixture.componentInstance;
    component.image = new globalImg('highres.jpg', 'alt');
    fixture.detectChanges();
  });

  // ✅ Basic creation
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // ✅ ngOnChanges should trigger cropping
  it('should crop image when input changes', async () => {
    await component.ngOnChanges();
    expect(mockImageProcessing.cropImage).toHaveBeenCalled();
    expect(component.croppedImageSrc).toBe('croppedBase64String');
  });

  // ✅ onPlaceholderHover should update hoveredSize
  it('should update hoveredSize when hovering a placeholder', () => {
    component.onPlaceholderHover(2);
    expect((component as any).hoveredSize).toBe(3);
  });

  // ✅ isDarkened should depend on hoveredSize mapping
  it('should return true for darkened indices when hovered', () => {
    (component as any).hoveredSize = 3; // indexes 0,1,2 active
    expect(component.isDarkened(1)).toBeTrue();
    expect(component.isDarkened(5)).toBeFalse();
  });

  // ✅ isSelected should depend on selectedSize mapping
  it('should return true for selected indices when selected', () => {
    (component as any).selectedSize = 2; // indexes 0,1 active
    expect(component.isSelected(0)).toBeTrue();
    expect(component.isSelected(3)).toBeFalse();
  });

  // ✅ onPlaceholderClick should lock selectedSize and crop again
  it('should update selectedSize and crop image on click', async () => {
    await component.onPlaceholderClick(2);
    expect((component as any).selectedSize).toBe(3);
    expect(mockImageProcessing.cropImage).toHaveBeenCalled();
  });

  // ✅ deleteImage should call removeGlobalImage and emit close
  it('should delete image and emit close', () => {
    spyOn(component.close, 'emit');
    component.image = new globalImg('src', 'alt');
    component.image.id = 'img123';

    (component as any).deleteImage();

    expect(mockAppController.removeGlobalImage).toHaveBeenCalledWith('img123');
    expect(component.close.emit).toHaveBeenCalled();
  });

  // ✅ closePrompt should emit close event
  it('should emit close event when closing prompt', () => {
    spyOn(component.close, 'emit');
    component.closePrompt();
    expect(component.close.emit).toHaveBeenCalled();
  });

  // ✅ sendImage should add cropped image to grid and emit close
  it('should send image to grid and emit close', () => {
    spyOn(component.close, 'emit');
    component.croppedImageSrc = 'mockSrc';
    component.image = new globalImg('src', 'alt');

    component.sendImage();

    expect(mockAppController.addGridImage).toHaveBeenCalled();
    expect(component.close.emit).toHaveBeenCalled();
  });

  // ✅ sendImage should not send if croppedImageSrc is empty
  it('should not send if croppedImageSrc is empty', () => {
    component.croppedImageSrc = '';
    component.sendImage();
    expect(mockAppController.addGridImage).not.toHaveBeenCalled();
  });
});
