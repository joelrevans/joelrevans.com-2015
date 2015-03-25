using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace joelrevans.com_v5
{
    public class RouteConfig
    {
        public static void RegisterRoutes(RouteCollection routes)
        {            
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            routes.MapRoute(
                name: "MergeImages",
                url: "MergeImages/{*path}",
                defaults: new { controller = "ImageResize", action = "Merge" }
            );

            routes.MapRoute(
                name: "Images",
                url: "images/{*path}",
                defaults: new { controller = "ImageResize", action = "Index" }
            );

            routes.MapRoute(
                name: "Default",
                url: "{controller}/{action}/{id}",
                defaults: new { controller = "Main", action = "Index", id = UrlParameter.Optional }
            );
        }
    }
}