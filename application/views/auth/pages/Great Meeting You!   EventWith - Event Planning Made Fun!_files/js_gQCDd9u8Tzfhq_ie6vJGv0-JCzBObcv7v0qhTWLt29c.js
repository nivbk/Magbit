/**
 * sasson javascript core
 *
 */
(function($) {

  Drupal.sasson = {};

  /**
   * This script will watch files for changes and
   * automatically refresh the browser when a file is modified.
   */
  Drupal.sasson.watch = function(url, instant) {

    var request;
    var dateModified;

    // Check the last time the file was modified
    request = $.ajax({
      type: "HEAD",
      url: url,
      success: function () {
        dateModified = request.getResponseHeader("Last-Modified");
        interval = setInterval(check,1000);
      }
    });

    var updateStyle = function(filename) {
      var headElm = $("head > *:contains('" + filename + ".css')");
      if (headElm.length > 0) {
        // If it's in an @import rule
        headElm.html(headElm.html().replace(filename + '.css?', filename + '.css?s'));
      } else {
        // If it's in a <link> tag
        headElm = $('head > link[href*="' + filename + '.css"]');
        headElm.attr('href', headElm.attr('href').replace(filename + '.css?', filename + '.css?s'));
      }
      dateModified = request.getResponseHeader("Last-Modified");
    };

    // Check every second if the timestamp was modified
    var check = function() {
      request = $.ajax({
        type: "HEAD",
        url: url,
        success: function () {
          if (dateModified != request.getResponseHeader("Last-Modified")) {
            var filename = url.split('/');
            filename = filename[filename.length - 1].split('.');
            var fileExt = filename[1];
            filename = filename[0];
            if (instant && fileExt == 'css') {
              // css file - update head
              updateStyle(filename);
            } else if (instant && (fileExt == 'scss' || fileExt == 'sass')) {
              // SASS/SCSS file - trigger sass compilation with an ajax call and update head
              $.ajax({
                url: "",
                success: function () {
                  updateStyle(filename);
                }
              });
            } else {
              // Reload the page
              location.reload();
            }
          }
        }
      });
    };
  };

  Drupal.behaviors.sasson = {
    attach: function(context) {

      $('html').removeClass('no-js');

    }
  };

  Drupal.behaviors.showOverlay = {
    attach: function(context) {

      $('body.show-overlay').each(function() {
        var body = $(this);
        var overlay = $('<div id="overlay"><img src="'+ Drupal.settings.sasson['overlay_url'] +'"/></div>');
        var overlayToggle = $('<div class="toggle-overlay" ><div>' + Drupal.t('Overlay') + '</div></div>');
        body.append(overlay);
        body.append(overlayToggle);
        $("#overlay").css({ opacity: Drupal.settings.sasson['overlay_opacity'] });
        $('.toggle-overlay').click(function() {
          $('body').toggleClass('show-overlay');
          $('#overlay').toggle();
          $(this).toggleClass("off");
        });
        $("#overlay").draggable();
      });

    }
  };

  Drupal.behaviors.showGrid = {
    attach: function(context) {

      $('body.show-grid').each(function() {
        var body = $(this);
        var gridToggle = $('<div class="toggle-grid" ><div>' + Drupal.t('Grid') + '</div></div>');
        body.append(gridToggle);
        $('.toggle-grid').click(function() {
          $('body').toggleClass('show-grid');
          $(this).toggleClass("off");
        });
      });

    }
  };

})(jQuery);


// Console.log wrapper to avoid errors when firebug is not present
// usage: log('inside coolFunc',this,arguments);
// paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
window.log = function() {
  log.history = log.history || [];   // store logs to an array for reference
  log.history.push(arguments);
  if (this.console) {
    console.log(Array.prototype.slice.call(arguments));
  }
};
;
(function($) {
  // Overriding the alert function due to Drupal ajax error handling
  // See http://drupal.org/node/1232416
  window.alert = function(arg) {
    if (window.console && console.log) {
      console.log(arg);
    }
  };

	$(document).ready(function() {
		//console.log('asdasds');
		//$('.quicktabs-tabpage', '#quicktabs-container-event_sidebar').addClass('.scroll-pane');
	});

Drupal.behaviors.scrollbars = {
  attach: function(context) {
    //$('.quicktabs-tabpage', '#quicktabs-container-event_sidebar').addClass('.scroll-pane');
  }
};

Drupal.behaviors.password = {
  attach: function (context, settings) {
    var translate = settings.password;
    $('.form-type-password', '#user-register-form').once('password', showMeter);
    $('.form-item-pass', '#user-profile-form').once('password', showMeter);

    function showMeter() {
      var passwordInput = $(this).find('input:password');
      var innerWrapper = $(this);

      // Add identifying class to password element parent.
      innerWrapper.addClass('password-parent');

      // Add the description box.
      var passwordMeter = '<div class="password-strength"><div class="password-indicator"></div></div><div class="clear"></div><div class="form-type-checkbox password-checker"><input tabindex="1" type="checkbox" id="edit-verify-password" name="verify_password" value="1" class="form-checkbox"><label class="option" for="edit-verify-password">' + Drupal.t('Check to verify') + '</label></div><div class="clear"></div>';

      innerWrapper.append(passwordMeter);

      $('.form-item-pass', 'form').append($('<input name="fake-pass" type="text" id="fake-pass" />'));

      $('.password-checker', this).click(function() {
        // We are checking "not" because this code runs before the click event that adds this class
        if ($(this).hasClass('checked')) {
          $('#fake-pass').val($('#edit-pass-pass1').val());
          $('#fake-pass').show();
        }
        else {
          $('#fake-pass').hide();
        }
      });

      // Check the password strength.
      var passwordCheck = function () {

        // Evaluate the password strength.
        var result = Drupal.evaluatePasswordStrength(passwordInput.val(), settings.password);

        if (result.strength > 0) {
          var calc = (-(Math.ceil(result.strength/25) - 1) * 20);
          /*console.log(result.strength);
          console.log(calc);*/

          $(innerWrapper).find('.password-indicator').css('background-position', '0 ' + calc + 'px');
        }
      };

      // Monitor keyup and blur events.
      // Blur must be used because a mouse paste does not trigger keyup.
      passwordInput.keyup(passwordCheck).focus(passwordCheck).blur(passwordCheck);
    }
  }
};

/**
 * Evaluate the strength of a user's password.
 *
 * Returns the estimated strength and the relevant output message.
 */
Drupal.evaluatePasswordStrength = function (password, translate) {
  var weaknesses = 0, strength = 100, msg = [];

  var hasLowercase = /[a-z]+/.test(password);
  var hasUppercase = /[A-Z]+/.test(password);
  var hasNumbers = /[0-9]+/.test(password);
  var hasPunctuation = /[^a-zA-Z0-9]+/.test(password);

  // If there is a username edit box on the page, compare password to that, otherwise
  // use value from the database.
  var usernameBox = $('input.username');
  var username = (usernameBox.length > 0) ? usernameBox.val() : translate.username;

  // Lose 5 points for every character less than 6, plus a 30 point penalty.
  if (password.length < 6) {
    msg.push(translate.tooShort);
    strength -= ((6 - password.length) * 5) + 30;
  }

  // Count weaknesses.
  if (!hasLowercase) {
    msg.push(translate.addLowerCase);
    weaknesses++;
  }
  if (!hasUppercase) {
    msg.push(translate.addUpperCase);
    weaknesses++;
  }
  if (!hasNumbers) {
    msg.push(translate.addNumbers);
    weaknesses++;
  }
  if (!hasPunctuation) {
    msg.push(translate.addPunctuation);
    weaknesses++;
  }

  // Apply penalty for each weakness (balanced against length penalty).
  switch (weaknesses) {
    case 1:
      strength -= 12.5;
      break;

    case 2:
      strength -= 25;
      break;

    case 3:
      strength -= 40;
      break;

    case 4:
      strength -= 40;
      break;
  }

  // Check if password is the same as the username.
  if (password !== '' && password.toLowerCase() === username.toLowerCase()) {
    msg.push(translate.sameAsUsername);
    // Passwords the same as username are always very weak.
    strength = 5;
  }

  // Based on the strength, work out what text should be shown by the password strength meter.
  if (strength < 60) {
    indicatorText = translate.weak;
  } else if (strength < 70) {
    indicatorText = translate.fair;
  } else if (strength < 80) {
    indicatorText = translate.good;
  } else if (strength <= 100) {
    indicatorText = translate.strong;
  }

  // Assemble the final message.
  msg = translate.hasWeaknesses + '<ul><li>' + msg.join('</li><li>') + '</li></ul>';
  return { strength: strength, message: msg, indicatorText: indicatorText };

};

Drupal.behaviors.checkbox = {
  attach: function (context, settings) {
    $('input:checkbox, input:radio', context).parent().once('checkbox', function() {
      $('input', this).hide();
      var image = $(this).prepend($("<div class='check-image'></div>"));

      $('.check-image, label', this).click(function() {
        $(this).parent().toggleClass('checked');

        // Handling the check of the checkbox
        if ($('input', $(this).parent()).attr('checked')) {
          $('input', $(this).parent()).attr('checked', false);
        }
        else {
          $('input', $(this).parent()).attr('checked', true);
        }
      });

      if ($('input', this).attr('checked') == true) {
        $(this).addClass('checked');
      }
    });
  }
}

Drupal.ewPlaceholderFallback = {
  cleanup: function() {
    $('form').find('[placeholder]').each(function() {
      var input = $(this);
      if (input.val() == input.attr('placeholder')) {
        input.val('');
      }
    });
  }
};

Drupal.behaviors.ewPlaceholderFallback = {
  attach: function(context, settings) {
    $('[placeholder]').once('ewPlaceholderFallback', function() {
      if(!Modernizr.input.placeholder){
        $(this).focus(function() {
          var input = $(this);
          if (input.val() == input.attr('placeholder')) {
          input.val('');
          input.removeClass('placeholder');
          }
        }).blur(function() {
          var input = $(this);
          if (input.val() == '' || input.val() == input.attr('placeholder')) {
          input.addClass('placeholder');
          input.val(input.attr('placeholder'));
          }
        }).blur();
      }
    });
  }
};

jQuery.fn.center = function (type) {
  this.css("position","absolute");

  if (typeof type === "undefined") {
    type = 'default';
  }

  switch (type) {
    case 'vertical':
      this.css("top", Math.max(0, (($(window).height() - this.outerHeight()) / 2) + $(window).scrollTop()) + "px");
    break;
    case 'horizontal':
      this.css("left", Math.max(0, (($(window).width() - this.outerWidth()) / 2) + $(window).scrollLeft()) + "px");
    break;
    default:
      this.css("top", Math.max(0, (($(window).height() - this.outerHeight()) / 2) + $(window).scrollTop()) + "px");
      this.css("left", Math.max(0, (($(window).width() - this.outerWidth()) / 2) + $(window).scrollLeft()) + "px");
    break;
  }

  return this;
}

jQuery.fn.toggleDisabled = function(){
  return this.each(function() {
    this.disabled = !this.disabled;
  });
};

jQuery.fn.validateEmail = function(email) {
  var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
  if(!emailReg.test(email)) {
    return false;
  } else {
    return true;
  }
}

jQuery.expr[':'].Contains = function(a,i,m){
    return (a.textContent || a.innerText || "").toUpperCase().indexOf(m[3].toUpperCase())>=0;
};

})(jQuery);
;
