import {
  Directive,
  ElementRef,
  Renderer2,
  HostListener,
  Output,
  EventEmitter
} from "@angular/core";

@Directive({
  selector: '[DragNDrop]'
})
export class DragNDropDirective {
  @Output() fileDropped = new EventEmitter();

  constructor(private elementRef: ElementRef, private renderer: Renderer2) { }

  @HostListener('dragover', ['$event']) onDragOver(evt) {
    this.preventDefault(evt);
    this.renderer.addClass(this.elementRef.nativeElement, 'on-drag-over');
    //console.log('DragOver');
  }

  @HostListener('dragleave', ['$event']) public onDragLeave(evt) {
    this.preventDefault(evt);
    this.renderer.removeClass(this.elementRef.nativeElement, 'on-drag-over');
    //console.log('DragLeave');
  }

  @HostListener('drop', ['$event']) public onDrop(evt) {
    this.preventDefault(evt);
    const files = evt.dataTransfer.files;
    //console.log(`Вы перетащили ${files.length} файлов`);
    this.fileDropped.emit(files);
  }

  preventDefault(event) {
    event.preventDefault();
    event.stopPropagation()
  }
}
