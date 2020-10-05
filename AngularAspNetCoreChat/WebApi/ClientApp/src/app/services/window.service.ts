import { Injectable, Inject } from "@angular/core";
import { Observable, BehaviorSubject } from "rxjs";

export class WindowSize {
  public width: number;
  public height: number;

  public constructor(init?: Partial<WindowSize>) {
    Object.assign(this, init);
  }
}

// сервис для получения разрешения экрана
@Injectable()
export class WindowService {

  readonly windowSizeChanged = new BehaviorSubject<WindowSize>({
    width: this.window.innerWidth,
    height: this.window.innerHeight
  })

  constructor(@Inject('windowObject') private window: Window) {
    Observable.fromEvent(window, 'resize')
      .auditTime(100)
      .map(event => {
        return new WindowSize({
          width: event['currentTarget'].innerWidth,
          height: event['currentTarget'].innerHeight
        });
      })
      .subscribe((windowSize) => {
        this.windowSizeChanged.next(windowSize);
      });
  }
}
