export class WindowSize {
  public width: number;
  public height: number;

  public constructor(init?: Partial<WindowSize>) {
    Object.assign(this, init);
  }
}
