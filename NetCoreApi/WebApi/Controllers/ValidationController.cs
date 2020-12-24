using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using WebApi.Models;

namespace WebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ValidationController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;

        public ValidationController(UserManager<ApplicationUser> userManager)
        {
            _userManager = userManager;
        }

        public class UserEmail
        {
            public string Email { get; set; }
        }

        [AllowAnonymous]
        [HttpPost, Route("ValidationUserEmail")]
        public async Task<object> ValidationEmail(UserEmail email)
        {
            IdentityUser user = await _userManager.FindByEmailAsync(email.Email);
            if (user != null) return new { userEmailExist = true };
            return new { userEmailExist = false };
        }
    }
}
