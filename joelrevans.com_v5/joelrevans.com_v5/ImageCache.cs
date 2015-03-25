using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Hosting;
using System.IO;
using System.Drawing;
using System.Drawing.Imaging;
using System.Text;
using ImageResizerLib;


namespace joelrevans.com_v5
{
    public class ImageCache
    {
        private string cachepath;
        private string apppath;

        /// <summary>
        /// Sets up the imagecache folder, where all of the dynamically resized images are cached.
        /// Also checks for images that have not been accessed for a week or more, and deletes them.
        /// </summary>
        public ImageCache(string path)
        {
            apppath = HostingEnvironment.MapPath("~");
            this.cachepath = apppath + path;
            apppath = apppath.Substring(0, apppath.Length - 1); //Remove backslash from the end (messes up path merges).

            if (!Directory.Exists(cachepath))                   //Build the cache directory if it does not exists.
            {
                Directory.CreateDirectory(cachepath).CreateSubdirectory("mergecache");
            }

            string[] filelist = Directory.GetFiles(cachepath, "", SearchOption.AllDirectories);
            foreach (string s in filelist)                      //Delete any files that haven't been accessed in over a week.
            {
                DateTime lastAccessed = File.GetLastAccessTime(s);
                if (DateTime.Now.Subtract(lastAccessed).Days > 7)
                    File.Delete(s);
            }
        }


        /// <summary>
        /// Locates and opens the specified image without making any modifications.
        /// </summary>
        /// <param name="path">If the provided file is not found, and no file extension is provided, attempts to match a file with the appropriate name.</param>
        /// <returns>Returns the path that can be used to access the image file.</returns>
        public string GetImage(string path)
        {
            path = HttpUtility.UrlDecode(path);
            if (File.Exists(apppath + path))
                return apppath + path;
            else if (Path.GetExtension(path).Length == 0)    //If file has no extension, find a matching file.
            {
                string dir = Path.GetDirectoryName(path);
                string fn = Path.GetFileName(path);
                try
                {
                    return Directory.EnumerateFiles(apppath + dir).Where<string>(s => Path.GetFileNameWithoutExtension(s).Equals(fn)).First<string>();
                }
                catch
                {
                    return null;
                }
            }
            return null;
        }

        /// <summary>
        /// Opens and modifies the given image using the Thumbnailer lib.  Caches the image for future use.
        /// </summary>
        /// <param name="path">If the provided file is not found, and no file extension is provided, attempts to match a file with the appropriate name.</param>
        /// <param name="type">The method of resizing to use when modifying the image.</param>
        /// <param name="width">The target width of the modified image.</param>
        /// <param name="height">The target height of the modified image.</param>
        /// <returns>Returns the path that can be used to access the image file.</returns>
        public string GetImage(string path, int width, int height, ResizeType type)
        {
            path = HttpUtility.UrlDecode(path);
            if(Path.GetExtension(path).Length == 0)                 //If file has no extension, find a matching file.
            {
                string dir = Path.GetDirectoryName(path);
                string fn = Path.GetFileName(path);
                try
                {
                    path = Directory.EnumerateFiles(apppath + dir).Where<string>(s => Path.GetFileNameWithoutExtension(s).Equals(fn)).First<string>();
                }
                catch
                {
                    return null;
                }
                path = path.Replace(apppath, string.Empty);
            }
            else if(File.Exists(apppath + path) == false)           //If file does not exist, return null.
                return null;

            StringBuilder sb = new StringBuilder();                 //Build the string where the image resides (or will reside).
            sb.Append(cachepath);
            sb.Append(Path.GetDirectoryName(path));
            sb.Append("\\");
            sb.Append(Path.GetFileNameWithoutExtension(path));
                
            sb.Append("&t=" + type);
            sb.Append("&w=" + width.ToString());
            sb.Append("&h=" + height.ToString());

            sb.Append(Path.GetExtension(path));

            if (File.Exists(sb.ToString()))                         //If the modified image exists, use it.
            {
                return sb.ToString();
            }
            else
            {                                                       ///If the modified image doesn't exist, create it.
                Directory.CreateDirectory(Path.GetDirectoryName(sb.ToString()));
                using (FileStream fs = new FileStream(sb.ToString(), FileMode.Create))
                {
                    Image src = Image.FromFile(apppath + path);
                    Image target = null;
                    if (type == ResizeType.Skew)
                        target = ImageResizer.ResizeImage_Skew(src, (int)width, (int)height, true);
                    else if (type == ResizeType.Fill)
                        target = ImageResizer.ResizeImage_Fill(src, (int)width, (int)height, .5, .5, true);
                    else if (type == ResizeType.Bars)
                        target = ImageResizer.ResizeImage_Bars(src, (int)width, (int)height, .5, .5, Color.Black, true);
                    else if (type == ResizeType.NoBars)
                        target = ImageResizer.ResizeImage_NoBars(src, (int)width, (int)height, true);
                    target.Save(fs, src.RawFormat); //target doesn't have a valid format until it is saved.  Must use src format.
                }
                return sb.ToString();
            }
        }

        public string GetMerge(string[] images, double hAlign, double vAlign, ImageFormat ext)
        {
            List<Image> li = new List<Image>();
            try
            {
                foreach (string s in images)
                {
                    li.Add(Image.FromFile(HostingEnvironment.MapPath(s)));
                }
            }
            catch
            {
                return null;
            }

            string cacheitem = string.Join("_", images);
            string mergepath = cachepath + "/mergecache/" + Convert.ToBase64String(Encoding.UTF8.GetBytes(cacheitem)) + "." + ext.ToString().ToLower();

            if (System.IO.File.Exists(mergepath) == false)
            {
                using(Image result = ImageResizer.Merge(li.ToArray(), hAlign, vAlign, Color.White)){
                    result.Save(mergepath, ext);   
                }
            }

            return mergepath;
        }

        public enum ResizeType
        {
            Skew,
            Fill,
            Bars,
            NoBars
        }

    }
}