import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { globalImg } from '../../core/models/global-img-class';

@Injectable({ providedIn: 'root' })
export class ImportPromptService {
  private _modalOpen = new BehaviorSubject<boolean>(false);
  private _modalImage = new BehaviorSubject<globalImg | null>(null);
  modalOpen$ = this._modalOpen.asObservable();
  modalImage$ = this._modalImage.asObservable();

  private open() { this._modalOpen.next(true); }
  private close() { this._modalOpen.next(false); }

  openImportPrompt(image: globalImg) {
    this._modalImage.next(image);
    this.open();

    console.log(image);
  }

  closeImportPrompt() {
    this.close();
    this._modalImage.next(null);
  }
}
