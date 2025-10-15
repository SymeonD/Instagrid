import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RightColumn } from './right-column';
import { AppControllerService } from '../shared/app-controller.service';
import { BehaviorSubject } from 'rxjs';
import { globalImg } from '../shared/global-img-class';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';

describe('RightColumn', () => {
  let component: RightColumn;
  let fixture: ComponentFixture<RightColumn>;
  let mockAppControllerService: any;
  let globalImagesSubject: BehaviorSubject<globalImg[]>;

  beforeEach(async () => {
    globalImagesSubject = new BehaviorSubject<globalImg[]>([]);
    mockAppControllerService = {
      globalImages$: globalImagesSubject.asObservable(),
      addGlobalImage: jasmine.createSpy('addGlobalImage')
    };

    await TestBed.configureTestingModule({
      imports: [CommonModule, MatIcon, RightColumn],
      providers: [
        { provide: AppControllerService, useValue: mockAppControllerService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RightColumn);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should subscribe to globalImages$ and update columns', () => {
    const images = [
      new globalImg('img1.png', 'Image 1'),
      new globalImg('img2.png', 'Image 2'),
      new globalImg('img3.png', 'Image 3')
    ];

    globalImagesSubject.next(images);
    fixture.detectChanges();

    expect(component.images.length).toBe(3);
    expect(component.columns[0].length + component.columns[1].length).toBe(3);
  });

  it('should open and close the import prompt', () => {
    const testImage = new globalImg('imgX.png', 'Test Image');

    (component as any).openImportPrompt(testImage);
    expect(component.showImportPrompt).toBeTrue();
    expect(component.modalImage).toBe(testImage);

    (component as any).closeImportPrompt();
    expect(component.showImportPrompt).toBeFalse();
    expect(component.modalImage).toBeNull();
  });
});
