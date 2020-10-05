using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NetCoreApi.Models
{
    public class ImageModel
    {
        public string Id { get; set; }
        public DateTime CreationTime { get; set; }
        public string Name { get; set; }
        public bool Temp { get; set; }
    }
}
