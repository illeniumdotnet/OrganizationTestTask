using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace TestTaskApplication.Models
{
    public class Room_Facilities
    {
        [Key]
        public int RId { get; set; }
        [Key]
        public int FId { get; set; }
    }

    public class Building_Room
    {
        [Key]
        public int RId { get; set; }
        [Key]
        public int BId { get; set; }
    }
}
