using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using NetCoreApi.Models;

namespace NetCoreApi.Services
{
    public interface IConferenceId
    {
        Chat GetConferenceId();
    }
}
