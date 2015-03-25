using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.IO;
using System.Text.RegularExpressions;
using ImageResizerLib;
using System.IO.Compression;
using System.Web.Hosting;
using System.Drawing.Imaging;
using System.Drawing;
using System.Text;

namespace joelrevans.com_v5.Controllers
{
    public class ImageResizeController : Controller
    {
        //
        // GET: /ImageResize/

        static ImageCache ic = new ImageCache("cachepath");

        /**/
        public FilePathResult Index(string ext = "", string type = "skew", int? w = null, int? h = null) 
        {
            string requestPath = HttpContext.Request.Path;
            
            if(ext.Length > 0)
                requestPath += "." + ext;

            string resultPath = null;

            if (w == null || h == null)
                resultPath = ic.GetImage(requestPath);
            else
            {
                ImageCache.ResizeType enumType = ImageCache.ResizeType.Skew;
                switch(type.ToLower()){
                    case "skew":
                        enumType = ImageCache.ResizeType.Skew;
                        break;
                    case "fill":
                        enumType = ImageCache.ResizeType.Fill;
                        break;
                    case "bars":
                        enumType = ImageCache.ResizeType.Bars;
                        break;
                    case "nobars":
                        enumType = ImageCache.ResizeType.NoBars;
                        break;
                }
                resultPath = ic.GetImage(requestPath, (int)w, (int)h, enumType);
            }

            try
            {
                if (ext.Length == 0)
                    ext = Path.GetExtension(resultPath).Replace(".", "");
                return File(resultPath, "image/" + ext);
            }catch{
                Response.Status = "404 File Not Found";
                Response.StatusCode = 404;
                throw new HttpException(404, "File not found.");
            }
        }

        public FilePathResult Merge(string ext, double hAlign, double vAlign, string[] image)
        {
            ImageFormat iformat;
            switch (ext)
            {
                case "jpg":
                    iformat = ImageFormat.Jpeg;
                    break;
                case "png":
                    iformat = ImageFormat.Png;
                    break;
                case "gif":
                    iformat = ImageFormat.Gif;
                    break;
                default:
                    throw new Exception("Invalid image extension.");
            }


            string path = ic.GetMerge(image, hAlign, vAlign, iformat);
            if (path == null)
            {
                Response.Status = "404 File Not Found";
                Response.StatusCode = 404;
                throw new HttpException(404, "File not found.");
            }

            return File(path, "image/" + ext);
        }

        public static string GetDataURI(string url)
        {
            string path = ic.GetImage(url);

            if (path != null)
            {
                byte[] imgdata = System.IO.File.ReadAllBytes(path);
                string ext = Path.GetExtension(path).Replace(".", "");
                return "data:image/" + ext + ";base64," + Convert.ToBase64String(imgdata);
            }

            return url;
        }

        public static string GetDataURI(string url, ImageCache.ResizeType type, int width, int height)
        {
            string path = ic.GetImage(url, width, height, type);

            if (path != null)
            {
                byte[] imgdata = System.IO.File.ReadAllBytes(path);
                string ext = Path.GetExtension(path).Replace(".", "");
                return "data:image/" + ext + ";base64," + Convert.ToBase64String(imgdata);
            }

            return url;
        }

        public static string GetMergeDataURI(string[] images, double hAlign, double vAlign, ImageFormat fmt)
        {
            string path = ic.GetMerge(images, hAlign, vAlign, fmt);

            if (path != null)
            {
                byte[] imgdata = System.IO.File.ReadAllBytes(path);
                string ext = Path.GetExtension(path).Replace(".", "");
                return "data:image/" + ext + ";base64," + Convert.ToBase64String(imgdata);
            }

            return null;
        }

        public static MvcHtmlString Thumbnail(string src, string alt="")
        {
            string thumbdata = GetDataURI(src, ImageCache.ResizeType.Bars, 100, 100);
            return new MvcHtmlString("<img src='" + thumbdata + "' alt='" + alt + "' data-thumb='" + src + "'/>");
        }

        public static MvcHtmlString MergeThumbnail(string[] images, double hAlign, double vAlign, ImageFormat fmt, string alt = "")
        {
            string thumbdata = GetMergeDataURI(images, hAlign, vAlign, fmt);
            return new MvcHtmlString("<img src='" + thumbdata + "' alt='" + alt + "'/>");
        }
    }
}
