
// Authentication Toolkit
if(typeof authtk === 'undefined'){
    var authtk = (function() {

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

            init: function(successCallback) {
                successCallback();
            },

            util: {

                createXMLHttpRequest: function() {
                    try { return new XMLHttpRequest(); } catch(e) {}
                    try { return new ActiveXObject("Msxml2.XMLHTTP"); } catch (e) {}
                    return null;
                },

                call: function(action, data, successCallback, errorCallback) {
                    var xhReq = authtk.util.createXMLHttpRequest();
                    if (xhReq == null) {
                        errorCallback({ status: "No XMLHttpRequest" });
                        return;
                    }

                    var authUrl = 'https://' + window.location.hostname + '/api/auth/' + action;
                    xhReq.open("POST", authUrl, true);
                    xhReq.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

                    xhReq.onreadystatechange = function() {
                        if (xhReq.readyState != 4) {
                            return;
                        }

                        if (xhReq.status == 200) {
                            var jsonResponse = authtk.util.parseJSON(xhReq.responseText);
                            if (jsonResponse && jsonResponse.status == 'success') {
                                successCallback(jsonResponse);
                            } else {
                                errorCallback(jsonResponse);
                            }
                        } else {
                            errorCallback({ status: 'http-error-code: ' + xhReq.status })
                        }
                    }

                    var form = authtk.util.serialize(data);

                    xhReq.send(form);

                    setTimeout(function() {
                            xhReq.abort();
                        }, 120000);
                },

                serialize: function(data) {
                    var fields = [];
                    for (fieldname in data) {
                        fields.push(encodeURIComponent(fieldname) + '=' + encodeURIComponent(data[fieldname]));
                    }
                    return fields.join('&').replace(/%20/g, '+');
                },

                parseJSON: function(data) {
                    data = data.replace(/^[\s\xA0]+/, '').replace(/[\s\xA0]+$/, '');
                    if ( window.JSON && window.JSON.parse ) {
                        return window.JSON.parse( data );
                    }

                    rvalidchars = /^[\],:{}\s]*$/;
                    rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
                    rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
                    rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g;

                    if ( rvalidchars.test( data.replace( rvalidescape, "@" )
                        .replace( rvalidtokens, "]" )
                        .replace( rvalidbraces, "")) ) {

                        return (new Function( "return " + data ))();
                    }

                    return null;
                }


            }, // end authtk.util

            autologin: function(data, successCallback, errorCallback) {
                authtk.util.call('autologin',
                    data,
                    successCallback,
                    errorCallback
                );
            },

            framedAutologin: function(data) {
                var alFrame = document.getElementById('autoLoginFrame');
                if (alFrame == null) {
                    alFrame = document.createElement('iframe');
                    alFrame.setAttribute('id', 'autoLoginFrame');
                    alFrame.setAttribute('marginWidth', '0');
                    alFrame.setAttribute('marginHeight', '0');
                    alFrame.setAttribute('frameBorder', '0');
                    alFrame.setAttribute('scrolling', 'no');
                    alFrame.style.cssText = 'display:none !important; border:none; width:1px; height:1px; visibility:hidden';

                    var body = document.body || document.getElementsByTagName("body")[0];
                    body.appendChild(alFrame);
                }

                if (typeof data.successUrl === 'undefined' || data.successUrl === '') {
                    data.successUrl = window.top.location.href;
                }

                window.authtkAutologinCallback = data.callback;

                alFrame.src = 'https://' + document.domain + '/api/auth/framedAutologin#' + authtk.util.serialize(data);

                //Ominture tracking for AutoLogin
                try {
                    var img = document.createElement('img');
                    img.src = "https://oms.expedia.com/b/ss/"+getOmnitureReportSuite()+"/1/G.9p2--NS/randomnumber?[AQB]&ndh=1&ce=UTF-8&cdp=2&pageName=HTX_LOGIN&g="+window.top.location+"&events=event20&pe=lnk_o&pev2=Facebook%20Login%20Success [AQE]";
                } catch (e) {
                    // do nothing
                }
            },

            linkNewAccount: function(data, successCallback, errorCallback) {
                authtk.util.call('linkNewAccount',
                    data,
                    successCallback,
                    errorCallback
                );
            },

            linkExistingAccount: function(data, successCallback, errorCallback) {
                authtk.util.call('linkExistingAccount',
                    data,
                    successCallback,
                    errorCallback
                );
            },

            showConnectModal: function(options) {
                var topWin = window.top;
                var doc = topWin.document;
                var authtkUI = doc.getElementById('authtk-UI');
                if (authtkUI == null) {
                    authtkUI = doc.createElement('div');
                    var body = doc.body || doc.getElementsByTagName("body")[0];
                    body.appendChild(authtkUI);

                    var blanket = doc.createElement('div');
                    blanket.setAttribute('id', 'authtk-blanket');
                    blanket.style.cssText = 'display:none; position: absolute; top: 0px; left: 0px; height: 100%; width: 100%; background-color: #333; z-index: 5000; opacity: 0.7; filter:alpha(opacity=70);';
                    authtkUI.appendChild(blanket);

                    var modal = doc.createElement('div');
                    modal.setAttribute('id', 'authtk-modal');
                    modal.style.cssText = 'display:none; position: absolute; width: 590px; height:375px; top: 150px; left: 196px; z-index: 6000;';
                    authtkUI.appendChild(modal);

                    var modalIframe = doc.createElement('iframe');
                    modalIframe.setAttribute('id', 'authtk-iframe');
                    modalIframe.setAttribute('width', '100%');
                    modalIframe.setAttribute('height', '100%');
                    modalIframe.setAttribute('marginWidth', '0');
                    modalIframe.setAttribute('marginHeight', '0');
                    modalIframe.setAttribute('frameBorder', '0');
                    modalIframe.setAttribute('scrolling', 'no');
                    modalIframe.setAttribute('allowTransparency', 'true');
                    modalIframe.style.cssText = 'border:none; background-color: transparent !important; overflow: hidden;';
                    modal.appendChild(modalIframe);
                }

                topWin.scrollTo(0,0);
                
                var windowHeight = Math.max(
                   doc.body['scrollHeight'], doc.documentElement['scrollHeight'],
                   doc.body['offsetHeight'], doc.documentElement['offsetHeight']
                );
                var blanket = doc.getElementById('authtk-blanket');
                blanket.style.height = windowHeight + 'px';
                blanket.style.display = 'block';
                var modal = doc.getElementById('authtk-modal');
                modal.style.display = 'block';

                var frameUrl = 'https://' + doc.domain + '/api/auth/modal?provider=' + options.provider
                
                var referrerUrl = options.referrerUrl;
                if (typeof referrerUrl === 'undefined' || referrerUrl == '') {
                	referrerUrl = window.location.href;
                }
                var referrerEncoded = encodeURIComponent(referrerUrl);
                
                var successUrl = options.successUrl;
                if (typeof successUrl === 'undefined' || successUrl == '') {
                	successUrl = referrerUrl;
                }
                var successEncoded = encodeURIComponent(successUrl);
                
                if(3 + referrerEncoded.length + frameUrl.length  + 20 > 2000) {
                    referrerEncoded = encodeURIComponent('/');
                }
                if(successEncoded.length + referrerEncoded.length + frameUrl.length  + 20 > 2000) {
                    successEncoded = encodeURIComponent('/');
                }
                
                frameUrl += '&referrer=' + referrerEncoded + '&success=' + successEncoded;

                topWin.authtkModalCallback = options.callback;

                doc.getElementById('authtk-iframe').src = frameUrl;
            },

            hideConnectModal: function(modalDocument) {
                if (typeof modalDocument === 'undefined') {
                    return false;
                }
                var modal = modalDocument.getElementById('authtk-modal');
                if (typeof modal !== 'undefined' && modal !== null) {
                    modal.style.display = 'none';
                }
                var blanket = modalDocument.getElementById('authtk-blanket');
                if (typeof blanket !== 'undefined' && blanket !== null) {
                    blanket.style.display = 'none';
                }

                return typeof modal !== 'undefined' && typeof blanket !== 'undefined';
            }

        }// end Authentication Toolkit
    }
    )();
}