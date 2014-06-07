var Zoomer = Zoomer || {};
// Carry - carries departure selection from feature to another 
var carry = {
	selection: undefined,
	save: undefined,
	firstLoad: true,
	address: undefined,
	arrival_airport: undefined
};

var travelInMonth = {
	enabled: true,
	//transform date for GDE: from MMM YYYY to [YYYY-MM-01,YYY-MM-LD]
	transformDateForGDE: function (pDate){
		var months = "JanFebMarAprMayJunJulAugSepOctNovDec";
		var month = months.indexOf(pDate.substr(0,3)) / 3 + 1;
		var paddedMonth = (month < 10) ? '0'+month : month;
		var year = pDate.substr(4,4);
		var monthNumOfDays = new Date(year, paddedMonth, 0).getDate();
		return {min: year+"-"+paddedMonth+"-01", max: year+"-"+paddedMonth+"-"+monthNumOfDays};		
	}
};	

//date range calculations
function transformDate(date) {
	var month = date.substr(5, 2);
	var day = date.substr(8, 2).replace(/^0+/, '');
	var monthName = "";
	switch (month) {
		case '01': 
			monthName = "Jan";
			break;
		case '02': 
			monthName = "Feb";
			break;
		case '03':
			monthName = "Mar";
			break;
		case '04':
			monthName = "Apr";
			break;
		case '05':
			monthName = "May";
			break;
		case '06':
			monthName = "Jun";
			break;
		case '07':
			monthName = "Jul";
			break;
		case '08':
			monthName = "Aug";
			break;
		case '09':
			monthName = "Sep";
			break;
		case '10':
			monthName = "Oct";
			break;
		case '11':
			monthName = "Nov";
			break;
		case '12': 
			monthName = "Dec";
			break;
		default: 
			monthName = "";
	}
	var displayDate = monthName + " " + day
	return displayDate;
};

//get a date range
function getDateRange(newDate, endDate){
	var dateStrings = new Array();
	while (newDate <= endDate){
	  var dateD = newDate.getDate();
	  var dateDay = (dateD < 10) ? '0' + dateD : dateD;
	  var dateM = newDate.getMonth() + 1;
	  var dateMonth = (dateM < 10) ? '0' + dateM : dateM;
	  str = newDate.getFullYear() + "-" +
	        dateMonth + "-" +
	        dateDay;
	  dateStrings.push(str);
	  newDate.setDate(newDate.getDate()+1);
	}
	return dateStrings;
}

//get date in YYYY-MM-DD for GDE
function getDateForGDE(daysAway) {
	var date = new Date();
	date.setDate(date.getDate() + daysAway);
	var dateD = date.getDate();
	var dateDay = (dateD < 10) ? '0' + dateD : dateD;
	var dateM = date.getMonth() + 1;
	var dateMonth = (dateM < 10) ? '0' + dateM : dateM;
	var dateYear = date.getFullYear();
	var myDate = (dateYear + '-' + dateMonth + '-' + (dateDay));
	return myDate;
}

//get date in MM/DD/YYYYTHH:II for Flights
function getDateForFlights(daysAway,dayofWeek,duration) {
	var date = new Date();
	date.setDate(date.getDate() + parseInt(daysAway));
	var daysToAdd = (dayofWeek-date.getDay()).mod(7);
	date.setDate(date.getDate() + daysToAdd + parseInt(duration));
	var dateD = date.getDate();
	var dateDay = (dateD < 10) ? '0' + dateD : dateD;
	var dateM = date.getMonth() + 1;
	var dateMonth = (dateM < 10) ? '0' + dateM : dateM;
	var dateYear = date.getFullYear();
	var myDate = (dateMonth + '/' + dateDay + '/' + dateYear);
	return myDate;
}

//get date in MM/DD/YYYY for Flights
function getDateForHotels(daysAway,dayofWeek,duration) {
	var date = new Date();
	date.setDate(date.getDate() + parseInt(daysAway));
	var daysToAdd = (dayofWeek-date.getDay()).mod(7);
	date.setDate(date.getDate() + daysToAdd + parseInt(duration));
	var dateD = date.getDate();
	var dateDay = (dateD < 10) ? '0' + dateD : dateD;
	var dateM = date.getMonth() + 1;
	var dateMonth = (dateM < 10) ? '0' + dateM : dateM;
	var dateYear = date.getFullYear();
	var myDate = (dateMonth + '/' + dateDay + '/' + dateYear);
	return myDate;
}

function getCruiseDateRange(newDate, endDate){
	var dateStrings = new Array();
	while (newDate <= endDate){
	  var dateD = newDate.getDate();
	  var dateDay = (dateD < 10) ? '0' + dateD : dateD;
	  var dateM = newDate.getMonth() + 1;
	  var dateMonth = (dateM < 10) ? '0' + dateM : dateM;
	  str = newDate.getFullYear() + "-" +
	        dateMonth + "-" +
	        dateDay;
	  dateStrings.push(str);
	  newDate.setDate(newDate.getDate()+1);
	}
	return dateStrings;
}

//get full year from YYYY-MM-DD formatted date
function getYear(date){
	var year = date.substr(0, 4);
    return year;
}

//format date from YYYY-MM-DD to Mon-DD format
function transformDate(date) {
	var month = date.substr(5, 2);
	var day = date.substr(8, 2).replace(/^0+/, '');
	var monthName = "";
	switch (month) {
		case '01': 
			monthName = "Jan";
			break;
		case '02': 
			monthName = "Feb";
			break;
		case '03':
			monthName = "Mar";
			break;
		case '04':
			monthName = "Apr";
			break;
		case '05':
			monthName = "May";
			break;
		case '06':
			monthName = "Jun";
			break;
		case '07':
			monthName = "Jul";
			break;
		case '08':
			monthName = "Aug";
			break;
		case '09':
			monthName = "Sep";
			break;
		case '10':
			monthName = "Oct";
			break;
		case '11':
			monthName = "Nov";
			break;
		case '12': 
			monthName = "Dec";
			break;
		default: 
			monthName = "";
	}
	var displayDate = monthName + " " + day
	return displayDate;
};

//get abbreviated day of week name
function transformDayOfWeekAbbr(day) {
	switch (day) {
		case 0: 
			dayName = "Sun";
			break;
		case 1: 
			dayName = "Mon";
			break;
		case 2:
			dayName = "Tue";
			break;
		case 3:
			dayName = "Wed";
			break;
		case 4:
			dayName = "Thu";
			break;
		case 5:
			dayName = "Fri";
			break;
		case 6:
			dayName = "Sat";
			break;
		default: 
			dayName = "";
	}
	return dayName;
}

// get first date from a date range
function getMinDate(dateRange){
	var minDate = dateRange[0];
	return minDate;
}

// get last date from a date range
function getMaxDate(dateRange){
	var maxDate = $(dateRange).last()[0];
	return maxDate;
}

// add commas to prices > $1000
function addCommas(nStr)
{
	nStr += '';
	x = nStr.split('.');
	x1 = x[0];
	x2 = x.length > 1 ? '.' + x[1] : '';
	var rgx = /(\d+)(\d{3})/;
	while (rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	return x1 + x2;
}

//function for an anchored "sticky" div
function moveScroller() {
if($(window).width() < 800 ||
	screen.width < 500 ||
	navigator.userAgent.match(/Android/i) ||
	navigator.userAgent.match(/webOS/i) ||
	navigator.userAgent.match(/BlackBerry/) ||
	navigator.userAgent.match(/iPhone/i) ||
	navigator.userAgent.match(/iPod/i) ||
	navigator.userAgent.match(/iPad/i))
	{
		$(".scroller").css({position:"relative", top:""})
	}else{
  var a = function() {
	var b = $(window).scrollTop();
    var d = $("#scroller-anchor").offset().top;
	var stop = $("#scroller-stop").offset().top;
	var c=$(".scroller");
    if (b>d && b<stop) {
		c.css({position:"fixed", top:"0px"})
    } else {
      	if (b<=d) {
        	c.css({position:"relative", top:""})
      	} else {
      		if (b>=stop){
				c.css({position:"relative", bottom:"0px"})
			}
		}
    }
  };
  $(window).scroll(a);a()
  }
}

//scroll to top link
function initObjTop(id)
{
	var scrllObj = $("#"+id);
	if($(window).scrollTop() > 300){
		scrllObj.css("left", ($("#mainContainer").innerWidth() - (scrllObj.innerWidth()+18)) + "px").fadeIn();
		scrllObj.unbind().bind("click", function(){window.scrollTo(0,0);});
	} else {
	   $(scrllObj).fadeOut("slow");
	}
}

//Proper implementation of modulus functionality.  Maps negative numbers to the proper integer space.
Number.prototype.mod = function(n) {
	return ((this%n)+n)%n;
}

function omnitureTrack(value)
{
	trackClick(this, 'a', value);
}

function mapFilters(currentFilters, currentLOB, targetLOB, currentTemplate, element)
{
	if(!element || !element.attr('href')) {
		return false;
	}
	var currentHref = element.attr('href');
	if(currentHref && currentHref.indexOf('#') != -1) {
		currentHref = currentHref.split('#')[0];
	}
	var baseUrl = {
		hotel : '#!hotel/'+currentTemplate+'/closest/',
		flight : '#!flight/'+currentTemplate+'//',
		packages : '#!package/'+currentTemplate+'//departure:closest;airline:Any',
		cruise : '#!cruise/'+currentTemplate+'//'
	}
	var mappings = {
		flight : {
			hotel : {
				minprice : function(x) { return ';minprice:'+x; },
				maxprice : function(x) { return ';maxprice:'+x; },
				staylength : function(x) { return ';staylength:'+x; },
				dow : function(x) { return ';dow:'+x; },
				dates : function(x) { return ';dates:'+x; },
				lat : function(x) { return ';lat:'+x; },
				lng : function(x) { return ';lng:'+x; },
				miles : function(x) { return ';miles:'+x; },
				arrival : function(x) { 
					if (x == 'choose') { return ';destination:'+x; }
					else if (x == 'anywhere') { return ';destination:popular'; }
					return '';
				},
				arrival_name : function(x) { return ';destination_name:'+x; },
				arrival_metro : function(x) { return ';airport:' +x; }
			},
			packages : {
				staylength : function(x) { return ';staylength:'+x; },
				dow : function(x) { return ';dow:'+x; },
				dates : function(x) { return ';dates:'+x; },
				lat : function(x) { return ';lat:'+x; },
				lng : function(x) { return ';lng:'+x; },
				miles : function(x) { return ';miles:'+x; },
				departure : function(x) { 
					if(x == 'anywhere' || x == 'closest' || x == 'choose') { return ';departure:'+x; }
					return '';
				},
				arrival : function(x) { 
					if(x == 'anywhere' || x == 'choose') { return ';arrival:'+x; }
					return '';
				},
				departure_name : function(x) { return ';departure_name:'+x; },
				departure_metro : function(x) { return ';departure_metro:'+x; },
				departure_airport : function(x) { return ';departure_airport:'+x; },
				arrival_name : function(x) { return ';arrival_name:'+x; },
				arrival_metro : function(x) { return ';arrival_airport:'+x; },
				airline : function(x) {return ';airline:'+x; }
			},
			cruise : {
				arrival_metro : function(x) { return ';arrival_airport:'+x; },
				arrival_name : function(x) { return ';embarkation:'+x; }
			}
		},
		hotel : {
			flight : {
				minprice : function(x) { return ';minprice:'+x; },
				maxprice : function(x) { return ';maxprice:'+x; },
				staylength : function(x) { return ';staylength:'+x; },
				dow : function(x) { return ';dow:'+x; },
				dates : function(x) { return ';dates:'+x; },
				destination : function(x) { 
					if(x == 'closest' || x == 'choose') { return ';arrival:'+x; }
					if(x === 'popular') { return ';arrival:anywhere'; }
					return '';
				},
				destination_name : function(x) { return ';arrival_name:'+x; },
				airport : function(x) { return ';arrival_metro:'+x; },
				province : function(x) { return ';arrival_state:'+x; }
			},
			packages : {
				staylength : function(x) { return ';staylength:'+x; },
				dow : function(x) { return ';dow:'+x; },
				dates : function(x) { return ';dates:'+x; },
				lat : function(x) { return ';lat:'+x; },
				lng : function(x) { return ';lng:'+x; },
				province : function(x) { return ';province:'+x; },
				country : function(x) { return ';country:'+x; },
				miles : function(x) { return ';miles:'+x; },
				minstar : function(x) { return ';minstar:'+x; },
				destination : function(x) { 
					if(x == 'closest' || x == 'choose') { return ';arrival:'+x; }
					if(x == 'popular') { return ';arrival:anywhere'; }					
					return '';
				},
				destination_name : function(x) { return ';arrival_name:'+x; },
				airport : function(x) { return ';arrival_airport:' +x; },
				region : function(x) { return ';region:' +x; },
				zoom: function(x) {return ';zoom:'+x; }
			},
			cruise : {
				airport : function(x) { return ';arrival_airport:'+x; },
				destination_name : function(x) { return ';embarkation:'+x; }
			}
		},
		packages : {
			flight : {
				staylength : function(x) { return ';staylength:'+x; },
				dow : function(x) { return ';dow:'+x; },
				dates : function(x) { return ';dates:'+x; },
				departure : function(x) { 
					if(x == 'closest' || x == 'choose' || x == 'arrival') { return ';departure:'+x; }
					return '';
				},
				arrival : function(x) { 
					if(x == 'anywhere' || x == 'choose') { return ';arrival:'+x; }
					return '';
				},
				departure_name : function(x) { return ';departure_name:'+x; },
				departure_metro : function(x) { return ';departure_metro:'+x; },
				departure_airport : function(x) { return ';departure_airport:'+x; },
				arrival_name : function(x) { return ';arrival_name:'+x; },
				arrival_airport : function(x) { return ';arrival_metro:'+x; },				
				airline : function(x) {return ';airline:'+x; }
			},
			hotel : {
				staylength : function(x) { return ';staylength:'+x; },
				dow : function(x) { return ';dow:'+x; },
				dates : function(x) { return ';dates:'+x; },
				lat : function(x) { return ';lat:'+x; },
				lng : function(x) { return ';lng:'+x; },
				province : function(x) { return ';province:'+x; },
				country : function(x) { return ';country:'+x; },
				miles : function(x) { return ';miles:'+x; },
				minstar : function(x) { return ';minstar:'+x; },
				arrival : function(x) { 
					if (x == 'choose') { return ';destination:'+x; }
					else if (x == 'anywhere') { return ';destination:popular'; }
					return '';
				},
				arrival_name : function(x) { return ';destination_name:'+x; },
				arrival_airport : function(x) { return ';airport:' +x; },
				region : function(x) { return ';region:' +x; },
				zoom: function(x) {return ';zoom:'+x; }
			},
			cruise : {
				arrival_airport : function(x) { return ';arrival_airport:' +x; },
				arrival_name : function(x) { return ';embarkation:'+x; }
			}
		},
		cruise : {
			flight : {
				arrival_airport : function(x) { return ';arrival_metro:' +x; },
				embarkation: function(x) { 
					if (x == 'Anywhere') { return ';arrival:anywhere'; }
					return ';arrival:choose;arrival_name:'+x;
				}
			},
			packages : {
				arrival_airport : function(x) { return ';arrival_airport:' +x; },
				embarkation: function(x) {
					if (x == 'Anywhere') { return ';arrival:anywhere'; }
					return ';arrival:choose;arrival_name:'+x;
				}
			},
			hotel : {
				arrival_airport : function(x) { return ';airport:'+x; },
				embarkation: function(x) {
					if (x == 'Anywhere') { return ';destination:popular'; }
					return ';destination:choose;destination_name:'+x;
				}
			}
		}
	}
	if(!currentFilters || !currentLOB || !targetLOB || currentFilters.length==0) {
		return baseUrl.hotel;
	}
	
	var finalStr = '';
	if(typeof mappings[currentLOB] != 'undefined' && typeof mappings[currentLOB][targetLOB] != 'undefined') {
		for(var i in currentFilters) {
			if(i && typeof mappings[currentLOB][targetLOB][i] != 'undefined') {
				finalStr += mappings[currentLOB][targetLOB][i](currentFilters[i]);
			}
		}
	}
	
	element.attr('href',currentHref+baseUrl[targetLOB]+finalStr);
}

/* making deals equal height by rows */
function setDealHeight(classname){
	var currentTallest = 0,
     	currentRowStart = 0,
     	rowDivs = new Array(),
     	$el,
     	topPosition = 0;

 		$('.' + classname).each(function() {

   			$el = $(this);
   			topPostion = $el.position().top;
   
   			if (currentRowStart != topPostion) {

     			// we just came to a new row.  Set all the heights on the completed row
     			for (currentDiv = 0 ; currentDiv < rowDivs.length ; currentDiv++) {
       				rowDivs[currentDiv].height(currentTallest);
     			}

     			// set the variables for the new row
     			rowDivs.length = 0; // empty the array
     			currentRowStart = topPostion;
     			currentTallest = $el.height();
     			rowDivs.push($el);

   			} else {

     			// another div on the current row.  Add it to the list and check if it's taller
     			rowDivs.push($el);
     			currentTallest = (currentTallest < $el.height()) ? ($el.height()) : (currentTallest);

  			}
   
  			// do the last row
   			for (currentDiv = 0 ; currentDiv < rowDivs.length ; currentDiv++) {
     			rowDivs[currentDiv].height(currentTallest);
   			}
   
 		});
}