using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Threading.Tasks;
using WebApi.Data;

namespace WebApi.Models
{
    public class Repository : IRepository
    {
        private DbContextIdentity dbContext;
        private readonly UserManager<ApplicationUser> userManager;
        public Repository(DbContextIdentity _context,
            UserManager<ApplicationUser> _userManager)
        {
            dbContext = _context;
            userManager = _userManager;
        }

        public async Task<ApplicationUser> GetUserByIdAsync(string id)
        {
            var currentUser = userManager.Users
                .Where(param => param.Id == id).FirstOrDefault();
            if (currentUser == null) throw new ArgumentNullException("Текущий пользователь не может быть null");
            return currentUser;
        }

        public async Task<List<ApplicationUser>> SearchUsersByEmailAsync(string searchStr, ApplicationUser currentUser)
        {
            // получаем диалоги пользователя 
            var userСhats = GetDialogsUserJoinedInAsync(currentUser.Id);
            // получаем собеседников, которые есть у пользователя
            // в виде чатов (собеседники)
            List<ApplicationUser> usersJoinedInChat = new List<ApplicationUser>();
            foreach (var chat in await userСhats)
            {
                usersJoinedInChat.Add(GetCorrespondentInDialog(currentUser, chat));
            }
            var users = userManager.Users
                .Where(user => user.Email.Contains(searchStr)).ToList();

            ApplicationUser tmp = new ApplicationUser();
            foreach (var user in usersJoinedInChat)
            {
                tmp = users.Find(x => x.Id == user.Id);
                if (tmp != null) users.Remove(tmp);
            }

            return users;
        }

        private ApplicationUser GetCorrespondentInDialog(ApplicationUser user, Chat chat)
        {
            if (chat.Type == Chat.ChatType.Dialog)
            {
                var appUserChat = dbContext.AppUserChat
                .Where(opt => (opt.ApplicationUserId != user.Id) && (opt.Chat.Id == chat.Id))
                .Include(p => p.ApplicationUser).FirstOrDefault();
                return appUserChat.ApplicationUser;
            }
            else throw new ArgumentException("Указанный чат не является диалогом");
        }

        public async Task<ApplicationUser> SearchUserByEmailAsync(string email)
        {
            var user = userManager.Users
                .Where(user => user.Email == email).FirstOrDefault();
            return user;
        }

        public async Task<ApplicationUser> FindUserByNameAsync(string email)
        {
            return await userManager.FindByNameAsync(email);
        }

        public void AddUserInChat(ApplicationUser user, Chat chat)
        {
            var userChat = new ApplicationUserChat 
            { 
                ApplicationUserId = user.Id,
                ChatId = chat.Id 
            };
            dbContext.AppUserChat.Add(userChat);
            dbContext.SaveChanges();
        }

        public void AddChat(Chat chat)
        {
            dbContext.Chat.Add(chat);
            dbContext.SaveChanges();
        }

        public Chat GetChatById(Guid id)
        {
            return dbContext.Set<Chat>().Where(opt => opt.Id == id).FirstOrDefault();
        }

        public void AddMessage(MessageModel message)
        {
            dbContext.Messages.Add(message);
            dbContext.SaveChanges();
        }

        // получить участников чата
        public async Task<List<ApplicationUser>> GetUsersJoinedInChatAsync(Guid chatId)
        {
            var chatsUsers = dbContext.AppUserChat.Where(p => p.ChatId == chatId)
                .Include(k => k.ApplicationUser).ToList();
            if (chatsUsers == null) return null;
            List<ApplicationUser> users = new List<ApplicationUser>();
            foreach (var item in chatsUsers)
            {
                users.Add(item.ApplicationUser);
            }
            return users;
        }

        // получить чаты пользователя
        public async Task<List<Chat>> GetDialogsUserJoinedInAsync(string userId)
        {
            var chatsUsers =
                dbContext.AppUserChat.Where(p => p.ApplicationUserId == userId)
                .Include(k => k.Chat).ToList();
            List<Chat> chats = new List<Chat>();
            foreach (var item in chatsUsers)
            {
                if (item.Chat.Type == Chat.ChatType.Dialog) chats.Add(item.Chat);
            }
            return chats;
        }

        // получить чаты пользователя
        public async Task<List<Chat>> GetChatsUserJoinedInAsync(string userId)
        {
            var chatsUsers =
                dbContext.AppUserChat.Where(p => p.ApplicationUserId == userId)
                .Include(k => k.Chat).ToList();
            List<Chat> chats = new List<Chat>();
            foreach (var item in chatsUsers)
            {
                chats.Add(item.Chat);
            }
            return chats;
        }

        public async Task<List<MessageModel>> GetMessageHistory(string chatId)
        {
            List<MessageModel> messages = dbContext.Messages.Where(p => p.Reciever == chatId).ToList();
            var asf = new MessageComparer();
            messages.Sort(asf.Compare);
            return messages;
        }

        class MessageComparer : IComparer<MessageModel>
        {
            public int Compare(MessageModel a, MessageModel b)
            {
                return DateTime.Compare(a.Date, b.Date);
            }
        }
    }
}
