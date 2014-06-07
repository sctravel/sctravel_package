//-------------------------------------------------------
//-------------------------------------------------------
/*
ref: http://mustache.github.com/
 
Define the Mustache.js template used to display Hotel deals.  This is
basically just an HTML snippet with variables that are escaped, so that
their values can be injected into the HTML by Mustache.  Since Mustache
processes the template at render time, the variables referenced below
need to be part of the Hotel model.
 
ex. {{someVariable}}  or  {{someFunction}}
*/
/*
ref:  http://documentcloud.github.com/backbone/#View
 
"Deal" view.  A view to display a collection of deals.  This view was left generic so that it can
be used to display any deal collection that is defined.  This class extends the Backbone.View class
and inherits all of its properties/functions.  A view is just a means of displaying data on the
screen.
 
The important pieces below are the 'render' function and template that are up to you to define.
The render function relies on the fact that anything that uses the DealView class, set its template
before rendering. 
 
The render function in this instance first clears out the DOM element 'el', then loops through
a collection of deal models and appends them to the DOM element.  The html is generated using
the Mustache.js library which uses the template we define.
*/
var CruiseDealView = DealView.extend({
	//Set this when instance created.  This is based on the model type.
	list: 	'<div id="deal-{{getIndex}}" class="cruise-list deal-box float_left">'+
				'<div class="deal-img"><div class="deal-logo"><img src="{{getCruiseLineLogo}}" alt="{{getCruiseline}} logo" title="" /></div></div>'+
				'<div class="deal-dest-wrap float_left">'+
					'<div class="deal-dest">{{getEmbarkationPort}}&nbsp;<span class="deal-arrow">&#8594;</span>&nbsp;{{getDestination}}</div>'+
				'</div>'+
				'<div class="deal-dates float_left">Sail Date: {{getDepartureDate}}</div>'+
				'<div class="deal-price-summary float_left">'+
					'<div class="deal-per-night float_right clear">{{getLengthOfStay}} nights from</div>'+
					'{{#getValidPercentOff}}<div class="deal-savings float_right clear"><a href="{{getDealDeepLink}}&mcicid={{getMcicidAndTag}}" id="changeURI" rel="nofollow">Save {{getValidPercentOff}}%</a></div>{{/getValidPercentOff}}'+
					'<div class="deal-price float_right clear"><a href="{{getDealDeepLink}}&mcicid={{getMcicidAndTag}}" id="changeURI" rel="nofollow"><span>$</span>{{getPriceInterior}}</a></div>'+
					'</div>'+
			'</div>',
	template: 	'<div id="deal-{{getIndex}}" class="cruise-grid deal-box float_left">'+
					'<div class="deal-logo deal-img-width float_left clear"><img src="{{getCruiseLineLogo}}" alt="{{getCruiseline}} logo" title="" /></div>'+
					'<div class="deal-embark deal-img-width float_left clear">{{getEmbarkationPort}}</div>'+
					'<div class="deal-dest deal-img-width float_left clear">to {{getDestination}}: <span>{{getLengthOfStay}} nights from</span></div>'+
					'{{#getValidPercentOff}}<div class="deal-savings deal-img-width float_left clear"><a href="{{getDealDeepLink}}&mcicid={{getMcicidAndTag}}" id="changeURI" rel="nofollow">Save {{getValidPercentOff}}%</a></div>{{/getValidPercentOff}}'+
					'<div class="deal-price deal-img-width float_left clear"><a href="{{getDealDeepLink}}&mcicid={{getMcicidAndTag}}" id="changeURI" rel="nofollow"><span>$</span>{{getPriceInterior}}</a></div>'+
					'<div class="deal-dates deal-img-width float_left clear">Sail Date: {{getDepartureDate}}</div>'+
				'</div>',
	errorMessage: '<div class="error-message">The deals are limited for your travel request. For more options, please change your search filters.</div>',
	errorMessage2: '<div class="error-message">We\'re sorry, we\'re having problems finding matching hotels.  Please refresh the page and pick your options again.</div>',
	errorMessage3: '<div class="error-message">These are the top deals for your destination. You may find more deals in a neighboring city. Or, check back later for a new list in this location.</div>',
	GDEerrorMessage: '<div class="error-message gde-error">We were unable to update the deals on this page. Please try refreshing the page in a few moments.</div>',
	minDeals: 1,
	alternateUrl: 'cruise/template//;staylength:0;embarkation:Anywhere;destination:Anywhere;cruiseline:Any;dates:6',
	alternateSearchResults: undefined,
	mapDisplay: false,
	preRender: function preRender()
	{
		if(attemptRetry) { 
			var picCount = 0;
			var validCount = 0;
			if(this.model.models.length > 0)
			{
				$.each(this.model.models,
					function(i, model) {
						if(model.isValidImage()) { picCount++; }
						try {
							validCount += model.validateDeal();
						}
						catch(exception) { 
							expClientLoggingAdapter.logTrxEvent("Exception", ["InvalidDeal="+exception,]);  
						}
					});
			}
			/*expClientLoggingAdapter.logTrxEvent("Notification", ["dealCount="+this.model.models.length,"validPic="+picCount,"validDeal="+validCount,"hash="+encodeURIComponent(window.location.hash.replace(',',''))]); */
		}
	},
	render: function() {      
		var that = this;
		//First clear out the DOM element
		$(that.el).empty();
		
		//give search button a deep link
		$('#sr-search-button').attr('href',this.alternateSearchResults() + "&mcicid=dealsframeworksearch");

		//For each model in the collection, append the template to the DOM element
		//If no models, return error message
		if (attemptRetry && that.alternateUrl!=undefined && this.model.models.length < that.minDeals)
		{
			attemptRetry = false;
			window.location.hash = that.alternateUrl;
		}
		else
		{
			if(this.model.models.length > 0)
			{
				attemptRetry = false;
				$.each(this.model.models,
					function(i, model) {
						if(typeof userAirport == 'string' && userAirport.length == 0) { userAirport = model.getUserAirport(); }
						$(that.el).append(Mustache.to_html(that.template,model));
				});
			}
		}
	},
	postRender: function postRender()
	{
		setDealHeight('cruise-grid');
		$("span[name=name]").css("font-weight", "bold");
		$("span[name=value]").css("padding-left", "20px");
		
		// make entire template1 deal-box clickable
		$("#dealContent").delegate('.cruise-grid.deal-box', 'click', function (e) {
			window.location = $(this).find('a').attr('href');
			return false;
		});	
		// make entire list view deal-box clickable
		$("#dealContent").delegate('.cruise-list.deal-box', 'click', function (e) {
			window.location = $(this).find('a').attr('href');
			return false;
		});
		
		// Omniture tracking for error message link
		$('#error-message-link').click(function(){
			omnitureTrack(salePageName+".Error.AllOptions");
		});
		// template1 deal-box hover
		// toggle percent savings for cruises
		$(".cruise-grid.deal-box").hover(function(){
			$(this).addClass("hover");
			if ($(this).find('.deal-savings').length){
				if (!$(this).hasClass('animated')) {
					$(this).find('.deal-price').dequeue().stop().hide().siblings('.deal-savings').fadeIn();
				}
			}
		}, function() {
			$(this).removeClass("hover");
			if ($(this).find('.deal-savings').length){
		    	$(this).addClass('animated').find('.deal-savings').hide().siblings('.deal-price').fadeIn(function() {
					$(this).parent('.cruise-grid.deal-box').removeClass('animated').dequeue();
				});
			}
		});
		// list view deal-box hover
		// fade in percent savings for hotels
		$(".cruise-list.deal-box").hover(function(){
			$(this).addClass("hover");
			if ($(this).find('.deal-price-summary > .deal-savings').length){
				if (!$(this).hasClass('animated')) {
					$(this).find('.deal-price, .deal-per-night').dequeue().stop().hide().siblings('.deal-savings').fadeIn();
				}
			}
		}, function() {
			$(this).removeClass("hover");
			if ($(this).find('.deal-price-summary > .deal-savings').length){
		    	$(this).addClass('animated').find('.deal-price-summary > .deal-savings').hide().siblings('.deal-price, .deal-per-night').fadeIn(function() {
					$(this).parent('.deal-price-summary').parent('.cruise-list.deal-box').removeClass('animated').dequeue();
				});
			}
		});
		
		$('#suggest').click(function(){
			$(this).val('');
		});
		
		// Omniture tracking for error message link
		$('#error-message-link').click(function(){
			omnitureTrack(salePageName+".Error.AllOptions");
		});
					
		$(this.el).append('<div class="error-message error-cruises">'+		
			'<p>The Deal Finder has a limited selection of the best deals on Expedia.</p>'+
			'<p>Change the filters to compare more options.</p>'+
			'<p class="gray-italic">&#151;&#151;&#151;&#151;&nbsp;or&nbsp;&#151;&#151;&#151;&#151;</p>'+
			'<p><a href="'+this.alternateSearchResults()+'" id="error-message-link">See full search results</a> based on the filters you selected.</p>'+
		'</div>');
	}
});