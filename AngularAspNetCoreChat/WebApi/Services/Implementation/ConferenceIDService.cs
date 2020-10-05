using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using NetCoreApi.Data;
using NetCoreApi.Models;

namespace NetCoreApi.Services
{
    public class ConferenceIDService : IConferenceId
    {
        private readonly DbContextIdentity dbContextData;
        private IConfiguration Configuration { get; }
        public ConferenceIDService(DbContextIdentity _dbContextData,
                                   IConfiguration _configuration)
        {
            dbContextData = _dbContextData;
            Configuration = _configuration;
        }
        public Chat GetConferenceId()
        {
            string confName = Configuration["UsersConference:Title"];
            if (confName == null) throw new ArgumentNullException("Value cannot be null");
            // пока прямой запрос, переделать на репозиторий
            return dbContextData.Chat.Where(x => x.Title == confName).FirstOrDefault();
        }
    }
}
