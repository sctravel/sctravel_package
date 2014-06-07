function removeStopMobie()
{
 var date = new Date();
 date.setTime(date.getTime()-24*60*60*1000);
 document.cookie="stop_mobi=; domain=expedia.com; expires="+date.toGMTString()+"; path=/;";
}

/*
function for sticky element
use div with id scroller-anchor to set point on page at which the element should be become "fixed"
use div with id scroller-stop to set the lowest point on page at which the element should stop being "fixed"
*/
function stickyScroll(id,topPos,leftPos)
{
		// disable sticky scrolling for handheld devices
		if($(window).width() < 800 ||
			screen.width < 500 ||
			navigator.userAgent.match(/Android/i) ||
			navigator.userAgent.match(/webOS/i) ||
			navigator.userAgent.match(/BlackBerry/) ||
			navigator.userAgent.match(/iPhone/i) ||
			navigator.userAgent.match(/iPod/i) ||
			navigator.userAgent.match(/iPad/i))
			{
				$("#"+id).css({position:"relative", top:"", left:""})
			}else{
		  var a = function() {
			var b = $(window).scrollTop();
		    var d = $("#scroller-anchor").offset().top;
			var stop = $("#scroller-stop").offset().top;
			var c=$("#"+id);
		    if (b>d && b<stop) {
				c.css({position:"fixed", top:topPos+"px", left:leftPos+"px"})
		    } else {
		      	if (b<=d) {
		        	c.css({position:"relative", top:"", left:""})
		      	} else {
		      		if (b>=stop){
						c.css({position:"relative", top:"", left:""})
					}
				}
		    }
		  };
		  $(window).scroll(a);a()
		  }
}