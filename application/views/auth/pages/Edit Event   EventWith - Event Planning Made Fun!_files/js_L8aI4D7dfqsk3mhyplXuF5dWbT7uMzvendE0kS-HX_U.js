(function($) {
Drupal.ewBeta = {
  validateEmail: function(email) {
    if (email == '') {
      Drupal.ewBeta.inviteError(Drupal.t('Please enter a valid email address'));
    }
    else {
      if (!jQuery.fn.validateEmail(email)) {
        Drupal.ewBeta.inviteError(Drupal.t('Please enter a valid email address'));
      }
      else {
        return true;
      }
    }
  },
  inviteError: function(errMsg) {
    $('.notify .error', '#beta-wrapper').text(errMsg);
    $('.notify .error', '#beta-wrapper').css('visibility', 'visible');
    $('.notify .error', '#beta-wrapper').effect('shake', {'distance': 3, 'times': 2}, 100);

    $('#edit-email input', '#requestinvitation-form').blur();
  }
};

Drupal.behaviors.ewBeta = {
  attach: function(context, settings) {
    $('#beta-wrapper', context).once('ewBeta', function() {
      $('.enter', this).click(function() {
        $.ajax({
          url: 'ewhp/verify/code',
          data: {
            'code': $('#edit-code').val(),
          },
          dataType: 'json',
          type: 'POST',

        }).done(function ( data ) {
          if (data.status == true) {
            $('#beta-wrapper').css({
              'position': 'absolute',
              'top': '0px',
              'z-index': '9999999',
            });
            $('.gsfn-widget-tab').show(); // get stisfaction
            $('#featured').show();
            $('#left-side-bg').show();
            $('#page').show();
            $('#right-side-b').show();
            $('#header').slideDown();
            $('#footer').show();

            $('#beta-wrapper').effect('drop', { direction: "down" });
          }
          else {
            // On wrong code
            $('.invite .error', '#beta-wrapper').text(Drupal.t('Wrong code')) ;
            $('.invite .error', '#beta-wrapper').css('visibility', 'visible');
            $('.invite .error', '#beta-wrapper').effect('shake', {'distance': 3, 'times': 2}, 100);

            $('.code input', '#beta-wrapper').blur();
          }
        });

        return false;
      });

      $('.code input', this).bind('focus', function(e) {
        $('.invite .error', '#beta-wrapper').css('visibility', 'hidden');
      });

      $('.code input', this).bind('keypress', function(e) {
        var code = (e.keyCode ? e.keyCode : e.which);
        if(code == 13) { //Enter keycode
          $('.enter', '#beta-wrapper').click();
        }
      });

      $('#edit-email', '#requestinvitation-form').bind('focus', function(e) {
        $('.notify .error', '#beta-wrapper').css('visibility', 'hidden');
      });

      $('#edit-email', '#requestinvitation-form').bind('keypress', function(e) {
        var code = (e.keyCode ? e.keyCode : e.which);
        if(code == 13) { //Enter keycode
          if (!Drupal.ewBeta.validateEmail($(this).val())) {
            return false;
          }
        }
      });
      $('#edit-submit', '#requestinvitation-form').bind('click', function(e) {
        if (!Drupal.ewBeta.validateEmail($('#edit-email', '#requestinvitation-form').val())) {
          e.preventDefault();
          return false;
        }
      });
    });
  }
}

Drupal.behaviors.ewHP = {
  attach: function(context, settings) {
    $('#block-eventwith-hp-introduction', context).once('ewHP', function() {
      $('.video-text, .video-image', this).click(function(e) {

        $('#ew-overlay').show();
        $('.video-wrapper', '#block-eventwith-hp-introduction').center().fadeIn();
      });

      $('#secondYT').click(function(e) {

        $('#ew-overlay').show();
        $('.video-wrapper', '#block-eventwith-hp-introduction').center().fadeIn();
      });

      $('#scroller-down', this).click(function(e) {
        $('html, body').animate({
          scrollTop: $('#page-wrapper').offset().top,
        }, 1000);
      });

      $('.close-btn', this).click(function(e) {
        $('.video-wrapper', '#block-eventwith-hp-introduction').center().effect('drop', { direction: "down" });
        $('#ew-overlay').hide();
      });

      $('#ew-overlay').click(function(e) {
        $('.video-wrapper', '#block-eventwith-hp-introduction').center().effect('drop', { direction: "down" });
        $('#ew-overlay').hide();
      });
    });

    $('#block-eventwith-hp-lets-start', context).once('ewHP', function() {
      $('#scroller-up', this).click(function(e) {
        $('html, body').animate({
          scrollTop: 0,
        }, 1000);
      });
    });
  }
}

})(jQuery);
;
(function($) {

Drupal.behaviors.eventwithPopups = {
  attach: function(context, settings) {
    $('#popup-wrapper', context).once('eventwithPopups', function() {

    	$('.ok', '#warning-actions').live('click', function() {
    		$('#popup-wrapper').triggerHandler('click', [{success: true}]);
    	});

    	$('.cancel', '#warning-actions').live('click', function() {
    		$('#popup-wrapper').triggerHandler('click', [{success: false}]);
    	});
		});
	}
}

})(jQuery);;
(function($) {

Drupal.behaviors.ewReportsHomepage = {
  attach: function(context, settings) {
    $('body.front', context).once('ewReportsHomepage', function() {
      mixpanel.track('page view', {'page name': 'homepage'});

      // Video Tracking
      $('.video-text', '#block-eventwith-hp-introduction').click(function(e) {
        mixpanel.track("HP Top Video Play");
      });
      $('#secondYT').click(function(e) {
        mixpanel.track("HP Bottom Video Play");
      });

      // Login/Register tracking
      mixpanel.track_links('#block-eventwith-hp-introduction a.facebook-action-connect', 'HP Top Facebook Connect clicked');
      mixpanel.track_links('#block-eventwith-hp-lets-start a.facebook-action-connect', 'HP Bottom Facebook Connect clicked');
      mixpanel.track_links('#block-eventwith-eventwith-user .first a', 'HP Login Link clicked');
      mixpanel.track_links('#block-eventwith-eventwith-user .last a', 'HP Signup Link clicked');
    });
  }
}

Drupal.behaviors.ewReportsRegister = {
  attach: function(context, settings) {
    $('body.page-user-register', context).once('ewReportsRegister', function() {
      mixpanel.track('page view', {'page name': 'user signup'});

      mixpanel.track_forms('#user-register-form', 'User Register submited');
      mixpanel.track_links('#block-fboauth-login a.facebook-action-connect', 'User Register FB Connect clicked');
    });
  }
}

Drupal.behaviors.ewReportsLogin = {
  attach: function(context, settings) {
    $('body.page-user-login', context).once('ewReportsLogin', function() {
      mixpanel.track('page view', {'page name': 'user login'});

      mixpanel.track_forms('#user-login', 'User Login submited');
      mixpanel.track_links('#block-fboauth-login a.facebook-action-connect', 'User Login FB Connect clicked');
    });
  }
}

Drupal.behaviors.ewReportsDashboard = {
  attach: function(context, settings) {
    $('body.page-dashboard', context).once('ewReportsDashboard', function() {
      mixpanel.track('page view', {'page name': 'user dashboard'});
    });
  }
}

Drupal.behaviors.ewReportsCreateEvent = {
  attach: function(context, settings) {
    $('body.page-node-edit.node-type-event', context).once('ewReportsCreateEvent', function() {
      mixpanel.track('page view', {'page name': 'create event'});
    });
  }
}

Drupal.behaviors.ewReportsEvent = {
  attach: function(context, settings) {
    $('body.node-type-event.section-event', context).once('ewReportsEvent', function() {
      mixpanel.track('page view', {'page name': 'event'});
    });
  }
}

Drupal.behaviors.ewReportsInvitation = {
  attach: function(context, settings) {
    $('body.page-join-event', context).once('ewReportsInvitation', function() {
      mixpanel.track('page view', {'page name': 'invitation'});
    });
  }
}

Drupal.behaviors.ewReportsSettings = {
  attach: function(context, settings) {
    $('body.page-user-edit', context).once('ewReportsSettings', function() {
      mixpanel.track('page view', {'page name': 'user settings'});
    });
  }
}

Drupal.behaviors.ewReportsFBInvitation = {
  attach: function(context, settings) {
    $('body.page-fbinvite', context).once('ewReportsFBInvitation', function() {
      mixpanel.track('page view', {'page name': 'fb invitation'});
    });
  }
}

})(jQuery);
;
(function ($) {

/**
 * Terminology:
 *
 *   "Link" means "Everything which is in flag.tpl.php" --and this may contain
 *   much more than the <A> element. On the other hand, when we speak
 *   specifically of the <A> element, we say "element" or "the <A> element".
 */

/**
 * The main behavior to perform AJAX toggling of links.
 */
Drupal.flagLink = function(context) {
  /**
   * Helper function. Updates a link's HTML with a new one.
   *
   * @param element
   *   The <A> element.
   * @return
   *   The new link.
   */
  function updateLink(element, newHtml) {
    var $newLink = $(newHtml);

    // Initially hide the message so we can fade it in.
    $('.flag-message', $newLink).css('display', 'none');

    // Reattach the behavior to the new <A> element. This element
    // is either whithin the wrapper or it is the outer element itself.
    var $nucleus = $newLink.is('a') ? $newLink : $('a.flag', $newLink);
    $nucleus.addClass('flag-processed').click(flagClick);

    // Find the wrapper of the old link.
    var $wrapper = $(element).parents('.flag-wrapper:first');
    if ($wrapper.length == 0) {
      // If no ancestor wrapper was found, or if the 'flag-wrapper' class is
      // attached to the <a> element itself, then take the element itself.
      $wrapper = $(element);
    }
    // Replace the old link with the new one.
    $wrapper.after($newLink).remove();
    Drupal.attachBehaviors($newLink.get(0));

    $('.flag-message', $newLink).fadeIn();
    setTimeout(function(){ $('.flag-message', $newLink).fadeOut() }, 3000);
    return $newLink.get(0);
  }

  /**
   * A click handler that is attached to all <A class="flag"> elements.
   */
  function flagClick() {
    // 'this' won't point to the element when it's inside the ajax closures,
    // so we reference it using a variable.
    var element = this;

    // While waiting for a server response, the wrapper will have a
    // 'flag-waiting' class. Themers are thus able to style the link
    // differently, e.g., by displaying a throbber.
    var $wrapper = $(element).parents('.flag-wrapper');
    if ($wrapper.is('.flag-waiting')) {
      // Guard against double-clicks.
      return false;
    }
    $wrapper.addClass('flag-waiting');

    // Hide any other active messages.
    $('span.flag-message:visible').fadeOut();

    // Send POST request
    $.ajax({
      type: 'POST',
      url: element.href,
      data: { js: true },
      dataType: 'json',
      success: function (data) {
        if (data.status) {
          // Success.
          data.link = $wrapper.get(0);
          $.event.trigger('flagGlobalBeforeLinkUpdate', [data]);
          if (!data.preventDefault) { // A handler may cancel updating the link.
            data.link = updateLink(element, data.newLink);
          }
          $.event.trigger('flagGlobalAfterLinkUpdate', [data]);
        }
        else {
          // Failure.
          alert(data.errorMessage);
          $wrapper.removeClass('flag-waiting');
        }
      },
      error: function (xmlhttp) {
        alert('An HTTP error '+ xmlhttp.status +' occurred.\n'+ element.href);
        $wrapper.removeClass('flag-waiting');
      }
    });
    return false;
  }

  $('a.flag-link-toggle:not(.flag-processed)', context).addClass('flag-processed').click(flagClick);
};

/**
 * Prevent anonymous flagging unless the user has JavaScript enabled.
 */
Drupal.flagAnonymousLinks = function(context) {
  $('a.flag:not(.flag-anonymous-processed)', context).each(function() {
    this.href += (this.href.match(/\?/) ? '&' : '?') + 'has_js=1';
    $(this).addClass('flag-anonymous-processed');
  });
}

String.prototype.flagNameToCSS = function() {
  return this.replace(/_/g, '-');
}

/**
 * A behavior specifically for anonymous users. Update links to the proper state.
 */
Drupal.flagAnonymousLinkTemplates = function(context) {
  // Swap in current links. Cookies are set by PHP's setcookie() upon flagging.

  var templates = Drupal.settings.flag.templates;

  // Build a list of user-flags.
  var userFlags = Drupal.flagCookie('flags');
  if (userFlags) {
    userFlags = userFlags.split('+');
    for (var n in userFlags) {
      var flagInfo = userFlags[n].match(/(\w+)_(\d+)/);
      var flagName = flagInfo[1];
      var contentId = flagInfo[2];
      // User flags always default to off and the JavaScript toggles them on.
      if (templates[flagName + '_' + contentId]) {
        $('.flag-' + flagName.flagNameToCSS() + '-' + contentId, context).after(templates[flagName + '_' + contentId]).remove();
      }
    }
  }

  // Build a list of global flags.
  var globalFlags = document.cookie.match(/flag_global_(\w+)_(\d+)=([01])/g);
  if (globalFlags) {
    for (var n in globalFlags) {
      var flagInfo = globalFlags[n].match(/flag_global_(\w+)_(\d+)=([01])/);
      var flagName = flagInfo[1];
      var contentId = flagInfo[2];
      var flagState = (flagInfo[3] == '1') ? 'flag' : 'unflag';
      // Global flags are tricky, they may or may not be flagged in the page
      // cache. The template always contains the opposite of the current state.
      // So when checking global flag cookies, we need to make sure that we
      // don't swap out the link when it's already in the correct state.
      if (templates[flagName + '_' + contentId]) {
        $('.flag-' + flagName.flagNameToCSS() + '-' + contentId, context).each(function() {
          if ($(this).find('.' + flagState + '-action').size()) {
            $(this).after(templates[flagName + '_' + contentId]).remove();
          }
        });
      }
    }
  }
}

/**
 * Utility function used to set Flag cookies.
 *
 * Note this is a direct copy of the jQuery cookie library.
 * Written by Klaus Hartl.
 */
Drupal.flagCookie = function(name, value, options) {
  if (typeof value != 'undefined') { // name and value given, set cookie
    options = options || {};
    if (value === null) {
      value = '';
      options = $.extend({}, options); // clone object since it's unexpected behavior if the expired property were changed
      options.expires = -1;
    }
    var expires = '';
    if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
      var date;
      if (typeof options.expires == 'number') {
        date = new Date();
        date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
      } else {
        date = options.expires;
      }
      expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
    }
    // NOTE Needed to parenthesize options.path and options.domain
    // in the following expressions, otherwise they evaluate to undefined
    // in the packed version for some reason...
    var path = options.path ? '; path=' + (options.path) : '';
    var domain = options.domain ? '; domain=' + (options.domain) : '';
    var secure = options.secure ? '; secure' : '';
    document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
  } else { // only name given, get cookie
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
      var cookies = document.cookie.split(';');
      for (var i = 0; i < cookies.length; i++) {
        var cookie = jQuery.trim(cookies[i]);
        // Does this cookie string begin with the name we want?
        if (cookie.substring(0, name.length + 1) == (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }
};

Drupal.behaviors.flagLink = {};
Drupal.behaviors.flagLink.attach = function(context) {
  // For anonymous users with the page cache enabled, swap out links with their
  // current state for the user.
  if (Drupal.settings.flag && Drupal.settings.flag.templates) {
    Drupal.flagAnonymousLinkTemplates(context);
  }

  // For all anonymous users, require JavaScript for flagging to prevent spiders
  // from flagging things inadvertently.
  if (Drupal.settings.flag && Drupal.settings.flag.anonymous) {
    Drupal.flagAnonymousLinks(context);
  }

  // On load, bind the click behavior for all links on the page.
  Drupal.flagLink(context);
};

})(jQuery);
;
// Image Node Auto-Format with Auto Image Grouping.
// Original version by Steve McKenzie.
// Altered by Stella Power for jQuery version.

(function ($) {

function parse_url(url, param) {
  param = param.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
  url = url.replace(/&amp;/, "&");
  var regexS = "[\\?&]"+param+"=([^&#]*)";
  var regex = new RegExp(regexS);
  var results = regex.exec(url);
  if (results === null) {
    return "";
  }
  else {
    return results[1];
  }
}


function lightbox2_init_triggers(classes, rel_type, custom_class) {
  if (classes == '' || rel_type == 0) {
    return;
  }
  var settings = Drupal.settings.lightbox2;

  var link_target  = "";
  if (settings.node_link_target !== 0) {
    link_target = 'target="'+ settings.node_link_target +'"';
  }

  $("a:has("+classes+")").each(function(i) {
    if ((!settings.disable_for_gallery_lists && !settings.disable_for_acidfree_gallery_lists) || (!$(this).parents("td.giAlbumCell").attr("class") && !$(this).parents(".galleries").length && !$(this).parents(".acidfree-folder").length && !$(this).parents(".acidfree-list").length) || ($(this).parents(".galleries").length && !settings.disable_for_gallery_lists) || (($(this).parents(".acidfree-folder").length || $(this).parents(".acidfree-list").length) && !settings.disable_for_acidfree_gallery_lists)) {
      var child = $(this).find(classes);
      // Ensure the child has a class attribute we can work with.
      if ($(child).attr("class")) {
        // Set the alt text.
        var alt = $(child).attr("alt");
        if (!alt) {
          alt = "";
        }

        // Set the image node link text.
        var link_text = settings.node_link_text;
        var download_link_text = settings.download_link_text;
        var rewrite = 1;

        // Set the rel attribute.
        var rel = "lightbox";
        var lightframe = false;
        if (rel_type == "lightframe_ungrouped") {
          rel = "lightframe[]";
          lightframe = true;
        }
        else if (rel_type == "lightframe") {
          lightframe = true;
        }
        else if (rel_type == "lightbox_ungrouped") {
          rel = "lightbox[]";
        }
        if (rel_type != "lightbox_ungrouped" && rel_type != "lightframe_ungrouped") {
          rel = rel_type + "[" + $(child).attr("class") + "]";
        }

        // Set the basic href attribute - need to ensure there's no language
        // string (e.g. /en) prepended to the URL.
        var id = null;
        var href = $(child).attr("src");
        var download = null;
        var orig_href = $(this).attr("href");
        var pattern = new RegExp(settings.file_path);
        if (orig_href.match(pattern)) {
          var lang_pattern = new RegExp(Drupal.settings.basePath + "\\w\\w\\/");
          orig_href = orig_href.replace(lang_pattern, Drupal.settings.basePath);
        }
        var frame_href = orig_href;
        // Handle flickr images.
        if ($(child).attr("class").match("flickr-photo-img") ||
          $(child).attr("class").match("flickr-photoset-img")) {
          href = $(child).attr("src").replace("_s.", ".").replace("_t.", ".").replace("_m.", ".").replace("_b.", ".");
          if (rel_type != "lightbox_ungrouped" && rel_type != "lightframe_ungrouped") {
            rel = rel_type + "[flickr]";
            if ($(child).parents("div.block-flickr").attr("class")) {
              id = $(child).parents("div.block-flickr").attr("id");
              rel = rel_type + "["+ id +"]";
            }
          }
          download = href;
        }

        // Handle "image-img_assist_custom" images.
        else if ($(child).filter("img[class*=img_assist_custom]").size()) {
          // Image assist uses "+" signs for spaces which doesn't work for
          // normal links.
          if (settings.display_image_size != "original") {
            orig_href = orig_href.replace(/\+/, " ");
            href = $(child).attr("src").replace(new RegExp("\\.img_assist_custom-[0-9]+x[0-9]+"), ((settings.display_image_size === "")?settings.display_image_size:"."+ settings.display_image_size));
            if (rel_type != "lightbox_ungrouped" && rel_type != "lightframe_ungrouped") {
              rel = rel_type + "[node_images]";
            }
            if (lightframe) {
              frame_href = orig_href + "/lightbox2";
            }
          }
          else {
            rewrite = 0;
          }
        }

        // Handle "inline" images.
        else if ($(child).attr("class").match("inline")) {
          href = orig_href;
        }

        // Handle gallery2 block images.
        else if ($(child).attr("class").match("ImageFrame_image") || $(child).attr("class").match("ImageFrame_none")) {
          var thumb_id = parse_url(href, "g2_itemId");
          var new_id = parse_url(orig_href, "g2_itemId");
          if (new_id && thumb_id) {
            var g2pattern = new RegExp("g2_itemId="+thumb_id);
            var replacement = "g2_itemId="+ new_id;
            href = href.replace(g2pattern, replacement);
          }
          rel = rel_type + "[gallery2]";
          if ($(child).parents("div.block-gallery").attr("class")) {
            id = $(child).parents("div.block-gallery").attr("id");
            rel = rel_type + "["+ id +"]";
          }
          download = href;
        }


        // Set the href attribute.
        else if (settings.image_node_sizes != '()' && !custom_class) {
          if (settings.display_image_size != "original") {
            href = $(child).attr("src").replace(new RegExp(settings.image_node_sizes), ((settings.display_image_size === "")?settings.display_image_size:"."+ settings.display_image_size)).replace(/(image\/view\/\d+)(\/[\w\-]*)/, ((settings.display_image_size === "")?"$1/_original":"$1/"+ settings.display_image_size));
            if (rel_type != "lightbox_ungrouped" && rel_type != "lightframe_ungrouped") {
              rel = rel_type + "[node_images]";
              if ($(child).parents("div.block-multiblock,div.block-image").attr("class")) {
                id = $(child).parents("div.block-multiblock,div.block-image").attr("id");
                rel = rel_type + "["+ id +"]";
              }
            }
            download = $(child).attr("src").replace(new RegExp(settings.image_node_sizes), "").replace(/(image\/view\/\d+)(\/[\w\-]*)/, "$1/_original");
            if (lightframe) {
              frame_href = orig_href + "/lightbox2";
            }
          }
          else {
            rewrite = 0;
          }
        }
        // Modify the image url.
        var img_title = $(child).attr("title");
        if (!img_title) {
          img_title = $(this).attr("title");
          if (!img_title) {
            img_title = $(child).attr("alt");
          }
          $(child).attr({title: img_title});
        }
        if (lightframe) {
          href = frame_href;
        }
        if (rewrite) {
          if (!custom_class) {
            var title_link = "";
            if (link_text.length) {
              title_link = "<br /><br /><a href=\"" + orig_href + "\" id=\"lightbox2-node-link-text\" "+ link_target +" >"+ link_text + "</a>";
            }
            if (download_link_text.length && download) {
              title_link = title_link + " - <a href=\"" + download + "\" id=\"lightbox2-download-link-text\" target=\"_blank\">" + download_link_text + "</a>";
            }
            rel = rel + "[" + img_title + title_link + "]";
            $(this).attr({
              rel: rel,
              href: href
            });
          }
          else {
            if (rel_type != "lightbox_ungrouped" && rel_type != "lightframe_ungrouped") {
              rel = rel_type + "[" + $(child).attr("class") + "]";
              if ($(child).parents("div.block-image").attr("class")) {
                id = $(child).parents("div.block-image").attr("id");
                rel = rel_type + "["+ id +"]";
              }
            }
            rel = rel + "[" + img_title + "]";
            $(this).attr({
              rel: rel,
              href: orig_href
            });
          }
        }
      }
    }

  });
}

function lightbox2_image_nodes() {
  var settings = Drupal.settings.lightbox2;

  // Don't do it on the image assist popup selection screen.
  var img_assist = document.getElementById("img_assist_thumbs");
  if (!img_assist) {

    // Select the enabled image types.
    lightbox2_init_triggers(settings.trigger_lightbox_classes, "lightbox_ungrouped");
    lightbox2_init_triggers(settings.custom_trigger_classes, settings.custom_class_handler, true);
    lightbox2_init_triggers(settings.trigger_lightbox_group_classes, "lightbox");
    lightbox2_init_triggers(settings.trigger_slideshow_classes, "lightshow");
    lightbox2_init_triggers(settings.trigger_lightframe_classes, "lightframe_ungrouped");
    lightbox2_init_triggers(settings.trigger_lightframe_group_classes, "lightframe");
  }
}

Drupal.behaviors.initAutoLightbox = {
  attach: function(context, settings) {
    lightbox2_image_nodes();
  }
};

//End jQuery block
}(jQuery));
;
