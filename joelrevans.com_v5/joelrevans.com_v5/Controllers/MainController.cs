﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.IO.Compression;
using System.IO;
using System.Web.Hosting;

namespace joelrevans.com_v5.Controllers
{
    public class MainController : Controller
    {
        //
        // GET: /Main/

        public ActionResult Index()
        {
            return View();
        }

        public ActionResult Resume()
        {
            return View("ResumeMaster");
        }
    }
}
