// get today's day of week
var todayDayOfWeek = new Date().getDay();
var baseGDEDomain = "deals.expedia.com";
var region_id = undefined;
var airport_code = undefined;
var attemptRetry = false;
var currentView = 'template1/';
var map;
var suggestDefault = 'Where do you want to go?';
var listEnabled = true;
var mapEnabled = false;
var defaultLatLngArray = new Array();
var highestMinScore = 0.0;
var currentFilters = {};
var mapCalloutTime = undefined;
var mapRecenter = true;
var scrollCount = 0;
var mileageAlert = false;

var date7Out = new Date();
date7Out.setDate(date7Out.getDate() + 7);
var date7Out2 = new Date();
date7Out2.setDate(date7Out2.getDate() + 7);
var date13Out = new Date();
date13Out.setDate(date13Out.getDate() + 13);
var date14Out = new Date();
date14Out.setDate(date14Out.getDate() + 14);
var date20Out = new Date();
date20Out.setDate(date20Out.getDate() + 20);
var date21Out = new Date();
date21Out.setDate(date21Out.getDate() + 21);
var date27Out = new Date();
date27Out.setDate(date27Out.getDate() + 27);
var date28Out = new Date();
date28Out.setDate(date28Out.getDate() + 28);
var date56Out = new Date();
date56Out.setDate(date56Out.getDate() + 56);
var date57Out = new Date();
date57Out.setDate(date57Out.getDate() + 57);
var date84Out = new Date();
date84Out.setDate(date84Out.getDate() + 84);
var date85Out = new Date();
date85Out.setDate(date85Out.getDate() + 85);
var date112Out = new Date();
date112Out.setDate(date112Out.getDate() + 112);
var date112Out2 = new Date();
date112Out2.setDate(date112Out2.getDate() + 112);

//7-13 days out
//1 week
var firstDateRange = getDateRange(date7Out,date13Out);
var minFirstDateRange = getMinDate(firstDateRange);
var maxFirstDateRange = getMaxDate(firstDateRange);
//14-20 days out
//2 weeks
var secondDateRange = getDateRange(date14Out,date20Out);
var minSecondDateRange = getMinDate(secondDateRange);
var maxSecondDateRange = getMaxDate(secondDateRange);
//21-27 days out
//3 weeks
var thirdDateRange = getDateRange(date21Out,date27Out);
var minThirdDateRange = getMinDate(thirdDateRange);
var maxThirdDateRange = getMaxDate(thirdDateRange);
//28-56 days out
//1 month
var fourthDateRange = getDateRange(date28Out,date56Out);
var minFourthDateRange = getMinDate(fourthDateRange);
var maxFourthDateRange = getMaxDate(fourthDateRange);
//57-84 days out
//2 months
var fifthDateRange = getDateRange(date57Out,date84Out);
var minFifthDateRange = getMinDate(fifthDateRange);
var maxFifthDateRange = getMaxDate(fifthDateRange);
//85-112 days out
//3 months
var sixthDateRange = getDateRange(date85Out,date112Out);
var minSixthDateRange = getMinDate(sixthDateRange);
var maxSixthDateRange = getMaxDate(sixthDateRange);
//7-no max days out
//Anytime
var seventhDateRange = getDateRange(date7Out2,date112Out2);
var minSeventhDateRange = getMinDate(seventhDateRange);
var maxSeventhDateRange = undefined;
//var maxSeventhDateRange = getMaxDate(seventhDateRange);

var defaultCruiseParams = {
	'minTripStartDate' : undefined,
	'maxTripStartDate' : undefined,
	'lengthofStay' : undefined,
	'embarkationPort' : undefined,
	'disembarkationPort' : undefined,
	'destination' : undefined,
	'ship' : undefined,
	'cruiseLine' : undefined,
	'shipFacts' : undefined,
	'numberOfResultsToReturn' : '100',
	'minPercentOff' : undefined,
	'maxPercentOff' : undefined
}

var baseHotelApi = '/beta/deals/hotels.jsonp?'
var baseFlightApi = '/beta/deals/flights.jsonp?'
var baseCruiseApi = '/beta/deals/cruises.jsonp?'
		
var baseParams = function (defaultParams) {
	var str = '';
	for(var i in defaultParams) {
		if(defaultParams[i]) {
			str += i+'='+defaultParams[i]+'&'
		}
	}
	return str;
}