using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using NetCoreApi.Data;
using NetCoreApi.Models;

namespace NetCoreApi.Services
{
    public class ChatManager : IChatManager
    {
        private readonly DbContextIdentity context;
        public ChatManager(DbContextIdentity _context)
        {
            context = _context;
        }
        public Chat CreateConference(string title)
        {
            Chat conference = new Chat(Chat.ChatType.Conference, title);
            // заменить на репозиторий
            AddInDb(conference);

            return conference;
        }

        public Chat CreateDialog()
        {
            Chat dialog = new Chat(Chat.ChatType.Conference, null);
            // заменить на репозиторий
            AddInDb(dialog);

            return dialog;
        }

        private void AddInDb(Chat newEntity)
        {
            context.Chat.Add(newEntity);
            context.SaveChangesAsync();
        }
    }
}
