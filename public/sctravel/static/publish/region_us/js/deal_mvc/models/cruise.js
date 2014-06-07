/*
-----------------------------------------------------------------------------------------
The below javascript utilizes the Backbone.js library.  I'll leave an explanation of what
Backbone is to the website.  There is some very detailed documentation and good
examples on the website.
 
http://documentcloud.github.com/backbone/
-----------------------------------------------------------------------------------------
*/
/*
ref: http://documentcloud.github.com/backbone/#Model
 
"Hotel Deal" model.  This is a backbone model that has all the properties of a
deal returned by the GDE for a hotel stay.  Properties are accessed from an
instance of the model, by calling the "getters".  New get functions can be
added to support additional properties/fields, as well as calculated values.
This is a custom model class that is created by extending the Backbone.Model
object.  It has all the properties of a Backbone.Model as well as any specified
in the definition. 
*/
var Cruise = Backbone.Model.extend({
	getLengthOfStay: function() { return this.get("lengthOfStay"); },
	getCruiseline: function() { return this.get("cruiseline"); },
	getDepartureDate: function() { 
		var date = this.get("departureDate"); 
		var monthday = transformDate(date);
		var year = date.substring(0,4)
		return monthday + ', ' + year
	},
	getDestination: function() { return this.get("destination"); },
	getSubDestination: function() { return this.get("subDestination"); },
	getEmbarkationPort: function() { return this.get("embarkationPort"); },
	getDisembarkationPort: function() { return this.get("disembarkationPort"); },
	getShip: function() { return this.get("ship"); },
	getItinerary: function() { return this.get("itinerary"); },
	getPriceInterior: function() { return this.get("priceInterior"); },
	getPriceOceanview: function() { return this.get("priceOceanview"); },
	getPriceBalcony: function() { return this.get("priceBalcony"); },
	getPriceSuite: function() { return this.get("priceSuite"); },
	getPercentOff: function() { return this.get("percentOff"); },
	getValidPercentOff: function() {
            var total = 0;
            var percent = this.get("percentOff");
            if (percent < 10 || isNaN(percent) || percent == null || percent.length === 0){
                  total = "";
            }else{
                  total = Math.floor(this.get("percentOff"));
            };
            return total;
     },
	getAverageCustomerRating: function() { return this.get("averageCustomerRating"); },
	getPromoText1: function() { return this.get("promoText1"); },
	getPromoDollarValue1: function() { return this.get("promoDollarValue1"); },
	getPromoText2: function() { return this.get("promoText2"); },
	getPromoDollarValue2: function() { return this.get("promoDollarValue2"); },
	getPromoText3: function() { return this.get("promoText3"); },
	getPromoDollarValue3: function() { return this.get("promoDollarValue3"); },
	getShipFactsCruiseSuitedFor: function() { return this.get("shipFactsCruiseSuitedFor"); },
	getDealDeepLink: function() {
        var deeplink = unescape(this.get("dealDeepLink"));
        if (window.location.hostname.indexOf("www.expedia-aarp.com") != -1 || window.location.hostname.indexOf("wwwexpedia-aarpcom") != -1){
            deeplink = deeplink.replace("cruise.expedia.com","cruise.expedia-aarp.com");
        }
        return deeplink;
    },
	getShipDeepLink: function() { return this.get("shipDeepLink"); },
	getCategory: function() { return this.get("category"); },
	getCruiseLineLogo: function() { return this.get("cruiseLineLogo"); },
	getShipImage: function() { return this.get("shipImage"); },
	getUserOrigin: function() { return this.get("userOrigin"); },
	isValidImage: function () { return (this.get("cruiseLineLogo").length > 0);},
	getUserCity: function() { 
		var usercity = "";
		var city = this.get("userCity");
		if (city == null || city.length === 0 || city == "undefined" || city == "Unknown"){
			usercity = "";
		}else{
			usercity = city;
		};
		return usercity;
	},
	getMcicidAndTag: function () { return mcicid },
	getIndex: function() {
		var index = this.collection.indexOf(this) + 1;
		return index;
	},
	//getFormattedDepartureDate: function() { return $.datepicker.formatDate('mm/dd/yy', $.datepicker.parseDate('yy-mm-dd',this.get("departureDate"))); },
	validateDeal: function () { 
		return 1;
	}
});
 
/*
ref: http://documentcloud.github.com/backbone/#Collection
 
"Hotel Deal" collection.  This is a backbone collection (think list or array).  It is a
custom collection class that extends the Backbone.Collection class.  It has all the
properties/behavior of a Backbone.Collection as well as any defined or overridden in
the custom collection definition.  This object will let you store multiple instances
of the Hotel model and can be populated simply by setting its URL property to an end
point that returns a JSON response, and then calling its "fetch" function. 
 
Notice the _.bindAll(this,'parse'); statement.  That essentially tells any calls to the collection,
to also call the parse function that is defined.  In this way, rather than accessing the
raw padded JSON response which wouldn't be valid, it automatically references the value associated
to the 'hotels' tag, which is the list of JSON models.
 
Also notice the comparator that is defined below.  By defining a comparator, any time a model
is inserted into the collection, the comparator is used as a way to compare the new model
against those already in the collection.  In this way, new models are added to the collection in
the correct sorted order.
*/
var CruiseDealCollection = Backbone.Collection.extend({
	initialize: function (models, options) {
		_.bindAll(this,'parse');
	},

	comparator: undefined,
	model: Cruise,
	url: function() { return "http://deals.expedia.com/beta/deals/cruises.jsonp";},
	sync: function(method, model, options) {
			options.timeout = 5000;
			options.dataType = "jsonp";
			options.jsonpCallback = "cruise_results";
			options.cache = true;
			return Backbone.sync(method, model, options);
		  },
	parse: function(response) {
		if(!response || !response.cruises) 
		{ 
			expClientLoggingAdapter.logTrxEvent("Exception", ["errorMessage=Invalid GDE Response","hash="+encodeURIComponent(window.location.hash.replace(',',''))]);
			return false; 
		}
		return response.cruises;
	},
	sortByPriceInterior: function(model){
		return model.get("priceInterior"); 
	},
	sortByPriceInteriorDesc: function(model){	
		return -model.get("priceInterior");
	},
	sortByPercentOff: function(model){
		return model.get("percentOff"); 
	},
	sortByPercentOffDesc: function(model){
		return -model.get("percentOff"); 
	}
});
