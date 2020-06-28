using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Threading.Tasks;

namespace TestTaskApplication.Helpers
{
    public class DataHelper
    {
        public static readonly string ConnectionString =
            ConfigurationManager.ConnectionStrings["DefaultConnection"].ConnectionString;

        public static bool IsDbNull(object x)
        {
            return x.GetType() == typeof(DBNull) ? true : false;
        }
    }
}
