export class MessageModel {
  sender: string;
  reciever: string;
  text: string;
  date: Date;

  constructor(_sender: string, _reciever: string, _text: string, _date: Date) {
    this.sender = _sender;
    this.reciever = _reciever;
    this.text = _text;
    this.date = _date || new Date();
  }
}
