import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { globalImg } from '../../core/models/global-img-class';

@Injectable({ providedIn: 'root' })
export class ImportPromptService {
  private _modalOpen = new BehaviorSubject<boolean>(false);
  private _modalImage = new BehaviorSubject<globalImg | null>(null);
  modalOpen$ = this._modalOpen.asObservable();
  modalImage$ = this._modalImage.asObservable();

  private resolveCallback?: (added: boolean) => void;
  private added = false;

  private open() { this._modalOpen.next(true); }
  private close() { this._modalOpen.next(false); }

  openImportPrompt(image: globalImg) {
    this._modalImage.next(image);
    this.open();
  }

  closeImportPrompt() {
    this.close();
    this._modalImage.next(null);
    if (this.resolveCallback) {
      this.resolveCallback(this.added);
      this.resolveCallback = undefined;
    }
  }
}
