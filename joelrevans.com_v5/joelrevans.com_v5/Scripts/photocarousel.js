(function () {
    if (document.readyState === "complete") {
        init();
    } else {
        document.addEventListener("DOMContentLoaded", init);  //Wait until all code is load.
    }

    function init() {
        var i, j;   //working vars.
        var activeCarousel;
        var disableMouseEvents = false;
        var waitForSecondMouseEvent = true;

        /*Enforces Image Carousel Scrolling*/
        function MoveCarousel(event) {
            if (waitForSecondMouseEvent) {       //This adds a one-event delay.  A few browsers screw up the specified event order and fire mouse before touch.
                waitForSecondMouseEvent = false;
                return;
            }

            if (disableMouseEvents == false) {
                var target = event.currentTarget;
                target.scrollLeft = (target.scrollWidth - target.clientWidth) * (event.clientX - target.offsetLeft - 100) / (target.clientWidth - 200);
            }
        }

        function MouseExit() {
            waitForSecondMouseEvent = true;
        }       

        function TouchScrolling(target) {
            var lastTouchX;                     //Used for horizontal scrolling carousels on phones.

            target.addEventListener("touchmove", TouchMove);        //set up touch events
            target.addEventListener("touchstart", TouchStart);
            target.addEventListener("touchend", TouchEnd);

            function TouchMove(event) {
                var touch = event.changedTouches[0];
                target.scrollLeft -= touch.clientX - lastTouchX;
                lastTouchX = touch.clientX;
            }

            function TouchStart(event) {
                disableMouseEvents = true;
                lastTouchX = event.changedTouches[0].clientX;
            }

            function TouchEnd(event) {
                waitForSecondMouseEvent = true;
                disableMouseEvents = false;
            }
        }

        /*Add scrolling module to all carousel objects.*/
        var cars = document.querySelectorAll(".ImageCarousel");
        for (i = 0; i < cars.length; ++i) {
            cars[i].addEventListener("mouseout", MouseExit);
            cars[i].addEventListener("mousemove", MoveCarousel);
            TouchScrolling(cars[i]);
            SetupThumbs(cars[i]);           //Generate thumbnails for all images.
        }

        /*Generates the overlay when an image is clicked on.*/
        function SetupThumbs(targetCarousel) {
            var startext;
            var endext;                         //index of the end of the extension parameter
            var ext = "";                       //the value of the ext parameter, if it exists
            var targetsrc;                      //source of the working image
            var paramStart;
            var i;
            var touchTime;
            var images;

            WindowResized();
            window.addEventListener("resize", WindowResized);   //Makes sure that maximum image size is held to the maximum window size.

            targetCarousel.addEventListener("click", ImageOverlay);
            targetCarousel.addEventListener("touchstart", touchStart);
            targetCarousel.addEventListener("touchend", touchEnd);

            function touchStart(e) {
                touchTime = Date.now();
                targetCarousel.removeEventListener("click", ImageOverlay);
            }

            function touchEnd(e) {
                if (targetCarousel == activeCarousel) {
                    if (Date.now() - touchTime < 200) {
                        CloseOverlay(targetCarousel);
                    }
                } else {
                    if (Date.now() - touchTime < 200) {
                        ImageOverlay(targetCarousel);
                    }
                }
                targetCarousel.addEventListener("click", ImageOverlay);
            }

            images = document.querySelectorAll(".ImageCarousel ul li img");
            for (i = 0; i < images.length; ++i) {
                images[i].addEventListener("load", removeLoader);
            }

            function removeLoader(event) {
                event.currentTarget.style.opacity = 1;
            }

            function ImageOverlay(carousel) {
                if (carousel.toString().toLowerCase().indexOf("event") > -1) {    //not a mouse event means it must be a carousel.
                    carousel = targetCarousel;
                }

                if (activeCarousel != undefined) {
                    CloseOverlay(activeCarousel);
                }
                activeCarousel = carousel;
                carousel.removeEventListener("click", ImageOverlay);
                carousel.addEventListener("click", CloseOverlay);
                carousel.style.backgroundColor = "#CCC";

                var images = carousel.querySelectorAll("ul li img");  //sibling images
                var tmp;
                for (i = 0; i < images.length; ++i) {
                    images[i].style.opacity = 0.5;
                    tmp = images[i].getAttribute("src");
                    images[i].setAttribute("src", images[i].getAttribute("data-thumb"));    //swap the data-thumb and src attributes
                    images[i].setAttribute("data-thumb", tmp);
                }
            }

            function CloseOverlay(carousel) {
                if (carousel.toString().toLowerCase().indexOf("event") > -1) {
                    carousel = targetCarousel;
                }

                if (activeCarousel == carousel) {
                    activeCarousel = null;
                }
                carousel.removeEventListener("click", CloseOverlay);
                carousel.addEventListener("click", ImageOverlay);
                carousel.style.backgroundColor = "#FAFAFA";

                var images = carousel.querySelectorAll("ul li img");  //sibling images
                var tmp;
                for (i = 0; i < images.length; ++i) {
                    tmp = images[i].getAttribute("src");                                    //our data uri is stored in data-thumb, so no load necessary
                    images[i].setAttribute("src", images[i].getAttribute("data-thumb"));    //swap the data-thumb and src attributes
                    images[i].setAttribute("data-thumb", tmp);
                }
            }

            function WindowResized() {
                var images = targetCarousel.querySelectorAll("ul li img");  //sibling images
                for (i = 0; i < images.length; ++i) {
                    images[i].style.maxHeight = window.innerHeight.toString() + "px";
                    images[i].style.maxWidth = window.innerHeight.toString() + "px";
                }
            }
        }

        function InitVideo(e) {
            var utubid = e.currentTarget.getAttribute("data-youtubeid");
            var VideoWrapperWrapper = document.createElement("div");
            var VideoWrapper = document.createElement("div");
            var iframe = document.createElement("iframe");
            var VideoBackground = document.createElement("div");

            VideoWrapperWrapper.classList.add("VideoWrapperWrapper");
            VideoWrapper.classList.add("VideoWrapper");
            iframe.classList.add("tubevid");
            iframe.setAttribute("allowfullscreen", "");
            iframe.setAttribute("src", "http://www.youtube.com/embed/" + utubid);
            VideoBackground.classList.add("VideoBackground");

            document.body.appendChild(VideoBackground);
            document.body.appendChild(VideoWrapperWrapper);
            VideoWrapperWrapper.appendChild(VideoWrapper);
            VideoWrapper.appendChild(iframe);

            VideoBackground.addEventListener("click", RemoveVideo);

            function RemoveVideo() {
                document.body.removeChild(VideoWrapperWrapper);
                document.body.removeChild(VideoBackground);
            }
        }

        var vids = document.querySelectorAll("[data-youtubeid]");
        for (i = 0; i < vids.length; ++i) {
            vids[i].addEventListener("click", InitVideo);
        }

        document.removeEventListener("DOMContentLoaded", this);
    }
})();