import { Injectable } from "@angular/core";
import { Subject, Observable } from "rxjs";
import { NotificationModel, NoteType } from "../models/notification.model";

@Injectable()
export class NotificationService {
  private subject = new Subject<NotificationModel>();

  onNotify(): Observable<NotificationModel> {
    return this.subject.asObservable().pipe();
  }

  info(note: string) {
    this.note(new NotificationModel({ message: note, type: NoteType.Info }))
  }

  success(note: string) {
    this.note(new NotificationModel({ message: note, type: NoteType.Success }))
  }

  error(note: string) {
    this.note(new NotificationModel({ message: note, type: NoteType.Error }))
  }

  warning(note: string) {
    this.note(new NotificationModel({ message: note, type: NoteType.Warning }))
  }

  messageNote(note: string) {
    this.note(new NotificationModel({ message: note, type: NoteType.Warning }))
  }

  private note(newNote: NotificationModel) {
    this.subject.next(newNote);
  }

  clear() {
    this.subject.next(new NotificationModel())
  }
}
