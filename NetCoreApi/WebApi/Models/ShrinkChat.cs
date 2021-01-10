using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WebApi.Models
{
    public class ShrinkChat
    {
        // класс, содержащий необходимую информацию для фронтенда
        public string UserId { get; set; }
        public string ChatId { get; set; }
        public string Title { get; set; }
        public string ChatImage { get; set; }
    }
}
