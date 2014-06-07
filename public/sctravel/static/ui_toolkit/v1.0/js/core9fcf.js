
var uitk = (function($) {

	return {

        /*version number*/

        version: "v1.0",
        readyState: false,

		/* 	Common Functions */
			common: {
				init: function() {
					//call common init functions
					uitk.toggle.init();
					uitk.popups.init();
					uitk.onClickListener.init();
					uitk.tabs.init();
					//add other common methods here

                    uitk.readyState=true;
				}
			},
			onClickListener: {
				init: function() {
					//Listens on click events on elements that have data-onclick attrs then runs the value as a function
					$('body').delegate('*[data-onclick]','click', function(e){
						var $elemHref = $(this).attr('href');

                        if ($elemHref){
                            $elemHref = $elemHref.replace(window.location.href.split('#')[0], '');
                        }

						if($elemHref == '#' || $elemHref == '') {
							e.preventDefault();
						}
						return new Function($(this).data('onclick')).apply(this);
					});
				}
			},


			/* Toggles */
			toggle: {
				init: function() {
					//Universal toggle method
					$('.toggle').live('click',function(e){
						var $this = $(this),
								$myParent = $this.closest('.show, .hide'),
								runFunction = $this.attr('data-onclick'),
								toggleDir = $this.attr('data-toggle');
						//Check if toggle behavior is only one-time, i.e., expand only
						if(toggleDir == 'expand') {
							$this.removeClass('toggle');
							if($myParent.hasClass('show')){ return; }
						}
						if(runFunction === undefined) {
							$myParent.toggleClass('show').toggleClass('hide');
						}
					  return false;
					});
				},
				animateSlide: function(block,elem,nextElem) {
					var $this = $(elem),
                        $nextElem = $(nextElem) ? $(nextElem) : 'div',
                        $expandableContent = $(block).next($nextElem);
					$expandableContent.animate({height: 'toggle',opacity: 'toggle'}, 400, 'swing', function() {
						if(elem) {
							$this.toggleClass('expand').toggleClass('collapse');
						}
					});
				},

				udpUnfold: function(elem,toggleElem) {
					var childElem = $(toggleElem).children('.xsell-content'),
							childModules = $(childElem).find('.block');
					$(childElem).animate({
						height: $(childModules).outerHeight() * $(childModules).length + $(toggleElem).outerHeight() + 'px',
						opacity: '1'
					}, 400,'', function(){
						$(elem).addClass('btn-icn-proceed').removeClass('btn-icn-expand');
						$(toggleElem).removeClass('hide').addClass('show');
					});
					$(childModules).animate({top: 0}, 200);
				}

			},
			/* Tabs */
			tabs: {
				init: function(){
                    var tabElems = $("div.uitk-tabs > ul"),
                        initialTabIndex = tabElems.data('initialtabindex') ? tabElems.data('initialtabindex') : 0,
                        historyBool = tabElems.length <= 1;
                    if (tabElems.length > 0) {
                        tabElems.tabs(".panes > div", { history: historyBool, initialIndex: parseInt(initialTabIndex) });
                    }
				}//end init
			},//end tabs


			/* Sort Bar */
			sortbar: {
				init: function() {
					$("div.uitk-sort-bar a").click(function(e) {
						e.preventDefault();
						$(this).parents("ul").find("a").removeClass("current");
						$(this).addClass("current");
					});
				}//end init
			},//end sortbar


			/* Popups */
			popups: {
				init: function() {

                    var qtipDismiss = function(){
                        var qTips = $('.qtip:visible'),
                            modal = qTips.filter('.ui-tooltip-modal');

                        if(modal.length > 0 && modal.qtip().options.show.modal.escape){
                            modal.find('.btn-close').click();
                        }

                        qTips.filter(':not(.ui-tooltip-modal)').find('.btn-close').click();
                    };

                    //qtip settings
                    $.fn.qtip.zindex = 17000;

                    //close all qtips on esc
                    $(document).bind('keydown.modal', function(e) {
                        if (e.keyCode === 27) {
                            qtipDismiss();
                        }
                    });

                    //close all tooltips on clicking the background
                    $('body').delegate('#qtip-overlay', 'click', function(event){
                        qtipDismiss();
                    });



					// Stop our tooltip/modal close button from scrolling document
					$('.btn-close, .uitk-popups').live('click',function(e){e.preventDefault();});

					/* Standard Tooltips */
					$('body').delegate('.tip','click', function(event){

						//disable link action
						event.preventDefault();
						var tContent = '#' + $(this).attr('href').split('#')[1],
                            $target = $(this).closest('.tip'),
                            qtipObj = {
                                content: {
                                    text: $(tContent).attr('tabindex','-1').addClass('js-focus')
                                },
                                hide: { event: 'unfocus', fixed: true }
                            };

                        //if tooltip is inside a model
                        if ($target.closest('.ui-tooltip-modal').length > 0){
                            qtipObj.show = $.extend({}, uitk.popups.tooltipShared.show, {solo:false});
                            qtipObj.content.text = $(tContent).clone().attr('tabindex','-1').attr('id','').addClass('js-focus');
                        }

                        $(this).qtip($.extend({}, uitk.popups.tooltipShared, qtipObj), event);
					});

					/* Hover Tooltips */
					$('body').delegate('.hover-tip','mouseenter focus', function(event){
						//disable link action
						event.preventDefault();

						var tContent = '#' + $(this).attr('href').split('#')[1];
							$(this).qtip($.extend({}, uitk.popups.tooltipShared, {
									content: {
                                        text: $(tContent).attr('tabindex','-1').addClass('js-focus')
                                    },
									hide: { event: 'mouseleave blur', fixed: true }
							}), event);
					});

					//Urgency Message Bubbles
					$('body').delegate('.msg-bubble', 'mouseenter focus click', function(event){
            event.preventDefault();
            if(event.type!='click'){
                $(this).qtip($.extend({}, uitk.popups.tooltipShared, {
                    hide: { event: 'mouseleave blur', fixed: true}
                }), event)
                .each(function(i) {

                });
            }
					});

					$('body').delegate('.m-trigger','click', function(event){
						event.preventDefault();
						var tContent = '#' + $(this).attr('href').split('#')[1];
								//Setup our dialog function

						//invoke the modal
						$(this).qtip($.extend({}, uitk.popups.modalShared, {
                            content: {
                                text: $(tContent)
                            }
                        }), event);
					});

				},//end init

				displayInterstitialModal: function(interstitialId,formId,stealfocus)
				{
					var options;

                    if (stealfocus === false){
                        stealfocus = false;
                    }else{
                        stealfocus = true;
                    }

					//Submit form
					$(formId).submit();


                    options = $.extend({}, uitk.popups.modalShared, {
                        style: {classes: 'ui-tooltip-306 ui-tooltip-rounded'},
                        content: {
                            text: $(interstitialId).attr('tabindex','-1').addClass('js-focus')
                        },
                        show: {ready: true,delay: 0,effect: true, modal: {on: true, blur: false, stealfocus: stealfocus }},
                        position: { target: $(window), viewport: $(window), my: 'center center', at: 'center center', effect: true },
                        hide: false
                    });

					//Show Interstitial
					$(window).qtip(options);
				},

				showInlineNotification: function(interstitialId,showOverlay,dismissOverlay,modalSize,onExitCallback)
				{
					var sharedObject, modalClasses;
					if(showOverlay  == false) {
						sharedObject = uitk.popups.tooltipShared;
					}else{
						sharedObject = uitk.popups.modalShared;
						sharedObject.show.modal.blur = dismissOverlay;
						sharedObject.show.modal.escape = dismissOverlay;
					}
					//Set size of modal window
					if(!modalSize) {
						modalClasses = 'ui-tooltip-modal ui-tooltip-rounded ui-tooltip-xlg';
					}else{
						modalClasses = 'ui-tooltip-modal ui-tooltip-rounded ui-tooltip-' + modalSize;
					}

					//Mess with Object
					sharedObject.show.event = false;
					sharedObject.style.tip = false;
					//Show Interstitial
					$(window).qtip($.extend({}, sharedObject, {
						id: 'inlineNotification',
						style: {classes: modalClasses},
						content: {
							text: $(interstitialId).attr('tabindex','-1').addClass('js-focus')
						},
						position: { target: $(window), viewport: $(window), my: 'center center', at: 'center center', effect: true },
						hide: {event: false},
						events: {
							//hide tooltip when any links are clicked
							render: function(event,api){
								$('a', api.elements.content).click(api.hide);
							},
							hide: function(event,api) {
								if(!onExitCallback) {
									return;
								}
								new Function(onExitCallback).apply();
							}
						}
					}));

				},
				hideInlineNotification: function(callback)
				{
					$('[id^="ui-tooltip"]').qtip('toggle', false);
				},

				/* Shared Tooltip Object */
				tooltipShared: {
					overwrite: true,
				 	metadata: { type: 'html5', name: 'qtopts'},
					position: { viewport: $(window), my: 'top right', at: 'bottom right', adjust: { x: -32, y: 0 }, effect: true },
				 	show: { event: 'click', solo: true, ready: true, effect: true, delay: 0},
					style: { tip: { method: 'polygon', corner: true, mimic: 'center', width: 20, height: 10, offset: 3, border: true}, classes: 'ui-tooltip-med ui-tooltip-rounded'},
					events: {
						//hide tooltip when any links are clicked
						render: function(event,api){
							$('a:not(.tip)', api.elements.content).click(api.hide);
						}
					}
				},
				/* Shared Modal Object */
				modalShared: {
					//shared modal settings
					id: 'modal',
					overwrite: true,
				 	metadata: { type: 'html5', name: 'qtopts'},
					position: { viewport: $(window), target: $(window), my: 'center', at: 'center', effect: true },
				 	hide: false,
					style: { tip: {}},
					show: { event: 'click', solo: true, ready: true, effect: true, modal: {on: true, blur: false, escape: false}},
					events: {
						//hide tooltip when any links are clicked
						render: function(event,api){
							$('a:not(.tip)', api.elements.content).click(function(){
                                if ($(this).closest('.ui-tooltip-modal').length > 0){
                                    api.elements.tooltip.qtip('hide');
                                }
                            });
						}
					}
				},
				/* Shared Notification/Interstitial Object */
				notificationShared : {
					id: false,
					overwrite: true,
					metadata: { type: 'html5', name: 'qtopts'},
					position: { viewport: $(window), target: $(window), my: 'center', at: 'center', effect: true },
				 	hide: false,
					style: { tip: false, classes: 'ui-tooltip-xlg ui-tooltip-rounded'},
					show: {event: false, solo: true, ready: true, effect: true, delay: 0}
				}
			}//end popups
		}//end UI Toolkit
	}
)(jQuery);