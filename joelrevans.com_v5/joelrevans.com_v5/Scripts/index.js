(function () {
    var i, j, k;    //miscellaneous working vars

    if (document.readyState === "complete") {
        init();
    } else {
        document.addEventListener("DOMContentLoaded", init);  //Wait until all code is load.
        document.addEventListener("DOMContentLoaded", nav);  //Wait until all code is load.
        document.addEventListener("DOMContentLoaded", InitThumbnailerDemo);  //Wait until all code is load.
    }

    function init() {                                    //Set up the "View Game" Button.
        var vg = document.getElementById("ViewGame");
        vg.querySelector("div").addEventListener("click", ViewGameClick);
        vg.querySelector("object").style.display = "none";

        function ViewGameClick(event) {
            var tgt = event.target.parentElement.querySelector("object");
            var div = event.target.parentElement.querySelector("div");
            if (tgt.style.display == "none") {
                tgt.style.display = "block";
                tgt.style.maxHeight = "100%";
                div.innerHTML = "CLOSE GAME";
            } else {
                tgt.style.maxHeight = "0";
                setTimeout(Togg, 1000);
                div.innerHTML = "VIEW GAME";
            }

            function Togg(){
                tgt.style.display = "none";
            }
        }

        document.removeEventListener("DOMContentLoaded", this);
    }

    //Thumbnailer Demo
    function InitThumbnailerDemo(e){
        var demo = document.getElementById("ThumbnailerDemo");
        var demoNailIt = demo.querySelector("input[type='button'][value='Nail It']");
        var demoReset = demo.querySelector("input[type='button'][value='Reset']");
        var demoWidth = demo.querySelector("#DemoWidth");
        var demoHeight = demo.querySelector("#DemoHeight");
        var demoError = demo.querySelector("#DemoError");
        var demoImage = demo.querySelector("img");

        demoNailIt.addEventListener("click", Nailed);
        demoReset.addEventListener("click", Reset);

        function Nailed() {
            var width, height, type;

            try {
                width = parseInt(demoWidth.value);
                if (width > 900) {
                    demoError.innerHTML = "NOTE:  Image dimensions are limited to no more than 900 pixels.";
                }
            }
            catch (e) {
                demoError.innerHTML = "The supplied width value is not a valid integer.";
            }

            try {
                height = parseInt(demoHeight.value);
                if (height > 900) {
                    demoError.innerHTML = "NOTE:  Image dimensions are limited to no more than 900 pixels.";
                }
            }
            catch (e) {
                demoError.innerHTML = "The supplied height value is not a valid integer.";
            }

            var demoType = demo.querySelector("input[name='type']:checked").value;

            demoImage.src = "/images/Thumbnailer/testkitten?ext=jpg&type=" + demoType + "&w=" + width.toString() + "&h=" + height.toString();
        }

        function Reset() {
            demoImage.src = "/images/Thunbnailer/testkitten.jpg";
        }

        document.removeEventListener("DOMContentLoaded", this);
    };
    


    //Setup navigation
    function nav() {
        var i;
        var navEl = document.querySelector("nav");
        var navicon = navEl.querySelector("#navicon");
        var navAnchors = navEl.querySelectorAll("a[href]");
        var pageElements = new Array(navAnchors.length);
        var navLists = navEl.querySelectorAll("ul ul");
        var navListIndex = new Array();

        /*Populate the pageElements array by mapping id to navAnchors href.*/
        for (i = 0; i < pageElements.length; ++i) {
            var idMatch = navAnchors[i].getAttribute("href").substring(1);
            var selector = idMatch.length > 0 ? "[id=" + idMatch + "]" : "body>section";
            pageElements[i] = document.querySelector(selector);

            //If this item is a child of the previous element, this is the first child within a new nav list.
            if (i > 0 && navAnchors[i].parentElement.parentElement.previousElementSibling == navAnchors[i - 1]) {
                navListIndex.push(i);
                navAnchors[i].parentElement.style.marginTop = (GetElementIndex(navAnchors[i].parentElement.parentElement.parentElement)*40).toString() + "px";
            }
        }

        /*Keeps the nav bar updated based upon the pages scroll position.*/
        window.onscroll = navScroll;
        window.onresize = navScroll;
        function navScroll(e) {
            var i, j, k,
                lastScrollTop;

            for (i = pageElements.length - 1; pageElements[i].getBoundingClientRect().top > 20; --i);

            var currentNavItem = navAnchors[i];

            /*Hide visible nav lists.*/
            {
                var visibleLists = navEl.querySelectorAll("ul ul");
                for (j = 0; j < visibleLists.length; ++j) {
                    visibleLists[j].classList.remove("visible");
                }
            }

            /*Unlight the previously highlighted nav items.*/
            {
                var selectedItems = navEl.querySelectorAll(".white");
                for (j = 0; j < selectedItems.length; ++j) {
                    selectedItems[j].classList.remove("white");
                }
            }            

            /*Handles positioning and animation of the second level navigation lists.*/
            {
                for (j = 0; j < navLists.length; ++j) {
                    navLists[j].style.marginTop = ((navListIndex[j] - i) * 40).toString() + "px";
                }
            }
            
            /*Highlight the appropriate elements.  Position the parent.*/
            {
                /*If the current element is second-level.*/
                if (GetElementDepth(currentNavItem) > 3) {
                    currentNavItem.classList.add("white");
                    /*Changes the current item context to the parent list.*/
                    currentNavItem = currentNavItem.parentElement.parentElement;
                    currentNavItem.classList.add("visible");
                    /*Changes the current item, once again, to the actual anchor.*/
                    currentNavItem = currentNavItem.previousElementSibling;
                }else if (currentNavItem.nextElementSibling != null) {
                    currentNavItem.nextElementSibling.classList.add("visible");
                }

                currentNavItem.classList.add("white");
                currentNavItem.parentElement.parentElement.style.marginTop = (GetElementIndex(currentNavItem.parentElement) * -40).toString() + "px";
            }

            {
                var currentAddr = pageElements[i].getAttribute("id");               //If null, redirect to the top.
                if (currentAddr == null) {
                    currentAddr = "";
                } else {
                    currentAddr = "#" + currentAddr;
                }

                window.history.replaceState({}, document.title, currentAddr);    //Update the browser URL to match.
            }
        }

        /*Returns the index position of a child element.*/
        function GetElementIndex(src) {
            var position = 0;
            while (src.previousElementSibling != null) {
                src = src.previousElementSibling;
                //The height condition prevents hidden elements from being counted, navicon is there because of the extra navicon element.
                if (src.style.height != "0px" && src.getAttribute("id") != "navicon") {
                    position++;
                }
            }
            return position;
        }

        /*Returns the distance between the nav element and one if its ancestors.*/
        function GetElementDepth(src) {
            var position = 0;
            while (src.tagName.toLowerCase() != "nav") {
                src = src.parentElement;
                position++;
            }
            return position;
        }

        if (window.location.href.indexOf("#") == -1) {
            navScroll();
        }
        document.removeEventListener("DOMContentLoaded", this);
    }
})();