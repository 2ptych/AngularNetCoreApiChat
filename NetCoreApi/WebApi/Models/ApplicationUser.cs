using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WebApi.Models
{
    public class ApplicationUser : IdentityUser
    {
        public string Photo { get; set; }
        public string Name { get; set; }
        public string FamilyName { get; set; }
        public ICollection<ApplicationUserChat> AppUserChatContacts { get; set; }
        public ICollection<ApplicationUserChat> AppUserChatShitList { get; set; }
        public ApplicationUser()
        {
            AppUserChatContacts = new List<ApplicationUserChat>();
            AppUserChatShitList = new List<ApplicationUserChat>();
        }
    }
}
