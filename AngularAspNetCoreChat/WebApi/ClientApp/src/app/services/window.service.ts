import { Injectable, Inject } from "@angular/core";
import { BehaviorSubject, Observable, fromEvent, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

// сервис для получения разрешения экрана
@Injectable()
export class WindowService {

  resizeObservable: Observable<Event>;
  resizeSubscription: Subscription;

  /*readonly windowSizeChanged = new BehaviorSubject<WindowSize>({
    width: this.window.innerWidth,
    height: this.window.innerHeight
  })*/

  //ngOnIn

  /*constructor(@Inject('windowObject') private window: Window) {
    this.resizeObservable = fromEvent(window, 'resize');
    this.resizeSubscription = this.resizeObservable.pipe(tap(event => {
      new WindowSize({
        width:event['currentTarget'].innerHeight
      });
    })).subscribe(event => {});
  }*/
}
