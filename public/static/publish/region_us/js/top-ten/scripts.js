//date range calculations
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

var date7Out = new Date();
date7Out.setDate(date7Out.getDate() + 7);
var date8Out = new Date();
date8Out.setDate(date8Out.getDate() + 8);
var date14Out = new Date();
date14Out.setDate(date14Out.getDate() + 14);
var date15Out = new Date();
date15Out.setDate(date15Out.getDate() + 15);
var date21Out = new Date();
date21Out.setDate(date21Out.getDate() + 21);
var date22Out = new Date();
date22Out.setDate(date22Out.getDate() + 22);
var date28Out = new Date();
date28Out.setDate(date28Out.getDate() + 28);
var date29Out = new Date();
date29Out.setDate(date29Out.getDate() + 29);
var date35Out = new Date();
date35Out.setDate(date35Out.getDate() + 35);
var date36Out = new Date();
date36Out.setDate(date36Out.getDate() + 36);
var date42Out = new Date();
date42Out.setDate(date42Out.getDate() + 42);
var date43Out = new Date();
date43Out.setDate(date43Out.getDate() + 43);
var date50Out = new Date();
date50Out.setDate(date50Out.getDate() + 50);

//0-7 days out
var firstDateRange = getDateRange(new Date(),date7Out);
//8-14 days out
var secondDateRange = getDateRange(date8Out,date14Out);
//15-21 days out
var thirdDateRange = getDateRange(date15Out,date21Out);
//22-28 days out
var fourthDateRange = getDateRange(date22Out,date28Out);
//29-35 days out
var fifthDateRange = getDateRange(date29Out,date35Out);
//36-42 days out
var sixthDateRange = getDateRange(date36Out,date42Out);
//43-50 days out
var seventhDateRange = getDateRange(date43Out,date50Out);

//get Friday two weeks out for default
var ttToday = new Date();
var ttDayName = ttToday.getDay();
var ttDaysAway = null;
if (ttDayName === 0) {
	// Sunday
	ttDaysAway = 12;
} else if (ttDayName === 1) {
	// Monday
	ttDaysAway = 11;
} else if (ttDayName === 2) {
	// Tuesday
	ttDaysAway = 10;
} else if (ttDayName === 3) {
	// Wednesday
	ttDaysAway = 9;
} else if (ttDayName === 4) {
	// Thursday
	ttDaysAway = 8;
} else if (ttDayName === 5) {
	// Friday
	ttDaysAway = 14;
} else {
	// Saturday
	ttDaysAway = 13;
}
// for Hotels this weekend checkin date
var ttDowDefault = getDateForGDE(ttDaysAway);
// get today's day of week
var ttTodayDayOfWeek = new Date().getDay();

//Functionality to update URL hash codes.
function changeURI()
{
	var destination = ';destination:Anywhere';
	$(availableGDECities).each(function(key,value){
		if(value.label == $('#dest-current').val()) 
		{ 
			destination = ';destination:'+ encodeURI(value.label);
			//change All-Inclusive destinations to 5 night length of stay
			//only if length of stay filter hasn't been changed by user
			if(value.lengthOfStay)
			{
				if(!$('#stayLengthVal').val().length){
					$('#stayLengthVal').val(value.lengthOfStay);
				}
			}
		}
	});
	var dates = ($('#dateRangesVal').val().match(/^[0-6]$/))?';dates:'+$('#dateRangesVal').val():'';
	var staylength = ($('#stayLengthVal').val().match(/^[1-7]$/))?';staylength:'+$('#stayLengthVal').val():'';
	var dow = ($('#dayOfWeekVal').val().match(/^[0-6]$/) || $('#dayOfWeekVal').val() === 'Anytime')?';dow:'+$('#dayOfWeekVal').val():'';
	window.location.hash = 'topten/'+destination+staylength+dow+dates;
}
		
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
		
$(function(){

    $("ul#tt-main-nav li.dates-filter, ul#tt-main-nav li.length-filter, ul#tt-main-nav li.dow-filter").hover(function(){
    
        $(this).addClass("dd-open");
        $('ul:first',this).css('visibility', 'visible');
    
    }, function(){
    
        $(this).removeClass("dd-open");
        $('ul:first',this).css('visibility', 'hidden');
    
    });

	$('div.dropdown a').click(function(e){
		e.preventDefault();
	});

	$("ul.dd-menu li a").click(function(){
		var selected = $(this).text();
		var selectedVal = $(this).attr('data-id');
		$(this).parent('li').parent('ul.dd-menu').find('input').val(selectedVal);
		$(this).parent('li').parent('ul.dd-menu').siblings('div.dropdown').find('.dd-current').empty().text(selected);
		$(this).addClass('tt-selected');
		$(this).parent('li').siblings('li').children('a').removeClass('tt-selected');
		$(this).parent('li').parent('ul.dd-menu').parent('li').removeClass("dd-open");
        $(this).parent('li').parent('ul.dd-menu').css('visibility', 'hidden');
		changeURI();
		return false;
	});
	
	/*$("ul#dayOfWeek li a").click(function(){
		var selected = $(this).text();
		if (selected = "Anytime"){
			ttDowDefault = secondDateRange;
		}
	});*/
	
	$('#dest-current').click(function(){
		$(this).val('');
	});
	
	$('#dest-current').autocomplete({
		source: availableGDECities,
		appendTo: '#dest-choices',
		close: function (){
			changeURI();
			return false;
		}
	});
	
	$('a.dd-submit').click(function(){
			changeURI();
			return false;
	});
	
	// make entire topTenRow clickable
	$("ol#tt-deals-list").delegate('li.tt-deal-row', 'click', function (e) {
		window.location = $(this).find('a').attr('href');
		return false;
	});
	
	// stop Facebook login window pop-up on enter
	$(function()
	{
	    $('#dest-current').keydown(function(event) {
			if(event.keyCode == 13) 
			{
	        	event.preventDefault();
				event.stopPropagation();
			}
	    });
	});

});
