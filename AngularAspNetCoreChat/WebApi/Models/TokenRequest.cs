using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NetCoreApi.Models
{
    public class TokenRequest
    { 
        public string AccessToken { get; set; }
        //public string Expiration { get; set; }

        public TokenRequest(string accessToken/*, string expiration*/)
        {
            AccessToken = accessToken;
            //Expiration = expiration;
        }
    }
}
