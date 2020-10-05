using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NetCoreApi.Models
{
    public class ApplicationUser : IdentityUser
    {
        public string Photo { get; set; }
        public string Name { get; set; }
        public string FamilyName { get; set; }
        public ICollection<ApplicationUserChat> AppUserChat { get; set; }
        public ApplicationUser()
        {
            AppUserChat = new List<ApplicationUserChat>();
        }
    }
}
