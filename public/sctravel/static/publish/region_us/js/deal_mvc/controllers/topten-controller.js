var baseGDEDomain = "deals.expedia.com";
var baseGDEDomain = "deals.expedia.com";
var attemptRetry = false;
var APIkey = "";
if (window.location.hostname.indexOf("www.expedia.com") != -1) {
	var APIkey = "key=hlexplo2102&";	
}
//gdestaging.expediaoasis.com 

/*
ref: http://documentcloud.github.com/backbone/#Router

The router provides a routes hash that pairs routes to actions, "listens" for updates to the hash in the URL.  
Provides linkable, bookmarkable URLs for both tab and dropdown selection.
Called when the page loads, when toggling between tabs, or when dropdown menu changes. 
 
The main steps are:
1) Set display variable, update active tab and dropdown selection
2) Set column headers in the page so that they have the appropriate text values
3) Set collection variables to instances of the appropriate collection type
4) Set the view variables to new instances of DealView, while binding to the appropriate DOM element and collection
5) Set our URL variables to the appropriate URL
6) Call the 'fetch' function on the collections, with a callback to the views render function when successful
*/

var AppRouter = Backbone.Router.extend({
	routes: {
		"topten"			: "topten",
		"topten/:filters"	: "topten",
		"*default"			: "topten"
	},
	
	topten: function(filters){
		trackClick(this,'a',window.location.hash);
		toptenDefault(filters);
	},
	trackClick: function (linkObj,linkType,linkID) {
		s_exp.linkDelay=10;
		s_exp.linkTrackVars='prop16,eVar28,eVar18';
		s_exp.linkTrackEvents='None';
		s_exp.prop16=linkID;
		s_exp.eVar28=linkID;
		s_exp.tl(linkObj,'o','RFRR Action Link');
		s_exp.linkDelay=500;
		return;
	}
});

//Fetch the data with updated url.  Fetch will first clear out the
//collection, and render the views upon successful completion
//triggers error function if fetch fails
function fetchDeals(views) {
	$('#overlay').show();
	$('#updateInterstitial').show();
	
	$(views).each(function(key,value){
		views[key].model.fetch({
			success: function () 
			{				
				views[key].preRender();
				views[key].render();
				views[key].postRender();
				$('#overlay').hide();
				$('#updateInterstitial').hide();
			},
			error: function () { 
				$('div.error-message').remove();
				$('#overlay').hide();
				$('#updateInterstitial').hide();
				$(views[key].el).empty().append(views[key].errorMessage); 				
			}
		});
	});
}

function toptenDefault(filters){
	//initialize collection
	var dealsBatch1 = new HotelDealCollection();
	//Initialize the views.  This also binds the view to the appropriate shell element (col1, col2, col3)
	view1 = new HotelDealView({el: $('#tt-deals-list'), model: dealsBatch1});
	//choose template to use
	view1.template = view1.template5;
	//choose error message to use
	view1.errorMessage = view1.errorMessage2;
	//choose sort
	view1.model.comparator = undefined;
	
	//default date range set to 2 weeks 
	//default day of week is Friday 2 weeks out
	var defaultDateRange = secondDateRange
	var defaultDayOfWeek = ttDowDefault;
	
	
	//Set the URL for default settings
	dealsBatch1.url = 'http://' + baseGDEDomain + '/beta/deals/hotels.jsonp?' + APIkey + 'scoringMethod=rawAppealScore&numberOfResultsToReturn=10&onlyTopDestinations=true&lengthofStay=3&checkInDate=' + defaultDayOfWeek + '&maxPricePerNight=999&numberOfResultsPerHotel=1';
	
	if(filters)
	{	
		//check if dates filter is present
		if(filters.indexOf(';dates:') != -1){
			var datesFlag = true;
		}else{
			var datesFlag = false;
		};
		
		var filterParts = filters.split(';');
		for(var key=0; key<filterParts.length; key+=1)
		{
			var nameValPairs = filterParts[key].split(':');
			switch(nameValPairs[0])
			{
				case 'destination':
					$(availableGDECities).each(function(key,value){
						if(value.label == nameValPairs[1])
						{
							if(nameValPairs[1] != 'Anywhere') 
							{
								dealsBatch1.url = dealsBatch1.url.replace('&onlyTopDestinations=true','');
								//allow for multiple cities
								var cities = "%22" + encodeURI(value.city.split(',').join('","')) + "%22";
								//check if hotel name needs to contain a specific word
								//used for all-inclusive destinations
								if (!value.name){
									var hotelname = "";
								}else{
									var hotelname = value.name;
									dealsBatch1.url += '&name=' + hotelname;
								}
								//check for long destination name parameter
								if (!value.longDestinationName){
									var longdestname = "";
								}else{
									var longdestname = "%22" + encodeURI(value.longDestinationName) + "%22";
									var cities = "";
									dealsBatch1.url += '&longDestinationName=' + longdestname;
								}
								dealsBatch1.url += '&city=' + cities + '&province=' + value.province + '&country=' + value.country; 
								$('#dest-current').empty().val(value.label);
							}else{
								$('#dest-current').empty().val('Anywhere');
							}
						}
					});
					break;
				case 'staylength':
					if(nameValPairs[1].match(/^[1-7]$/)) 
					{ 
						dealsBatch1.url = dealsBatch1.url.replace('&lengthofStay=3','&lengthofStay='+nameValPairs[1]);
						$('ul#stayLength li a[data-id="' + nameValPairs[1] + '"]').addClass('tt-selected').parent('li').siblings('li').children('a').removeClass('tt-selected');
						var selectedText = $('ul#stayLength li a.tt-selected').text();
						$('#staylength-current').empty().text(selectedText);
					}
					break;
				case 'dow':
					var dayOfWeekStore = new Array();
					var dayMilli = 1000*60*60*24;
					var targetIndex = nameValPairs[1];
					if(targetIndex === 'Anytime')
					{
						if(datesFlag)
						{
							var anytimeFlag = true;
						}else{
							dealsBatch1.url = dealsBatch1.url.replace('&checkInDate=' + defaultDayOfWeek,'');
							dealsBatch1.url += '&checkInDate='+defaultDateRange;
						}
						$('ul#dayOfWeek li a[data-id="' + nameValPairs[1] + '"]').addClass('tt-selected').parent('li').siblings('li').children('a').removeClass('tt-selected');
						var selectedText = $('ul#dayOfWeek li a.tt-selected').text();
						$('#dow-current').empty().text(selectedText);
					}
					if(targetIndex.match(/^[0-6]$/))
					{
						var today = new Date();
						now = today.getTime();
						var cutoffDate = new Date(now+dayMilli*60);
						var firstTarget = new Date(now+dayMilli*((targetIndex-today.getDay()).mod(7)));
						dayOfWeekStore.push($.datepicker.formatDate('yy-mm-dd', $.datepicker.parseDate('@',firstTarget.getTime())));
						var nextTarget = new Date(firstTarget.getTime()+dayMilli*7);
						var count = 0;
						
						while(nextTarget.getTime() <= cutoffDate.getTime())
						{
							dayOfWeekStore.push($.datepicker.formatDate('yy-mm-dd', $.datepicker.parseDate('@',nextTarget.getTime())));
							nextTarget = new Date(nextTarget.getTime()+dayMilli*7);
							count++;
							if(count > 50) { break; }
						}
						if(datesFlag) {
							var checkInDates = dayOfWeekStore.join(',');
						}else{
							dealsBatch1.url = dealsBatch1.url.replace('&checkInDate=' + defaultDayOfWeek,'');
							var checkInDates = dayOfWeekStore.join(',');
							var checkInDatesAry = checkInDates.split(',');
							var checkInWDow = Array();
							$.each(defaultDateRange, function(i,val){
								if($.inArray(val, checkInDatesAry) > -1)
								{
									checkInWDow.push(val);
								}
							});
							if(checkInDates.length > 1)
							{
								dealsBatch1.url += '&checkInDate='+checkInWDow;
							}
						}
						$('ul#dayOfWeek li a[data-id="' + nameValPairs[1] + '"]').addClass('tt-selected').parent('li').siblings('li').children('a').removeClass('tt-selected');
						var selectedText = $('ul#dayOfWeek li a.tt-selected').text();
						$('#dow-current').empty().text(selectedText);	
					}
					break;
					case 'dates':
						if(nameValPairs[1].match(/^[0-6]$/))
						{
							switch(nameValPairs[1])
							{
								case '0': var checkInRange = firstDateRange; break;
								case '1': var checkInRange = secondDateRange; break;
								case '2': var checkInRange = thirdDateRange; break;
								case '3': var checkInRange = fourthDateRange; break;
								case '4': var checkInRange = fifthDateRange; break;
								case '5': var checkInRange = sixthDateRange; break;
								case '6': var checkInRange = seventhDateRange; break;
								default: var checkInRange = secondDateRange; break;
							}
							// check for day of week filter
							if(checkInDates){
								// day of week filter is present
								var checkInDatesAry = checkInDates.split(',');
								var checkInWDow = Array();
								$.each(checkInRange, function(i,val){
									if($.inArray(val, checkInDatesAry) > -1)
									{
										checkInWDow.push(val);
									}
								});
								dealsBatch1.url = dealsBatch1.url.replace('&checkInDate=' + defaultDayOfWeek,'');
								dealsBatch1.url += '&checkInDate='+checkInWDow;
							}else if(anytimeFlag){
								dealsBatch1.url = dealsBatch1.url.replace('&checkInDate=' + defaultDayOfWeek,'');
								dealsBatch1.url += '&checkInDate='+checkInRange;
							}else{
								// no day of week filter
								// use default day of week
								dealsBatch1.url = dealsBatch1.url.replace('&checkInDate=' + defaultDayOfWeek,'');
								var myDayOfWeekAry = new Array();
								var mySpecificAry = new Array();
								for (var i = 0; i < checkInRange.length; i++) {					
									var dateString = checkInRange[i].replace(/-/g,'/');
									var myDate = new Date(dateString);
									var myDayOfWeek = myDate.getDay();
									myDayOfWeekAry.push(myDayOfWeek);						
								}
								var myPosition = -1;
								for (var i = 0; i < myDayOfWeekAry.length; i++){
									//5 for default Friday
									if(myDayOfWeekAry[i]==5){
										myPosition = i;	
										mySpecificAry.push(myPosition);				
									}
								}
								if (mySpecificAry.length){
									if (mySpecificAry.length === 1){
										dealsBatch1.url += '&checkInDate='+checkInRange[mySpecificAry[0]];
									}else if (mySpecificAry.length === 2){
										dealsBatch1.url += '&checkInDate='+checkInRange[mySpecificAry[0]]+','+checkInRange[mySpecificAry[1]];
									}else{
										dealsBatch1.url += '&checkInDate='+checkInRange[mySpecificAry[0]];	
									}
								}else{
									dealsBatch1.url += '&checkInDate='+defaultDayOfWeek;
								}			
							}
							$('ul#dateRanges li a[data-id="' + nameValPairs[1] + '"]').addClass('tt-selected').parent('li').siblings('li').children('a').removeClass('tt-selected');	
							var selectedText = $('ul#dateRanges li a.tt-selected').text();
							$('#dates-current').empty().text(selectedText);
													
						}
					break;
				default:
					break;
			}
		}
	}
	fetchDeals(new Array(view1));
}

function startUp()
{	
	// initiate the router
	var app_router = new AppRouter();
	// start Backbone history a neccesary step for bookmarkable URLs
	Backbone.history.start();

}

//Proper implementation of modulus functionality.  Maps negative numbers to the proper integer space.
Number.prototype.mod = function(n) {
	return ((this%n)+n)%n;
}
