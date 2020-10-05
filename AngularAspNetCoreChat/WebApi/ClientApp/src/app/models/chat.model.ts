export class ChatModel {
  // если пользователь ищет собеседника и между ними еще нет чата,
  // то поле chatId остается пустым, а в поле userId будет добавлен id
  // пользователя
  title: string;
  // id пользователя
  userId: string;
  chatImage: string;
  // id чата
  chatId: string;

  constructor(_title: string, _userId: string, _chatImage: string, _chatId: string) {
    this.title = _title;
    this.userId = _userId;
    this.chatImage = _chatImage;
    this.chatId = _chatId;
  }
}
