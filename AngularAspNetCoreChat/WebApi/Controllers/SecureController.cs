using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace NetCoreApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SecureController : ControllerBase
    {
        [HttpGet, Authorize]
        public IEnumerable<string> Get()
        {
            return new string[] { "The Secret One", "value2" };
        }
    }
}
