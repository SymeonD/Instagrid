import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeftColumn } from './left-column';

describe('LeftColumn', () => {
  let component: LeftColumn;
  let fixture: ComponentFixture<LeftColumn>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeftColumn]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeftColumn);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
