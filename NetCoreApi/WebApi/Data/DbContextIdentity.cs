using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using WebApi.Models;
using WebApi.Services;

namespace WebApi.Data
{
    public class DbContextIdentity : IdentityDbContext<ApplicationUser>
    {
        IConfiguration Configuration;
        public DbContextIdentity(DbContextOptions<DbContextIdentity> options,
            IConfiguration configuration) : base(options)
        {
            Configuration = configuration;
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // добавление общей конфренции
            string conferenceName = Configuration["UsersConference:Title"];
            ChatManager chatManager = new ChatManager(this);
            //Chat newConference = chatManager.CreateConference(conferenceName);
            if (conferenceName == null) throw new ArgumentNullException("parameter \"conferenceName\" is null");
            modelBuilder.Entity<Chat>(b =>
            {
                b.HasData(new Chat
                {
                    Id = Guid.NewGuid(),
                    Type = Models.Chat.ChatType.Conference,
                    Title = conferenceName,
                    ChatImage = "c545bd90af1afb34c8ccb38c56ff0bd6f9791b6c.png",
                    Created = DateTime.Now
                });
            });
            modelBuilder.Entity<ApplicationUserChat>(b =>
            {
                b.HasKey(k => new { k.ChatId, k.ApplicationUserId });
                b.HasOne(k => k.Chat).WithMany(t => t.AppUserChat).HasForeignKey(f => f.ChatId);
                b.HasOne(k => k.ApplicationUser).WithMany(t => t.AppUserChatContacts).HasForeignKey(f => f.ApplicationUserId);
            });
            base.OnModelCreating(modelBuilder);
        }
        public DbSet<ApplicationUserChat> AppUserChat { get; set; }
        public DbSet<Chat> Chat { get; set; }
        public DbSet<MessageModel> Messages { get; set; }
    }
}
