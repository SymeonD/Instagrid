import { TestBed } from '@angular/core/testing';
import { MainLayout } from './main-layout';

describe('MainLayout', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainLayout],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(MainLayout);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

});
