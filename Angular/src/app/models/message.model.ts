export class MessageModel {
  sender: string;
  recieverChatId: string;
  recieverUserId: string;
  text: string;
  date: Date;

  constructor(_sender: string,
              _recieverChatId: string,
              _recieverUserId: string,
              _text: string,
              _date: Date) {
    this.sender = _sender;
    this.recieverChatId = _recieverChatId;
    this.recieverUserId = _recieverUserId;
    this.text = _text;
    this.date = _date || new Date();
  }
}
