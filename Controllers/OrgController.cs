using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TestTaskApplication.Contexts;
using TestTaskApplication.Helpers;
using TestTaskApplication.Models;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace TestTaskApplication.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrgController : ControllerBase
    {
        OrgContext context;
        public OrgController(OrgContext context)
        {
            this.context = context;
        }

        // GET: api/<controller>
        [HttpGet]
        public async Task<JsonResult> Get()
        {
            var res = await context.Building.ToListAsync();
            return new JsonResult(res);
        }

        // GET api/<controller>/5
        [HttpGet("{id}")]
        public async Task<JsonResult> GetBuldingData(int id)
        {
            var res = new Dictionary<Room, List<Facilities>>();
            using (var con = new SqlConnection(DataHelper.ConnectionString))
            {
                await con.OpenAsync();
                using (var com = new SqlCommand("GetDataForHierarchy", con))
                {
                    com.CommandType = System.Data.CommandType.StoredProcedure;
                    com.Parameters.Add(new SqlParameter { ParameterName = @"bid", Value = id });
                    using (var reader = await com.ExecuteReaderAsync())
                    {
                        if (reader.HasRows)
                        {
                            while (await reader.ReadAsync())
                            {
                                if (!DataHelper.IsDbNull(reader["rid"]))
                                {
                                    var key = context.Room.Find((int)reader["rid"]);
                                    if (!res.ContainsKey(key))
                                        res.Add(key, new List<Facilities>());
                                    if (!DataHelper.IsDbNull(reader["fid"]))
                                        res[key].Add(context.Facilities.Find((int)reader["fid"]));
                                }
                            }
                        }
                    }
                }
            }
            return new JsonResult(res.OrderBy(k => k.Key.Id).ToList());
        }

        [HttpPost("add/{rId}")]
        public async Task<ActionResult<Facilities>> PostAdd(Facilities fc, int rId)
        {
            if (fc == null) return BadRequest();
            if (context.Facilities.Contains(fc))
                return BadRequest("Object is already exist");
            fc.Id = (await context.Facilities.OrderBy(f => f.Id).LastAsync()).Id + 1;
            context.Facilities.Add(fc);
            context.Room_Facilities.Add(new Room_Facilities
            { RId = rId, FId = fc.Id });
            await context.SaveChangesAsync();
            return Ok(fc);
        }

        [HttpPost("rewrite/{fId}")]
        public async Task<ActionResult<Facilities>> PostRewrite(Facilities fc, int fId)
        {
            if (fc == null) return BadRequest();
            var f = context.Facilities.Find(fId);
            f.Name = fc.Name;
            f.Count = fc.Count;
            await context.SaveChangesAsync();
            return Ok(f);
        }
        // DELETE api/<controller>/5
        [HttpDelete("{rId}/{fId}")]
        public async Task<ActionResult> Delete(int rId, int fId)
        {
            var rf = context.Room_Facilities.Find(fId, rId);
            if (rf == null) return BadRequest();
            context.Room_Facilities.Remove(rf);
            await context.SaveChangesAsync();
            context.Facilities.Remove(context.Facilities.Find(fId));
            await context.SaveChangesAsync();
            return Ok();

        }
    }
}
