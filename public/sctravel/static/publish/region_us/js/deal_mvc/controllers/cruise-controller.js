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
var baseGDEDomain = "deals.expedia.com";
var APIkey = "";
if (window.location.hostname.indexOf("www.expedia.com") != -1) {
	var APIkey = "key=dfexplo1802&";
}
var AppRouter = Backbone.Router.extend({
	routes: {
		"!cruise"							: "cruise",
		"!cruise/:template/:sort/:filters"	: "cruise",
		"cruise"							: "cruise",
		"cruise/:template/:sort/:filters"	: "cruise",
		"*default"							: "cruise"
	},
	cruise: function(template,sort,filters){
		cruiseDefault(template,sort,filters);
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
				$(views[key].el).empty();
				$(views[key].el).append(views[key].GDEerrorMessage);
				$('#overlay').hide();
				$('#updateInterstitial').hide();
			}
		});
	});
}

function cruiseDefault(template,sort,filters){
	currentDealSet = 'cruise/';
	//initialize collection
	var dealsBatch1 = new CruiseDealCollection();
	//Initialize the views.  This also binds the view to the appropriate shell element (col1, col2, col3)
	view1 = new CruiseDealView({el: $('#dealContent'), model: dealsBatch1});
	//view1.model.comparator = view1.model.sortByPriceInterior;
	dealsBatch1.url = 'http://' + baseGDEDomain + baseCruiseApi + APIkey;
	mcicid = mcicidPromo + getPromoType(dealsBatch1.url.toLowerCase()); //set base mcicid tag
	
	//Set the template the views should use
	switch(template)
	{
		case 'template2':
			view1.template = view1.diagnosticTemplate();
			mcicid += 'Grid.'
			break;
		case 'list':
			if(listEnabled)
			{
				view1.template = view1.list;
				view1.mapDisplay = false;
				currentView = 'list/';
				$('ul#display > li > a').each(function(key,value){
					if($(value).attr('data-id') == 'list/') { $(this).addClass('display-active'); }
					else{$(this).removeClass('display-active');}
				});
				mcicid += 'List.'
			}
			break;
		default:
			if (template === ''){			
				// -- Reset all filters values when loading the page
				$('#embarkation-current').empty().text('Anywhere');
				$('#destination-current').empty().text('Anywhere');
				$('#cruise-line-current').empty().text('Any');
				$('#cruise-type-current').empty().text('Any');
				$('#staylength-current').empty().text('Any');
				$('#dates-current').empty().text('Anytime');
				// --
				$('#embarkationVal').val('Anywhere');
				$('#destinationVal').val('Anywhere');
				$('#cruiseLineVal').val('Any');
				$('#cruiseTypeVal').val('Any');
				$('#dateRangesVal').val('Anytime');
				$('#stayLengthVal').val('Any');
			}
			currentView = 'template/';
			$('#display-opts > li > [data-id="template1/"]').addClass('display-active');
			mcicid += 'Grid.'
			break;
	}
	//Select the sorting method for the returned deals
	switch(sort)
	{
		case 'price':
			view1.model.comparator = view1.model.sortByPriceInterior;
			$('#sort > li > a').each(function(key,value){
				if($(value).attr('data-id') == 'price/') { $(this).addClass('sort-selected'); }
				else{$(this).removeClass('sort-selected');}
			});
			break;
		case 'discount':
			view1.model.comparator = view1.model.sortByPercentOffDesc;
			$('#sort > li > a').each(function(key,value){
				if($(value).attr('data-id') == 'discount/') { $(this).addClass('sort-selected'); }
				else{$(this).removeClass('sort-selected');}
			});
			break;
		case 'value':
			view1.model.comparator = undefined;
			$('#sort > li > a').each(function(key,value){
				if($(value).attr('data-id') == 'value/') { $(this).addClass('sort-selected'); }
				else{$(this).removeClass('sort-selected');}
			});
			break;
		default:
			$('#sort li [data-id="distanceFromUser/"]').addClass('sort-selected');
			break;
	}
	
	//Set the deal collection fetch URL
	dealsBatch1.url = 'http://' + baseGDEDomain + baseCruiseApi + APIkey + baseParams(defaultCruiseParams);

	var currentFilters = {
		mapEmbarkation : function() {
			if(this.embarkation) {
				switch(this.embarkation) {
					case 'Anywhere': 
						return undefined;
						break;
					default: 
						return this.embarkation;
						break;
				}
			}
		},
		mapDestination : function() {
			if(this.destination) {
				switch(this.destination) {
					case 'Anywhere': 
						return undefined;
						break;
					default: 
						return this.destination.replace('_','/');
						break;
				}
			}
		},
		mapCruiseLine : function() {
			if(this.cruiseline) {
				switch(this.cruiseline) {
					case 'Any': 
						return undefined;
						break;
					default: 
						return this.cruiseline;
						break;
				}
			}
		},
		mapTravelingMonth : function() {
			if(this.dates) {
				switch(this.dates) {
					case 'Anytime': 
						return undefined;
						break;
					default: 						
						return this.dates;
						break;
				}
			}
		},
		mapStayLengh : function() {
			if(this.staylength) {
				switch(this.staylength) {
					case 'Any': 
						return undefined;
						break;
					default: 						
						return this.staylength;
						break;
				}
			}
		}
	};

	//determine if any filters have been passed in
	if(filters)
	{
		dealsBatch1.url = 'http://' + baseGDEDomain + baseCruiseApi + APIkey + 'numberOfResultsToReturn=100';
		//check if dates filter is present
		if(filters.indexOf(';dates:') != -1){
			var datesFlag = true;
		}else{
			var datesFlag = false;
		};
		//split the filters on the filter delimiter
		var filterParts = filters.split(';');
		
		$.map( filterParts, function(n){
			var parts = n.split(':');
			currentFilters[parts[0]] = parts[1];
		});

		mapFilters(currentFilters, 'cruise', 'flight', template, $('#flight-tab-link'));
		mapFilters(currentFilters, 'cruise', 'packages', template, $('#package-tab-link'));
		mapFilters(currentFilters, 'cruise', 'hotel', template, $('#hotel-tab-link'));
		
		//loop through all found filters
		for(var key in filterParts)
		{
			//split the filter sets on the filter set delimiter
			var nameValPairs = filterParts[key].split(':');
			//switch based on the filter name, validate the data in the value and update the DealCollection URL based with the value mapped to the appropriate GDE API variable
			switch(nameValPairs[0])
			{
				case 'embarkation':
					if(nameValPairs[1].match(/^[a-zA-Z-(),.' ]*$/)){
						var targetIndex = nameValPairs[1];
						if(targetIndex != 'Anywhere')
						{
							var portName = targetIndex.split(',')[0].split('(')[0];
							dealsBatch1.url += '&embarkationPort=%22'+portName+'%22';
							$('#embarkation-current').attr('data-id',targetIndex);
							// For carrying over from another tab
							$("#departure_suggest").val(decodeURIComponent(portName));
							carry.url = dealsBatch1.url;
							carry.save = nameValPairs[1].split('(')[0].split('%20').join(' ').replace(/^\s\s*/, '').replace(/\s\s*$/, '').split(',')[0];
														
						}else{
							$('#embarkation-current').attr('data-id','');
						}
						$('#embarkationVal').unbind("change");
						$('#embarkationVal').val(targetIndex);
						$('#embarkationVal').change(function(event){omnitureTrack(rfrrId + 'SrchEmbarkation'); changeURI();});						
					}	
					break;
				case 'destination':
					if(nameValPairs[1].match(/^[a-zA-Z-(),.'_ ]*$/)){
						var targetIndex = nameValPairs[1];
						if(targetIndex != 'Anywhere')
						{
							if (targetIndex.indexOf('_') != -1){
								var targetIndexSlashed = targetIndex.replace('_','/');
								var targetForGDE = targetIndexSlashed.split('/');
								dealsBatch1.url += '&destination=%22'+targetForGDE[0]+'%22';
								$('#destination-current').attr('data-id',targetIndexSlashed);
							}else{
								dealsBatch1.url += '&destination=%22'+targetIndex+'%22';
								$('#destination-current').attr('data-id',targetIndex);
							}
						}else{
							$('#destination-current').attr('data-id','');
						}
						$('#destinationVal').unbind("change");
						$('#destinationVal').val(targetIndex);
						$('#destinationVal').change(function(event){omnitureTrack(rfrrId + 'SrchDestination'); changeURI();});
					}
					break;
				case 'cruiseline':
					if(nameValPairs[1].match(/^[a-zA-Z ]*$/))
					{
						var targetIndex = nameValPairs[1];
						if(targetIndex != 'Any')
						{
							var cruiseLineFirstWord = targetIndex.split(' ');
							dealsBatch1.url += '&cruiseLine='+cruiseLineFirstWord[0];
							$('#cruise-line-current').attr('data-id',targetIndex);
						}else{
							$('#cruise-line-current').attr('data-id','');
						}
						$('#cruiseLineVal').unbind("change");
						$('#cruiseLineVal').val(targetIndex);
						$('#cruiseLineVal').change(function(event){omnitureTrack(rfrrId + 'SrchCruiseLine'); changeURI();});
					}	
					break;
				case 'cruisetype':
					if(nameValPairs[1].match(/^[a-zA-Z ]*$/))
					{
						var targetIndex = nameValPairs[1];
						if(targetIndex != 'Any')
						{
							dealsBatch1.url += '&category='+targetIndex;
							$('#cruise-type-current').attr('data-id',targetIndex);
						}else{
							$('#cruise-type-current').attr('data-id','');
						}
						$('#cruiseTypeVal').unbind("change");
						$('#cruiseTypeVal').val(targetIndex);
						$('#cruiseTypeVal').change(function(event){omnitureTrack(rfrrId + 'SrchCruiseType'); changeURI();});
					}	
					break;
				case 'dates':	
					if (travelInMonth.enabled) {
						if (nameValPairs[1] !== "Anytime"){
							var tripStartDate = travelInMonth.transformDateForGDE(nameValPairs[1]);							
							dealsBatch1.url += '&minTripStartDate='+tripStartDate.min+'&maxTripStartDate='+tripStartDate.max;
							$('#dateRangesVal').unbind("change");
							$('#dateRangesVal').val(nameValPairs[1]);
							$('#dateRangesVal').change(function(event){omnitureTrack(rfrrId + 'SrchWindow'); changeURI();});
							$('ul#dateRanges li a[data-id="' + nameValPairs[1] + '"]').addClass('selected').parent('li').siblings('li').children('a').removeClass('selected');
							var selectedText = $('ul#dateRanges li a.selected').text();
							$('#dates-current').empty().text(selectedText);
						}
					} else {
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
							if (nameValPairs[1] === '6'){
								dealsBatch1.url += '&minTripStartDate='+getMinDate(checkInRange);
							}else{
								dealsBatch1.url += '&minTripStartDate='+getMinDate(checkInRange)+'&maxTripStartDate='+getMaxDate(checkInRange);
							}
							$('#dateRangesVal').unbind("change");
							$('#dateRangesVal').val(nameValPairs[1]);
							$('#dateRangesVal').change(function(event){omnitureTrack(rfrrId + 'SrchWindow'); changeURI();});
							$('ul#dateRanges li a[data-id="' + nameValPairs[1] + '"]').addClass('selected').parent('li').siblings('li').children('a').removeClass('selected');
							var selectedText = $('ul#dateRanges li a.selected').text();
							$('#dates-current').empty().text(selectedText);
						}
					}
					break;					
				case 'staylength':
					if(nameValPairs[1] >= 0 && nameValPairs[1] <= 5) 
					{ 
						if (nameValPairs[1] !== '0'){
							switch(nameValPairs[1])
							{
								case '1': dealsBatch1.url += '&minLengthOfStay=1&maxLengthOfStay=2'; break;
								case '2': dealsBatch1.url += '&minLengthOfStay=3&maxLengthOfStay=5'; break;
								case '3': dealsBatch1.url += '&minLengthOfStay=6&maxLengthOfStay=9'; break;
								case '4': dealsBatch1.url += '&minLengthOfStay=10&maxLengthOfStay=14'; break;
								case '5': dealsBatch1.url += '&minLengthOfStay=15'; break;
								default: dealsBatch1.url += ''; break;
							}
						}
						$('#stayLengthVal').unbind("change");
						$('#stayLengthVal').val(nameValPairs[1]);
						$('#stayLengthVal').change(function(event){omnitureTrack(rfrrId + 'SrchDuration'); changeURI();});
						$('ul#staylength li a[data-id="' + nameValPairs[1] + '"]').addClass('selected').parent('li').siblings('li').children('a').removeClass('selected');
						var selectedText = $('ul#staylength li a.selected').text();
						$('#staylength-current').empty().text(selectedText);
					}
					break;
				case 'departure_name':
					if(nameValPairs[1].match(/^.+$/)) { 
						$("#departure_suggest").val(decodeURIComponent(nameValPairs[1]));					
						carry.save = nameValPairs[1].split('(')[0].split('%20').join(' ').replace(/^\s\s*/, '').replace(/\s\s*$/, '').split(',')[0];						
						dealsBatch1.url += '&embarkationPort="'+decodeURIComponent(carry.save)+'"';						
					}
					break;
				case 'arrival_airport':
					if(nameValPairs[1].match(/^.+$/)) {						
						carry.arrival_airport = nameValPairs[1];
					}
					break;
				default:
					break;
			}
		}
		updateControls();
	}else{
		initControls();
	}	
	
	view1.alternateSearchResults = function() {
		var filterSet = currentFilters;
		var baseCruiseRedirect = 'http://www.expedia.com/pubspec/scripts/eap.asp?GOTO=CRUISESEARCH';
		if (window.location.hostname.indexOf("www.expedia-aarp.com") != -1 || window.location.hostname.indexOf("wwwexpedia-aarpcom") != -1){
			baseCruiseRedirect = 'http://www.expedia-aarp.com/pubspec/scripts/eap.asp?GOTO=CRUISESEARCH';
      	}
		var paramList = {
			'dp' : '{{#mapEmbarkation}}{{mapEmbarkation}}{{/mapEmbarkation}}',
			'ds' : '{{#mapDestination}}{{mapDestination}}{{/mapDestination}}',
			'cl' : '{{#mapCruiseLine}}{{mapCruiseLine}}{{/mapCruiseLine}}'	
		};
		var formatParamList = function() {
			var str = '';
			try{
				for(var key in paramList) {
					if(paramList[key]) { 
						var parsedValue = Mustache.to_html(paramList[key],currentFilters);
						if(parsedValue.length > 0) {
							str += '&'+key+'='+Mustache.to_html(paramList[key],currentFilters);
						}
					}
				}
			} catch(exception){}
			return baseCruiseRedirect+str;
		};
		return formatParamList();
	}
	fetchDeals(new Array(view1));
}

function startUp()
{	
	// initiate the router
	var app_router = new AppRouter();
	// start Backbone history a neccesary step for bookmarkable URLs
	Backbone.history.start();
	
	$('#sort_type').change(changeURI);
	$('#stayLengthVal').change(function(event){omnitureTrack(rfrrId + 'SrchDuration'); changeURI();});
	$('#dateRangesVal').change(function(event){omnitureTrack(rfrrId + 'SrchWindow'); changeURI();});
	$('#embarkationVal').change(
		function(event){
			omnitureTrack(rfrrId + 'SrchEmbarkation');  
			carry.arrival_airport = undefined;
			changeURI();
		}
	);
	$('#destinationVal').change(function(event){omnitureTrack(rfrrId + 'SrchDestination'); changeURI();});
	$('#cruiseLineVal').change(function(event){omnitureTrack(rfrrId + 'SrchCruiseLine'); changeURI();});
		
	//s$('ul#location li a').unbind().bind("click", function(){omnitureTrack(rfrrId + 'Location');});
	var currentDate = new Date();
	$('div.dropdown a').click(function(e){
		e.preventDefault();
	});
	
	$(document).keydown(function(event){
		if(event.keyCode == 13) 
		{ 
			event.preventDefault();
			event.stopPropagation(); 
		}
	});
	
	var scrllObj = $("#scrllToTopObj");
	scrllObj.bind("click", function(){window.scrollTo(0,0);});
}

function updateSelectedEmbarkation() {
	var currentEmbarkation = $('#embarkationVal').val();
	$('ul#embarkation_port > li > a').each(function(key,value){
		if($(value).attr('data-id') === currentEmbarkation) { $(this).addClass('selected'); }
		else{$(this).removeClass('selected');}
	});
	var selectedText = $('ul#embarkation_port li a.selected:first').text();
	$('#embarkation-current').empty().text(selectedText);
}

function updateSelectedDestination() {
	var currentDestination = $('#destinationVal').val();
	$('ul#destination_port > li > a').each(function(key,value){
		if($(value).attr('data-id') === currentDestination) { $(this).addClass('selected'); }
		else{$(this).removeClass('selected');}
	});
	var selectedText = $('ul#destination_port li a.selected:first').text();
	$('#destination-current').empty().text(selectedText);
}

function updateSelectedCruiseLine() {
	var currentDestination = $('#cruiseLineVal').val();
	$('ul#cruise_line li a[data-id="' +currentDestination+ '"]').addClass('selected').parent('li').siblings('li').children('a').removeClass('selected');
	var selectedText = $('ul#cruise_line li a.selected').text();
	$('#cruise-line-current').empty().text(selectedText);
}

function updateSelectedTravelingIn() {
	var currentTravelingIn = $('#dateRangesVal').val();	
	$('ul#dateRanges li a[data-id="' +currentTravelingIn+ '"]').addClass('selected').parent('li').siblings('li').children('a').removeClass('selected');
	var selectedText = $('ul#dateRanges li a.selected').text();
	if (currentTravelingIn == 6){
		$('#dates-current').empty().text('Anytime');
	} else {
		$('#dates-current').empty().text(selectedText);
	}
}

function updateSelectedLengthOfSail() {
	var currentDestination = $('#stayLengthVal').val();
	$('ul#staylength li a[data-id="' +currentDestination+ '"]').addClass('selected').parent('li').siblings('li').children('a').removeClass('selected');
	var selectedText = $('ul#staylength li a.selected').text();
	if (currentDestination == 0  || selectedText == ''){
		$('#staylength-current').empty().text('Any');
	} else {
		$('#staylength-current').empty().text(selectedText);
	}
}

function bindDropdowns() {
	$("ul.filters li.location-filter, ul.filters li.dates-filter, ul.filters li.length-filter, ul.filters li.sort-filter, ul.filters li.display-filter").hover(function(){
	    $(this).addClass("dd-open");
	    $('ul:first',this).css('visibility', 'visible').css('display','block');
	}, function(){
	    $(this).removeClass("dd-open");
	    $('ul:first',this).css('visibility', 'hidden').css('display','none');
	});
	
    $("ul.dd-menu li a").unbind('click').bind('click',function(event){
		event.preventDefault();
		var selected = $(this).text();
		var selectedVal = $(this).attr('data-id');
		if (selectedVal === 'Anywhere'){
			$(this).parent('li').parent('ul.dd-menu').siblings('div.dropdown').find('.dd-current').empty().text('Anywhere').attr('data-id','');
		}else if (selectedVal === 'Anytime'){
			$(this).parent('li').parent('ul.dd-menu').siblings('div.dropdown').find('.dd-current').empty().text('Any').attr('data-id','');
		}else if (selectedVal === 'Any'){
			$(this).parent('li').parent('ul.dd-menu').siblings('div.dropdown').find('.dd-current').empty().text('Any').attr('data-id','');
		}else{
			$(this).parent('li').parent('ul.dd-menu').siblings('div.dropdown').find('.dd-current').empty().text(selected).attr('data-id',selectedVal);
		}
		
		$(this).addClass('selected');
		$(this).parent('li').siblings('li').children('a').removeClass('selected');
		$(this).parent('li').parent('ul.dd-menu').parent('li').removeClass("dd-open");
	    $(this).parent('li').parent('ul.dd-menu').css('visibility', 'hidden');
		$(this).parent('li').parent('ul.dd-menu').siblings('input').val(selectedVal).trigger('change');
		
		/* SEARCH BUTTON */
		if(displaySearchButtonCruise === "false")
		{
			$(".sr-search-button").hide();
		}else{
			var selectedId = $(this).parent().parent('ul').attr('id');
			if (selectedId === "destination_port"){
				$(".sr-search-button").show();
			}
		}
	});
	
	$('ul#sort > li > a').unbind('click').click(function(event) {
		event.preventDefault();
		$('#sort_type').val($(this).attr('data-id'));
		$('ul#sort > li > a').removeClass('sort-selected');
		$(this).addClass('sort-selected');
		omnitureTrack(rfrrId.replace("Filter", "Sort") + $(this).attr('data-id').substr(0,1).toUpperCase() + $(this).attr('data-id').replace("/","").substr(1));
		changeURI();
	});
	
	$('ul#display > li > a').unbind('click').click(function(event) {
		event.preventDefault();
		currentView = $(this).attr('data-id');
		$('ul#display > li > a').removeClass('display-active');
		$(this).addClass('display-active');
		omnitureTrack(rfrrId.replace("Filter", "View") + ((currentView.toLowerCase().indexOf("map") > -1) ? "Map" : $.trim($(this).text())));
		changeURI();
	});
}

function initControls(){
    updateDropDownLists(true);
}

function updateControls(){
    updateDropDownLists(false)
}

function updateDropDownLists(init) {
	var rootUrl = "/cruiseSearchCriteria/getFilteredOptions?";
    var targetUrl = rootUrl;

    targetUrl += "aDestination=";
    if (init == false && typeof $('#destination-current').attr('data-id') != 'undefined') {
    	targetUrl += $('#destination-current').attr('data-id');
    }
    targetUrl += "&aSubDestination=";
    targetUrl += "&aDeparturePort=";
	if (typeof $('#embarkation-current').attr('data-id') !== 'undefined') {
    	targetUrl += $('#embarkation-current').attr('data-id');
    } else if (init === 'carry' && typeof $('#embarkation-current').attr('data-id') !== 'undefined') {
    	targetUrl += $('#embarkation-current').attr('data-id');
    }
    targetUrl += "&aDuration=";
    if (typeof $('#staylength-current').attr('data-id') !== 'undefined' &&  $('#staylength-current').attr('data-id') !== ''){ 
    	targetUrl += $('#staylength-current').attr('data-id');
    } 
    targetUrl += "&aMonth=";   
    if (travelInMonth.enabled && $('#dateRangesVal').val() !== "Anytime"){
    	targetUrl += encodeURIComponent($('#dateRangesVal').val());
    }
    targetUrl += "&aMonthTo=";
    targetUrl += "&aDay=";
    targetUrl += "&aDayTo=";
    targetUrl += "&aDayRange=";
    targetUrl += "&aDayRangeDay=";
    targetUrl += "&aCruiseLine=";
    if (init == false && typeof $('#cruise-line-current').attr('data-id') != 'undefined') {
    	targetUrl += $('#cruise-line-current').attr('data-id');
    }
    targetUrl += "&aShip=";
    targetUrl += "&aPromotion=";
    targetUrl += "&aWebID=5859";                                    
    targetUrl += "&aProductScope=";
    targetUrl += "&aCultureName=en-CA";  
	targetUrl += "&aCategory=";
	if (init == false && typeof $('#cruise-type-current').attr('data-id') != 'undefined') {
    	targetUrl += $('#cruise-type-current').attr('data-id');
    }else{
		targetUrl += 'Popular';
	}                           
    targetUrl += "&aSubdomain=cruises";                             
    targetUrl += "&aNumOfAdult=";
    targetUrl += "&aNumOfChild=";

    $.ajax({
        url: targetUrl,
        type: "GET",
        dataType: "json",
        async: false,
        success: function(data) { 
            PopulateLists(data);
        },
        error: function(jqXHR, textStatus, errorThrown){
             alert("error: " + textStatus + "\n" + errorThrown.message);
        },
        complete: function(data) {
			if (carry.firstLoad) {				
	      		if (typeof carry.save !== 'undefined') {
	      			var match = $("a:contains('"+carry.save+"')");
					var port = match.attr("data-id");
					// if match set it to current departing from selected criteria
					if (match.length > 0) {
						match.addClass ('selected');
						if (!init) {							
							// a 2nd call to the CSC; to reload other filters
							$('#embarkation-current').attr('data-id', port);
							updateDropDownLists('carry');
						} else {
							$('#embarkation-current').html(port);
							carry.firstLoad = false;
						}
					} else {
						// remove unavailable city from GDE Call
						$('#embarkation-current').html('Anywhere');
						$('#embarkationVal').val('');
						carry.arrival_airport = undefined;
						// a 2nd call to the GDE; if selected city is not in departing from filter
						window.setTimeout(changeURI, 500);
					}
	      		} else {
	      			carry.firstLoad = false;
	      		}
      		}
        }        
    });
}

function PopulateLists(data){
    PopulateDDL($("#destination_port"), data.destination, 'destination');
    //PopulateDDL($("#cruise-drd"), data.month);
    PopulateDDL($("#cruise_line"), data.cruiseline, 'cruiseline');
   // PopulateDDL($("#cruise-dr"), data.duration);
    PopulateDDL($("#embarkation_port"), data.departureport, 'embarkation');
	//PopulateDDL($("#cruise_type"), data.category, 'cruisetype');
	if (travelInMonth.enabled){
		PopulateDDL($("#dateRanges"), data.month, 'date');
	}
	PopulateDDL($("#staylength"), data.duration, 'staylength');

	updateSelectedEmbarkation();
	updateSelectedDestination();
	updateSelectedCruiseLine();
	updateSelectedTravelingIn();
	updateSelectedLengthOfSail();
    bindDropdowns();
}

function PopulateDDL(ddl, data, type) {
    if (type === 'cruiseline'){
		var altOptions = '<li><a href="#" data-id="Any">Any</a></li>';
	}else if (type === 'staylength'){
		var altOptions = '<li><a href="#" data-id="Any">Any</a></li>';
	}else if (type === 'date'){
		var altOptions =  '<li><a href="#" data-id="Anytime">Anytime</a></li>'
	}else if (type === 'destination'){
		var altOptions = '<li><a href="#" data-id="Anywhere">Anywhere</a></li>';
	}else if (type === 'embarkation'){
		var altOptions = '<li><a href="#" data-id="Anywhere">Anywhere</a></li>';
	}
	
	for (var i=0; i<data.length; i++){
        if(data[i].value.length > 0) { 
        	altOptions += '<li><a href="#" data-id="'+data[i].value.replace('/','_')+'" data-group="'+data[i].group+'">'+data[i].text+'</a></li>';
        }
    }
    
    ddl.empty().append(altOptions);
	
	if (type === 'embarkation'){
		var uniqueGroups = new Array();
		for (var i=0; i<data.length; i++){
			if(data[i].value.length > 0) {
				if ($.inArray(data[i].group, uniqueGroups)==-1){
					uniqueGroups.push(data[i].group);
				}
			}
		}
		for (var i=0; i<uniqueGroups.length; i++){
			if(uniqueGroups[i].length > 0) {
				$('#embarkation_port li a[data-group="'+uniqueGroups[i]+'"]:first').parent('li').before('<li class="embark-region" data-id="'+uniqueGroups[i]+'">'+uniqueGroups[i]+'</li>');
			}		
		}
	}
}

//Functionality to update URL hash codes.

function changeURI()
{
	var template = currentView?currentView:'template1/';
	var dataset = ($('#data_set').val())?$('#data_set').val():'!cruise/';
	var sorttype = ($('#sort_type').val())?$('#sort_type').val():'/';
	var staylength = ($('#stayLengthVal').val() && $('#stayLengthVal').val() >= 0 && $('#stayLengthVal').val() <= 5)?';staylength:'+$('#stayLengthVal').val():'';
	var embarkation = ($.trim($('#embarkationVal').val()).length > 0)?';embarkation:'+$.trim($('#embarkationVal').val()):'';
	var destination  = ($.trim($('#destinationVal').val()).length > 0)?';destination:'+$.trim($('#destinationVal').val()):'';
	var cruisetype = ($.trim($('#cruiseTypeVal').val()).length > 0)?';cruisetype:'+$.trim($('#cruiseTypeVal').val()):'';
	var cruiseline  = ($.trim($('#cruiseLineVal').val()).length > 0)?';cruiseline:'+$.trim($('#cruiseLineVal').val()):'';
	var arrival_code = (typeof carry.arrival_airport !== 'undefined') ? ';arrival_airport:'+ carry.arrival_airport :'';
	var dates = '';
	if (travelInMonth.enabled){
		dates = ($('#dateRangesVal').val().length > 0)?';dates:'+encodeURIComponent($('#dateRangesVal').val()):'';
	} else {
		dates = ($('#dateRangesVal').val() && $('#dateRangesVal').val().match(/^\d$/))?';dates:'+$('#dateRangesVal').val():'';
	}	
	window.location.hash = dataset+template+sorttype+staylength+embarkation+destination+cruiseline+cruisetype+dates+arrival_code;
	//console.log(dataset+template+sorttype+destination+checkin+checkout+dow+minstar+minprice+maxprice+staylength+lat+lng+miles+dates+province+country+destination_name);
}

function getPromoType(str)
{
	var promoType = (str.match(/\/(\w+)\.json/)) ? str.match(/\/(\w+)\.json/)[1] : "cruises";
	return promoType.substr(0,1).toUpperCase() + promoType.substr(1) + "."; 
}
