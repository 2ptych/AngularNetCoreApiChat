using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using NetCoreApi.Models;

namespace NetCoreApi.Services
{
    interface IChatManager
    {
        Chat CreateDialog();
        Chat CreateConference(string title);
    }
}
