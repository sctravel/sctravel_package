/******************************************************************************
**
**  Copyright 2005-2011, Usability Sciences Corporation
**
**  Script created on Tuesday, August 14, 2012 at 12:51:59 PM.
**
******************************************************************************/
(function(){
/**************************************************************************
**
**  Uncomment the following line to disable WebIQ:
**
**************************************************************************/
//var disableWebIQ = true;

var fnMain = function()
{
    WebIQ.API
        .Config({CDN : "webiq-cdn-hr.appspot.com"})
        .Exec("WebIQ.WARP", function()
        {
            WebIQ.WARP.WarpIn({
                CustomerID : "{f9440b85-3ddc-49f8-802b-cffdf2f1ea4d}", /* Expedia */

                ServiceLocations : {
                    WebIQ   : "http://webiq005.webiqonline.com/WebIQ/DataServer/",
                    WARP    : "http://webiq-warp-hrd.appspot.com/Services/"
                }
            });
        });
};

(function(){if("undefined"===typeof disableWebIQ||!disableWebIQ){var b=function(){return"object"===typeof WebIQ?WebIQ&&WebIQ.API&&WebIQ.API.__LOADED__:!1};if(b())fnMain();else{var c=(new Date).getTime(),a;a=document.createElement("script");a.setAttribute("type","text/javascript");a.setAttribute("language","JavaScript");a.setAttribute("src",document.location.protocol+"//webiq-cdn-hr.appspot.com/js/min/WebIQ.API.js");document.getElementsByTagName("head")[0].appendChild(a);(function(){b()?fnMain():60>
((new Date).getTime()-c)/1E3&&window.setTimeout(arguments.callee,100)})()}}})();

}());