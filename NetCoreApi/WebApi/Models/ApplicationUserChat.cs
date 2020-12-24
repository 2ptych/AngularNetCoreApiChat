using System;

namespace WebApi.Models
{
    public class ApplicationUserChat
    {
        public string ApplicationUserId { get; set; }
        public ApplicationUser ApplicationUser { get; set; }
        public Guid ChatId { get; set; }
        public Chat Chat { get; set; }
    }
}
