using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WebApi.Models;
using WebApi.Services;

namespace WebApi.Data
{
    public class InitialDbSeed
    {
        //private readonly IServiceProvider appServiceProvider;
        private readonly IConferenceId _conferenceId;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IRepository _repository;
        public InitialDbSeed(IServiceProvider _appServiceProvider)
        {
            //appServiceProvider = _appServiceProvider;
            var scope = _appServiceProvider
                .GetRequiredService<IServiceScopeFactory>().CreateScope();
            // инициализация сервисов
            _userManager = scope.ServiceProvider
                .GetRequiredService<UserManager<ApplicationUser>>();
            _conferenceId = scope.ServiceProvider
                .GetRequiredService<IConferenceId>();
            _repository = scope.ServiceProvider
                .GetRequiredService<IRepository>();
        }

        // создание встроенных пользователей
        public async Task SeedUsers()
        {
            string sharedPassword = "123";

            IQueryable<ApplicationUser> users = _userManager.Users;
            if (users.Count() > 0) return;

            await CreateUserAsync(new RegisterModel
            {
                Photo = "7e256ffaf38a8b3a7b0c5731a85b2f680de5116b.png",
                Email = "user@gmail.com",
                Name = "User",
                FamilyName = "Default",
                Password = sharedPassword,
            });

            await CreateUserAsync(new RegisterModel
            {
                Photo = "a1ba9e5d09dfcbfbbb95ab4422b8a97076d99cab.jpg",
                Email = "nargaroth141@gmail.com",
                Name = "Nick",
                FamilyName = "Popov",
                Password = sharedPassword,
            });

            await CreateUserAsync(new RegisterModel
            {
                Photo = "2db73a9830cf43555afc1eabc240c89691d1e960.jpg",
                Email = "zoomed.parrot@gmail.com",
                Name = "Parrot",
                FamilyName = "Zoomed",
                Password = sharedPassword,
            });

            await CreateUserAsync(new RegisterModel
            {
                Photo = "119e84ade2d00af12de8d00e33cec5be958bc8e8.jpg",
                Email = "angry.cat@gmail.com",
                Name = "Cat",
                FamilyName = "Angry",
                Password = sharedPassword,
            });

            await CreateUserAsync(new RegisterModel
            {
                Photo = "15077963e911971fdb0a7db8b6e5b7e9c9fb73c8.jpg",
                Email = "danger.doggy@icloud.com",
                Name = "Doggy",
                FamilyName = "Danger",
                Password = sharedPassword,
            });

            await CreateUserAsync(new RegisterModel
            {
                Photo = "ec50634d27a3d2c05f545d061ac5549aa93fe639.jpg",
                Email = "fury.greta@icloud.com",
                Name = "Greta",
                FamilyName = "Fury",
                Password = sharedPassword,
            });

            await CreateUserAsync(new RegisterModel
            {
                Photo = "59e4a92167a1a702c2d81d0f365a35c31a4e8a36.jpg",
                Email = "cat.buddy@gmail.com",
                Name = "Cat",
                FamilyName = "Buddy",
                Password = sharedPassword,
            });
        }
        public async Task CreateUserAsync(RegisterModel ngUser)
        {
            var check = _repository.FindUserByNameAsync(ngUser.Email);
            if ((await check) == null)
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
                var result = _userManager
                    .CreateAsync(user, ngUser.Password).Result;
                // добавление нового пользователя в общий чат
                if (result.Succeeded)
                {
                    _repository.AddUserInChat(user, commonChat);
                }
                else throw new Exception("Не удалось создать пользователя");
            }
        }
    }
}
