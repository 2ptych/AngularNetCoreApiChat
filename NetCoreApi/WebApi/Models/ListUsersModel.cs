using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WebApi.Models
{
    public class ListUsersModel
    {
        public string Name { get; set; }
        public string FamilyName { get; set; }
        public string UserId { get; set; }
        public string UserPhoto { get; set; }

    }
}
