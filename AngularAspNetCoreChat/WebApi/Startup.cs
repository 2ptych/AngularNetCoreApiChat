using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.SpaServices.AngularCli;
using Microsoft.CodeAnalysis.Options;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using NetCoreApi.Data;
using NetCoreApi.Models;
using NetCoreApi.Services;
using NetCoreApi.Middleware;

namespace NetCoreApi
{
    public class Startup
    {
        private readonly string signalrApiPath = "/secured";
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddCors(options => options.AddPolicy("CorsPolicy", builder =>
            {
                builder
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials();//.WithOrigins("https://localhost:4200");
            }));

            services.AddControllersWithViews();

            services.AddDbContext<DbContextIdentity>(p => 
                p.UseSqlServer(Configuration["ConnectionStrings:IdentityConnection"]),
                ServiceLifetime.Transient);

            services.AddIdentity<ApplicationUser, IdentityRole>(options =>
                {
                    options.SignIn.RequireConfirmedEmail = false;
                    // Настройки пароля
                    options.Password.RequireDigit = true;
                    options.Password.RequiredLength = 9;
                    options.Password.RequireLowercase = true;
                    options.Password.RequireUppercase = true;
                })
                .AddEntityFrameworkStores<DbContextIdentity>()
                .AddDefaultTokenProviders();

            
            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                //options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
                .AddJwtBearer(options => 
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidIssuer = Configuration["JwtOptions:ValidIssuer"],
                        ValidAudience = Configuration["JwtOptions:ValidAudience"],

                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = new SymmetricSecurityKey(
                            Encoding.UTF8.GetBytes("VeryStrong$ecretK%y"))
                    };
                    options.Events = new JwtBearerEvents
                    {
                        OnMessageReceived = context =>
                        {
                            string accessToken = context.Request.Query["access_token"];
                            var path = context.HttpContext.Request.Path;
                            if (!string.IsNullOrEmpty(accessToken) &&
                                (path.StartsWithSegments("/secured")))
                            {
                                context.Token = accessToken;//.Substring(1, 335);
                            }

                            return Task.CompletedTask;
                        }
                    };
                });

            services.AddSignalR();

            //services.AddSingleton<IUserIdProvider, CustomUserIdProvider>();
            services.AddTransient<IConferenceId, ConferenceIDService>();
            services.AddTransient<IRepository, Repository>();

            // In production, the Angular files will be served from this directory
            services.AddSpaStaticFiles(configuration =>
            {
                configuration.RootPath = "ClientApp/dist";
            });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app,
                              IHostingEnvironment env,
                              UserManager<ApplicationUser> userManager)
        {
            app.UseDeveloperExceptionPage();

            //app.UseAccessControlAllowOrigin();

            app.UseCors("CorsPolicy");
            
            app.UseStaticFiles();
            app.UseStaticFiles(new StaticFileOptions
            {
                FileProvider = new PhysicalFileProvider(
                    Path.Combine(Directory.GetCurrentDirectory(),
                    "wwwroot", "temp-upload-files")),
                RequestPath = "/images"
            }); 
            
            app.UseSpaStaticFiles(new StaticFileOptions()
            {
                OnPrepareResponse = (context) => 
                {
                    // Disable caching for all static files.        
                    context.Context.Response.Headers["Cache-Control"] =
                        Configuration["StaticFiles:Headers:Cache-Control"];
                    context.Context.Response.Headers["Pragma"] =
                        Configuration["StaticFiles:Headers:Pragma"];
                    context.Context.Response.Headers["Expires"] =
                        Configuration["StaticFiles:Headers:Expires"];    
                } 
            });

            //app.UseHttpsRedirection();
            app.UseRouting();

            app.UseAuthentication(); //
            app.UseAuthorization();

            app.UseEndpoints(route =>
            {
                route.MapHub<ChatHub>(signalrApiPath);
                route.MapControllerRoute(
                    name: "default",
                    pattern: "{controller}/{action=Index}/{id?}");
            });

            app.UseSpa(spa =>
            {
                // To learn more about options for serving an Angular SPA from ASP.NET Core,
                // see https://go.microsoft.com/fwlink/?linkid=864501

                spa.Options.SourcePath = "ClientApp";

                if (env.IsDevelopment())
                {
                    spa.UseAngularCliServer(npmScript: "start");
                }
            });

            // Встроенные пользователи
            // InitialDbSeed.SeedUsers();
        }
    }
}
