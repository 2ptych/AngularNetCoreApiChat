using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NetCoreApi.Models
{
    public interface IRepository
    {
        Task<ApplicationUser> SearchUserByEmailAsync(string email);
        Task<ApplicationUser> FindUserByNameAsync(string email);
        void AddUserInChat(ApplicationUser user, Chat commonChat);
    }
}
