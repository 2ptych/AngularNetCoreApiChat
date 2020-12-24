
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
    public class ShrinkChat
    {
        public string UserId;
        public string ChatId;
        public string Title;
        public string ChatImage;
    }

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
            var serialUser = JsonConvert.SerializeObject(new ShrinkChat
            {
                UserId = loggedUser.Id.ToString(),
                ChatImage = loggedUser.Photo,
                Title = loggedUser.Name + ' ' + loggedUser.FamilyName
            });
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

        public async Task SendMessage(MessageModel message)
        {
            Chat newChat;
            // если id не является Id чата, то создаем новый
            // чат(диалог), в который добавляем пользователей
            // этот момент надо переделать
            // так как даже теоретически есть вероятность
            // что guid сгенерируется одинаковый
            if (!(IsChat(Guid.Parse(message.Reciever))))
            {
                var recieverUser = await GetUserByIdAsync(message.Reciever);
                var currentUser = await GetUserByIdAsync(Context.UserIdentifier);
                newChat = new Chat(Chat.ChatType.Dialog, "") 
                {
                    ChatImage = ""
                };
                repository.AddChat(newChat);
                repository.AddUserInChat(recieverUser, newChat);
                repository.AddUserInChat(currentUser, newChat);
                // подмена id юзера-получателя на id созданного чата
                message.Reciever = newChat.Id.ToString();
                if (message.Reciever == null) throw new ArgumentNullException("Reciever cannot be null");
                // вернуть Id нового чата
                await Clients.Caller.SendAsync("UpdateForNewChat", newChat.Id);
                
                await Clients.User(recieverUser.Id).SendAsync("GetNewChat", newChat);
            }
            repository.AddMessage(message);
            List<ApplicationUser> users = await GetUsersJoinedInChatByIdAsync(message.Reciever);
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
