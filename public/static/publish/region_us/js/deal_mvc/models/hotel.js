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
var Hotel = Backbone.Model.extend({
	invalidImageURL: "http://www.expedia.com/static/default/default/images/hotResult/noPhotosAvailSmall.gif",
	hotelItemId: "",
	getIndex: function() {
		var index = this.collection.indexOf(this) + 1;
		return index;
	},
	getResize: function() {
		var total = 0;
		if (this.get("percentSavings") < 10){
			  total = 10;
		}else{
			  total = this.get("percentSavings");
		};
		return total;
	},
	getTruncatedHotelName: function() {
		var hotelName = this.get("name");
		if (hotelName.length > 25){
			  var truncatedHotelName = hotelName.substring(0,25).split(" ").slice(0, -1).join(" ") + "...";
		}else{
			  var truncatedHotelName = hotelName;
		};
		return truncatedHotelName;
	},
	get40CharHotelName: function() {
		var hotelName = this.get("name");
		if (hotelName.length > 40){
			  var truncatedHotelName = hotelName.substring(0,40).split(" ").slice(0, -1).join(" ") + "...";
		}else{
			  var truncatedHotelName = hotelName;
		};
		return truncatedHotelName;
	},
	get35CharHotelName: function() {
		var hotelName = this.get("name");
		if (hotelName.length > 35){
			  var truncatedHotelName = hotelName.substring(0,35).split(" ").slice(0, -1).join(" ") + "...";
		}else{
			  var truncatedHotelName = hotelName;
		};
		return truncatedHotelName;
	},
	getImageUrl: function() {
		var hotelPhoto = this.get("imageUrl");
		var hotelNoPhoto = "http://www.expedia.com/static/default/default/images/hotResult/noPhotosAvailSmall.gif";
		if (hotelPhoto.length > 0){
			return hotelPhoto;
		}else{
			return hotelNoPhoto;
		};
	},
	getStarRatingClass: function(){
		var number_of_stars = this.get("starRating").toFixed(1);
		if (number_of_stars > 0){
			  var starClass = number_of_stars.replace(".","-");
		};
		return starClass;
	},
	getPercentSavingsFormatted: function() {
		var total = 0;
		var percent = this.get("percentSavings");
		if (percent < 10 || isNaN(percent) || percent == null || percent.length === 0){
			  total = "";
		}else{
			  total = Math.floor(this.get("percentSavings"));
		};
		return total;
	},
	getPrice: function() { return this.get("totalRate"); },
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
	getMovingAverageScore: function() { return this.get("movingAverageScore"); },
	getUserCity: function() { return this.get("userCity"); },
	getCheckInDate: function() { return this.get("checkInDate"); },
	getCheckOutDate: function() { return this.get("checkOutDate"); },
	getFormattedCheckInDate: function() { return $.datepicker.formatDate('mm/dd/yy', $.datepicker.parseDate('yy-mm-dd',this.get("checkInDate"))); },
	getFormattedCheckOutDate: function() { return $.datepicker.formatDate('mm/dd/yy', $.datepicker.parseDate('yy-mm-dd',this.get("checkOutDate"))); },
	getTransformedCheckInOutDates: function(){
			var checkIn = transformDate(this.get("checkInDate"));
			var checkOut = transformDate(this.get("checkOutDate"));
			var checkOutYear = this.get("checkOutDate").substring(0,4);
			if (checkIn.substring(0,3) === checkOut.substring(0,3)){
				var checkOutFinal = checkOut.replace(/[^0-9]/gi,"");
			}else{
				var checkOutFinal = checkOut;
			}
			return checkIn + " - " + checkOutFinal + ", " + checkOutYear;
	},
	getTransformedCheckInOutDatesNoYear: function(){
			var checkIn = transformDate(this.get("checkInDate"));
			var checkOut = transformDate(this.get("checkOutDate"));
			if (checkIn.substring(0,3) === checkOut.substring(0,3)){
				var checkOutFinal = checkOut.replace(/[^0-9]/gi,"");
			}else{
				var checkOutFinal = checkOut;
			}
			return checkIn + " - " + checkOutFinal;
	},
	getDatesDowNoYear: function(){
			var checkIn = $.datepicker.formatDate('D. M dd', $.datepicker.parseDate('yy-mm-dd',this.get("checkInDate")));
			var checkOut = $.datepicker.formatDate('D. M dd', $.datepicker.parseDate('yy-mm-dd',this.get("checkOutDate")));
			return checkIn + " - " + checkOut;
	},
	getHotelId: function() { return this.get("hotelId"); },
	getName: function() { return this.get("name"); },
	getStreetAddress: function() { return this.get("streetAddress"); },
	getCity: function() { return this.get("city"); },
	getProvince: function() { return this.get("province"); },
	getShortProvince: function() {
			var fullProvince = this.get("province");
			if (fullProvince.length === 2){
				var shortProvince = fullProvince;
			}else{
				var shortProvince = "";
			}
			return shortProvince;
	},
	getCountry: function() { return this.get("country"); },
	getHotelId: function() { return this.get("hotelId"); },
	getLatitude: function() { return this.get("latitude"); },
	getLongitude: function() { return this.get("longitude"); },
	getDescription: function() { return this.get("description"); },
	getDestination: function() { return this.get("destination"); },
	getStatusCode: function() { return this.get("statusCode"); },
	getStatusDescription: function() { return this.get("statusDescription"); },
	getBaseRate: function() { return this.get("baseRate"); },
	getCurrency: function() { return this.get("currency"); },
	getTaxesAndFees: function() { return this.get("taxesAndFees"); },
	getTotalRate: function() { return this.get("totalRate"); },
	getPromotionAmount: function() { return this.get("promotionAmount"); },
	getPromotionDescription: function() { return this.get("promotionDescription"); },
	getDealDeepLink: function() {
		var deeplink = unescape(this.get("dealDeepLink"));
		if (window.location.hostname.indexOf("www.expedia-aarp.com") != -1 || window.location.hostname.indexOf("wwwexpedia-aarpcom") != -1){
			deeplink = deeplink.replace("www.expedia.com","www.expedia-aarp.com");
		}
		return deeplink;
	},
	getStarRating: function() { return this.get("starRating").toFixed(1); },
	getGuestRating: function() {
		var finalGuestRating = 0;
		var guestRating = this.get("guestRating");

		if (guestRating > 0){
			  finalGuestRating = guestRating.toFixed(1);
		}else{
				finalGuestRating = "";
		};
		return finalGuestRating;
	},
	getLengthofStay: function() { return this.get("lengthofStay"); },
	getPricePerNight: function() { return this.get("pricePerNight"); },
	getPricePerNightCeil: function() { return Math.ceil(this.get("pricePerNight")); },
	getPromotionTag: function() { return this.get("promotionTag"); },
	getSpecificPromotionTag: function() {
		var gdePromoTag = this.get("promotionTag");
		if (gdePromoTag.indexOf(promotionTag) != -1){
			var promoTag = gdePromoTag;
		}else{
			var promoTag = '';
		}
		return promoTag;
	},
	getOriginalPricePerNight : function() {return this.get("originalPricePerNight"); },
	getOriginalPricePerNightCeil : function() {return Math.ceil(this.get("originalPricePerNight")); },
	getPercentSavings: function() { return this.get("percentSavings"); },
	getIsDRR: function() { return this.get("isDRR"); },
	getLanguage: function() { return this.get("language"); },
	getMandatoryTaxesAndFees: function() { return this.get("mandatoryTaxesAndFees"); },
	getImageUrlZ: function () { return this.getResizedImageUrl('z'); },
	getImageUrlB: function () { return this.getResizedImageUrl('b'); },
	getImageUrlL: function () { return this.getResizedImageUrl('l'); },
	getImageUrlS: function () { return this.getResizedImageUrl('s'); },
	getImageUrlT: function () { return this.getResizedImageUrl('t'); },
	getImageUrlN: function () { return this.getResizedImageUrl('n'); },
	getImageUrlE: function () { return this.getResizedImageUrl('e'); },
	getImageUrlG: function () { return this.getResizedImageUrl('g'); },
	getImageUrlD: function () { return this.getResizedImageUrl('d'); },
	getImageUrlY: function () { return this.getResizedImageUrl('y'); },
	getResizedImageUrl: function (size) { return (this.isValidImage())?this.getImageUrl().replace(/_\w\.jpg$/i,'_'+size+'.jpg'):this.invalidImageURL; },
	getMcicidAndTag: function () { return mcicid + (typeof(this.get("promotionTag")) == "undefined" ? "" : this.get("promotionTag")); },
	isValidImage: function () { return (this.get("imageUrl").length > 0);},
	validateDeal: function () {
		if(this.get("movingAverageScore") == undefined) { throw 'Invalid movingAverageScore'; }
		if(this.get("checkInDate") == undefined) { throw 'Invalid checkInDate'; }
		if(this.get("checkOutDate") == undefined) { throw 'Invalid checkOutDate'; }
		if(this.get("hotelId") == undefined) { throw 'Invalid hotelId'; }
		if(this.get("name") == undefined) { throw 'Invalid name'; }
		if(this.get("streetAddress") == undefined) { throw 'Invalid streetAddress'; }
		if(this.get("city") == undefined) { throw 'Invalid city'; }
		if(this.get("province") == undefined) { throw 'Invalid province'; }
		if(this.get("country") == undefined) { throw 'Invalid country'; }
		if(this.get("latitude") == undefined) { throw 'Invalid latitude'; }
		if(this.get("longitude") == undefined) { throw 'Invalid longitude'; }
		if(this.get("description") == undefined) { throw 'Invalid description'; }
		if(this.get("destination") == undefined) { throw 'Invalid destination'; }
		if(this.get("totalRate") == undefined) { throw 'Invalid totalRate'; }
		if(this.get("promotionDescription") == undefined) { throw 'Invalid promotionDescription'; }
		if(this.get("dealDeepLink") == undefined) { throw 'Invalid dealDeepLink'; }
		if(this.get("similarDeepLink") == undefined) { throw 'Invalid similarDeepLink'; }
		if(this.get("starRating") == undefined) { throw 'Invalid starRating'; }
		if(this.get("guestRating") == undefined) { throw 'Invalid guestRating'; }
		if(this.get("lengthofStay") == undefined) { throw 'Invalid lengthofStay'; }
		if(this.get("pricePerNight") == undefined) { throw 'Invalid pricePerNight'; }
		if(this.get("originalPricePerNight") == undefined) { throw 'Invalid originalPricePerNight'; }
		if(this.get("percentSavings") == undefined) { throw 'Invalid percentSavings'; }
		if(this.get("isDRR") == undefined) { throw 'Invalid isDRR'; }
		if(this.get("location") == undefined) { throw 'Invalid location'; }
		if(this.get("imageUrl") == undefined) { throw 'Invalid imageUrl'; }
		if(this.get("promotionTag") == undefined) { throw 'Invalid promotionTag'; }
		if(this.get("distanceFromUser") == undefined) { throw 'Invalid distanceFromUser'; }
		//if(this.get("userOrigin") == undefined) { throw 'Invalid userOrigin'; }
		//if(this.get("userCity") == undefined) { throw 'Invalid userCity'; }
		return 1;
	},
	getDistanceToPoi: function(){
        if("undefined" == typeof(this.get("latitude")) || "undefined" == typeof(this.get("longitude")) || "" == $.trim(this.get("latitude")) || "" == $.trim(this.get("longitude")) || "undefined" == typeof(destination_lng) || "undefined" == typeof(destination_lat) || "" == $.trim(destination_lng) || "" == $.trim(destination_lat))
	    {
	        return "distance unknown";
	    }
        var p_hotel = new LatLon(this.get("latitude"), this.get("longitude"));
        var p_poi = new LatLon(destination_lat, destination_lng);
        return ((p_hotel.distanceTo(p_poi) >= 2) ? p_hotel.distanceTo(p_poi) + " miles" : p_hotel.distanceTo(p_poi) + " mile");
	},
	getHotelItemId: function() {
		if("" == this.hotelItemId)
		{
			this.hotelItemId = this.get("hotelId") + (new Date()).getTime();
		}
		return this.hotelItemId;
	},
	getRawAppealScore: function() { return this.get("rawAppealScore"); },
	getAppealScore: function(scoreType) { return this.get(scoreType); }
});

//a-jwoody
var HotelandCar = Hotel.extend({
  getHotelCarDealDeepLink: function() {
		var deeplink = unescape(this.get("hotelCarDeepLink"));
		if (window.location.hostname.indexOf("www.expedia-aarp.com") != -1 || window.location.hostname.indexOf("wwwexpedia-aarpcom") != -1){
			deeplink = deeplink.replace("www.expedia.com","www.expedia-aarp.com");
		}
		return deeplink;
	},
  setCarDealBox: function() {
    if(this.getHotelCarDealDeepLink != "") {
      return 'car-deal-box';
    }
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
var HotelDealCollection = Backbone.Collection.extend({
	initialize: function (models, options) {
		_.bindAll(this,'parse');
	},

	comparator: undefined,
	model: Hotel,
	url: function() { return "http://deals.expedia.com/beta/deals/hotels.jsonp?numberOfResultsToReturn=6";},
	sync: function(method, model, options) {
			options.timeout = 5000;
			options.dataType = "jsonp";
			//options.jsonpCallback = "hotel_results_" + Math.abs(url.hashCode());
			options.jsonpCallback = "hotel_results2";
			options.cache = true;
			return Backbone.sync(method, model, options);
		  },
	parse: function(response) {
		if(!response || !response.hotels)
		{
			expClientLoggingAdapter.logTrxEvent("Exception", ["errorMessage=Invalid GDE Response","hash="+encodeURIComponent(window.location.hash.replace(',',''))]);
			return false;
		}
		return response.hotels;
	},
	sortByPrice: function(model){
		return model.get("pricePerNight");
	},
	sortByPriceDesc: function(model){
		return -model.get("pricePerNight");
	},
	sortByRating: function(model){
		return -model.get("starRating");
	},
	sortByHotelGuestRating: function(model){
		return model.get("guestRating");
	},
	sortByHotelGuestRatingDesc: function(model){
		return -model.get("guestRating");
	},
	sortByDiscount: function(model){
		return -model.get("percentSavings");
	},
	sortByMovingAverageScore: function(model){
		return model.get("movingAverageScore");
	},
	sortByGDEScore: function(model){
		return 0;
	},
	sortByDistanceFromDest: function(model){
		if(!destination_lat || !destination_lng) { return 0; }
		var p_a = new LatLon(model.get("latitude"),model.get("longitude"));
		var p_b = new LatLon(destination_lat,destination_lng);
		return p_a.distanceTo(p_b);
	},
	sortByDistanceFromUser: function(model){
		return model.get("distanceFromUser");
	},
	sortByCheckin: function(model){
		var date = model.get("checkInDate").split("-");
		var your_date = new Date(date[0], date[1]-1, date[2]);
		return your_date.getTime();
	},
	sortByRawAppealScore: function(model){
		return model.get("rawAppealScore");
	}
});
var HotelCarDealCollection = HotelDealCollection.extend({
  	initialize: function (models, options) {
		_.bindAll(this,'parse');
	},
  model: HotelandCar,
  url: function() { return "http://deals.expedia.com/beta/deals/hotels.jsonp?carPackage=true&showHotelCarDeeplink=true&numberOfResultsToReturn=3&";},
  sync: function(method, model, options) {
			options.timeout = 5000;
			options.dataType = "jsonp";
			//options.jsonpCallback = "hotel_results_" + Math.abs(url.hashCode());
			options.jsonpCallback = "hotel_results1";
			options.cache = true;
			return Backbone.sync(method, model, options);
	}
});
