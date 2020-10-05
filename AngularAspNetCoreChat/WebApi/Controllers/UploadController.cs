using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
//using System.Web.Http;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace NetCoreApi.Controllers
{
    [Route("upload")]
    [ApiController]
    public class UploadController : ControllerBase
    {
        private readonly IHostingEnvironment hostingEnvironment;
        public UploadController(IHostingEnvironment _hostingEnvironment)
        {
            hostingEnvironment = _hostingEnvironment;
        }

        public class SendedFile
        {
            public IFormFile Content { get; set; }
        }

        [HttpPost, Route("photoupload"), DisableRequestSizeLimit]
        public async Task<IActionResult> Upload([FromForm] IFormFile attach)
        {

            string fileName;
            string newFileName;
            string fullPath;
            try
            {
                string uploadPath = Path.Combine(hostingEnvironment.WebRootPath, "temp-upload-files");
                if (attach.Length > 0)
                {
                    newFileName = GetFileName(attach) + Path.GetExtension(attach.FileName);
                    fileName = ContentDispositionHeaderValue.Parse(attach.ContentDisposition).FileName.Trim('"');
                    fullPath = Path.Combine(uploadPath, newFileName);
                    using (FileStream stream = new FileStream(fullPath, FileMode.Create))
                    {
                        await attach.CopyToAsync(stream);
                    }
                    // отправляем ответ
                    return Ok(new { message = newFileName });
                }
                return BadRequest();
            }
            catch (Exception e)
            {
                return StatusCode(500, $"Internal Error: {e}");
            }
        }

        // удалить изображения с меткой temp
        public void DeleteTempImages()
        {

        }

        // возвращает хэш файла
        public string GetFileName(IFormFile file)
        {
            using (var stream = new MemoryStream())
            {
                StringBuilder builder = new StringBuilder();
                file.CopyTo(stream);
                byte[] fileBytes = stream.ToArray();
                var fileHash = GetSHA1Hash(fileBytes);
                for (int i = 0; i < fileHash.Length; i++)
                {
                    builder.Append(fileHash[i].ToString("x2"));
                }
                return builder.ToString();
            }
        }

        public byte[] GetSHA1Hash(byte[] input)
        {
            byte[] fileHash;
            using (SHA1 sha256Hasher = SHA1.Create())
            {
                fileHash = sha256Hasher.ComputeHash(input);
            }
            return fileHash;
        }
    }
}
