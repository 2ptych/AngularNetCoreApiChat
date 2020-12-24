using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace WebApi.Models
{
    public class MessageModel
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public string Id { get; set; }
        public string Sender { get; set; }
        public string Reciever { get; set; }
        public string Text { get; set; }
        public DateTime Date { get; set; }
    }
}
