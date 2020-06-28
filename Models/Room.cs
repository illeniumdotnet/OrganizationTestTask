using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace TestTaskApplication.Models
{
    public class Room
    {
        public int Id { get; set; }
        public string Name { get; set; }
    }
}
