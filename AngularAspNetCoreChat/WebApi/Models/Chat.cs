using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace NetCoreApi.Models
{
    public class Chat
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid Id { get; set; }
        public ChatType Type { get; set; }
        public string Title { get; set; }
        public string ChatImage { get; set; }
        public DateTime Created { get; set; }
        public ICollection<ApplicationUserChat> AppUserChat { get; set; }

        public enum ChatType
        {
            Dialog,
            Conference
        }
        public Chat(ChatType type, string title)
        {
            AppUserChat = new List<ApplicationUserChat>();
            Type = type;
            Title = title;
            Created = DateTime.Now;
        }
        public Chat()
        {
            AppUserChat = new List<ApplicationUserChat>();
        }
    }
}
