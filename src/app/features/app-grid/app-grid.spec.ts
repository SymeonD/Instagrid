import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppGrid } from './app-grid';
import { AppControllerService } from '../../core/services/app-controller.service';
import { ImageProcessingService } from '../../core/services/image-processing-service';
import { BehaviorSubject } from 'rxjs';
import { gridImg } from '../../core/models/grid-img-class';
import { globalImg } from '../../core/models/global-img-class';
import { KtdGridComponent, KtdGridModule } from '@katoid/angular-grid-layout';
import { CommonModule } from '@angular/common';

// 🧩 Create service mocks
class MockAppControllerService {
  gridImages$ = new BehaviorSubject<gridImg[]>([]);
  selectedGridImage$ = new BehaviorSubject<gridImg | null>(null);
  removeGridImage = jasmine.createSpy('removeGridImage');
  setGridImages = jasmine.createSpy('setGridImages');
  setSelectedGridImage = jasmine.createSpy('setSelectedGridImage');
}

class MockImageProcessingService {
  cropImage = jasmine.createSpy('cropImage').and.returnValue(Promise.resolve('croppedBase64'));
}

describe('AppGrid', () => {
  let component: AppGrid;
  let fixture: ComponentFixture<AppGrid>;
  let mockAppController: MockAppControllerService;
  let mockImageProcessing: MockImageProcessingService;

  beforeEach(async () => {
    mockAppController = new MockAppControllerService();
    mockImageProcessing = new MockImageProcessingService();

    await TestBed.configureTestingModule({
      imports: [CommonModule, KtdGridModule, AppGrid],
      providers: [
        { provide: AppControllerService, useValue: mockAppController },
        { provide: ImageProcessingService, useValue: mockImageProcessing }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppGrid);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ✅ Basic creation test
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ✅ Test layout subscription
  it('should subscribe to grid images and update layout', () => {
    const img = new gridImg(new globalImg('src', 'alt'), 0, 0, 1, 1);
    mockAppController.gridImages$.next([img]);

    expect(component.layout.length).toBe(1);
    expect(component.layout[0]).toEqual(img);
  });

  // ✅ Test addItemToLayout()
  it('should add an item to the layout', () => {
    const item = new gridImg(new globalImg('src', 'alt'), 0, 0, 1, 1);
    component.layout = [];
    component.addItemToLayout(item);
    expect(component.layout).toContain(item);
  });

  // ✅ Test isItemSelected()
  it('should correctly identify selected items', () => {
    component.selectedItems = ['abc'];
    const mockItem = { id: 'abc' } as any;
    expect(component.isItemSelected(mockItem)).toBeTrue();
  });

  // ✅ Test getGridHeight()
  it('should calculate correct grid height', () => {
    component.rowHeight = 100;
    component.layout = [
      new gridImg(new globalImg('src', 'alt'), 0, 0, 1, 2),
      new gridImg(new globalImg('src', 'alt'), 0, 3, 1, 2)
    ];
    const height = component.getGridHeight();
    // max y+h = 5 → (5+1)*100 = 600
    expect(height).toBe(600);
  });

  // ✅ Test onResizeEnded()
  it('should update layout and call cropImage on resize end', async () => {
    const item = new gridImg(new globalImg('src', 'alt'), 0, 0, 1, 1, undefined, 'item1');
    component.layout = [item];

    const event = {
      layoutItem: { id: 'item1', w: 2, h: 2 }
    } as any;

    await component.onResizeEnded(event);

    expect(mockImageProcessing.cropImage).toHaveBeenCalled();
    expect(mockAppController.setGridImages).toHaveBeenCalled();
  });

  // ✅ Test handleKeyDown() delete behavior
  it('should delete selected items when pressing Delete key', () => {
    component.selectedItems = ['id1', 'id2'];
    const event = new KeyboardEvent('keydown', { key: 'Delete' });

    component.handleKeyDown(event);
    expect(mockAppController.removeGridImage).toHaveBeenCalledWith('id1');
    expect(mockAppController.removeGridImage).toHaveBeenCalledWith('id2');
  });

  // ✅ Test pointerDownItemSelection()
  it('should select item and notify service on click', () => {
    const selected = new gridImg(new globalImg('src', 'alt'), 0, 0, 1, 1, undefined, 'id1');
    const event = new MouseEvent('mousedown', { button: 0 });

    component.pointerDownItemSelection(event, selected);
    expect(component.selectedItems).toEqual(['id1']);
    expect(mockAppController.setSelectedGridImage).toHaveBeenCalledWith(selected);
  });

  // ✅ Test pointerUpItemSelection() with ctrl
  it('should add item to selection when ctrl key is pressed', () => {
    const selected = { id: 'id2' } as any;
    component.selectedItems = ['id1'];
    const event = new MouseEvent('mouseup', { ctrlKey: true, button: 0 });

    component.pointerUpItemSelection(event, selected);
    expect(component.selectedItems).toContain('id2');
  });

  // ✅ Test onGridClick()
  it('should clear selection and reset selected image when clicking empty grid', () => {
    component.selectedItems = ['id1'];
    const event = new MouseEvent('click');
    Object.defineProperty(event, 'target', { value: document.createElement('ktd-grid') });

    component.onGridClick(event);
    expect(component.selectedItems.length).toBe(0);
    expect(mockAppController.setSelectedGridImage).toHaveBeenCalledWith(null);
  });
});
