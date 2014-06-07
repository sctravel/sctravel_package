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
var HotelDealView = DealView.extend({
	//Set this when instance created.  This is based on the model type.
	template5: '<li class="tt-deal-row">' +
		'<div class="tt-index tt-list-item">{{getIndex}}.</div>' +
		'<div class="tt-name tt-list-item"><span>{{getCity}}{{#getShortProvince}}, {{getShortProvince}}{{/getShortProvince}}</span>&nbsp;-&nbsp;{{getTruncatedHotelName}}</div>' +
		'<div class="tt-original-price tt-list-item">{{#getPercentSavingsFormatted}}{{#getOriginalPricePerNightCeil}}${{getOriginalPricePerNightCeil}}{{/getOriginalPricePerNightCeil}}{{/getPercentSavingsFormatted}}</div>' +
		'<div class="tt-price tt-list-item">${{getPricePerNightCeil}}</div>' +
		'<div class="tt-summary-box">' +
			'<div class="tt-hotel-image tt-large-img"><img src="{{getImageUrlL}}" alt="Photo of {{getName}}" /></div>' +
			'<div class="tt-hotel-image tt-small-img"><img src="{{getImageUrlE}}" alt="Photo of {{getName}}" /></div>' +
			'<div class="tt-star rating stars-lg ir"><span class="value stars{{getStarRatingClass}}">{{getStarRating}}</span></div>' +
			'<div class="tt-dates">{{getTransformedCheckInOutDates}}</div><hr />' +
			'<div class="tt-per-night">per&nbsp;night&nbsp;from</div>' +
			'<div class="tt-price-wrap">' +
				'<div class="tt-price-align">' +
					'<div class="tt-price-sup">{{#getPercentSavingsFormatted}}{{#getOriginalPricePerNightCeil}}<span class="tt-price-original">${{getOriginalPricePerNightCeil}}</span>{{/getOriginalPricePerNightCeil}}{{/getPercentSavingsFormatted}}<span class="tt-dollar">$</span></div>' +
					'<div class="tt-summary-price">{{getPricePerNightCeil}}</div>' + 
				'</div>' + 
			'</div>' +
			'<a href="{{getDealDeepLink}}" id="standardButtonID" class="tt-deal-link btn btn-standard" rel="nofollow"><span>See Details</span></a>' +
		'</div>' +
		'<div class="tt-right-arrow"></div>' +
		'<div class="tt-left-arrow"></div>' +
		'</li>',
	errorMessage: '<div class="error-message">No Hotel Deals to Display</div>',
	errorMessage2: '<div class="error-message">Sorry! We\'re unable to complete this request. Please adjust your trip details and search again.</div>',
	errorMessage3: '<div class="error-message">These are the top deals for your destination. You may find more deals in a neighboring city. Or, check back later for a new list in this location.</div>',
	preRender: function preRender()
	{
		$('div.error-message').remove();
		$('#tt-deals-wrap').css('min-height','0');
	},
	postRender: function postRender()
	{
		
		var pageURL = window.location.pathname;
		if (pageURL === '/p/hotel-deal/top-ten.htm'){
			$('.tt-deal-link[href]').each(function(i){
				var currentHref = $(this).attr('href');
				var mcicidHref = currentHref += '&mcicid=top_ten';
				$(this).attr('href',mcicidHref);
			});
		}
		if (pageURL === '/Hotels'){
			$('.tt-deal-link[href]').each(function(i){
				var currentHref = $(this).attr('href');
				var mcicidHref = currentHref += '&mcicid=hoteltab.top_ten';
				$(this).attr('href',mcicidHref);
			});
		}

		$('#tt-deals-list').mouseleave(function(){
			$('li.tt-deal-row:not(:first-child).tt-oddRow').css('background','#eee');
			$('li.tt-deal-row:not(:first-child).tt-evenRow').css('background','#e5e5e5');
			$('li.tt-deal-row:first-child').css('background','#FFCB00');
			$('li.tt-deal-row:first-child').siblings('li.tt-deal-row').children('.tt-summary-box, .tt-right-arrow,.tt-left-arrow').css('visibility','hidden');
			$('li.tt-deal-row:first-child .tt-summary-box, li.tt-deal-row:first-child .tt-right-arrow, li.tt-deal-row:first-child .tt-left-arrow').css('visibility','visible');
		});

		$('.tt-deal-row').hover(function(){
			$(this).siblings('li.tt-evenRow').css('background','#e5e5e5');
			$(this).siblings('li.tt-oddRow').css('background','#eee');
			$(this).css('background','#FFCB00');
			$(this).siblings('li.tt-deal-row').children('.tt-summary-box,.tt-right-arrow,.tt-left-arrow').css('visibility','hidden');
			$('.tt-summary-box, .tt-right-arrow, .tt-left-arrow',this).css('visibility','visible');
		});
		
		$('li.tt-deal-row:first-child').css('background','#FFCB00');
		$('li.tt-deal-row:first-child .tt-summary-box, li.tt-deal-row:first-child .tt-right-arrow, li.tt-deal-row:first-child .tt-left-arrow').css('visibility','visible');
		$('li.tt-deal-row').filter(':even').addClass('tt-evenRow');
		$('li.tt-deal-row').filter(':odd').addClass('tt-oddRow');
		if (($('ol#tt-deals-list li').length > 0) && ($('ol#tt-deals-list li').length <= 9)){
			$('#tt-deals-wrap').after(view1.errorMessage3);
			$('#tt-deals-wrap').css('min-height','380px');
		}
		if ($('ol#tt-deals-list li').length > 9){
			$('div.error-message').remove();
			$('#tt-deals-wrap').css('min-height','380px');
		}
	}
});