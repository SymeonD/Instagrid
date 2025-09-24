import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RightColumn } from './right-column';

describe('RightColumn', () => {
  let component: RightColumn;
  let fixture: ComponentFixture<RightColumn>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RightColumn]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RightColumn);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
