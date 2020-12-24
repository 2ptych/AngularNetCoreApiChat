using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using WebApi.Data;
using WebApi.Models;
using WebApi.Services;

namespace WebApi.Controllers
{
    [AllowAnonymous]
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly UserManager<ApplicationUser> _userManager;
        IConfiguration Configuration;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IConferenceId _conferenceId;
        private readonly DbContextIdentity _dbContextData;
        private readonly IRepository _repository;

        public AccountController(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            IConfiguration configuration,
            IHostingEnvironment hostingEnvironment,
            IConferenceId conferenceId,
            DbContextIdentity dbContextData,
            IRepository repository)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            Configuration = configuration;
            _hostingEnvironment = hostingEnvironment;
            _conferenceId = conferenceId;
            _dbContextData = dbContextData;
            _repository = repository;
        }

        [HttpPost,Route("login")]
        public async Task<object> GetAsync([FromBody] LoginModel user)
        {
            string expiredIn = MinutesToDateTime(JwtTokenExpiration()).ToString();
            string sharedPassword = JwtSharedPassword();
            if (user == null)
            {
                return BadRequest("Invalid login attempt");
            }

            ApplicationUser searchedUser = await _repository.SearchUserByEmailAsync(user.Email);
            if (searchedUser != null)
            {
                var result =
                await _signInManager.PasswordSignInAsync(user.Email,
                                                         user.Password,
                                                         false,
                                                         lockoutOnFailure: false);
                if (result.Succeeded)
                {
                    TokenRequest answer =
                        new TokenRequest(IssueJwtToken(searchedUser).ToString());
                    return Ok(answer);
                }
            }
            return Unauthorized();
        }

        [HttpPost, Route("Register")]
        public async Task<object> RegisterModel(RegisterModel ngUser)
        {
            
            // если форма пришла без ошибок
            if (ModelState.IsValid)
            {
                var check = _repository.FindUserByNameAsync(ngUser.Email);
                if (await check == null)
                {
                    Chat commonChat = _conferenceId.GetConferenceId();
                    ApplicationUser user = new ApplicationUser
                    {
                        UserName = ngUser.Email,
                        Email = ngUser.Email,
                        Photo = ngUser.Photo,
                        Name = ngUser.Name,
                        FamilyName = ngUser.FamilyName
                    };
                    var result = _userManager.CreateAsync(user, ngUser.Password);
                    // добавление нового пользователя в общий чат
                    if ((await result).Succeeded)
                    {
                        // добавление пользователя в общий чат
                        _repository.AddUserInChat(user, commonChat);
                        return Ok(RegistrationSuccess());
                    }
                    else throw new Exception("Не удалось создать пользователя");
                }
            }
            // если форма пришла с ошибками
            // то готовим сообщения об ошибках для Angular
            return BadRequest(RegistrationFail());
        }

        [HttpPost, Route("resolver")]
        public async Task<object> ResolveName([FromForm]string id)
        {
            ApplicationUser user = await _userManager.FindByIdAsync(id);
            if (user != null) return Ok(new { value = user.Name + ' ' + user.FamilyName });
            else return BadRequest(new { value = "error" });
        }

        // Вспомогательные методы
        private object IssueJwtToken(ApplicationUser currentUser)
        {
            var expirationDate = MinutesToDateTime(JwtTokenExpiration());
            var secret = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(JwtSharedPassword()));
            var signingCredentials = new SigningCredentials(secret, SecurityAlgorithms.HmacSha256);

            var identityOptions = new IdentityOptions();
            var claims = new List<Claim>
            {
                new Claim(identityOptions.ClaimsIdentity.UserIdClaimType, currentUser.Id)
            };

            var tokenOptions = new JwtSecurityToken(
                issuer: Configuration["JwtOptions:ValidIssuer"],
                audience: Configuration["JwtOptions:ValidAudience"],
                claims,
                expires: expirationDate,
                signingCredentials: signingCredentials
            );
            return new JwtSecurityTokenHandler().WriteToken(tokenOptions);
        }

        private object RegistrationSuccess()
        {
            return new { registration = "success" };
        }

        private object RegistrationFail()
        {
            return new { registration = "fail" };
        }

        private DateTime MinutesToDateTime(int count)
        {
            return DateTime.Now.AddMinutes(count);
        }

        private string JwtSharedPassword()
        {
            return Configuration["JwtOptions:SharedPassword"];
        }

        private int JwtTokenExpiration()
        {
            return Int32.Parse(Configuration["JwtOptions:ExpiredInMinutes"]);
        }

        public string GetTemporaryImageFolder()
        {
            return Path.Combine(_hostingEnvironment.WebRootPath, Configuration["FolderOptions:TemporaryUserPhotoFolder"]);
        }

        public string GetProductionImageFolder()
        {
            return Path.Combine(_hostingEnvironment.WebRootPath, Configuration["FolderOptions:ProductionUserPhotoFolder"]);
        }
    }
}
