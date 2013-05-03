/**
*	@name							Elastic
*	@descripton						Elastic is jQuery plugin that grow and shrink your textareas automatically
*	@version						1.6.11
*	@requires						jQuery 1.2.6+
*
*	@author							Jan Jarfalk
*	@author-email					jan.jarfalk@unwrongest.com
*	@author-website					http://www.unwrongest.com
*
*	@licence						MIT License - http://www.opensource.org/licenses/mit-license.php
*/

(function($){ 
	jQuery.fn.extend({  
		elastic: function() {
		
			//	We will create a div clone of the textarea
			//	by copying these attributes from the textarea to the div.
			var mimics = [
				'paddingTop',
				'paddingRight',
				'paddingBottom',
				'paddingLeft',
				'fontSize',
				'lineHeight',
				'fontFamily',
				'width',
				'fontWeight',
				'border-top-width',
				'border-right-width',
				'border-bottom-width',
				'border-left-width',
				'borderTopStyle',
				'borderTopColor',
				'borderRightStyle',
				'borderRightColor',
				'borderBottomStyle',
				'borderBottomColor',
				'borderLeftStyle',
				'borderLeftColor'
				];
			
			return this.each( function() {

				// Elastic only works on textareas
				if ( this.type !== 'textarea' ) {
					return false;
				}
					
			var $textarea	= jQuery(this),
				$twin		= jQuery('<div />').css({
					'position'		: 'absolute',
					'display'		: 'none',
					'word-wrap'		: 'break-word',
					'white-space'	:'pre-wrap'
				}),
				lineHeight	= parseInt($textarea.css('line-height'),10) || parseInt($textarea.css('font-size'),'10'),
				minheight	= parseInt($textarea.css('height'),10) || lineHeight*3,
				maxheight	= parseInt($textarea.css('max-height'),10) || Number.MAX_VALUE,
				goalheight	= 0;
				
				// Opera returns max-height of -1 if not set
				if (maxheight < 0) { maxheight = Number.MAX_VALUE; }
					
				// Append the twin to the DOM
				// We are going to meassure the height of this, not the textarea.
				$twin.appendTo($textarea.parent());
				
				// Copy the essential styles (mimics) from the textarea to the twin
				var i = mimics.length;
				while(i--){
					$twin.css(mimics[i].toString(),$textarea.css(mimics[i].toString()));
				}
				
				// Updates the width of the twin. (solution for textareas with widths in percent)
				function setTwinWidth(){
					var curatedWidth = Math.floor(parseInt($textarea.width(),10));
					if($twin.width() !== curatedWidth){
						$twin.css({'width': curatedWidth + 'px'});
						
						// Update height of textarea
						update(true);
					}
				}
				
				// Sets a given height and overflow state on the textarea
				function setHeightAndOverflow(height, overflow){
				
					var curratedHeight = Math.floor(parseInt(height,10));
					if($textarea.height() !== curratedHeight){
						$textarea.css({'height': curratedHeight + 'px','overflow':overflow});
					}
				}
				
				// This function will update the height of the textarea if necessary 
				function update(forced) {
					
					// Get curated content from the textarea.
					var textareaContent = $textarea.val().replace(/&/g,'&amp;').replace(/ {2}/g, '&nbsp;').replace(/<|>/g, '&gt;').replace(/\n/g, '<br />');
					
					// Compare curated content with curated twin.
					var twinContent = $twin.html().replace(/<br>/ig,'<br />');
					
					if(forced || textareaContent+'&nbsp;' !== twinContent){
					
						// Add an extra white space so new rows are added when you are at the end of a row.
						$twin.html(textareaContent+'&nbsp;');
						
						// Change textarea height if twin plus the height of one line differs more than 3 pixel from textarea height
						if(Math.abs($twin.height() + lineHeight - $textarea.height()) > 3){
							
							var goalheight = $twin.height()+lineHeight;
							if(goalheight >= maxheight) {
								setHeightAndOverflow(maxheight,'auto');
							} else if(goalheight <= minheight) {
								setHeightAndOverflow(minheight,'hidden');
							} else {
								setHeightAndOverflow(goalheight,'hidden');
							}
							
						}
						
					}
					
				}
				
				// Hide scrollbars
				$textarea.css({'overflow':'hidden'});
				
				// Update textarea size on keyup, change, cut and paste
				$textarea.bind('keyup change cut paste', function(){
					update(); 
				});
				
				// Update width of twin if browser or textarea is resized (solution for textareas with widths in percent)
				$(window).bind('resize', setTwinWidth);
				$textarea.bind('resize', setTwinWidth);
				$textarea.bind('update', update);
				
				// Compact textarea on blur
				$textarea.bind('blur',function(){
					if($twin.height() < maxheight){
						if($twin.height() > minheight) {
							$textarea.height($twin.height());
						} else {
							$textarea.height(minheight);
						}
					}
				});
				
				// And this line is to catch the browser paste event
				$textarea.bind('input paste',function(e){ setTimeout( update, 250); });				
				
				// Run update once when elastic is initialized
				update();
				
			});
			
        } 
    }); 
})(jQuery);;
(function($){

	Drupal.eventWith = Drupal.eventWith || {
		tapBlockSave : function() {
			var atopBlock = $("#block-eventwith-alternative-time-and-place");
			var extractChanges = function(element) {
				var name = $('.choice-wrapper.selected input', element).attr('name');
				var changes = {};
				changes[name] = $('.choice-wrapper.selected input', element).val();
				return changes;
			}

			var options = extractChanges($('#time-alternative', atopBlock));
			options = $.extend(options, extractChanges($('#place-alternative', atopBlock)));
			options['nid'] = Drupal.settings.eventWith.eventNid;

			$.ajax({
				  type: 'POST',
				  url: Drupal.settings.eventWith.eventWithUpdateAtap,
				  data: options,
				  async: true,
			}).done(function( response ) {
				var result = $.parseJSON(response);
				if(!result) {
					return;
				}
				if(result.status) {
					// unbinding maybe ?
					$('.content', atopBlock).html(result.html);
					if (typeof Drupal.itemListWidget !== "undefined") {
						Drupal.itemListWidget.refreshGamification();
					}
				}
			});

			/*$.post(Drupal.settings.eventWith.eventWithUpdateAtap, options, function(data, textStatus, jqXHR){
				var result = $.parseJSON(data);
				if(!result) {
					return;
				}
				if(result.status) {
					// unbinding maybe ?
					$('.content', atopBlock).html(result.html);
				}
			});*/
		},
		trackConv: function(google_conversion_id, google_conversion_label) {
      var image = new Image(1,1);
      image.src = "http://www.googleadservices.com/pagead/conversion/"+ google_conversion_id +"/?label="+ google_conversion_label + "&guid=ON&script=0";
    }
	};
	$(document).ajaxComplete(function(event, xhr, settings){
		// reAttach flags to data tables new loaded content
		Drupal.behaviors.checkbox.attach();

		if (typeof Drupal.settings.datatables !== 'undefined') {
			$.each(Drupal.settings.datatables, function(key, value){
				if(key == '#items-list-table' || key == '#guests-list-table' || key == '#my-tab-todo-table') {
					return;
				}
				if(settings.url.indexOf(value.sAjaxSource) == 0) {
					// Flag links should be re-binded now. Calling everyone to handle it again
					Drupal.flagLink(key);
					$(key).trigger(key + "-ajax-refreshed");
					// Dosn't display an  empty table
					var response = $.parseJSON(xhr.responseText);
					if(response.aaData.length == 0) {
					   // Empty items. check if the table is
					   $(key).parents('.dataTables_wrapper').hide();
					}
					else {
					   $(key).parents('.dataTables_wrapper').show();
					}
				}
			});
		}
	});

	Drupal.behaviors.ewUserResetPass = {
		attach: function(context, settings) {
			$('.form-submit', '#user-pass').once('ewUserResetPass', function() {
				$(this).mousedown(function() {
					Drupal.ewNotification.showNotification(Drupal.t('Password reset instructions were mailed to ') + $('.form-item-name input', '#user-pass').val(), 4000);
				});
			});
		}
	}

	/**
	 * Top menu behaviors
	 */
	Drupal.behaviors.evTopMenu = {
			attach: function (context, settings) {
				$("#block-eventwith-eventwith-main-menu", context).once('evTopMenu', function () {
					$(".me-row", ".my-events-wrapper").click(function(e){
						window.location.href = $("a",this).attr("href");
					});
				});
				$("#block-eventwith-eventwith-user", context).once('evTopMenu', function () {
					/*$(".eub-top", this).hover(function(e){
					});*/
				});
			}

	}

	Drupal.behaviors.evComments = {
		attach: function (context, settings) {
			$("#block-comment-block-node-comments", context).once('evComments', function () {
				var form = $("#comment-form-wrapper", this);
				var title = $("h2.title", form);
				title.hide();
				var textarea = $("textarea", form);
				$(textarea).attr('title', title.text()).jLabel();

				var comments = $("#comment-wrapper");
				$('.username', comments).live('click', function(){
					return false;
				});
			});
		}
	}

	/**
	 * Popup behaviors
	 */
	Drupal.behaviors.evPopUp = {
		attach: function (context, settings) {
			$(".popup-wrapper", context).once('evPopUp', function () {
				$(".popup-close, .buttons .cancel", this).bind('click', function(){
					$(this).parents('.popup-wrapper').hide();
					$('#ew-overlay').hide();
				});
			});
		}
	}

	/**
	 * Feedback
	 */
	Drupal.behaviors.ewFeedback = {
		attach: function(context, settings) {
			$('#feedback_simple', context).once('ewFeedback', function() {
				$('a', this).click(function(e) {
					$('#ew-overlay').show();
					$('.popup-wrapper', '#block-eventwith-feedback-block').center().fadeIn();

					e.preventDefault();
					return false;
				});
			});

			$('#block-eventwith-feedback-block', context).once('ewFeedback', function() {
				$('textarea', this).elastic();
			});

			$('.send', '#block-eventwith-feedback-block').once('ewFeedback', function() {
				$(this).click(function() {
					$.ajax({
						url: '/ew/send/feedback',
						type: 'POST',
						data: {
							message: $('textarea', '#block-eventwith-feedback-block').val(),
							url: top.location.href,
						},
						dataType: 'JSON',
						success: function(data) {
							if (data.status == 'success') {
								$('.popup-close', '#block-eventwith-feedback-block').click();
								$('textarea', '#block-eventwith-feedback-block').val('');
								Drupal.ewNotification.showNotification(Drupal.t('Got it! Thanks for making EventWith even better.'), 3000);
							}
						},
					});
				});
			});
		}
	}

	/**
	 * Alternative and Time (Item list page)
	 */
	Drupal.behaviors.evATAP = {
		attach: function (context, settings) {
			$("#block-eventwith-alternative-time-and-place", context).once('evATAP', function () {
				var parent = this;
				// Handling event's image hover
				$('.field-name-field-image img', 'article').mouseenter(function() {
					$('.event-image-hover-link .event-image-hover', 'article').fadeIn();
				});
				$('.event-image-hover-link .event-image-hover', 'article').mouseleave(function() {
					$('.event-image-hover-link .event-image-hover', 'article').fadeOut();
				});


				// Handling Alternative place click
				$('.radio', '#place-alternative').live('click', function() {
					if (!$("input", this).is(':disabled') && !$(this).parent().hasClass('selected')) {
						$('.choice-wrapper', '#place-alternative').removeClass('selected');
						$(this).parent().addClass('selected');

						$('.choice-wrapper .ew-radio', '#place-alternative').removeClass('checked');
						$('.ew-radio', this).addClass('checked');

						$('input', '#place-alternative').attr('checked', false);
						$('input', this).attr('checked', true);

						$("#change-alternatives").css('visibility', 'visible');
					}
				});
				// Handling Alternative time click
				$('.radio', '#time-alternative').live('click', function() {
					if (!$("input", this).is(':disabled') && !$(this).parent().hasClass('selected')){
						$('.choice-wrapper', '#time-alternative').removeClass('selected');
						$(this).parent().addClass('selected');

						$('.choice-wrapper .ew-radio', '#time-alternative').removeClass('checked');
						$('.ew-radio', this).addClass('checked');

						$('input', '#time-alternative').attr('checked', false);
						$('input', this).attr('checked', true);

						$("#change-alternatives").css('visibility', 'visible');
					}
				});

				$('.choice-voters', '#place-alternative').live('mouseenter', function(e) {
					$('.voters-wrapper', '#place-alternative').fadeOut();
					var pos = $(e.target).position();
					var container = $(this).parent().children('.voters-wrapper');
					var moveTop = pos.top - container.height() - 12;
					var moveLeft = pos.left - ((container.width() / 2) - ($(this).width() / 2) - 3);

					container.css({
						top: moveTop,
						left: moveLeft
					});

					var tipMoveRight = (container.width() / 2) - ($('.tip', container).width() / 2);

					$('.tip', container).css('right',  tipMoveRight + 'px');

					container.fadeIn();

				});
				$('.choice-voters', '#place-alternative').live('mouseleave', function() {
					$(this).parent().children('.voters-wrapper').fadeOut();
				});
				$('.choice-voters', '#time-alternative').live('mouseenter', function(e) {
					$('.voters-wrapper', '#time-alternative').fadeOut();
					var pos = $(e.target).position();
					var container = $(this).parent().children('.voters-wrapper');
					var moveTop = pos.top - container.height() - 12;
					var moveLeft = pos.left - ((container.width() / 2) - ($(this).width() / 2) - 3);

					container.css({
						top: moveTop,
						left: moveLeft
					});

					var tipMoveRight = (container.width() / 2) - ($('.tip', container).width() / 2);

					$('.tip', container).css('right',  tipMoveRight + 'px');

					container.fadeIn();

				});
				$('.choice-voters', '#time-alternative').live('mouseleave', function() {
					$(this).parent().children('.voters-wrapper').fadeOut();
				});


				//click
				$('#change-alternatives', this).live('click', function(){
					Drupal.eventWith.tapBlockSave();
				});

			});
		}
	}

	/**
	 * $.unserialize
	 *
	 * Takes a string in format "param1=value1&param2=value2" and returns an object { param1: 'value1', param2: 'value2' }. If the "param1" ends with "[]" the param is treated as an array.
	 *
	 * Example:
	 *
	 * Input:  param1=value1&param2=value2
	 * Return: { param1 : value1, param2: value2 }
	 *
	 * Input:  param1[]=value1&param1[]=value2
	 * Return: { param1: [ value1, value2 ] }
	 *
	 * @todo Support params like "param1[name]=value1" (should return { param1: { name: value1 } })
	 */
	$.unserialize = function(serializedString){
		var str = decodeURI(serializedString);
		var pairs = str.split('&');
		var obj = {}, p, idx, val;
		for (var i=0, n=pairs.length; i < n; i++) {
			p = pairs[i].split('=');
			idx = p[0];

			if (idx.indexOf("[]") == (idx.length - 2)) {
				// Eh um vetor
				var ind = idx.substring(0, idx.length-2)
				if (obj[ind] === undefined) {
					obj[ind] = [];
				}
				obj[ind].push(p[1]);
			}
			else {
				obj[idx] = p[1];
			}
		}
		return obj;
	};

	if (!(typeof $.fn.dataTableExt == 'undefined' || typeof $.fn.dataTableExt.oApi == 'undefined')) {
		$.fn.dataTableExt.oApi.fnReloadAjax = function ( oSettings, sNewSource, fnCallback, bStandingRedraw )
		{
		    if ( typeof sNewSource != 'undefined' && sNewSource != null )
		    {
		        oSettings.sAjaxSource = sNewSource;
		    }
		    this.oApi._fnProcessingDisplay( oSettings, true );
		    var that = this;
		    var iStart = oSettings._iDisplayStart;
		    var aData = [];

		    this.oApi._fnServerParams( oSettings, aData );

		    oSettings.fnServerData( oSettings.sAjaxSource, aData, function(json) {
		        /* Clear the old information from the table */
		        that.oApi._fnClearTable( oSettings );

		        /* Got the data - add it to the table */
		        var aData =  (oSettings.sAjaxDataProp !== "") ?
		            that.oApi._fnGetObjectDataFn( oSettings.sAjaxDataProp )( json ) : json;

		        for ( var i=0 ; i<aData.length ; i++ ) {
		            that.oApi._fnAddData( oSettings, aData[i] );
		        }

		        oSettings.aiDisplay = oSettings.aiDisplayMaster.slice();
		        that.fnDraw();

		        if ( typeof bStandingRedraw != 'undefined' && bStandingRedraw === true ) {
		            oSettings._iDisplayStart = iStart;
		            that.fnDraw( false );
		        }

		        that.oApi._fnProcessingDisplay( oSettings, false );

		        /* Callback user function - for event handlers etc */
		        if ( typeof fnCallback == 'function' && fnCallback != null )
		        {
		            fnCallback( oSettings );
		        }
		    }, oSettings );
		};

	}
})(jQuery);
;
(function($) { 

Drupal.ewNotification = Drupal.ewNotification || {
  wrapperID: '#block-eventwith-notifications-notif-block',
  isActive: false,
  defaults: {
    ttl: 4000,
  },
  setMessage: function(message, isShowing) {
    isShowing = typeof isShowing !== "undefined" ? isShowing : false;

    if (!isShowing) {
      $('.notification-content', Drupal.ewNotification.wrapperID).fadeOut(500, function() {
        $(this).html(message).fadeIn(500);
      });
    }
    else {
      $('.notification-content', Drupal.ewNotification.wrapperID).html(message);
    }
  },
  getMessage: function() {
    return $('.notification-content', Drupal.ewNotification.wrapperID).html();
  },
  showNotification: function(message, ttl, callback) {
    if (Drupal.ewNotification.isActive != true) {
      Drupal.ewNotification.isActive = true;

      if (typeof message !== 'undefined') {
        Drupal.ewNotification.setMessage(message, true);
      }

      ttl = typeof ttl !== 'undefined' ? ttl : Drupal.ewNotification.defaults.ttl;

      $(Drupal.ewNotification.wrapperID).css('top', '-87px');
      $(Drupal.ewNotification.wrapperID).center('horizontal');
      $(Drupal.ewNotification.wrapperID).css('position', 'fixed');
      $(Drupal.ewNotification.wrapperID).show();
      $(Drupal.ewNotification.wrapperID).animate({
        top: '+=80',
      }, 600, 'easeOutBack', function() {
        window.setTimeout(function() {
          Drupal.ewNotification.hideNotification();

          if (typeof callback !== "undefined") {
            callback();
          }
        }, ttl);
      });
    }
  },
  hideNotification: function() {
    $(Drupal.ewNotification.wrapperID).animate({
      top: '-=80',
    }, 600, 'easeInBack', function() {
      $(Drupal.ewNotification.wrapperID).hide();
      Drupal.ewNotification.isActive = false;
    });
  },
};

Drupal.behaviors.ewNotification = {
  attach: function(context, settings) {
    $(Drupal.ewNotification.wrapperID, context).once('ewNotification', function() {
      $('.popup-close', this).click(function() {
        Drupal.ewNotification.hideNotification();
      });
    });
  },
};

Drupal.behaviors.ewNotification = {
  attach: function(context, settings) {
	if(Drupal.settings.eventwithNotifications && Drupal.settings.eventwithNotifications.messages) {
		Drupal.ewNotification.showNotification(Drupal.settings.eventwithNotifications.messages, 2000);
	}
  }
};

})(jQuery);;
