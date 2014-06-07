if (!window['g_publishingWizardJSLoaded']) {
g_publishingWizardJSLoaded = true;
var expNamespace = function() {
    var args = arguments, root = null, pkg;
    for (i = 0; i < args.length; i = i + 1) {
        pkg = args[i].split('.');
        root = window;

        for (j = 0; j < pkg.length; j = j + 1) {
            root[pkg[j]] = root[pkg[j]] || {};
            root = root[pkg[j]];
        }
    }
    return root;
};

// Start of file ../content/static_content/default/default/scripts/wizard/publishing.js
expNamespace("publishing.util");
expNamespace("publishing.wizard");
expNamespace("publishing.wizard.lobforms");
expNamespace("publishing.wizard.common.flight");

publishing.wizard.setUpAddRoomLinks = function(form) {
    var numberOfRoomsField = (typeof form.field("numRooms") != "undefined") ? form.field("numRooms") : form.field("numRoom");

    function hideShowLinks() {
      var numRoomSelect = numberOfRoomsField[0];
      var addHotelRoomLink = form.find(".addRoomLink");
      var removeHotelRoomLink = form.find(".removeRoomLink");
      if(typeof numRoomSelect != "undefined"){
          if (numRoomSelect.selectedIndex == numRoomSelect.length - 1) {
            addHotelRoomLink.hide();
            removeHotelRoomLink.show();
          } else if (numRoomSelect.selectedIndex === 0) {
            removeHotelRoomLink.hide();
            addHotelRoomLink.show();
          } else {
            addHotelRoomLink.show();
            removeHotelRoomLink.show();
          }
      }
    }

    form.find(".addRoomLink").click(function(){
      var numRoomSelect = numberOfRoomsField[0];
      if (typeof numRoomSelect != "undefined" && numRoomSelect.selectedIndex != numRoomSelect.length - 1) {
        numRoomSelect.selectedIndex ++;
        numberOfRoomsField.change();
        hideShowLinks();
      }
    });

    form.find(".removeRoomLink").click(function(){
      var numRoomSelect = numberOfRoomsField[0];
      if (typeof numRoomSelect != "undefined" && numRoomSelect.selectedIndex !== 0) {
        numRoomSelect.selectedIndex --;
        numberOfRoomsField.change();
        hideShowLinks();
      }
    });
    hideShowLinks();

    $('#widgetcatalogWizard').bind('formSwitched',hideShowLinks);
};

publishing.wizard.setupPackageRadioButtons = function(form) {
    if (typeof g_selectedPackage !== 'undefined') {
        g_radioButonsSetUp = true;
        form.find('input:radio[name=packageLob]').click(function(e){
            form.find('input:radio[value=' + g_selectedPackage + ']').attr('checked', true);
            g_selectedPackage = $(this).val();
            publishSwitchForm(g_selectedPackage, true);
        });
    }
};

publishing.wizard.disableTabletKeyboard = function() {
    if ( typeof Modernizr !== 'undefined' ) {
        var hasTouch = Modernizr.touch,
            hasWin8Touch = Modernizr.win8touch;
        if (hasTouch || hasWin8Touch) {
            $('[data-control="calendar"]').attr("readonly", "readonly");
        }
    }
};

publishing.wizard.disableCalendarClickPropagation = function() {
    if ( typeof uitk !== 'undefined' ) {
        $('.allLobForms').bind(uitk.clickEvent || 'click', "[data-control=calendar]", function(e) {
             e.stopPropagation();
        });
    }
};

publishing.wizard.setUpPackageCheckboxes = function(addFlight, addHotel, addCar) {
    if (addFlight) {
        addFlight.click(function() {
            publishing.wizard.addPackageToHotel(addCar, addFlight, this);
        });
    }
    if (addHotel) {
        addHotel.click(function() {
            publishing.wizard.addPackageToFlight(addCar, addHotel, this);
        });
    }

    if (addCar) {
        addCar.click(function() {
            if ($('.current-lob a').attr('data-lob') == 'flightOnly') {
                publishing.wizard.addPackageToFlight(addCar, addHotel, this);
            } else if ($('.current-lob a').attr('data-lob') == 'hotelOnly') {
                publishing.wizard.addPackageToHotel(addCar, addFlight, this);
            }
        });
    }
};

publishing.wizard.addPackageToHotel = function(addCar, addFlight, el) {
    if (addCar && addCar.is(':checked') && addFlight && addFlight.is(':checked')) {
        publishSwitchForm('flightHotelAndCar', true);
        el.checked = !el.checked;
    } else if (addFlight && addFlight.is(':checked')) {
        publishSwitchForm('flightAndHotel', true);
        el.checked = !el.checked;
    } else if (addCar && addCar.is(':checked')) {
        publishSwitchForm('hotelAndCar', true);
        el.checked = !el.checked;
    } else {
        publishSwitchForm('hotelOnly', true);
           el.checked = !el.checked;
    }
};

publishing.wizard.addPackageToFlight = function(addCar, addHotel, el) {
    if (addCar && addCar.is(':checked') && addHotel && addHotel.is(':checked')) {
        publishSwitchForm('flightHotelAndCar', true);
        el.checked = !el.checked;
    } else if (addHotel && addHotel.is(':checked')) {
        publishSwitchForm('flightAndHotel', true);
        el.checked = !el.checked;
    } else if (addCar && addCar.is(':checked')) {
        publishSwitchForm('flightAndCar', true);
        el.checked = !el.checked;
    } else {
        publishSwitchForm('flightOnly', true);
        el.checked = !el.checked;
    }
};

publishing.wizard.formatDateForGroupForm9PlusRoomsService = function(dateString) {
    var date = publishing.util.parseDate(dateString);
    if (date === null) {
        return "";
    }
    return publishing.util.formattedDate("MM/DD/YYYY", 0, date);
};
publishing.wizard.currentlySelectedField = null;
publishing.wizard.SelectAll = function(id)
{
    if (publishing.wizard.currentlySelectedField != id) {
        document.getElementById(id).focus();
        document.getElementById(id).select();
        publishing.wizard.currentlySelectedField = id;
        $('#' + id).blur(function() {
            if (publishing.wizard.currentlySelectedField == id) {
                publishing.wizard.currentlySelectedField = null;
            }
        });
    }
};

// used for tracking bundled packages, if properties are added to this they should be passed a long with the search
publishing.wizard.packageLobData = {};


publishing.wizard.addPackageLobFields = function(lob, form) {
    var dest = form.field('destination').val();
    var ls = publishing.wizard.LSDATA;
    var packageData = publishing.wizard.packageLobData;
    if (ls && (ls.destination == dest || ls.regionName == dest)) {
        if (!packageData.MultiCity) {
            packageData.MultiCity = ls.regionID;
        }
        if (!packageData.TLA) {
            var tla = ls.destination.match(/\(([A-Z][A-Z][A-Z])\s?\-?/);
            if (tla && tla.length > 1) {
                packageData.TLA = tla[1];
            }
        }
    }
    if (!$("input[name='DestID']").length && (lob == "flightAndHotel" || lob == "hotelAndCar" || lob == "flightHotelAndCar") &&
        packageData.TLA && packageData.MultiCity) {
        form.append($('<input type="hidden" />').attr('name', 'DestID').attr('value',
                        packageData.MultiCity + ':' + packageData.TLA));
    }
    if (!$("input[name='HotelIDs']").length && (lob == "hotelOnly" || lob == "flightAndHotel" || lob == "hotelAndCar" || lob == "flightHotelAndCar") &&
        packageData.HotelId) {
        form.append($('<input type="hidden" />').attr('name', 'HotelIDs').attr('value', packageData.HotelId))
    }
    if (!$("input[name='CityId']").length && (lob == "hotelOnly" || lob == "flightAndHotel") && packageData.regionId) {
        form.append($('<input type="hidden" />').attr('name', 'CityId').attr('value', packageData.regionId))
    }
}

publishing.wizard.turnOnInterstitial = function(button, config) {
button.width(button.outerWidth());
button.parent().parent().addClass("interstitial");
button.html(config.searchingText + "<img src=\"/sctravel/static/fusion/v2.3/images/ajax-loader.gif\" style=\"vertical-align:-4px;margin-left:6px;\" height=\"16\" width=\"16\">");
button.attr("disabled", "disabled");
}

publishing.wizard.turnOffInterstitial = function(button, config) {
button.width("auto");
button.parent().parent().removeClass("interstitial");
button.html(config.normalButtonText);
button.removeAttr("disabled");
}

publishing.WIZARD_CONTAINER_ID = "#widgetcatalogWizard";
publishing.DATE_SEPERATOR_REGEX = /[\- \/.]/;
publishing.UNDEFINED_CHILD_AGE = '-1';

publishing.wizard.canonicFields = {};
publishing.wizard.canonicFieldValues = {};

publishing.wizard.setSearchButtonToInterstitial = function(ev, opts) {
  var button = $(ev.target).find('button');
  var left = $(ev.target).find('.xp-b-leftSubmit2');
  var right = $(ev.target).find('.xp-b-rightSubmit2');
  button.css("background-position", "left -145px");
  left.css("background-position", "left -87px");
  right.css("background-position", "left -116px");
  button.html("<span style=\"color:#4c3900\">" + opts.searchingText + "<img src=\"/sctravel/static/fusion/v2.3/images/ajax-loader.gif\" style=\"vertical-align:-4px;margin-left:6px;\" height=\"16\" width=\"16\"></span>");
}

publishing.wizard.hasBrowserVersionBeenChecked = false;
publishing.wizard.isChrome23OrAbove = false;

publishing.wizard.checkForChrome23OrAbove = function()
{
    if(!this.hasBrowserVersionBeenChecked)
    {
        publishing.wizard.isChrome23OrAbove = false;
        publishing.wizard.hasBrowserVersionBeenChecked = true;

        if (/Chrom(e|ium|eframe)\/([0-9]+)\./i.test(navigator.userAgent))
        {
            var chrome = new Number(RegExp.$2);
            if (chrome >= 23)
            {
                publishing.wizard.isChrome23OrAbove = true;
            }
        }
    }
    return publishing.wizard.isChrome23OrAbove;
}

publishing.wizard.handleMouseDown = function(ev)
{
    if (typeof(PopUnder) != "undefined")
    {
        var lob = $(ev).attr('class');
        var minDate = g_calendar.getDateFromString($(ev).find('[name="InDate"]').val());
        var maxDate = g_calendar.getDateFromString($(ev).find('[name="OutDate"]').val());

        var minDateFormat="";
        var maxDateFormat="";
        if((typeof(minDate) != "undefined") && (typeof(maxDate) != "undefined") && null != minDate && null != maxDate)
        {
            // Change the Date Format to yyyy-mm-dd
            var minDateMonth = minDate.getMonth();
            minDateFormat = minDate.getFullYear() + ((minDateMonth < 9) ? ("-0" + (minDateMonth + 1)) : ("-" + (minDateMonth + 1)));

            var minDateDateVal = minDate.getDate();
            minDateFormat += (minDateDateVal < 10) ? ("-0" + minDateDateVal) : ("-" + minDateDateVal);

            var maxDateMonth = maxDate.getMonth();
            maxDateFormat = maxDate.getFullYear() + ((maxDateMonth < 9) ? ("-0" + (maxDateMonth + 1)) : ("-" + (maxDateMonth + 1)));

            var maxDateDateVal = maxDate.getDate();
            maxDateFormat += (maxDateDateVal < 10) ? ("-0" + maxDateDateVal) : ("-" + maxDateDateVal);
        }

        var region_id = "";
        if(typeof($(ev).find('[name="CityId"]')) != "undefined")
        {
            region_id = $(ev).find('[name="CityId"]').val();
        }

        PopUnder.handleMouseDownForChrome23(
            lob,
            this.siteId,
            region_id,
            $(ev).find('[name="PlaceName"]').val(),
            minDateFormat,
            maxDateFormat);
    }
}

publishing.wizard.initPopUnderIfLoaded = function(ev)
{
    if (typeof(PopUnder) != "undefined")
    {
        var lob = $(ev.target).attr('class');
        var minDate = g_calendar.getDateFromString(ev.target.InDate.value);
        var maxDate = g_calendar.getDateFromString(ev.target.OutDate.value);
        var minDateFormat="";
        var maxDateFormat="";
        if((typeof(minDate) != "undefined") && (typeof(maxDate) != "undefined") && null != minDate && null != maxDate)
        {
            //Change the Date Format to yyyy-mm-dd
            if(minDate.getMonth()<9)
                minDateFormat= minDate.getFullYear()+"-0"+(minDate.getMonth()+1);
            else
                minDateFormat= minDate.getFullYear()+"-"+(minDate.getMonth()+1);
            if(minDate.getDate()<10)
                minDateFormat= minDateFormat+"-0"+minDate.getDate();
            else
                minDateFormat= minDateFormat+"-"+minDate.getDate();
            if(maxDate.getMonth()<9)
                maxDateFormat= maxDate.getFullYear()+"-0"+(maxDate.getMonth()+1);
            else
                maxDateFormat= maxDate.getFullYear()+"-"+(maxDate.getMonth()+1);
            if(maxDate.getDate()<10)
                maxDateFormat= maxDateFormat+"-0"+maxDate.getDate();
            else
                maxDateFormat= maxDateFormat+"-"+maxDate.getDate();
        }

        var region_id ="";
        if(typeof(ev.target.CityId) != "undefined")
        {
            region_id = ev.target.CityId.value ;
        }

        PopUnder.initialize(
        lob,
        this.siteId,
        region_id,
        ev.target.PlaceName.value,
        minDateFormat,
        maxDateFormat);
    }
}

publishing.wizard.ON_FORM_SUBMIT = function(ev, opts) {

    if ($(ev.target).attr('class') == 'hotelOnly')
    {
        try {
            //enable popunder on publishingwizard
            publishing.wizard.initPopUnderIfLoaded(ev);
        } catch(e) {}
        if(publishing.wizard.lobforms.hotelOnly.handleNinePlusRooms(ev.target, opts))
        {
            return false;
        }
        if(publishing.wizard.lobforms.hotelOnly.gotoHotelInfo(ev.target, opts))
        {
            return false;
        }

    }
    if ($(ev.target).attr('class') == 'flightAndHotel')
    {
        if(publishing.wizard.lobforms.hotelOnly.gotoPackageInfo(ev.target, opts))
        {
            return false;
        }

    }

    if ($(ev.target).attr('class') == 'carOnly')
    {
        //If airport pickup was selectd from typeahead, set the value to pass on as TLA
        var pickupInstance = TA ? TA.getInstance("C-destination") : null;
        var isCrrentOn = pickupInstance && pickupInstance.On;
        var isSelectedItem = pickupInstance && pickupInstance.selectedItem;

        if (isCrrentOn && isSelectedItem)
        {
            if (pickupInstance.selectedItem.type == "AIRPORT")
            {
                $('#C-destination').val(pickupInstance.selectedItem.tla);

                //If airport dropoff was selectd from typeahead, set the value to pass on as TLA
                var dropoffInstance = TA ? TA.getInstance("C-dropOffLocation") : null;
                var isDropOffCrrentOn = dropoffInstance && dropoffInstance.On;
                var isDropOffSelectedItem = dropoffInstance && dropoffInstance.selectedItem;
                if ($('#showHideDropOff') != null && $('#showHideDropOff').is(':checkbox') && !$('#showHideDropOff').is(':checked'))
                {
                    $('#C-dropOffLocation').val('');
                }
                else
                {
                    if (isDropOffCrrentOn && isDropOffSelectedItem && dropoffInstance.selectedItem.type == "AIRPORT")
                    {
                        $('#C-dropOffLocation').val(dropoffInstance.selectedItem.tla);
                    }
                }
            }
            else
            {
                $('#C-SearchType').val('PLACE');
            }
        }
        else
        {
            // if no item was selected from typeahead, then we change the searchtype to the
            // secret DTI search type
            $('#C-SearchType').replaceWith('<input type="hidden" name="searchType" value="DTI">');
        }
    }

    if (opts.interstitial) {
      publishing.wizard.setSearchButtonToInterstitial(ev, opts);
    }
    /*
     *For flight land page.
     *submitFormTarget maybe 'search' submit button or 'search for flight + hotel' submit button.
     *if it is 'search for flight + hotel' submit button, forward to package search.
    */
    if(publishing.wizard.lobforms.flightOnly.submitFormTarget
        && $(publishing.wizard.lobforms.flightOnly.submitFormTarget).attr('submittype') =='flightAndHotel')
    {
        publishing.wizard.lobforms.flightOnly.submitFormTarget = null;
        //if ajaxLobForms=true, loading flightAndHotelForm
        function callback() {
            //uppercase search button text
            $(publishing.WIZARD_CONTAINER_ID + " form.flightAndHotel").find("input[type='submit']").each(function() {
                 $(this).val($(this).val().toUpperCase());
            });
            //clean errors
            newLobContainer.clearErrors();
            forwardFightAndHotel();
        }

        function forwardFightAndHotel() {
            publishing.wizard.lobforms.flightOnly.searchFlightAndHotel();
            $form = $(publishing.WIZARD_CONTAINER_ID + " form.flightAndHotel");
            $form.find(".ignore-hidden-fields").removeClass("ignore-hidden-fields");
            $form.find("button:submit").trigger("click");
        }
        var formContainer = $(publishing.WIZARD_CONTAINER_ID).find(".allLobForms");
        if(formContainer.find("div.lobForm-flightAndHotel").length==0)
        {
            var newLobContainer = $('<div class="lobForm lobForm-flightAndHotel"/>').hide().appendTo(formContainer);
      var design = window['g_wizDesign'] ? "/" + g_wizDesign : '';
            newLobContainer.load("/publishing/wizard-lob-form/flightAndHotel" + design,callback);
        }else {
            forwardFightAndHotel();
        }

        return false;
    }

    if(publishing.wizard.lobforms.flightOnly.submitFormTarget
        && $(publishing.wizard.lobforms.flightOnly.submitFormTarget).attr('submittype') =='flightOnly')
    {
        // For RoundTrip standalone flight search, we do not want to redirect to eap.asp
        // Submit flightSearch form instead of flightOnly.
        var multiDestRadio = $(ev.target).find('[name=TripType][value=Multicity]');
        var roundTripRadio = $(ev.target).find('[name=TripType][value=RoundTrip]');
        var oneWayRadio =  $(ev.target).find('[name=TripType][value=OneWay]');// cover the stopOver search under oneway
        if ((roundTripRadio != null && roundTripRadio.is(":checked")) || (oneWayRadio != null && oneWayRadio.is(":checked")))
        {
            // JP flight stopOver search, stopOver search is in RoundTrip but it is actually multiple destination.
            // Before return, need to update the key-elements to satisfy multiDestination search
            var stopOverCheckBox = $(ev.target).find('.oneWayOrReturn').find('[name=stopOverCheck]');
            if(stopOverCheckBox.length>0 && stopOverCheckBox.is(':checked')){
                publishing.wizard.lobforms.flightOnly.stopOverSearch(ev.target);
                return true;
            }

            var $submitForm = $('form[name=flightSearch]');
            if($submitForm != null){
                var timeMap = [
                    {'id':'12AM', 'value': 'T00:00'},{'id':'1AM', 'value': 'T01:00'},{'id':'2AM', 'value': 'T02:00'},{'id':'3AM', 'value': 'T03:00'},
                    {'id':'4AM', 'value': 'T04:00'},{'id':'5AM', 'value': 'T05:00'},{'id':'6AM', 'value': 'T06:00'},{'id':'7AM', 'value': 'T07:00'},
                    {'id':'8AM', 'value': 'T08:00'},{'id':'9AM', 'value': 'T09:00'},{'id':'10AM', 'value': 'T10:00'},{'id':'11AM', 'value': 'T11:00'},
                    {'id':'12PM', 'value': 'T12:00'},{'id':'1PM', 'value': 'T13:00'},{'id':'2PM', 'value': 'T14:00'},{'id':'3PM', 'value': 'T15:00'},
                    {'id':'4PM', 'value': 'T16:00'},{'id':'5PM', 'value': 'T17:00'},{'id':'6PM', 'value': 'T18:00'},{'id':'7PM', 'value': 'T19:00'},
                    {'id':'8PM', 'value': 'T20:00'},{'id':'9PM', 'value': 'T21:00'},{'id':'10PM', 'value': 'T22:00'},{'id':'11PM', 'value': 'T23:00'},
                    {'id':'362', 'value': 'TANYT'},{'id':'361', 'value': 'TMORN'},{'id':'721', 'value': 'TNOON'},{'id':'1081', 'value': 'TEVEN'}
                    ];

                function convertTimeStr(time){
                    var ret = 'TANYT';
                    $.each(timeMap, function(key, val){
                        if(val['id'] == time){
                            ret = val['value'];
                        }
                    });
                    return ret;
                }

                function buildLegInfo(frAirport, toAirport, departureDate, departureTime){
                    var leg = 'from:' + frAirport + ',to:' + toAirport + ',departure:' + departureDate + convertTimeStr(departureTime);
                    return leg;
                }

                // Add legs information
                var frAirport = $(ev.target).find('input[name=FrAirport]').attr('value');
                var toAirport = $(ev.target).find('input[name=ToAirport]').attr('value');
                // support select box
                if(frAirport==undefined){
                    frAirport = $(ev.target).find('select[name=FrAirport]').attr('value');
                }
                if(toAirport==undefined){
                    toAirport = $(ev.target).find('select[name=ToAirport]').attr('value');
                }
                var leg1 = buildLegInfo(frAirport, toAirport, $(ev.target).find('input[name=FromDate]').attr('value'), $(ev.target).find('select[name=FromTime]').attr('value'));

                // add passengers information
                var numChild = $(ev.target).find('select[name=NumChild]').eq(0).attr('value');
                var passengers = 'children:' + numChild;
                if(parseInt(numChild) > 0){
                    passengers = passengers + '[';
                    for(i=1; i<=parseInt(numChild); i++){
                        if(i>1){
                            passengers = passengers + ';';
                        }
                        var age = $(ev.target).find('select[name=Age' + i + ']').attr('value');
                        passengers = passengers + age;
                    }
                    passengers = passengers + ']';
                }
                var infantinlap = "Y";
                var infantSel = $(ev.target).find('[name=InfantInSeat][value=1]');
                if (infantSel != null && infantSel.is(":checked")) {
                    infantinlap = "N";
                }
                var seniors = ($(ev.target).find('select[name=NumSenior]').length > 0) ? $(ev.target).find('select[name=NumSenior]').attr('value') : 0;
                passengers = passengers + ',adults:' + $(ev.target).find('select[name=NumAdult]').attr('value') + ',seniors:' + seniors + ',infantinlap:' + infantinlap;

                // add additional options
                var cabinClass = "economy";
                switch($(ev.target).find('select[name=Class]').attr('value'))
                {
                case '1':
                    cabinClass = 'first';
                    break;
                case '2':
                    cabinClass = 'business';
                    break;
                case '5':
                    cabinClass = 'premium';
                    break;
                case '3':
                    cabinClass = 'economy';
                    break;
                default:
                    cabinClass = 'economy';
                    break;
                }
                var options = 'cabinclass:' + cabinClass;
                if($(ev.target).find('input[name=Direct]').is(":checked")){
                    options = options + ',maxhops:0';
                }
                var nopenalty = 'N';
                if($(ev.target).find('input[name=NoChangePen]').is(":checked")){
                    var nopenalty = 'Y';
                }
                options = options + ',nopenalty:' + nopenalty + ',sortby:price';
                var airline = $(ev.target).find('select[name=Airline]').attr('value');
                if(airline != '' && typeof(airline) != "undefined"){
                    options = options + ',carrier:'+ airline;
                }

                if (roundTripRadio != null && roundTripRadio.is(":checked")){
                    var leg2 = buildLegInfo(toAirport, frAirport, $(ev.target).find('input[name=ToDate]').attr('value'), $(ev.target).find('select[name=ToTime]').attr('value'));
                    $('<input />').attr({'type':'hidden', 'name':'trip', 'value':'roundtrip' }).appendTo($submitForm);
                    $('<input />').attr({'type':'hidden', 'name':'leg1', 'value':leg1}).appendTo($submitForm);
                    $('<input />').attr({'type':'hidden', 'name':'leg2', 'value':leg2 }).appendTo($submitForm);
                }
                else {
                    $('<input />').attr({'type':'hidden', 'name':'trip', 'value':'oneway' }).appendTo($submitForm);
                    $('<input />').attr({'type':'hidden', 'name':'leg1', 'value':leg1}).appendTo($submitForm);
                }
                $('<input />').attr({'type':'hidden', 'name':'passengers', 'value':passengers }).appendTo($submitForm);
                $('<input />').attr({'type':'hidden', 'name':'options', 'value':options }).appendTo($submitForm);
                $('<input />').attr({'type':'hidden', 'name':'mode', 'value':'search' }).appendTo($submitForm);

                $submitForm.submit();
                return false;
            }
        } else if(multiDestRadio != null && multiDestRadio.is(":checked") && jQuery('#flightSearchForm').length>0){
            urlHandler.setInputFileldNames({
                inpFlightRouteTypeId : "",
                inpFirstDepartureLocationId : "F-origin-1",
                inpFirstArrivalLocationId : "F-destination-1",
                inpDepartureLocationId : "F-fromAirport",
                inpArrivalLocationId : "F-toAirport",
                inpDepartureLocationCode : "hiddenDepartureLocationCodes",
                inpArrivalLocationCode : "hiddenArrivalLocationCodes",
                inpFirstFlightDepartureDateId : "#F-fromDate",
                inpFirstFlightDepartureTimeId : "#F-FromTime",
                inpDepartureDateId : "F-date",
                inpDepartureTimeId : "F-Time",
                inpAdultId : "#F-NumAdult",
                inpSeniorId : "#F-NumSenior",
                inpChildrenId : "#F-NumChild",
                inpAgesId : "F-Age",
                radInfantOnLapId : "infantSeatPreference",
                radInfantOnSeatId : "infantSeatPreference",
                inpRefoundableId : "#refundableFlightsOnly",
                inpFlightAirlinePreferenceId : "#F-Airline",
                inpFlightClassId : "#F-Class",
                inpIsNonstopOnlyId : "#directFlightsOnly",
                inpRouteType : "multi"
          });
          urlHandler.handleFlightSearchForm(true);
          jQuery('#flightSearchForm').submit();
          return false;
        }


    }
    /*
     *For car landing page publishing wizard.
     *Add this for matching the car E-main searchwizard define logic to avoid the search verification error happened.
    */
    if(publishing.wizard.lobforms.carOnly)
    {
        $form = $(publishing.WIZARD_CONTAINER_ID + " form.carOnly");
        if ($form.find("#street").css("display") == "none")
        {
                $form.find("#street").empty();
                $form.find("#city").empty();
                $form.find("#state").empty();
                $form.find("#zip").empty();
        }
        if ($form.find("#disCorpCode").css("display") == "none" || $form.find("#disCorpCode").find('input[name=CorpDiscNum]').val() == "")
        {
                $form.find("#disCorpCode").find('input[name=CorpDiscNum]').attr("disabled","disabled");
        }
        if ($form.find("#disRateCode").css("display") == "none" || $form.find("#disRateCode").find('input[name=RateCode]').val() == "")
        {
                $form.find("#disRateCode").find('input[name=RateCode]').attr("disabled","disabled");
        }
        if ($form.find("#disCouponCode").css("display") == "none" || $form.find("#disCouponCode").find('input[name=CouponCode]').val() == "")
        {
                $form.find("#disCouponCode").find('input[name=CouponCode]').attr("disabled","disabled");
        }
        if ($form.find("#disOtherCode").css("display") == "none" || $form.find("#disOtherCode").find('input[name=OtherCode]').val() == "")
        {
                $form.find("#disOtherCode").find('input[name=OtherCode]').attr("disabled","disabled");
        }

    }
    return true;
};

publishing.util.Date = function(today, offset) {
    var millsecondsInADay = (1000 * 60 * 60 * 24);
    var date = new Date(today.valueOf() + (millsecondsInADay * offset));

    function monthAsString() {
        return date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
    }

    function dateAsString() {
        return date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
    }

    function yearAsString() {
        return date.getFullYear();
    }

    this.format = function(format) {
        var result = format.toUpperCase().replace("MM", monthAsString());
        result = result.replace("DD", dateAsString());
        result = result.replace("YYYY", yearAsString());
        result = result.replace("YY", (yearAsString() % 2000));
        return result;
    };
};

publishing.util.formattedDate = function(format, offset, today) {
    var date = new publishing.util.Date(today || new Date(), offset);
    return date.format(format);
};

publishing.util.parseDate = function(value) {
    var dateFormatAndIndices = {
        "mmddyy":{day:1,month:0, year:2},
        "ddmmyy":{day:0,month:1, year:2},
        "yymmdd":{day:2,month:1, year:0},
        "ddmmyyyy":{day:0,month:1, year:2}
    };

    function splitDate(value) {
        var parts =  value.split(publishing.DATE_SEPERATOR_REGEX);
        var indices = dateFormatAndIndices[publishing.NORMALIZED_DATE_FORMAT];
        if (indices == undefined) return [];
        var parsedDate = {
            day:parseInt(parts[indices['day']], 10),
            month:parseInt(parts[indices['month']], 10),
            year:parseInt(parts[indices['year']], 10)
        };
        if (parsedDate.year < 100) parsedDate.year = 2000 + parsedDate.year;
        return parsedDate;
    }

    var parsed = splitDate(value);
    var date = new Date(parsed.year, parsed.month - 1, parsed.day); // month goes by index 0
    if (isNaN(date.getTime())) {
        return null
    }
    return date;
};

publishing.util.calendarDateFormat = function(normalisedDate, seperator) {
    var dateFormats = {
        "mmddyy": "mm" + seperator + "dd" + seperator + "yy",
        "ddmmyy": "dd" + seperator + "mm" + seperator + "yy",
        "yymmdd": "yy" + seperator + "mm" + seperator + "dd",
        "ddmmyyyy": "dd" + seperator + "mm" + seperator + "yyyy"
    };
    return dateFormats[normalisedDate];
};

publishing.util.preserveValues = function(targetFields, lob) {

    targetFields.each(function() {
        var targetField = $(this);
        var canonicName = publishing.wizard.canonicName(targetField);
        var preservedValue = publishing.wizard.canonicFieldValues[canonicName];
        if (preservedValue == undefined)
        {
            if(canonicName == 'destination' && (lob == 'hotelOnly' || lob == 'flightAndHotel' || lob == 'flightHotelAndCar' || lob == 'hotelAndCar' || lob == 'activities'))
            {
                canonicName = 'regionName';
            }
            if(publishing.wizard.LSDATA && publishing.wizard.LSDATA[canonicName])
            {
                preservedValue = publishing.wizard.LSDATA[canonicName];
            }
        }
        if (preservedValue != undefined && preservedValue != '')
        {
            if(targetField.attr("type") == "radio" && canonicName == "infantSeatPreference")
            {
                if(preservedValue == targetField.val())
                {
                    targetField[0].checked = true;
                }
                else
                {
                    targetField[0].checked = false;
                }
            }
            else
            {
                if(preservedValue != targetField.val())
                {
                    if(canonicName == 'regionName' || canonicName == 'destination')
                    {
                        targetField.val(preservedValue);
                    }
                    else
                    {
                        if (targetField.is('select')) {
                            targetField.children().each(function(i,e){
                                if ($(e).attr('value') == preservedValue) {
                                    targetField.val(preservedValue).change();
                                }
                            });
                        } else {
                            targetField.val(preservedValue).change();
                        }
                        if (targetField.is('[data-type=date]') && targetField.val() != exp.core.date.CalendarControl.config.getDateFormat()) {
                            targetField.blur();
                        }
                    }
                }
            }
        }
        if (targetField[0].checkState) {
            targetField[0].checkState();
        }
    });
};

var calConfig,DPDisplay,g_calendar,g_datepicker,g_dateUpdater;
publishing.wizard.calInit = function() {
    if (exp.core.date.DatePickerDisplay) {
    var ot = ol = 0;
    if (window.g_wizDesign !== undefined && g_wizDesign == "tabbed") {
      ol = 0;
      ot = 2;
    }
    var defaultPublishWizardCalendarUrl = '../../html/calendar/v3.0.0/calendar.html';
    if((typeof publishWizardCalendarUrl !== "undefined" ) && publishWizardCalendarUrl.length > 0){
    	defaultPublishWizardCalendarUrl = publishWizardCalendarUrl;
    }
    calConfig = exp.core.date.CalendarControl.config = exp.core.date.CalendarControl.Config;
    DPDisplay = exp.core.date.datePickerDisplay = exp.core.date.DatePickerDisplay('CalFrame', defaultPublishWizardCalendarUrl, ol, ot);
    exp.core.date.CalendarControl.config.setFormatConfig(publishing.NORMALIZED_DATE_FORMAT, publishing.DATE_SEPERATOR);
    exp.core.date.CalendarControl.config.setUnitConfig(publishing.START_DAY_OF_WEEK, publishing.MONTHS, publishing.DAYS);
    exp.core.date.CalendarControl.config.setTextConfig(publishing.CLOSE_LINK);
    g_calendar = exp.core.date.calendar = exp.core.date.Calendar(exp.core.date.CalendarControl.config);

    g_datepicker = exp.core.date.datePicker = exp.core.date.DatePickerControl(exp.core.date.calendar, DPDisplay, 2);
    g_dateUpdater = exp.core.date.dateUpdater = exp.core.date.DateUpdater(exp.core.date.calendar, exp.core.date.CalendarControl.config);
    function getDatePicker() {return g_datepicker;}
    }
}
var publishSwitchForm;
publishing.wizard.init = function() {
    publishing.wizard.calInit();

    function lobChanged(ev) {
        var lobRadio = $(ev.target);
        if ($('#widgetcatalogWizard').is('.horizontal-wizard')) {
            $(".current-lob").removeClass("current-lob");
            lobRadio.parent().parent().addClass("current-lob");
        }
        switchForm(lobRadio.val(), true);
        updateTitle(lobRadio);
    }

    function lobChangedFromTab(ev) {
        var lobTab = $(ev.target);
        var currentLobTab = $(".on.change-lob");
        if (lobTab[0].nodeName !== "A") {
            lobTab = lobTab.parents(".change-lob");
        }
        var lob = lobTab.attr("data-lob");
        var currentLob = currentLobTab.attr("data-lob");
        $('#widgetcatalogWizard').removeClass('currLob-' + currentLob);
        $('#widgetcatalogWizard').addClass('currLob-' + lob);
        currentLobTab.removeClass("on");
        lobTab.addClass("on");
        switchForm(lob, true);
    }

    publishSwitchForm = switchForm = function(lob, shouldPreserveValues) {
        var currentFormContainer = formContainer.find("div.lobForm:visible");
        if (currentFormContainer.hasClass("lobForm-" + lob)) {
            return;
        }

        var newFormContainer = formContainer.find("div.lobForm-" + lob);
        if (publishing.wizard.AJAX_LOB_FORMS && newFormContainer.length === 0) {
            ajaxLoadLobForm(lob);
            return;
        }

        currentFormContainer.hide();
        newFormContainer.show();

        var rfrrInput = '',
        	existingRfrrInput = newFormContainer.find("input[name='rfrr']"),
        	newForm = newFormContainer.find('form.' + lob);

        if ( typeof existingRfrrInput == 'object' && existingRfrrInput.length == 0 ) {
        	rfrrInput = currentFormContainer.find("input[name='rfrr']").clone();
        	if ( typeof newForm == 'object' && newForm.length > 0 && typeof rfrrInput == 'object' && rfrrInput.length > 0 ) {
        		rfrrInput.appendTo( newForm );
        	}
        }

        if ( typeof uitk !== 'undefined' ) {
            try {
            uitk.refreshPlaceholders();
            } catch(e){}
        }

        if (shouldPreserveValues) {
            var targetFields = publishing.wizard.canonicFields[newFormContainer.find("form").attr("class")]
            publishing.util.preserveValues(targetFields, lob);
        }

        newFormContainer.clearErrors();

        $('#widgetcatalogWizard').trigger('formSwitched');
        publishing.wizard.disableTabletKeyboard();
        publishing.wizard.disableCalendarClickPropagation();
    }

    function updateTitle(lobRadio) {
        var lobLabel = lobRadio.attr('data-title');
        var wizardTitle = lobRadio.attr('wizard-title');
        var template = heading.attr("data-template");
        if (template != undefined) {
            if(wizardTitle != "")
            {
                heading.html(wizardTitle);
            }
            else
            {
                heading.html(template.replace("{lob}", $.trim(lobLabel)));
            }
        }
    }

    if (window['uitk'] && uitk.subscribe) {
        uitk.subscribe("calendar.selectDate", function(name, data) {
            var field = data.element,
                date = data.date;
            var canonicName = publishing.wizard.canonicName(field);
            publishing.wizard.canonicFieldValues[canonicName] = field.val();
            setTimeout(function() {
                if (canonicName == 'fromDate') {
                    publishing.wizard.canonicFieldValues['toDate'] = $('[data-canonic=toDate]:visible').val();
                } else if (canonicName == 'toDate') {
                    publishing.wizard.canonicFieldValues['fromDate'] = $('[data-canonic=fromDate]:visible').val();
                }
            }, 1);
        })
    }

    function monitorCanonicFieldValues(form) {
        var canonicFields = form.find("[data-canonic]");
        canonicFields.change(function() {
            var field = $(this);
            var canonicName = publishing.wizard.canonicName(field);
            publishing.wizard.canonicFieldValues[canonicName] = field.val();

            if(this.id == "H-destination" && $("#H-hotelId").val()!= "" && $("#H-hotelId").attr("timestamp") +1 <= new Date().getTime()){$("#H-hotelId").val("");}
        });
        publishing.wizard.canonicFields[form.attr("class")] = canonicFields;
    }

    function setUpHotelBiasingSelects() {
        var select = $('<select name="CityId" data-canonic="destination">');
        $.each(publishing.wizard.hotelsForCities, function(i, hotel) {
            options = $('<option value="' + hotel.cityId + '">' + hotel.cityName + '</option>');
            options.appendTo(select);
        });

        container.field("destination").each(function(i, input) {
            my_select = select.clone();
            my_select.attr("class", $(input).attr("class"));
            $(input).replaceWith(my_select);
        });
    }

    function ensureActiveLobFormIsVisible() {
        var activeLobRadio = container.find("input[name=lob]:checked");
        if (activeLobRadio.length > 0) {
            updateTitle(activeLobRadio);
            switchForm(activeLobRadio.val(), false);
        }
    }

    function ajaxLoadLobForm(lob) {
        function onLoad() {
            monitorCanonicFieldValues(newLobContainer.find("form"));
            upperCaseSearchButton();
            switchForm(lob, true);
        }
        function upperCaseSearchButton()  {
            newLobContainer.find("input[type='submit']").each(function() {
                 $(this).val($(this).val().toUpperCase());
            });
        }
        var newLobContainer = $('<div class="lobForm lobForm-' + lob + '"/>').hide().appendTo(formContainer);
        var design = window['g_wizDesign'] ? "/" + g_wizDesign : '';
        var isdateless = '';
        var typeaheadversion = '';
        if( window['g_wizDesign']){
            isdateless = lob=="hotelOnly" ? "/0" : '/1';   //0 means false, 1 means support
            typeaheadversion = lob=="hotelOnly" ? "/2" : "/1"; //2 single search, 1 new ui only
        }
        var packageTreat = '';
        if( window['g_packageTreatment']){
            packageTreat = '/' + g_packageTreatment;
        }
        // different page can have different style lob
        var pageType = "";
        if(window['g_isDomesticHotel']){
            pageType="domestic";
        }
        newLobContainer.load("/publishing/wizard-lob-form/" + pageType + lob + design + isdateless + typeaheadversion + packageTreat, onLoad);
    }

    var container = $(publishing.WIZARD_CONTAINER_ID);
    var heading = container.find(".title h3");
    var formContainer = container.find(".allLobForms");

    // support for original wizard
    container.find("input[name=lob]").change(lobChanged);
    // support for tabbed wizard
    if (window.g_wizDesign !== undefined && g_wizDesign == "responsive") {
        container.find(".change-lob").click(lobChangedFromTab);
    }

    publishing.wizard.BIASED_FOR_HOTELS_PER_CITY = !$.isEmptyObject(publishing.wizard.hotelsForCities);
    if (publishing.wizard.BIASED_FOR_HOTELS_PER_CITY) {
        setUpHotelBiasingSelects(container);
    }

    ensureActiveLobFormIsVisible();

    container.find("form").each(function() {
        monitorCanonicFieldValues($(this));
    });
};


publishing.wizard.numberOfRoomsListener = function(rooms, maxRooms, opts) {

    function addRoom(i) {
        var newRoom = getRoom(i);
        if (newRoom.length !== 0 && newRoom.is(':hidden')) {
            newRoom.find('.error').removeClass('error');
            newRoom.css("visibility","visible");
            newRoom.show();
        }
    }

    function getRoom(i) {
        return $(rooms[i - 1]);
    }

    return function() {
        var newCount = $(this).val();
        var room9 = 9;
        if(newCount<room9)
        {
            var button = $('#H-searchButton');
            button.text(opts.normalButtonText);
            $('#H-NumAdult1-label').show();
            $('#H-NumChild1-label').show();
            $('#hotelOnly-1-children-ages').show();
            for (var i = 2; i <= maxRooms; i++) {
                if (i <= newCount) {
                    addRoom(i);
                } else {
                    getRoom(i).hide();
                }
            }
        }
        else
        {
            var button = $('#H-searchButton');
            if('small'==publishing.wizard.SIZE || 'medium'==publishing.wizard.SIZE)
            {
                button.text(opts.normalButtonText);
            }
            else
            {
                button.text(opts.ninePlusRoomsButtonText);
            }
            $('#H-NumAdult1-label').hide();
            $('#H-NumChild1-label').hide();
            $('#hotelOnly-1-children-ages').hide();
            for (var i = 2; i < room9; i++) {
                getRoom(i).hide();
            }
            addRoom(room9);
        }
        var form = $(this.form);
        var childrenAgesFields = form.find("[data-canonic=childrenAge]:visible");
        var infantPreferencesContainer = form.find(".section-infants-pref");
        publishing.wizard.common.flight.accompaniedInfantListener(childrenAgesFields, infantPreferencesContainer)();
    }
};

publishing.wizard.numberOfChildrenListener = function(maxChildren, childrenAgesFields) {
    return function(eventObject, preserveValue) {

        if (preserveValue === undefined) preserveValue = false;
        var $this = $(this);

        $this.parents(".section-flight-age-group").find(".section-children-ages").toggle(($this.val() > 0));
        $this.parents(".section-age-group").children(".section-children-ages").toggle(($this.val() > 0));
        $this.parents(".room").children(".section-children-ages").toggle(($this.val() > 0));

        for (var i = 1; i <= maxChildren; i++) {
            var show = i <= $(this).val();
            var childAgeField = $(childrenAgesFields[i - 1]);

            childAgeField.closest("fieldset").toggle(show);
            childAgeField.closest("fieldset").toggleClass('hidden', !show);
            if (!show && !preserveValue) {
                childAgeField.val(publishing.UNDEFINED_CHILD_AGE);
            }
        }
    }
};

publishing.wizard.initRoom = function(room, validationRules, msg) {
    var numberOfChildrenField = room.field("numChildren");
    var numberOfTravellersFields = room.find(".number-of-travellers");
    var childrenAgesFields = room.field("childrenAge");
    var maxChild = numberOfChildrenField.find("option:last").val();

    numberOfChildrenField.bindAndTrigger(publishing.wizard.numberOfChildrenListener(maxChild, childrenAgesFields));
    if (msg.totalNumberOfTravellersPerRoom !== undefined) {
        validationRules.push(new publishing.validation.TotalBetween(1, -1, numberOfTravellersFields, msg.totalNumberOfTravellersPerRoom));
    }
    childrenAgesFields.each(function() {
        validationRules.push(new publishing.validation.ValueNot(publishing.UNDEFINED_CHILD_AGE, $(this), msg.childrenAge));
    });
};

publishing.wizard.initRooms = function(form, rooms, validationRules, msg, opts) {
    var numberOfRoomsField = form.field("numRooms");
    var maxRooms = numberOfRoomsField.find("option:last").val();

    numberOfRoomsField.bindAndTrigger(publishing.wizard.numberOfRoomsListener(rooms, maxRooms, opts));
    rooms.each(function(i, room) {
        publishing.wizard.initRoom($(room), validationRules, msg);
    });

    var numberOfTravellersFields = form.find(".number-of-travellers");
    var adultFields = form.find("[data-canonic='numAdults']");
    var seniorFields = form.find("[data-canonic='numSeniors']");
    var childrenFields = form.find("[data-canonic='numChildren']");
    validationRules.push(new publishing.validation.ChildrenMustNotBeAlone(adultFields, seniorFields, childrenFields, msg.childrenMustNotBeAlone));

    if (opts.hideShowRooms) {
      opts.hideShowRooms();
    }
};


publishing.wizard.common.flight.accompaniedInfantListener = function(childrenAgesFields, infantPreferencesContainer) {
    function isInfant(childAgeField) {
        return $(childAgeField).is(':visible') && ($(childAgeField).val() == '0' || $(childAgeField).val() == '1');
    }

    return function() {
        infantPreferencesContainer.toggle($.grep(childrenAgesFields, isInfant).length > 0);
    };
};

publishing.wizard.lobforms.additionalOptions = function(fields) {
    var showAdditionalOptionsField = fields.showAdditionalOptionsField;
    var additionalOptionsContainer = fields.additionalOptionsContainer;
    var hideAdditionalOptionsField = fields.hideAdditionalOptionsField;
    var infoLinkField = fields.infoLinkField;
    var infoContainer = fields.infoContainer;

    showAdditionalOptionsField.click(toggleAdditionalOptions);
    hideAdditionalOptionsField.click(toggleAdditionalOptions);

    if (infoLinkField !== undefined) {
        infoLinkField.click(function() {
            $(infoContainer).toggle();
        });
    }

    function toggleAdditionalOptions() {
        var showOptionsLinkName = $(showAdditionalOptionsField).attr('name');
        showAdditionalOptionsField.parent().toggle(this.name != showOptionsLinkName);
        showAdditionalOptionsField.parent().toggleClass('hidden', this.name == showOptionsLinkName);
        hideAdditionalOptionsField.parent().toggle(this.name == showOptionsLinkName);
        hideAdditionalOptionsField.parent().toggleClass('hidden', this.name != showOptionsLinkName);
        additionalOptionsContainer.toggle(this.name == showOptionsLinkName);
    }
};

publishing.wizard.canonicName = function(el) {
    var cn = el.attr("data-canonic");
    var elName = el[0].name;
    if('childrenAge'==cn)
    {
        elName = elName.replace('Rm', '').replace('Child', '').replace('Age', '')
        if(elName.length==1){elName = '1' + elName;}
        elName = 'ChildAge' + elName;
        cn = elName;
    }
    else if('numAdults'==cn)
    {
        cn = elName;
        if('NumAdult'==cn){cn = 'NumAdult1';}
    }
    else if('numSeniors'==cn)
    {
        cn = elName;
        if('NumSenior'==cn){cn = 'NumSenior1';}
    }
    else if('numChildren'==cn)
    {
        cn = elName;
        if('NumChild'==cn){cn = 'NumChild1';}
    }
    return cn;
};

$(publishing.wizard.init);

// End of file ../content/static_content/default/default/scripts/wizard/publishing.js

// Start of file ../content/static_content/default/default/scripts/wizard/validation.js
expNamespace("publishing.validation");

publishing.validation.Validator = function(rules, errorRenderer) {
    this.validate = function() {
        errorRenderer.clearAll();
        var isValid = true;
        $.each(rules, function() {
            var result = this.apply();
            if (!result.isValid) {
                errorRenderer.render(result.error);
                isValid = false;
            }
        });
        return isValid;
    };
};

publishing.validation.Error = function(fields, message) {
    this.fields = fields;
    this.message = message;
};

publishing.validation.Result = function(isValid, error) {
    this.isValid = isValid;
    this.error = error;
};

publishing.validation.ErrorRenderer = function(form, messagesContainer) {
    function alreadyDisplayed(error) {
        return messagesContainer.find(":contains(" + error.message + ")").length > 0;
    }

    this.render = function(error) {
        // hack for IE7 to get spacing right
        $('.ie7').children('.error').css('height', 'auto').css('margin-top', '10px');
        if (!alreadyDisplayed(error)) {
            messagesContainer.append('<li><span class="icon"/>' + error.message + '</li>');
        }
        $.each(error.fields, function() {
            if (window.g_wizDesign !== undefined && g_wizDesign == "responsive") {
              $(this).parent().addClass("invalid");
              form.find(".validation-msg").removeClass('hidden').addClass('error');
            }
            $(this).addClass("error");
        });
    };

    this.clearAll = function() {
        // hack for IE7 to get spacing right
        $('.ie7').children('.error').css('height', '0px').css('margin-top', '0px');
        messagesContainer.empty();
        form.find(".error").removeClass("error");
        if (window.g_wizDesign !== undefined && g_wizDesign == "responsive") {
            form.find(".invalid").removeClass("invalid");
              form.find(".validation-msg").addClass('hidden');
        }
    }
};

publishing.validation.Rule = function(isValid, fields, message) {
    if (fields.jquery === undefined && !$.isArray(fields)) {
        fields = [fields];
    }

    function anyFieldIsHidden() {
        var anyHidden = false;
        $.each(fields, function() {
            anyHidden = anyHidden || $(this).is(":hidden");
        });
        return anyHidden;
    }

    this.apply = function() {
        if (fields.length == 0 || anyFieldIsHidden() || isValid()) {
            return new publishing.validation.Result(true);
        } else {
            var error = new publishing.validation.Error(fields, message);
            return new publishing.validation.Result(false, error);
        }
    }
};

publishing.validation.NotEmpty = function(field, message) {
    function isValid() {
        return !field.blank();
    }

    return new publishing.validation.Rule(isValid, field, message);
};

publishing.validation.IsEmailAddress = function(field, message) {
    function isValid() {
        var pattern = new RegExp(/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/);
        return pattern.test(field.val());
    }
    return new publishing.validation.Rule(isValid, field, message);

};
publishing.validation.IsAlphabetOnly = function(field, message) {
    function isValid() {
        var pattern = new RegExp(/^[A-Za-z]+$/);
        return pattern.test(field.val());
    }
    return new publishing.validation.Rule(isValid, field, message);

};
publishing.validation.NotSelect = function(field, message) {
    function isValid() {
        return (field.val() != "Default");
    }

    return new publishing.validation.Rule(isValid, field, message);
};

publishing.validation.NotSelectCity = function(region, city, message) {
    function isValid() {
        return !(region.val() != "Other" && city.val() == "Default");
    }

    return new publishing.validation.Rule(isValid, city, message);
};

publishing.validation.CityBetween = function(originField, destField, message) {
    function isValid() {
        if(originField.blank() && destField.blank())
        {
            return true;
        }
        else
        {
            var origin = originField.val();
            var dest = destField.val();
            return origin != dest;
        }
    }
    return new publishing.validation.Rule(isValid, [originField, destField], message);
};


publishing.validation.OptionalDate = function(field, message) {
    function value() {
        return $.trim(field.val());
    }

    function valueHasChanged() {
        return !field.blank() && (originalValue != value());
    }

    function isValid() {
        return value() == publishing.DATE_FORMAT || !valueHasChanged() || publishing.util.parseDate(field.val()) != null;
    }

    var originalValue = value();
    return new publishing.validation.Rule(isValid, field, message);
};

publishing.validation.MandatoryDate = function(field, message) {
    function exists() {
        return field.val() != "" && field.val() != publishing.DATE_FORMAT;
    }

    function isValid() {
        return publishing.util.parseDate(field.val()) != null;
    }

    function anyFieldIsHidden() {
        var anyHidden = false;
        $.each(field, function() {
            anyHidden = anyHidden || $(this).is(":hidden");
        });
        return anyHidden;
    }

    this.apply = function() {
        if (anyFieldIsHidden()) {
            return new publishing.validation.Result(true);
        } else if (!exists()) {
            return new publishing.validation.Result(false, new publishing.validation.Error(field, message.mandatory));
        } else if (!isValid()) {
            return new publishing.validation.Result(false, new publishing.validation.Error(field, message.dateFormat));
        } else {
            return new publishing.validation.Result(true);
        }
    };

    return this;
};
publishing.validation.ConditionalDate = function(isDatelessSearch, checkField, field,message){

    function value() {
        return $.trim(field.val());
    }

    function isDateForced(){
        // require datesssearch enabled and checkField needs to be true
        return isDatelessSearch == false && !checkField.attr("checked");
    }

    function hasData() {
        return !field.blank() && value() != publishing.DATE_FORMAT;
    }

    function isValid() {

        if(!isDateForced())//ok with dateless search, can be empty, can be mm/dd/yy, canbe valid date
            return field.blank() || value() == publishing.DATE_FORMAT || publishing.util.parseDate(value()) != null;
        else//no dateless search, only can be valid date
            return publishing.util.parseDate(value()) != null;
    }

    this.apply = function() {
        if(isDateForced() && !hasData())
            return new publishing.validation.Result(false, new publishing.validation.Error(field, message.mandatory));
        else if(!isValid())
            return new publishing.validation.Result(false, new publishing.validation.Error(field, message.dateFormat));
        else
            return new publishing.validation.Result(true);
    };

    return this;
};

publishing.validation.DateRange = function(startDateField, endDateField, message, inclusive) {
    if (inclusive === undefined) inclusive = false;
    function isValid() {
        var startDate = publishing.util.parseDate(startDateField.val());
        var endDate = publishing.util.parseDate(endDateField.val());
        return startDate == null || endDate == null || (inclusive ? (startDate <= endDate) : (startDate < endDate));
    }

    return new publishing.validation.Rule(isValid, [startDateField, endDateField], message);
};

publishing.validation.DateBetween = function(field, fromDateField, toDateField, message) {
    function isValid() {
        var fromDate = publishing.util.parseDate(fromDateField.val());
        var toDate = publishing.util.parseDate(toDateField.val());
        var givenDate = publishing.util.parseDate(field.val());
        return fromDate == null || toDate == null || givenDate == null || (givenDate >= fromDate && givenDate <= toDate);
    }

    return new publishing.validation.Rule(isValid, field, message);
};

publishing.validation.DatePastMaxPurchaseDate = function(maxPurchaseDate, dateField, message) {
    function isValid() {
        var date = publishing.util.parseDate(dateField.val());
        var max = publishing.util.parseDate(maxPurchaseDate);
        return date == null || max == null || (max > date);
    }

    return new publishing.validation.Rule(isValid, [dateField], message);
};

publishing.validation.DateIsLessOrEqual = function(limit, dateField, message) {
    function isValid() {
        var date = publishing.util.parseDate(dateField.val());
        var max = publishing.util.parseDate(limit);
        return date == null || max == null || (max >= date);
    }

    return new publishing.validation.Rule(isValid, [dateField], message);
};

publishing.validation.DatesNotToManyDaysAppart = function(fromDateField, toDateField, days, message) {
    function isValid() {
        if (!days || !message) {
          return true;
        }
        var fromDate = publishing.util.parseDate(fromDateField.val());
        var toDate = publishing.util.parseDate(toDateField.val());
        var daysApart = 0;
        if (fromDate && toDate){
          var day = 24 * 60 * 60 * 1000;
          var diff = Math.abs(toDate.getTime() - fromDate.getTime());
          daysApart = Math.round(diff/day);
        }
        return fromDate == null || toDate == null || (daysApart <= days);
    }

    return new publishing.validation.Rule(isValid, [fromDateField, toDateField], message);
};

publishing.validation.DatePriorToAllowedDate = function(field, dateValue, message) {
    function isValid() {
        var minDate = publishing.util.parseDate(dateValue);
        var date = publishing.util.parseDate(field.val());
        return date == null || date >= minDate;
    }

    return new publishing.validation.Rule(isValid, field, message);
};

publishing.validation.PickUpHrsBeforeDropOffHrs = function(fromDateField, toDateField , fromTime,toTime, message) {

    function isValid() {


        if(fromDateField.val() == toDateField.val())
            {
                return parseInt(fromTime.val()) <= parseInt(toTime.val()) && (parseInt(fromTime.val()) + 120 ) <= parseInt(toTime.val()) ? true : false;
            } else{
            return true;
        }


    }

    return new publishing.validation.Rule(isValid, [fromTime,toTime], message)
};

publishing.validation.ValueNot = function(value, field, message) {
    function isValid() {
        return field.val() != value;
    }

    return new publishing.validation.Rule(isValid, field, message);
};

publishing.validation.TotalBetween = function(min, max, fields, message) {
    this.apply = function() {
        var total = 0;
        var visibleElements = fields.filter(':visible');

        $.each(visibleElements, function() {
            total += parseInt($(this).val(), 10);
        });

        var result = total >= min;

        if (max != -1)
            result = result && total <= max;

        if (visibleElements.length == 0 || result) {
            return new publishing.validation.Result(true);
        } else {
            var error = new publishing.validation.Error(visibleElements, message);
            return new publishing.validation.Result(false, error);
        }
    };

    return this;
};

publishing.validation.ChildrenMustNotBeAlone = function(adults, seniors, children, message) {
    this.apply = function() {
        var noAdult = false;
        var visibleElements = [];
        var visibleAdults = adults.filter(':visible');
        var visibleSeniors = seniors.filter(':visible');
        var visibleChildren = children.filter(':visible');
        if(visibleChildren.length > 0)
        {
            for(var i = 0; i < visibleChildren.length; i++)
            {
                if(parseInt($(visibleChildren[i]).val()) > 0 && parseInt($(visibleAdults[i]).val()) == 0 &&  parseInt($(visibleSeniors[i]).val()) == 0)
                {
                    noAdult = true;
                    visibleElements.push(visibleAdults[i]);
                    visibleElements.push(visibleSeniors[i]);
                    visibleElements.push(visibleChildren[i]);
                }
            }
        }
        if (visibleElements.length == 0 || !noAdult) {
            return new publishing.validation.Result(true);
        } else {
            var error = new publishing.validation.Error(visibleElements, message);
            return new publishing.validation.Result(false, error);
        }
    };
    return this;
};

;
// End of file ../content/static_content/default/default/scripts/wizard/validation.js

// Start of file ../content/static_content/default/default/scripts/wizard/jquery.utils.js
(function($) {
    var extensions = {
        any: function(object, predicate) {
            var $self = this;
            if (arguments.length == 1) {
                predicate = object;
            } else {
                $self = object;
            }
            var found = false;

            $.each($self, function(i, e) {
                if (!found)
                    found = found || predicate(i, e);
            });
            return found;
        },
        all: function(object, predicate) {
            var $self = this;
            if (arguments.length == 1) {
                predicate = object;
            } else {
                $self = object;
            }
            var result = true;
            $.each($self, function(i, e) {
                result = result && predicate(i, e);
            });
            return result;
        },
        blank: function(object, predicate) {
            var $self = this;
            if (predicate === undefined) {
                predicate = object;
            } else {
                $self = object;
            }

            return $.all($self, function(i, e) {
                if (e.value !== undefined) e = e.value;
                return $.trim(e) == '';
            });
        }
    };

    $.extend($, extensions);
    $.extend($.fn, extensions);
    $.extend($.fn, {
        field: function(canonicName) {
            return this.find("[data-canonic='" + canonicName + "']");
        },
        toggleSection: function(section) {
            return this.bindAndTrigger(function() {
                if ($(this).attr('checked')) {
                    section.show();
                } else {
                    section.hide();
                }
            });
        },
        initLobForm: function(opts, validator, onSuccess) {
            var $that = $(this);

            $(document).ajaxSuccess(attemptTA);
            function attemptTA() {
                if (!publishing.wizard.TAinstance)
                    publishing.wizard.TAinstance = $('[data-provide="typeahead"]').data('typeahead');
            }


            var $form = this;
            $form.find('input[type=text],select').focus(function(){
              $(this).parent().parent().addClass('fieldFocus');
            });
            $form.find('input[type=text],select').blur(function(){
              $(this).parent().parent().removeClass('fieldFocus');
            });
            $form.find("input[data-type='date']").attachCalendar(opts).each(function() {
                if (this.value == "") this.value = publishing.DATE_FORMAT;
                var field = $(this);
            });

            var lobCurrentSearch = $form.attr('class');

            if(publishing.wizard.checkForChrome23OrAbove())
            {
                if((lobCurrentSearch === 'hotelOnly') || (lobCurrentSearch === 'flightOnly'))
                {
                    $form.find(".xp-b-submit2").mousedown(function(ev)
                    {
                        publishing.wizard.handleMouseDown($form);
                    });
                }
            }

            this.submit(function(ev) {

                if (opts.interstitial) {
                  publishing.wizard.turnOnInterstitial($form.find("button"), opts);
                }

                publishing.wizard.addPackageLobFields($form.attr('class'), $form);

                $form.find("input[data-type='date']").each(function() {
                    if (this.value == publishing.DATE_FORMAT) this.value = '';
                });
                $form.find("input[data-default]").each(function() {
                    if (this.value == $(this).attr('data-default')) this.value = '';
                });


                var result = validator === undefined ? true : validator.validate();

                $form.find("input[data-type='date']").each(function() {
                    var enableDatelessFields = $form.find("input[data-canonic='enableDateless']");
                    if(enableDatelessFields.length > 0 && enableDatelessFields[0].checked){

                        if($(this).attr("data-canonic") == "fromDate")
                            $("input[name='storedCheckinField']").val(this.value);
                        if($(this).attr("data-canonic") == "toDate")
                            $("input[name='storedCheckoutField']").val(this.value);
                        this.value = '';
                    }
                });

                if (result) {
                    if (onSuccess != undefined) onSuccess();
                    //remove all hidden input filed but preserve hidden input location fileds for multi dest form
                    $form.find('.ignore-hidden-fields').find(':input').filter('[class!=Do-Not-Remove]').filter(':hidden').remove();
                }else{
                    var enableDatelessFields = $form.find("input[data-canonic='enableDateless']");
                    if(enableDatelessFields.length > 0)
                    enableDatelessFields[0].checked = false;
                }

                if (result) {
                    var lobConverted,
                        $lobElements = $('[name="lob"]'),
                        lob,
                        $lobForm = $(),
                        lobConversionDict = {
                            flightOnly : 'flight',
                            flightAndHotel : 'flightHotel',
                            flightHotelAndCar : 'flightHotelCar',
                            flightAndCar : 'flightCar',
                            hotelOnly : 'hotel',
                            carOnly : 'car',
                            hotelAndCar : 'hotelCar',
                            activities : 'activity'
                        };
                    if ($lobElements.length) {
                        lob = $('[name="lob"]').filter(':checked').attr('value');
                        $lobForm = $('.' + lob);
                    } else {
                        //responsive
                        $lobForm = $('[type="submit"]:visible').closest('form');
                        lob = $lobForm.attr('class');
                    }

                    //Convert lob if necessary.
                    lob = lobConversionDict[lob] ? lobConversionDict[lob] : lob;

                    //new submission logic doesn't support legacy train urls.
                    var isTrainSelected = $('#trainAndHotel-tab').hasClass('on');
                    var isActivitiesSelected = $('#activities-tab').hasClass('on') || $that.closest('form').hasClass('activities');
                    var isCruiseSelected = $('#cruise-tab').hasClass('on') || $form.hasClass("cruise");
                    var isCarWithDiscountCode = ($('#carOnly-tab').hasClass('on') || $form.hasClass("carOnly"))
                    		&& $form.field('hasDiscode').val() != "0";
                    var isPackageSelected = ( $('#vacationPackage').attr('checked') === 'checked');

                    //Can't use old submission logic for mobile even if newValidationLogic is disbabled.
                    var isHashlessURLneeded = publishing.isMobile && (lob === 'hotel');

                    if ((!isActivitiesSelected &&
                         !isTrainSelected &&
                         !isCruiseSelected &&
                         !isPackageSelected &&
                         !isCarWithDiscountCode &&
                         publishing.isNewValidationLogicEnabled
                         )
                        || isHashlessURLneeded) {
                        ev.preventDefault();
                        //use new submission process (same as corewizard)

                        var model = {},
                            searchUrl,
                            conversionDict = {
                                'fromDate' : 'startDate',
                                'toDate' : 'endDate',
                                'numAdults' : 'adults',
                                'fromAirport2' : 'origin',
                                'date2' : 'departing',
                                'toAirport2' : 'destination',
                                'fromAirport3' : 'origin',
                                'date3' : 'departing',
                                'toAirport3' : 'destination',
                                'fromAirport4' : 'origin',
                                'date4' : 'departing',
                                'toAirport4' : 'destination',
                                'fromAirport5' : 'origin',
                                'date5' : 'departing',
                                'toAirport5' : 'destination',
                                'numRooms' : 'rooms',
                                'numChildren' : 'children',
                                'numAdults' : 'adults',
                                'specialEquipment-S' : 'skirack',
                                'specialEquipment-I' : 'infantseat',
                                'specialEquipment-T' : 'toddlerseat',
                                'specialEquipment-W' : 'chains',
                                'specialEquipment-L' : 'lefthand',
                                'specialEquipment-R' : 'righthand',
                                'specialEquipment-N' : 'navigation',
                                'carType' : 'type',
                                'RentalCompany' : 'vendor',
                                'destination' : 'pickup',
                                'dropOffLocation' : 'dropoff',
                                'hotelClass' : 'star',
                                'accommodationType' : 'lodging',
                                'fromTime' : 'startTime',
                                'toTime' : 'endTime',
                                'refundableFlightsOnly': 'noPenalty',
                                'directFlightsOnly': 'nonStop',
                                'airlinePreference': 'carrier',
                                'partialHotelBooking' : 'isPartialStay',
                                'flexibleFromDate' : 'checkin',
                                'flexibleToDate' : 'checkout'
                            },
                            lobPackageDictionary = {
                                'flightHotelCar' : 'FHC',
                                'flightHotel' : 'FH',
                                'flightCar' : 'FC',
                                'hotelCar' : 'HC'
                            },
                            accommodationTypeDictionary = {
                                '1' : 'hotel',
                                '5' : 'bedBreakfast',
                                '16' : 'apartment',
                                '7' : 'condo',
                                '8' : 'allInclusive'
                            },
                            carTypeDictionary = {
                                'NoPreference' : '1',
                                'Economy' : '2',
                                'Compact' : '5',
                                'Midsize' : '3',
                                'Standard' : '6',
                                'FullSize' : '4',
                                'Premium' : '9',
                                'Luxury' : '7',
                            },
                            carSearchTypeDictionary = {
                                'AIRPORT' : 1,
                                'PLACE' : 4,
                                'USADDRESS' :2
                            },
                            $tripTypeElements = $('[name="TripType"]'),
                            tripType;

                        function retrieveCanonicValues($scope, model, filter) {
                            //default jquery filter to only visible
                            filter = filter ? filter : ':visible';
                            $scope
                                .find('[data-canonic]')
                                .filter(filter)
                                .each(function() {
                                var canonicName = $(this).data('canonic');
                                if (canonicName) {
                                    //Convert canonic names as necessary, or leave it as-is.
                                    canonicName = conversionDict[canonicName] ? conversionDict[canonicName] : canonicName
                                    //checkbox val() is incorrect.
                                    if ($(this).attr('type') === 'checkbox') {
                                        model[canonicName] = $(this).prop('checked');
                                    } else {
                                        model[canonicName] = $(this).val();
                                    }

                                }
                            });
                            model.destination = model.destination || model.pickup;
                        }

                        function constructHotelRooms($scope, model) {
                            var rooms = [];
                            if ($('#H-NumRoom').val() === "9") model.isNinePlusRoomRequest = true;
                            $('.rooms').find('.room').filter(':visible').each(function() {
                                var room = {};
                                retrieveCanonicValues($(this), room);
                                room.children = getChildObject($(this), room);
                                rooms.push(room);
                            });
                            model.rooms = rooms;
                        }

                        function getLapOrSeatInfo($scope, model) {
                            $lobForm.find('[name="InfantInSeat"]').each(function() {
                                if ($(this).prop('checked')) {
                                    var isLapSeat = ($(this).val() === '2');
                                    if (isLapSeat) {
                                        model.lapSeat = 'lap';
                                        model.isChildInLap = true;
                                    } else {
                                        model.lapSeat = 'seat';
                                        model.isChildInLap = false;
                                    }
                                }
                            });
                        }


                        function getChildObject($scope, room) {
                            var children = [];
                            $scope.find('[data-canonic="childrenAge"]:visible').each(function(j) {
                                children.push(parseInt($(this).val()));
                            });
                            return children;
                        }

                        // use lobform to scope our data retrieval.
                        retrieveCanonicValues($lobForm, model);


                        function getAdvancedOptions($lobForm, model) {
                            var $advancedWrapper = $lobForm.find('.additionalOptionsLink');
                            retrieveCanonicValues($advancedWrapper, model);
                        }

                        function convertOldTimeFormat(time) {
                            time = parseInt(time);
                            var modulus = "" + (time % 60);
                            if (modulus.length === 1) modulus = '0' + modulus;

                            if (time < 60) {
                                if (time === 1) {
                                    return '1200AM';
                                } else {
                                    return '1230AM';
                                }
                            } else if (time === 720) {
                            	return '1200PM';
                            } else if (time === 750) {
                            	return '1230PM';
                            } else if (time < 780) {
                                return "" + Math.floor(time / 60) + modulus + 'AM';
                            } else {
                                return "" + (Math.floor(time / 60) - 12) + modulus + 'PM';
                            }
                        }

                        // special cases per lob
                        switch (lob) {
                            case 'flight' :
                                model.originTLA = publishing.wizard.TLA && publishing.wizard.TLA['F-origin'] ? publishing.wizard.TLA['F-origin'] : null;
                                model.destinationTLA = publishing.wizard.TLA && publishing.wizard.TLA['F-destination'] ? publishing.wizard.TLA['F-destination'] : null;
                                $tripTypeElements.each(function() {
                                    //jquery val() gives false data here.
                                    if ($(this).prop('checked')) {
                                        tripType = $(this).attr('value');
                                    }
                                    //special cases per tripType
                                    switch (tripType) {
                                        case 'RoundTrip' :
                                            model.isRoundtrip = true;
                                            model.flighttype = 'roundtrip';
                                        break;
                                        case 'Multicity' :
                                            model.isMultiDest = true;
                                            model.multidest = [];
                                            model.flighttype = 'multi';
                                            model.origin = $lobForm.find('[data-canonic="origin"]:visible').val();
                                            $('#multiDestinationsDiv').find('.section').each(function() {
                                                var leg = {};
                                                retrieveCanonicValues($(this), leg);
                                                if (leg.origin && leg.destination && (leg.departing || leg.start)) {
                                                    model.multidest.push(leg);
                                                }

                                            });
                                        break;
                                        case 'OneWay' :
                                            model.flighttype = 'oneway';
                                        break;
                                    }
                                    getLapOrSeatInfo($lobForm, model);
                                    model.ages = getChildObject($lobForm, model);
                                });

                            break;
                            case 'hotel' :
                                model.isHotelOnly = true;
                                if (publishing.wizard.BIASED_FOR_HOTELS_PER_CITY) {
                                	var chosenCityId = $form.field('destination').val();
                                	var hotelsForCity = $.grep(publishing.wizard.hotelsForCities, function(city, i) {
                                        return city.cityId == chosenCityId;
                                    })[0];
                                    model.group = hotelsForCity.hotelIds.join(",");
                                    model.regionId = hotelsForCity.cityId;
                                    model.destination = $form.field('destination').find(":selected").text();
                                }
                                constructHotelRooms($lobForm, model);
                            break;
                            case 'car' :
                                model.car = model.car || {};

                                retrieveCanonicValues($lobForm, model.car, '*');
                                //convert car type and searchType to numeric value.
                                model.car.searchType = carSearchTypeDictionary[model.car.searchType];
                                model.car.type = carTypeDictionary[model.car.type];
                                model.startTime = convertOldTimeFormat(model.startTime);
                                model.endTime = convertOldTimeFormat(model.endTime);

                            break;
                            case "flightHotelCar" :
                                model.startTime = 362; // hard-coding for test automation purposes
                                model.endTime = 362; // hard-coding for test automation purposes
                            case "flightHotel" :
                            case "flightCar" :
                                model.startTime = 362; // hard-coding for test automation purposes
                                model.endTime = 362; // hard-coding for test automation purposes
                            case "hotelCar" :
                                model.packageType = lobPackageDictionary[lob];
                                model.isPackage = true;
                                getLapOrSeatInfo($lobForm, model);
                                constructHotelRooms($lobForm, model);

                            break;

                        }

                        if (publishing.isMobile) {
                            //read from FTL
                            model.isMobileDevice = true;
                        }


                        //temporary fix for cabin class values.
                        if (model.cabinClass) {
                            model.cabinClassLegacy = model.cabinClass;
                            switch (model.cabinClass) {
                                case '1':
                                    model.cabinClass = 'first';
                                    break;
                                case '2':
                                    model.cabinClass = 'business';
                                    break;
                                case '5':
                                    model.cabinClass = 'premium';
                                    break;
                                case '3':
                                    model.cabinClass = 'economy';
                                    break;
                                default:
                                    model.cabinClass = 'economy';
                                    break;
                            }
                        }
                        //end temp fix

                        //eap.asp on mobile flights REQUIRES flight TLAs rather than strings.
                        //if we have last search data, we need to fetch these from typeahead.
                        //Typeahead is intialized in a closure on these pages, so we need to
                        //borrow an instance from a jquery object.

                        var masterDeferred = new $.Deferred();
                        if (model.isMobileDevice && lob === 'flight' && model.flighttype !== 'multi') {
                            var originDeferred = new $.Deferred(),
                                destinationDeferred = new $.Deferred(),
                                $originElement = $('#F-origin'),
                                $destinationElement = $('#F-destination');

                            //grab a copy of typeahead.
                            var typeAheadInstance = publishing.wizard.TAinstance;

                            if (!typeAheadInstance) {
                                var oldTypeAhead = window.TA;
                                typeAheadInstance = {};
                            } else {
                                //cache old callback
                                var oldCallback = typeAheadInstance.callback;
                            }

                            //origin has not initated TA, probably because of last search.
                            if (!model.originTLA && $originElement.val()) {
                                typeAheadInstance.callback = function(data) {
                                    model.originTLA = (data && data.r && data.r[0] && data.r[0].a) || (data && data[0] && data[0].a);
                                    originDeferred.resolve();
                                }
                                if (oldTypeAhead) {
                                    oldTypeAhead.getData($originElement.val(), typeAheadInstance.callback);
                                } else {
                                    typeAheadInstance.request($originElement.val());
                                }

                            } else {
                                originDeferred.resolve();
                            }
                            //destination has not initated TA, probably because of last search.
                            if (!model.destinationTLA && $destinationElement.val()) {
                                typeAheadInstance.callback = function(data) {
                                    model.destinationTLA = (data && data.r && data.r[0] && data.r[0].a) || (data && data[0] && data[0].a);
                                    destinationDeferred.resolve();
                                }
                                if (oldTypeAhead) {
                                    oldTypeAhead.getData($destinationElement.val(), typeAheadInstance.callback);
                                } else {
                                    typeAheadInstance.request($destinationElement.val());
                                }

                            } else {
                                destinationDeferred.resolve();
                            }
                            $.when(destinationDeferred, originDeferred).then(function() {
                                masterDeferred.resolve();
                                if (!oldTypeAhead) {
                                    typeAheadInstance.callback = oldCallback;
                                }
                            });

                        } else {
                            //no async TA action required; resolve deferred to remain synchronous
                            masterDeferred.resolve();
                        }

                        //mobile team wants constructed hashless URL
                        if (isHashlessURLneeded) {
                            model.isHashlessURLneeded = true;
                        }

                        var getURLandRedirect = function() {
                            searchUrl = !$.isEmptyObject(model) &&
                            //if the model is non empty.
                            corewizard &&
                            corewizard.search &&
                            corewizard.search.getSearchUrl &&
                            typeof corewizard.search.getSearchUrl === 'function' &&
                            //and all of these things exist
                            corewizard.search.getSearchUrl(model, lob);
                            if (searchUrl) {
                                // temporary fix for advanced features.
                                // corewizard URL generator does not consider advanced features
                                // that are only on the publishing wizard, as those fields
                                // don't exist on the new corewizard.
                                if ($lobForm.find('.additionalOptionsLink').length && !model.isMobileDevice) {
                                    //getAdvancedOptions($lobForm, model);
                                    if (model.lodging) searchUrl += '&lodging=' + accommodationTypeDictionary[model.lodging];
                                    if (model.star && model.star !== '0') searchUrl += '&star=' + model.star;
                                    if (model.hotelName) searchUrl += '&hotelName=' + model.hotelName;
                                }

                                //add hotel chain, if it's populated.
                                if ($('[name="hotelChainId"]').length) {
                                    searchUrl += '&chain=' + $('[name="hotelChainId"]').val();
                                }


                                if (lob === 'flightCar') {
                                    //new submission doesn't consider
                                    //flight passengers.
                                    searchUrl += '&NumRoom=1';
                                    if (model.children) {
                                        searchUrl += '&NumChild1=' + model.children;
                                        var childAges = getChildObject($('.section-children-ages'));
                                        $.each(childAges, function(i) {
                                            searchUrl += '&Rm1Child' + (i + 1) + 'Age=' + this;
                                        });
                                    }
                                    if (model.adults) searchUrl += '&NumAdult1=' + model.adults;
                                    if (model.numSeniors) searchUrl += '&NumSenior1=' + model.numSeniors;
                                }

                                //if lob has "car" in it
                                var lobString = lob.toLowerCase();
                                if (lobString.indexOf('car') > 0) {
                                    // new submission logic doesn't support
                                    // from/to time for packages with cars.
                                    searchUrl += '&FromTime=' + model.startTime + '&ToTime=' + model.endTime;
                                }


                                //fix for senior dropdown (deprecated in new search logic)
                                if (model.numSeniors) {
                                    searchUrl = searchUrl.replace(/seniors:0/, 'seniors:' + model.numSeniors);
                                }
                                //send user to searchUrl's location.

                                window.location = searchUrl;

                            }//if (searchURl)

                        }//getURLandRedirect()

                        //masterDeferred may be async if mobile and TA hasn't been used.
                        $.when(masterDeferred).then(getURLandRedirect);

                        //must return false on submit action to prevent default browser form action.
                        return false;

                    }//if (!isActivitiesSelected && !isTrainSelected && publishing.isNewValidationLogicEnabled)

                    $form.find("select[data-default]").each(function() {
                        if (this.value == $(this).attr('data-default')) {
                            if('true' == $(this).attr('hiddenWhenDefaultValue'))
                                $(this).attr('name', '');
                        };
                    });

                    //remove the destination field from hotelOnly if the typeAhead already set the proper region id
                    //as the result may differ from expected if both CityId and destination parameters are passed
                    if ($("input[name='CityId']").length &&
                        ($form.attr('class') == "hotelOnly") &&
                        publishing.wizard.packageLobData.regionId) {

                        $form.field('destination')[0].disabled=true;
                    }
                    }
                    if (result) {
                        if (onSuccess != undefined) onSuccess();
                        //remove all hidden input filed but preserve hidden input location fileds for multi dest form
                        $form.find('.ignore-hidden-fields').find(':input').filter('[class!=Do-Not-Remove]').filter(':hidden').remove();
                    }else{
                        var enableDatelessFields = $form.find("input[data-canonic='enableDateless']");
                        if(enableDatelessFields.length > 0)
                        enableDatelessFields[0].checked = false;
                    }
                    if (result && publishing.wizard.ON_FORM_SUBMIT !== undefined) {
                        result = publishing.wizard.ON_FORM_SUBMIT(ev, opts);
                    }
                    if ((publishing.wizard.TA_POPUNDER) && (publishing.wizard.siteId)) {
                        var formType = $form.attr('class');
                        var kickOffPopUnder = (formType == "flightOnly" || formType == "hotelOnly");

                        if (typeof(PopUnder) != "undefined" && kickOffPopUnder) {
                            PopUnder.initialize($(ev.target).attr('class'),publishing.wizard.siteId);
                        }
                    }
                    var submitFormTimeout;
                    if (result) {
                      var infantSel = $form.find('[name=InfantInSeat][value=2]');
                      if (infantSel != null && infantSel.is(":checked")) {
                   infantSel.attr("name", "");
                 infantSel.attr("value", "");
                      }
                      var searchType = $form.find("input[name=SearchArea]");
                      var searchTerm = $form.find("#H-destination").val();
                      var typeahead = window['TA'] ? TA.getInstance('H-destination') : false;
                      if (searchType && searchTerm && typeahead && typeahead.On && !typeahead.selectedItem) {
                          result = ($form.gotData) ? true : false;
                          if (!result) {
                            TA.getData(searchTerm, function(data)
                            {
                              var type = 'CITY';
                              if (data && data.length == 1)
                              {
                                type = data[0].t;
                              }
                              searchType.val(type);
                              $form.gotData = true;
                              $form.submit();
                            });
                           submitFormTimeout = setTimeout(function(){searchType.val('CITY'); $form.gotData = true;$form.submit();}, 3000);
                          }
                      }
                      var rfrrIdPostfix = {"flightOnly":"Flight", "hotelOnly":"Hotel", "flightAndHotel":"FH", "flightAndCar":"FC", "hotelAndCar":"HC", "flightHotelAndCar":"FHC", "carOnly":"Car","activities":"Activities","cruise":"Cruise", "threePP":"ThreePP", "threePPTravelPackages":"ThreePPTravelPackages", "trainAndHotel":"TH" };
                      var formClass = $form.attr('class');
                        if(window['TA'] && 'flightAndHotel' == formClass || 'flightAndCar' == formClass || 'flightHotelAndCar' == formClass || 'hotelAndCar' == formClass)
                        {
                            if(typeahead && typeahead.On)
                            {
                                var selItem = typeahead.selectedItem;
                                if (selItem && selItem.id!='' && selItem.tla!='')
                                {
                                    var destID = selItem.id + ':' + selItem.tla;
                                    $('<input>').attr({type:'hidden', name:'DestID', value:destID}).appendTo($form);
                                }
                            }
                            typeaheadO = TA.getInstance(rfrrIdPostfix[formClass] + '-origin');
                            if(typeaheadO && typeaheadO.On)
                            {
                                var selItem = typeaheadO.selectedItem;
                                if (selItem && selItem.id!='' && selItem.tla!='')
                                {
                                    var tla = selItem.tla;
                                    $form.find('input[name=FrAirport]').attr('name', '');
                                    $('<input>').attr({type:'hidden', name:'FrAirport', value:tla}).appendTo($form);
                                }
                            }
                        }
                    }
                    if (!result && opts.interstitial) {
                      publishing.wizard.turnOffInterstitial($form.find("button"), opts);
                    }

                    // Submit Omniture tracking
                    var rfrrIdTabPostfix = {"flightOnly":"FltTab.", "hotelOnly":"HotTab.", "package":"PckgTab.", "flightAndHotel":"PckgTab."};
                    var postFix = '';
                    var tab = '';
                    var rfrrLob = rfrrIdTabPostfix[$form.attr('class')];
                    if (window['g_packageTreatment']) {
                        if (g_packageTreatment == 'Radio') {
                            postFix = '2';
                        } else if (g_packageTreatment == 'Checkbox') {
                            postFix = '3';
                            if (rfrrIdTabPostfix[$('.current-lob').attr('data-lob')]) {
                                tab = rfrrIdTabPostfix[$('.current-lob').attr('data-lob')];
                            }
                        } else if (g_packageTreatment == 'RadioAndCheckbox'){
                            postFix = '4';
                            if (rfrrIdTabPostfix[$('.current-lob').attr('data-lob')]) {
                                tab = rfrrIdTabPostfix[$('.current-lob').attr('data-lob')]    ;
                            }
                        }
                    } else if (window['g_wizHorizontalRadio']) {
                        postFix = 5;
                    } else if (window['g_wizHorizontalTab']) {
                        postFix = 6;
                    }
                    try{trackClick(this, 'a', document.getElementById('pageId').value + '.SrchWzd.' + tab + rfrrLob + postFix);}catch(e){}
                    clearTimeout(submitFormTimeout);
                    return result;
            });
        },
        attachCalendar: function(opts) {
            return this.each(function(i, elem) {
            var $elem = $(elem);
                var endDateCanonicName = $elem.attr("data-end-date");
                var startDateCanonicName = $elem.attr("data-start-date");
                var otherDateField;
                var isReturnDateField;
                var calendarCallback;
                if (endDateCanonicName) {
                    otherDateField = $elem.parents("form").field(endDateCanonicName);
                } else if (startDateCanonicName) {
                    isReturnDateField = true;
                    otherDateField = $elem.parents("form").field(startDateCanonicName);
                }
                // if we have an otherDateDield object it is a collection, get the first item
                if (otherDateField) {
                  otherDateField = otherDateField[0];
                }
                if($elem.attr("data-canonic") == "fromDate"){
                    calendarCallback = opts.startDateCalCallback;
            }
                var config = config || {};
                if(g_datepicker){
                    if(opts.maxDepartureDate && true !== isReturnDateField)
                    {
                        g_datepicker.register(elem, elem,  DPDisplay, opts.minPurchaseDate, opts.maxDepartureDate, null, otherDateField, opts.maxDateRange, isReturnDateField, calendarCallback);
                    }
                    else
                    {
                        g_datepicker.register(elem, elem,  DPDisplay, opts.minPurchaseDate, opts.maxPurchaseDate, null, otherDateField, opts.maxDateRange, isReturnDateField, calendarCallback);
                  }
                }
                var $multiDestinationsDiv = $elem.parents("#multiDestinationsDiv");
                var durationDays = opts.defaultDurationDays;
                if($multiDestinationsDiv && $multiDestinationsDiv.length && !isNaN(opts.multiDestinationsDurationDays)){
                    durationDays = opts.multiDestinationsDurationDays;
                }
                // if there is an endDateCanonicName elem == start date feild
                // Don't register twice so if elem == end date feild do nothing
                if(g_dateUpdater && endDateCanonicName && otherDateField){
                  g_dateUpdater.register(elem, otherDateField, durationDays, true);
                }
              });
        },
        triggerDatePicker: function(field,isForced){
        if(typeof field != "undefined"){
            if(isForced == true || field.blank() || field.val() == publishing.DATE_FORMAT)
                g_datepicker.pick(field[0]);
            }
        },
        bindAndTrigger: function(func) {
            return this.change(func).trigger('change', [true]);
        },
        clearErrors: function() {
            var $this = $(this);
            $this.find('.errors').each(function() {
                $(this).html("");
            });
            $this.find('.error').each(function() {
                $(this).removeClass('error');
            });
            if (window.g_wizDesign !== undefined && g_wizDesign == "responsive") {
                $this.find(".invalid").removeClass("invalid");
                $this.find(".validation-msg").addClass('hidden');
            }
        }
    });
})(jQuery);
;
// End of file ../content/static_content/default/default/scripts/wizard/jquery.utils.js

// Start of file ../content/static_content/default/default/scripts/wizard/activities.js
;
expNamespace("publishing.validation");
expNamespace("publishing.wizard.lobforms");

publishing.wizard.lobforms.activities = function(opts) {
    var msg = opts.errorMessages;
    var form = $(publishing.WIZARD_CONTAINER_ID + ' form.activities');
    var taConfig = opts.taConfig;
    var destinationField = form.field('destination');
    var startDateField = form.field('fromDate');
    var endDateField = form.field('toDate');
    var isTypeAheadActivityUSOn = opts.isTypeAheadActivityUSOn;
    var newDesign = opts.newDesign;
    var defaultDuration = 14;
    if (newDesign) {
        startDateField.change(function() {
            var fromDate = publishing.util.parseDate(startDateField.val());
            if (fromDate) {
                endDateField.val(publishing.util.formattedDate(publishing.DATE_FORMAT, defaultDuration, fromDate));
            }
        });
    }

    var validationRules = [
        new publishing.validation.NotEmpty(destinationField, msg.destination),
        new publishing.validation.OptionalDate(startDateField, msg.startDate),
        new publishing.validation.OptionalDate(endDateField, msg.endDate),
        new publishing.validation.DateRange(startDateField, endDateField, msg.bookingDateRange, true),
        new publishing.validation.DatePriorToAllowedDate(startDateField, opts.minPurchaseDate, msg.startPriorToCurrentDate),
        new publishing.validation.DatePriorToAllowedDate(endDateField, opts.minPurchaseDate, msg.endPriorToCurrentDate)
    ];

    var errorRenderer = new publishing.validation.ErrorRenderer(form, form.find('ul.errors'));
    var validator = new publishing.validation.Validator(validationRules, errorRenderer);

    if(taConfig){taConfig.itemClickedEvent = publishing.wizard.preserveTA;}

    function activityTypeaheadSelected(suggestion) {
        form.triggerDatePicker(startDateField,false);
    }

    form.initLobForm(opts, validator);
    if (publishing.wizard.TYPEAHEAD_ENABLED && isTypeAheadActivityUSOn=="1") {
        publishing.wizard.typeahead(destinationField, taConfig, activityTypeaheadSelected);
    }

};

// End of file ../content/static_content/default/default/scripts/wizard/activities.js

// Start of file ../content/static_content/default/default/scripts/wizard/insurance.js
;

publishing.wizard.lobforms.insurance = function(opts) {
    var msg = opts.errorMessages;
    var form = $(publishing.WIZARD_CONTAINER_ID + ' form.insurance');
    var taConfig = opts.taConfig;
    //var destinationField = form.field('destination');
    var startDateField = form.field('fromDate');
    var endDateField = form.field('toDate');
    //var isTypeAheadActivityUSOn = opts.isTypeAheadActivityUSOn;
    var newDesign = opts.newDesign;
    var defaultDuration = 14;

    if (newDesign) {
        startDateField.change(function() {
            var fromDate = publishing.util.parseDate(startDateField.val());
            if (fromDate) {
                endDateField.val(publishing.util.formattedDate(publishing.DATE_FORMAT, defaultDuration, fromDate));
            }
        });
    }

    var validationRules = [
        //new publishing.validation.NotEmpty(destinationField, msg.destination),
        new publishing.validation.OptionalDate(startDateField, msg.startDate),
        new publishing.validation.OptionalDate(endDateField, msg.endDate),
        new publishing.validation.DateRange(startDateField, endDateField, msg.bookingDateRange, true),
        new publishing.validation.DatePriorToAllowedDate(startDateField, opts.minPurchaseDate, msg.startPriorToCurrentDate),
        new publishing.validation.DatePriorToAllowedDate(endDateField, opts.minPurchaseDate, msg.endPriorToCurrentDate)
    ];

    var errorRenderer = new publishing.validation.ErrorRenderer(form, form.find('ul.errors'));
    var validator = new publishing.validation.Validator(validationRules, errorRenderer);

    function triggerDatePicker(){
        if(startDateField.blank() || startDateField.val() == publishing.DATE_FORMAT)
            $(startDateField).click();
    }


 //   function insuranceTypeaheadSelected(suggestion) {
 //       triggerDatePicker();
 //   }

    form.initLobForm(opts, validator);
//    if (publishing.wizard.TYPEAHEAD_ENABLED && isTypeAheadActivityUSOn=="1") {
//        publishing.wizard.typeahead(destinationField, taConfig, insuranceTypeaheadSelected);
//    }

    //$(destinationField).focus(function(){if(typeof this.select != 'undefined')this.select();});

};


//Begin tuneInsurance

//Begin tgInsurance
expNamespace("publishing.wizard.lobforms");
publishing.wizard.lobforms.tgInsurance = function(opts) {
    var fname = getParameterByName("fname").substring(0,20);
    var lname = getParameterByName("lname").substring(0,20);
    var mailAddress = getParameterByName("mail").substring(0,64);

    var msg = opts.errorMessages;
    var form = $(publishing.WIZARD_CONTAINER_ID + ' form.insurance');
    var startDateField = form.field('departureDate');
    var endDateField = form.field('returnDate');
    var departureDateDefaultValue = startDateField.val();
    var defaultDuration = opts.defaultDurationDays;
    var applicantFirstName = form.field('applicantFirstName');
    var applicantLastName = form.field('applicantLastName');
    var applicantEmail = form.field('applicantEmail');
    var insurerFirstName = form.field('insurerFirstName');
    var insurerLastName = form.field('insurerLastName');
    var insurerGender = form.field('insurerGender');
    var insurerDOB = $("#insurance-InsurerDOB");
    var InsurerDOBYear = $("#InsurerDOB-Year");
    var InsurerDOBMonth = $("#InsurerDOB-Month");
    var InsurerDOBDay = $("#InsurerDOB-Day");

    if(fname !== "")
    {
    applicantFirstName.val(fname);
    insurerFirstName.val(fname);
    }
    if(lname !== "")
    {
    applicantLastName.val(lname);
    insurerLastName.val(lname);
    }
    if(mailAddress !== "")
    {
    applicantEmail.val(mailAddress);
    }

    startDateField.attr('maxlength',8);
    endDateField.attr('maxlength',8);
    applicantFirstName.attr('maxlength',20);
    applicantLastName.attr('maxlength',20);
    applicantEmail.attr('maxlength',64);
    insurerFirstName.attr('maxlength',20);
    insurerLastName.attr('maxlength',20);

    InsurerDOBYear.bind({
    change:function(){
    InsuranceDOBchange();
    }
    });
    InsurerDOBMonth.bind({
    change:function(){
    InsuranceDOBchange();
    }
    });
    InsurerDOBDay.bind({
    change:function(){
    InsuranceDOBchange();
    }
    });

    var dateFormat = opts.dateFormat;

    function InsuranceDOBchange()
    {
        var DOB = InsurerDOBYear.val() + InsurerDOBMonth.val() + InsurerDOBDay.val();
        insurerDOB.val(DOB);
    };

    var validationRules = [
        new publishing.validation.NotEmpty(applicantFirstName, msg.applicantFirstNameIsBlank),
        new publishing.validation.IsAlphabetOnly(applicantFirstName, msg.applicantNameIsAlphabetOnly),
        new publishing.validation.NotEmpty(applicantLastName, msg.applicantLastNameIsBlank),
        new publishing.validation.IsAlphabetOnly(applicantLastName, msg.applicantNameIsAlphabetOnly),
        new publishing.validation.NotEmpty(applicantEmail, msg.applicantEmailIsBlank),
        new publishing.validation.NotEmpty(insurerFirstName, msg.insurerFirstNamesBlank),
        new publishing.validation.IsAlphabetOnly(insurerFirstName, msg.insurerNameIsAlphabetOnly),
        new publishing.validation.NotEmpty(insurerLastName, msg.insurerLastNameIsBlank),
        new publishing.validation.IsAlphabetOnly(insurerLastName, msg.insurerNameIsAlphabetOnly),
        new publishing.validation.NotEmpty(InsurerDOBYear, msg.dobIsNotCorrect),
        new publishing.validation.NotEmpty(InsurerDOBMonth, msg.dobIsNotCorrect),
        new publishing.validation.NotEmpty(InsurerDOBDay, msg.dobIsNotCorrect),
        new publishing.validation.NotEmpty(insurerGender, msg.genderIsNotSelected),
        new publishing.validation.IsEmailAddress(applicantEmail, msg.isNotCorrectEmailAddress),
        new publishing.validation.MandatoryDate(startDateField,msg.departureDate),
        new publishing.validation.DateRange(startDateField, endDateField, msg.departureDateAndReturnDatesTooFarApart, true),
        new publishing.validation.DatePriorToAllowedDate(startDateField, opts.minPurchaseDate, msg.departurePriorToCurrentDate),
        new publishing.validation.DatePriorToAllowedDate(endDateField, opts.minPurchaseDate, msg.departurePriorToCurrentDate),
        new publishing.validation.DatesNotToManyDaysAppart(startDateField, endDateField, opts.maxDateRange, msg.departureDateAndReturnDatesTooFarApart)
    ];

    var errorRenderer = new publishing.validation.ErrorRenderer(form, form.find("ul.errors"));
    var validator = new publishing.validation.Validator(validationRules, errorRenderer);
    form.initLobForm(opts, validator, this.onSuccess);

    function getXmlDoc(userInfo)
    {
        var otaData = userInfo.otadata;
        var applicantInfo = otaData.applicant;
        var insurerInfo = otaData.insurer;
        var xmlDoc = "<?xml version=\"1.0\" encoding=\"utf-8\" ?><otadata><p>"+otaData.p+"</p><homepage>"+otaData.homepage+"</homepage>";
        xmlDoc += "<hoken_siki>";
        xmlDoc += otaData.departureDate;
        xmlDoc += "</hoken_siki>";
        xmlDoc += "<hoken_shuki>";
        xmlDoc += otaData.returnDate;
        xmlDoc += "</hoken_shuki>";
        xmlDoc += "<keiyaku>";
        xmlDoc += "<sei>"
        xmlDoc += applicantInfo.lastName;
        xmlDoc += "</sei>"
        xmlDoc += "<mei>"
        xmlDoc += applicantInfo.firstName;
        xmlDoc += "</mei>"
        xmlDoc += "<email>"
        xmlDoc += applicantInfo.email;
        xmlDoc += "</email>"
        xmlDoc += "</keiyaku>"

        xmlDoc += "<hihoken>"
        xmlDoc += "<sei>"
        xmlDoc += insurerInfo.lastName;
        xmlDoc += "</sei>"
        xmlDoc += "<mei>"
        xmlDoc += insurerInfo.firstName;
        xmlDoc += "</mei>"
        xmlDoc += "<sex>"
        xmlDoc += insurerInfo.sex;
        xmlDoc += "</sex>"
        xmlDoc += "<birth>"
        xmlDoc += insurerInfo.birth;
        xmlDoc += "</birth>"
        xmlDoc += "</hihoken>"
        xmlDoc += "</otadata>"
        return xmlDoc;
    }

    $('#tg-insurance-form').submit(function() {
    var result = validator === undefined ? true : validator.validate();
    var userInfo = {
      "otadata": {
        "p": opts.bootvalue,
        "homepage": opts.homepage,
        "departureDate": startDateField.val().replace(/\//g,""),
        "returnDate": endDateField.val().replace(/\//g,""),
        "applicant": {
          "lastName": applicantLastName.val(),
          "firstName": applicantFirstName.val(),
          "email": applicantEmail.val()
        },
        "insurer": {
          "lastName": insurerLastName.val(),
          "firstName": insurerFirstName.val(),
          "sex": $('input[name=InsurerGender]:radio:checked').val(),
          "birth": insurerDOB.val()
        }
      }
    };
    var xmlDoc = getXmlDoc(userInfo);
    var encodedXml = encodeURI(xmlDoc);
    if(result){
        var newForm = jQuery('<form>', {
            'action': opts.actionURL,
            'method': 'POST',
            'target': '_blank'
        }).append(jQuery('<input>', {
            'name': 'linkData',
            'value': encodedXml,
            'type': 'hidden'
        }));
        newForm.appendTo(document.body).submit();
    }
    return false;
    });

    function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}
}
//end tgInsurance

expNamespace("publishing.wizard.lobforms");

publishing.wizard.lobforms.tuneInsurance = function(opts) {

    var msg = opts.errorMessages;
    var form = $(publishing.WIZARD_CONTAINER_ID + ' form.insurance');
    var startDateField = form.field('departureDate');
    var departureDateDefaultValue = startDateField.val();
    var destinationField = form.find("select[name=Destination]");
    var coverageField = form.field('coverage');
    var typeOfPlanFiled = form.field('planType');
    var defaultDuration = opts.defaultDurationDays;
    var annualDuration = opts.annualDuration;
    var endDateField = form.field('returnDate');
    var dateFormat = opts.dateFormat;

    var validationRules = [
        new publishing.validation.NotEmpty(destinationField, msg.destinationIsBlank),
        new publishing.validation.NotEmpty(coverageField, msg.coverageIsBlank),
        new publishing.validation.NotEmpty(typeOfPlanFiled, msg.typeOfPlanIsBlank),
        new publishing.validation.MandatoryDate(startDateField,msg.departureDate),
        new publishing.validation.DateRange(startDateField, endDateField, msg.departurePriorToCurrentDate, true),
        new publishing.validation.DatePriorToAllowedDate(startDateField, opts.minPurchaseDate, msg.departurePriorToCurrentDate),
        new publishing.validation.DatePriorToAllowedDate(endDateField, opts.minPurchaseDate, msg.departurePriorToCurrentDate),
        new publishing.validation.DatesNotToManyDaysAppart(startDateField, endDateField, opts.maxDateRange, msg.checkInAndOutDatesTooFarApart)
    ];

    var errorRenderer = new publishing.validation.ErrorRenderer(form, form.find("ul.errors"));
    var validator = new publishing.validation.Validator(validationRules, errorRenderer);

    function refleshCustomDropdown()
    {
        setCustomSyleDropdownText(destinationField);
        setCustomSyleDropdownText(coverageField);
        setCustomSyleDropdownText(typeOfPlanFiled);
        var currentSelected = typeOfPlanFiled.find(':selected');
        if(currentSelected[0].value=='INSB'){
                typeOfPlanFiled.change();
            };
    };
    startDateField.change(function() {
        updateEndDate();
    });
    destinationField.bind({
    click: function(){
            var PopPos = destinationField.position();
            var topOffset = 30;
            var LeftPopPos = PopPos.left + destinationField.width() + 25;
            var TopPopPos = PopPos.top - topOffset +'px';
            LeftPopPos += 'px';
            showCountriesPopup(destinationField, TopPopPos, LeftPopPos);
            return false;
            },
        change: function(){
            $('#PopUp').fadeOut();
             setCustomSyleDropdownText(destinationField);
            }
       } );
    coverageField.bind({
    change: function(){
             setCustomSyleDropdownText(coverageField);
            }
    });
    typeOfPlanFiled.bind({
    change: function(){
             setCustomSyleDropdownText(typeOfPlanFiled);
             var currentSelected = typeOfPlanFiled.find(':selected');
             if(currentSelected[0].value=='INSB'){
             updateEndDate();
             $('#insurance-returnDate-label').parent().parent().hide();
             }else{
             updateEndDate();
             $('#insurance-returnDate-label').parent().parent().show();
             }
            }
    });
    $('#Question').css({'cursor':'pointer'}).click(function(){
            var PopPos = $('#Question').position();
            var topOffset = 30;
            var LeftPopPos = PopPos.left + $('#Question img').width() + $('#Question span').width() + 25;
            var TopPopPos = PopPos.top - topOffset +'px';
            LeftPopPos += 'px';
            showCountriesPopup($('#Question'), TopPopPos, LeftPopPos);
            return false;
           });
   function setCustomSyleDropdownText(filed)
      {
             var currentSelected = filed.find(':selected');
             var selectBoxSpan = filed.parent().next();
             var selectBoxSpanInner = selectBoxSpan.find(':first-child');
             selectBoxSpanInner.text(filed.find(':selected').text()).parent().addClass('changed');
      }

   function updateEndDate()
    {
        var fromDate = publishing.util.parseDate(startDateField.val());
        if (fromDate) {
         var currentSelected = typeOfPlanFiled.find(':selected');
         var duration = defaultDuration;
         if(currentSelected[0].value=='INSB'){duration = annualDuration;  }
         endDateField.val(publishing.util.formattedDate(dateFormat, duration, fromDate));
        }
    };
    function showCountriesPopup(domObj, offsetTop, offsetLeft){
            jQuery(document).one("click", function() { jQuery("#PopUp").fadeOut(); });
            $('#PopUp').css({'display':'block','top':offsetTop, 'left':offsetLeft}).click(function(){return false});
            $('.Close').css({'cursor':'pointer'}).click(function(){
                $('#PopUp').fadeOut();
                });
            };
    refleshCustomDropdown();
    form.initLobForm(opts, validator, this.onSuccess);
};
//End of tuneInsurance

// End of file ../content/static_content/default/default/scripts/wizard/insurance.js

//Start of file ../content/static_content/default/default/scripts/wizard/cruise.js
;
expNamespace("publishing.validation");
expNamespace("publishing.wizard.lobforms");

publishing.wizard.lobforms.cruise = function(opts) {
    var msg = opts.errorMessages;
    var form = $(publishing.WIZARD_CONTAINER_ID + ' form.cruise');

    var destinationField = form.field('destination');
    var validationRules = [
        new publishing.validation.NotEmpty(destinationField, msg.destination)
    ];

    var errorRenderer = new publishing.validation.ErrorRenderer(form, form.find('ul.errors'));
    var validator = new publishing.validation.Validator(validationRules, errorRenderer);

    form.initLobForm(opts, validator);
};

// End of file ../content/static_content/default/default/scripts/wizard/cruise.js

// Start of file ../content/static_content/default/default/scripts/wizard/carOnly.js

expNamespace("publishing.wizard.lobforms");

publishing.wizard.lobforms.carOnly = function(opts) {
    var msg = opts.errorMessages;
    var form = $(publishing.WIZARD_CONTAINER_ID + ' form.carOnly');
    var additionalOptionsContainer = new publishing.wizard.lobforms.carOnly.AdditionalOptions(form);
    var taConfig = opts.taConfig;
    var streetField = form.field('street');
    var cityField = form.field('city');
    var stateField = form.field('state');
    var zipField = form.field('zip');
    var pickUpLocationField = form.field('destination');
    var dropOffLocationField = form.field('dropOffLocation');
    var pickUpDateField = form.field('fromDate');
    var dropOffDateField = form.field('toDate');
    var pickUpTimeField = form.field('fromTime');
    var dropOffTimeField = form.field('toTime');
    var searchTypeField = form.find('select[name=SearchType]');
    var findCarsWithinField = form.field('distance');
    // This is a hidden field and i couldn't figure out how it impacts the results page, however we are making sure that this field is set correctly and posted back.
    var diffDropLocField = form.find('input[name=DiffDropLoc]');

    var defaultDropOffLocation = dropOffLocationField.attr('data-default');
    var dropOfField = $('#carsDropOff');
    var showDropOff = $('#showHideDropOff');
    var hideSpecialEquipment = $('#carOnly-hideSpecialEquipment');
    var showSpecialEquipment = $('#carOnly-showSpecialEquipment');
    var specialEquipmentContainer = $('#carOnly-specialEquipment');

    if (window.g_wizDesign !== undefined && g_wizDesign == 'tabbed') {
        showDropOff.change(function() {
            if (showDropOff.is(':checked')) {
                dropOfField.show();
            } else {
                dropOfField.hide();
            }
        });
        hideSpecialEquipment.click(function(){
            hideSpecialEquipment.hide();
            showSpecialEquipment.show();
            specialEquipmentContainer.hide();
        });
        showSpecialEquipment.click(function(){
            hideSpecialEquipment.show();
            showSpecialEquipment.hide();
            specialEquipmentContainer.show();
        })
    }

    var validationRules = [
        new publishing.validation.NotEmpty(streetField, msg.street),
        new publishing.validation.NotEmpty(cityField, msg.city),
        new publishing.validation.NotEmpty(stateField, msg.state),
        new publishing.validation.NotEmpty(zipField, msg.zip),
        new publishing.validation.NotEmpty(pickUpLocationField, msg.pickUpLocation),
        new publishing.validation.MandatoryDate(pickUpDateField, msg.pickUpDate),
        new publishing.validation.MandatoryDate(dropOffDateField, msg.dropOffDate),
        new publishing.validation.DateRange(pickUpDateField, dropOffDateField, msg.bookingDateRange, true),
        new publishing.validation.DatePriorToAllowedDate(pickUpDateField, opts.minPurchaseDate, msg.pickUpPriorToCurrentDate),
        new publishing.validation.DatePriorToAllowedDate(dropOffDateField, opts.minPurchaseDate, msg.dropOffPriorToCurrentDate),
        new publishing.validation.PickUpHrsBeforeDropOffHrs(pickUpDateField, dropOffDateField , pickUpTimeField,dropOffTimeField,msg.Time2HrDiffMessage)
    ];

    var errorRenderer = new publishing.validation.ErrorRenderer(form, form.find('ul.errors'));
    var validator = new publishing.validation.Validator(validationRules, errorRenderer);
    form.initLobForm(opts, validator, function() {
        additionalOptionsContainer.populateChosenSpecialEquipment();
        if (defaultDropOffLocation == dropOffLocationField.val()) {
            dropOffLocationField.val("");
        }
    });

    function searchTypeChanged() {
        var currentSearchType = $(this).val();
        var searchNearAirport = currentSearchType == 'AIRPORT';
        var searchNearAPlace = currentSearchType == 'PLACE';
        var searchUsAddress = currentSearchType == 'USADDRESS';

        streetField.parents('fieldset').toggle(searchUsAddress);
        cityField.parents('fieldset').toggle(searchUsAddress);
        stateField.parents('fieldset').toggle(searchUsAddress);
        zipField.parents('fieldset').toggle(searchUsAddress);
        pickUpLocationField.parents('fieldset').toggle(!searchUsAddress);
        findCarsWithinField.parents('fieldset').toggle(searchNearAPlace);
        dropOffLocationField.parents('fieldset').toggle(searchNearAirport);
        diffDropLocField.val(searchNearAirport ? '1' : '0');
    }

    function pickUpChanged(pickupSelectedItem)
    {
        //By default all searches should be place searches unless an airport is selected from ESS
        $('#C-SearchType').val('PLACE');

        if (pickupSelectedItem.type == null || pickupSelectedItem.type != "AIRPORT")
        {
            //if a non-airport is selected then hide the drop off box
            if ($('#C-dropOffLocation') != null)
            {
                $('#C-dropOffLocation').val(opts.sameAsPickup);
            }
            if ($('#C-dropOffLocation-label') != null)
            {
                $('#C-dropOffLocation-label').hide();
            }
            if ($('#showHideDropOff') != null)
            {
                $('#showHideDropOff').hide();
            }
            if ($('.showHideDropOffText') != null)
            {
                $('.showHideDropOffText').hide();
            }
        }
        else
        {
            //if an airport is selected then show the drop off box
            $('#C-SearchType').val('AIRPORT');
            if ($('#C-dropOffLocation-label') != null)
            {
                $('#C-dropOffLocation-label').show();
            }
            if ($('#showHideDropOff') != null)
            {
                $('#showHideDropOff').show();
            }
            if ($('.showHideDropOffText') != null)
            {
                $('.showHideDropOffText').show();
            }
        }
    }

    function hideCarFormFieldsForSingleSearch()
    {
        var locationSelection = document.getElementById('C-SearchType');
        var locationLabel = document.getElementById('C-SearchType-label');
        var radiusSelection = document.getElementById('C-Distance');
        var radiusLabel = document.getElementById('C-Distance-label');

        //hide the search near dropdown and label
        if (locationSelection != null)
        {
            locationSelection.style.display = 'none';
        }
        if (locationLabel != null)
        {
            locationLabel.style.display = 'none';
        }

        //hide the radius dropdown and label
        if (radiusSelection != null)
        {
            radiusSelection.style.display = 'none';
        }
        if (radiusLabel != null)
        {
            radiusLabel.style.display = 'none';
        }

        //set pickup/dropoff location to nothing until we can fix the issue that search defaults to place.
        $('#C-destination').val('');
        $('#C-dropOffLocation').val(opts.sameAsPickup);
    }

    if(taConfig){taConfig.itemClickedEvent = publishing.wizard.preserveTA;}

    searchTypeField.bindAndTrigger(searchTypeChanged);

    if (publishing.wizard.TYPEAHEAD_ENABLED && opts.taConfigO != undefined && opts.taConfigD != undefined)
    {
        publishing.wizard.typeahead(form.field("destination"), opts.taConfigO, pickUpChanged);
        publishing.wizard.typeahead(form.field("dropOffLocation"), opts.taConfigD);
        hideCarFormFieldsForSingleSearch();
    }
};

publishing.wizard.lobforms.carOnly.AdditionalOptions = function(form) {
    var additionalOptionsContainer = form.find('#carOnly-additionalOptions');
    var showAdditionalOptionsField = form.find('a[name=carOnly-showAdditionalOptions]');
    var hideAdditionalOptionsField = form.find('a[name=carOnly-hideAdditionalOptions]');
    var specialEquipmentField = form.find('input[name=Equipment]');
    var availabilityAndCostInfoLinkField = form.find('.availabilityAndCostInfoLink');
    var availabilityAndCostInfoContainer = form.find('.availabilityAndCostInfoContent');

    this.populateChosenSpecialEquipment = function() {
        var selectedEquipment = additionalOptionsContainer.find('input[type=checkbox]').filter(':checked');
        var map = $.map(selectedEquipment, function(element, index) {
            return element.value;
        });
        specialEquipmentField.val(map.join(''));
    };

    publishing.wizard.lobforms.additionalOptions({
        showAdditionalOptionsField : showAdditionalOptionsField,
        additionalOptionsContainer: additionalOptionsContainer,
        hideAdditionalOptionsField:hideAdditionalOptionsField,
        infoLinkField : availabilityAndCostInfoLinkField,
        infoContainer : availabilityAndCostInfoContainer
    });
};
;
// End of file ../content/static_content/default/default/scripts/wizard/carOnly.js

// Start of file ../content/static_content/default/default/scripts/wizard/flightAndCar.js
;

expNamespace("publishing.wizard.lobforms");

publishing.wizard.lobforms.flightAndCar = function(opts) {
    var form = $(publishing.WIZARD_CONTAINER_ID + " form.flightAndCar");
    var msg = opts.errorMessages;
    var departureCityField = form.field("origin");
    var destinationCityField = form.field("destination");
    var departureDateField = form.field("fromDate");
    var returnDateField = form.field("toDate");
    var numberOfChildrenField = form.field("numChildren");

    var flightTravellerDetailSection = form.find(".section-flight-age-group");
    var childrenAgesFields = flightTravellerDetailSection.field("childrenAge");
    var numberOfTravellers = flightTravellerDetailSection.find(".number-of-travellers");
    var infantPreferencesContainer = form.find(".section-infants-pref");
    var adultFields = form.find("[data-canonic='numAdults']");
    var seniorFields = form.find("[data-canonic='numSeniors']");
    var childrenFields = form.find("[data-canonic='numChildren']");
    var taConfig = opts.taConfig;
    var addFlight = form.find('input[name=addFlightPackage]');
    var addHotel = form.find('input[name=addHotelPackage]');
    var addCar = form.find('input[name=addCarPackage]');

    publishing.wizard.setUpPackageCheckboxes(addFlight, addHotel, addCar);

    var validationRules = [
        new publishing.validation.NotEmpty(departureCityField, msg.departureCity),
        new publishing.validation.NotEmpty(destinationCityField, msg.destinationCity),
        new publishing.validation.CityBetween(departureCityField, destinationCityField, msg.sameCity),
        new publishing.validation.MandatoryDate(departureDateField, msg.departureDate),
        new publishing.validation.MandatoryDate(returnDateField, msg.returnDate),
        new publishing.validation.DateRange(departureDateField, returnDateField, msg.bookingDateRange, true),
        new publishing.validation.DatePriorToAllowedDate(departureDateField, opts.minPurchaseDate, msg.departurePriorToCurrentDate),
        new publishing.validation.DatePriorToAllowedDate(returnDateField, opts.minPurchaseDate, msg.returnPriorToCurrentDate),
        new publishing.validation.ChildrenMustNotBeAlone(adultFields, seniorFields, childrenFields, msg.childrenMustNotBeAlone),
        new publishing.validation.TotalBetween(1, 6, numberOfTravellers, msg.totalNumberOfTravellers)
    ];

    var errorRenderer = new publishing.validation.ErrorRenderer(form, form.find("ul.errors"));
    var validator = new publishing.validation.Validator(validationRules, errorRenderer);
    form.initLobForm(opts, validator);
    publishing.wizard.initRoom(flightTravellerDetailSection, validationRules, opts.errorMessages);
    childrenAgesFields.add(numberOfChildrenField).bindAndTrigger(publishing.wizard.common.flight.accompaniedInfantListener(childrenAgesFields, infantPreferencesContainer));



    if(taConfig){
        taConfig.itemClickedEvent = function(typeahead) {
            if(typeahead && typeahead.On)
            {
                var selItem = typeahead.selectedItem;
                if (selItem && selItem.data && selItem.id == "FC-destination")
                {
                    publishing.wizard.packageLobData.TLA = selItem.data.a;
                    publishing.wizard.packageLobData.MultiCity = selItem.data.amc;
                }
            }
            publishing.wizard.preserveTA(typeahead);
        };
    }

    publishing.wizard.setupPackageRadioButtons(form);

};

;
// End of file ../content/static_content/default/default/scripts/wizard/flightAndCar.js

// Start of file ../content/static_content/default/default/scripts/wizard/flightHotelAndCar.js
;

expNamespace("publishing.wizard.lobforms");
expNamespace("publishing.wizard.lobforms.common");

publishing.wizard.lobforms.flightHotelAndCar = function(opts) {
    var form = $(publishing.WIZARD_CONTAINER_ID + " form.flightHotelAndCar");
    publishing.wizard.lobforms.common.flightHotelAndCar(form, opts);
};

publishing.wizard.lobforms.flightAndHotel = function(opts) {
    var form = $(publishing.WIZARD_CONTAINER_ID + " form.flightAndHotel");
    publishing.wizard.lobforms.common.flightHotelAndCar(form, opts);
};

publishing.wizard.lobforms.trainAndHotel = function(opts) {
    var form = $(publishing.WIZARD_CONTAINER_ID + " form.trainAndHotel");
    publishing.wizard.lobforms.common.flightHotelAndCar(form, opts);
};

publishing.wizard.lobforms.common.flightHotelAndCar = function(form, opts) {
    var msg = opts.errorMessages;
    var diableCkiPopout = opts.diableCkiPopout || false;
    var taConfigO = opts.taConfigO;
    var taConfigD = opts.taConfigD;
    var departureCityField = form.field("origin");
    var destinationCityField = form.field("destination");
    var destRegion = form.field("dest-region");
    var destCity = form.field("dest-city");
    var departureDateField = form.field("fromDate");
    var returnDateField = form.field("toDate");
    var partialHotelBooking = form.field("partialHotelBooking");
    var flexibleFromDate = form.field("flexibleFromDate");
    var flexibleToDate = form.field("flexibleToDate");

    var rooms = form.find(".rooms .room");
    var numberOfRoomsField = form.field("numRooms");

    var numberOfTravellers = rooms.find(".number-of-travellers");
    var numberOfChildrenField = rooms.field("numChildren");
    var childrenAgesFields = form.find(".section-children-ages select");
    var infantPreferencesContainer = form.find(".section-infants-pref");
    var partialHotelBookingDateSection = form.find(".section-partial-hotel-booking-date");

    var addFlight = form.find('input[name=addFlightPackage]');
    var addHotel = form.find('input[name=addHotelPackage]');
    var addCar = form.find('input[name=addCarPackage]');


    publishing.wizard.setUpPackageCheckboxes(addFlight, addHotel, addCar);


    publishing.wizard.lobforms.common.flightHotelAndCar_ValidationRules = [
        new publishing.validation.NotEmpty(departureCityField, msg.departureCity),
        new publishing.validation.NotEmpty(destinationCityField, msg.destinationCity),
        new publishing.validation.CityBetween(departureCityField, destinationCityField, msg.sameCity),
        new publishing.validation.NotSelect(destRegion, msg.destinationCity),
        new publishing.validation.NotSelectCity(destRegion, destCity, msg.destinationCity),
        new publishing.validation.OptionalDate(departureDateField, msg.departureDate),
        new publishing.validation.OptionalDate(returnDateField, msg.returnDate),
        new publishing.validation.MandatoryDate(flexibleFromDate, msg.flexibleFromDate),
        new publishing.validation.MandatoryDate(flexibleToDate, msg.flexibleToDate),
        new publishing.validation.DateRange(departureDateField, returnDateField, msg.bookingDateRange),
        new publishing.validation.DateRange(flexibleFromDate, flexibleToDate, msg.bookingDateRange),
        new publishing.validation.DatePriorToAllowedDate(departureDateField, opts.minPurchaseDate, msg.departurePriorToCurrentDate),
        new publishing.validation.DatePriorToAllowedDate(returnDateField, opts.minPurchaseDate, msg.returnPriorToCurrentDate),
        new publishing.validation.DateBetween(flexibleFromDate, departureDateField, returnDateField, msg.partialBookingDateSequenceMessage),
        new publishing.validation.DateBetween(flexibleToDate, departureDateField, returnDateField, msg.partialBookingDateSequenceMessage),
        new publishing.validation.TotalBetween(1, 6, numberOfTravellers, msg.totalNumberOfTravellers),
        new publishing.validation.DatesNotToManyDaysAppart(departureDateField, returnDateField, opts.maxDateRange, msg.checkInAndOutDatesTooFarApart),
        new publishing.validation.DatePastMaxPurchaseDate(opts.maxPurchaseDate, departureDateField, msg.datePastMaxDate),
        new publishing.validation.DatePastMaxPurchaseDate(opts.maxPurchaseDate, returnDateField, msg.datePastMaxDate)
    ];

    publishing.wizard.setupPackageRadioButtons(form);

    publishing.wizard.setUpAddRoomLinks(form);

    function prepareBiasedHotelInputsForFormSubmission() {
        if (!publishing.wizard.BIASED_FOR_HOTELS_PER_CITY) return;
        var chosenCityId = form.field('destination').val();
        var hotelsForCity = $.grep(publishing.wizard.hotelsForCities, function(city, i) {
            return city.cityId == chosenCityId;
        })[0];
        form.append($('<input type="hidden" name="HotelIDs" value="' + hotelsForCity.hotelIds.join() + '" />'));
    }

    var errorRenderer = new publishing.validation.ErrorRenderer(form, form.find("ul.errors"));
    var validator = new publishing.validation.Validator(publishing.wizard.lobforms.common.flightHotelAndCar_ValidationRules, errorRenderer);


    publishing.wizard.lobforms.flightHotel_DatesChanged = function(){
            form.triggerDatePicker(returnDateField, true);
    };

    //opts.startDateCalCallback =  publishing.wizard.lobforms.flightHotel_DatesChanged;

    form.initLobForm(opts, validator, prepareBiasedHotelInputsForFormSubmission);
    publishing.wizard.initRooms(form, rooms, publishing.wizard.lobforms.common.flightHotelAndCar_ValidationRules, msg, opts);
    childrenAgesFields.add(numberOfChildrenField).bindAndTrigger(publishing.wizard.common.flight.accompaniedInfantListener(childrenAgesFields, infantPreferencesContainer));
    partialHotelBooking.toggleSection(partialHotelBookingDateSection);

    if(taConfigO){taConfigO.itemClickedEvent = publishing.wizard.preserveTA;}
    if(taConfigD){taConfigD.itemClickedEvent = publishing.wizard.preserveTA;}

    function FlightAndHotelTypeaheadSelected(suggestion) {
        if(diableCkiPopout == false)
            form.triggerDatePicker(departureDateField,false);
    }

    if (publishing.wizard.TYPEAHEAD_ENABLED) {
        if (publishing.wizard.FLIGHT_AND_HOTEL_DESTINATION_IS_VISIBLE) {
            publishing.wizard.typeahead(form.field("origin"), taConfigO);
            publishing.wizard.typeahead(form.field("destination"), taConfigD, FlightAndHotelTypeaheadSelected);
        } else {
            publishing.wizard.typeahead(form.field("origin"), taConfigO, FlightAndHotelTypeaheadSelected);
            publishing.wizard.typeahead(form.field("destination"), taConfigD);
        }
    }

    publishing.wizard.fillCheckInDateAuto(partialHotelBooking, opts);

};

;
// End of file ../content/static_content/default/default/scripts/wizard/flightHotelAndCar.js

// Start of file ../content/static_content/default/default/scripts/wizard/flightOnly.js
expNamespace("publishing.wizard.lobforms");
expNamespace("publishing.wizard.lobforms.flightOnly");
expNamespace("publishing.wizard.lobforms.flightOnly.jp");

publishing.wizard.lobforms.flightOnly.jp.validationRules = function(container, opts) {
    var msg = opts.errorMessages;
    var multipleDestinationDepartureCityField = container.find('.multipleDestinations').find("[dataField='origin']");
    var multipleDestinationDestinationCityField = container.find('.multipleDestinations').find("[dataField='destination']");
    var multipleDestinationsDepartureDateField = container.find('.multipleDestinations').field("fromDate");
    if(multipleDestinationsDepartureDateField.length == 0)
    {
        multipleDestinationsDepartureDateField = container.find('.multipleDestinations').field("date1");
    }
    var onewayOrReturnDepartureCityField = container.find('.oneWayOrReturn').find("[dataField='origin']");
    var onewayOrReturnDestinationCityField = container.find('.oneWayOrReturn').find("[dataField='destination']");
    var onewayOrReturnDepartureDateField = container.find('.oneWayOrReturn').field("fromDate");

    var returnDateField = container.field("toDate");

    var flightTravellerDetailSection = container.find(".section-flight-age-group");
    var numberOfTravellers = flightTravellerDetailSection.find(".number-of-travellers");
    var adultFields = flightTravellerDetailSection.find("[data-canonic='numAdults']");
    var seniorFields = flightTravellerDetailSection.find("[data-canonic='numSeniors']");
    var childrenFields = flightTravellerDetailSection.find("[data-canonic='numChildren']");

    var deptRegion = container.find('.oneWayOrReturn').find("[dataField='deptRegion']");
    var destRegion = container.find('.oneWayOrReturn').find("[dataField='destRegion']");
    var stopOverRegion = container.find('.oneWayOrReturn').find("[dataField='stopOverRegion']");
    var deptDestination = container.find('.oneWayOrReturn').find("[dataField='deptDestination']");
    var destDestination = container.find('.oneWayOrReturn').find("[dataField='destDestination']");
    var stopOverDestination = container.find('.oneWayOrReturn').find("[dataField='stopOverDestination']");
    var multipleDestinationsRegionFields = container.find('.multipleDestinations').find("select[dataField='region']");
    var multipleDestinationsCityFields = container.find('.multipleDestinations').find("select[dataField='destination']");
    var stopOverSearchFields = container.find('.stopOverField').find("[dataField='stopOverSearchField']");
    var stopOverFromDateFields = container.find('.stopOverField').field("stopOverFromDate");
    var stopOverToDateFields = container.find('.stopOverField').field("stopOverToDate");

    return [
        new publishing.validation.NotSelect(deptRegion, msg.selectError),
        new publishing.validation.NotSelect(destRegion, msg.selectError),
        new publishing.validation.NotSelect(stopOverRegion, msg.selectError),
        new publishing.validation.NotSelectCity(deptRegion, deptDestination, msg.selectError),
        new publishing.validation.NotSelectCity(destRegion, destDestination, msg.selectError),
        new publishing.validation.NotSelectCity(stopOverRegion, stopOverDestination, msg.selectError),
        new publishing.validation.NotEmpty(stopOverSearchFields, msg.keyWordError),
        new publishing.validation.MandatoryDate(stopOverToDateFields, msg.returnDate),
        new publishing.validation.DateRange(returnDateField, stopOverToDateFields, msg.bookingDateRange, true),
        new publishing.validation.DatePriorToAllowedDate(stopOverToDateFields, opts.minPurchaseDate, msg.returnPriorToCurrentDate),
        new publishing.validation.DatePastMaxPurchaseDate(opts.maxPurchaseDate, stopOverToDateFields, msg.datePastMaxDate),
        new publishing.validation.MandatoryDate(stopOverFromDateFields, msg.departureDate),
        new publishing.validation.DateRange(stopOverFromDateFields, returnDateField, msg.bookingDateRange, true),
        new publishing.validation.DatePriorToAllowedDate(stopOverFromDateFields, opts.minPurchaseDate, msg.departurePriorToCurrentDate),
        new publishing.validation.DatePastMaxPurchaseDate(opts.maxPurchaseDate, stopOverFromDateFields, msg.datePastMaxDate),
        new publishing.validation.DateRange(onewayOrReturnDepartureDateField, stopOverFromDateFields, msg.priorToDeptDate),
        new publishing.validation.NotSelect(multipleDestinationsRegionFields, msg.selectError),
        new publishing.validation.NotSelect(multipleDestinationsCityFields, msg.selectError),// JP dropdown & stopOver validation
        new publishing.validation.NotEmpty(multipleDestinationDepartureCityField, msg.departureCity),
        new publishing.validation.NotEmpty(multipleDestinationDestinationCityField, msg.destinationCity),
        new publishing.validation.CityBetween(multipleDestinationDepartureCityField, multipleDestinationDestinationCityField, msg.sameCity ),
        new publishing.validation.MandatoryDate(multipleDestinationsDepartureDateField, msg.departureDate),
        new publishing.validation.DatePriorToAllowedDate(multipleDestinationsDepartureDateField, opts.minPurchaseDate, msg.departurePriorToCurrentDate),
        new publishing.validation.NotEmpty(onewayOrReturnDepartureCityField, msg.departureCity),
        new publishing.validation.NotEmpty(onewayOrReturnDestinationCityField, msg.destinationCity),
        new publishing.validation.CityBetween(onewayOrReturnDepartureCityField, onewayOrReturnDestinationCityField, msg.sameCity ),
        new publishing.validation.MandatoryDate(onewayOrReturnDepartureDateField, msg.departureDate),
        new publishing.validation.MandatoryDate(returnDateField, msg.returnDate),
        new publishing.validation.DateRange(onewayOrReturnDepartureDateField, returnDateField, msg.bookingDateRange, true),
        new publishing.validation.DatePriorToAllowedDate(onewayOrReturnDepartureDateField, opts.minPurchaseDate, msg.departurePriorToCurrentDate),
        new publishing.validation.DatePriorToAllowedDate(returnDateField, opts.minPurchaseDate, msg.returnPriorToCurrentDate),
        new publishing.validation.TotalBetween(1, opts.maximumNumberOfTravellersAllowed, numberOfTravellers, msg.totalNumberOfTravellers),
        new publishing.validation.DatePastMaxPurchaseDate(opts.maxPurchaseDate, onewayOrReturnDepartureDateField, msg.datePastMaxDate),
        new publishing.validation.DatePastMaxPurchaseDate(opts.maxPurchaseDate, returnDateField, msg.datePastMaxDate),
        new publishing.validation.ChildrenMustNotBeAlone(adultFields, seniorFields, childrenFields, msg.childrenMustNotBeAlone)
    ];
};

publishing.validation.MultiDestLegNotEmpty = function(fieldToCheck, from, to, message) {
    function isValid() {
        return !fieldToCheck.blank();
    }

    function anyFieldIsHidden() {
        var anyHidden = false;
        $.each(fieldToCheck, function() {
            anyHidden = anyHidden || $(this).is(":hidden");
        });
        return anyHidden;
    }

    this.apply = function() {

        var multiDestLegNotPresent = ((from.length==0 || from.val() == "City or airport" || from.val() == "" || from.val() == undefined) && (to.length==0 || to.val() == "City or airport" || to.val() == "" || to.val() == undefined));
        if (multiDestLegNotPresent) return new publishing.validation.Result(true);

        if (anyFieldIsHidden() || isValid()) {
            return new publishing.validation.Result(true);
        } else {
            var error = new publishing.validation.Error(fieldToCheck, message);
            return new publishing.validation.Result(false, error);
        }
    }

    return this;
};

publishing.validation.MultiDestLegMandatoryDate = function(field, message, from, to) {
    function exists() {
        return field.val() != "" && field.val() != publishing.DATE_FORMAT;
    }

    function isValid() {
        return publishing.util.parseDate(field.val()) != null;
    }

    function anyFieldIsHidden() {
        var anyHidden = false;
        $.each(field, function() {
            anyHidden = anyHidden || $(this).is(":hidden");
        });
        return anyHidden;
    }

    this.apply = function() {

        var multiDestLegNotPresent = ((from.val() == "City or airport" || from.val() == "" || from.val() == undefined) && (to.val() == "City or airport" || to.val() == "" || to.val() == undefined));
        if (multiDestLegNotPresent) return new publishing.validation.Result(true);

        if (anyFieldIsHidden()) {
            return new publishing.validation.Result(true);
        } else if (!exists()) {
            return new publishing.validation.Result(false, new publishing.validation.Error(field, message.mandatory));
        } else if (!isValid()) {
            return new publishing.validation.Result(false, new publishing.validation.Error(field, message.dateFormat));
        } else {
            return new publishing.validation.Result(true);
        }
    };

    return this;
};

publishing.wizard.lobforms.flightOnly.validationRules = function(container, opts) {
    var msg = opts.errorMessages;
    var multipleDestinationDepartureCityField = container.find('.multipleDestinations').field("origin");
    var multipleDestinationDestinationCityField = container.find('.multipleDestinations').field("destination");
    var multipleDestinationsDepartureDateField = container.find('.multipleDestinations').field("fromDate");
    if(multipleDestinationsDepartureDateField.length == 0)
    {
        multipleDestinationsDepartureDateField = container.find('.multipleDestinations').field("date1");
    }
    var onewayOrReturnDepartureCityField = container.find('.oneWayOrReturn').field("origin");
    var onewayOrReturnDestinationCityField = container.find('.oneWayOrReturn').field("destination");
    var onewayOrReturnDepartureDateField = container.find('.oneWayOrReturn').field("fromDate");

    var returnDateField = container.field("toDate");

    var flightTravellerDetailSection = container.find(".section-flight-age-group");
    var numberOfTravellers = flightTravellerDetailSection.find(".number-of-travellers");
    var adultFields = flightTravellerDetailSection.find("[data-canonic='numAdults']");
    var seniorFields = flightTravellerDetailSection.find("[data-canonic='numSeniors']");
    var childrenFields = flightTravellerDetailSection.find("[data-canonic='numChildren']");

    var validationRules = [
         new publishing.validation.NotEmpty(multipleDestinationDepartureCityField, msg.departureCity),
         new publishing.validation.NotEmpty(multipleDestinationDestinationCityField, msg.destinationCity),
         new publishing.validation.CityBetween(multipleDestinationDepartureCityField, multipleDestinationDestinationCityField, msg.sameCity ),
         new publishing.validation.MandatoryDate(multipleDestinationsDepartureDateField, msg.departureDate),
         new publishing.validation.DatePriorToAllowedDate(multipleDestinationsDepartureDateField, opts.minPurchaseDate, msg.departurePriorToCurrentDate),
         new publishing.validation.NotEmpty(onewayOrReturnDepartureCityField, msg.departureCity),
         new publishing.validation.NotEmpty(onewayOrReturnDestinationCityField, msg.destinationCity),
         new publishing.validation.CityBetween(onewayOrReturnDepartureCityField, onewayOrReturnDestinationCityField, msg.sameCity ),
         new publishing.validation.MandatoryDate(onewayOrReturnDepartureDateField, msg.departureDate),
         new publishing.validation.MandatoryDate(returnDateField, msg.returnDate),
         new publishing.validation.DateRange(onewayOrReturnDepartureDateField, returnDateField, msg.bookingDateRange, true),
         new publishing.validation.DatePriorToAllowedDate(onewayOrReturnDepartureDateField, opts.minPurchaseDate, msg.departurePriorToCurrentDate),
         new publishing.validation.DatePriorToAllowedDate(returnDateField, opts.minPurchaseDate, msg.returnPriorToCurrentDate),
         new publishing.validation.TotalBetween(1, opts.maximumNumberOfTravellersAllowed, numberOfTravellers, msg.totalNumberOfTravellers),
         new publishing.validation.DatePastMaxPurchaseDate(opts.maxPurchaseDate, onewayOrReturnDepartureDateField, msg.datePastMaxDate),
         new publishing.validation.DatePastMaxPurchaseDate(opts.maxPurchaseDate, returnDateField, msg.datePastMaxDate),
         new publishing.validation.ChildrenMustNotBeAlone(adultFields, seniorFields, childrenFields, msg.childrenMustNotBeAlone)
     ];

    var i = 2;
    while (i <= $(".multipleDestinations .section").length){
           var multiDestLegInputs = container.find(".multipleDestinations .section:nth-child("+i+")");
           var from = multiDestLegInputs.field("fromAirport"+i);
           var to   = multiDestLegInputs.field("toAirport"+i);
           var date = multiDestLegInputs.field("date"+i);

        validationRules.push(
           new publishing.validation.MultiDestLegNotEmpty(from, from, to, msg.departureCity),
           new publishing.validation.MultiDestLegNotEmpty(to, from, to, msg.destinationCity),
           new publishing.validation.CityBetween(from, to, msg.sameCity ),
           new publishing.validation.MultiDestLegMandatoryDate(date, msg.departureDate, from, to),
           new publishing.validation.DatePriorToAllowedDate(date, opts.minPurchaseDate, msg.departurePriorToCurrentDate)
        );

        i++;
    }

    return validationRules;
};

publishing.wizard.lobforms.flightOnly.addChangeListener = function(index){
    var inputDepartureLocationId = 'F-fromAirport'+index+"-"+index,
        hiddenDepartureCodeId = 'hidden-tla-F-fromAirport'+index+"-"+index,
        inputArrivalLocationId = 'F-toAirport'+index+"-"+index,
        hiddenArrivalCodeId = 'hidden-tla-F-toAirport'+index+"-"+index;

    jQuery('#'+hiddenDepartureCodeId).attr('value', urlHandler.parseAirportCode(jQuery('#'+inputDepartureLocationId).attr('value'),true));
    jQuery('#'+inputDepartureLocationId).bind('change', function(){
        jQuery('#'+hiddenDepartureCodeId).attr('value', '');
    });

    jQuery('#'+hiddenArrivalCodeId).attr('value', urlHandler.parseAirportCode(jQuery('#'+inputArrivalLocationId).attr('value'),true));
    jQuery('#'+inputArrivalLocationId).bind('change', function(){
        jQuery('#'+hiddenArrivalCodeId).attr('value', '');
    });
}

// callbacks for Typeahead on Rechrome
function publishingWizardPackageTypeAheadOriginCallback(clickedItem) {
    publishingWizardCommonTypeAheadCallback(clickedItem, "FH-origin");
}
function publishingWizardPackageTypeAheadDestinationCallback(clickedItem) {
    publishingWizardCommonTypeAheadCallback(clickedItem, "FH-destination");
}
function publishingWizardFlightOnlyTypeAheadOriginCallback(clickedItem) {
    publishingWizardCommonTypeAheadCallback(clickedItem, "F-origin");
}
function publishingWizardFlightOnlyTypeAheadDestinationCallback(clickedItem) {
    var data = JSON.parse(clickedItem.attr('data-data'));
    if (data)
    {
        publishing.wizard.packageLobData.TLA = data.a;
        publishing.wizard.packageLobData.MultiCity = data.amc;
    }
    publishingWizardCommonTypeAheadCallback(clickedItem, "F-destination");
}
function publishingWizardHotelOnlyTypeAheadDestinationCallback(clickedItem) {
    publishingWizardCommonTypeAheadCallback(clickedItem, "H-destination");
}
function publishingWizardCommonTypeAheadCallback (clickedItem, id) {
    publishing.wizard.TLA = publishing.wizard.TLA || {};
    publishing.wizard.TLA[id] = clickedItem.data('data').a;
    clickedItem.inputId = id;
    publishing.wizard.preserveTA(clickedItem);
}

publishing.wizard.lobforms.flightOnly.init = function(form, opts, validationRules, onSuccessHandler) {
    var additionalOptionsContainer = form.find('#flightOnly-additionalOptions');
    var showAdditionalOptionsField = form.find('a[name=flightOnly-showAdditionalOptions]');
    var hideAdditionalOptionsField = form.find('a[name=flightOnly-hideAdditionalOptions]');
    var moreInfoLinkField = form.find('.moreInfoLink');
    var moreInfoContainer = form.find('.moreInfoContent');
    var taConfig = opts.taConfig;
    var diableCkiPopout = opts.diableCkiPopout || false;
    var tripTypeRadios = form.find("input[name=TripType]");
    var flightPassengers = form.find("#flightPassengers");
    var multiFlightPassengers = form.find("#multiFlightPassengers");
    var roundTripRadio = form.find("[name=TripType][value=RoundTrip]");
    var multipleDestinationsRadio = form.find("[name=TripType][value=Multicity]");
    var returnTripDetailsContainer = form.find(".section-returning-time-details");
    var goingContainer = form.find(".section-going-details");
    var oneWayOrReturnDetailsContainer = form.find(".oneWayOrReturn");
    var multipleDestinationsDetailsContainer = form.find(".multipleDestinations");
    var infantPreferencesContainer = form.find(".section-infants-pref");
    var numberOfChildrenField = form.field("numChildren");
    var lobCheckBoxesContainer = form.find(".LOBCheckBoxes");

    var multipleDestinationsDates = form.find('.multipleDestinations .datetime');
    var flightTravellerDetailSection = form.find(".section-flight-age-group");
    var childrenAgesFields = flightTravellerDetailSection.field("childrenAge");

    var errorRenderer = new publishing.validation.ErrorRenderer(form, form.find("ul.errors"));
    var validator = new publishing.validation.Validator(validationRules, errorRenderer);

    var addHotel = form.find('input[name=addHotelPackage]');
    var addCar = form.find('input[name=addCarPackage]');


    if (addHotel && addCar) {
        addHotel.click(function(){publishing.wizard.addPackageToFlight(addCar, addHotel, this)});
        addCar.click(function(){publishing.wizard.addPackageToFlight(addCar, addHotel, this)});
    }


    if(taConfig){
        taConfig.itemClickedEvent = function(typeahead) {
            if(typeahead && typeahead.On)
            {
                var selItem = typeahead.selectedItem;
                if (selItem && selItem.data && typeahead.inputId == "F-destination")
                {
                    publishing.wizard.packageLobData.TLA = selItem.data.a;
                    publishing.wizard.packageLobData.MultiCity = selItem.data.amc;
                }
            }
            publishing.wizard.preserveTA(typeahead);
            tlaSelector.selectedTypeAhead(typeahead.inputId, 'hidden-tla-'+typeahead.inputId, typeahead);
        };
    }

    function flightOnlyTypeaheadSelected(suggestion) {

        if(multipleDestinationsRadio.is(":checked")){
            var multipleDestinationsDepartureDateField = form.find("div.internationalFlightFieldsContainer").find('.multipleDestinations').field("fromDate");
            if(diableCkiPopout == false)
                 form.triggerDatePicker(multipleDestinationsDepartureDateField,false);
        }else{
            var onewayOrReturnDepartureDateField = form.find("div.internationalFlightFieldsContainer").find('.oneWayOrReturn').field("fromDate");
            if(diableCkiPopout == false)
                form.triggerDatePicker(onewayOrReturnDepartureDateField,false);
        }
    }

    publishing.wizard.lobforms.flightOnly_DatesChanged = function(){
        if(roundTripRadio.is(":checked") ){
            var returnDateField = form.find("div.internationalFlightFieldsContainer").find('.oneWayOrReturn').field("toDate");
            form.triggerDatePicker(returnDateField, true);
        }
    };

    //opts.startDateCalCallback =  publishing.wizard.lobforms.flightOnly_DatesChanged;

    form.initLobForm(opts, validator, onSuccessHandler);
    publishing.wizard.initRoom(flightTravellerDetailSection, validationRules, opts.errorMessages);

    publishing.wizard.lobforms.additionalOptions({
        showAdditionalOptionsField : showAdditionalOptionsField,
        additionalOptionsContainer: additionalOptionsContainer,
        hideAdditionalOptionsField:hideAdditionalOptionsField,
        infoLinkField: moreInfoLinkField,
        infoContainer:moreInfoContainer
    });

    function preserveValueForTripTypes() {
        var previousForm = null;

        // option 1 - Date and Time of Day
        var switchBetweenOneWayAndRoundTrip = function() {
            var isMultipleDestinations = multipleDestinationsRadio.is(":checked");

            multipleDestinationsDetailsContainer.toggle(isMultipleDestinations);
            oneWayOrReturnDetailsContainer.toggle(!isMultipleDestinations);
            returnTripDetailsContainer.toggle(roundTripRadio.is(":checked"));

            if (isMultipleDestinations) {
                flightPassengers.addClass( 'hidden' );
                multiFlightPassengers.removeClass( 'hidden' );
                oneWayOrReturnDetailsContainer.before(multipleDestinationsDetailsContainer);
                publishing.util.preserveValues(multipleDestinationsDetailsContainer.find("[data-canonic]"));
            } else if (previousForm != null && previousForm.value == 'Multicity') {
                multipleDestinationsDetailsContainer.before(oneWayOrReturnDetailsContainer);
                publishing.util.preserveValues(oneWayOrReturnDetailsContainer.find("[data-canonic]"));
            }
            if (!isMultipleDestinations) {
                flightPassengers.removeClass( 'hidden' );
                multiFlightPassengers.addClass( 'hidden' );
            }

            errorRenderer.clearAll();
            previousForm = tripTypeRadios.filter(':checked')[0];
        };

        // option 2 - remove Time of Day, Add Hotel Checkbox, and Add Car Checkbox
        var switchBetweenOneWayAndRoundTrip_withoutTime = function() {

            var isMultipleDestinations = multipleDestinationsRadio.is(":checked");

            multipleDestinationsDetailsContainer.toggle(isMultipleDestinations);
            oneWayOrReturnDetailsContainer.toggle(!isMultipleDestinations);

            if(roundTripRadio.is(":checked"))
            {
                goingContainer.removeClass("variable-width");
                goingContainer.addClass("largehalfWidth");
                $("#flightAndHotelSearch").show();
            }
            else
            {
                goingContainer.removeClass("largehalfWidth");
                goingContainer.addClass("variable-width");
                $("#flightAndHotelSearch").hide();
            }

            returnTripDetailsContainer.toggle(roundTripRadio.is(":checked"));
            lobCheckBoxesContainer.toggle(roundTripRadio.is(":checked"));

            if (isMultipleDestinations) {
                flightPassengers.addClass( 'hidden' );
                multiFlightPassengers.removeClass( 'hidden' );
                oneWayOrReturnDetailsContainer.before(multipleDestinationsDetailsContainer);
                publishing.util.preserveValues(multipleDestinationsDetailsContainer.find("[data-canonic]"));
            }
            else if (previousForm != null && previousForm.value == 'Multicity') {
                multipleDestinationsDetailsContainer.before(oneWayOrReturnDetailsContainer);
                publishing.util.preserveValues(oneWayOrReturnDetailsContainer.find("[data-canonic]"));
            }
            if (!isMultipleDestinations) {
                flightPassengers.removeClass( 'hidden' );
                multiFlightPassengers.addClass( 'hidden' );
            }

            errorRenderer.clearAll();
            previousForm = tripTypeRadios.filter(':checked')[0];
        };
        // change to option2. If choose option1, please change back to use switchBetweenOneWayAndRoundTrip as parameter.
        tripTypeRadios.bindAndTrigger(switchBetweenOneWayAndRoundTrip_withoutTime);
    }

    preserveValueForTripTypes();
    childrenAgesFields.add(numberOfChildrenField).bindAndTrigger(publishing.wizard.common.flight.accompaniedInfantListener(childrenAgesFields, infantPreferencesContainer));

    if (publishing.wizard.TYPEAHEAD_ENABLED) {
        publishing.wizard.typeahead(form.field("origin"), taConfig, flightOnlyTypeaheadSelected);
        publishing.wizard.typeahead(form.field("destination"), taConfig);

        //init RT/OW hidden location fields
        jQuery('#hidden-tla-F-origin').attr('value', urlHandler.parseAirportCode(jQuery('#F-origin').attr('value'),true));
        jQuery('#F-origin').bind('change', function(){
            jQuery('#hidden-tla-F-origin').attr('value', '');
        });
        jQuery('#hidden-tla-F-destination').attr('value', urlHandler.parseAirportCode(jQuery('#F-destination').attr('value'),true));
        jQuery('#F-destination').bind('change', function(){
            jQuery('#hidden-tla-F-destination').attr('value', '');
        });

        //init MD hidden location fileds
        jQuery('#hidden-tla-F-origin-1').attr('value', urlHandler.parseAirportCode(jQuery('#F-origin-1').attr('value'),true));
        jQuery('#F-origin-1').bind('change', function(){
            jQuery('#hidden-tla-F-origin-1').attr('value', '');
        });

        jQuery('#hidden-tla-F-destination-1').attr('value', urlHandler.parseAirportCode(jQuery('#F-destination-1').attr('value'),true));
        jQuery('#F-destination-1').bind('change', function(){
            jQuery('#hidden-tla-F-destination-1').attr('value', '');
        });

        var multiDestInputFieldNumber = jQuery("#F-origin-1, input[id^=F-fromAirport]").length;
        for (var i = 2; i <= multiDestInputFieldNumber; i++) {
            publishing.wizard.typeahead(form.field("fromAirport" + i), taConfig);
            publishing.wizard.typeahead(form.field("toAirport" + i), taConfig);
            publishing.wizard.lobforms.flightOnly.addChangeListener(i);
        }
    }
};

publishing.wizard.lobforms.flightOnly.stopOverSearch = function(target) {
    var roundTripRadio = $(target).find('[name=TripType][value=RoundTrip]');
    var oneWayRadio =  $(target).find('[name=TripType][value=OneWay]');

    var stopOverFlightType = $(target).find('.stopOverField').field("stopOverFlightType");//Outbound & Return
    var stopOverDestination = $(target).find('.stopOverField').find("[name=stopOverDestination]");
    var frAirport = $(target).find('.oneWayOrReturn').find('[name=FrAirport]');
    var toAirport = $(target).find('.oneWayOrReturn').find('[name=ToAirport]');
    var frDate = $(target).find('input[name=FromDate]');
    var frTime = $(target).find('select[name=FromTime]');

    if(roundTripRadio != null && roundTripRadio.is(":checked")) {
        var tripType = $(target).find('input[name=TripType]');
        tripType.val("Multicity");
        var toDate = $(target).find('input[name=ToDate]');
        var toTime = $(target).find('select[name=ToTime]');

        if("Outbound"==stopOverFlightType.val()){
            var stopOverFromDateFields = $(target).find('.stopOverField').field("stopOverFromDate");
            var stopOverFromTimeFields = $(target).find('.stopOverField').field("stopOverFromTime");

            $('<input>').attr({type:'hidden', name:'frAirport2', value:stopOverDestination.val()}).appendTo(target);
            $('<input>').attr({type:'hidden', name:'toAirport2', value:toAirport.val()}).appendTo(target);
            $('<input>').attr({type:'hidden', name:'frAirport3', value:toAirport.val()}).appendTo(target);
            $('<input>').attr({type:'hidden', name:'toAirport3', value:frAirport.val()}).appendTo(target);

            $('<input>').attr({type:'hidden', name:'Date2', value:stopOverFromDateFields.val()}).appendTo(target);
            $('<input>').attr({type:'hidden', name:'Time2', value:stopOverFromTimeFields.val()}).appendTo(target);
            $('<input>').attr({type:'hidden', name:'Date3', value:toDate.val()}).appendTo(target);
            $('<input>').attr({type:'hidden', name:'Time3', value:toTime.val()}).appendTo(target);
            updateName(toAirport, "");
            updateName(stopOverDestination, "ToAirport");

            updateName(toDate, "");
            updateName(toTime, "");

        }else {
            var stopOverToDateFields = $(target).find('.stopOverField').field("stopOverToDate");
            var stopOverToTimeFields = $(target).find('.stopOverField').field("stopOverToTime");

            $('<input>').attr({type:'hidden', name:'frAirport2', value:toAirport.val()}).appendTo(target);
            $('<input>').attr({type:'hidden', name:'toAirport2', value:stopOverDestination.val()}).appendTo(target);
            $('<input>').attr({type:'hidden', name:'Date2', value:toDate.val()}).appendTo(target);
            $('<input>').attr({type:'hidden', name:'Time2', value:toTime.val()}).appendTo(target);
            $('<input>').attr({type:'hidden', name:'frAirport3', value:stopOverDestination.val()}).appendTo(target);
            $('<input>').attr({type:'hidden', name:'toAirport3', value:frAirport.val()}).appendTo(target);
            $('<input>').attr({type:'hidden', name:'Date3', value:stopOverToDateFields.val()}).appendTo(target);
            $('<input>').attr({type:'hidden', name:'Time3', value:stopOverToTimeFields.val()}).appendTo(target);

            updateName(toDate, "");
            updateName(toTime, "");
        }
    }else if(oneWayRadio != null && oneWayRadio.is(":checked")) {
        var tripType = $(target).find('input[name=TripType]');
        tripType.val("Multicity");

        var stopOverFromDateFields = $(target).find('.stopOverField').field("stopOverFromDate");
        var stopOverFromTimeFields = $(target).find('.stopOverField').field("stopOverFromTime");

        $('<input>').attr({type:'hidden', name:'frAirport2', value:stopOverDestination.val()}).appendTo(target);
        $('<input>').attr({type:'hidden', name:'toAirport2', value:toAirport.val()}).appendTo(target);

        $('<input>').attr({type:'hidden', name:'Date2', value:stopOverFromDateFields.val()}).appendTo(target);
        $('<input>').attr({type:'hidden', name:'Time2', value:stopOverFromTimeFields.val()}).appendTo(target);
        updateName(toAirport, "");
        updateName(stopOverDestination, "ToAirport");
    }

    function updateName(source, name){
        source.attr('name', name);
    }
}

publishing.wizard.lobforms.flightOnly.jp.allFlights = function(opts) {
    var form = $(publishing.WIZARD_CONTAINER_ID + " form.flightOnly");
    var multipleDestinationDepartureCityField = form.find("div.internationalFlightFieldsContainer").find('.multipleDestinations').field("origin");
    var multipleDestinationDestinationCityField = form.find("div.internationalFlightFieldsContainer").find('.multipleDestinations').field("destination");
    var onewayOrReturnDepartureCityField = form.find("div.internationalFlightFieldsContainer").find('.oneWayOrReturn').field("origin");
    var onewayOrReturnDestinationCityField = form.find("div.internationalFlightFieldsContainer").find('.oneWayOrReturn').field("destination");



    var validationRules = publishing.wizard.lobforms.flightOnly.jp.validationRules(form.find("div.internationalFlightFieldsContainer"), opts);
    publishing.wizard.lobforms.flightOnly.init(form, opts, validationRules);
};

publishing.wizard.lobforms.flightOnly.allFlights = function(opts) {
    var form = $(publishing.WIZARD_CONTAINER_ID + " form.flightOnly");
    var multipleDestinationDepartureCityField = form.find("div.internationalFlightFieldsContainer").find('.multipleDestinations').field("origin");
    var multipleDestinationDestinationCityField = form.find("div.internationalFlightFieldsContainer").find('.multipleDestinations').field("destination");
    var onewayOrReturnDepartureCityField = form.find("div.internationalFlightFieldsContainer").find('.oneWayOrReturn').field("origin");
    var onewayOrReturnDestinationCityField = form.find("div.internationalFlightFieldsContainer").find('.oneWayOrReturn').field("destination");



    var validationRules = publishing.wizard.lobforms.flightOnly.validationRules(form.find("div.internationalFlightFieldsContainer"), opts);
    publishing.wizard.lobforms.flightOnly.init(form, opts, validationRules);
};

// End of file ../content/static_content/default/default/scripts/wizard/flightOnly.js

// Start of file ../content/static_content/default/default/scripts/wizard/hotelAndCar.js
;

expNamespace("publishing.wizard.lobforms");

publishing.wizard.lobforms.hotelAndCar = function(opts) {
    var form = $(publishing.WIZARD_CONTAINER_ID + " form.hotelAndCar");
    var msg = opts.errorMessages;

    var taConfig = opts.taConfig;
    var departureCityField = form.field("destination");
    var departureDateField = form.field("fromDate");
    var returnDateField = form.field("toDate");

    var rooms = form.find(".rooms .room");
    var numberOfTravellers = rooms.find(".number-of-travellers");

    var addFlight = form.find('input[name=addFlightPackage]');
    var addHotel = form.find('input[name=addHotelPackage]');
    var addCar = form.find('input[name=addCarPackage]');

    publishing.wizard.setUpPackageCheckboxes(addFlight, addHotel, addCar);

    if(taConfig){
        taConfig.itemClickedEvent = function(typeahead) {
            if(typeahead && typeahead.On)
            {
                var selItem = typeahead.selectedItem;
                if (selItem && selItem.data && typeahead.inputId == "HC-destination")
                {
                    publishing.wizard.packageLobData.TLA = selItem.data.a;
                    publishing.wizard.packageLobData.MultiCity = selItem.data.amc;
                }
            }
            publishing.wizard.preserveTA(typeahead);
        };
    }

    var validationRules = [
        new publishing.validation.NotEmpty(departureCityField, msg.departureCity),
        new publishing.validation.OptionalDate(departureDateField, msg.departureDate),
        new publishing.validation.OptionalDate(returnDateField, msg.returnDate),
        new publishing.validation.DateRange(departureDateField, returnDateField, msg.bookingDateRange),
        new publishing.validation.DatePriorToAllowedDate(departureDateField, opts.minPurchaseDate, msg.departurePriorToCurrentDate),
        new publishing.validation.DatePriorToAllowedDate(returnDateField, opts.minPurchaseDate, msg.returnPriorToCurrentDate),
        new publishing.validation.TotalBetween(1, 6, numberOfTravellers, msg.totalNumberOfTravellers)
    ];

    var errorRenderer = new publishing.validation.ErrorRenderer(form, form.find("ul.errors"));
    var validator = new publishing.validation.Validator(validationRules, errorRenderer);
    form.initLobForm(opts, validator);
    publishing.wizard.initRooms(form, rooms, validationRules, msg, opts);



    publishing.wizard.setupPackageRadioButtons(form);


    publishing.wizard.setUpAddRoomLinks(form);

};
;
// End of file ../content/static_content/default/default/scripts/wizard/hotelAndCar.js

// Start of file ../content/static_content/default/default/scripts/wizard/hotelOnly.js
expNamespace("publishing.wizard.lobforms");

publishing.wizard.lobforms.hotelOnly = function(opts) {
    var msg = opts.errorMessages;
    var form = $(publishing.WIZARD_CONTAINER_ID + " form.hotelOnly");
    var additionalOptionsContainer = form.find('#hotelOnly-additionalOptions');
    var taConfig = opts.taConfig;
    var rooms = form.find(".rooms .room");
    var cityField = form.field('destination');
    var destRegion = form.field("dest-region");
    var destCity = form.field("dest-city");
    var checkinField = form.field("fromDate");
    var checkoutField = form.field("toDate");
    var showAdditionalOptionsField = form.find('a[name=hotelOnly-showAdditionalOptions]');
    var hideAdditionalOptionsField = form.find('a[name=hotelOnly-hideAdditionalOptions]');
    var searchTypeField = form.find("input[name='SearchType']");
    var searchAreaField = form.find("input[name='SearchArea']");
    var storedCheckinField =  form.find("input[name='storedCheckinField']");
    var storedCheckoutField =  form.find("input[name='storedCheckoutField']");
    var cityIdField = $('<input type="hidden" name="CityId"/>');
    var datelessSearch = opts.datelessSearch != false?true:false;
    var ninePlusRoomsURL = opts.ninePlusRoomsURL;
    var numberOfRoomsField = form.field("numRooms");
    var enableDatelessField;
    if(datelessSearch == false)
        enableDatelessField = form.field('enableDateless');



    var addFlight = form.find('input[name=addFlightPackage]');
    var addCar = form.find('input[name=addCarPackage]');

    publishing.wizard.setUpPackageCheckboxes(addFlight, null, addCar);

    publishing.wizard.lobforms.hotelOnly_ValidationRules = [
        new publishing.validation.NotEmpty(cityField, msg.city),
        new publishing.validation.NotSelect(destRegion, msg.city),
        new publishing.validation.NotSelectCity(destRegion, destCity, msg.city),
        new publishing.validation.ConditionalDate(datelessSearch, enableDatelessField, checkinField, msg.checkinDate),
        new publishing.validation.ConditionalDate(datelessSearch, enableDatelessField, checkoutField, msg.checkoutDate),
        new publishing.validation.DatePriorToAllowedDate(checkinField, opts.minPurchaseDate, msg.checkinPriorToCurrentDate),
        new publishing.validation.DatePriorToAllowedDate(checkoutField, opts.minPurchaseDate, msg.checkoutPriorToCurrentDate),
        new publishing.validation.DateRange(checkinField, checkoutField, msg.bookingDateRange),
        new publishing.validation.DatesNotToManyDaysAppart(checkinField, checkoutField, opts.maxDateRange, msg.checkInAndOutDatesTooFarApart),
        new publishing.validation.DatePastMaxPurchaseDate(opts.maxPurchaseDate, checkinField, msg.datePastMaxDate),
        new publishing.validation.DatePastMaxPurchaseDate(opts.maxPurchaseDate, checkoutField, msg.datePastMaxDate)
    ];


    publishing.wizard.setUpAddRoomLinks(form);

    $("#handle9RoomsLink").click(handleNinePlusRooms);

    function handleNinePlusRooms()
    {
        var url = opts.ninePlusRoomsURL;
        var el = $('#H-destination');
        if(el.val() != el.attr('data-default'))
        {
            url = url + "&City=" + encodeURIComponent(el.val());
        }
        url = url + "&InDate=" + encodeURIComponent(publishing.wizard.formatDateForGroupForm9PlusRoomsService($('#H-fromDate').val())) +
            "&OutDate=" + encodeURIComponent(publishing.wizard.formatDateForGroupForm9PlusRoomsService($('#H-toDate').val()));
        window.location = url;
        return true;
    }

    if(taConfig){
        taConfig.itemClickedEvent = function() {
            var typeahead = TA.getInstance('H-destination');
            if(typeahead && typeahead.On)
            {
                var selItem = typeahead.selectedItem;
                if (selItem && selItem.data && typeahead.inputId == "H-destination")
                {
                    if (selItem.data.t == "HOTEL") {
                        publishing.wizard.packageLobData.HotelId = selItem.data.id;
                    }
                    publishing.wizard.packageLobData.regionId = selItem.data.id;
                    publishing.wizard.packageLobData.TLA = selItem.data.a;
                    publishing.wizard.packageLobData.MultiCity = selItem.data.amc;
                }
            }
            publishing.wizard.preserveTA(typeahead);
        };
    }

    function hotelOnlyTypeaheadSelected(suggestion) {
        if(suggestion != undefined){
            searchAreaField.val(suggestion.type);
            if(suggestion.hotelId != null){
                $("#H-hotelId").val(suggestion.hotelId);
                $("#H-hotelId").attr("timestamp", new Date().getTime());
            }
        }
        form.triggerDatePicker(checkinField, false);
    }


    function prepareBiasedHotelInputsForFormSubmission() {
        if (!publishing.wizard.BIASED_FOR_HOTELS_PER_CITY) return;
        form.find("input[name='GOTO']").val("HOTGROUP");

        searchAreaField.remove();
        var chosenCityId = form.field('destination').val();
        var hotelsForCity = $.grep(publishing.wizard.hotelsForCities, function(city, i) {
            return city.cityId == chosenCityId;
        })[0];

        var additionalInputs = [];
        $.each(hotelsForCity.hotelIds, function(i, hotelId) {
            additionalInputs.push($('<input type="hidden" name="HotelID' + i + '" value="' + hotelId + '" />'));
        });

        additionalInputs.push($('<input type="hidden" name="GroupName" value="' + hotelsForCity.cityName + '" />'));
        $.each(additionalInputs, function(i, inputItem) {
            form.append(inputItem);
        });
    }


    var hotelDestinations = {
        CITY: 'CITY',
        ADDRESS: 'ADDRESS'
    }

    function searchNearTypeChanged() {
        var currentSearchType = $(this).val();

        switch (currentSearchType) {
            case (hotelDestinations.CITY):
                $("#hotelSearchSectionAddress").toggle(false);
                $("#hotelSearchSectionCity").toggle(true);
                break;
            case (hotelDestinations.ADDRESS):
                $("#hotelSearchSectionCity").toggle(false);
                $("#hotelSearchSectionAddress").toggle(true);
                break;
        }
    }

    function restoreDates(){
        if( (checkinField.blank() || checkinField.val() == publishing.DATE_FORMAT) && publishing.util.parseDate(storedCheckinField.val()) != null)
            checkinField.val(storedCheckinField.val());
        if( (checkoutField.blank() || checkoutField.val() == publishing.DATE_FORMAT) && publishing.util.parseDate(storedCheckoutField.val()) != null)
            checkoutField.val(storedCheckoutField.val());
    }


    publishing.wizard.lobforms.hotelOnly_DatesChanged = function(){
        var enableDatelessFields = form.find("input[data-canonic='enableDateless']");
        if(enableDatelessFields.length > 0)
            enableDatelessFields[0].checked = false;
        form.triggerDatePicker(checkoutField, true);
    };

    opts.startDateCalCallback =  publishing.wizard.lobforms.hotelOnly_DatesChanged;


    var errorRenderer = new publishing.validation.ErrorRenderer(form, form.find("ul.errors"));
    var validator = new publishing.validation.Validator(publishing.wizard.lobforms.hotelOnly_ValidationRules, errorRenderer);
    form.initLobForm(opts, validator, prepareBiasedHotelInputsForFormSubmission);

    if (publishing.wizard.TYPEAHEAD_ENABLED && !publishing.wizard.BIASED_FOR_HOTELS_PER_CITY) {
        publishing.wizard.typeahead(cityField, taConfig, hotelOnlyTypeaheadSelected);
    }

    publishing.wizard.initRooms(form, rooms, publishing.wizard.lobforms.hotelOnly_ValidationRules, msg, opts);
    publishing.wizard.lobforms.additionalOptions({
        showAdditionalOptionsField : showAdditionalOptionsField,
        additionalOptionsContainer: additionalOptionsContainer,
        hideAdditionalOptionsField:hideAdditionalOptionsField
    });
    searchTypeField.bindAndTrigger(searchNearTypeChanged);
    restoreDates();


};

publishing.wizard.lobforms.constructRoomPackageInfoUrl = function() {
    var partUrl = "";

    var roomnum = parseInt($("#FH-NumRoom").val());
      partUrl+="&numberOfRooms=" + roomnum;
    for(var i = 1; i <= roomnum; i++){
      var numa = parseInt($("#FH-NumAdult"+i).val());
      partUrl+="&adultsPerRoom[" + i + "]=" + numa;
      var numc = parseInt($("#FH-NumChild"+i).val());
      partUrl+="&childrenPerRoom[" + i + "]=" + numc;
      for(var j = 1; j <= numc; j++){
           var age =  parseInt($("#FH-Rm"+i+"Child"+j+"Age").val());
              partUrl+="&childAges[" + i + "][" + j + "]=" + age;
      }
      partUrl+="&";
    }
    return partUrl;
}

publishing.wizard.lobforms.constructHotelInfoUrl = function(f){
    var url ="chkin="+escape(f["InDate"].value)+"&chkout="+escape(f["OutDate"].value)+"&";
    var roomnum = parseInt($("#H-NumRoom").val());
      for(var i = 1; i <= roomnum; i++){
          url+="rm"+i+"=";
          var numa = parseInt($("#H-NumAdult"+i).val());
          url+="a"+numa;
          var numc = parseInt($("#H-NumChild"+i).val());
          for(var j = 1; j <= numc; j++){
               var age =  parseInt($("#H-Rm"+i+"Child"+j+"Age").val());
              url+=":c"+age;
          }
          url+="&";
      }

      return url;
}

publishing.wizard.lobforms.hotelOnly.constructHotelInfoUrl = function(f){
    var url ="chkin="+escape(f["InDate"].value)+"&chkout="+escape(f["OutDate"].value)+"&";
    url += publishing.wizard.lobforms.constructHotelInfoUrl(f);

      return url;
}

publishing.wizard.lobforms.hotelOnly.constructFlightAndHotelInfoUrl = function(f){
    var url = "packageType=2&origin=" + escape(f["FrAirport"].value) +
              "&ttla=" + publishing.wizard.packageLobData.TLA +
              "&fromDate="+escape(f["FromDate"].value) +
              "&toDate="+escape(f["ToDate"].value) + "&";
    url += publishing.wizard.lobforms.constructRoomPackageInfoUrl();

      return url;
}


publishing.wizard.lobforms.hotelOnly.gotoHotelInfo = function(f, opts) {
    if($('#H-hotelId').val()!="" && $('#H-NumRoom').val()!=9 )
    {
        var temp=["/h",$('#H-hotelId').val(),".Hotel-Information?",publishing.wizard.lobforms.hotelOnly.constructHotelInfoUrl(f)];
        var url =  temp.join("");
        window.location = url;
        return true;
    }    return false;
};

publishing.wizard.lobforms.hotelOnly.gotoPackageInfo = function(f, opts) {
    if(publishing.wizard.packageLobData.HotelId)
    {
        var temp=["/h",$('#H-hotelId').val(),".Hotel-Information?",publishing.wizard.lobforms.hotelOnly.constructFlightAndHotelInfoUrl(f)];
        var url =  temp.join("");
        window.location = url;
        return true;
    }
    return false;
};




publishing.wizard.lobforms.hotelOnly.handleNinePlusRooms = function(f, opts) {
    if($('#H-NumRoom').val()==9)
    {
        var url = opts.ninePlusRoomsURL;
        var fieldMapping = [['City','PlaceName'],
                            ['InDate','InDate'],
                            ['OutDate','OutDate']];

        for ( var i = 0; i < fieldMapping.length; i ++ )
        {
            var entry = fieldMapping[i];
            if (entry[0] == 'InDate' || entry[0] == 'OutDate') {
                url = url + "&" + entry[0] + "=" + encodeURIComponent(publishing.wizard.formatDateForGroupForm9PlusRoomsService(f[entry[1]].value));
            } else {
                url = url + "&" + entry[0] + "=" + encodeURIComponent(f[entry[1]].value);
            }
        }
        window.location = url;
        return true;
    }
    return false;
};

// End of file ../content/static_content/default/default/scripts/wizard/hotelOnly.js

// Start of file ../content/static_content/default/default/scripts/wizard/multipleFlightTypes.js

expNamespace("publishing.wizard.lobforms");
expNamespace("publishing.wizard.lobforms.flightOnly");

publishing.wizard.lobforms.flightOnly.InternationalFlightForm = function() {
    this.container = function() {
        return $(publishing.WIZARD_CONTAINER_ID + " form.flightOnly");
    };
    this.defaultFlightType = function() {
        return "International";
    };
    this.flightFieldsContainer = function() {
        return this.container().find("div.internationalFlightFieldsContainer");
    };
};

publishing.wizard.lobforms.flightOnly.DomesticFlightForm = function() {
    this.container = function() {
        return $(publishing.WIZARD_CONTAINER_ID + " form.domesticFlightOnly");
    };
    this.defaultFlightType = function() {
        return "Domestic";
    };
    this.flightFieldsContainer = function() {
        return this.container().find("div.domesticFlightFieldsContainer");
    };
};

publishing.wizard.lobforms.flightOnly.internationalFlights = function(opts) {
    publishing.wizard.lobforms.flightOnly.initializeForIndiaSite(
        new publishing.wizard.lobforms.flightOnly.InternationalFlightForm(),
        new publishing.wizard.lobforms.flightOnly.DomesticFlightForm(),
        opts);
};

publishing.wizard.lobforms.flightOnly.submitFormTarget = null;
publishing.wizard.lobforms.flightOnly.setSubmitFormTarget = function(target) {
    publishing.wizard.lobforms.flightOnly.submitFormTarget = target;
};
publishing.wizard.lobforms.flightOnly.searchFlightAndHotel = function() {
    var flightOnlyForm = $(publishing.WIZARD_CONTAINER_ID + " form.flightOnly");
    var flightHotelForm = $(publishing.WIZARD_CONTAINER_ID + " form.flightAndHotel");
    //copy parameter values from flightOnlyForm to flightHotelForm
    flightOnlyForm.find(':input').filter(':visible').each(function() {
            var attr = $(this).attr("data-canonic");
            if(attr && attr != 'childrenAge' && flightHotelForm.field(attr))
            {
                // bug:MAIN-78109, the destination select box doesn't get updated because it's content doesn't get updated when origin change.
                flightHotelForm.field(attr).val($(this).val());
                if($(this).is('select') && 'FrAirport'==$(this).attr('name')) {
                    // trigger the select-change if any
                    flightHotelForm.field(attr).trigger('change');
                }
            }
        }
    )

    if($("#jpFLPFltPkgSearchFlag").length>0){
        if(flightHotelForm.find("select[name=FrAirport]").length>0){
            flightHotelForm.find("select[name=FrAirport]").attr('name', '');
        }
        if(flightHotelForm.find("select[name=DestName]").length>0){
            flightHotelForm.find("select[name=DestName]").attr('name', '');
        }
    }

    if(flightOnlyForm.field('numChildren').val() > 0) {
        for(i=1;i <= flightOnlyForm.field('numChildren').val();i++) {
             flightHotelForm.find('select[name=Rm1Child'+i+'Age]').val(flightOnlyForm.find('select[name=Age'+i+']').val());

        }
    }

    if(flightHotelForm.find("[data-canonic=fromDate]").val()==flightHotelForm.find("[data-canonic=toDate]").val())
    {
            var $toDateElement = flightHotelForm.find("[data-canonic=toDate]");
            var  toDate = $toDateElement.datepicker('getDate','+1d');
            toDate.setDate(toDate.getDate() + 1);
            $toDateElement.datepicker('setDate', toDate);
    }
    flightHotelForm.find("[data-canonic=flexibleFromDate]").remove();
    flightHotelForm.find("[data-canonic=flexibleToDate]").remove();
};

publishing.wizard.lobforms.flightOnly.domesticFlightsOnly = function(opts) {
    var domesticFlightForm = new publishing.wizard.lobforms.flightOnly.DomesticFlightForm();
    var formContainer = domesticFlightForm.container();

    function formattedNameValuePairToSubmit(fieldName, fieldValue) {
        return "&" + fieldName + "=" + fieldValue;
    }

    function fieldValue(canonicName) {
        var visibleElements = formContainer.field(canonicName).filter(":visible");
        if (visibleElements.length == 0) return "";
        return visibleElements[0].value;
    }

    function submittableValue(fieldName, canonicName) {
        return formattedNameValuePairToSubmit(fieldName, fieldValue(canonicName));
    }

    function magicTime(selectedTime) {
        var time = parseInt(selectedTime);
        if (time == 362) {
            return '0';
        }
        else if (time < 241) {
            return '1';
        }
        else if (time < 481) {
            return '2';
        }
        else if (time < 721) {
            return '3';
        }
        else if (time < 961) {
            return '4';
        }
        else if (time < 1201) {
            return '5';
        }
        else {
            return 6;
        }
    }

    function submittableTimeValue(fieldName, canonicName) {
        return formattedNameValuePairToSubmit(fieldName, magicTime(fieldValue(canonicName)));
    }

    function numberOfChildrenAndInfants() {
        var noOfInfants = 0;
        var noOfChildren = 0;
        var noOfChildrenFieldValue = formContainer.field("numChildren").val();
        for (var i = 1; i <= parseInt(noOfChildrenFieldValue); i ++) {
            var childAge = formContainer.find("select[name=Age" + i + "]").filter(":visible")[0].value;
            if (parseInt(childAge) < 2) noOfInfants++;
            else noOfChildren++;
        }
        return formattedNameValuePairToSubmit("childs", noOfChildren) + formattedNameValuePairToSubmit("infants", noOfInfants);
    }

    function flightType() {
        var result = "";
        switch (selectedTripType()) {
            case "Multicity" :
                result = formattedNameValuePairToSubmit("multicity", "true");
                break;
            case "OneWay" :
                result = formattedNameValuePairToSubmit("rnd_one", "O");
                break;
            case "RoundTrip" :
                result = formattedNameValuePairToSubmit("rnd_one", "R");
                break;
        }
        return result;
    }

    function selectedTripType() {
        return formContainer.find("input[name=TripType]").filter(":checked")[0].value;
    }

    function departureAndReturnVariables() {
        var tripType = selectedTripType();
        if (tripType == "Multicity") {
            var leg1 = submittableValue("from1", "origin") + submittableValue("depart_date_1", "date1") + submittableTimeValue("dpt_time_1", "fromTime") +
                submittableValue("to1", "destination");
            var leg2 = submittableValue("from2", "fromAirport2") + submittableValue("depart_date_2", "date2") + submittableTimeValue("dpt_time_2", "time2") +
                submittableValue("to2", "toAirport2");
            var leg3 = submittableValue("from3", "fromAirport3") + submittableValue("depart_date_3", "date3") + submittableTimeValue("dpt_time_3", "time3") +
                submittableValue("to3", "toAirport3");
            var leg4 = submittableValue("from4", "fromAirport4") + submittableValue("depart_date_4", "date4") + submittableTimeValue("dpt_time_4", "time4") +
                submittableValue("to4", "toAirport4");
            var leg5 = submittableValue("from5", "fromAirport5") + submittableValue("depart_date_5", "date5") + submittableTimeValue("dpt_time_5", "time5") +
                submittableValue("to5", "toAirport5");
            return leg1 + leg2 + leg3 + leg4 + leg5;
        }
        else {
            return submittableValue("from", "origin") + submittableValue("depart_date", "fromDate") + submittableTimeValue("dep_time", "fromTime") +
                submittableValue("to", "destination") + submittableValue("return_date", "toDate") + submittableTimeValue("ret_time", "toTime");
        }
    }

    this.onSuccessHandler = function() {
        var numberOfAdults = submittableValue("adults", "numAdults");
        var cabinClass = submittableValue("class", "cabinClass");
        var preferredAirline = submittableValue("carrier", "airlinePreference");

        var actionWithParameters = opts.domesticFlightFormUrl + flightType() + departureAndReturnVariables() + numberOfAdults + numberOfChildrenAndInfants() + cabinClass + preferredAirline;

        formContainer.attr("action", actionWithParameters);
    };


    this.onSuccessHandlerForIndiaSite = function() {
        var numberOfAdultsValue = parseInt(fieldValue("numAdults"))+parseInt(fieldValue("numSeniors"));
        var numberOfAdults = formattedNameValuePairToSubmit("adults",numberOfAdultsValue);
        var cabinClass = submittableValue("class", "cabinClass");
        var preferredAirline = submittableValue("carrier", "airlinePreference");
        var actionWithParameters = opts.domesticFlightFormUrl + flightType() + departureAndReturnVariables() + numberOfAdults + numberOfChildrenAndInfants() + cabinClass + preferredAirline;
        formContainer.attr("action", actionWithParameters);
    };

    function hackyPlanToRemoveInfantSeatPreferenceContentsOnlyForDomesticFlights() {
        formContainer.find(".section-infants-pref").html("");
    }

    publishing.wizard.lobforms.flightOnly.initializeForIndiaSite(
        domesticFlightForm,
        new publishing.wizard.lobforms.flightOnly.InternationalFlightForm(),
        opts, this.onSuccessHandlerForIndiaSite);

    hackyPlanToRemoveInfantSeatPreferenceContentsOnlyForDomesticFlights();
};

publishing.wizard.lobforms.flightOnly.initializeForIndiaSite = function(defaultForm, otherForm, opts, onSuccessHandler) {
    var defaultFormContainer = defaultForm.container();
    var otherFormContainer = otherForm.container();

    var defaultFlightTypeRadioField = defaultFormContainer.find("select[name=flightType]");
    var otherFlightTypeRadioField = otherFormContainer.find("select[name=flightType]");
    var defaultFormErrorRenderer = new publishing.validation.ErrorRenderer(defaultFormContainer, defaultFormContainer.find("ul.errors"));

    var validationRules = publishing.wizard.lobforms.flightOnly.validationRules(defaultForm.flightFieldsContainer(), opts);
    publishing.wizard.lobforms.flightOnly.init(defaultFormContainer, opts, validationRules, onSuccessHandler);

    function switchFlightType() {
        defaultFormContainer.toggle(defaultFlightTypeRadioField.val() == defaultForm.defaultFlightType());
        otherFormContainer.toggle(defaultFlightTypeRadioField.val() == otherForm.defaultFlightType());
        otherFlightTypeRadioField.val(otherForm.defaultFlightType());
        defaultFormErrorRenderer.clearAll();
        changePosition(defaultFormContainer,otherFormContainer);
    }

    function changePosition(defaultFormContainer,otherFormContainer){
        if(defaultFormContainer.is(":visible")){
            otherFormContainer.before(defaultFormContainer);
        }
        if(otherFormContainer.is(":visible")){
            defaultFormContainer.before(otherFormContainer);
        }
    }


    defaultFlightTypeRadioField.bindAndTrigger(switchFlightType);
};
;
// End of file ../content/static_content/default/default/scripts/wizard/multipleFlightTypes.js

// Start of file ../content/static_content/default/default/scripts/wizard/threePP.js
;
expNamespace("publishing.wizard.lobforms");

publishing.wizard.lobforms.ukThreePP = function(opts) {
    var msg = opts.errorMessages;
    var form = $(publishing.WIZARD_CONTAINER_ID + ' form.threePP');
    var departureDateField = form.find("input[name=FromDate]");
    var departureDateDefaultValue = departureDateField.val();

    var validationRules = [
        new publishing.validation.OptionalDate(departureDateField, msg.departureDate),
        new publishing.validation.DatePriorToAllowedDate(departureDateField, opts.minPurchaseDate, msg.departurePriorToCurrentDate),
        new publishing.validation.DateIsLessOrEqual(opts.maxPurchaseDate, departureDateField, msg.datePastMaxDate)
    ];

    var errorRenderer = new publishing.validation.ErrorRenderer(form, form.find("ul.errors"));
    var validator = new publishing.validation.Validator(validationRules, errorRenderer);

    this.onSuccess = function() {
        if (departureDateDefaultValue == departureDateField.val())
            departureDateField.val("");
    };

    form.initLobForm(opts, validator, this.onSuccess);
};

publishing.wizard.lobforms.deThreePP = function(opts) {
    var form = $(publishing.WIZARD_CONTAINER_ID + ' form.' + opts.form);
    var fromDateField = form.find("input[name=termin]");
    var toDateField = form.find("input[name=ruecktermin]");
    form.initLobForm(opts, undefined);
};

publishing.wizard.lobforms.atThreePP = function(opts) {
    var form = $(publishing.WIZARD_CONTAINER_ID + ' form.' + opts.form);
    var fromDateField = form.find("input[name=termin]");
    var toDateField = form.find("input[name=ruecktermin]");
    form.initLobForm(opts, undefined);
};

publishing.wizard.lobforms.frThreePP = function(opts) {
    var form = $(publishing.WIZARD_CONTAINER_ID + ' form.threePP');
    var fromDateField = form.find("input[name=termin]");
    var travellersField = form.find("input[name=personen]");
    var noOfAdultsField = form.find("select[id=threePP-Adults]");
    var childAge1Field = form.find("select[id=threePP-ChildAge1]");
    var childAge2Field = form.find("select[id=threePP-ChildAge2]");
    var childAge3Field = form.find("select[id=threePP-ChildAge3]");
    var defaultChildAgeValue = childAge1Field.val();

    var defaultDateFieldValue = fromDateField.val();

    function formattedValue(travellerElement) {
        var value = travellerElement.val();
        return value == defaultChildAgeValue ? "" : ";" + value;
    }

    this.onSuccess = function() {
        var fromDateValue = defaultDateFieldValue == fromDateField.val() ? publishing.util.formattedDate("dd.mm.yyyy", 0, new Date()) : fromDateField.val().replace(/\//g, '.');
        fromDateField.val(fromDateValue);
        travellersField.val(noOfAdultsField.val() + formattedValue(childAge1Field) + formattedValue(childAge2Field) + formattedValue(childAge3Field));
    };
    form.initLobForm(opts, undefined, this.onSuccess);
};

publishing.wizard.lobforms.itThreePP = function(opts) {
    var msgs = opts.errorMessages;
    var form = $(publishing.WIZARD_CONTAINER_ID + ' form.threePP');
    var fromDateField = form.find("input[name=depDateFrom]");
    var toDateField = form.find("input[name=depDateTo]");
    var departFromField = form.find("select[name=depFrom]");
    var defaultDateValue = departFromField.val();

    var validationRules = [
        new publishing.validation.OptionalDate(fromDateField, msgs.fromDate),
        new publishing.validation.DatePriorToAllowedDate(fromDateField, opts.minPurchaseDate, msgs.fromPriorToCurrentDate),
        new publishing.validation.OptionalDate(toDateField, msgs.toDate),
        new publishing.validation.DatePriorToAllowedDate(toDateField, opts.minPurchaseDate, msgs.toPriorToCurrentDate)
    ];

    var errorRenderer = new publishing.validation.ErrorRenderer(form, form.find("ul.errors"));
    var validator = new publishing.validation.Validator(validationRules, errorRenderer);

    function dateHasChanged(dateField) {
        return dateField.val() != defaultDateValue;
    }

    function submittableDateValue(dateField, offset) {
        var dateValue = dateHasChanged(dateField) ? dateField.val() : publishing.util.formattedDate("dd/mm/yyyy", offset, new Date());
        return  dateField.attr('name') + "=" + dateValue + "&";
    }

    this.onSuccess = function() {
        var fromDate = submittableDateValue(fromDateField, 0);
        var toDate = submittableDateValue(toDateField, 60);
        var customAction = "";
        if (departFromField.blank()) {
            customAction = opts.formActionWithNoDepartFrom.replace('formParameters', fromDate + toDate);
        } else {
            var departFrom = "depFrom=" + departFromField.val() + "&";
            customAction = opts.formActionWithDepartFrom.replace('formParameters', departFrom + fromDate + toDate);
        }
        form.attr("action", customAction);
    };
    form.initLobForm(opts, validator, this.onSuccess);
};
;
// End of file ../content/static_content/default/default/scripts/wizard/threePP.js


publishing.wizard.lobforms.caThreePP = function(opts) {
    var msg = opts.errorMessages;
    var form = $(publishing.WIZARD_CONTAINER_ID + ' form.threePP');
    var destinationField = form.find("select[name=fcy]"),
        departureDateField = form.find("input[name=fdt]"),
        travellerDetailsSection = form.find(".traveller-details"),
        childrenAgesFields = form.find('select[data-canonic=childrenAge]');

    var validationRules = [
        new publishing.validation.NotEmpty(destinationField, msg.mandatory),
        new publishing.validation.MandatoryDate(departureDateField, msg.departureDate),
        new publishing.validation.DatePriorToAllowedDate(departureDateField, opts.minPurchaseDate, msg.departureDatePriorToCurrentDate),
        new publishing.validation.ChildrenAgeRequired(childrenAgesFields, msg.childrenAge)
    ];

    var errorRenderer = new publishing.validation.ErrorRenderer(form, form.find("ul.errors"));
    var validator = new publishing.validation.Validator(validationRules, errorRenderer);

    form.initLobForm(opts, validator);
    publishing.wizard.initRoom(travellerDetailsSection, validationRules, opts.errorMessages);
};

publishing.validation.ChildrenAgeRequired = function(childrenAges, message) {
    this.apply = function() {
        var visibleElements = [];
        var visibleChildrenAges = childrenAges.filter(':visible');
        if(visibleChildrenAges.length > 0) {
            for(var i = 0; i < visibleChildrenAges.length; i++) {
                if(parseInt(visibleChildrenAges[i].value) < 0 || parseInt(visibleChildrenAges[i].value) > 17){
                    visibleElements.push(visibleChildrenAges[i]);
                }
            }
        }
        if (visibleElements.length == 0) {
            return new publishing.validation.Result(true);
        } else {
            var error = new publishing.validation.Error(visibleElements, message);
            return new publishing.validation.Result(false, error);
        }
    };
    return this;
};

publishing.wizard.typeahead = function(field, config, trigger) {

    //init TA

    function initTA(id, config){

        var typeahead = {};
        typeahead.serviceRequestMask = config.serviceRequestMask;
        typeahead.id = id;
        typeahead.On = config.On;
        typeahead.MinChar = config.MinChar;
        typeahead.MaxItems =  config.MaxItems;
        typeahead.Path = config.Path;
        typeahead.lob = config.lob;
        typeahead.Locale = config.Locale;
        typeahead.abTest = config.abTest;
        typeahead.version = config.version;
        typeahead.closeText = config.closeText;
        typeahead.contiueText = config.contiueText;
        typeahead.itemClickedEvent = config.itemClickedEvent;
        typeahead.trigger = trigger;
        typeahead.category = config.category;
        typeahead.dest = config.dest;
        TA.setup(typeahead);
        TA.init(id);
    }
    if (window['TA']) {
        //loop the input id
        if(field.length > 0 && config != undefined){
            for(var i =0; i < field.length; i++) {
                if (field[i].nodeName.toUpperCase() == 'INPUT' && field[i].getAttribute('type') == 'text') {
                    initTA(field[i].id, config);
                }
            }
        }
    }



};

publishing.wizard.lobforms.vacationPackage = function() {
    var packageDiv = $(publishing.WIZARD_CONTAINER_ID + " div.lobForm-vacationPackage");

    var form = $(publishing.WIZARD_CONTAINER_ID + " form.vacationPackage");
    var packageTypeDropdownlist = form.find("select[name=PackageType]");

    function switchType() {
        var index = packageTypeDropdownlist.val();
        var currentTypeContainer = packageDiv.find("div.packageType:visible");
        if (currentTypeContainer.hasClass("packageType-" + index)) {
            return;
        }
        var newTypeContainer = packageDiv.find("div.packageType-" + index);

        currentTypeContainer.hide();
        newTypeContainer.show();
    }

    packageTypeDropdownlist.bindAndTrigger(switchType);
};

publishing.wizard.preserveTA = function(ci)
{

    var field = $('#' + ci.inputId);
    var canonicName = publishing.wizard.canonicName(field);
    publishing.wizard.canonicFieldValues[canonicName] = field.val();
};


publishing.wizard.recentlyViewedHotels = function(rvItems) {
    var form = $(publishing.WIZARD_CONTAINER_ID + " form.hotelOnly");
    var recentViewField = form.find("#rvFieldset");
    var selectField = form.find("#rvSelect");
    var destField = $("input[data-canonic='destination']");
    var checkInField = $("input[data-canonic='fromDate']");
    var checkOutField = $("input[data-canonic='toDate']");
    var rooms = form.find(".rooms .room");
    var numberOfRoomsField = form.field("numRooms");

    var prePopulateRecentViewData = function(rvItems) {
        return function() {
            var selOption = $(this).val();
            destField.val(rvItems[selOption].city);
            destField.change();
            checkInField.val(rvItems[selOption].checkInDate);
            checkInField.change();
            checkOutField.val(rvItems[selOption].checkOutDate);
            checkOutField.change();

            numberOfRoomsField.val(rvItems[selOption].travelerUnits.length);
            numberOfRoomsField.change();

            for (i in rvItems[selOption].travelerUnits) {
                var numberOfAdultsField = $(rooms[i]).field("numAdults");
                var numberOfChildrenField = $(rooms[i]).field("numChildren");
                var childrenAgesFields = $(rooms[i]).field("childrenAge");

                numberOfAdultsField.val(rvItems[selOption].travelerUnits[i].numberOfAdults);
                numberOfChildrenField.val(rvItems[selOption].travelerUnits[i].childAges.length);
                numberOfChildrenField.change();

                for (num in rvItems[selOption].travelerUnits[i].childAges) {
                    var childAgeField = $(childrenAgesFields[num]);
                    childAgeField.val(rvItems[selOption].travelerUnits[i].childAges[num]);
                }
            }

            $("#mcicid").val("Hotel.LP.RVSelect");
        }
    }

    function isSameRecentViewItem(rvItemOrigin, rvItemDest) {
        if (rvItemOrigin == null || rvItemDest == null) {
            return false;
        } else if (rvItemOrigin.city.indexOf(rvItemDest.city) == -1) {
            return false;
        } else if (rvItemOrigin.checkInDate.indexOf(rvItemDest.checkInDate) == -1) {
            return false;
        } else if (rvItemOrigin.checkOutDate.indexOf(rvItemDest.checkOutDate) == -1) {
            return false;
        }
        return true;
    }

    function delDuplicateRecentViewItems(rvItems) {
        var hasDupData = false;

        if (rvItems.length > 1) {
            for (i in rvItems) {
                for (var j=parseInt(i)+1; j<rvItems.length; j++) {
                    if (isSameRecentViewItem(rvItems[i], rvItems[j])) {
                        rvItems[j] = null;
                        hasDupData = true;
                    }
                }
            }
        }

        if (hasDupData) {
            var rvItemsNew = new Array();
            var j = 0;
            for (i in rvItems) {
                if (rvItems[i] != null) {
                    rvItemsNew[j] = rvItems[i];
                    j++;
                }
            }
            return rvItemsNew;
        }

        return rvItems;
    }

    function addItemsIntoDropdownList(rvItems){
        var rvSel = "";
        for (i in rvItems){
            rvSel += "<option value=\"" + i + "\">" + rvItems[i].city + " " + rvItems[i].checkInDateView + rvItems[i].checkOutDateView + "</option>";
        }
        selectField.append(rvSel);
    }

    function initRecentViewData(rvItems) {
        var rvItemsNew = delDuplicateRecentViewItems(rvItems);
        if (rvItemsNew != null && rvItemsNew.length > 1) {
            addItemsIntoDropdownList(rvItemsNew);
            recentViewField.show();
            selectField.change(prePopulateRecentViewData(rvItemsNew));
        }
    }

    initRecentViewData(rvItems);
};


publishing.wizard.recentlySearchedPackages = function(rsItems) {
    var form = $(publishing.WIZARD_CONTAINER_ID + " form.flightAndHotel");
    var recentlySearchedField = form.find("#rspField");
    var selectField = form.find("#rspSelect");

    var originField = form.field("origin");
    var destinationField = form.field("destination");
    var departureDateField = form.field("fromDate");
    var returnDateField = form.field("toDate");
    var partialHotelBooking = form.field("partialHotelBooking");
    var flexibleFromDate = form.field("flexibleFromDate");
    var flexibleToDate = form.field("flexibleToDate");

    var rooms = form.find(".rooms .room");
    var numberOfRoomsField = form.field("numRooms");
    var partialHotelBookingDateSection = form.find(".section-partial-hotel-booking-date");
    var infantPreferencesContainer = form.find(".section-infants-pref");
    var infantPreferencesRadioField = form.field("infantSeatPreference");

    var populateRecentlySearchedData = function(rsItems) {
        return function() {
            var selOption = $(this).val();
            originField.val(rsItems[selOption].originCity);
            originField.change();
            destinationField.val(rsItems[selOption].destinationCity);
            destinationField.change();

            departureDateField.val(rsItems[selOption].departureDate);
            departureDateField.change();
            returnDateField.val(rsItems[selOption].returnDate);
            returnDateField.change();

            if (rsItems[selOption].checkInDate != "" && rsItems[selOption].checkOutDate != "")
            {
                partialHotelBooking.attr('checked', true);
                partialHotelBookingDateSection.show();

                flexibleFromDate.val(rsItems[selOption].checkInDate);
                flexibleToDate.val(rsItems[selOption].checkOutDate);
            } else {
                partialHotelBooking.attr('checked', false);
                partialHotelBookingDateSection.hide();

                flexibleFromDate.val("mm/dd/yy");
                flexibleToDate.val("mm/dd/yy");
            }

            partialHotelBooking.unbind();
            partialHotelBooking.bind('click', function() {
                if (this.checked == true) {
                    partialHotelBookingDateSection.show();
                } else {
                    partialHotelBookingDateSection.hide();
                }
            });

            numberOfRoomsField.val(rsItems[selOption].travelerUnits.length);
            numberOfRoomsField.change();

            var infantsInSeats = false;
            var showInfantPreferContainer = false;
            for (i in rsItems[selOption].travelerUnits) {
                var numberOfAdultsField = $(rooms[i]).field("numAdults");
                var numberOfSeniorsField = $(rooms[i]).field("numSeniors");
                var numberOfChildrenField = $(rooms[i]).field("numChildren");
                var childrenAgesFields = $(rooms[i]).field("childrenAge");

                if (rsItems[selOption].travelerUnits[i].infantsInSeats) {
                    infantsInSeats = true;
                }

                numberOfAdultsField.val(rsItems[selOption].travelerUnits[i].numberOfAdults);
                numberOfSeniorsField.val(rsItems[selOption].travelerUnits[i].numberOfSeniors);
                numberOfChildrenField.val(rsItems[selOption].travelerUnits[i].childAges.length);
                numberOfChildrenField.change();

                for (num in rsItems[selOption].travelerUnits[i].childAges) {
                    var childAgeField = $(childrenAgesFields[num]);
                    childAgeField.val(rsItems[selOption].travelerUnits[i].childAges[num]);
                    childAgeField.change();
                    if (rsItems[selOption].travelerUnits[i].childAges[num] == 0) {
                        showInfantPreferContainer = true;
                    }
                }
            }

            if (showInfantPreferContainer) {
                infantPreferencesContainer.show();
                if (infantPreferencesRadioField && infantPreferencesRadioField.length > 1) {
                    if (infantsInSeats) {
                        infantPreferencesRadioField[1].checked = true;
                    } else {
                        infantPreferencesRadioField[0].checked = true;
                    }
                }
            } else {
                infantPreferencesContainer.hide();
            }

            $("#mcicid").val("PKG.LP.RVSelect");
        }
    }

    function addItemsIntoDropdownList(rsItems){
        rsOptions = "";
        for (i in rsItems) {
            rsOptions += "<option value=\"" + i + "\">" + rsItems[i].originCityView + "-" + rsItems[i].destinationCityView + " " + rsItems[i].departureDateView + rsItems[i].returnDateView + "</option>";
        }
        selectField.append(rsOptions);
    }

    function initRecentlySearchedData(rsItems) {
        if (rsItems != null && rsItems.length > 0) {
            addItemsIntoDropdownList(rsItems);
            recentlySearchedField.show();
            selectField.change(populateRecentlySearchedData(rsItems));
        }
    }

    initRecentlySearchedData(rsItems);
};



var s_prop34 = "";
publishing.wizard.setABValue = function(id, v)
{
    var id_v = id + "_" + v;
    if(s_prop34 == "")
    {
        s_prop34 = id_v;
    }
    else if(s_prop34.indexOf(id_v) == (-1))
    {
        s_prop34 = s_prop34 + "|" + id_v;
    }
};

publishing.wizard.fillCheckInDateAuto = function(partialHotelBooking, opts)
{
    partialHotelBooking.click(function() {
        if (opts.fillCheckInDateAutoFieldPrefix != null && opts.fillCheckInDateAutoFieldPrefix != 'undefined') {
            if ($(this).attr("checked") == "checked") {
                $('#'+opts.fillCheckInDateAutoFieldPrefix+'-flexibleFromDate').val($('#'+opts.fillCheckInDateAutoFieldPrefix+'-fromDate').val());
            }
        }
    });
}

}
