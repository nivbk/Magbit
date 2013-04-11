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
/**
 * @file
 * Provides JavaScript additions to the managed file field type.
 *
 * This file provides progress bar support (if available), popup windows for
 * file previews, and disabling of other file fields during Ajax uploads (which
 * prevents separate file fields from accidentally uploading files).
 */

(function ($) {

/**
 * Attach behaviors to managed file element upload fields.
 */
Drupal.behaviors.fileValidateAutoAttach = {
  attach: function (context, settings) {
    if (settings.file && settings.file.elements) {
      $.each(settings.file.elements, function(selector) {
        var extensions = settings.file.elements[selector];
        $(selector, context).bind('change', {extensions: extensions}, Drupal.file.validateExtension);
      });
    }
  },
  detach: function (context, settings) {
    if (settings.file && settings.file.elements) {
      $.each(settings.file.elements, function(selector) {
        $(selector, context).unbind('change', Drupal.file.validateExtension);
      });
    }
  }
};

/**
 * Attach behaviors to the file upload and remove buttons.
 */
Drupal.behaviors.fileButtons = {
  attach: function (context) {
    $('input.form-submit', context).bind('mousedown', Drupal.file.disableFields);
    $('div.form-managed-file input.form-submit', context).bind('mousedown', Drupal.file.progressBar);
  },
  detach: function (context) {
    $('input.form-submit', context).unbind('mousedown', Drupal.file.disableFields);
    $('div.form-managed-file input.form-submit', context).unbind('mousedown', Drupal.file.progressBar);
  }
};

/**
 * Attach behaviors to links within managed file elements.
 */
Drupal.behaviors.filePreviewLinks = {
  attach: function (context) {
    $('div.form-managed-file .file a, .file-widget .file a', context).bind('click',Drupal.file.openInNewWindow);
  },
  detach: function (context){
    $('div.form-managed-file .file a, .file-widget .file a', context).unbind('click', Drupal.file.openInNewWindow);
  }
};

/**
 * File upload utility functions.
 */
Drupal.file = Drupal.file || {
  /**
   * Client-side file input validation of file extensions.
   */
  validateExtension: function (event) {
    // Remove any previous errors.
    $('.file-upload-js-error').remove();

    // Add client side validation for the input[type=file].
    var extensionPattern = event.data.extensions.replace(/,\s*/g, '|');
    if (extensionPattern.length > 1 && this.value.length > 0) {
      var acceptableMatch = new RegExp('\\.(' + extensionPattern + ')$', 'gi');
      if (!acceptableMatch.test(this.value)) {
        var error = Drupal.t("The selected file %filename cannot be uploaded. Only files with the following extensions are allowed: %extensions.", {
          // According to the specifications of HTML5, a file upload control
          // should not reveal the real local path to the file that a user
          // has selected. Some web browsers implement this restriction by
          // replacing the local path with "C:\fakepath\", which can cause
          // confusion by leaving the user thinking perhaps Drupal could not
          // find the file because it messed up the file path. To avoid this
          // confusion, therefore, we strip out the bogus fakepath string.
          '%filename': this.value.replace('C:\\fakepath\\', ''),
          '%extensions': extensionPattern.replace(/\|/g, ', ')
        });
        $(this).closest('div.form-managed-file').prepend('<div class="messages error file-upload-js-error">' + error + '</div>');
        this.value = '';
        return false;
      }
    }
  },
  /**
   * Prevent file uploads when using buttons not intended to upload.
   */
  disableFields: function (event){
    var clickedButton = this;

    // Only disable upload fields for Ajax buttons.
    if (!$(clickedButton).hasClass('ajax-processed')) {
      return;
    }

    // Check if we're working with an "Upload" button.
    var $enabledFields = [];
    if ($(this).closest('div.form-managed-file').length > 0) {
      $enabledFields = $(this).closest('div.form-managed-file').find('input.form-file');
    }

    // Temporarily disable upload fields other than the one we're currently
    // working with. Filter out fields that are already disabled so that they
    // do not get enabled when we re-enable these fields at the end of behavior
    // processing. Re-enable in a setTimeout set to a relatively short amount
    // of time (1 second). All the other mousedown handlers (like Drupal's Ajax
    // behaviors) are excuted before any timeout functions are called, so we
    // don't have to worry about the fields being re-enabled too soon.
    // @todo If the previous sentence is true, why not set the timeout to 0?
    var $fieldsToTemporarilyDisable = $('div.form-managed-file input.form-file').not($enabledFields).not(':disabled');
    $fieldsToTemporarilyDisable.attr('disabled', 'disabled');
    setTimeout(function (){
      $fieldsToTemporarilyDisable.attr('disabled', false);
    }, 1000);
  },
  /**
   * Add progress bar support if possible.
   */
  progressBar: function (event) {
    var clickedButton = this;
    var $progressId = $(clickedButton).closest('div.form-managed-file').find('input.file-progress');
    if ($progressId.length) {
      var originalName = $progressId.attr('name');

      // Replace the name with the required identifier.
      $progressId.attr('name', originalName.match(/APC_UPLOAD_PROGRESS|UPLOAD_IDENTIFIER/)[0]);

      // Restore the original name after the upload begins.
      setTimeout(function () {
        $progressId.attr('name', originalName);
      }, 1000);
    }
    // Show the progress bar if the upload takes longer than half a second.
    setTimeout(function () {
      $(clickedButton).closest('div.form-managed-file').find('div.ajax-progress-bar').slideDown();
    }, 500);
  },
  /**
   * Open links to files within forms in a new window.
   */
  openInNewWindow: function (event) {
    $(this).attr('target', '_blank');
    window.open(this.href, 'filePreview', 'toolbar=0,scrollbars=1,location=1,statusbar=1,menubar=0,resizable=1,width=500,height=550');
    return false;
  }
};

})(jQuery);
;
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
(function ($) {

Drupal.behaviors.textarea = {
  attach: function (context, settings) {
    $('.form-textarea-wrapper.resizable', context).once('textarea', function () {
      var staticOffset = null;
      var textarea = $(this).addClass('resizable-textarea').find('textarea');
      var grippie = $('<div class="grippie"></div>').mousedown(startDrag);

      grippie.insertAfter(textarea);

      function startDrag(e) {
        staticOffset = textarea.height() - e.pageY;
        textarea.css('opacity', 0.25);
        $(document).mousemove(performDrag).mouseup(endDrag);
        return false;
      }

      function performDrag(e) {
        textarea.height(Math.max(32, staticOffset + e.pageY) + 'px');
        return false;
      }

      function endDrag(e) {
        $(document).unbind('mousemove', performDrag).unbind('mouseup', endDrag);
        textarea.css('opacity', 1);
      }
    });
  }
};

})(jQuery);
;
(function ($) {

/**
 * Behavior to disable the "unflag" option if "flag" is not available.
 */
Drupal.behaviors.flagRoles = {};
Drupal.behaviors.flagRoles.attach = function(context) {
  $('#flag-roles input.flag-access', context).change(function() {
    var unflagCheckbox = $(this).parents('tr:first').find('input.unflag-access').get(0);
    if (this.checked) {
      // If "flag" is available, restore the state of the "unflag" checkbox.
      unflagCheckbox.disabled = false;
      if (typeof(unflagCheckbox.previousFlagState) != 'undefined') {
        unflagCheckbox.checked = unflagCheckbox.previousFlagState;
      }
      else {
        unflagCheckbox.checked = true;
      }
    }
    else {
      // Remember if the "unflag" option was checked or unchecked, then disable.
      unflagCheckbox.previousFlagState = unflagCheckbox.checked;
      unflagCheckbox.disabled = true;
      unflagCheckbox.checked = false;
    }
  });

  $('#flag-roles input.unflag-access', context).change(function() {
    if ($(this).parents('table:first').find('input.unflag-access:enabled:not(:checked)').size() == 0) {
      $('div.form-item-unflag-denied-text').slideUp();
    }
    else {
      $('div.form-item-unflag-denied-text').slideDown();
    }
  });

  // Hide the link options by default if needed.
  if ($('#flag-roles input.unflag-access:enabled:not(:checked)').size() == 0) {
    $('div.form-item-unflag-denied-text').css('display', 'none');
  }
};


/**
 * Behavior to make link options dependent on the link radio button.
 */
Drupal.behaviors.flagLinkOptions = {};
Drupal.behaviors.flagLinkOptions.attach = function(context) {
  $('.flag-link-options input.form-radio', context).change(function() {
    // Reveal only the fieldset whose ID is link-options-LINKTYPE,
    // where LINKTYPE is the value of the selected radio button.
    var radioButton = this;
    var $relevant   = $('fieldset#link-options-' + radioButton.value);
    var $irrelevant = $('fieldset[id^=link-options-]').not($relevant);

    $relevant.show();
    $irrelevant.hide();

    if ($relevant.size()) {
      $('#link-options-intro').show();
    }
    else {
      $('#link-options-intro').hide();
    }
  })
  // Hide the link options by default if needed.
  .filter(':checked').trigger('change');
};

/**
 * Vertical tabs integration.
 */
Drupal.behaviors.flagSummary = {};

Drupal.behaviors.flagSummary.attach = function (context) {
  $('fieldset.flag-fieldset', context).drupalSetSummary(function(context) {
    var flags = [];
    $('input:checkbox:checked', context).each(function() {
      flags.push(this.title);
    });

    if (flags.length) {
      return flags.join(', ');
    }
    else {
      return Drupal.t('No flags');
    }
  });
};

})(jQuery);
;
(function ($) {

/**
 * Attaches sticky table headers.
 */
Drupal.behaviors.tableHeader = {
  attach: function (context, settings) {
    if (!$.support.positionFixed) {
      return;
    }

    $('table.sticky-enabled', context).once('tableheader', function () {
      $(this).data("drupal-tableheader", new Drupal.tableHeader(this));
    });
  }
};

/**
 * Constructor for the tableHeader object. Provides sticky table headers.
 *
 * @param table
 *   DOM object for the table to add a sticky header to.
 */
Drupal.tableHeader = function (table) {
  var self = this;

  this.originalTable = $(table);
  this.originalHeader = $(table).children('thead');
  this.originalHeaderCells = this.originalHeader.find('> tr > th');
  this.displayWeight = null;

  // React to columns change to avoid making checks in the scroll callback.
  this.originalTable.bind('columnschange', function (e, display) {
    // This will force header size to be calculated on scroll.
    self.widthCalculated = (self.displayWeight !== null && self.displayWeight === display);
    self.displayWeight = display;
  });

  // Clone the table header so it inherits original jQuery properties. Hide
  // the table to avoid a flash of the header clone upon page load.
  this.stickyTable = $('<table class="sticky-header"/>')
    .insertBefore(this.originalTable)
    .css({ position: 'fixed', top: '0px' });
  this.stickyHeader = this.originalHeader.clone(true)
    .hide()
    .appendTo(this.stickyTable);
  this.stickyHeaderCells = this.stickyHeader.find('> tr > th');

  this.originalTable.addClass('sticky-table');
  $(window)
    .bind('scroll.drupal-tableheader', $.proxy(this, 'eventhandlerRecalculateStickyHeader'))
    .bind('resize.drupal-tableheader', { calculateWidth: true }, $.proxy(this, 'eventhandlerRecalculateStickyHeader'))
    // Make sure the anchor being scrolled into view is not hidden beneath the
    // sticky table header. Adjust the scrollTop if it does.
    .bind('drupalDisplaceAnchor.drupal-tableheader', function () {
      window.scrollBy(0, -self.stickyTable.outerHeight());
    })
    // Make sure the element being focused is not hidden beneath the sticky
    // table header. Adjust the scrollTop if it does.
    .bind('drupalDisplaceFocus.drupal-tableheader', function (event) {
      if (self.stickyVisible && event.clientY < (self.stickyOffsetTop + self.stickyTable.outerHeight()) && event.$target.closest('sticky-header').length === 0) {
        window.scrollBy(0, -self.stickyTable.outerHeight());
      }
    })
    .triggerHandler('resize.drupal-tableheader');

  // We hid the header to avoid it showing up erroneously on page load;
  // we need to unhide it now so that it will show up when expected.
  this.stickyHeader.show();
};

/**
 * Event handler: recalculates position of the sticky table header.
 *
 * @param event
 *   Event being triggered.
 */
Drupal.tableHeader.prototype.eventhandlerRecalculateStickyHeader = function (event) {
  var self = this;
  var calculateWidth = event.data && event.data.calculateWidth;

  // Reset top position of sticky table headers to the current top offset.
  this.stickyOffsetTop = Drupal.settings.tableHeaderOffset ? eval(Drupal.settings.tableHeaderOffset + '()') : 0;
  this.stickyTable.css('top', this.stickyOffsetTop + 'px');

  // Save positioning data.
  var viewHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
  if (calculateWidth || this.viewHeight !== viewHeight) {
    this.viewHeight = viewHeight;
    this.vPosition = this.originalTable.offset().top - 4 - this.stickyOffsetTop;
    this.hPosition = this.originalTable.offset().left;
    this.vLength = this.originalTable[0].clientHeight - 100;
    calculateWidth = true;
  }

  // Track horizontal positioning relative to the viewport and set visibility.
  var hScroll = document.documentElement.scrollLeft || document.body.scrollLeft;
  var vOffset = (document.documentElement.scrollTop || document.body.scrollTop) - this.vPosition;
  this.stickyVisible = vOffset > 0 && vOffset < this.vLength;
  this.stickyTable.css({ left: (-hScroll + this.hPosition) + 'px', visibility: this.stickyVisible ? 'visible' : 'hidden' });

  // Only perform expensive calculations if the sticky header is actually
  // visible or when forced.
  if (this.stickyVisible && (calculateWidth || !this.widthCalculated)) {
    this.widthCalculated = true;
    var $that = null;
    var $stickyCell = null;
    var display = null;
    var cellWidth = null;
    // Resize header and its cell widths.
    // Only apply width to visible table cells. This prevents the header from
    // displaying incorrectly when the sticky header is no longer visible.
    for (var i = 0, il = this.originalHeaderCells.length; i < il; i += 1) {
      $that = $(this.originalHeaderCells[i]);
      $stickyCell = this.stickyHeaderCells.eq($that.index());
      display = $that.css('display');
      if (display !== 'none') {
        cellWidth = $that.css('width');
        // Exception for IE7.
        if (cellWidth === 'auto') {
          cellWidth = $that[0].clientWidth + 'px';
        }
        $stickyCell.css({'width': cellWidth, 'display': display});
      }
      else {
        $stickyCell.css('display', 'none');
      }
    }
    this.stickyTable.css('width', this.originalTable.css('width'));
  }
};

})(jQuery);
;
(function($){$.fn.jLabel=function(c){var d=new Array();var e=$.extend({},$.fn.jLabel.defaults,c);return this.each(function(){$this=$(this);d.push(new state($this));$this.focus(function(){focus($(this))}).blur(function(){blur($(this))}).keyup(function(){keyup($(this))})});function state(b){this.equals=function(a){return a.attr('id')==this.input.attr('id')};this.input=b;this.label=getLabel(b);if(this.input.val()!='')this.label.hide()};function getState(a){var b;$.each(d,function(){if(this.equals(a)){b=this;return false}});return b};function getLabel(a){var b=$('label[for='+a.attr('id')+']');if(b.size()==0){b=$('<label>').attr('for',a.attr('id')).text(a.attr('title'))};a.before(b);b.css({'font-family':a.css('font-family'),'font-size':a.css('font-size'),'font-style':a.css('font-style'),'font-variant':a.css('font-variant'),'font-weight':a.css('font-weight'),'letter-spacing':a.css('letter-spacing'),'line-height':a.css('line-height'),'text-decoration':a.css('text-decoration'),'text-transform':a.css('text-transform'),'color':a.css('color'),'cursor':a.css('cursor'),'display':'inline-block'});b.mousedown(function(){return false}).css({'position':'relative','z-index':'100','margin-right':-b.width(),'left':e.xShift+parseInt(a.css("padding-left"))+'px','top':e.yShift+'px'});return b};function focus(a){if(a.val()==''){getState(a).label.stop().fadeTo(e.speed,e.opacity)}};function blur(a){if(a.val()==''){getState(a).label.stop().fadeTo(e.speed,1)}};function keyup(a){var b=getState(a).label;if(a.val()==''){b.stop().fadeTo(e.speed,e.opacity)}else{if(b.is(":visible"))b.stop().fadeTo(e.speed,0,function(){b.hide()})}}};$.fn.jLabel.defaults={speed:200,opacity:0.4,xShift:2,yShift:0}})(jQuery);;
(function($){
	$.fn.wiggle = function(method, options) {
		options = $.extend({
			wiggleDegrees: ['2','4','2','0','-2','-4','-2','0'],
			delay: 35,
			limit: null,
			randomStart: true,
			onWiggle: function(object) {},
			onWiggleStart: function(object) {},
			onWiggleStop: function(object) {}
		}, options);

		var methods = {
			wiggle: function(object, step){
				if(step === undefined) {
					step = options.randomStart ? Math.floor(Math.random()*options.wiggleDegrees.length) : 0;
				}

				if(!$(object).hasClass('wiggling')) {
					$(object).addClass('wiggling');
				}

				var degree = options.wiggleDegrees[step];
				$(object).css({
					'-webkit-transform': 'rotate('+degree+'deg)',
					'-moz-transform': 'rotate('+degree+'deg)',
					'-o-transform': 'rotate('+degree+'deg)',
					'-sand-transform': 'rotate('+degree+'deg)',
					'transform': 'rotate('+degree+'deg)'
				});

				if(step == (options.wiggleDegrees.length - 1)) {
					step = 0;
					if($(object).data('wiggles') === undefined) {
						$(object).data('wiggles', 1);
					} else {
						$(object).data('wiggles', $(object).data('wiggles') + 1);
					}
					options.onWiggle(object);
				}

				if(options.limit && $(object).data('wiggles') == options.limit) {
					return methods.stop(object);
				}

				object.timeout = setTimeout(function(){
					methods.wiggle(object, step+1);
				}, options.delay);
			},
			stop: function(object) {
				$(object).data('wiggles', 0);
				$(object).css({
					'-webkit-transform': 'rotate(0deg)',
					'-moz-transform': 'rotate(0deg)',
					'-o-transform': 'rotate(0deg)',
					'-sand-transform': 'rotate(0deg)',
					'transform': 'rotate(0deg)'
				});

				if($(object).hasClass('wiggling')) {
					$(object).removeClass('wiggling');
				}

				clearTimeout(object.timeout);

				object.timeout = null;

				options.onWiggleStop(object);
			},
			isWiggling: function(object) {
				return !object.timeout ? false : true;
			}
		};

		if(method == 'isWiggling' && this.length == 1) {
			return methods.isWiggling(this[0]);
		}

		this.each(function() {
			if((method == 'start' || method === undefined) && !this.timeout) {
				methods.wiggle(this);
				options.onWiggleStart(this);
			} else if (method == 'stop') {
				methods.stop(this);
			}
		});

		return this;
	}
})(jQuery);
;
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
(function($) {

  $(document).ready(function(){
    var location = "" + top.location;
    if (location.search(/#back/) != -1){
      top.location.replace('#');
      top.location.reload();
    }
  });

  Drupal.ewEditForm = Drupal.ewEditForm || {
    eventAction: 'create',
    saveData: function() {
      //var allEmpty = true;
      // Check that the title is empty
      /*if ($('#edit-title').val() == "" && $('#edit-field-description-und-0-value').val() == "") {
        // check that all the time rows are empty
        $('table.field-multiple-table tbody', '#edit-field-time').first().children('tr').each(function() {
          var startDate = $('.start-date-wrapper input.date', this).val();
          var startTime = $('.start-date-wrapper input.time', this).val();
          var endDate = $('.end-date-wrapper input.date', this).val();
          var endTime = $('.end-date-wrapper input.time', this).val();
          var allDay = $('.all-day-checkbox input', this).is(':checked');

          if ((startDate == '' && startTime == '' && endDate == '' && endTime == '' && !allDay)) {
            return true; // Like continue in PHP
          }
          else {
            allEmpty = false;
            return false; // Like break in PHP
          }
        });

        if (allEmpty) {
          // Check that all the place rows are empty
          $('table.field-multiple-table tbody', '#edit-field-place').first().children('tr').each(function() {
            var placeName = $('.field-name-field-place-name input', this).val();
            var placeAddress = $('.field-name-field-place-address input', this).val();

            if (placeName == '' && placeAddress == '') {
              return true; // Like continue in PHP
            }
            else {
              allEmpty = false;
              return false; // Like break in PHP
            }
          });
        }
      }
      else {
        allEmpty = false;
      }

      if (!allEmpty) {*/
        $('.event-fake-ajax-submit', '#event-node-form').mousedown();
      //}
    },
  };

  Drupal.behaviors.ewEditForm = {
    attach: function(context, settings) {
      $('#event-node-form').once('ewEditForm', function() {
        if ($('#edit-title').val() == '') {
          Drupal.ewEditForm.eventAction = 'create';
        }
        else {
          Drupal.ewEditForm.eventAction = 'update';
        }

        $('#edit-title').jLabel();
        $('#edit-field-description-und-0-value').jLabel();

        $('#edit-title').blur(function() {
          if ($(this).val() != '') {
            $(this).removeClass('error');
          }
        });
      });
    }
  };

  Drupal.behaviors.ewPicture = {
    attach: function(context, settings) {
      $('#edit-field-image').once('ewPicture', function() {

        // Auto submit the image upload button
        $('#edit-field-image-und-0-upload').live("change", function() {
          $('#edit-field-image-und-0-upload-button').mousedown();
        });

        $('.link-wrapper', '#edit-field-image').live('click', function() {
          $('.image-widget-data', '#edit-field-image').slideDown();
        });
      });
    }
  };

  /*

  Drupal.behaviors.ewPicture = {
    attach: function(context, settings) {
      $('#edit-field-image').once('ewPicture', function() {

        // Auto submit the image upload button
        $('#edit-field-image-und-0-upload').bind("change", function() {

          $('#edit-field-image-und-0-upload-button').mousedown();
        });

        $('.link-wrapper', '#edit-field-image').live('click', function() {
          if ($('#edit-field-image-und-0-remove-button').length == 0) {
            $('#edit-field-image-und-0-upload').click();
            $('.field-name-field-image img', '#edit-field-image').addClass('loading');
            $('.field-name-field-image', '#edit-field-image').append($('<div class="loader"></div>'));
          }
          else {
            $('#edit-field-image-und-0-remove-button').mousedown();
            var interval = window.setInterval(function() {
              if ($('#edit-field-image-und-0-upload').length != 0) {
                $('#edit-field-image-und-0-upload').click();
                window.clearInterval(interval);
              }
            }, 100);
          }
        });
      });
    }
  };

*/

  Drupal.behaviors.ewMedia = {
    attach: function(context, settings) {
      $('ul.plup-list', '#edit-field-images-und-plupload-container').once('ewMedia', function() {
        if ($('li', this).length == 0) {
          $('#node_event_form_group_additional').hide();
        }
      });
    }
  }

  Drupal.ewTime = {
    selectedField: null,
    selectedRow: null,
  };

  Drupal.behaviors.ewTime = {
    attach: function(context, settings) {
      $('tbody tr', '#edit-field-time').once('ewTime', function() {
        $('.date-padding .date', this).parent().append($('<div class="date-pic"></div>'));
        $('.date-padding .time', this).parent().append($('<div class="time-pic"></div>'));

        $('.date-padding .date-pic, .date-padding .time-pic', this).click(function() {
          $(this).parent().children('input').focus();
          $(this).parent().children('input').focus();
        });

        // Add a submit-icon next to the button
        if ($('.submit-icon', '#edit-field-time').length == 0) {
          $('.field-add-more-submit', '#edit-field-time').parent().prepend('<span class="submit-icon"></span>');

          $('.submit-icon', '#edit-field-time').live('click', function() {
            $(this).next().mousedown();
          });
        }

        // Setting up some missing class names
        // TODO: should do this on the theme functions
        $('.date-padding div:first-child input', this).addClass('date');
        $('.date-padding div:last-child input', this).addClass('time');

        $('.date-padding .date', this).change(function() {
          if ($(this).parents('.end-date-wrapper').length == 0) {
            $(this).parents('tr').first().find('.end-date-wrapper .date').val($(this).val());
          }

          if ($(this).parents('tr').first().find('.start-date-wrapper .date').val() != '' &&
            $(this).parents('tr').first().find('.start-date-wrapper .time').val() != '' &&
            $(this).parents('tr').first().find('.end-date-wrapper .date').val() != '' &&
            $(this).parents('tr').first().find('.end-date-wrapper .time').val() != '') {
            // Clear the error message
            if ($('#edit-field-time').find('.messages').length != 0) {
              $('#edit-field-time').find('.messages').remove();
            }

            Drupal.ewSubmit.validateTime();
          }
        });

        $('.date-padding .time', this).focus(function() {
          if ($(this).parents('.end-date-wrapper').length == 0) {
            Drupal.ewTime.selectedField = this;
          }
          else {
            Drupal.ewTime.selectedField = null;
            Drupal.ewTime.selectedRow = $(this).parents('tr').first();
          }
        });

        $('.ui-timepicker-container a').live('click', function() {
          var timeStr = $(this).text();
          var timeArr = timeStr.split(':');
          var hr = parseInt(timeArr[0]);

          var signArr = timeArr[1].match(/(AM|PM)/);
          var sign = signArr[0];
          var min = timeArr[1].replace(sign, '');

          if (Drupal.ewTime.selectedField != null) {
            hr++;
            if (hr > 12) {
              hr -= 12;
            }

            if (hr >= 12) {
              sign = (sign == 'PM' ? 'AM' : 'PM');
            }

            timeStr = hr + ':' + min + sign;

            $($(Drupal.ewTime.selectedField).parents('fieldset')[0]).find('.end-date-wrapper .time').val(timeStr);
          }
          else {
            // We have selected the end time
            // We need to check if the end time is after midnight
            var fromTimeStr = $(Drupal.ewTime.selectedRow).find('.start-date-wrapper .time').val();
            var fromTimeArr = fromTimeStr.split(':');
            var fromHr = parseInt(fromTimeArr[0]);
            var fromSignArr = fromTimeArr[1].match(/(AM|PM)/);
            var fromSign = fromSignArr[0];
            var fromMin = fromTimeArr[1].replace(fromSign, '');

            if (hr < fromHr || (hr == fromHr && min < fromMin)) {
              // if so we need to check that both the start date and end date are equal
              var startDate = $(Drupal.ewTime.selectedRow).find('.start-date-wrapper .date').val();
              var endDate = $(Drupal.ewTime.selectedRow).find('.end-date-wrapper .date').val();

              if (startDate == endDate) {
                // if so we need to change the end date to be one day ahead
                startDateArr = startDate.split('/');

                var date = new Date();
                date.setFullYear(startDateArr[2], startDateArr[0]-1, startDateArr[1]); // year, month (0-based), day
                date.setTime(date.getTime() + 86400000);

                $(Drupal.ewTime.selectedRow).find('.end-date-wrapper .date').val($.datepicker.formatDate("mm/dd/yy", date));
              }
            }
          }

          if ($(this).parents('tr').first().find('.start-date-wrapper .date').val() != '' &&
            $(this).parents('tr').first().find('.start-date-wrapper .time').val() != '' &&
            $(this).parents('tr').first().find('.end-date-wrapper .date').val() != '' &&
            $(this).parents('tr').first().find('.end-date-wrapper .time').val() != '') {
            // Clear the error message
            if ($('#edit-field-time').find('.messages').length != 0) {
              $('#edit-field-time').find('.messages').remove();
            }

            Drupal.ewSubmit.validateTime();
          }
        });
      });

    //$('.time')[0].readOnly=1;
    //$('.time')[2].readOnly=1;
    }
  };

  Drupal.behaviors.ewTimePicker = {
    attach: function(context, settings) {
      $('.ui-timepicker-container', context).once('ewTimePicker', function() {
      });
    }
  };

  /*Drupal.behaviors.ewTimeCheckBox = {
    attach: function(context, settings) {
      $('input[type="checkbox"]', '#edit-field-time').once('ewTimeCheckBox', function() {
        $(this).click(function(e) {

          if ($(this).parents('.date-repeat-checkbox').length > 0) {
            var pos = $(e.target).position();
            var container = $(this).parents('.form-wrapper').find('.popup-wrapper');

            var moveTop = pos.top + $(e.target).height() + parseInt($(e.target).parents('.date-repeat-checkbox').css('padding-top')) + 4;
            var moveLeft = pos.left - ((container.width() / 2) - ($(e.target).width() / 2) - 2);

            container.css({
              top: moveTop,
              left: moveLeft
            });
            container.toggle();
          }
        });
      });
    }
  };*/

  Drupal.behaviors.repeatPopUp = {
    attach: function(context) {
      var form = $('form#event-node-form');
      $('#edit-field-time-und-0-field-date-und-0-rrule-freq', form).selectbox({
        effect: "slide"
      });

      if (typeof $('.interval input.form-text', form) !== 'undefined') {
        $('.interval input.form-text', form).spinner({min: 1, max: 50, increment: 1});
      }
    }
  };

  Drupal.behaviors.ewAllDayCheckBox = {
    attach: function(context, settings) {
      $('.all-day-checkbox', '#edit-field-time').once('ewAllDayCheckBox', function() {        
        if ($('input', this).is(':checked') == true) {
          $($('input', this).parents('tr')[0]).find('input.time').not('.date').toggleDisabled();
          $($('input', this).parents('tr')[0]).find('input.time').not('.date').val('');
          $($('input', this).parents('tr')[0]).find('.time-pic').unbind();
          $($('input', this).parents('tr')[0]).find('.time-pic').css('cursor', 'default');
        }

        $('.form-type-checkbox .check-image, .form-type-checkbox label', this).live('click', function(e) {        
          $($(this).parents('tr')[0]).find('input.time').not('.date').toggleDisabled();
          $($(this).parents('tr')[0]).find('input.time').not('.date').val('');


          if ($('input', $(this).parent()).is(':checked')) {
            $($(this).parents('tr')[0]).find('.time-pic').unbind();
            $($(this).parents('tr')[0]).find('.time-pic').css('cursor', 'default');
          }
          else {
            $($(this).parents('tr')[0]).find('.time-pic').css('cursor', 'pointer');
            $($(this).parents('tr')[0]).find('.time-pic').click(function() {
              $(this).parent().children('input').focus();
              $(this).parent().children('input').focus();
            });
          }
        });
      });
    }
  };

  Drupal.behaviors.ewClearRow = {
    attach: function(context, settings) {
      $('.clear-row', '#edit-field-time').once('ewClearRow', function() {
        $(this).click(function(e) {
          $($(this).parents('tr')[0]).find('input.date').val('');
          $($(this).parents('tr')[0]).find('input.time').val('');

          e.preventDefault();
          return false;
        });
      });
    }
  };

  Drupal.behaviors.ewPlace = {
    attach: function(context, settings) {
      $('tr', '#edit-field-place').once('ewPlace', function() {
        // Add a submit-icon next to the button
        if ($('.submit-icon', '#edit-field-place').length == 0) {
          $('.field-add-more-submit', '#edit-field-place').parent().prepend('<span class="submit-icon"></span>');

          $('.submit-icon', '#edit-field-place').live('click', function() {
            $(this).next().mousedown();
          });
        }

        // Add a "show map" link after the address field
        $('<div class="show-map-link">' + Drupal.t('Show map') + '</div>').insertAfter($('.field-name-field-place-address', this));

        if ($('.field-name-field-place-address input', this).val() != '') {
          $('.field-name-field-place-address input', this).parents('tr').find('.show-map-link').show();
        }

        // Add a map holder under the row
        Drupal.ewGoogleMaps.prepareMapHolder(this);

        $('.field-name-field-place-address input', this).focus(function() {
          if ($(this).parents('tr').next('.map-holder').html() == '') {
            $('.show-map-link', '#edit-field-place').each(function(index, link) {
              $(link).text(Drupal.t('Show map'));
            });

            Drupal.ewGoogleMaps.hideMap();
          }
        });

        $('#edit-field-place-und-add-more').mousedown(function() {
          $('.show-map-link', '#edit-field-place').each(function(index, link) {
            $(link).text(Drupal.t('Show map'));
          });

          Drupal.ewGoogleMaps.hideMap();
        });

        $('.field-name-field-place-address input', this).keyup(function(e) {
          if ($(this).val().length >= 1) {
            $(this).parents('tr').find('.show-map-link').show();
          }
          else {
            $(this).parents('tr').find('.show-map-link').hide();
          }
        });

        $('.show-map-link', this).mouseup(function() {
          var trigger = true;
          if ($(this).text() == Drupal.t('Hide map')) {
            trigger = false;
          }

          $('.show-map-link', '#edit-field-place').each(function(index, link) {
            $(link).text(Drupal.t('Show map'));
          });

          if (trigger) {
            $(this).text(Drupal.t('Hide map'));
            var mapHolder = $(this).parents('tr').next('.map-holder');

            var address = $(this).parents('tr').find('.field-name-field-place-address input').val();
            Drupal.ewGoogleMaps.showMap($(this).parents('table').first(), $(this).parents('tr'), address);
          }
          else {
            Drupal.ewGoogleMaps.hideMap();
          }
        });
      });
    }
  };

  Drupal.behaviors.ewPlaceName = {
    attach: function(context, settings) {
      $('.field-name-field-place-name', '#edit-field-place').once('ewPlaceName', function() {
        $('input', this).attr('placeholder', 'Enter a name');
      });
    }
  };

  Drupal.behaviors.ewStages = {
    attach: function(context, settings) {
      $('#node_event_form_group_details', context).once('ewStages', function() {
        $(this).mouseenter(function() {
          $('#edit-field-stage1').css('background-position', '0 0');
        });
        $(this).mouseleave(function() {
          $('#edit-field-stage1').css('background-position', '0 -75px');
        });
      });
      $('#node_event_form_group_time', context).once('ewStages', function() {
        $(this).mouseenter(function() {
          $('#edit-field-stage2').css('background-position', '0 0');
        });
        $(this).mouseleave(function() {
          $('#edit-field-stage2').css('background-position', '0 -75px');
        });
      });
      $('#node_event_form_group_place', context).once('ewStages', function() {
        $(this).mouseenter(function() {
          $('#edit-field-stage3').css('background-position', '0 0');
        });
        $(this).mouseleave(function() {
          $('#edit-field-stage3').css('background-position', '0 -75px');
        });
      });
      $('#node_event_form_group_guests', context).once('ewStages', function() {
        $(this).mouseenter(function() {
          $('#edit-field-stage4').css('background-position', '0 0');
        });
        $(this).mouseleave(function() {
          $('#edit-field-stage4').css('background-position', '0 -75px');
        });
      });
    }
  }

  Drupal.ewSubmit = {
    activated: false,
    events: null,
    showValidationError: function(element, callback) {
      $('html, body').animate({
        scrollTop: $(element).offset().top - 60
      }, 800, function() {
        if (typeof callback !== 'undefined') {
          callback();
        }
      });
    },
    validateName: function() {
//console.log('validate name');
      if ($('#edit-title').val() == "") {
//console.log('name is empty');
        $('html, body').animate({
          scrollTop: $('#edit-title').offset().top - 60
        }, 800, function() {
          $('#edit-title').addClass('error');
          //$($('#edit-title')[0]).effect('highlight');
        });

        return false;
      }

      return true;
    },
    validateTime: function() {
//console.log('validate time');
      var validationError = false;
      var fieldWithError = null;
      var errorMessage = '';
      var atLeastOneRowHasData = false;

      // Clear the error message
      if ($('#edit-field-time').find('.messages').length != 0) {
        $('#edit-field-time').find('.messages').remove();
      }

      $('table.field-multiple-table tbody', '#edit-field-time').first().children('tr').each(function() {

        var startDate = $('.start-date-wrapper input.date', this).val();
        var startTime = $('.start-date-wrapper input.time', this).val();

        var endDate = $('.end-date-wrapper input.date', this).val();
        var endTime = $('.end-date-wrapper input.time', this).val();

        var allDay = $('.all-day-checkbox input', this).is(':checked');

        // Clear the error classes
        $('.start-date-wrapper input.date, .start-date-wrapper input.time, .end-date-wrapper input.date, .end-date-wrapper input.time, .all-day-checkbox input', this).removeClass('error');

        // If all of the fields are empty
        // Then there is no problem and this row is validated
        if ((startDate == '' && startTime == '' && endDate == '' && endTime == '' && !allDay)) {
          return true; // Like continue in PHP
        }
        else if (startDate != '' && startTime != '' && endDate != '' && endTime != '' && !allDay) {
          // If all of the fields are not empty
          // Check that the startDate is before the endDate
          endDate = endDate.split("/");
          endDate = new Date(endDate[2]+","+endDate[0]+","+endDate[1]);
          startDate = startDate.split("/");
          startDate = new Date(startDate[2]+","+startDate[0]+","+startDate[1]);

          if (endDate.getTime() < startDate.getTime()) {
//console.log('end date < start date');
            // Mark the relevant field as invalid
            fieldWithError = $('.start-date-wrapper input.date, .end-date-wrapper input.date', this);
            errorMessage = 'Start date must be before the end date.';

            validationError = true;
            return false;
          }
          else if (endDate.getTime() == startDate.getTime()) {

            var endTimeArr = endTime.split(':');
            var endHr = parseInt(endTimeArr[0]);
            var endSignArr = endTimeArr[1].match(/(am|pm)/i);
            var endSign = endSignArr[0];
            var endMin = parseInt(endTimeArr[1].replace(endSign, ''));
            endSign = endSign.toLowerCase();
            if (endSign == 'pm' && endHr != 12) {
              endHr += 12;
            }

            endTime = new Date(2000, 1, 1, endHr, endMin);

            var startTimeArr = startTime.split(':');
            var startHr = parseInt(startTimeArr[0]);
            var startSignArr = startTimeArr[1].match(/(am|pm)/i);
            var startSign = startSignArr[0];
            var startMin = parseInt(startTimeArr[1].replace(startSign, ''));
            startSign = startSign.toLowerCase();
            if (startSign == 'pm' && startHr != 12) {
              startHr += 12;
            }
            startTime = new Date(2000, 1, 1, startHr, startMin);

            // Check that the startDate is before the endDate
            if (endTime.getTime() <= startTime.getTime()) {
//console.log('end time < start time');
              // Mark the relevant field as invalid
              fieldWithError = $('.start-date-wrapper input.time, .end-date-wrapper input.time', this);
              errorMessage = 'Start time must be before the end time.';

              validationError = true;
              return false;
            }
          }
        }
        else if (startDate != '' && endDate != '' && allDay == true) {
          // If allDay is active and we have a startDate and endDate (we don't care about the startTime and endTime in this case)
          // Check that the startDate is before the endDate
          endDate = endDate.split("/");
          endDate = new Date(endDate[2]+","+endDate[0]+","+endDate[1]);
          startDate = startDate.split("/");
          startDate = new Date(startDate[2]+","+startDate[0]+","+startDate[1]);

          if (endDate < startDate) {
//console.log('end date < start date - allDay is marked');
            // Mark the relevant field as invalid
            fieldWithError = $('.start-date-wrapper input.date, .end-date-wrapper input.date', this);
            errorMessage = 'Start date must be before the end date.';

            validationError = true;
            return false;
          }
        }
        else {
          // Check for empty fields
          if (startDate == '') {
//console.log('start date is empty');
            fieldWithError = $('.start-date-wrapper input.date', this);
            errorMessage = 'You must enter a start date.';
          }
          else if (startTime == '') {
//console.log('start time is empty');
            fieldWithError = $('.start-date-wrapper input.time', this);
            errorMessage = 'You must enter a start time';
          }
          else if (endDate == '') {
//console.log('end date is empty');
            fieldWithError = $('.end-date-wrapper input.date', this);
            errorMessage = 'You must enter an end date';
          }
          else if (endTime == '') {
//console.log('end time is empty');
            fieldWithError = $('.end-date-wrapper input.time', this);
            errorMessage = 'You must enter an end time';
          }

          // Check for invalid structure/characters


          validationError = true;
          return false;
        }

        if (atLeastOneRowHasData == false) {
          atLeastOneRowHasData = true;
        }
      });

      if (!atLeastOneRowHasData && !validationError) {
//console.log('all of the time rows are empty');
        // Mark the relevant field as invalid
        fieldWithError = $('input', $('table.field-multiple-table tbody', '#edit-field-time').first().children('tr').first());
        errorMessage = 'You must enter date and time';
        validationError = true;
      }

      if (validationError) {
        // Mark the relevant field as invalid
        if (fieldWithError != null) {
          $(fieldWithError).addClass('error');
        }

        // Add a message
        if (errorMessage != '') {
          if ($('#edit-field-time').find('.messages').length == 0) {
            $('div', '#edit-field-time').first().prepend($('<div class="messages error">' + Drupal.t(errorMessage) + '</div>'));
          }
          else {
            $('div', '#edit-field-time').find('.messages').remove();
            $('div', '#edit-field-time').first().prepend($('<div class="messages error">' + Drupal.t(errorMessage) + '</div>'));
          }
        }

        // Scroll to the field
        Drupal.ewSubmit.showValidationError($('#edit-field-time'));
      }

      return !validationError;
    },
    validatePlace: function() {
//console.log('validate place');
      var validationError = false;
      var atLeastOneRowHasData = false;

      // Clear the error message
      if ($('#edit-field-place').find('.messages').length != 0) {
        $('#edit-field-place').find('.messages').remove();
      }

      $('table.field-multiple-table tbody', '#edit-field-place').first().children('tr').each(function() {

        var placeName = $('.field-name-field-place-name input', this).val();
        var placeAddress = $('.field-name-field-place-address input', this).val();

        // Clear the error classes
        $('.field-name-field-place-name input, .field-name-field-place-address input', this).removeClass('error');

        if (placeName == '' && placeAddress == '') {
          return true; // Like continue in PHP
        }
        else if (placeName == '' && placeAddress != '') {
          // check for address without a name
          // Mark the relevant field as invalid
//console.log('place name is empty');
          $('.field-name-field-place-name input', this).addClass('error');

          // Add a message
          if ($('#edit-field-place').find('.messages').length == 0) {
            $('div', '#edit-field-place').first().prepend($('<div class="messages error">' + Drupal.t('You must enter a place name.') + '</div>'));
          }

          // Scroll to the field
          Drupal.ewSubmit.showValidationError($('#edit-field-place'));

          validationError = true;
          return false; // Like break in PHP
        }

        if (atLeastOneRowHasData == false) {
          atLeastOneRowHasData = true;
        }
      });

      if (!atLeastOneRowHasData) {
//console.log('all the place rows are empty');
        // Mark the relevant field as invalid
        $('.field-name-field-place-name input', this).addClass('error');
        if ($('#edit-field-place').find('.messages').length == 0) {
          $('div', '#edit-field-place').first().prepend($('<div class="messages error">' + Drupal.t('You must enter a place name.') + '</div>'));
        }
        // Scroll to the field
        Drupal.ewSubmit.showValidationError($('#edit-field-place'));
        validationError = true;
      }

      return !validationError;
    },
    validateFriends: function() {
//console.log('validate friends');
      if (!Drupal.ewSubmit.activated && $(Drupal.ewGuests.saveFBInputID + ' input').val() == "" && $(Drupal.ewGuests.saveMailInputID + ' input').val() == "") {
        Drupal.ewSubmit.activated = true;
//console.log('empty invited guests/friends');
        $('html, body').animate({
          scrollTop: $('#node_event_form_group_guests').offset().top - 60
        }, 800, function() {
          $($('legend', '#node_event_form_group_guests')[0]).wiggle('start', { limit: 3 });
        });

        return false;
      }

      return true;
    },
    validateFields: function() {
      if (!Drupal.ewSubmit.validateName() ||
          !Drupal.ewSubmit.validateTime() ||
          !Drupal.ewSubmit.validatePlace() ||
          !Drupal.ewSubmit.validateFriends()) {
        return false;
      }
      else {
        return true;
      }
    },
    removeEvents: function() {
      if (Drupal.ewSubmit.events == null) {
        Drupal.ewSubmit.events = $('.event-ajax-submit', '#event-node-form').clone(true).data('events');
        $.each($('.event-ajax-submit', '#event-node-form').data('events').mousedown, function(index, mousedownEvent) {
          $('.event-ajax-submit', '#event-node-form').unbind('mousedown', mousedownEvent);
        });
      }
    },
    attachClientValidation: function() {
      $('.event-ajax-submit', '#event-node-form').mousedown(function(e) {
//console.log('mousedown');

        // Validation
        if (!Drupal.ewSubmit.validateFields()) {
//console.log('validation error');
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
        else {
          // Tracking the event creation
          if (Drupal.ewEditForm.eventAction == 'create') {
            mixpanel.track('event created');
          } 

          window.setTimeout(function() {
            // Removeing our event
            $('.event-ajax-submit', '#event-node-form').unbind('mousedown');
            // Binding the original events
            $.each(Drupal.ewSubmit.events.mousedown, function(index, mousedownEvent) {
              var tempEvent = $.extend({}, mousedownEvent);
              $.event.add(
                $('.event-ajax-submit', '#event-node-form')[0],
                tempEvent.type,
                tempEvent.handler,
                tempEvent.handler.data);
            });

            // Deleteing the saved events
            Drupal.ewSubmit.events = null;

            Drupal.ewPlaceholderFallback.cleanup();

            // Send Event Creation tracking
            if (Drupal.ewEditForm.eventAction == 'create') {
              FB.api(
                '/me/eventwith:create',
                'post',
                { event: 'http://www.eventwith.com/opengraph-event?facebook=1' },
                function(response) {
                   if (!response || response.error) {
                      alert('Error occured');
                   } else {
                      alert('successful! Action ID: ' + response.id);
                   }
                }
              );
            }
  
            // Triggering the default events
            $('.event-ajax-submit', '#event-node-form').trigger('mousedown');
            top.location.replace('#back');

            // Attaching the whole behavior again
            //Drupal.ewTimeSubmit.removeEvents();
            //Drupal.ewTimeSubmit.attachClientValidation();
          }, 300);
        }
      });
    },
  };

  Drupal.behaviors.ewSubmit = {
    attach: function(context, settings) {
      $('.event-ajax-submit', '#event-node-form').once('ewSubmit', function() {
        Drupal.ewSubmit.removeEvents();

        if (Drupal.ewSubmit.events != null) {
          Drupal.ewSubmit.attachClientValidation();
        }
      });

      $('.event-fake-ajax-submit', '#event-node-form').once('ewSubmit', function() {
        $(this).mousedown(function(e) {
          // Validation
          var isValid = (Drupal.ewSubmit.validateName() &&
            Drupal.ewSubmit.validateTime() &&
            Drupal.ewSubmit.validatePlace());

          if (!isValid) {
            // Hide popups
            Drupal.ocWebmailImport.hide();
            Drupal.ewFBFriendsChoose.hide();

            e.stopPropagation();
            e.preventDefault();
            return false;
          }
          else {}
        });
      });
    }
  };

  Drupal.ewTimeSubmit = Drupal.ewTimeSubmit || {
    timeEvents: null,
    removeEvents: function() {
      if (Drupal.ewTimeSubmit.timeEvents == null) {
        Drupal.ewTimeSubmit.timeEvents = $('input.field-add-more-submit', '#edit-field-time').last().clone(true).data('events');
        $.each($('input.field-add-more-submit', '#edit-field-time').last().data('events').mousedown, function(index, mousedownEvent) {
          $('input.field-add-more-submit', '#edit-field-time').last().unbind('mousedown', mousedownEvent);
        });
      }
    },
    attachClientValidation: function() {
      $('input.field-add-more-submit', '#edit-field-time').last().mousedown(function(e) {

        // Validation
        if (!Drupal.ewSubmit.validateTime()) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
        else {
          // Removeing our event
          $('input.field-add-more-submit', '#edit-field-time').last().unbind('mousedown');

          // Binding the original events
          $.each(Drupal.ewTimeSubmit.timeEvents.mousedown, function(index, mousedownEvent) {
            var tempEvent = $.extend({}, mousedownEvent);
            $.event.add(
              $('input.field-add-more-submit', '#edit-field-time').last()[0],
              tempEvent.type,
              tempEvent.handler,
              tempEvent.handler.data);
          });

          // Deleteing the saved events
          Drupal.ewTimeSubmit.timeEvents = null;

          // Triggering the default events
          $('input.field-add-more-submit', '#edit-field-time').last().trigger('mousedown');

          // Attaching the whole behavior again
          //Drupal.ewTimeSubmit.removeEvents();
          //Drupal.ewTimeSubmit.attachClientValidation();
        }
      });
    },
  };
  Drupal.behaviors.ewTimeSubmit = {
    attach: function(context, settings) {
      $('input.field-add-more-submit', '#edit-field-time').last().once('ewTimeSubmit', function() {

        Drupal.ewTimeSubmit.removeEvents();

        if (Drupal.ewTimeSubmit.timeEvents != null) {
          Drupal.ewTimeSubmit.attachClientValidation();
        }
      });
    }
  };

  Drupal.ewPlaceSubmit = Drupal.ewPlaceSubmit || {
    placeEvents: null,
    removeEvents: function() {
      if (Drupal.ewPlaceSubmit.placeEvents == null) {
        Drupal.ewPlaceSubmit.placeEvents = $('.field-add-more-submit', '#edit-field-place').clone(true).data('events');
        $.each($('.field-add-more-submit', '#edit-field-place').data('events').mousedown, function(index, mousedownEvent) {
          $('.field-add-more-submit', '#edit-field-place').unbind('mousedown', mousedownEvent);
        });
      }
    },
    attachClientValidation: function() {
      $('.field-add-more-submit', '#edit-field-place').mousedown(function(e) {

        // Validation
        if (!Drupal.ewSubmit.validatePlace()) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
        else {
          // Removeing our event
          $('.field-add-more-submit', '#edit-field-place').unbind('mousedown');

          // Binding the original events
          $.each(Drupal.ewPlaceSubmit.placeEvents.mousedown, function(index, mousedownEvent) {
            var tempEvent = $.extend({}, mousedownEvent);
            $.event.add(
              $('.field-add-more-submit', '#edit-field-place')[0],
              tempEvent.type,
              tempEvent.handler,
              tempEvent.handler.data);
          });

          // Deleteing the saved events
          Drupal.ewPlaceSubmit.placeEvents = null;

          // Triggering the default events
          $('.field-add-more-submit', '#edit-field-place').trigger('mousedown');

          // Attaching the whole behavior again
          //Drupal.ewTimeSubmit.removeEvents();
          //Drupal.ewTimeSubmit.attachClientValidation();
        }
      });
    },
  };
  Drupal.behaviors.ewPlaceSubmit = {
    attach: function(context, settings) {
      $('.field-add-more-submit', '#edit-field-place').once('ewPlaceSubmit', function() {
        Drupal.ewPlaceSubmit.removeEvents();

        if (Drupal.ewPlaceSubmit.placeEvents != null) {
          Drupal.ewPlaceSubmit.attachClientValidation();
        }
      });
    }
  };

/*************************************************************************/
// Overriding the lightbox behavior
// Initialize the lightbox.
/*Drupal.behaviors.initLightbox = {
  attach: function(context) {

    $('body:not(.lightbox-processed)', context).addClass('lightbox-processed').each(function() {
      Lightbox.initialize();
      return false; // Break the each loop.
    });

    // Attach lightbox to any links with lightbox rels.
    Lightbox.initList(context);

    $('body:not(.lightboxAutoModal-processed)', context).addClass('lightboxAutoModal-processed').each(function() {
      $('#lightboxAutoModal', context).triggerHandler('click');
    });
  }
};*/

/*************************************************************************/
// Overriding the date_popup timepicker behavior
Drupal.behaviors.date_popup = {
  attach: function (context) {
  for (var id in Drupal.settings.datePopup) {
    $('#'+ id).bind('focus', Drupal.settings.datePopup[id], function(e) {
      if (!$(this).hasClass('date-popup-init')) {
        var datePopup = e.data;
        // Explicitely filter the methods we accept.
        switch (datePopup.func) {
          case 'datepicker':
            $(this)
              .datepicker(datePopup.settings)
              .addClass('date-popup-init')
            $(this).click(function(){
              $(this).focus();
            });
            break;

          case 'timeEntry':
            $(this)
              .timeEntry(datePopup.settings)
              .addClass('date-popup-init')
            $(this).click(function(){
              $(this).focus();
            });
            break;
          case 'timepicker':
            // Translate the PHP date format into the style the timepicker uses.
            datePopup.settings.timeFormat = datePopup.settings.timeFormat
              // 12-hour, leading zero,
              .replace('h', 'hh')
              // 12-hour, no leading zero.
              .replace('g', 'h')
              // 24-hour, leading zero.
              .replace('H', 'HH')
              // 24-hour, no leading zero.
              .replace('G', 'H')
              // AM/PM.
              .replace('A', 'p')
              // Minutes with leading zero.
              .replace('i', 'mm')
              // Seconds with leading zero.
              .replace('s', 'ss');

            var today = new Date();
            today.setHours(8);
            today.setMinutes(0);
            today.setSeconds(0);
            datePopup.settings.startTime = today.getTime();

            datePopup.settings.startTime = new Date(datePopup.settings.startTime);

            $(this)
              .timepicker(datePopup.settings)
              .addClass('date-popup-init');
            $(this).click(function(){
              $(this).focus();
            });
            break;
        }
      }
    });
  }
  }
};


/*************************************************************************/
// Bind removing of file to selector elements
  function plup_remove_item(selector) {
    $(selector).bind('click', function(event) {
      var parent = $(this).parent();
      var parentsParent = parent.parent();
      parent.remove();
      parentsParent.trigger('formUpdated');

      if ($('ul.plup-list li', '#edit-field-images-und-plupload-container').length == 0) {
        $('#node_event_form_group_additional').slideUp();
      }

    });
  }

  // Bind resize effect on title and alt fields on focus
  function plup_resize_input(selector) {
    var w = $(selector).outerWidth();
    if (w < 300) {
      $(selector).bind('focus', function(event) {
        $(this).css('z-index', 10).animate({'width': '300px'}, 300);
      });
      $(selector).bind('blur', function(event) {
        $(this).removeAttr('style');
      });
    }
  }

  Drupal.behaviors.plup = {
    attach: function(context, settings) {
      if (typeof settings.plup === "undefined") {
        return;
      }

      // Apply Plupload to each form element instance
      $.each(settings.plup, function(plupName, plupInstance) {
        var cid = plupInstance.container;
        var id = '#' + cid;

        // Apply setting only once
        $(id).once('plup', function() {
          /**
          * Initial tasks
          */

          $(id +' .plup-list').sortable(); // Activate sortable
          $(id +'-plup-upload').hide(); // Hide upload button
          var uploader = new plupload.Uploader(plupInstance); // Create Plupload instance
          plup_remove_item(id +' .plup-remove-item'); // Bind remove functionality on existing images
          plup_resize_input(id +' .plup-list > li > input.form-text'); // Bind resizing effect on existing inputs


          /**
           * Events
           */

          // Initialization
          uploader.bind('Init', function(up, params) {
            // Nothing to do, just reminder of the presence for this event
          });


          // Starting upload
          uploader.bind('Start', function(up, files) {
            // Nothing to do, just reminder of the presence for this event
          });


          // Upload process state
          uploader.bind('StateChanged', function(up) {
            if (up.state == 2) {
              $(id +' .plup-progress').progressbar(); // Activate progressbar
              $(id +' .plup-list').append('<li class="media-loader-w"><img class="media-loader" src="'+ Drupal.settings.pathToTheme +'/images/media_loader.gif"/></li>');
            }
            if (up.state == 1) {
              $(id +' .plup-progress').progressbar('destroy'); // Destroy progressbar
              $(".media-loader-w",id +' .plup-list').remove();

              //$(id +'-plup-upload').hide(); // Hide upload button
              //$(id +' .plup-drag-info').show(); // Show info
            }
          })


          // Files were added into queue(only CURRENTLY added files)
          uploader.bind('FilesAdded', function(up, files) {
            /*$(id +' .plup-drag-info').hide(); // Hide info
            $(id +'-plup-upload').show(); // Show upload button*/

            // Put files visually into queue
            $.each(files, function(i, file) {
              $(id +'-plup-filelist table').append('<tr id="' + file.id + '">' +
                '<td class="plup-filelist-file">' +  file.name + '</td>' +
                '<td class="plup-filelist-size">' + plupload.formatSize(file.size) + '</td>' +
                '<td class="plup-filelist-message"></td>' +
                '<td class="plup-filelist-remove"><a class="plup-remove-file"></a></td>' +
                '</tr>');

              // Bind "remove" functionality to files added into queue
              $(id +' #' + file.id + ' .plup-filelist-remove > a').bind('click', function(event) {
                $('#' + file.id).remove();
                up.removeFile(file);
              });
            });

            up.refresh(); // Refresh for flash or silverlight

            setTimeout(function () {
              up.start();

              if (!$('#node_event_form_group_additional').is(":visible")) {
                $('#node_event_form_group_additional').slideDown();
              }
            }, 100);
          });


          // File was removed from queue
          // Doc states this ARE files but actually it IS a file
          /*uploader.bind('FilesRemoved', function(up, file) {
            // If there are not files in queue
            if (up.files.length == 0) {
              $(id +'-plup-upload').hide(); // Hide upload button
              $(id +' .plup-drag-info').show(); // Show info
            }
          });*/


          // File is being uploaded
          uploader.bind('UploadProgress', function(up, file) {
            // Refresh progressbar
            $(id +' .plup-progress').progressbar({value: uploader.total.percent});
          });


          // Error event
          uploader.bind('Error', function(up, err) {
            $(id +' #' + err.file.id + ' > .plup-filelist-message').append('<b>Error: ' + err.message + '</b>');
            up.refresh(); // Refresh for flash or silverlight
          });


          // Event after a file has been uploaded from queue
          uploader.bind('FileUploaded', function(up, file, response) {
            // Response is an object with response parameter so 2x response
            var fileSaved = $.parseJSON(response.response);
            var delta = $(id +' .plup-list li').length;
            var name = plupName +'[' + delta + ']';

            // Plupload has weird error handling behavior so we have to check for errors here
            if (fileSaved.error_message) {
              $(id +' #' + file.id + ' > .plup-filelist-message').append('<b>Error: ' + fileSaved.error_message + '</b>');
              up.refresh(); // Refresh for flash or silverlight
              return;
            }

            $(id +'-plup-filelist #' + file.id).remove(); // Remove uploaded file from queue
            var title_field = plupInstance.title_field ? '<input title="'+ Drupal.t('Title') +'" type="text" class="form-text plup-title" placeholder="' + Drupal.t('Image name') + '" name="'+ name + '[title]" value="" />' : '';
            var alt_field = plupInstance.alt_field ? '<input title="'+ Drupal.t('Alternative text') +'" type="text" class="form-text plup-alt" name="'+ name + '[alt]" value="" />' : '';

            // Add image thumbnail into list of uploaded items
            $(id +' .plup-list').prepend(
              '<li class="ui-state-default">' +
              '<div class="plup-thumb-wrapper"><img src="'+ plupInstance.image_style_path + file.target_name + '" title="'+ Drupal.checkPlain(file.target_name) +'" /></div>' +
              '<a class="plup-remove-item"></a>' +
              title_field +
              alt_field +
              '<input type="hidden" name="' + name + '[fid]" value="' + fileSaved.fid + '" />' +
              '<input type="hidden" name="' + name + '[weight]" value="' + delta + '" />' +
              '<input type="hidden" name="' + name + '[rename]" value="' + file.name +'" />' +
              '</li>');

            // Bind remove functionality to uploaded file
            var new_element = $('input[name="'+ name +'[fid]"]');
            var remove_element = $(new_element).siblings('.plup-remove-item');
            plup_remove_item(remove_element);

            // Bind resize effect to inputs of uploaded file
            var text_element = $(new_element).siblings('input.form-text');
            plup_resize_input(text_element);

            // Tell Drupal that form has been updated
            new_element.trigger('formUpdated');
          });


          // All fields from queue has been uploaded
          uploader.bind('UploadComplete', function(up, files) {
            $(id +' .plup-list').sortable('refresh'); // Refresh sortable
            //$(id +' .plup-drag-info').show(); // Show info
          });



          /**
           * Additional tasks
           */

          // Upload button functionality
          $('#'+ plupInstance.upload).click(function(e) {
            // Forbid uploading more than the allowed number of files, if set
            if (plupInstance.max_files > 0) {
              var uploaded = $(id +' .plup-list li').length;
              var selected = $(id +'-plup-filelist td.plup-filelist-file').length;
              var allowed = plupInstance.max_files - uploaded;
              if ((selected + uploaded) > plupInstance.max_files) {
                alert(Drupal.formatPlural(allowed, 'You can upload only 1 file.', 'You can upload only @count files.'));
                return;
              }
            }
            uploader.start();
            e.preventDefault();
          });


          // Initialize Plupload
          uploader.init();


          // Change weight values for images when reordering using sortable
          $(id +' .plup-list').bind('sortupdate', function(event, ui) {
            $(this).find('li').each(function(index) {
              $(this).find('input[name$="[weight]"]').val(index);
            });
          });
        });
      });
    }
  }

})(jQuery);
;

(function($) {

/**
 * Drupal FieldGroup object.
 */
Drupal.FieldGroup = Drupal.FieldGroup || {};
Drupal.FieldGroup.Effects = Drupal.FieldGroup.Effects || {};
Drupal.FieldGroup.groupWithfocus = null;

Drupal.FieldGroup.setGroupWithfocus = function(element) {
  element.css({display: 'block'});
  Drupal.FieldGroup.groupWithfocus = element;
}

/**
 * Implements Drupal.FieldGroup.processHook().
 */
Drupal.FieldGroup.Effects.processFieldset = {
  execute: function (context, settings, type) {
    if (type == 'form') {
      // Add required fields mark to any fieldsets containing required fields
      $('fieldset.fieldset', context).once('fieldgroup-effects', function(i) {
        if ($(this).is('.required-fields') && $(this).find('.form-required').length > 0) {
          $('legend span.fieldset-legend', $(this)).eq(0).append(' ').append($('.form-required').eq(0).clone());
        }
        if ($('.error', $(this)).length) {
          $('legend span.fieldset-legend', $(this)).eq(0).addClass('error');
          Drupal.FieldGroup.setGroupWithfocus($(this));
        }
      });
    }
  }
}

/**
 * Implements Drupal.FieldGroup.processHook().
 */
Drupal.FieldGroup.Effects.processAccordion = {
  execute: function (context, settings, type) {
    $('div.field-group-accordion-wrapper', context).once('fieldgroup-effects', function () {
      var wrapper = $(this);

      wrapper.accordion({
        autoHeight: false,
        active: '.field-group-accordion-active',
        collapsible: true,
        changestart: function(event, ui) {
          if ($(this).hasClass('effect-none')) {
            ui.options.animated = false;
          }
          else {
            ui.options.animated = 'slide';
          }
        }
      });

      if (type == 'form') {
        // Add required fields mark to any element containing required fields
        wrapper.find('div.accordion-item').each(function(i){
          if ($(this).is('.required-fields') && $(this).find('.form-required').length > 0) {
            $('h3.ui-accordion-header').eq(i).append(' ').append($('.form-required').eq(0).clone());
          }
          if ($('.error', $(this)).length) {
            $('h3.ui-accordion-header').eq(i).addClass('error');
            var activeOne = $(this).parent().accordion("activate" , i);
            $('.ui-accordion-content-active', activeOne).css({height: 'auto', width: 'auto', display: 'block'});
          }
        });
      }
    });
  }
}

/**
 * Implements Drupal.FieldGroup.processHook().
 */
Drupal.FieldGroup.Effects.processHtabs = {
  execute: function (context, settings, type) {
    if (type == 'form') {
      // Add required fields mark to any element containing required fields
      $('fieldset.horizontal-tabs-pane', context).once('fieldgroup-effects', function(i) {
        if ($(this).is('.required-fields') && $(this).find('.form-required').length > 0) {
          $(this).data('horizontalTab').link.find('strong:first').after($('.form-required').eq(0).clone()).after(' ');
        }
        if ($('.error', $(this)).length) {
          $(this).data('horizontalTab').link.parent().addClass('error');
          Drupal.FieldGroup.setGroupWithfocus($(this));
          $(this).data('horizontalTab').focus();
        }
      });
    }
  }
}

/**
 * Implements Drupal.FieldGroup.processHook().
 */
Drupal.FieldGroup.Effects.processTabs = {
  execute: function (context, settings, type) {
    if (type == 'form') {
      // Add required fields mark to any fieldsets containing required fields
      $('fieldset.vertical-tabs-pane', context).once('fieldgroup-effects', function(i) {
        if ($(this).is('.required-fields') && $(this).find('.form-required').length > 0) {
          $(this).data('verticalTab').link.find('strong:first').after($('.form-required').eq(0).clone()).after(' ');
        }
        if ($('.error', $(this)).length) {
          $(this).data('verticalTab').link.parent().addClass('error');
          Drupal.FieldGroup.setGroupWithfocus($(this));
          $(this).data('verticalTab').focus();
        }
      });
    }
  }
}

/**
 * Implements Drupal.FieldGroup.processHook().
 *
 * TODO clean this up meaning check if this is really
 *      necessary.
 */
Drupal.FieldGroup.Effects.processDiv = {
  execute: function (context, settings, type) {

    $('div.collapsible', context).once('fieldgroup-effects', function() {
      var $wrapper = $(this);

      // Turn the legend into a clickable link, but retain span.field-group-format-toggler
      // for CSS positioning.

      var $toggler = $('span.field-group-format-toggler:first', $wrapper);
      var $link = $('<a class="field-group-format-title" href="#"></a>');
      $link.prepend($toggler.contents());

      // Add required field markers if needed
      if ($(this).is('.required-fields') && $(this).find('.form-required').length > 0) {
        $link.append(' ').append($('.form-required').eq(0).clone());
      }

      $link.appendTo($toggler);

      // .wrapInner() does not retain bound events.
      $link.click(function () {
        var wrapper = $wrapper.get(0);
        // Don't animate multiple times.
        if (!wrapper.animating) {
          wrapper.animating = true;
          var speed = $wrapper.hasClass('speed-fast') ? 300 : 1000;
          if ($wrapper.hasClass('effect-none') && $wrapper.hasClass('speed-none')) {
            $('> .field-group-format-wrapper', wrapper).toggle();
          }
          else if ($wrapper.hasClass('effect-blind')) {
            $('> .field-group-format-wrapper', wrapper).toggle('blind', {}, speed);
          }
          else {
            $('> .field-group-format-wrapper', wrapper).toggle(speed);
          }
          wrapper.animating = false;
        }
        $wrapper.toggleClass('collapsed');
        return false;
      });

    });
  }
};

/**
 * Behaviors.
 */
Drupal.behaviors.fieldGroup = {
  attach: function (context, settings) {
    if (settings.field_group == undefined) {
      return;
    }

    // Execute all of them.
    $.each(Drupal.FieldGroup.Effects, function (func) {
      // We check for a wrapper function in Drupal.field_group as
      // alternative for dynamic string function calls.
      var type = func.toLowerCase().replace("process", "");
      if (settings.field_group[type] != undefined && $.isFunction(this.execute)) {
        this.execute(context, settings, settings.field_group[type]);
      }
    });

    // Fixes css for fieldgroups under vertical tabs.
    $('.fieldset-wrapper .fieldset > legend').css({display: 'block'});
    $('.vertical-tabs fieldset.fieldset').addClass('default-fallback');

  }
};

})(jQuery);;
(function($) {
  Drupal.embedVideo = Drupal.embedVideo || {
    ytObj: null,
  };

  Drupal.behaviors.embedVideoGuiderCreate = {
    attach: function(context, settings) {
      $('.video-wrapper', 'body.node-type-event.section-node-edit #guider_0').once('embedVideoGuiderCreate', function() {
        $('#ytapiplayer').append($('<a href="http://www.adobe.com/go/getflashplayer"><img alt="Get Adobe Flash player" src="http://www.adobe.com/images/shared/download_buttons/get_flash_player.gif"></a>'));

        var flashvars = {};
        var params = { allowScriptAccess: "always", allowFullScreen: "true", wmode:"window"  };
        var atts = { id: "myytplayer" };
        swfobject.embedSWF("http://www.youtube.com/v/8ak9wvXnhwY?enablejsapi=1&playerapiid=ytplayer&version=3&fs=1&rel=0",
                       "ytapiplayer", "560", "315", "8", false, flashvars, params, atts);

        $('.x_button', '#guider_0').click(function() {
          Drupal.embedVideo.ytObj.stopVideo();
        });
      });

    }
  }

  Drupal.behaviors.embedVideoGuiderManage = {
    attach: function(context, settings) {
      $('.video-wrapper', 'body.node-type-event.section-event #guider_0').once('embedVideoGuiderManage', function() {
        $('#ytapiplayer').append($('<a href="http://www.adobe.com/go/getflashplayer"><img alt="Get Adobe Flash player" src="http://www.adobe.com/images/shared/download_buttons/get_flash_player.gif"></a>'));

        var flashvars = {};
        var params = { allowScriptAccess: "always", allowFullScreen: "true", wmode:"window" };
        var atts = { id: "myytplayer" };
        swfobject.embedSWF("http://www.youtube.com/v/v-UR6rwSbAU?enablejsapi=1&playerapiid=ytplayer&version=3&fs=1&rel=0",
                       "ytapiplayer", "560", "315", "8", false, flashvars, params, atts);

        $('.x_button', '#guider_0').click(function() {
          Drupal.embedVideo.ytObj.stopVideo();
        });
      });

    }
  }
})(jQuery);

function onYouTubePlayerReady(playerId) {
  ytplayer = document.getElementById("myytplayer");
  ytplayer.setPlaybackQuality('hd720');
//  ytplayer.playVideo();

  Drupal.embedVideo.ytObj = ytplayer;
}
;
/*!	SWFObject v2.2 <http://code.google.com/p/swfobject/> 
	is released under the MIT License <http://www.opensource.org/licenses/mit-license.php> 
*/

var swfobject = function() {
	
	var UNDEF = "undefined",
		OBJECT = "object",
		SHOCKWAVE_FLASH = "Shockwave Flash",
		SHOCKWAVE_FLASH_AX = "ShockwaveFlash.ShockwaveFlash",
		FLASH_MIME_TYPE = "application/x-shockwave-flash",
		EXPRESS_INSTALL_ID = "SWFObjectExprInst",
		ON_READY_STATE_CHANGE = "onreadystatechange",
		
		win = window,
		doc = document,
		nav = navigator,
		
		plugin = false,
		domLoadFnArr = [main],
		regObjArr = [],
		objIdArr = [],
		listenersArr = [],
		storedAltContent,
		storedAltContentId,
		storedCallbackFn,
		storedCallbackObj,
		isDomLoaded = false,
		isExpressInstallActive = false,
		dynamicStylesheet,
		dynamicStylesheetMedia,
		autoHideShow = true,
	
	/* Centralized function for browser feature detection
		- User agent string detection is only used when no good alternative is possible
		- Is executed directly for optimal performance
	*/	
	ua = function() {
		var w3cdom = typeof doc.getElementById != UNDEF && typeof doc.getElementsByTagName != UNDEF && typeof doc.createElement != UNDEF,
			u = nav.userAgent.toLowerCase(),
			p = nav.platform.toLowerCase(),
			windows = p ? /win/.test(p) : /win/.test(u),
			mac = p ? /mac/.test(p) : /mac/.test(u),
			webkit = /webkit/.test(u) ? parseFloat(u.replace(/^.*webkit\/(\d+(\.\d+)?).*$/, "$1")) : false, // returns either the webkit version or false if not webkit
			ie = !+"\v1", // feature detection based on Andrea Giammarchi's solution: http://webreflection.blogspot.com/2009/01/32-bytes-to-know-if-your-browser-is-ie.html
			playerVersion = [0,0,0],
			d = null;
		if (typeof nav.plugins != UNDEF && typeof nav.plugins[SHOCKWAVE_FLASH] == OBJECT) {
			d = nav.plugins[SHOCKWAVE_FLASH].description;
			if (d && !(typeof nav.mimeTypes != UNDEF && nav.mimeTypes[FLASH_MIME_TYPE] && !nav.mimeTypes[FLASH_MIME_TYPE].enabledPlugin)) { // navigator.mimeTypes["application/x-shockwave-flash"].enabledPlugin indicates whether plug-ins are enabled or disabled in Safari 3+
				plugin = true;
				ie = false; // cascaded feature detection for Internet Explorer
				d = d.replace(/^.*\s+(\S+\s+\S+$)/, "$1");
				playerVersion[0] = parseInt(d.replace(/^(.*)\..*$/, "$1"), 10);
				playerVersion[1] = parseInt(d.replace(/^.*\.(.*)\s.*$/, "$1"), 10);
				playerVersion[2] = /[a-zA-Z]/.test(d) ? parseInt(d.replace(/^.*[a-zA-Z]+(.*)$/, "$1"), 10) : 0;
			}
		}
		else if (typeof win.ActiveXObject != UNDEF) {
			try {
				var a = new ActiveXObject(SHOCKWAVE_FLASH_AX);
				if (a) { // a will return null when ActiveX is disabled
					d = a.GetVariable("$version");
					if (d) {
						ie = true; // cascaded feature detection for Internet Explorer
						d = d.split(" ")[1].split(",");
						playerVersion = [parseInt(d[0], 10), parseInt(d[1], 10), parseInt(d[2], 10)];
					}
				}
			}
			catch(e) {}
		}
		return { w3:w3cdom, pv:playerVersion, wk:webkit, ie:ie, win:windows, mac:mac };
	}(),
	
	/* Cross-browser onDomLoad
		- Will fire an event as soon as the DOM of a web page is loaded
		- Internet Explorer workaround based on Diego Perini's solution: http://javascript.nwbox.com/IEContentLoaded/
		- Regular onload serves as fallback
	*/ 
	onDomLoad = function() {
		if (!ua.w3) { return; }
		if ((typeof doc.readyState != UNDEF && doc.readyState == "complete") || (typeof doc.readyState == UNDEF && (doc.getElementsByTagName("body")[0] || doc.body))) { // function is fired after onload, e.g. when script is inserted dynamically 
			callDomLoadFunctions();
		}
		if (!isDomLoaded) {
			if (typeof doc.addEventListener != UNDEF) {
				doc.addEventListener("DOMContentLoaded", callDomLoadFunctions, false);
			}		
			if (ua.ie && ua.win) {
				doc.attachEvent(ON_READY_STATE_CHANGE, function() {
					if (doc.readyState == "complete") {
						doc.detachEvent(ON_READY_STATE_CHANGE, arguments.callee);
						callDomLoadFunctions();
					}
				});
				if (win == top) { // if not inside an iframe
					(function(){
						if (isDomLoaded) { return; }
						try {
							doc.documentElement.doScroll("left");
						}
						catch(e) {
							setTimeout(arguments.callee, 0);
							return;
						}
						callDomLoadFunctions();
					})();
				}
			}
			if (ua.wk) {
				(function(){
					if (isDomLoaded) { return; }
					if (!/loaded|complete/.test(doc.readyState)) {
						setTimeout(arguments.callee, 0);
						return;
					}
					callDomLoadFunctions();
				})();
			}
			addLoadEvent(callDomLoadFunctions);
		}
	}();
	
	function callDomLoadFunctions() {
		if (isDomLoaded) { return; }
		try { // test if we can really add/remove elements to/from the DOM; we don't want to fire it too early
			var t = doc.getElementsByTagName("body")[0].appendChild(createElement("span"));
			t.parentNode.removeChild(t);
		}
		catch (e) { return; }
		isDomLoaded = true;
		var dl = domLoadFnArr.length;
		for (var i = 0; i < dl; i++) {
			domLoadFnArr[i]();
		}
	}
	
	function addDomLoadEvent(fn) {
		if (isDomLoaded) {
			fn();
		}
		else { 
			domLoadFnArr[domLoadFnArr.length] = fn; // Array.push() is only available in IE5.5+
		}
	}
	
	/* Cross-browser onload
		- Based on James Edwards' solution: http://brothercake.com/site/resources/scripts/onload/
		- Will fire an event as soon as a web page including all of its assets are loaded 
	 */
	function addLoadEvent(fn) {
		if (typeof win.addEventListener != UNDEF) {
			win.addEventListener("load", fn, false);
		}
		else if (typeof doc.addEventListener != UNDEF) {
			doc.addEventListener("load", fn, false);
		}
		else if (typeof win.attachEvent != UNDEF) {
			addListener(win, "onload", fn);
		}
		else if (typeof win.onload == "function") {
			var fnOld = win.onload;
			win.onload = function() {
				fnOld();
				fn();
			};
		}
		else {
			win.onload = fn;
		}
	}
	
	/* Main function
		- Will preferably execute onDomLoad, otherwise onload (as a fallback)
	*/
	function main() { 
		if (plugin) {
			testPlayerVersion();
		}
		else {
			matchVersions();
		}
	}
	
	/* Detect the Flash Player version for non-Internet Explorer browsers
		- Detecting the plug-in version via the object element is more precise than using the plugins collection item's description:
		  a. Both release and build numbers can be detected
		  b. Avoid wrong descriptions by corrupt installers provided by Adobe
		  c. Avoid wrong descriptions by multiple Flash Player entries in the plugin Array, caused by incorrect browser imports
		- Disadvantage of this method is that it depends on the availability of the DOM, while the plugins collection is immediately available
	*/
	function testPlayerVersion() {
		var b = doc.getElementsByTagName("body")[0];
		var o = createElement(OBJECT);
		o.setAttribute("type", FLASH_MIME_TYPE);
		var t = b.appendChild(o);
		if (t) {
			var counter = 0;
			(function(){
				if (typeof t.GetVariable != UNDEF) {
					var d = t.GetVariable("$version");
					if (d) {
						d = d.split(" ")[1].split(",");
						ua.pv = [parseInt(d[0], 10), parseInt(d[1], 10), parseInt(d[2], 10)];
					}
				}
				else if (counter < 10) {
					counter++;
					setTimeout(arguments.callee, 10);
					return;
				}
				b.removeChild(o);
				t = null;
				matchVersions();
			})();
		}
		else {
			matchVersions();
		}
	}
	
	/* Perform Flash Player and SWF version matching; static publishing only
	*/
	function matchVersions() {
		var rl = regObjArr.length;
		if (rl > 0) {
			for (var i = 0; i < rl; i++) { // for each registered object element
				var id = regObjArr[i].id;
				var cb = regObjArr[i].callbackFn;
				var cbObj = {success:false, id:id};
				if (ua.pv[0] > 0) {
					var obj = getElementById(id);
					if (obj) {
						if (hasPlayerVersion(regObjArr[i].swfVersion) && !(ua.wk && ua.wk < 312)) { // Flash Player version >= published SWF version: Houston, we have a match!
							setVisibility(id, true);
							if (cb) {
								cbObj.success = true;
								cbObj.ref = getObjectById(id);
								cb(cbObj);
							}
						}
						else if (regObjArr[i].expressInstall && canExpressInstall()) { // show the Adobe Express Install dialog if set by the web page author and if supported
							var att = {};
							att.data = regObjArr[i].expressInstall;
							att.width = obj.getAttribute("width") || "0";
							att.height = obj.getAttribute("height") || "0";
							if (obj.getAttribute("class")) { att.styleclass = obj.getAttribute("class"); }
							if (obj.getAttribute("align")) { att.align = obj.getAttribute("align"); }
							// parse HTML object param element's name-value pairs
							var par = {};
							var p = obj.getElementsByTagName("param");
							var pl = p.length;
							for (var j = 0; j < pl; j++) {
								if (p[j].getAttribute("name").toLowerCase() != "movie") {
									par[p[j].getAttribute("name")] = p[j].getAttribute("value");
								}
							}
							showExpressInstall(att, par, id, cb);
						}
						else { // Flash Player and SWF version mismatch or an older Webkit engine that ignores the HTML object element's nested param elements: display alternative content instead of SWF
							displayAltContent(obj);
							if (cb) { cb(cbObj); }
						}
					}
				}
				else {	// if no Flash Player is installed or the fp version cannot be detected we let the HTML object element do its job (either show a SWF or alternative content)
					setVisibility(id, true);
					if (cb) {
						var o = getObjectById(id); // test whether there is an HTML object element or not
						if (o && typeof o.SetVariable != UNDEF) { 
							cbObj.success = true;
							cbObj.ref = o;
						}
						cb(cbObj);
					}
				}
			}
		}
	}
	
	function getObjectById(objectIdStr) {
		var r = null;
		var o = getElementById(objectIdStr);
		if (o && o.nodeName == "OBJECT") {
			if (typeof o.SetVariable != UNDEF) {
				r = o;
			}
			else {
				var n = o.getElementsByTagName(OBJECT)[0];
				if (n) {
					r = n;
				}
			}
		}
		return r;
	}
	
	/* Requirements for Adobe Express Install
		- only one instance can be active at a time
		- fp 6.0.65 or higher
		- Win/Mac OS only
		- no Webkit engines older than version 312
	*/
	function canExpressInstall() {
		return !isExpressInstallActive && hasPlayerVersion("6.0.65") && (ua.win || ua.mac) && !(ua.wk && ua.wk < 312);
	}
	
	/* Show the Adobe Express Install dialog
		- Reference: http://www.adobe.com/cfusion/knowledgebase/index.cfm?id=6a253b75
	*/
	function showExpressInstall(att, par, replaceElemIdStr, callbackFn) {
		isExpressInstallActive = true;
		storedCallbackFn = callbackFn || null;
		storedCallbackObj = {success:false, id:replaceElemIdStr};
		var obj = getElementById(replaceElemIdStr);
		if (obj) {
			if (obj.nodeName == "OBJECT") { // static publishing
				storedAltContent = abstractAltContent(obj);
				storedAltContentId = null;
			}
			else { // dynamic publishing
				storedAltContent = obj;
				storedAltContentId = replaceElemIdStr;
			}
			att.id = EXPRESS_INSTALL_ID;
			if (typeof att.width == UNDEF || (!/%$/.test(att.width) && parseInt(att.width, 10) < 310)) { att.width = "310"; }
			if (typeof att.height == UNDEF || (!/%$/.test(att.height) && parseInt(att.height, 10) < 137)) { att.height = "137"; }
			doc.title = doc.title.slice(0, 47) + " - Flash Player Installation";
			var pt = ua.ie && ua.win ? "ActiveX" : "PlugIn",
				fv = "MMredirectURL=" + win.location.toString().replace(/&/g,"%26") + "&MMplayerType=" + pt + "&MMdoctitle=" + doc.title;
			if (typeof par.flashvars != UNDEF) {
				par.flashvars += "&" + fv;
			}
			else {
				par.flashvars = fv;
			}
			// IE only: when a SWF is loading (AND: not available in cache) wait for the readyState of the object element to become 4 before removing it,
			// because you cannot properly cancel a loading SWF file without breaking browser load references, also obj.onreadystatechange doesn't work
			if (ua.ie && ua.win && obj.readyState != 4) {
				var newObj = createElement("div");
				replaceElemIdStr += "SWFObjectNew";
				newObj.setAttribute("id", replaceElemIdStr);
				obj.parentNode.insertBefore(newObj, obj); // insert placeholder div that will be replaced by the object element that loads expressinstall.swf
				obj.style.display = "none";
				(function(){
					if (obj.readyState == 4) {
						obj.parentNode.removeChild(obj);
					}
					else {
						setTimeout(arguments.callee, 10);
					}
				})();
			}
			createSWF(att, par, replaceElemIdStr);
		}
	}
	
	/* Functions to abstract and display alternative content
	*/
	function displayAltContent(obj) {
		if (ua.ie && ua.win && obj.readyState != 4) {
			// IE only: when a SWF is loading (AND: not available in cache) wait for the readyState of the object element to become 4 before removing it,
			// because you cannot properly cancel a loading SWF file without breaking browser load references, also obj.onreadystatechange doesn't work
			var el = createElement("div");
			obj.parentNode.insertBefore(el, obj); // insert placeholder div that will be replaced by the alternative content
			el.parentNode.replaceChild(abstractAltContent(obj), el);
			obj.style.display = "none";
			(function(){
				if (obj.readyState == 4) {
					obj.parentNode.removeChild(obj);
				}
				else {
					setTimeout(arguments.callee, 10);
				}
			})();
		}
		else {
			obj.parentNode.replaceChild(abstractAltContent(obj), obj);
		}
	} 

	function abstractAltContent(obj) {
		var ac = createElement("div");
		if (ua.win && ua.ie) {
			ac.innerHTML = obj.innerHTML;
		}
		else {
			var nestedObj = obj.getElementsByTagName(OBJECT)[0];
			if (nestedObj) {
				var c = nestedObj.childNodes;
				if (c) {
					var cl = c.length;
					for (var i = 0; i < cl; i++) {
						if (!(c[i].nodeType == 1 && c[i].nodeName == "PARAM") && !(c[i].nodeType == 8)) {
							ac.appendChild(c[i].cloneNode(true));
						}
					}
				}
			}
		}
		return ac;
	}
	
	/* Cross-browser dynamic SWF creation
	*/
	function createSWF(attObj, parObj, id) {
		var r, el = getElementById(id);
		if (ua.wk && ua.wk < 312) { return r; }
		if (el) {
			if (typeof attObj.id == UNDEF) { // if no 'id' is defined for the object element, it will inherit the 'id' from the alternative content
				attObj.id = id;
			}
			if (ua.ie && ua.win) { // Internet Explorer + the HTML object element + W3C DOM methods do not combine: fall back to outerHTML
				var att = "";
				for (var i in attObj) {
					if (attObj[i] != Object.prototype[i]) { // filter out prototype additions from other potential libraries
						if (i.toLowerCase() == "data") {
							parObj.movie = attObj[i];
						}
						else if (i.toLowerCase() == "styleclass") { // 'class' is an ECMA4 reserved keyword
							att += ' class="' + attObj[i] + '"';
						}
						else if (i.toLowerCase() != "classid") {
							att += ' ' + i + '="' + attObj[i] + '"';
						}
					}
				}
				var par = "";
				for (var j in parObj) {
					if (parObj[j] != Object.prototype[j]) { // filter out prototype additions from other potential libraries
						par += '<param name="' + j + '" value="' + parObj[j] + '" />';
					}
				}
				jQuery(el).replaceWith('<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"' + att + '>' + par + '</object>');
				objIdArr[objIdArr.length] = attObj.id; // stored to fix object 'leaks' on unload (dynamic publishing only)
				r = getElementById(attObj.id);	
			}
			else { // well-behaving browsers
				var o = createElement(OBJECT);
				o.setAttribute("type", FLASH_MIME_TYPE);
				for (var m in attObj) {
					if (attObj[m] != Object.prototype[m]) { // filter out prototype additions from other potential libraries
						if (m.toLowerCase() == "styleclass") { // 'class' is an ECMA4 reserved keyword
							o.setAttribute("class", attObj[m]);
						}
						else if (m.toLowerCase() != "classid") { // filter out IE specific attribute
							o.setAttribute(m, attObj[m]);
						}
					}
				}
				for (var n in parObj) {
					if (parObj[n] != Object.prototype[n] && n.toLowerCase() != "movie") { // filter out prototype additions from other potential libraries and IE specific param element
						createObjParam(o, n, parObj[n]);
					}
				}
				el.parentNode.replaceChild(o, el);
				r = o;
			}
		}
		return r;
	}
	
	function createObjParam(el, pName, pValue) {
		var p = createElement("param");
		p.setAttribute("name", pName);	
		p.setAttribute("value", pValue);
		el.appendChild(p);
	}
	
	/* Cross-browser SWF removal
		- Especially needed to safely and completely remove a SWF in Internet Explorer
	*/
	function removeSWF(id) {
		var obj = getElementById(id);
		if (obj && obj.nodeName == "OBJECT") {
			if (ua.ie && ua.win) {
				obj.style.display = "none";
				(function(){
					if (obj.readyState == 4) {
						removeObjectInIE(id);
					}
					else {
						setTimeout(arguments.callee, 10);
					}
				})();
			}
			else {
				obj.parentNode.removeChild(obj);
			}
		}
	}
	
	function removeObjectInIE(id) {
		var obj = getElementById(id);
		if (obj) {
			for (var i in obj) {
				if (typeof obj[i] == "function") {
					obj[i] = null;
				}
			}
			obj.parentNode.removeChild(obj);
		}
	}
	
	/* Functions to optimize JavaScript compression
	*/
	function getElementById(id) {
		var el = null;
		try {
			el = doc.getElementById(id);
		}
		catch (e) {}
		return el;
	}
	
	function createElement(el) {
		return doc.createElement(el);
	}
	
	/* Updated attachEvent function for Internet Explorer
		- Stores attachEvent information in an Array, so on unload the detachEvent functions can be called to avoid memory leaks
	*/	
	function addListener(target, eventType, fn) {
		target.attachEvent(eventType, fn);
		listenersArr[listenersArr.length] = [target, eventType, fn];
	}
	
	/* Flash Player and SWF content version matching
	*/
	function hasPlayerVersion(rv) {
		var pv = ua.pv, v = rv.split(".");
		v[0] = parseInt(v[0], 10);
		v[1] = parseInt(v[1], 10) || 0; // supports short notation, e.g. "9" instead of "9.0.0"
		v[2] = parseInt(v[2], 10) || 0;
		return (pv[0] > v[0] || (pv[0] == v[0] && pv[1] > v[1]) || (pv[0] == v[0] && pv[1] == v[1] && pv[2] >= v[2])) ? true : false;
	}
	
	/* Cross-browser dynamic CSS creation
		- Based on Bobby van der Sluis' solution: http://www.bobbyvandersluis.com/articles/dynamicCSS.php
	*/	
	function createCSS(sel, decl, media, newStyle) {
		if (ua.ie && ua.mac) { return; }
		var h = doc.getElementsByTagName("head")[0];
		if (!h) { return; } // to also support badly authored HTML pages that lack a head element
		var m = (media && typeof media == "string") ? media : "screen";
		if (newStyle) {
			dynamicStylesheet = null;
			dynamicStylesheetMedia = null;
		}
		if (!dynamicStylesheet || dynamicStylesheetMedia != m) { 
			// create dynamic stylesheet + get a global reference to it
			var s = createElement("style");
			s.setAttribute("type", "text/css");
			s.setAttribute("media", m);
			dynamicStylesheet = h.appendChild(s);
			if (ua.ie && ua.win && typeof doc.styleSheets != UNDEF && doc.styleSheets.length > 0) {
				dynamicStylesheet = doc.styleSheets[doc.styleSheets.length - 1];
			}
			dynamicStylesheetMedia = m;
		}
		// add style rule
		if (ua.ie && ua.win) {
			if (dynamicStylesheet && typeof dynamicStylesheet.addRule == OBJECT) {
				dynamicStylesheet.addRule(sel, decl);
			}
		}
		else {
			if (dynamicStylesheet && typeof doc.createTextNode != UNDEF) {
				dynamicStylesheet.appendChild(doc.createTextNode(sel + " {" + decl + "}"));
			}
		}
	}
	
	function setVisibility(id, isVisible) {
		if (!autoHideShow) { return; }
		var v = isVisible ? "visible" : "hidden";
		if (isDomLoaded && getElementById(id)) {
			getElementById(id).style.visibility = v;
		}
		else {
			createCSS("#" + id, "visibility:" + v);
		}
	}

	/* Filter to avoid XSS attacks
	*/
	function urlEncodeIfNecessary(s) {
		var regex = /[\\\"<>\.;]/;
		var hasBadChars = regex.exec(s) != null;
		return hasBadChars && typeof encodeURIComponent != UNDEF ? encodeURIComponent(s) : s;
	}
	
	/* Release memory to avoid memory leaks caused by closures, fix hanging audio/video threads and force open sockets/NetConnections to disconnect (Internet Explorer only)
	*/
	var cleanup = function() {
		if (ua.ie && ua.win) {
			window.attachEvent("onunload", function() {
				// remove listeners to avoid memory leaks
				var ll = listenersArr.length;
				for (var i = 0; i < ll; i++) {
					listenersArr[i][0].detachEvent(listenersArr[i][1], listenersArr[i][2]);
				}
				// cleanup dynamically embedded objects to fix audio/video threads and force open sockets and NetConnections to disconnect
				var il = objIdArr.length;
				for (var j = 0; j < il; j++) {
					removeSWF(objIdArr[j]);
				}
				// cleanup library's main closures to avoid memory leaks
				for (var k in ua) {
					ua[k] = null;
				}
				ua = null;
				for (var l in swfobject) {
					swfobject[l] = null;
				}
				swfobject = null;
			});
		}
	}();
	
	return {
		/* Public API
			- Reference: http://code.google.com/p/swfobject/wiki/documentation
		*/ 
		registerObject: function(objectIdStr, swfVersionStr, xiSwfUrlStr, callbackFn) {
			if (ua.w3 && objectIdStr && swfVersionStr) {
				var regObj = {};
				regObj.id = objectIdStr;
				regObj.swfVersion = swfVersionStr;
				regObj.expressInstall = xiSwfUrlStr;
				regObj.callbackFn = callbackFn;
				regObjArr[regObjArr.length] = regObj;
				setVisibility(objectIdStr, false);
			}
			else if (callbackFn) {
				callbackFn({success:false, id:objectIdStr});
			}
		},
		
		getObjectById: function(objectIdStr) {
			if (ua.w3) {
				return getObjectById(objectIdStr);
			}
		},
		
		embedSWF: function(swfUrlStr, replaceElemIdStr, widthStr, heightStr, swfVersionStr, xiSwfUrlStr, flashvarsObj, parObj, attObj, callbackFn) {
			var callbackObj = {success:false, id:replaceElemIdStr};
			if (ua.w3 && !(ua.wk && ua.wk < 312) && swfUrlStr && replaceElemIdStr && widthStr && heightStr && swfVersionStr) {
				setVisibility(replaceElemIdStr, false);
				addDomLoadEvent(function() {
					widthStr += ""; // auto-convert to string
					heightStr += "";
					var att = {};
					if (attObj && typeof attObj === OBJECT) {
						for (var i in attObj) { // copy object to avoid the use of references, because web authors often reuse attObj for multiple SWFs
							att[i] = attObj[i];
						}
					}
					att.data = swfUrlStr;
					att.width = widthStr;
					att.height = heightStr;
					var par = {}; 
					if (parObj && typeof parObj === OBJECT) {
						for (var j in parObj) { // copy object to avoid the use of references, because web authors often reuse parObj for multiple SWFs
							par[j] = parObj[j];
						}
					}
					if (flashvarsObj && typeof flashvarsObj === OBJECT) {
						for (var k in flashvarsObj) { // copy object to avoid the use of references, because web authors often reuse flashvarsObj for multiple SWFs
							if (typeof par.flashvars != UNDEF) {
								par.flashvars += "&" + k + "=" + flashvarsObj[k];
							}
							else {
								par.flashvars = k + "=" + flashvarsObj[k];
							}
						}
					}
					if (hasPlayerVersion(swfVersionStr)) { // create SWF
						var obj = createSWF(att, par, replaceElemIdStr);
						if (att.id == replaceElemIdStr) {
							setVisibility(replaceElemIdStr, true);
						}
						callbackObj.success = true;
						callbackObj.ref = obj;
					}
					else if (xiSwfUrlStr && canExpressInstall()) { // show Adobe Express Install
						att.data = xiSwfUrlStr;
						showExpressInstall(att, par, replaceElemIdStr, callbackFn);
						return;
					}
					else { // show alternative content
						setVisibility(replaceElemIdStr, true);
					}
					if (callbackFn) { callbackFn(callbackObj); }
				});
			}
			else if (callbackFn) { callbackFn(callbackObj);	}
		},
		
		switchOffAutoHideShow: function() {
			autoHideShow = false;
		},
		
		ua: ua,
		
		getFlashPlayerVersion: function() {
			return { major:ua.pv[0], minor:ua.pv[1], release:ua.pv[2] };
		},
		
		hasFlashPlayerVersion: hasPlayerVersion,
		
		createSWF: function(attObj, parObj, replaceElemIdStr) {
			if (ua.w3) {
				return createSWF(attObj, parObj, replaceElemIdStr);
			}
			else {
				return undefined;
			}
		},
		
		showExpressInstall: function(att, par, replaceElemIdStr, callbackFn) {
			if (ua.w3 && canExpressInstall()) {
				showExpressInstall(att, par, replaceElemIdStr, callbackFn);
			}
		},
		
		removeSWF: function(objElemIdStr) {
			if (ua.w3) {
				removeSWF(objElemIdStr);
			}
		},
		
		createCSS: function(selStr, declStr, mediaStr, newStyleBoolean) {
			if (ua.w3) {
				createCSS(selStr, declStr, mediaStr, newStyleBoolean);
			}
		},
		
		addDomLoadEvent: addDomLoadEvent,
		
		addLoadEvent: addLoadEvent,
		
		getQueryParamValue: function(param) {
			var q = doc.location.search || doc.location.hash;
			if (q) {
				if (/\?/.test(q)) { q = q.split("?")[1]; } // strip question mark
				if (param == null) {
					return urlEncodeIfNecessary(q);
				}
				var pairs = q.split("&");
				for (var i = 0; i < pairs.length; i++) {
					if (pairs[i].substring(0, pairs[i].indexOf("=")) == param) {
						return urlEncodeIfNecessary(pairs[i].substring((pairs[i].indexOf("=") + 1)));
					}
				}
			}
			return "";
		},
		
		// For internal usage only
		expressInstallCallback: function() {
			if (isExpressInstallActive) {
				var obj = getElementById(EXPRESS_INSTALL_ID);
				if (obj && storedAltContent) {
					obj.parentNode.replaceChild(storedAltContent, obj);
					if (storedAltContentId) {
						setVisibility(storedAltContentId, true);
						if (ua.ie && ua.win) { storedAltContent.style.display = "block"; }
					}
					if (storedCallbackFn) { storedCallbackFn(storedCallbackObj); }
				}
				isExpressInstallActive = false;
			} 
		}
	};
}();
;
(function ($) {

/**
 * Toggle the visibility of a fieldset using smooth animations.
 */
Drupal.toggleFieldset = function (fieldset) {
  var $fieldset = $(fieldset);
  if ($fieldset.is('.collapsed')) {
    var $content = $('> .fieldset-wrapper', fieldset).hide();
    $fieldset
      .removeClass('collapsed')
      .trigger({ type: 'collapsed', value: false })
      .find('> legend span.fieldset-legend-prefix').html(Drupal.t('Hide'));
    $content.slideDown({
      duration: 'fast',
      easing: 'linear',
      complete: function () {
        Drupal.collapseScrollIntoView(fieldset);
        fieldset.animating = false;
      },
      step: function () {
        // Scroll the fieldset into view.
        Drupal.collapseScrollIntoView(fieldset);
      }
    });
  }
  else {
    $fieldset.trigger({ type: 'collapsed', value: true });
    $('> .fieldset-wrapper', fieldset).slideUp('fast', function () {
      $fieldset
        .addClass('collapsed')
        .find('> legend span.fieldset-legend-prefix').html(Drupal.t('Show'));
      fieldset.animating = false;
    });
  }
};

/**
 * Scroll a given fieldset into view as much as possible.
 */
Drupal.collapseScrollIntoView = function (node) {
  var h = document.documentElement.clientHeight || document.body.clientHeight || 0;
  var offset = document.documentElement.scrollTop || document.body.scrollTop || 0;
  var posY = $(node).offset().top;
  var fudge = 55;
  if (posY + node.offsetHeight + fudge > h + offset) {
    if (node.offsetHeight > h) {
      window.scrollTo(0, posY);
    }
    else {
      window.scrollTo(0, posY + node.offsetHeight - h + fudge);
    }
  }
};

Drupal.behaviors.collapse = {
  attach: function (context, settings) {
    $('fieldset.collapsible', context).once('collapse', function () {
      var $fieldset = $(this);
      // Expand fieldset if there are errors inside, or if it contains an
      // element that is targeted by the URI fragment identifier.
      var anchor = location.hash && location.hash != '#' ? ', ' + location.hash : '';
      if ($fieldset.find('.error' + anchor).length) {
        $fieldset.removeClass('collapsed');
      }

      var summary = $('<span class="summary"></span>');
      $fieldset.
        bind('summaryUpdated', function () {
          var text = $.trim($fieldset.drupalGetSummary());
          summary.html(text ? ' (' + text + ')' : '');
        })
        .trigger('summaryUpdated');

      // Turn the legend into a clickable link, but retain span.fieldset-legend
      // for CSS positioning.
      var $legend = $('> legend .fieldset-legend', this);

      $('<span class="fieldset-legend-prefix element-invisible"></span>')
        .append($fieldset.hasClass('collapsed') ? Drupal.t('Show') : Drupal.t('Hide'))
        .prependTo($legend)
        .after(' ');

      // .wrapInner() does not retain bound events.
      var $link = $('<a class="fieldset-title" href="#"></a>')
        .prepend($legend.contents())
        .appendTo($legend)
        .click(function () {
          var fieldset = $fieldset.get(0);
          // Don't animate multiple times.
          if (!fieldset.animating) {
            fieldset.animating = true;
            Drupal.toggleFieldset(fieldset);
          }
          return false;
        });

      $legend.append(summary);
    });
  }
};

})(jQuery);
;
(function ($) {

/**
 * Retrieves the summary for the first element.
 */
$.fn.drupalGetSummary = function () {
  var callback = this.data('summaryCallback');
  return (this[0] && callback) ? $.trim(callback(this[0])) : '';
};

/**
 * Sets the summary for all matched elements.
 *
 * @param callback
 *   Either a function that will be called each time the summary is
 *   retrieved or a string (which is returned each time).
 */
$.fn.drupalSetSummary = function (callback) {
  var self = this;

  // To facilitate things, the callback should always be a function. If it's
  // not, we wrap it into an anonymous function which just returns the value.
  if (typeof callback != 'function') {
    var val = callback;
    callback = function () { return val; };
  }

  return this
    .data('summaryCallback', callback)
    // To prevent duplicate events, the handlers are first removed and then
    // (re-)added.
    .unbind('formUpdated.summary')
    .bind('formUpdated.summary', function () {
      self.trigger('summaryUpdated');
    })
    // The actual summaryUpdated handler doesn't fire when the callback is
    // changed, so we have to do this manually.
    .trigger('summaryUpdated');
};

/**
 * Sends a 'formUpdated' event each time a form element is modified.
 */
Drupal.behaviors.formUpdated = {
  attach: function (context) {
    // These events are namespaced so that we can remove them later.
    var events = 'change.formUpdated click.formUpdated blur.formUpdated keyup.formUpdated';
    $(context)
      // Since context could be an input element itself, it's added back to
      // the jQuery object and filtered again.
      .find(':input').andSelf().filter(':input')
      // To prevent duplicate events, the handlers are first removed and then
      // (re-)added.
      .unbind(events).bind(events, function () {
        $(this).trigger('formUpdated');
      });
  }
};

/**
 * Prepopulate form fields with information from the visitor cookie.
 */
Drupal.behaviors.fillUserInfoFromCookie = {
  attach: function (context, settings) {
    $('form.user-info-from-cookie').once('user-info-from-cookie', function () {
      var formContext = this;
      $.each(['name', 'mail', 'homepage'], function () {
        var $element = $('[name=' + this + ']', formContext);
        var cookie = $.cookie('Drupal.visitor.' + this);
        if ($element.length && cookie) {
          $element.val(cookie);
        }
      });
    });
  }
};

})(jQuery);
;
