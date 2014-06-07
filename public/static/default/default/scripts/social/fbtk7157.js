
// Facebook Toolkit
if(typeof fbtk === 'undefined'){
    var fbtk = (function() {

        var mapLocaleToFacebookLocale = function(nonFacebookLocale) {
            localeMap = {
                "de_AT": "de_DE",
                "en_AU": "en_US",
                "en_CA": "en_US",
                "en_HK": "en_US",
                "en_IE": "en_GB",
                "en_IN": "en_GB",
                "en_MY": "en_US",
                "en_NZ": "en_US",
                "en_PH": "en_US",
                "en_SG": "en_US",
                "en_US": "en_US",
                "es_AR": "es_ES",
                "es_MX": "es_LA",
                "fr_BE": "fr_FR",
                "nl_BE": "nl_NL",
                "in_ID": "id_ID"
            }
            if (localeMap.hasOwnProperty(nonFacebookLocale)) {
                return localeMap[nonFacebookLocale];
            } else {
                return nonFacebookLocale;
            }
        }

        var getOmnitureReportSuite = function() {
            //omnitureLocaleMap will not work in development environments
            omnitureLocaleMap = {
                "expedia63": "expedia30007-711",
                "expedia64": "expedia30007-712",
                "expedia65": "expedia30009-314",
                "expedia66": "expedia30035-327",
                "expedia67": "expedia30036-392"
            }
            if (omnitureLocaleMap.hasOwnProperty(s_account)) {
                return omnitureLocaleMap[s_account];
            } else if (s_account != "undefined") {
                return s_account;
            } else {
                return "expedia0";
            }
        }

        return {

        	initSuccessCallbacks: [],
            fbLoading: false,
            fbAsyncCalled: false,
            
            init: function(locale, appId, successCallback) {
                if (fbtk.fbAsyncCalled) {
                    successCallback();
                    return;
                }

                fbtk.initSuccessCallbacks.push(successCallback);
                if (fbtk.fbLoading) {
                    return;
                }
                fbtk.fbLoading = true;

                var fbRoot = document.getElementById('fb-root');
                if (fbRoot == null) {
                    fbRoot = document.createElement('div');
                    fbRoot.setAttribute('id', 'fb-root');

                    var body = document.body || document.getElementsByTagName("body")[0];
                    var firstChild = body.firstChild;
                    while (firstChild != null && firstChild.nodeType != 1) {
                        firstChild = firstChild.nextSibling;
                    }
                    if (firstChild == null) {
                        body.appendChild(fbRoot);
                    } else {
                        firstChild.parentNode.insertBefore(fbRoot, firstChild);
                    }
                }

                window.fbAsyncInit = function() {
                    FB.init({
                        appId  : appId,
                        status : true,
                        cookie : true,
                        xfbml  : true,
                        oauth  : true,
                        channelUrl: window.location.protocol + '//' + window.location.hostname + '/static/fusion/v2.3/channel.html'
                    });

                    fbtk.fbAsyncCalled = true;
                    while (fbtk.initSuccessCallbacks.length > 0) {
                        var scb = fbtk.initSuccessCallbacks.pop();
                        scb();
                    }
                };

                (function(d){
                     var js, id = 'facebook-jssdk'; if (d.getElementById(id)) {return;}
                     js = d.createElement('script'); js.id = id; js.async = true;
                     js.src = window.location.protocol + '//connect.facebook.net/' + mapLocaleToFacebookLocale(locale) + '/all.js';
                     d.getElementsByTagName('head')[0].appendChild(js);
                }(document));
            },

            login: function(permissions, successCallback, errorCallback) {
                FB.login(function(response) {
                    if (response.status == 'connected' && response.authResponse) {
                        try {
                            var img = document.createElement('img');
                            img.src = "https://oms.expedia.com/b/ss/"+getOmnitureReportSuite()+"/1/G.9p2--NS/randomnumber?[AQB]&ndh=1&ce=UTF-8&cdp=2&pageName=HTX_LOGIN&g="+window.top.location+"&events=event19&pe=lnk_o&pev2=Facebook%20Login%20Success [AQE]";
                        } catch (e) {
                            // do nothing
                        }
                        successCallback(response);
                    } else if (typeof errorCallback === 'function') {
                        errorCallback(response);
                    }
                }, { scope: permissions });
            },

            checkConnection: function(connectedCallback, notConnectedCallback) {
                FB.getLoginStatus(function(response) {
                    if (response.status == 'connected' && response.authResponse) {
                        if (typeof connectedCallback === 'function') {
                            connectedCallback(response);
                        }
                    } else {
                        if (typeof notConnectedCallback === 'function') {
                            notConnectedCallback(response);
                        }
                    }
                });
            },

            logout: function(successCallback, errorCallback) {
                FB.logout(function(response) {
                    if (response.status == 'test') {
                        successCallback(response);
                    } else if (typeof errorCallback === 'function') {
                        errorCallback(response);
                    }
                });
            }

        }// end Facebook Toolkit
    }
    )();
}
