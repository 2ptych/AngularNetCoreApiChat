export class NotificationModel {
  message: string;
  type: NoteType;

  constructor(part?: Partial<NotificationModel>) {
    Object.assign(this, part);
  }
}

export enum NoteType {
  Success,
  Info,
  Warning,
  Error,
  MessageNote
}
