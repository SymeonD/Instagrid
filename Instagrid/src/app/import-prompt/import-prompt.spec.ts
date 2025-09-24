import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportPrompt } from './import-prompt';

describe('ImportPrompt', () => {
  let component: ImportPrompt;
  let fixture: ComponentFixture<ImportPrompt>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImportPrompt]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImportPrompt);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
