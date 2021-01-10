using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WebApi.Data;

namespace WebApi.Models
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly Repository repository;
        public ChatHub(UserManager<ApplicationUser> userManager,
                       DbContextIdentity dbContextData)
        {
            repository = new Repository(dbContextData, userManager);
        }

        public override Task OnConnectedAsync()
        {
            SendLoggedUser();
            GetUsersChatList();
            return base.OnConnectedAsync();
        }

        public async Task SendLoggedUser()
        {
            ApplicationUser loggedUser = await GetCurrentUserAsync();
            //
            var serialUser = JsonConvert.SerializeObject(new ShrinkChat
            {
                UserId = loggedUser.Id.ToString(),
                ChatImage = loggedUser.Photo,
                Title = loggedUser.Name + ' ' + loggedUser.FamilyName
            });
            //
            await Clients.Caller.SendAsync("RecieveLoggedUser", serialUser);
        }

        // поиск пользователей
        public async Task SearchUsersByString(string findStr)
        {
            if ((findStr == null) || (findStr == ""))
            {
                GetUsersChatList();
                return;
            }
            var currentUser = await GetCurrentUserAsync();
            List<ApplicationUser> users = repository.SearchUsersByEmailAsync(findStr, currentUser)
                .Result.Where(u => u.Id != currentUser.Id).ToList();
            List<ShrinkChat> shrinkUsers = new List<ShrinkChat>();
            foreach (var item in users)
            {
                shrinkUsers.Add(new ShrinkChat
                {
                    UserId = item.Id,
                    Title = string.Concat(item.Name, " ", item.FamilyName),
                    ChatImage = item.Photo
                });
            }
            string serializeUserList = JsonConvert.SerializeObject(shrinkUsers.ToArray());
            Clients.Caller.SendAsync("RecieveUsersList", serializeUserList);
        }

        private async Task<ApplicationUser> GetCurrentUserAsync()
        {
            return await GetUserByIdAsync(Context.UserIdentifier);
        }

        private async Task<ApplicationUser> GetUserByIdAsync(string id)//
        {
            var user = await repository.GetUserByIdAsync(id);
            return user;
        }

        // получение переписок пользователя
        public async Task GetUsersChatList()
        {
            ApplicationUser currentUser = await repository.GetUserByIdAsync(Context.UserIdentifier);
            ApplicationUser tmp;
            // получаем все чаты, в которых есть текущий пользователь
            //IQueryable<Chat> chats = _dbContextData.Chat
            //    .Where(p => p.Users.Contains(currentUser));
            List<Chat> chatList = await repository.GetChatsUserJoinedInAsync(currentUser.Id);
            
            // добавление в title имен собеседников для диалогов
            foreach (var chat in chatList)
            {
                if (chat.Type == Chat.ChatType.Dialog)
                {
                    tmp = repository.GetUsersJoinedInChatAsync(chat.Id)
                        .Result.Where(opt => opt.Id != Context.UserIdentifier).FirstOrDefault();
                    if (tmp == null) throw new ArgumentNullException("Dialog cannot contain one user");
                    chat.Title = tmp.Name + ' ' + tmp.FamilyName;
                    chat.ChatImage = tmp.Photo;
                }
            }
            List<ShrinkChat> shrinkChat = new List<ShrinkChat>();
            foreach (var item in chatList)
            {
                shrinkChat.Add(new ShrinkChat
                {
                    // в этом методе выгружается только уже существующие чаты,
                    // а значит будут заполняться только поля chatId
                    ChatId = item.Id.ToString(),
                    ChatImage = item.ChatImage,
                    Title = item.Title
                });
            }
            string serializeUserList = JsonConvert.SerializeObject(shrinkChat.ToArray());
            await Clients.Caller.SendAsync("RecieveUsersList", serializeUserList);
        }

        public override Task OnDisconnectedAsync(Exception exception)
        {
            return base.OnDisconnectedAsync(exception);
        }

        private MessageModel ShrinkMessageToMessage(ShrinkMessageModel shMessage)
        {
            return new MessageModel()
            {
                Date = shMessage.Date,
                Reciever = shMessage.RecieverChatId,
                Sender = shMessage.Sender,
                Text = shMessage.Text
            };
        }

        // создание нового диалога
        private Chat CreateNewDialog(List<ApplicationUser> chatMembers)
        {
            Chat newChat = new Chat(Chat.ChatType.Dialog, "")
            {
                ChatImage = ""
            };
            if (chatMembers.Count != 2)
                throw new ArgumentException("Dialog can contain only 2 members");
            repository.AddChat(newChat);
            foreach (var user in chatMembers)
            {
                repository.AddUserInChat(user, newChat);
            }
            return newChat;
        }

        /*private void AddUserInChat(ApplicationUser newUser)
        {

        }*/

        //private bool CheckDialogExistance(List<ApplicationUser> chatMembers)
        //{

        //}

        public async Task SendMessage(ShrinkMessageModel message)
        {
            // !!! проверить наличия чата между пользователями !!!
            Chat newChat;
            MessageModel newMessage;
            if (message.RecieverChatId == null)
            {
                var currentUser = await GetUserByIdAsync(Context.UserIdentifier);
                var recieverUser = await GetUserByIdAsync(message.RecieverUserId);
                // создание нового диалога 
                newChat = CreateNewDialog(
                    new List<ApplicationUser>
                    {
                        currentUser,
                        recieverUser
                    });
                if (newChat?.Id == null)
                    throw new ArgumentNullException("Error occurs while creating dialog");
                message.RecieverChatId = newChat.Id.ToString();
                // вернуть Id нового чата и id пользователя,
                // для взаимодействия с которым этот диалог создан
                //* на фронте в списке пользователей будет найден этот
                // юзер и вместо userId будет установлен chatId *
                object result =
                    JsonConvert.SerializeObject(
                        new {
                            userId = recieverUser.Id,
                            chatId = newChat.Id
                        });
                await Clients.Caller.SendAsync("UpdateForNewChat", result);
            }
            // конвертация сообщения
            newMessage = ShrinkMessageToMessage(message);
            // добавление сообщения в БД
            repository.AddMessage(newMessage);
            // формирование списка участников чата для рассылки сообщения
            List<ApplicationUser> users =
                await GetUsersJoinedInChatByIdAsync(newMessage.Reciever);
            List<string> userIds = new List<string>();
            foreach (var item in users)
            {
                userIds.Add(item.Id);
            }
            await Clients.Users(userIds).SendAsync("RecieveMessage", message);
        }

        private async Task<List<ApplicationUser>> GetUsersJoinedInChatByIdAsync(string chatId)
        {
            // проверка существования чата
            Guid chatGuid = Guid.Parse(chatId);
            Chat chat = repository.GetChatById(chatGuid);
            if (chat == null) throw new ArgumentNullException("Chat cannot be null");
            var users = repository.GetUsersJoinedInChatAsync(chatGuid);
            
            return await users;
        }

        private bool IsChat(Guid id)
        {
            var chat = repository.GetChatById(id);
            if (chat == null) return false;
            else return true;
        }

        public async Task GetMessageHistory(string chatId)
        {
            var messages = await repository.GetMessageHistory(chatId);
            await Clients.Caller.SendAsync("RecieveMessageHistory", chatId, JsonConvert.SerializeObject(messages.ToArray()));
        }
    }
}
