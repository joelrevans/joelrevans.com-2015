using System;
using System.Collections;
using System.Linq;
using System.Web;
using System.IO.Compression;

namespace joelrevans.com_v5
{
    /// <summary>
    /// This module enables gzip compression for all HTTP requests.  The module is included in the web.config.
    /// </summary>
    public class EnableCompressionHttpModule : IHttpModule
    {
        
        public void Init(HttpApplication application)
        {
            application.BeginRequest += (new EventHandler(this.Application_BeginRequest));
        }

        // Your BeginRequest event handler.
        private void Application_BeginRequest(Object source, EventArgs e)
        {
            HttpContext.Current.Response.Filter = new GZipStream(HttpContext.Current.Response.Filter, CompressionMode.Compress);
            HttpContext.Current.Response.AppendHeader("Content-encoding", "gzip");
            HttpContext.Current.Response.Cache.VaryByHeaders["Accept-encoding"] = true;
        }

        public void Dispose()
        {
        }
    }
}