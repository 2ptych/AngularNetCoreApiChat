using System;

namespace WebApi.Models
{
    public class ShrinkMessageModel
    {
        public string Sender { get; set; }
        public string RecieverChatId { get; set; }
        public string RecieverUserId { get; set; }
        public string Text { get; set; }
        public DateTime Date { get; set; }
    }
}
