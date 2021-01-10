using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WebApi.Services
{
    // статический класс, содержащий путь к глобальной папке
    // и пары значений папка/путь
    public static class FolderService
    {
        static string globalFolder;
        static Dictionary<string, string> folderPathesPairs;
        static FolderService()
        {
            folderPathesPairs = new Dictionary<string, string>();
        }

        public static void setGlobalFolder(string _globalFolder)
        {
            globalFolder = _globalFolder;
        }

        private static string ConcatPathWithGlobal(string relationalPath)
        {
            if (globalFolder != null)
            {
                return string.Concat(globalFolder, @"\\", relationalPath);
            }
            else throw new ArgumentNullException("Не установлен путь к глобальной папке");
        }

        public static void SetPair(string folder, string path)
        {
            folderPathesPairs.Add(folder, path);
        }

        public static string ResolvePair(string folder)
        {
            if (folderPathesPairs.ContainsKey(folder))
            {
                return ConcatPathWithGlobal(folderPathesPairs[folder]);
            }
            else throw new ArgumentNullException("Не найдена пара в коллекции");
        }
    }
}
