if(!UserCaptcha){var UserCaptcha={};}(function(b,a){a.verifyCaptcha=function(e){if(b("#recaptcha_response_field").is(":visible")){a.hideErrors();var d=b.trim(b("#recaptcha_response_field").val());if(d!=""){var c={"challenge":b.trim(b("#recaptcha_challenge_field").val()),"response":d};b.ajax({type:"POST",url:"https://"+window.location.host+"/verifyCaptcha",data:c,mimeType:"application/json",async:false,success:function(f){if(f&&f.captchaResponse){a.handleCaptchaResponse(f.captchaResponse,e);}else{a.handleCaptchaErrorResponse();}},error:function(h,f,g){if(window.console&&console.log){console.log(h,f,g);}a.handleCaptchaErrorResponse();}});}else{a.showCaptchaError();}}else{if(e&&b.isFunction(e)){e();}}};a.getCaptcha=function(){b.ajax({type:"GET",url:"https://"+window.location.host+"/getCaptcha",mimeType:"application/json",success:function(c){if(window.console&&console.log){console.log(c);}},error:function(e,c,d){if(window.console&&console.log){console.log(e,c,d);}}});};a.handleCaptchaResponse=function(c,d){if(c.success){if(d&&b.isFunction(d)){d();}b(document).trigger("captchaSuccess");}else{a.handleCaptchaErrorResponse();}};a.handleCaptchaErrorResponse=function(){Recaptcha.reload();b(document).trigger("captchaFailure");a.showCaptchaError();};a.showCaptchaError=function(){b("#captcha_error").removeClass("initiallyhidden");b("#captcha_input_label").addClass("invalid");b("#captcha_form_error").show();b("html, body").animate({scrollTop:b("#securityCheckContainer").offset().top},800);return false;};a.hideErrors=function(){b("#recaptcha_response_field").removeClass("error-field").removeClass("captcha-error-field");b("#captcha_form_error").hide();b("#captcha_inline_error").hide();};a.init=function(){b(document).bind("showCaptcha",function(e,c,f,h){if(b("#captchaEnabled").val()){if(c){a.getCaptcha();var g=b.trim(b("#cp_pb_key").val()),d={theme:b.trim(b("#cp_theme").val()),lang:b.trim(b("#cp_lang").val())};Recaptcha.create(g,c,f?f:d);if(h&&b.isFunction(h)){h();}}}});b(document).bind("verifyCaptcha",function(d,c,e){a.verifyCaptcha(c,e);});b("#recaptcha_response_field").bind("focusout",function(){a.hideErrors();if(b.trim(b("#recaptcha_response_field").val())==""){b("#recaptcha_response_field").addClass("error-field").addClass("captcha-error-field");b("#captcha_inline_error").show();}});};b(function(){a.init();});}(jQuery,UserCaptcha));if(!USERITIN){var USERITIN={};}$(document).ready(function(){if($("#captchaEnabled").val()=="1"){$(document).trigger("showCaptcha",["captcha_container"]);}if($("#leftCaptchaEnabled").val()=="1"){$("#captcha_right_div").hide();$("#captcha_left_div").show();}if($("#rightCaptchaEnabled").val()=="1"){$("#captcha_left_div").hide();$("#captcha_right_div").show();}});USERITIN.hideLeftCaptcha=function(){$("#captcha_left_div").hide();};USERITIN.hideRightCaptcha=function(){$("#captcha_right_div").hide();};USERITIN.clearFields=function(){$("#view-itin-registered-email-label").removeClass("invalid");$("#view-itin-registered-password-label").removeClass("invalid");$(".blank-warning").hide();$("#wrong-credentials-error-div").hide();$("#multiple-email-error-div").hide();$("#blank-unregistered-view-itin").removeClass("show");$("#blank-unregistered-view-itin").addClass("hidden");$("#itin-error-div").hide();$("#registered-email-error").removeClass("show");$("#registered-email-error").addClass("hidden");$("#forgot-itin-email-sent").removeClass("show");$("#forgot-itin-email-sent").addClass("hidden");$("#captcha_error").css("display","none");$("#blank_captcha_error").addClass("initiallyhidden");resetForm($("#view-itin-registered-signin-form"));};USERITIN.clearForgotItinFields=function(){$("#blank-unregistered-forgot-itin").removeClass("show");$("#blank-unregistered-forgot-itin").addClass("hidden");$("#error-unregistered-forgot-itin").addClass("hidden");$("#captcha_error").css("display","none");$("#blank_captcha_error").addClass("initiallyhidden");};USERITIN.submitForgotItinForm=function(){var g=0;var b=$("#forgot-itinerary-form").find('input[name="emailAddress"]');var d=$.trim(b.val());if((d=="")||(!isValidEmail(d))){g++;$("#forgot-itin-unregistered-email-label").addClass("invalid");}if(g>0){$("#blank-unregistered-forgot-itin").removeClass("hidden");$("#blank-unregistered-forgot-itin").addClass("show");return false;}$("#blank-unregistered-forgot-itin").removeClass("show");$("#blank-unregistered-forgot-itin").addClass("hidden");if($("#captchaEnabled").val()=="1"){var e=$.trim($("#recaptcha_challenge_field").val());var c=$.trim($("#recaptcha_response_field").val());if($.trim(c)==""){$("#blank_captcha_error").removeClass("initiallyhidden");return false;}$("#forgot-itinerary-form").append($('<input type="hidden" name="challenge" value="'+e+'"/>'));$("#forgot-itinerary-form").append($('<input type="hidden" name="response" value="'+c+'"/>'));}var h=window.location.search;var f=(/fromurl=([^&]+)/.exec(h)||[])[1];if(f){var a=decodeURIComponent(f);a=a.replace(/\'/g,"").replace(/\"/g,"").replace(/\;/g,"");f=encodeURIComponent(a);$("#fromurl").val(f);}$("#forgot-itinerary-form").submit();return true;};$("#forgot-itin-unregistered-submit-button").click(function(){USERITIN.clearForgotItinFields();USERITIN.submitForgotItinForm();});function resetForm(a){a.find("input:text, input:password, input:file, select, textarea").val("");a.find("input:radio, input:checkbox").removeAttr("checked").removeAttr("selected");}USERITIN.validateForm=function(){var f=0;var e="";var a=$("#view-itinerary-unregistered-form").find('input[name="find-itin-emailId"]');var d=$.trim(a.val());if(d==""){f++;$("#view-itin-unregistered-email-label").addClass("invalid");}else{a.value=$.trim(d);}var c=$("#view-itinerary-unregistered-form").find('input[name="find-itin-itinerary-number"]');var b=c.val().replace(/[^0-9]/g,"");if(b==""){f++;$("#view-itin-unregistered-number-label").addClass("invalid");}else{c.val(b);}if(f>0){$("#blank-unregistered-view-itin").removeClass("hidden");$("#blank-unregistered-view-itin").addClass("show");return false;}return true;};USERITIN.submitViewUnregisteredItinForm=function(){if(USERITIN.validateForm()==false){return false;}var c=$("#view-itinerary-unregistered-form").find('input[name="find-itin-itinerary-number"]');var b=$.trim(c.val());var e=b.substring(0,1);var f=(typeof"window.isTravelocity"=="undefined"||!window.isTravelocity);if(b.length<4||b.length>13||!$.isNumeric(b)||(f&&(e!="1"&&e!="7"))){$("#blank-unregistered-view-itin").removeClass("hidden");$("#blank-unregistered-view-itin").addClass("show");$("#view-itin-unregistered-email-label").addClass("invalid");$("#view-itin-unregistered-number-label").addClass("invalid");return false;}if($("#rightCaptchaEnabled").val()=="1"){var d=$.trim($("#recaptcha_challenge_field").val());var a=$.trim($("#recaptcha_response_field").val());if($.trim(a)==""){$("#blank_captcha_error").removeClass("initiallyhidden");return false;}$("#view-itinerary-unregistered-form").append($('<input type="hidden" name="challenge" value="'+d+'"/>'));$("#view-itinerary-unregistered-form").append($('<input type="hidden" name="response" value="'+a+'"/>'));}$("#view-itinerary-unregistered-form").submit();return true;};$("#view-itin-unregistered-submit-button").click(function(){USERITIN.hideLeftCaptcha();USERITIN.clearFields();USERITIN.submitViewUnregisteredItinForm();});USERITIN.submitViewRegisteredItinForm=function(){$("#blank-unregistered-view-itin").removeClass("show");$("#blank-unregistered-view-itin").addClass("hidden");$("#view-itin-unregistered-email-label").removeClass("invalid");$("#view-itin-unregistered-number-label").removeClass("invalid");$("#wrong-credentials-error-div").hide();$("#multiple-email-error-div").hide();$("#itin-error-div").hide();$("#registered-email-error").removeClass("show");$("#registered-email-error").addClass("hidden");$("#captcha_error").css("display","none");$("#blank_captcha_error").addClass("initiallyhidden");resetForm($("#view-itinerary-unregistered-form"));var f=0;var a=$("#view-itin-registered-signin-form").find('input[name="signin-loginid"]');
$("#view-itin-registered-signin-form").append($('<input type="hidden" name="tlLoginSubmitEvent" value="1"/>'));var d=a.val();if($.trim(d)==""){f++;$("#view-itin-registered-email-label").addClass("invalid");}else{a.value=$.trim(d);}var g=$("#view-itin-registered-signin-form").find('input[name="signin-password"]');var c=g.val();if($.trim(c)==""){f++;$("#view-itin-registered-password-label").addClass("invalid");}else{g.value=$.trim(c);}if(f>0){$(".blank-warning").show();return false;}$(".blank-warning").hide();if($("#leftCaptchaEnabled").val()=="1"){var e=$.trim($("#recaptcha_challenge_field").val());var b=$.trim($("#recaptcha_response_field").val());if($.trim(b)==""){$("#blank_captcha_error").removeClass("initiallyhidden");return false;}$("#view-itin-registered-signin-form").append($('<input type="hidden" name="challenge" value="'+e+'"/>'));$("#view-itin-registered-signin-form").append($('<input type="hidden" name="response" value="'+b+'"/>'));}$("#view-itin-registered-signin-form").submit();return true;};$("#registered-view-itin-submit-button").click(function(){USERITIN.hideRightCaptcha();USERITIN.submitViewRegisteredItinForm();});function submititinloginform(a){if(typeof a=="undefined"&&window.event){a=window.event;}if(a.keyCode==13){document.getElementById("registered-view-itin-submit-button").click();}}function submititinform(a){if(typeof a=="undefined"&&window.event){a=window.event;}if(a.keyCode==13){document.getElementById("view-itin-unregistered-submit-button").click();}}function isValidEmail(a){var c=/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;var b=/^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;if(c.test(a)){return true;}else{return false;}}
/*!  generated on 2014-06-05 16:51:00.332 PDT(-0700) in 0 ms  */

/*!  served in 0 ms  */
