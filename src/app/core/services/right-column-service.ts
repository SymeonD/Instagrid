import { Inject, Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({ providedIn: 'root' })
export class RightColumnService {
  private openState = new BehaviorSubject<boolean>(false);
  openState$ = this.openState.asObservable();

  open() { this.openState.next(true); }
  close() { this.openState.next(false); }
  toggle() { this.openState.next(!this.openState.value); }
}