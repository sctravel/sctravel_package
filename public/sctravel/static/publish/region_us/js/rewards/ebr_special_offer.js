function handleRegisterResponse(doc) {
    var loggedIn = doc[0];
    var actionSuccess = doc[1];

    if (actionSuccess == true)
    	   
	//if offer enrollment successful, display success copy and hide button
    {   
    	document.cookie="loyaltyRegistered=true; expires=Wed, 29 Apr 2015 12:00:00 GMT";
    	//console.log("cookie created");
    	$('#special_offer_wrapper').hide();
    	$('#special_offer_success_wrapper').show();
    	
    }
    else
    {
    	$('#error_message p').html('We were unable to register you. Please try again.');
		$('#special_offer_wrapper').hide();
    }
}

function handleRegisterCheck(doc) {
	var loggedIn = doc[0];
	var actionSuccess = doc[1];
    
	if (actionSuccess == true)  //if user is already registered in offer, display 'Registered' button
    {
    	if(getCookie("loyaltyRegistered") != "true") {
    		document.cookie="loyaltyRegistered=true; expires=Wed, 29 Apr 2015 12:00:00 GMT";
    		//console.log("cookie created");
    	}
    	$('#special_offer_wrapper').hide();
       	$('#special_offer_success_wrapper').show();
       
    }
    else if (loggedIn == true && window.location.search.indexOf("loggedIn=1") > 0) //if user is redirected from Login page, enroll/register user
    {
      
       rewards_process_award();
    	
    }
    else  //if user is not logged in OR not a rewards member, display 'Register Now' button
    {
    	$('#special_offer_wrapper').show();
       	$('#special_offer_success_wrapper').hide();
    }
}

function rewards_process_award()
{
	setRegisteredLock();
	var rewardsMember = false;
	$.ajax({
		type: "GET",
	    url: '/loyalty/retrieveMembershipDetails',
	    async: false,
	    dataType: "json",
		success: function(data){
		   	rewardsMember = data.rewardsUser;
		   	if (data.loginStatus != "hardLoggedIn")  //if not signed in, redirect to Login page
		    {		
		    	    	var rewardReferrer;
		    	    	if(window.location.pathname == "/p/promo/deals" || window.location.pathname == "/p/gmt/uncat.template") {
		    	    		rewardReferrer = window.location.href ;
		    	    	} else {
		   			rewardReferrer = document.referrer;
		   		}
		    	    	var targetURL = "https://" + window.location.host + "/user/login?loyaltyRewardsEnrollSignin=true&ckoflag=0&uurl=qscr%3Dredr%26rurl%3D" + encodeURIComponent(rewardReferrer) + "%26loggedIn%3D1";
		   		window.open(targetURL,'_top');
		    }
		},
		error: function(){
		  	showSignInModule();
		}
	});
	
	$.ajax({
		type: "POST",
	    data : $('#special_offer_form').serialize(),
	    url: '/promo/registerOffer',
	    async: false,
	    dataType: "json",
		success: function(data){
		   	handleRegisterResponse([data.loggedIn, data.actionSuccess]);
		   	
		   	if(!rewardsMember)
		   	{
		   		s_exp.linkTrackVars = 'prop11,prop12,prop16,eVar18,eVar28,eVar55,eVar56,events';
				s_exp.linkTrackEvents = 'event61';
				s_exp.prop16 = 'Rewards.Account.Enroll.Success';
				s_exp.eVar28 = 'Rewards.Account.Enroll.Success';
				s_exp.events = 'event61';
				s_exp.tl(true,'o','Acct:Enroll Success');
				
				
		   	}
		},
		error: function(data){
		  	$('#error_message p').html('We were unable to register you. Please try again.');
			$('#special_offer_form_wrapper').hide();
			
		}
	});
	return false;
}

function getCookie(cname) {
	var name = cname + "=";
	var ca = document.cookie.split(';');
	for(var i=0; i<ca.length; i++) {
		var c = ca[i].trim();
		if (c.indexOf(name)==0) return c.substring(name.length,c.length);
	}
	return "";
}

function setRegisteredLock() {
	if(getCookie("loyaltyRegistered") == "true") {
		if($("iframe#rewardIframe").length == 1) {
			$("iframe#rewardIframe").contents().find("button").html("<span>Registered</span>");
			$("iframe#rewardIframe").contents().find("button").prop("disabled",true);
		} else {
			$("button#special_offer_btn").html("<span>Registered</span>");
			$("button#special_offer_btn").prop("disabled",true);
			$("#loyalty_button a").css("padding-left","1px");
		}
	}
}



$(document).ready(function() {

	$.ajax({
		type: "GET",
	    data : $('#special_offer_form').serialize(),
	    url: '/promo/registerOffer',
	    async: false,
	    dataType: "json",
		success: function(data){
			handleRegisterCheck([data.loggedIn, data.actionSuccess]);
		}
	});
	setRegisteredLock();
	$('#special_offer_btn').click(function() {rewards_process_award();setRegisteredLock();});
	
});
