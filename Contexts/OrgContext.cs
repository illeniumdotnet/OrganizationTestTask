using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TestTaskApplication.Helpers;
using TestTaskApplication.Models;

namespace TestTaskApplication.Contexts
{
    public class OrgContext : DbContext
    {
        public DbSet<Building> Building { get; set; }
        public DbSet<Facilities> Facilities { get; set; }
        public DbSet<Room> Room { get; set; }
        public DbSet<Building_Room> Building_Room { get; set; }
        public DbSet<Room_Facilities> Room_Facilities { get; set; }
        public OrgContext()
        {
            Database.EnsureCreated();
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseSqlServer(DataHelper.ConnectionString);
            base.OnConfiguring(optionsBuilder);
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Building_Room>().HasKey(table => new { table.BId, table.RId });
            modelBuilder.Entity<Room_Facilities>().HasKey(table => new { table.FId, table.RId });
            base.OnModelCreating(modelBuilder);
        }
    }
}
