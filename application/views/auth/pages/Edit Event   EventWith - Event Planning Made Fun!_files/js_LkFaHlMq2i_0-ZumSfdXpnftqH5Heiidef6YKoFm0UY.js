(function($) {

Drupal.behaviors.ewFBFriendsRow = {
  attach: function(context, settings) {
    $('tbody tr', '#facebook_friends_table').once('ewFBFriendsRow', function() {
      $('.name, .picture', this).click(function() {
        $(this).parent().find('.check-image').click();
      });
    });
  }
};

Drupal.behaviors.ewFBChooserButton = {
  attach: function(context, settings) {
    $('.fb-friend-chooser', '#ew-fb-invite').once('ewFBChooserButton', function() {
      if (top.location.search == '?fb=chooser' && $('.friends-wrapper .friend', '#friends-box').length > 0){
        $('html, body').animate({
          scrollTop: $(this).offset().top - 120
        }, 100, function() {
          $('#ew-overlay').show();
          Drupal.ewFBFriendsBox.show();
        });
      }

      $(this).click(function() {
        Drupal.ewEditForm.saveData();

        if ($(this).children('.facebook-action-connect').length == 0) {
          $('#ew-overlay').show();
          Drupal.ewFBFriendsBox.show();
        }
      });
    });
  }
}

Drupal.behaviors.ewFBFriendsChoose = {
  attach: function(context, settings) {
    $('#friends-box').once('ewFBFriendsChoose', function() {

      // Clicking on the submit button inside of the popup
      $('.action', this).click(function() {
        var serFriends = $('input', Drupal.ewGuests.saveFBInputID).val();
        var existingFriends = (serFriends != "" ? JSON.parse(serFriends) : {});

        var friends = [];
        var selected = $('.selected', '#friends-box');

        $.each(selected, function(index, friendCheck) {
          var id = $(friendCheck).attr('id');
          var name = $('.name', friendCheck).text();
          var pic = $('.pic', friendCheck).html();
          
          // Validate the friend
          var newFriend = true;
          $(existingFriends).each(function(index, existingFriend) {
            if ($(pic).attr('src') == existingFriend.pic) {
              newFriend = false;
              return false; // break;
            }
          });

          if (newFriend) {
            // add to ui
            var ts = Math.round((new Date()).getTime() / 1000);
            var row = [ts, id, pic, '<div class="guest-name">' + name + '</div>', Drupal.t('Facebook Email'), '', '', Drupal.settings.EW.FBActionsHTML];

            Drupal.ewGuests.getList().fnAddData(row);

            // add to batch
            friends.push({
              id: id,
              pic: $(pic).attr('src'),
              name: name
            });
          }
        });

        if ($(friends).length > 0) {
          // merge friends into existingFriens
          $.each(existingFriends, function(index, friend) {
            friends.push(friend);
          });

          // Saving the updated object in a field
          Drupal.ewGuests.updateInputs(JSON.stringify(friends), 'fb');

          Drupal.ewGuests.redraw();
        }
      });
    });
  }
}

// Handling ajaxComplete event
$(document).ajaxComplete(function(event, xhr, settings) {
  // increase refresh status by one
  if(settings.url.indexOf("fb-friends-chooser") != 0) {
    Drupal.behaviors.datatables.attach(document, Drupal.settings);
    Drupal.behaviors.ewFBFriendsRow.attach();
    Drupal.behaviors.ewFBFriendsChoose.attach();
    Drupal.behaviors.checkbox.attach();
  }
});

})(jQuery);
;
(function($) {

Drupal.ewFBFriendsBox = {
  show: function() {
    // Clean the filter
    $('.filter input', '#friends-box').val('');

    // Clean the last selected nodes
    $('.friend.selected', '#friends-box').each(function(index, element) {
      $(element).removeClass('selected');
    });

    $('#friends-box').center().show();
  },
};

Drupal.behaviors.ewFBFriendsBox = {
  attach: function(context, settings) {
    $('#friends-box').once('ewFBFriendsBox', function() {
      $(this).appendTo('body');

      // Show the modal on load
      if ($('.modal', this).length > 0 && typeof Drupal.settings.ewFB !== "undefined" && typeof Drupal.settings.ewFB.friendsBoxAuto !== "undefined" && Drupal.settings.ewFB.friendsBoxAuto == true) {
        $('#ew-overlay').show();
        $(this).center().fadeIn();
      }

      // Close the modal
      $('.close', this).click(function() {
        $('#ew-overlay').hide();
        $('#friends-box').fadeOut();
      });

      // Choose results
      $('.friend', this).click(function() {
        $(this).toggleClass('selected');
      });

      // Filter the results
      $('.filter input', this).change( function () {
        var contianer = $('.content', '#friends-box');
        var filter = $(this).val(); // get the value of the input, which we filter on
        if (filter) {
          $(contianer).find(".name:not(:Contains(" + filter + "))").parent().hide();
          $(contianer).find(".name:Contains(" + filter + ")").parent().show();
        } else {
          $(contianer).find(".friend").show();
        }
      }).keyup( function () {
        // fire the above change event after every letter
        $(this).change();
      });

      // Handle action
      $('.action', this).click(function() {
        // Close the modal
        $('.close', '#friends-box').click();
      });
    });
  },
};

})(jQuery);;
(function($) {

Drupal.ocWebMailBox = Drupal.ocWebMailBox || {
  dataMap: {
    checkbox: 0,
    name: 1,
    mail: 2,
    picture: 3,
  },
  getList: function() {
    return $('#provider_contacts_table').dataTable();
  },
};

Drupal.behaviors.ocWebMailBox = {
  attach: function(context, settings) {
    $('#web-mail-box').once('ocWebMailBox', function() {
      $(this).appendTo('body');

      // Show the modal on load
      if ($('.modal', this).length > 0 && $(this).hasClass('auto')) {
        $('#ew-overlay').show();
        $(this).center().fadeIn();
      }

      // Close the modal
      $('.close', this).click(function() {
        $('#ew-overlay').hide();
        $('#web-mail-box').fadeOut();

        $('html, body').animate({
          scrollTop: $('#oauth_webmail').offset().top - 60
        }, 800);
      });

      // Clicking on the submit button inside of the popup
      $('#popup-submit', this).click(function() {

        // Clear the filter
        Drupal.ocWebMailBox.getList().fnFilter('');

				var serGuests = $('input', Drupal.ewGuests.saveMailInputID).val();
        var existingGuests = serGuests ? JSON.parse(serGuests) : [];

				var guests = [];
		    var selected = $('.form-type-checkbox.checked input', '#provider_contacts_table');

        // Getting the profile images from google
        var picsUrls = [];
        $.each(selected, function(index, guestCheck) {
          var row = $(guestCheck).parents('tr');
          var data = Drupal.ocWebMailBox.getList().fnGetData($(row)[0]);
          var dataMap = Drupal.ocWebMailBox.dataMap;
          var pic = data[dataMap['picture']];
                
          // Get the answer by ajax
          if (pic) {
            $.ajax({
              type: 'GET',
              dataType: 'jsonp',
              url:  pic + '&access_token=' + Drupal.settings.oauthGoogle.accessToken,
              statusCode: {
                200: function() {
                  picsUrls.push(pic);
                },
              }, 
            });
          }
        });      

		    $.each(selected, function(index, guestCheck) {
		      var row = $(guestCheck).parents('tr');
		      var name = $('.name', row).html();
		      var mail = $('.email', row).html();

          var data = Drupal.ocWebMailBox.getList().fnGetData($(row)[0]);
          var dataMap = Drupal.ocWebMailBox.dataMap;
          var pic = data[dataMap['picture']];
          if ($.inArray(pic, picsUrls) == -1) {
            pic = Drupal.ewGuests.getNextAvatar(name);
          }
          else {
            pic = '<div class="avatar"><img src="' + pic + '" /></div>';
          }


		      // Validate the email
		      var newGuest = true;
		      $(existingGuests).each(function(index, existingGuest) {
		      	if (mail == existingGuest.mail) {
		      		newGuest = false;
		      		return false; // break;
		      	}
		      });

		      if (newGuest) {
		      	// add to ui
		      	var ts = Math.round((new Date()).getTime() / 1000);
						var row = [ts, mail, pic, name, mail, '', '', Drupal.settings.EW.mailActionsHTML];

						Drupal.ewGuests.getList().fnAddData(row);
		      }
		    });

        Drupal.ewGuests.refreshSer();
        Drupal.ewGuests.redraw();

		    $(".close", '#web-mail-box').click();
		  });
    });
  },
};

Drupal.behaviors.acContactsChooser = {
  attach: function(context, settings) {
    $('tbody tr', '#provider_contacts_table_wrapper').once('acContactsChooser', function() {
      $('.name, .email', this).click(function() {
        $(this).parent().find('.check-image').click();
      });
    });
  }
};

Drupal.ocWebmailImport = Drupal.ocWebmailImport || {
  hide: function() {
    $('#oauth_webmail').next('.popup-wrapper').hide();
  }
}
Drupal.behaviors.ocWebmailImport = {
	attach: function(context, settings) {
		$('#oauth_webmail', context).once('ocWebmailImport', function() {
      var container = $('.webmail', this).parents('#oauth_webmail').next('.popup-wrapper');
      var moveTop = $('.webmail', this).height() + 12;
      var moveLeft = ($('.webmail', this).width() / 2) -(container.width() / 2);

      container.css({
        top: moveTop,
        left: moveLeft
      });

			$('.webmail', this).click(function(e) {
				Drupal.ewEditForm.saveData();

				// Buying time
				Drupal.ewNotification.showNotification(Drupal.t('About to open a third party application.<br /> Saving your changes...'), 3000);
		    window.setTimeout(function() {
				  Drupal.ewNotification.setMessage(Drupal.t('Saved!'), true);
		    }, 2000);
				
				// Opening popup
				window.setTimeout(function() {
					$('#oauth_webmail').next('.popup-wrapper').fadeIn();
				}, 2500);
			});
		});
	}
}

})(jQuery);
;
(function($){$.fn.jLabel=function(c){var d=new Array();var e=$.extend({},$.fn.jLabel.defaults,c);return this.each(function(){$this=$(this);d.push(new state($this));$this.focus(function(){focus($(this))}).blur(function(){blur($(this))}).keyup(function(){keyup($(this))})});function state(b){this.equals=function(a){return a.attr('id')==this.input.attr('id')};this.input=b;this.label=getLabel(b);if(this.input.val()!='')this.label.hide()};function getState(a){var b;$.each(d,function(){if(this.equals(a)){b=this;return false}});return b};function getLabel(a){var b=$('label[for='+a.attr('id')+']');if(b.size()==0){b=$('<label>').attr('for',a.attr('id')).text(a.attr('title'))};a.before(b);b.css({'font-family':a.css('font-family'),'font-size':a.css('font-size'),'font-style':a.css('font-style'),'font-variant':a.css('font-variant'),'font-weight':a.css('font-weight'),'letter-spacing':a.css('letter-spacing'),'line-height':a.css('line-height'),'text-decoration':a.css('text-decoration'),'text-transform':a.css('text-transform'),'color':a.css('color'),'cursor':a.css('cursor'),'display':'inline-block'});b.mousedown(function(){return false}).css({'position':'relative','z-index':'100','margin-right':-b.width(),'left':e.xShift+parseInt(a.css("padding-left"))+'px','top':e.yShift+'px'});return b};function focus(a){if(a.val()==''){getState(a).label.stop().fadeTo(e.speed,e.opacity)}};function blur(a){if(a.val()==''){getState(a).label.stop().fadeTo(e.speed,1)}};function keyup(a){var b=getState(a).label;if(a.val()==''){b.stop().fadeTo(e.speed,e.opacity)}else{if(b.is(":visible"))b.stop().fadeTo(e.speed,0,function(){b.hide()})}}};$.fn.jLabel.defaults={speed:200,opacity:0.4,xShift:2,yShift:0}})(jQuery);;

(function($){$.fn.editable=function(target,options){if('disable'==target){$(this).data('disabled.editable',true);return;}
if('enable'==target){$(this).data('disabled.editable',false);return;}
if('destroy'==target){$(this).unbind($(this).data('event.editable')).removeData('disabled.editable').removeData('event.editable');return;}
var settings=$.extend({},$.fn.editable.defaults,{target:target},options);var plugin=$.editable.types[settings.type].plugin||function(){};var submit=$.editable.types[settings.type].submit||function(){};var buttons=$.editable.types[settings.type].buttons||$.editable.types['defaults'].buttons;var content=$.editable.types[settings.type].content||$.editable.types['defaults'].content;var element=$.editable.types[settings.type].element||$.editable.types['defaults'].element;var reset=$.editable.types[settings.type].reset||$.editable.types['defaults'].reset;var callback=settings.callback||function(){};var onedit=settings.onedit||function(){};var onsubmit=settings.onsubmit||function(){};var onreset=settings.onreset||function(){};var onerror=settings.onerror||reset;if(settings.tooltip){$(this).attr('title',settings.tooltip);}
settings.autowidth='auto'==settings.width;settings.autoheight='auto'==settings.height;return this.each(function(){var self=this;var savedwidth=$(self).width();var savedheight=$(self).height();$(this).data('event.editable',settings.event);if(!$.trim($(this).html())){$(this).html(settings.placeholder);}
$(this).bind(settings.event,function(e){if(true===$(this).data('disabled.editable')){return;}
if(self.editing){return;}
if(false===onedit.apply(this,[settings,self])){return;}
e.preventDefault();e.stopPropagation();if(settings.tooltip){$(self).removeAttr('title');}
if(0==$(self).width()){settings.width=savedwidth;settings.height=savedheight;}else{if(settings.width!='none'){settings.width=settings.autowidth?$(self).width():settings.width;}
if(settings.height!='none'){settings.height=settings.autoheight?$(self).height():settings.height;}}
if($(this).html().toLowerCase().replace(/(;|")/g,'')==settings.placeholder.toLowerCase().replace(/(;|")/g,'')){$(this).html('');}
self.editing=true;self.revert=$(self).html();$(self).html('');var form=$('<form />');if(settings.cssclass){if('inherit'==settings.cssclass){form.attr('class',$(self).attr('class'));}else{form.attr('class',settings.cssclass);}}
if(settings.style){if('inherit'==settings.style){form.attr('style',$(self).attr('style'));form.css('display',$(self).css('display'));}else{form.attr('style',settings.style);}}
var input=element.apply(form,[settings,self]);var input_content;if(settings.loadurl){var t=setTimeout(function(){input.disabled=true;content.apply(form,[settings.loadtext,settings,self]);},100);var loaddata={};loaddata[settings.id]=self.id;if($.isFunction(settings.loaddata)){$.extend(loaddata,settings.loaddata.apply(self,[self.revert,settings]));}else{$.extend(loaddata,settings.loaddata);}
$.ajax({type:settings.loadtype,url:settings.loadurl,data:loaddata,async:false,success:function(result){window.clearTimeout(t);input_content=result;input.disabled=false;}});}else if(settings.data){input_content=settings.data;if($.isFunction(settings.data)){input_content=settings.data.apply(self,[self.revert,settings]);}}else{input_content=self.revert;}
content.apply(form,[input_content,settings,self]);input.attr('name',settings.name);buttons.apply(form,[settings,self]);$(self).append(form);plugin.apply(form,[settings,self]);$(':input:visible:enabled:first',form).focus();if(settings.select){input.select();}
input.keydown(function(e){if(e.keyCode==27){e.preventDefault();reset.apply(form,[settings,self]);}});var t;if('cancel'==settings.onblur){input.blur(function(e){t=setTimeout(function(){reset.apply(form,[settings,self]);},500);});}else if('submit'==settings.onblur){input.blur(function(e){t=setTimeout(function(){form.submit();},200);});}else if($.isFunction(settings.onblur)){input.blur(function(e){settings.onblur.apply(self,[input.val(),settings]);});}else{input.blur(function(e){});}
form.submit(function(e){if(t){clearTimeout(t);}
e.preventDefault();if(false!==onsubmit.apply(form,[settings,self])){if(false!==submit.apply(form,[settings,self])){if($.isFunction(settings.target)){var str=settings.target.apply(self,[input.val(),settings]);$(self).html(str);self.editing=false;callback.apply(self,[self.innerHTML,settings]);if(!$.trim($(self).html())){$(self).html(settings.placeholder);}}else{var submitdata={};submitdata[settings.name]=input.val();submitdata[settings.id]=self.id;if($.isFunction(settings.submitdata)){$.extend(submitdata,settings.submitdata.apply(self,[self.revert,settings]));}else{$.extend(submitdata,settings.submitdata);}
if('PUT'==settings.method){submitdata['_method']='put';}
$(self).html(settings.indicator);var ajaxoptions={type:'POST',data:submitdata,dataType:'html',url:settings.target,success:function(result,status){if(ajaxoptions.dataType=='html'){$(self).html(result);}
self.editing=false;callback.apply(self,[result,settings]);if(!$.trim($(self).html())){$(self).html(settings.placeholder);}},error:function(xhr,status,error){onerror.apply(form,[settings,self,xhr]);}};$.extend(ajaxoptions,settings.ajaxoptions);$.ajax(ajaxoptions);}}}
$(self).attr('title',settings.tooltip);return false;});});this.reset=function(form){if(this.editing){if(false!==onreset.apply(form,[settings,self])){$(self).html(self.revert);self.editing=false;if(!$.trim($(self).html())){$(self).html(settings.placeholder);}
if(settings.tooltip){$(self).attr('title',settings.tooltip);}}}};});};$.editable={types:{defaults:{element:function(settings,original){var input=$('<input type="hidden"></input>');$(this).append(input);return(input);},content:function(string,settings,original){$(':input:first',this).val(string);},reset:function(settings,original){original.reset(this);},buttons:function(settings,original){var form=this;if(settings.submit){if(settings.submit.match(/>$/)){var submit=$(settings.submit).click(function(){if(submit.attr("type")!="submit"){form.submit();}});}else{var submit=$('<button type="submit" />');submit.html(settings.submit);}
$(this).append(submit);}
if(settings.cancel){if(settings.cancel.match(/>$/)){var cancel=$(settings.cancel);}else{var cancel=$('<button type="cancel" />');cancel.html(settings.cancel);}
$(this).append(cancel);$(cancel).click(function(event){if($.isFunction($.editable.types[settings.type].reset)){var reset=$.editable.types[settings.type].reset;}else{var reset=$.editable.types['defaults'].reset;}
reset.apply(form,[settings,original]);return false;});}}},text:{element:function(settings,original){var input=$('<input />');if(settings.width!='none'){input.width(settings.width);}
if(settings.height!='none'){input.height(settings.height);}
input.attr('autocomplete','off');$(this).append(input);return(input);}},textarea:{element:function(settings,original){var textarea=$('<textarea />');if(settings.rows){textarea.attr('rows',settings.rows);}else if(settings.height!="none"){textarea.height(settings.height);}
if(settings.cols){textarea.attr('cols',settings.cols);}else if(settings.width!="none"){textarea.width(settings.width);}
$(this).append(textarea);return(textarea);}},select:{element:function(settings,original){var select=$('<select />');$(this).append(select);return(select);},content:function(data,settings,original){if(String==data.constructor){eval('var json = '+data);}else{var json=data;}
for(var key in json){if(!json.hasOwnProperty(key)){continue;}
if('selected'==key){continue;}
var option=$('<option />').val(key).append(json[key]);$('select',this).append(option);}
$('select',this).children().each(function(){if($(this).val()==json['selected']||$(this).text()==$.trim(original.revert)){$(this).attr('selected','selected');}});}}},addInputType:function(name,input){$.editable.types[name]=input;}};$.fn.editable.defaults={name:'value',id:'id',type:'text',width:'auto',height:'auto',event:'click.editable',onblur:'cancel',loadtype:'GET',loadtext:'Loading...',placeholder:'Click to edit',loaddata:{},submitdata:{},ajaxoptions:{}};})(jQuery);;
(function($) {

Drupal.ewGuests = Drupal.ewGuests || {
	saveMailInputID: '#edit-field-serialiazed-guests',
  saveFBInputID: '#edit-field-serialiazed-friends',
  editedMail: null,
	dataMap: {
    ts: 0,
    id: 1,
    picture: 2,
    name: 3,
    mail: 4,
  },
	getList: function() {
		return $('#guests-table').dataTable();
	},
  handleName: function(name) {
    var avatarName = '';
    var nameParts = name.split(' ');
    /*if (nameParts.length >= 2) {
      avatarName = nameParts[0].charAt(0) + '.' + nameParts[nameParts.length - 1].charAt(0);
    }
    else {*/
    avatarName = nameParts[0].charAt(0);
    //}

    return avatarName;
  },
  getNextAvatar: function(name) {
    var colorClasses = Drupal.settings.ew.avatarColors;
    var avatarClass = colorClasses.shift();
    colorClasses.push(avatarClass);

    var avatarName = Drupal.ewGuests.handleName(name);

    return '<div class="avatar ' + avatarClass + '">' + avatarName + '</div>';
  }, 
  redraw: function() {
    // If there's already an insert row then delete it first otherwise it will create duplicate insertion rows. -Eidan 12/03/13
    var rows = $('.insert-row');
    if(rows != null && rows.length > 0)
    {
      var row = rows[0];
      row.parentNode.removeChild(row);
    }


    $('#guests-table').prepend($(Drupal.settings.EW.guestsInsertRow));
  
    $('.dataTables_empty').parent('tr').hide();

    $('tr', '#guests-table').addClass('even');

    // Remove events
    $('tbody tr .actions .edit', '#guests-table').unbind('click');
    $('tbody tr .actions .remove', '#guests-table').unbind('click');

    $('.ewEditGuest-processed', '#guests-table').removeClass('ewEditGuest-processed');
    $('.ewRemoveGuest-processed', '#guests-table').removeClass('ewRemoveGuest-processed');
    $('.ewPlaceholderFallback-processed', '#guests-table').removeClass('ewPlaceholderFallback-processed');

    Drupal.behaviors.ewEditGuest.attach();
    Drupal.behaviors.ewRemoveGuest.attach();
    Drupal.behaviors.ewEditGuestSubmit.attach();
    Drupal.behaviors.ewPlaceholderFallback.attach();

    Drupal.behaviors.poshy_tip.attach();
  },
  updateInputs: function(value, type) {
    if (typeof type === "undefined") {
      $('input', Drupal.ewGuests.saveMailInputID).val(value);
      $('input', Drupal.ewGuests.saveFBInputID).val(value);

      return;
    }

    switch(type) {
      case 'fb':
        $('input', Drupal.ewGuests.saveFBInputID).val(value);
      break;
      case 'mail':
        $('input', Drupal.ewGuests.saveMailInputID).val(value);
      break;
    }
  },
  removeMailGuest: function(mail) {
    var serGuests = $('input', Drupal.ewGuests.saveMailInputID).val();
    var guests = JSON.parse(serGuests);
    var updatedGuests = jQuery.extend({}, guests);
    
    var isChanged = false;
    $.each(guests, function(index, guest) {
      if (mail == guest.mail) {
        delete updatedGuests[index];
        isChanged = true;
        return false; // Like break in PHP
      }
    });

    // Saving the updated object in a field
    if (isChanged) {
      //console.log($('input', Drupal.ewGuests.saveMailInputID).val());
      Drupal.ewGuests.updateInputs(JSON.stringify(updatedGuests), 'mail');
      //console.log($('input', Drupal.ewGuests.saveMailInputID).val());
    }
  },
  removeFBGuest: function(id) {
    var serGuests = $('input', Drupal.ewGuests.saveFBInputID).val();
    var guests = JSON.parse(serGuests);
    var updatedGuests = jQuery.extend({}, guests);

    var isChanged = false;
    $.each(guests, function(index, guest) {
      if (id == guest.id) {
        delete updatedGuests[index];
        isChanged = true;
        return false; // Like break in PHP
      }
    });

    // Saving the updated object in a field
    if (isChanged) {
      //console.log($('input', Drupal.ewGuests.saveFBInputID).val());
      Drupal.ewGuests.updateInputs(JSON.stringify(updatedGuests), 'fb');
      //console.log($('input', Drupal.ewGuests.saveFBInputID).val());
    }
  },
  refreshSer: function() {
    var nodes = Drupal.ewGuests.getList().fnGetNodes();
    var guests = [];
    var data = null;
    var dataMap = Drupal.ewGuests.dataMap;
    $(nodes).each(function(index, node) {
      data = Drupal.ewGuests.getList().fnGetData(node);
      mail = data[dataMap['mail']];

      if (mail != Drupal.t('Facebook Email')) {
        guests.push({
          name: data[dataMap['name']],
          mail: mail,
          colorClass: $(data[dataMap['picture']]).attr('class').replace('avatar ', ''),
        });
      }
    });

    Drupal.ewGuests.updateInputs(JSON.stringify(guests), 'mail');
  }
};

Drupal.behaviors.ewGuestsTable = {
  attach: function(context, settings) {
    $('#guests-table', context).once('ewGuestsTable', function() {
      Drupal.ewGuests.redraw();
    });
  }
};

Drupal.behaviors.ewEditGuest = {
  attach: function(context, settings) {
    $('tbody tr .actions .edit', '#guests-table').once('ewEditGuest', function() {
      $(this).click(function () {
        // Refreshing the table to close all of the other edits
        Drupal.ewGuests.getList().fnDraw();
        Drupal.ewGuests.redraw();

        var row = $(this).parents('tr').first();
        var name = $('td.name', row).text();
        var mail = $('td.email', row).text();
        var pic = $('td.picture', row).html();

        var data = Drupal.ewGuests.getList().fnGetData(row[0]);
        var dataMap = Drupal.ewGuests.dataMap;
        Drupal.ewGuests.editedMail = data[dataMap['mail']];

        var newRow = $(Drupal.settings.EW.guestsEditRow);
        $('td.picture', newRow).html(pic);
        $(row).replaceWith(newRow);

        $(newRow).find('td.name input').val(name);
        $(newRow).find('td.email input').val(mail);

        Drupal.behaviors.ewEditGuestSubmit.attach();
      });
    });
  }
};

Drupal.behaviors.ewEditGuestSubmit = {
  attach: function(context, settings) {
    $('tr.insert-row .edit-name, tr.insert-row .edit-mail, tr.edit-row .edit-name, tr.edit-row .edit-mail', '#guests-table').once('ewEditGuestSubmit', function() {
      $(this).keydown(function(e) {
        var row = $(this).parents('tr').first();

        // Pressing the enter key
        if (e.which == 13) {
          $('.form-submit', row).click();

          e.stopPropagation();
          e.preventDefault();
          return false;
        }
        else {
          $(this).removeClass('error');
          //$(this).next().fadeOut();

          if($('input.error', row).length == 0) {
            $(row).removeClass('with-error');
            //$('.form-submit', row).fadeIn();
            //$('.cancel', row).fadeIn();
          }
        }
      });

      $(this).focus(function() {
        var row = $(this).parents('tr').first();

        $(this).removeClass('error');
        //$(this).next().fadeOut();

        if($('input.error', row).length == 0) {
          $(row).removeClass('with-error');
          /*$('.form-submit', row).fadeIn();
          $('.cancel', row).fadeIn();*/
        }
      });
    });

    $('tr.insert-row .form-submit, tr.edit-row .form-submit', '#guests-table').once('ewEditGuestSubmit', function() {
      $(this).click(function(e) {
        var row = $(this).parents('tr').first();
        var type = $(row).hasClass('insert-row') ? 'insert' : 'edit';

        var name = $(row).find('.edit-name').val();
        var mail = $(row).find('.edit-mail').val();        

        // Clean the last errors
        $(row).find('.edit-name').removeClass('error');
        $(row).find('.edit-mail').removeClass('error');

        // Remove the error row
        $('.error-row', '#guests-table').remove();

        // Field validations
        var errorValidation = false;
        var nameMessage = mailMessage = '';
        if (name == '') {
          nameMessage = Drupal.t('Full Name is required');
          $(row).find('.edit-name').addClass('error');
          errorValidation = true;
        }
        else {
          nameMessage = '';
        }

        if (mail == '') {
          mailMessage = Drupal.t('Email is required');
          $(row).find('.edit-mail').addClass('error');
          errorValidation = true;
        }
        else if (!jQuery.fn.validateEmail(mail)) {
          mailMessage = Drupal.t('Email address must be valid');
          $(row).find('.edit-mail').addClass('error');
          errorValidation = true;
        }
        else {
          mailMessage = '';
        }

        if (!errorValidation) {
          // Check if the row is already in the table
          var nodes = Drupal.ewGuests.getList().fnGetNodes();
          if (type == 'insert') {
            if($(nodes).find('td.email:contains("' + mail + '")').length == 0 ) {              
              var ts = Math.round((new Date()).getTime() / 1000);
              var row = [ts, mail, Drupal.ewGuests.getNextAvatar(name), name, mail, '', '', Drupal.settings.EW.mailActionsHTML];
              Drupal.ewGuests.getList().fnAddData(row);

              Drupal.ewGuests.refreshSer();
              Drupal.ewGuests.redraw();
              $('.insert-row input.edit-name', '#guests-table').focus();
            }
            else {
              mailMessage = Drupal.t('Email address must be unique');
              $(row).find('.edit-mail').addClass('error');
              errorValidation = true;
            }
          }
          else {
            if($(nodes).find('td.email:contains("' + mail + '")').length <= 1) {
              if (Drupal.ewGuests.editedMail) {
                var editRow = null;
                $.each(nodes, function(index, node) {
                  var data = Drupal.ewGuests.getList().fnGetData(node);
                  var dataMap = Drupal.ewGuests.dataMap;
                  if (data[dataMap['mail']] == Drupal.ewGuests.editedMail) {
                    editRow = node;
                    return false;
                  }
                });

                if (editRow) {
                  var nameNode = $(editRow).find('td.name')[0];
                  var mailNode = $(editRow).find('td.email')[0];

                  debugger;
                  var picNode = $(editRow).find('td.picture')[0];
                  var aPos = Drupal.ewGuests.getList().fnGetPosition(nameNode);                                
                  Drupal.ewGuests.getList().fnUpdate(name, aPos[0], aPos[2]);

                  aPos = Drupal.ewGuests.getList().fnGetPosition(mailNode);
                  Drupal.ewGuests.getList().fnUpdate(mail, aPos[0], aPos[2]);

                  aPos = Drupal.ewGuests.getList().fnGetPosition(picNode);
                  $('.avatar', picNode).text(Drupal.ewGuests.handleName(name));
                  //Drupal.ewGuests.getList().fnUpdate(picNode, aPos[0], aPos[2]);

                  Drupal.ewGuests.refreshSer();

                  Drupal.ewGuests.redraw();
                  Drupal.ewGuests.editedMail = null;
                  $('.insert-row input.edit-name', '#guests-table').focus();
                }
              }
            }
            else {
              mailMessage = Drupal.t('Email address must be unique');
              $(row).find('.edit-mail').addClass('error');
              errorValidation = true;
            }
          }
        }

        if (errorValidation) {
          // Add the error container row
          $(row).after($(Drupal.settings.EW.guestsErrorsRow));
          $('.error-row .messages', '#guests-table').hide();

          $('.name-message li', '#guests-table').text(nameMessage);
          $('.mail-message li', '#guests-table').text(mailMessage);

          if (nameMessage != '') {
            $('.error-row .name .messages', '#guests-table').show();
          }
            
          if (mailMessage != '') {
            $('.error-row .email .messages', '#guests-table').show();
          }
          
          $(row).addClass('with-error');

          /*$('.form-submit', row).fadeOut();
          if (type == 'edit') {
            $('.actions .cancel', row).fadeOut();
          }*/
        }

        e.preventDefault();
        return false;
      });
    });

    $('tr.edit-row a.cancel', '#guests-table').once('ewEditGuestSubmit', function() {
      $(this).click(function(e) {
        Drupal.ewGuests.getList().fnDraw();
        Drupal.ewGuests.redraw();
        Drupal.ewGuests.editedMail = null;

        e.preventDefault();
        return false;
      });
    });
  }
};

Drupal.behaviors.ewRemoveGuest = {
  attach: function(context, settings) {  
    $('.actions .remove', '#guests-table').once('ewRemoveGuest', function() {
      $(this).click(function() {
        var row = $(this).parents('tr')[0];

        var data = Drupal.ewGuests.getList().fnGetData(row);
        var dataMap = Drupal.ewGuests.dataMap;
        var mail = data[dataMap['mail']];
        var id = data[dataMap['id']];

        // Delete the row from the ui
        Drupal.ewGuests.getList().fnDeleteRow(row);

        // Remove the row from the serialized object
        if (mail == Drupal.t('Facebook Email')) {
          Drupal.ewGuests.removeFBGuest(id);
        }
        else {
          Drupal.ewGuests.removeMailGuest(mail);
        }

        // refresh the table
        Drupal.ewGuests.redraw();
      });
    });
  }
};

Drupal.behaviors.ewRemoveAll = {
  attach: function(context, settings) {
    $('.table-footer .remove-all', '#guests-table_wrapper').once('ewRemoveAll', function() {
      $(this).text(Drupal.t('Remove all'));

      $(this).click(function() {
        // Delete all rows from the ui
        Drupal.ewGuests.getList().fnClearTable();

        // Saving empty object in a field
        Drupal.ewGuests.updateInputs('');

        // refresh the table
        Drupal.ewGuests.redraw();
      });
    });
  }
};

})(jQuery);
;
/**
 * guiders.js
 *
 * version 1.2.8
 *
 * Developed at Optimizely. (www.optimizely.com)
 * We make A/B testing you'll actually use.
 *
 * Released under the Apache License 2.0.
 * www.apache.org/licenses/LICENSE-2.0.html
 *
 * Questions about Guiders?
 * You may email me (Jeff Pickhardt) at jeff+pickhardt@optimizely.com
 *
 * Questions about Optimizely should be sent to:
 * sales@optimizely.com or support@optimizely.com
 *
 * Enjoy!
 */

var guiders = (function($) {
  var guiders = {};
  
  guiders.version = "1.2.8";

  guiders._defaultSettings = {
    attachTo: null, // Selector of the element to attach to.
    autoFocus: false, // Determines whether or not the browser scrolls to the element.
    buttons: [{name: "Close"}],
    buttonCustomHTML: "",
    classString: null,
    closeOnEscape: false,
    description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    highlight: null,
    isHashable: true,
    offset: {
        top: null,
        left: null
    },
    onClose: null, 
    onHide: null,
    onShow: null,
    overlay: false,
    position: 0, // 1-12 follows an analog clock, 0 means centered.
    title: "Sample title goes here",
    width: 400,
    xButton: false // This places a closer "x" button in the top right of the guider.
  };

  guiders._htmlSkeleton = [
    "<div class='guider'>",
    "  <div class='guider_content'>",
    "    <h1 class='guider_title'></h1>",
    "    <div class='guider_close'></div>",
    "    <p class='guider_description'></p>",
    "    <div class='guider_buttons'>",
    "    </div>",
    "  </div>",
    "  <div class='guider_arrow'>",
    "  </div>",
    "</div>"
  ].join("");

  guiders._arrowSize = 42; // This is the arrow's width and height.
  guiders._backButtonTitle = "Back";
  guiders._buttonElement = "<a></a>";
  guiders._buttonAttributes = {"href": "javascript:void(0);"};
  guiders._closeButtonTitle = "Close";
  guiders._currentGuiderID = null;
  guiders._guiders = {};
  guiders._lastCreatedGuiderID = null;
  guiders._nextButtonTitle = "Next";
  guiders._offsetNameMapping = {
    "topLeft": 11,
    "top": 12,
    "topRight": 1,
    "rightTop": 2,
    "right": 3,
    "rightBottom": 4,
    "bottomRight": 5,
    "bottom": 6,
    "bottomLeft": 7,
    "leftBottom": 8,
    "left": 9,
    "leftTop": 10
  };
  guiders._windowHeight = 0;

  guiders._addButtons = function(myGuider) {
    var guiderButtonsContainer = myGuider.elem.find(".guider_buttons");
  
    if (myGuider.buttons === null || myGuider.buttons.length === 0) {
      guiderButtonsContainer.remove();
      return;
    }
  
    for (var i = myGuider.buttons.length - 1; i >= 0; i--) {
      var thisButton = myGuider.buttons[i];
      var thisButtonElem = $(guiders._buttonElement,
        $.extend({"class" : "guider_button", "html" : thisButton.name }, guiders._buttonAttributes, thisButton.html || {})
      );

      if (typeof thisButton.classString !== "undefined" && thisButton.classString !== null) {
        thisButtonElem.addClass(thisButton.classString);
      }
  
      guiderButtonsContainer.append(thisButtonElem);
      
      var thisButtonName = thisButton.name.toLowerCase();
      if (thisButton.onclick) {
        thisButtonElem.bind("click", thisButton.onclick);
      } else {
        switch (thisButtonName) {
          case guiders._closeButtonTitle.toLowerCase():
            thisButtonElem.bind("click", function () {
              guiders.hideAll();
              if (myGuider.onClose) {
                myGuider.onClose(myGuider, false /* close by button */);
              }
            });
            break;
          case guiders._nextButtonTitle.toLowerCase():
            thisButtonElem.bind("click", function () {
              !myGuider.elem.data('locked') && guiders.next();
            });
            break;
          case guiders._backButtonTitle.toLowerCase():
            thisButtonElem.bind("click", function () {
              !myGuider.elem.data('locked') && guiders.prev();
            });
            break;
        }
      }
    }
  
    if (myGuider.buttonCustomHTML !== "") {
      var myCustomHTML = $(myGuider.buttonCustomHTML);
      myGuider.elem.find(".guider_buttons").append(myCustomHTML);
    }
  
    if (myGuider.buttons.length === 0) {
      guiderButtonsContainer.remove();
    }
  };

  guiders._addXButton = function(myGuider) {
    var xButtonContainer = myGuider.elem.find(".guider_close");
    var xButton = $("<div></div>", {
                    "class" : "x_button",
                    "role" : "button" });
    xButtonContainer.append(xButton);
    xButton.click(function() {
      guiders.hideAll();
      if (myGuider.onClose) {
        myGuider.onClose(myGuider, true);
       }
    });
  };

  guiders._wireEscape = function (myGuider) {
    $(document).keydown(function(event) {
      if (event.keyCode == 27 || event.which == 27) {
        guiders.hideAll();
        if (myGuider.onClose) {
          myGuider.onClose(myGuider, true /*close by X/Escape*/);
        }
        return false;
      }
    });      
  };

  guiders._unWireEscape = function (myGuider) {
    $(document).unbind("keydown");
  };
  
  guiders._attach = function(myGuider) {
    if (typeof myGuider !== 'object') {
      return;
    }
        
    var attachTo = $(myGuider.attachTo);

    var myHeight = myGuider.elem.innerHeight();
    var myWidth = myGuider.elem.innerWidth();

    if (myGuider.position === 0 || attachTo.length === 0) {
      // The guider is positioned in the center of the screen.
      myGuider.elem.css("position", "fixed");
      myGuider.elem.css("top", ($(window).height() - myHeight) / 3 + "px");
      myGuider.elem.css("left", ($(window).width() - myWidth) / 2 + "px");
      return;
    }
    
    // Otherwise, the guider is positioned relative to the attachTo element.
    var base = attachTo.offset();
    var top = base.top;
    var left = base.left;
    
    // topMarginOfBody corrects positioning if body has a top margin set on it.
    var topMarginOfBody = $("body").outerHeight(true) - $("body").outerHeight(false);
    top -= topMarginOfBody;

    // Now, take into account how the guider should be positioned relative to the attachTo element.
    // e.g. top left, bottom center, etc.
    if (guiders._offsetNameMapping[myGuider.position]) {
      // As an alternative to the clock model, you can also use keywords to position the guider.
      myGuider.position = guiders._offsetNameMapping[myGuider.position];
    }
    
    var attachToHeight = attachTo.innerHeight();
    var attachToWidth = attachTo.innerWidth();  
    var bufferOffset = 0.9 * guiders._arrowSize;
    
    // offsetMap follows the form: [height, width]
    var offsetMap = {
      1: [-bufferOffset - myHeight, attachToWidth - myWidth],
      2: [0, bufferOffset + attachToWidth],
      3: [attachToHeight/2 - myHeight/2, bufferOffset + attachToWidth],
      4: [attachToHeight - myHeight, bufferOffset + attachToWidth],
      5: [bufferOffset + attachToHeight, attachToWidth - myWidth],
      6: [bufferOffset + attachToHeight, attachToWidth/2 - myWidth/2],
      7: [bufferOffset + attachToHeight, 0],
      8: [attachToHeight - myHeight, -myWidth - bufferOffset],
      9: [attachToHeight/2 - myHeight/2, -myWidth - bufferOffset],
      10: [0, -myWidth - bufferOffset],
      11: [-bufferOffset - myHeight, 0],
      12: [-bufferOffset - myHeight, attachToWidth/2 - myWidth/2]
    };
    var offset = offsetMap[myGuider.position];
    top   += offset[0];
    left  += offset[1];
    
    var positionType = "absolute";
    // If the element you are attaching to is position: fixed, then we will make the guider
    // position: fixed as well.
    if (attachTo.css("position") == "fixed") {
      positionType = "fixed";
      top -= $(window).scrollTop();
      left -= $(window).scrollLeft();
    }
    
    // If you specify an additional offset parameter when you create the guider, it gets added here.
    if (myGuider.offset.top !== null) {
      top += myGuider.offset.top;
    }
    if (myGuider.offset.left !== null) {
      left += myGuider.offset.left;
    }
    
    // Finally, set the style of the guider and return it!
    return myGuider.elem.css({
      "position": positionType,
      "top": top,
      "left": left
    });
  };

  guiders._guiderById = function(id) {
    if (typeof guiders._guiders[id] === "undefined") {
      throw "Cannot find guider with id " + id;
    }
    return guiders._guiders[id];
  };

  guiders._showOverlay = function() {
    $("#guider_overlay").fadeIn("fast", function(){
      if (this.style.removeAttribute) {
        this.style.removeAttribute("filter");
      }
    });
    // This callback is needed to fix an IE opacity bug.
    // See also:
    // http://www.kevinleary.net/jquery-fadein-fadeout-problems-in-internet-explorer/
  };

  guiders._highlightElement = function(selector) {
    $(selector).addClass('guider_highlight');
  };

  guiders._dehighlightElement = function(selector) {
    $(selector).removeClass('guider_highlight');
  };

  guiders._hideOverlay = function() {
    $("#guider_overlay").fadeOut("fast");
  };

  guiders._initializeOverlay = function() {
    if ($("#guider_overlay").length === 0) {
      $("<div id=\"guider_overlay\"></div>").hide().appendTo("body");
    }
  };

  guiders._styleArrow = function(myGuider) {
    var position = myGuider.position || 0;
    if (!position) {
      return;
    }
    var myGuiderArrow = $(myGuider.elem.find(".guider_arrow"));
    var newClass = {
      1: "guider_arrow_down",
      2: "guider_arrow_left",
      3: "guider_arrow_left",
      4: "guider_arrow_left",
      5: "guider_arrow_up",
      6: "guider_arrow_up",
      7: "guider_arrow_up",
      8: "guider_arrow_right",
      9: "guider_arrow_right",
      10: "guider_arrow_right",
      11: "guider_arrow_down",
      12: "guider_arrow_down"
    };
    myGuiderArrow.addClass(newClass[position]);
  
    var myHeight = myGuider.elem.innerHeight();
    var myWidth = myGuider.elem.innerWidth();
    var arrowOffset = guiders._arrowSize / 2;
    var positionMap = {
      1: ["right", arrowOffset],
      2: ["top", arrowOffset],
      3: ["top", myHeight/2 - arrowOffset],
      4: ["bottom", arrowOffset],
      5: ["right", arrowOffset],
      6: ["left", myWidth/2 - arrowOffset],
      7: ["left", arrowOffset],
      8: ["bottom", arrowOffset],
      9: ["top", myHeight/2 - arrowOffset],
      10: ["top", arrowOffset],
      11: ["left", arrowOffset],
      12: ["left", myWidth/2 - arrowOffset]
    };
    var position = positionMap[myGuider.position];
    myGuiderArrow.css(position[0], position[1] + "px");
  };

  /**
   * One way to show a guider to new users is to direct new users to a URL such as
   * http://www.mysite.com/myapp#guider=welcome
   *
   * This can also be used to run guiders on multiple pages, by redirecting from
   * one page to another, with the guider id in the hash tag.
   *
   * Alternatively, if you use a session variable or flash messages after sign up,
   * you can add selectively add JavaScript to the page: "guiders.show('first');"
   */
  guiders._showIfHashed = function(myGuider) {
    var GUIDER_HASH_TAG = "guider=";
    var hashIndex = window.location.hash.indexOf(GUIDER_HASH_TAG);
    if (hashIndex !== -1) {
      var hashGuiderId = window.location.hash.substr(hashIndex + GUIDER_HASH_TAG.length);
      if (myGuider.id.toLowerCase() === hashGuiderId.toLowerCase()) {
        // Success!
        guiders.show(myGuider.id);
      }
    }
  };

  guiders.reposition = function() {
    var currentGuider = guiders._guiders[guiders._currentGuiderID];
    guiders._attach(currentGuider);
  };
  
  guiders.next = function() {
    var currentGuider = guiders._guiders[guiders._currentGuiderID];
    if (typeof currentGuider === "undefined") {
      return;
    }
    currentGuider.elem.data('locked', true);

    var nextGuiderId = currentGuider.next || null;
    if (nextGuiderId !== null && nextGuiderId !== "") {
      var myGuider = guiders._guiderById(nextGuiderId);
      var omitHidingOverlay = myGuider.overlay ? true : false;
      guiders.hideAll(omitHidingOverlay, true);
      if (currentGuider && currentGuider.highlight) {
          guiders._dehighlightElement(currentGuider.highlight);
      }
      guiders.show(nextGuiderId);
    }
  };

  guiders.prev = function () {
    var currentGuider = guiders._guiders[guiders._currentGuiderID];
    if (typeof currentGuider === "undefined") {
      // not what we think it is
      return;
    }
    if (currentGuider.prev === null) {
      // no previous to look at
      return;
    }
  
    var prevGuider = guiders._guiders[currentGuider.prev];
    prevGuider.elem.data('locked', true);
    
    // Note we use prevGuider.id as "prevGuider" is _already_ looking at the previous guider
    var prevGuiderId = prevGuider.id || null;
    if (prevGuiderId !== null && prevGuiderId !== "") {
      var myGuider = guiders._guiderById(prevGuiderId);
      var omitHidingOverlay = myGuider.overlay ? true : false;
      guiders.hideAll(omitHidingOverlay, true);
      if (prevGuider && prevGuider.highlight) {
        guiders._dehighlightElement(prevGuider.highlight);
      }
      guiders.show(prevGuiderId);
    }
  };

  guiders.createGuider = function(passedSettings) {
    if (passedSettings === null || passedSettings === undefined) {
      passedSettings = {};
    }
    
    // Extend those settings with passedSettings
    myGuider = $.extend({}, guiders._defaultSettings, passedSettings);
    myGuider.id = myGuider.id || String(Math.floor(Math.random() * 1000));
    
    var guiderElement = $(guiders._htmlSkeleton);
    myGuider.elem = guiderElement;
    if (typeof myGuider.classString !== "undefined" && myGuider.classString !== null) {
      myGuider.elem.addClass(myGuider.classString);
    }
    myGuider.elem.css("width", myGuider.width + "px");
    
    var guiderTitleContainer = guiderElement.find(".guider_title");
    guiderTitleContainer.html(myGuider.title);
    
    guiderElement.find(".guider_description").html(myGuider.description);
    
    guiders._addButtons(myGuider);
    
    if (myGuider.xButton) {
        guiders._addXButton(myGuider);
    }
    
    guiderElement.hide();
    guiderElement.appendTo("body");
    guiderElement.attr("id", myGuider.id);
    
    // Ensure myGuider.attachTo is a jQuery element.
    if (typeof myGuider.attachTo !== "undefined" && myGuider !== null) {
      guiders._attach(myGuider) && guiders._styleArrow(myGuider);
    }
    
    guiders._initializeOverlay();
    
    guiders._guiders[myGuider.id] = myGuider;
    if (guiders._lastCreatedGuiderID != null) {
      myGuider.prev = guiders._lastCreatedGuiderID;
    }
    guiders._lastCreatedGuiderID = myGuider.id;
    
    /**
     * If the URL of the current window is of the form
     * http://www.myurl.com/mypage.html#guider=id
     * then show this guider.
     */
    if (myGuider.isHashable) {
      guiders._showIfHashed(myGuider);
    }
    
    return guiders;
  }; 

  guiders.hideAll = function(omitHidingOverlay, next) {
    next = next || false;

    $(".guider:visible").each(function(index, elem){
      var myGuider = guiders._guiderById($(elem).attr('id'));
      if (myGuider.onHide) {
        myGuider.onHide(myGuider, next);
      }
    });
    $(".guider").fadeOut("fast");
    var currentGuider = guiders._guiders[guiders._currentGuiderID];
    if (currentGuider && currentGuider.highlight) {
    	guiders._dehighlightElement(currentGuider.highlight);
    }
    if (typeof omitHidingOverlay !== "undefined" && omitHidingOverlay === true) {
      // do nothing for now
    } else {
      guiders._hideOverlay();
    }
    return guiders;
  };

  guiders.show = function(id) {
    if (!id && guiders._lastCreatedGuiderID) {
      id = guiders._lastCreatedGuiderID;
    }
  
    var myGuider = guiders._guiderById(id);
    if (myGuider.overlay) {
      guiders._showOverlay();
      // if guider is attached to an element, make sure it's visible
      if (myGuider.highlight) {
        guiders._highlightElement(myGuider.highlight);
      }
    }
    
    if (myGuider.closeOnEscape) {
      guiders._wireEscape(myGuider);
    } else {
      guiders._unWireEscape(myGuider);
    }
  
    // You can use an onShow function to take some action before the guider is shown.
    if (myGuider.onShow) {
      myGuider.onShow(myGuider);
    }
    guiders._attach(myGuider);
    myGuider.elem.fadeIn("fast").data("locked", false);
      
    guiders._currentGuiderID = id;
    
    var windowHeight = guiders._windowHeight = $(window).height();
    var scrollHeight = $(window).scrollTop();
    var guiderOffset = myGuider.elem.offset();
    var guiderElemHeight = myGuider.elem.height();
    
    var isGuiderBelow = (scrollHeight + windowHeight < guiderOffset.top + guiderElemHeight); /* we will need to scroll down */
    var isGuiderAbove = (guiderOffset.top < scrollHeight); /* we will need to scroll up */
    
    if (myGuider.autoFocus && (isGuiderBelow || isGuiderAbove)) {
      // Sometimes the browser won't scroll if the person just clicked,
      // so let's do this in a setTimeout.
      setTimeout(guiders.scrollToCurrent, 10);
    }
    
    $(myGuider.elem).trigger("guiders.show");

    return guiders;
  };
  
  guiders.scrollToCurrent = function() {
    var currentGuider = guiders._guiders[guiders._currentGuiderID];
    if (typeof currentGuider === "undefined") {
      return;
    }
    
    var windowHeight = guiders._windowHeight;
    var scrollHeight = $(window).scrollTop();
    var guiderOffset = currentGuider.elem.offset();
    var guiderElemHeight = currentGuider.elem.height();
    
    // Scroll to the guider's position.
    var scrollToHeight = Math.round(Math.max(guiderOffset.top + (guiderElemHeight / 2) - (windowHeight / 2), 0));
    window.scrollTo(0, scrollToHeight);
  };
  
  // Change the bubble position after browser gets resized
  var _resizing = undefined;
  $(window).resize(function() {
    if (typeof(_resizing) !== "undefined") {
      clearTimeout(_resizing); // Prevents seizures
    }
    _resizing = setTimeout(function() {
      _resizing = undefined;
      if (typeof (guiders) !== "undefined") {
        guiders.reposition();
      }
    }, 20);
  });
  
  return guiders;
}).call(this, jQuery);
;
(function ($) {

/**
 * A progressbar object. Initialized with the given id. Must be inserted into
 * the DOM afterwards through progressBar.element.
 *
 * method is the function which will perform the HTTP request to get the
 * progress bar state. Either "GET" or "POST".
 *
 * e.g. pb = new progressBar('myProgressBar');
 *      some_element.appendChild(pb.element);
 */
Drupal.progressBar = function (id, updateCallback, method, errorCallback) {
  var pb = this;
  this.id = id;
  this.method = method || 'GET';
  this.updateCallback = updateCallback;
  this.errorCallback = errorCallback;

  // The WAI-ARIA setting aria-live="polite" will announce changes after users
  // have completed their current activity and not interrupt the screen reader.
  this.element = $('<div class="progress" aria-live="polite"></div>').attr('id', id);
  this.element.html('<div class="bar"><div class="filled"></div></div>' +
                    '<div class="percentage"></div>' +
                    '<div class="message">&nbsp;</div>');
};

/**
 * Set the percentage and status message for the progressbar.
 */
Drupal.progressBar.prototype.setProgress = function (percentage, message) {
  if (percentage >= 0 && percentage <= 100) {
    $('div.filled', this.element).css('width', percentage + '%');
    $('div.percentage', this.element).html(percentage + '%');
  }
  $('div.message', this.element).html(message);
  if (this.updateCallback) {
    this.updateCallback(percentage, message, this);
  }
};

/**
 * Start monitoring progress via Ajax.
 */
Drupal.progressBar.prototype.startMonitoring = function (uri, delay) {
  this.delay = delay;
  this.uri = uri;
  this.sendPing();
};

/**
 * Stop monitoring progress via Ajax.
 */
Drupal.progressBar.prototype.stopMonitoring = function () {
  clearTimeout(this.timer);
  // This allows monitoring to be stopped from within the callback.
  this.uri = null;
};

/**
 * Request progress data from server.
 */
Drupal.progressBar.prototype.sendPing = function () {
  if (this.timer) {
    clearTimeout(this.timer);
  }
  if (this.uri) {
    var pb = this;
    // When doing a post request, you need non-null data. Otherwise a
    // HTTP 411 or HTTP 406 (with Apache mod_security) error may result.
    $.ajax({
      type: this.method,
      url: this.uri,
      data: '',
      dataType: 'json',
      success: function (progress) {
        // Display errors.
        if (progress.status == 0) {
          pb.displayError(progress.data);
          return;
        }
        // Update display.
        pb.setProgress(progress.percentage, progress.message);
        // Schedule next timer.
        pb.timer = setTimeout(function () { pb.sendPing(); }, pb.delay);
      },
      error: function (xmlhttp) {
        pb.displayError(Drupal.ajaxError(xmlhttp, pb.uri));
      }
    });
  }
};

/**
 * Display errors on the page.
 */
Drupal.progressBar.prototype.displayError = function (string) {
  var error = $('<div class="messages error"></div>').html(string);
  $(this.element).before(error).hide();

  if (this.errorCallback) {
    this.errorCallback(this);
  }
};

})(jQuery);
;
/**
 * @file
 *
 * Implement a modal form.
 *
 * @see modal.inc for documentation.
 *
 * This javascript relies on the CTools ajax responder.
 */

(function ($) {
  // Make sure our objects are defined.
  Drupal.CTools = Drupal.CTools || {};
  Drupal.CTools.Modal = Drupal.CTools.Modal || {};

  /**
   * Display the modal
   *
   * @todo -- document the settings.
   */
  Drupal.CTools.Modal.show = function(choice) {
    var opts = {};

    if (choice && typeof choice == 'string' && Drupal.settings[choice]) {
      // This notation guarantees we are actually copying it.
      $.extend(true, opts, Drupal.settings[choice]);
    }
    else if (choice) {
      $.extend(true, opts, choice);
    }

    var defaults = {
      modalTheme: 'CToolsModalDialog',
      throbberTheme: 'CToolsModalThrobber',
      animation: 'show',
      animationSpeed: 'fast',
      modalSize: {
        type: 'scale',
        width: .8,
        height: .8,
        addWidth: 0,
        addHeight: 0,
        // How much to remove from the inner content to make space for the
        // theming.
        contentRight: 25,
        contentBottom: 45
      },
      modalOptions: {
        opacity: .55,
        background: '#fff'
      }
    };

    var settings = {};
    $.extend(true, settings, defaults, Drupal.settings.CToolsModal, opts);

    if (Drupal.CTools.Modal.currentSettings && Drupal.CTools.Modal.currentSettings != settings) {
      Drupal.CTools.Modal.modal.remove();
      Drupal.CTools.Modal.modal = null;
    }

    Drupal.CTools.Modal.currentSettings = settings;

    var resize = function(e) {
      // When creating the modal, it actually exists only in a theoretical
      // place that is not in the DOM. But once the modal exists, it is in the
      // DOM so the context must be set appropriately.
      var context = e ? document : Drupal.CTools.Modal.modal;

      if (Drupal.CTools.Modal.currentSettings.modalSize.type == 'scale') {
        var width = $(window).width() * Drupal.CTools.Modal.currentSettings.modalSize.width;
        var height = $(window).height() * Drupal.CTools.Modal.currentSettings.modalSize.height;
      }
      else {
        var width = Drupal.CTools.Modal.currentSettings.modalSize.width;
        var height = Drupal.CTools.Modal.currentSettings.modalSize.height;
      }

      // Use the additionol pixels for creating the width and height.
      $('div.ctools-modal-content', context).css({
        'width': width + Drupal.CTools.Modal.currentSettings.modalSize.addWidth + 'px',
        'height': height + Drupal.CTools.Modal.currentSettings.modalSize.addHeight + 'px'
      });
      $('div.ctools-modal-content .modal-content', context).css({
        'width': (width - Drupal.CTools.Modal.currentSettings.modalSize.contentRight) + 'px',
        'height': (height - Drupal.CTools.Modal.currentSettings.modalSize.contentBottom) + 'px'
      });
    }

    if (!Drupal.CTools.Modal.modal) {
      Drupal.CTools.Modal.modal = $(Drupal.theme(settings.modalTheme));
      if (settings.modalSize.type == 'scale') {
        $(window).bind('resize', resize);
      }
    }

    resize();

    $('span.modal-title', Drupal.CTools.Modal.modal).html(Drupal.CTools.Modal.currentSettings.loadingText);
    Drupal.CTools.Modal.modalContent(Drupal.CTools.Modal.modal, settings.modalOptions, settings.animation, settings.animationSpeed);
    $('#modalContent .modal-content').html(Drupal.theme(settings.throbberTheme));
  };

  /**
   * Hide the modal
   */
  Drupal.CTools.Modal.dismiss = function() {
    if (Drupal.CTools.Modal.modal) {
      Drupal.CTools.Modal.unmodalContent(Drupal.CTools.Modal.modal);
    }
  };

  /**
   * Provide the HTML to create the modal dialog.
   */
  Drupal.theme.prototype.CToolsModalDialog = function () {
    var html = ''
    html += '  <div id="ctools-modal">'
    html += '    <div class="ctools-modal-content">' // panels-modal-content
    html += '      <div class="modal-header">';
    html += '        <a class="close" href="#">';
    html +=            Drupal.CTools.Modal.currentSettings.closeText + Drupal.CTools.Modal.currentSettings.closeImage;
    html += '        </a>';
    html += '        <span id="modal-title" class="modal-title">&nbsp;</span>';
    html += '      </div>';
    html += '      <div id="modal-content" class="modal-content">';
    html += '      </div>';
    html += '    </div>';
    html += '  </div>';

    return html;
  }

  /**
   * Provide the HTML to create the throbber.
   */
  Drupal.theme.prototype.CToolsModalThrobber = function () {
    var html = '';
    html += '  <div id="modal-throbber">';
    html += '    <div class="modal-throbber-wrapper">';
    html +=        Drupal.CTools.Modal.currentSettings.throbber;
    html += '    </div>';
    html += '  </div>';

    return html;
  };

  /**
   * Figure out what settings string to use to display a modal.
   */
  Drupal.CTools.Modal.getSettings = function (object) {
    var match = $(object).attr('class').match(/ctools-modal-(\S+)/);
    if (match) {
      return match[1];
    }
  }

  /**
   * Click function for modals that can be cached.
   */
  Drupal.CTools.Modal.clickAjaxCacheLink = function () {
    Drupal.CTools.Modal.show(Drupal.CTools.Modal.getSettings(this));
    return Drupal.CTools.AJAX.clickAJAXCacheLink.apply(this);
  };

  /**
   * Handler to prepare the modal for the response
   */
  Drupal.CTools.Modal.clickAjaxLink = function () {
    Drupal.CTools.Modal.show(Drupal.CTools.Modal.getSettings(this));
    return false;
  };

  /**
   * Submit responder to do an AJAX submit on all modal forms.
   */
  Drupal.CTools.Modal.submitAjaxForm = function(e) {
    var $form = $(this);
    var url = $form.attr('action');

    setTimeout(function() { Drupal.CTools.AJAX.ajaxSubmit($form, url); }, 1);
    return false;
  }

  /**
   * Bind links that will open modals to the appropriate function.
   */
  Drupal.behaviors.ZZCToolsModal = {
    attach: function(context) {
      // Bind links
      // Note that doing so in this order means that the two classes can be
      // used together safely.
      /*
       * @todo remimplement the warm caching feature
       $('a.ctools-use-modal-cache', context).once('ctools-use-modal', function() {
         $(this).click(Drupal.CTools.Modal.clickAjaxCacheLink);
         Drupal.CTools.AJAX.warmCache.apply(this);
       });
        */

      $('area.ctools-use-modal, a.ctools-use-modal', context).once('ctools-use-modal', function() {
        var $this = $(this);
        $this.click(Drupal.CTools.Modal.clickAjaxLink);
        // Create a drupal ajax object
        var element_settings = {};
        if ($this.attr('href')) {
          element_settings.url = $this.attr('href');
          element_settings.event = 'click';
          element_settings.progress = { type: 'throbber' };
        }
        var base = $this.attr('href');
        Drupal.ajax[base] = new Drupal.ajax(base, this, element_settings);
      });

      // Bind buttons
      $('input.ctools-use-modal, button.ctools-use-modal', context).once('ctools-use-modal', function() {
        var $this = $(this);
        $this.click(Drupal.CTools.Modal.clickAjaxLink);
        var button = this;
        var element_settings = {};

        // AJAX submits specified in this manner automatically submit to the
        // normal form action.
        element_settings.url = Drupal.CTools.Modal.findURL(this);
        element_settings.event = 'click';

        var base = $this.attr('id');
        Drupal.ajax[base] = new Drupal.ajax(base, this, element_settings);

        // Make sure changes to settings are reflected in the URL.
        $('.' + $(button).attr('id') + '-url').change(function() {
          Drupal.ajax[base].options.url = Drupal.CTools.Modal.findURL(button);
        });
      });

      // Bind our custom event to the form submit
      $('#modal-content form', context).once('ctools-use-modal', function() {
        var $this = $(this);
        var element_settings = {};

        element_settings.url = $this.attr('action');
        element_settings.event = 'submit';
        element_settings.progress = { 'type': 'throbber' }
        var base = $this.attr('id');

        Drupal.ajax[base] = new Drupal.ajax(base, this, element_settings);
        Drupal.ajax[base].form = $this;

        $('input[type=submit], button', this).click(function(event) {
          Drupal.ajax[base].element = this;
          this.form.clk = this;
          // An empty event means we were triggered via .click() and
          // in jquery 1.4 this won't trigger a submit.
          if (event.bubbles == undefined) {
            $(this.form).trigger('submit');
            return false;
          }
        });
      });

      // Bind a click handler to allow elements with the 'ctools-close-modal'
      // class to close the modal.
      $('.ctools-close-modal', context).once('ctools-close-modal')
        .click(function() {
          Drupal.CTools.Modal.dismiss();
          return false;
        });
    }
  };

  // The following are implementations of AJAX responder commands.

  /**
   * AJAX responder command to place HTML within the modal.
   */
  Drupal.CTools.Modal.modal_display = function(ajax, response, status) {
    if ($('#modalContent').length == 0) {
      Drupal.CTools.Modal.show(Drupal.CTools.Modal.getSettings(ajax.element));
    }
    $('#modal-title').html(response.title);
    // Simulate an actual page load by scrolling to the top after adding the
    // content. This is helpful for allowing users to see error messages at the
    // top of a form, etc.
    $('#modal-content').html(response.output).scrollTop(0);
    Drupal.attachBehaviors();
  }

  /**
   * AJAX responder command to dismiss the modal.
   */
  Drupal.CTools.Modal.modal_dismiss = function(command) {
    Drupal.CTools.Modal.dismiss();
    $('link.ctools-temporary-css').remove();
  }

  /**
   * Display loading
   */
  //Drupal.CTools.AJAX.commands.modal_loading = function(command) {
  Drupal.CTools.Modal.modal_loading = function(command) {
    Drupal.CTools.Modal.modal_display({
      output: Drupal.theme(Drupal.CTools.Modal.currentSettings.throbberTheme),
      title: Drupal.CTools.Modal.currentSettings.loadingText
    });
  }

  /**
   * Find a URL for an AJAX button.
   *
   * The URL for this gadget will be composed of the values of items by
   * taking the ID of this item and adding -url and looking for that
   * class. They need to be in the form in order since we will
   * concat them all together using '/'.
   */
  Drupal.CTools.Modal.findURL = function(item) {
    var url = '';
    var url_class = '.' + $(item).attr('id') + '-url';
    $(url_class).each(
      function() {
        var $this = $(this);
        if (url && $this.val()) {
          url += '/';
        }
        url += $this.val();
      });
    return url;
  };


  /**
   * modalContent
   * @param content string to display in the content box
   * @param css obj of css attributes
   * @param animation (fadeIn, slideDown, show)
   * @param speed (valid animation speeds slow, medium, fast or # in ms)
   */
  Drupal.CTools.Modal.modalContent = function(content, css, animation, speed) {
    // If our animation isn't set, make it just show/pop
    if (!animation) {
      animation = 'show';
    }
    else {
      // If our animation isn't "fadeIn" or "slideDown" then it always is show
      if (animation != 'fadeIn' && animation != 'slideDown') {
        animation = 'show';
      }
    }

    if (!speed) {
      speed = 'fast';
    }

    // Build our base attributes and allow them to be overriden
    css = jQuery.extend({
      position: 'absolute',
      left: '0px',
      margin: '0px',
      background: '#000',
      opacity: '.55'
    }, css);

    // Add opacity handling for IE.
    css.filter = 'alpha(opacity=' + (100 * css.opacity) + ')';
    content.hide();

    // if we already ahve a modalContent, remove it
    if ( $('#modalBackdrop')) $('#modalBackdrop').remove();
    if ( $('#modalContent')) $('#modalContent').remove();

    // position code lifted from http://www.quirksmode.org/viewport/compatibility.html
    if (self.pageYOffset) { // all except Explorer
    var wt = self.pageYOffset;
    } else if (document.documentElement && document.documentElement.scrollTop) { // Explorer 6 Strict
      var wt = document.documentElement.scrollTop;
    } else if (document.body) { // all other Explorers
      var wt = document.body.scrollTop;
    }

    // Get our dimensions

    // Get the docHeight and (ugly hack) add 50 pixels to make sure we dont have a *visible* border below our div
    var docHeight = $(document).height() + 50;
    var docWidth = $(document).width();
    var winHeight = $(window).height();
    var winWidth = $(window).width();
    if( docHeight < winHeight ) docHeight = winHeight;

    // Create our divs
    $('body').append('<div id="modalBackdrop" style="z-index: 1000; display: none;"></div><div id="modalContent" style="z-index: 1001; position: absolute;">' + $(content).html() + '</div>');

    // Keyboard and focus event handler ensures focus stays on modal elements only
    modalEventHandler = function( event ) {
      target = null;
      if ( event ) { //Mozilla
        target = event.target;
      } else { //IE
        event = window.event;
        target = event.srcElement;
      }

      var parents = $(target).parents().get();
      for (var i in $(target).parents().get()) {
        var position = $(parents[i]).css('position');
        if (position == 'absolute' || position == 'fixed') {
          return true;
        }
      }
      if( $(target).filter('*:visible').parents('#modalContent').size()) {
        // allow the event only if target is a visible child node of #modalContent
        return true;
      }
      if ( $('#modalContent')) $('#modalContent').get(0).focus();
      return false;
    };
    $('body').bind( 'focus', modalEventHandler );
    $('body').bind( 'keypress', modalEventHandler );

    // Create our content div, get the dimensions, and hide it
    var modalContent = $('#modalContent').css('top','-1000px');
    var mdcTop = wt + ( winHeight / 2 ) - (  modalContent.outerHeight() / 2);
    var mdcLeft = ( winWidth / 2 ) - ( modalContent.outerWidth() / 2);
    $('#modalBackdrop').css(css).css('top', 0).css('height', docHeight + 'px').css('width', docWidth + 'px').show();
    modalContent.css({top: mdcTop + 'px', left: mdcLeft + 'px'}).hide()[animation](speed);

    // Bind a click for closing the modalContent
    modalContentClose = function(){close(); return false;};
    $('.close').bind('click', modalContentClose);

    // Bind a keypress on escape for closing the modalContent
    modalEventEscapeCloseHandler = function(event) {
      if (event.keyCode == 27) {
        close();
        return false;
      }
    };

    $(document).bind('keypress', modalEventEscapeCloseHandler);

    // Close the open modal content and backdrop
    function close() {
      // Unbind the events
      $(window).unbind('resize',  modalContentResize);
      $('body').unbind( 'focus', modalEventHandler);
      $('body').unbind( 'keypress', modalEventHandler );
      $('.close').unbind('click', modalContentClose);
      $('body').unbind('keypress', modalEventEscapeCloseHandler);
      $(document).trigger('CToolsDetachBehaviors', $('#modalContent'));

      // Set our animation parameters and use them
      if ( animation == 'fadeIn' ) animation = 'fadeOut';
      if ( animation == 'slideDown' ) animation = 'slideUp';
      if ( animation == 'show' ) animation = 'hide';

      // Close the content
      modalContent.hide()[animation](speed);

      // Remove the content
      $('#modalContent').remove();
      $('#modalBackdrop').remove();
    };

    // Move and resize the modalBackdrop and modalContent on resize of the window
     modalContentResize = function(){
      // Get our heights
      var docHeight = $(document).height();
      var docWidth = $(document).width();
      var winHeight = $(window).height();
      var winWidth = $(window).width();
      if( docHeight < winHeight ) docHeight = winHeight;

      // Get where we should move content to
      var modalContent = $('#modalContent');
      var mdcTop = ( winHeight / 2 ) - (  modalContent.outerHeight() / 2);
      var mdcLeft = ( winWidth / 2 ) - ( modalContent.outerWidth() / 2);

      // Apply the changes
      $('#modalBackdrop').css('height', docHeight + 'px').css('width', docWidth + 'px').show();
      modalContent.css('top', mdcTop + 'px').css('left', mdcLeft + 'px').show();
    };
    $(window).bind('resize', modalContentResize);

    $('#modalContent').focus();
  };

  /**
   * unmodalContent
   * @param content (The jQuery object to remove)
   * @param animation (fadeOut, slideUp, show)
   * @param speed (valid animation speeds slow, medium, fast or # in ms)
   */
  Drupal.CTools.Modal.unmodalContent = function(content, animation, speed)
  {
    // If our animation isn't set, make it just show/pop
    if (!animation) { var animation = 'show'; } else {
      // If our animation isn't "fade" then it always is show
      if (( animation != 'fadeOut' ) && ( animation != 'slideUp')) animation = 'show';
    }
    // Set a speed if we dont have one
    if ( !speed ) var speed = 'fast';

    // Unbind the events we bound
    $(window).unbind('resize', modalContentResize);
    $('body').unbind('focus', modalEventHandler);
    $('body').unbind('keypress', modalEventHandler);
    $('.close').unbind('click', modalContentClose);
    $(document).trigger('CToolsDetachBehaviors', $('#modalContent'));

    // jQuery magic loop through the instances and run the animations or removal.
    content.each(function(){
      if ( animation == 'fade' ) {
        $('#modalContent').fadeOut(speed, function() {
          $('#modalBackdrop').fadeOut(speed, function() {
            $(this).remove();
          });
          $(this).remove();
        });
      } else {
        if ( animation == 'slide' ) {
          $('#modalContent').slideUp(speed,function() {
            $('#modalBackdrop').slideUp(speed, function() {
              $(this).remove();
            });
            $(this).remove();
          });
        } else {
          $('#modalContent').remove();
          $('#modalBackdrop').remove();
        }
      }
    });
  };

$(function() {
  Drupal.ajax.prototype.commands.modal_display = Drupal.CTools.Modal.modal_display;
  Drupal.ajax.prototype.commands.modal_dismiss = Drupal.CTools.Modal.modal_dismiss;
});

})(jQuery);
;
// jQuery TimePicker plugin - http://github.com/wvega/timepicker
//
// A jQuery plugin to enhance standard form input fields helping users to select
// (or type) times.
//
// Copyright (c) 2011 Willington Vega <wvega@wvega.com>
// Dual licensed under the MIT or GPL Version 2 licenses.


// Define a cross-browser window.console.log method.
// For IE and FF without Firebug, fallback to using an alert.
//if (!window.console) {
//    var log = window.opera ? window.opera.postError : alert;
//    window.console = { log: function(str) { log(str) } };
//}

if(typeof jQuery != 'undefined') {
    (function($, undefined) {

        function pad(str, ch, length) {
            return Array(length + 1 - str.length).join(ch) + str;
        }

        function normalize() {
            if (arguments.length == 1) {
                var date = arguments[0];
                if (typeof date === 'string') {
                    date = $.fn.timepicker.parseTime(date);
                }
                return new Date(1988, 7, 24, date.getHours(), date.getMinutes(), date.getSeconds());
            } else if (arguments.length == 3) {
                return new Date(1988, 7, 24, arguments[0], arguments[1], arguments[2]);
            } else if (arguments.length == 2) {
                return new Date(1988, 7, 24, arguments[0], arguments[1], 0);
            } else {
                return new Date(1988, 7, 24);
            }
        }

        $.TimePicker = function() {
            var widget = this;

            widget.container = $('.ui-timepicker-container');
            widget.ui = widget.container.find('.ui-timepicker');

            if (widget.ui.length === 0) {
                widget.container = $('<div></div>').addClass('ui-timepicker-container')
                                    .addClass('ui-timepicker-hidden ui-helper-hidden')
                                    .appendTo('body')
                                    .hide();
                widget.ui = $('<ul></ul>').addClass('ui-timepicker')
                                    .addClass('ui-widget ui-widget-content ui-menu')
                                    .addClass('ui-corner-all')
                                    .appendTo(widget.container);

                if ($.fn.jquery >= '1.4.2') {
                    widget.ui.delegate('a', 'mouseenter.timepicker', function(event) {
                        // passing false instead of an instance object tells the function
                        // to use the current instance
                        widget.activate(false, $(this).parent());
                    }).delegate('a', 'mouseleave.timepicker', function(event) {
                        widget.deactivate(false);
                    }).delegate('a', 'click.timepicker', function(event) {
                        event.preventDefault();
                        widget.select(false, $(this).parent());
                    });
                }

                widget.ui.bind('click.timepicker, scroll.timepicker', function(event) {
                    clearTimeout(widget.closing);
                });
            }
        };

        $.TimePicker.count = 0;
        $.TimePicker.instance = function() {
            if (!$.TimePicker._instance) {
                $.TimePicker._instance = new $.TimePicker();
            }
            return $.TimePicker._instance;
        };

        $.TimePicker.prototype = {
            // extracted from from jQuery UI Core
            // http://github,com/jquery/jquery-ui/blob/master/ui/jquery.ui.core.js
            keyCode: {
                ALT: 18,
                BLOQ_MAYUS: 20,
                CTRL: 17,
                DOWN: 40,
                END: 35,
                ENTER: 13,
                HOME: 36,
                LEFT: 37,
                NUMPAD_ENTER: 108,
                PAGE_DOWN: 34,
                PAGE_UP: 33,
                RIGHT: 39,
                SHIFT: 16,
                TAB: 9,
                UP: 38
            },

            _items: function(i, startTime) {
                var widget = this, ul = $('<ul></ul>'), item = null, time, end;

                // interval should be a multiple of 60 if timeFormat is not
                // showing minutes
                if (i.options.timeFormat.indexOf('m') === -1 && i.options.interval % 60 !== 0) {
                    i.options.interval = Math.max(Math.round(i.options.interval / 60), 1) * 60;
                }

                if (startTime) {
                    time = normalize(startTime);
                } else if (i.options.startTime) {
                    time = normalize(i.options.startTime);
                } else {
                    time = normalize(i.options.startHour, i.options.startMinutes);
                }

                end = new Date(time.getTime() + 24 * 60 * 60 * 1000);

                while(time < end) {
                    if (widget._isValidTime(i, time)) {
                        item = $('<li>').addClass('ui-menu-item').appendTo(ul);
                        $('<a>').addClass('ui-corner-all').text($.fn.timepicker.formatTime(i.options.timeFormat, time)).appendTo(item);
                        item.data('time-value', time);
                    }
                    time = new Date(time.getTime() + i.options.interval * 60 * 1000);
                }

                return ul.children();
            },

            _isValidTime: function(i, time) {
                var min = null, max = null;

                time = normalize(time);

                if (i.options.minTime !== null) {
                    min = normalize(i.options.minTime);
                } else if (i.options.minHour !== null || i.options.minMinutes !== null) {
                    min = normalize(i.options.minHour, i.options.minMinutes);
                }

                if (i.options.maxTime !== null) {
                    max = normalize(i.options.maxTime);
                } else if (i.options.maxHour !== null || i.options.maxMinutes !== null) {
                    max = normalize(i.options.maxHour, i.options.maxMinutes);
                }

                if (min !== null && max !== null) {
                    return time >= min && time <= max;
                } else if (min !== null) {
                    return time >= min;
                } else if (max !== null) {
                    return time <= max;
                }

                return true;
            },

            _hasScroll: function() {
                // fix for jQuery 1.6 new prop method
                m = typeof this.ui.prop !== 'undefined' ? 'prop' : 'attr';
                return this.ui.height() < this.ui[m]('scrollHeight');
            },

            /**
             * TODO: Write me!
             *
             * @param i
             * @param direction
             * @param edge
             * */
            _move: function(i, direction, edge) {
                var widget = this;
                if (widget.closed()) {
                    widget.open(i);
                }
                if (!widget.active) {
                    widget.activate(i, widget.ui.children(edge));
                    return;
                }
                var next = widget.active[direction + 'All']('.ui-menu-item').eq(0);
                if (next.length) {
                    widget.activate(i, next);
                } else {
                    widget.activate(i, widget.ui.children(edge));
                }
            },

            //
            // protected methods
            //

            register: function(node, options) {
                var widget = this, i = {}; // timepicker instance object

                i.element = $(node);

                if (i.element.data('TimePicker')) { return; }

                i.element.data('TimePicker', i);
                // TODO: use $.fn.data()
                i.options = $.metadata ? $.extend({}, options, i.element.metadata()) : $.extend({}, options);
                i.widget = widget;
                i.selectedTime = $.fn.timepicker.parseTime(i.element.val());

                // proxy functions for the exposed api methods
                $.extend(i, {
                    next: function() {return widget.next(i) ;},
                    previous: function() {return widget.previous(i) ;},
                    first: function() { return widget.first(i) ;},
                    last: function() { return widget.last(i) ;},
                    selected: function() { return widget.selected(i) ;},
                    open: function() { return widget.open(i) ;},
                    close: function(force) { return widget.close(i, force) ;},
                    closed: function() { return widget.closed(i) ;},
                    destroy: function() { return widget.destroy(i) ;},

                    parse: function(str) { return widget.parse(i, str) ;},
                    format: function(time, format) { return widget.format(i, time, format); },
                    getTime: function() { return widget.getTime(i) ;},
                    setTime: function(time, silent) { return widget.setTime(i, time, silent); },
                    option: function(name, value) { return widget.option(i, name, value); }
                });

                i.element.bind('keydown.timepicker', function(event) {
                    switch (event.which || event.keyCode) {
                        case widget.keyCode.ENTER:
                        case widget.keyCode.NUMPAD_ENTER:
                            event.preventDefault();
                            if (widget.closed()) {
                                i.element.trigger('change.timepicker');
                            } else {
                                widget.select(i, widget.active);
                            }
                            break;
                        case widget.keyCode.UP:
                            i.previous();
                            break;
                        case widget.keyCode.DOWN:
                            i.next();
                            break;
                        default:
                            if (!widget.closed()) {
                                i.close(true);
                            }
                            break;
                    }
                }).bind('focus.timepicker', function(event) {
                    i.open();
                }).bind('blur.timepicker', function(event) {
                    i.close();
                }).bind('change.timepicker', function(event) {
                    if (i.closed()) {
                        i.setTime($.fn.timepicker.parseTime(i.element.val()));
                    }
                });
            },

            select: function(i, item) {
                var widget = this, instance = i === false ? widget.instance : i;
                clearTimeout(widget.closing);
                widget.setTime(instance, $.fn.timepicker.parseTime(item.children('a').text()));
                widget.close(instance, true);
            },

            activate: function(i, item) {
                var widget = this, instance = i === false ? widget.instance : i;

                if (instance !== widget.instance) {
                    return;
                } else {
                    widget.deactivate();
                }

                if (widget._hasScroll()) {
                    var offset = item.offset().top - widget.ui.offset().top,
                        scroll = widget.ui.scrollTop(),
                        height = widget.ui.height();
                    if (offset < 0) {
                        widget.ui.scrollTop(scroll + offset);
                    } else if (offset >= height) {
                        widget.ui.scrollTop(scroll + offset - height + item.height());
                    }
                }

                widget.active = item.eq(0).children('a').addClass('ui-state-hover')
                                                        .attr('id', 'ui-active-item')
                                          .end();
            },

            deactivate: function() {
                var widget = this;
                if (!widget.active) { return; }
                widget.active.children('a').removeClass('ui-state-hover').removeAttr('id');
                widget.active = null;
            },

            /**
             * _activate, _deactivate, first, last, next, previous, _move and
             * _hasScroll were extracted from jQuery UI Menu
             * http://github,com/jquery/jquery-ui/blob/menu/ui/jquery.ui.menu.js
             */

            //
            // public methods
            //

            next: function(i) {
                if (this.closed() || this.instance === i) {
                    this._move(i, 'next', '.ui-menu-item:first');
                }
                return i.element;
            },

            previous: function(i) {
                if (this.closed() || this.instance === i) {
                    this._move(i, 'prev', '.ui-menu-item:last');
                }
                return i.element;
            },

            first: function(i) {
                if (this.instance === i) {
                    return this.active && !this.active.prevAll('.ui-menu-item').length;
                }
                return false;
            },

            last: function(i) {
                if (this.instance === i) {
                    return this.active && !this.active.nextAll('.ui-menu-item').length;
                }
                return false;
            },

            selected: function(i) {
                if (this.instance === i)  {
                    return this.active ? this.active : null;
                }
                return null;
            },

            open: function(i) {
                var widget = this;

                // return if dropdown is disabled
                if (!i.options.dropdown) return i.element;

                // if a date is already selected and options.dynamic is true,
                // arrange the items in the list so the first item is
                // cronologically right after the selected date.
                // TODO: set selectedTime
                if (i.rebuild || !i.items || (i.options.dynamic && i.selectedTime)) {
                    i.items = widget._items(i);
                }

                // remove old li elements but keep associated events, then append
                // the new li elements to the ul
                if (i.rebuild || widget.instance !== i || (i.options.dynamic && i.selectedTime)) {

                    // handle menu events when using jQuery versions previous to
                    // 1.4.2 (thanks to Brian Link)
                    // http://github.com/wvega/timepicker/issues#issue/4
                    if ($.fn.jquery < '1.4.2') {
                        widget.ui.children().remove();
                        widget.ui.append(i.items);
                        widget.ui.find('a').bind('mouseover.timepicker', function(event) {
                            widget.activate(i, $(this).parent());
                        }).bind('mouseout.timepicker', function(event) {
                            widget.deactivate(i);
                        }).bind('click.timepicker', function(event) {
                            event.preventDefault();
                            widget.select(i, $(this).parent());
                        });
                    } else {
                        widget.ui.children().detach();
                        widget.ui.append(i.items);
                    }
                }

                i.rebuild = false;

                // theme
                widget.container.removeClass('ui-helper-hidden ui-timepicker-hidden ui-timepicker-standard ui-timepicker-corners').show();

                switch (i.options.theme) {
                    case 'standard':
                        widget.container.addClass('ui-timepicker-standard');
                        //widget.ui.addClass('ui-timepicker-standard');
                        break;
                    case 'standard-rounded-corners':
                        widget.container.addClass('ui-timepicker-standard ui-timepicker-corners');
                        //widget.ui.addClass('ui-timepicker-standard ui-timepicker-corners');
                        break;
                    default:
                        break;
                }

                /* resize ui */

                // we are hiding the scrollbar in the dropdown menu adding a 40px
                // padding to the UL element making the scrollbar appear in the
                // part of the UL that's hidden by the container (a DIV).
                //
                // In order to calculate the position, width and height for the UI
                // elements regardless of the CSS styles  that could have been
                // applied to them we need to substract the additional padding,
                // calculate the measuraments with the default styles and add the
                // padding at the end of the process.
                var paddingRight = parseInt(widget.ui.css('paddingRight'), 10),
                    decoration, zindex;
                if (widget.ui.hasClass('ui-no-scrollbar') && !i.options.scrollbar) {
                    widget.ui.css({ paddingRight: paddingRight - 40 });
                }

                decoration = (widget.ui.outerWidth() - widget.ui.width()) +
                             (widget.container.outerWidth() - widget.container.width());
                zindex = i.options.zindex ? i.options.zindex : i.element.offsetParent().css('z-index');

                // width + padding + border = input field's outer width
                widget.ui.css({ width: i.element.outerWidth() - decoration });
                widget.container.css($.extend(i.element.offset(), {
                    height: widget.ui.outerHeight(),
                    width: widget.ui.outerWidth(),
                    zIndex: zindex
                }));

                decoration = i.items.eq(0).outerWidth() - i.items.eq(0).width();
                i.items.css('width', widget.ui.width() - decoration);

                // here we add the padding again
                if (widget.ui.hasClass('ui-no-scrollbar') && !i.options.scrollbar) {
                    widget.ui.css({ paddingRight: paddingRight });
                } else if (!i.options.scrollbar) {
                    widget.ui.css({ paddingRight: paddingRight + 40 }).addClass('ui-no-scrollbar');
                }

                // position
                widget.container.css('top', parseInt(widget.container.css('top'), 10) + i.element.outerHeight());

                widget.instance = i;

                // try to match input field's current value with an item in the
                // dropdown
                if (i.selectedTime) {
                    i.items.each(function() {
                        var item = $(this), time;

                        if ($.fn.jquery < '1.4.2') {
                            time = $.fn.timepicker.parseTime(item.find('a').text());
                        } else {
                            time = item.data('time-value');
                        }

                        if (time.getTime() == i.selectedTime.getTime()) {
                            widget.activate(i, item);
                            return false;
                        }
                        return true;
                    });
                } else {
                    widget.deactivate(i);
                }

                // don't break the chain
                return i.element;
            },

            close: function(i, force) {
                var widget = this;
                if (widget.closed() || force) {
                    clearTimeout(widget.closing);
                    if (widget.instance === i) {
                        widget.container.addClass('ui-helper-hidden ui-timepicker-hidden').hide();
                        widget.ui.scrollTop(0);
                        widget.ui.children().removeClass('ui-state-hover');
                    }
                } else {
                    widget.closing = setTimeout(function() {
                        widget.close(i, true);
                    }, 150);
                }
                return i.element;
            },

            closed: function() {
                return this.ui.is(':hidden');
            },

            destroy: function(i) {
                var widget = this;
                widget.close(i, true);
                return i.element.unbind('.timepicker').data('TimePicker', null);
            },

            //

            parse: function(i, str) {
                return $.fn.timepicker.parseTime(str);
            },

            format: function(i, time, format) {
                format = format || i.options.timeFormat;
                return $.fn.timepicker.formatTime(format, time);
            },

            getTime: function(i) {
                return i.selectedTime ? i.selectedTime : null;
            },

            setTime: function(i, time, silent) {
                var widget = this;

                if (typeof time === 'string') {
                    time = i.parse(time);
                }

                if (time && time.getMinutes && widget._isValidTime(i, time)) {
                    time = normalize(time);
                    i.selectedTime = time;
                    i.element.val(i.format(time, i.options.timeFormat));

                    // TODO: add documentaion about setTime being chainable
                    if (silent) { return i; }

                    // custom change event and change callback
                    // TODO: add documentation about this event
                    i.element.trigger('time-change', [time]);
                    if ($.isFunction(i.options.change)) {
                        i.options.change.apply(i.element, [time]);
                    }
                } else {
                    i.selectedTime = null;
                }

                return i.element;
            },

            option: function(i, name, value) {
                if (typeof value === 'undefined') {
                    return i.options[name];
                }

                var widget = this, options = {};

                if (typeof name === 'string') {
                    options[name] = value;
                } else {
                    options = name;
                }

                // some options require rebuilding the dropdown items
                destructive = ['minHour', 'minMinutes', 'minTime',
                               'maxHour', 'maxMinutes', 'maxTime',
                               'startHour', 'startMinutes', 'startTime',
                               'timeFormat', 'interval', 'dropdown'];

                $.each(i.options, function(name, value) {
                    if (typeof options[name] !== 'undefined') {
                        i.options[name] = options[name];
                        if (!i.rebuild && $.inArray(name, destructive) > -1) {
                            i.rebuild = true;
                        }
                    }
                });

                if (i.rebuild) {
                    i.setTime(i.getTime());
                }
            }
        };

        $.TimePicker.defaults =  {
            timeFormat: 'hh:mm p',
            minHour: null,
            minMinutes: null,
            minTime: null,
            maxHour: null,
            maxMinutes: null,
            maxTime: null,
            startHour: null,
            startMinutes: null,
            startTime: null,
            interval: 30,
            dynamic: true,
            theme: 'standard',
            zindex: null,
            dropdown: true,
            scrollbar: false,
            // callbacks
            change: function(time) {}
        };

        $.TimePicker.methods = {
            chainable: [
                'next',
                'previous',
                'open',
                'close',
                'destroy',
                'setTime'
            ]
        };

        $.fn.timepicker = function(options) {
            // TODO: see if it works with previous versions
            if ($.fn.jquery < '1.3') {
                return this;
            }

            // support calling API methods using the following syntax:
            //   $(...).timepicker('parse', '11p');
            if (typeof options === 'string') {
                var args = Array.prototype.slice.call(arguments, 1),
                    result;

                // chainable API methods
                if (options === 'option' && arguments.length > 2) {
                    method = 'each';
                } else if ($.inArray(options, $.TimePicker.methods.chainable) !== -1) {
                    method = 'each';
                // API methods that return a value
                } else {
                    method = 'map';
                }

                result = this[method](function() {
                    var element = $(this), i = element.data('TimePicker');
                    if (typeof i === 'object') {
                        return i[options].apply(i, args);
                    }
                });

                if (method === 'map' && this.length == 1) {
                    return $.makeArray(result).shift();
                } else if (method === 'map') {
                    return $.makeArray(result);
                } else {
                    return result;
                }
            }

            // calling the constructor again on a jQuery object with a single
            // element returns a reference to a TimePicker object.
            if (this.length == 1 && this.data('TimePicker')) {
                return this.data('TimePicker');
            }

            var globals = $.extend({}, $.TimePicker.defaults, options);

            return this.each(function() {
                $.TimePicker.instance().register(this, globals);
            });
        };

        /**
         * TODO: documentation
         */
        $.fn.timepicker.formatTime = function(format, time) {
            var hours = time.getHours(),
                hours12 = hours % 12,
                minutes = time.getMinutes(),
                seconds = time.getSeconds(),
                replacements = {
                    hh: pad((hours12 === 0 ? 12 : hours12).toString(), '0', 2),
                    HH: pad(hours.toString(), '0', 2),
                    mm: pad(minutes.toString(), '0', 2),
                    ss: pad(seconds.toString(), '0', 2),
                    h: (hours12 === 0 ? 12 : hours12),
                    H: hours,
                    m: minutes,
                    s: seconds,
                    p: hours > 11 ? 'PM' : 'AM'
                },
                str = format, k = '';
            for (k in replacements) {
                if (replacements.hasOwnProperty(k)) {
                    str = str.replace(new RegExp(k,'g'), replacements[k]);
                }
            }
            return str;
        };

        /**
         * Convert a string representing a given time into a Date object.
         *
         * The Date object will have attributes others than hours, minutes and
         * seconds set to current local time values. The function will return
         * false if given string can't be converted.
         *
         * If there is an 'a' in the string we set am to true, if there is a 'p'
         * we set pm to true, if both are present only am is setted to true.
         *
         * All non-digit characters are removed from the string before trying to
         * parse the time.
         *
         * ''       can't be converted and the function returns false.
         * '1'      is converted to     01:00:00 am
         * '11'     is converted to     11:00:00 am
         * '111'    is converted to     01:11:00 am
         * '1111'   is converted to     11:11:00 am
         * '11111'  is converted to     01:11:11 am
         * '111111' is converted to     11:11:11 am
         *
         * Only the first six (or less) characters are considered.
         *
         * Special case:
         *
         * When hours is greater than 24 and the last digit is less or equal than 6, and minutes
         * and seconds are less or equal than 60, we append a trailing zero and
         * start parsing process again. Examples:
         *
         * '95' is treated as '950' and converted to 09:50:00 am
         * '46' is treated as '460' and converted to 05:00:00 am
         * '57' can't be converted and the function returns false.
         *
         * For a detailed list of supported formats check the unit tests at
         * http://github.com/wvega/timepicker/tree/master/tests/
         */
        $.fn.timepicker.parseTime = (function(str) {
            var patterns = [
                    // 1, 12, 123, 1234, 12345, 123456
                    [/^(\d+)$/, '$1'],
                    // :1, :2, :3, :4 ... :9
                    [/^:(\d)$/, '$10'],
                    // :1, :12, :123, :1234 ...
                    [/^:(\d+)/, '$1'],
                    // 6:06, 5:59, 5:8
                    [/^(\d):([7-9])$/, '0$10$2'],
                    [/^(\d):(\d\d)$/, '$1$2'],
                    [/^(\d):(\d{1,})$/, '0$1$20'],
                    // 10:8, 10:10, 10:34
                    [/^(\d\d):([7-9])$/, '$10$2'],
                    [/^(\d\d):(\d)$/, '$1$20'],
                    [/^(\d\d):(\d*)$/, '$1$2'],
                    // 123:4, 1234:456
                    [/^(\d{3,}):(\d)$/, '$10$2'],
                    [/^(\d{3,}):(\d{2,})/, '$1$2'],
                    //
                    [/^(\d):(\d):(\d)$/, '0$10$20$3'],
                    [/^(\d{1,2}):(\d):(\d\d)/, '$10$2$3']],
                length = patterns.length;

            return function(str) {
                var time = normalize(new Date()),
                    am = false, pm = false, h = false, m = false, s = false;

                if (typeof str === 'undefined' || !str.toLowerCase) { return null; }

                str = str.toLowerCase();
                am = /a/.test(str);
                pm = am ? false : /p/.test(str);
                str = str.replace(/[^0-9:]/g, '').replace(/:+/g, ':');

                for (var k = 0; k < length; k++) {
                    if (patterns[k][0].test(str)) {
                        str = str.replace(patterns[k][0], patterns[k][1]);
                        break;
                    }
                }
                str = str.replace(/:/g, '');

                if (str.length == 1) {
                    h = str;
                } else if (str.length == 2) {
                    h = str;
                } else if (str.length == 3 || str.length == 5) {
                    h = str.substr(0, 1);
                    m = str.substr(1, 2);
                    s = str.substr(3, 2);
                } else if (str.length == 4 || str.length > 5) {
                    h = str.substr(0, 2);
                    m = str.substr(2, 2);
                    s = str.substr(4, 2);
                }

                if (str.length > 0 && str.length < 5) {
                    if (str.length < 3) {
                        m = 0;
                    }
                    s = 0;
                }

                if (h === false || m === false || s === false) {
                    return false;
                }

                h = parseInt(h, 10); m = parseInt(m, 10); s = parseInt(s, 10);

                if (am && h == 12) {
                    h = 0;
                } else if (pm && h < 12) {
                    h = h + 12;
                }

                if (h > 24 && (h % 10) <= 6 && m <= 60 && s <= 60) {
                    if (str.length >= 6) {
                        return $.fn.timepicker.parseTime(str.substr(0,5));
                    } else {
                        return $.fn.timepicker.parseTime(str + '0' + (am ? 'a' : '') + (pm ? 'p' : ''));
                    }
                } else if (h <= 24 && m <= 60 && s <= 60) {
                    time.setHours(h, m, s);
                    return time;
                } else {
                    return false;
                }
            };
        })();
    })(jQuery);
}
;
/**
 * Attaches the calendar behavior to all required fields
 */
(function ($) {
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
})(jQuery);
;
(function($) {
//Drupal.ewGoogleMaps.showMap($('.map-holder')[0], 'Hotel Seasons Netanya, Netanya, Israel');
Drupal.ewGoogleMaps = Drupal.ewGoogleMaps || {
  mapId: 'map_canvas',
  map: null,
  marker: null,
  infowindow: null,
  geocoder: new google.maps.Geocoder(),
  prepareMapHolder: function(element) {
    /*if ($(element).find('.map-holder').length == 0) {
      $('<div class="map-holder"></div>').insertAfter(element);
    }*/
  },
  mapToDefault: function() {
    var map = $('#' + Drupal.ewGoogleMaps.mapId);

    var oldRow = map.parents('tr').first();
    $(map).detach().appendTo('body');

    if (oldRow.length > 0) {
      oldRow[0].deleteCell(0);
      $(oldRow).remove();
    }

    Drupal.ewGoogleMaps.setDefaultAttr();
  },
  hideMap: function(callback) {
    var map = $('#' + Drupal.ewGoogleMaps.mapId);
    if (map.is(":visible")) {
      map.slideUp(function() {
        Drupal.ewGoogleMaps.mapToDefault();
        if (typeof callback !== 'undefined') {
          callback();
        }
      });
    }
    else if (typeof callback !== 'undefined') {
      callback();
    }
  },
  showMap: function(table, clickedRow, address) {
    Drupal.ewGoogleMaps.hideMap(function() {
      var map = $('#' + Drupal.ewGoogleMaps.mapId);

      // Move the map to the other place in the dom
      if (typeof table !== 'undefined') {
        var rowIndex = $(clickedRow).index() + 2;

        var row = $(table)[0].insertRow(rowIndex);
        var cell1=row.insertCell(0);
        map.appendTo(cell1);
        Drupal.ewGoogleMaps.setDisplayAttr();
      }

      if (typeof address !== 'undefined') {
        service = new google.maps.places.PlacesService(Drupal.ewGoogleMaps.map);
        service.textSearch({ query: address }, function(results, status) {
          if (status == google.maps.places.PlacesServiceStatus.OK) {
            var place = results[0];
            service.getDetails({ reference: place.reference }, function(place, status) {
              if (status == google.maps.places.PlacesServiceStatus.OK) {
                var url = (typeof place.website !== "undefined" ? place.website : (typeof place.url !== "undefined" ? place.url : ''));
                var infoContent = '<div id="info-content">' +
                  '<div class="name"><center><b>' + place.name + '</b></center></div>' +
                  '<div class="address">' + place.formatted_address + '</div>' +
                  (typeof place.formatted_phone_number !== "undefined" ? '<div class="phone">' + place.formatted_phone_number + '</div>' : '') +
                  (typeof place.rating !== "undefined" ? '<div class="rating">' + place.rating + Drupal.t(' Ratings') + '</div>' : '') +
                  (url != '' ? '<div class="url"><a href="' + url + '" target="_blank"><span class="link-pic"></span>' + Drupal.t('More Info') + '</a></div>' : '') +
                '</div>';

                Drupal.ewGoogleMaps.setCenter(place.geometry.location);
                Drupal.ewGoogleMaps.map.setZoom(17);  // Why 17? Because it looks good.

                Drupal.ewGoogleMaps.infowindow.setContent(infoContent);
                Drupal.ewGoogleMaps.infowindow.open(Drupal.ewGoogleMaps.map, Drupal.ewGoogleMaps.marker);
              }
            });
            
          }
        });

        var map = $('#' + Drupal.ewGoogleMaps.mapId);
        map.slideDown();
      }
    });
  },
/*  geocode: function(address, callback) {
    Drupal.ewGoogleMaps.geocoder.geocode( { 'address': address }, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        console.log(results);
        var place = results[0];

        Drupal.ewGoogleMaps.setCenter(place.geometry.location);

        var url = (typeof place.website !== "undefined" ? place.website : (typeof place.url !== "undefined" ? place.url : ''));
        var infoContent = '<div id="info-content">' +
          '<div class="name"><center><b>' + place.name + '</b></center></div>' +
          '<div class="address">' + place.formatted_address + '</div>' +
          (typeof place.formatted_phone_number !== "undefined" ? '<div class="phone">' + place.formatted_phone_number + '</div>' : '') +
          (typeof place.rating !== "undefined" ? '<div class="rating">' + place.rating + Drupal.t(' Ratings') + '</div>' : '') +
          (url != '' ? '<div class="url"><a href="' + url + '" target="_blank"><span class="link-pic"></span>' + Drupal.t('More Info') + '</a></div>' : '') +
        '</div>';

        Drupal.ewGoogleMaps.infowindow.setContent(infoContent);
        Drupal.ewGoogleMaps.infowindow.open(Drupal.ewGoogleMaps.map, Drupal.ewGoogleMaps.marker);
        callback();
      }
      else {
        //alert("Geocode was not successful for the following reason: " + status);
      }
    });
  },*/
  setCenter: function(latLng) {
    Drupal.ewGoogleMaps.map.panTo(latLng);
    Drupal.ewGoogleMaps.marker.setPosition(latLng);

  },
  setDefaultAttr: function() {
    var map = $('#' + Drupal.ewGoogleMaps.mapId);
    map.attr('style', "width: 773px; height: 420px; position: absolute; top:-99999px; left: -99999px;");
  },
  setDisplayAttr: function() {
    var map = $('#' + Drupal.ewGoogleMaps.mapId);
    map.attr('style', "width: 773px; height: 420px; position: relative;");
  }
}

Drupal.behaviors.ewGoogleMaps = {
  attach: function(context, settings) {
    $('body').once('ewGoogleMaps', function() {
      $('body').append('<div id="' + Drupal.ewGoogleMaps.mapId + '" class="init-map" style="width: 773px; height: 420px; position: absolute; top:-99999px; left: -99999px;"></div>');

      var mapOptions = {
        zoom: 8,
        center: new google.maps.LatLng(-34.397, 150.644),
        mapTypeId: google.maps.MapTypeId.ROADMAP
      }
      Drupal.ewGoogleMaps.map = new google.maps.Map($('#' + Drupal.ewGoogleMaps.mapId)[0], mapOptions);
      Drupal.ewGoogleMaps.infowindow = new google.maps.InfoWindow();

      var image = new google.maps.MarkerImage(
        'http://' + Drupal.settings.domain + Drupal.settings.pathToTheme + '/images/marker-images/image.png',
        new google.maps.Size(31,46),
        new google.maps.Point(0,0),
        new google.maps.Point(16,46)
      );

      var shadow = new google.maps.MarkerImage(
        'http://' + Drupal.settings.domain + '/' + Drupal.settings.pathToTheme + '/images/marker-images/shadow.png',
        new google.maps.Size(57,46),
        new google.maps.Point(0,0),
        new google.maps.Point(16,46)
      );

      var shape = {
        coord: [16,0,21,1,23,2,24,3,25,4,26,5,27,6,28,7,28,8,29,9,29,10,29,11,30,12,30,13,30,14,30,15,30,16,30,17,30,18,29,19,29,20,29,21,28,22,28,23,28,24,27,25,27,26,26,27,26,28,25,29,25,30,24,31,24,32,23,33,23,34,22,35,21,36,21,37,20,38,20,39,19,40,18,41,18,42,17,43,16,44,16,45,14,45,14,44,13,43,12,42,12,41,11,40,10,39,10,38,9,37,9,36,8,35,7,34,7,33,6,32,6,31,5,30,5,29,4,28,4,27,3,26,3,25,2,24,2,23,2,22,1,21,1,20,1,19,0,18,0,17,0,16,0,15,0,14,0,13,0,12,1,11,1,10,1,9,2,8,2,7,3,6,4,5,5,4,6,3,7,2,9,1,14,0,16,0],
        type: 'poly'
      };

      Drupal.ewGoogleMaps.marker = new google.maps.Marker({
        draggable: false,
        raiseOnDrag: false,
        icon: image,
        shadow: shadow,
        shape: shape,
        map: Drupal.ewGoogleMaps.map
        //position: point
      });
    });
  }
};

Drupal.ewGooglePlaces = Drupal.ewGooglePlace || {
  autocomplete: []
};

Drupal.behaviors.ewGooglePlaces = {
  attach: function(context, settings) {
    $('tr .field-name-field-place-address input.form-text', '#edit-field-place').once('ewGooglePlaces', function() {
      if (!$(this).hasClass('google-places-autocomplete')) {
        var options = {
          types: [],
          //components: 'country:us'
        };

        var autocomplete = new google.maps.places.Autocomplete($(this)[0], options);
        Drupal.ewGooglePlaces.autocomplete.push(autocomplete);

        //autocomplete.bindTo('bounds', Drupal.ewGoogleMaps.map);

        // Attach the listener to the autocomplete 'place_changed' event
        google.maps.event.addListener(autocomplete, 'place_changed', function() {
          Drupal.ewGoogleMaps.infowindow.close();
          var map = Drupal.ewGoogleMaps.map;
          var place = autocomplete.getPlace();
         
          Drupal.ewGoogleMaps.setCenter(place.geometry.location);
          map.setZoom(17);  // Why 17? Because it looks good.

          var url = (typeof place.website !== "undefined" ? place.website : (typeof place.url !== "undefined" ? place.url : ''));
          var infoContent = '<div id="info-content">' +
            '<div class="name"><center><b>' + place.name + '</b></center></div>' +
            '<div class="address">' + place.formatted_address + '</div>' +
            (typeof place.formatted_phone_number !== "undefined" ? '<div class="phone">' + place.formatted_phone_number + '</div>' : '') +
            (typeof place.rating !== "undefined" ? '<div class="rating">' + place.rating + Drupal.t(' Ratings') + '</div>' : '') +
            (url != '' ? '<div class="url"><a href="' + url + '" target="_blank"><span class="link-pic"></span>' + Drupal.t('More Info') + '</a></div>' : '') +
          '</div>';

          Drupal.ewGoogleMaps.infowindow.setContent(infoContent);
          Drupal.ewGoogleMaps.infowindow.open(map, Drupal.ewGoogleMaps.marker);
        });

        // Adding a unique marker to not do this every time for the same field
        $(this).addClass('google-places-autocomplete');

      }
    });
  }
};
})(jQuery);;
(function($){
Drupal.behaviors.contextReactionBlock = {attach: function(context) {
  $('form.context-editor:not(.context-block-processed)')
    .addClass('context-block-processed')
    .each(function() {
      var id = $(this).attr('id');
      Drupal.contextBlockEditor = Drupal.contextBlockEditor || {};
      $(this).bind('init.pageEditor', function(event) {
        Drupal.contextBlockEditor[id] = new DrupalContextBlockEditor($(this));
      });
      $(this).bind('start.pageEditor', function(event, context) {
        // Fallback to first context if param is empty.
        if (!context) {
          context = $(this).data('defaultContext');
        }
        Drupal.contextBlockEditor[id].editStart($(this), context);
      });
      $(this).bind('end.pageEditor', function(event) {
        Drupal.contextBlockEditor[id].editFinish();
      });
    });

  //
  // Admin Form =======================================================
  //
  // ContextBlockForm: Init.
  $('#context-blockform:not(.processed)').each(function() {
    $(this).addClass('processed');
    Drupal.contextBlockForm = new DrupalContextBlockForm($(this));
    Drupal.contextBlockForm.setState();
  });

  // ContextBlockForm: Attach block removal handlers.
  // Lives in behaviors as it may be required for attachment to new DOM elements.
  $('#context-blockform a.remove:not(.processed)').each(function() {
    $(this).addClass('processed');
    $(this).click(function() {
      $(this).parents('tr').eq(0).remove();
      Drupal.contextBlockForm.setState();
      return false;
    });
  });

  // Conceal Section title, subtitle and class
  $('div.context-block-browser', context).nextAll('.form-item').hide();
}};

/**
 * Context block form. Default form for editing context block reactions.
 */
DrupalContextBlockForm = function(blockForm) {
  this.state = {};

  this.setState = function() {
    $('table.context-blockform-region', blockForm).each(function() {
      var region = $(this).attr('id').split('context-blockform-region-')[1];
      var blocks = [];
      $('tr', $(this)).each(function() {
        var bid = $(this).attr('id');
        var weight = $(this).find('select,input').first().val();
        blocks.push({'bid' : bid, 'weight' : weight});
      });
      Drupal.contextBlockForm.state[region] = blocks;
    });

    // Serialize here and set form element value.
    $('form input.context-blockform-state').val(JSON.stringify(this.state));

    // Hide enabled blocks from selector that are used
    $('table.context-blockform-region tr').each(function() {
      var bid = $(this).attr('id');
      $('div.context-blockform-selector input[value='+bid+']').parents('div.form-item').eq(0).hide();
    });
    // Show blocks in selector that are unused
    $('div.context-blockform-selector input').each(function() {
      var bid = $(this).val();
      if ($('table.context-blockform-region tr#'+bid).size() === 0) {
        $(this).parents('div.form-item').eq(0).show();
      }
    });

  };

  // make sure we update the state right before submits, this takes care of an
  // apparent race condition between saving the state and the weights getting set
  // by tabledrag
  $('#ctools-export-ui-edit-item-form').submit(function() { Drupal.contextBlockForm.setState(); });

  // Tabledrag
  // Add additional handlers to update our blocks.
  $.each(Drupal.settings.tableDrag, function(base) {
    var table = $('#' + base + ':not(.processed)', blockForm);
    if (table && table.is('.context-blockform-region')) {
      table.addClass('processed');
      table.bind('mouseup', function(event) {
        Drupal.contextBlockForm.setState();
        return;
      });
    }
  });

  // Add blocks to a region
  $('td.blocks a', blockForm).each(function() {
    $(this).click(function() {
      var region = $(this).attr('href').split('#')[1];
      var base = "context-blockform-region-"+ region;
      var selected = $("div.context-blockform-selector input:checked");
      if (selected.size() > 0) {
        var weight_warn = false;
        var min_weight_option = -10;
        var max_weight_option = 10;
        var max_observed_weight = min_weight_option - 1;
        $('table#' + base + ' tr').each(function() {
          var weight_input_val = $(this).find('select,input').first().val();
          if (+weight_input_val > +max_observed_weight) {
            max_observed_weight = weight_input_val;
          }
        });

        selected.each(function() {
          // create new block markup
          var block = document.createElement('tr');
          var text = $(this).parents('div.form-item').eq(0).hide().children('label').text();
          var select = '<div class="form-item form-type-select"><select class="tabledrag-hide form-select">';
          var i;
          weight_warn = true;
          var selected_weight = max_weight_option;
          if (max_weight_option >= (1 + +max_observed_weight)) {
            selected_weight = ++max_observed_weight;
            weight_warn = false;
          }

          for (i = min_weight_option; i <= max_weight_option; ++i) {
            select += '<option';
            if (i == selected_weight) {
              select += ' selected=selected';
            }
            select += '>' + i + '</option>';
          }
          select += '</select></div>';
          $(block).attr('id', $(this).attr('value')).addClass('draggable');
          $(block).html("<td>"+ text + "</td><td>" + select + "</td><td><a href='' class='remove'>X</a></td>");

          // add block item to region
          //TODO : Fix it so long blocks don't get stuck when added to top regions and dragged towards bottom regions
          Drupal.tableDrag[base].makeDraggable(block);
          $('table#'+base).append(block);
          if ($.cookie('Drupal.tableDrag.showWeight') == 1) {
            $('table#'+base).find('.tabledrag-hide').css('display', '');
            $('table#'+base).find('.tabledrag-handle').css('display', 'none');
          }
          else {
            $('table#'+base).find('.tabledrag-hide').css('display', 'none');
            $('table#'+base).find('.tabledrag-handle').css('display', '');
          }
          Drupal.attachBehaviors($('table#'+base));

          Drupal.contextBlockForm.setState();
          $(this).removeAttr('checked');
        });
        if (weight_warn) {
          alert(Drupal.t('Desired block weight exceeds available weight options, please check weights for blocks before saving'));
        }
      }
      return false;
    });
  });
};

/**
 * Context block editor. AHAH editor for live block reaction editing.
 */
DrupalContextBlockEditor = function(editor) {
  this.editor = editor;
  this.state = {};
  this.blocks = {};
  this.regions = {};

  return this;
};

DrupalContextBlockEditor.prototype = {
  initBlocks : function(blocks) {
    var self = this;
    this.blocks = blocks;
    blocks.each(function() {
      if($(this).hasClass('context-block-empty')) {
        $(this).removeClass('context-block-hidden');
      }
      $(this).addClass('draggable');
      $(this).prepend($('<a class="context-block-handle"></a>'));
      $(this).prepend($('<a class="context-block-remove"></a>').click(function() {
        $(this).parent ('.block').eq(0).fadeOut('medium', function() {
          $(this).remove();
          self.updateBlocks();
        });
        return false;
      }));
    });
  },
  initRegions : function(regions) {
    this.regions = regions;
    var ref = this;

    $(regions).not('.context-ui-processed')
      .each(function(index, el) {
        $('.context-ui-add-link', el).click(function(e){
          ref.showBlockBrowser($(this).parent());
        }).addClass('context-ui-processed');
      });
    $('.context-block-browser').hide();
  },
  showBlockBrowser : function(region) {
    var toggled = false;
    //figure out the id of the context
    var activeId = $('.context-editing', this.editor).attr('id').replace('-trigger', ''),
    context = $('#' + activeId)[0];

    this.browser = $('.context-block-browser', context).addClass('active');

    //add the filter element to the block browser
    if (!this.browser.has('input.filter').size()) {
      var parent = $('.block-browser-sidebar .filter', this.browser);
      var list = $('.blocks', this.browser);
      new Drupal.Filter (list, false, '.context-block-addable', parent);
    }
    //show a dialog for the blocks list
    this.browser.show().dialog({
      modal : true,
      close : function() {
        $(this).dialog('destroy');
        //reshow all the categories
        $('.category', this).show();
        $(this).hide().appendTo(context).removeClass('active');
      },
      height: (.8 * $(window).height()),
      minHeight:400,
      minWidth:680,
      width:680
    });

    //handle showing / hiding block items when a different category is selected
    $('.context-block-browser-categories', this.browser).change(function(e) {
      //if no category is selected we want to show all the items
      if ($(this).val() == 0) {
        $('.category', self.browser).show();
      } else {
        $('.category', self.browser).hide();
        $('.category-' + $(this).val(), self.browser).show();
      }
    });

    //if we already have the function for a different context, rebind it so we don't get dupes
    if(this.addToRegion) {
      $('.context-block-addable', this.browser).unbind('click.addToRegion')
    }

    //protected function for adding a clicked block to a region
    var self = this;
    this.addToRegion = function(e){
      var ui = {
        'item' : $(this).clone(),
        'sender' : $(region)
      };
      $(this).parents('.context-block-browser.active').dialog('close');
      $(region).after(ui.item);
      self.addBlock(e, ui, this.editor, activeId.replace('context-editable-', ''));
    };

    $('.context-block-addable', this.browser).bind('click.addToRegion', this.addToRegion);
  },
  // Update UI to match the current block states.
  updateBlocks : function() {
    var browser = $('div.context-block-browser');

    // For all enabled blocks, mark corresponding addables as having been added.
    $('.block, .admin-block').each(function() {
      var bid = $(this).attr('id').split('block-')[1]; // Ugh.
    });
    // For all hidden addables with no corresponding blocks, mark as addable.
    $('.context-block-item', browser).each(function() {
      var bid = $(this).attr('id').split('context-block-addable-')[1];
    });

    // Mark empty regions.
    $(this.regions).each(function() {
      if ($('.block:has(a.context-block)', this).size() > 0) {
        $(this).removeClass('context-block-region-empty');
      }
      else {
        $(this).addClass('context-block-region-empty');
      }
    });
  },
  // Live update a region
  updateRegion : function(event, ui, region, op) {
    switch (op) {
      case 'over':
        $(region).removeClass('context-block-region-empty');
        break;
      case 'out':
        if (
          // jQuery UI 1.8
          $('.draggable-placeholder', region).size() === 1 &&
          $('.block:has(a.context-block)', region).size() == 0
        ) {
          $(region).addClass('context-block-region-empty');
        }
        break;
    }
  },
  // Remove script elements while dragging & dropping.
  scriptFix : function(event, ui, editor, context) {
    if ($('script', ui.item)) {
      var placeholder = $(Drupal.settings.contextBlockEditor.scriptPlaceholder);
      var label = $('div.handle label', ui.item).text();
      placeholder.children('strong').html(label);
      $('script', ui.item).parent().empty().append(placeholder);
    }
  },
  // Add a block to a region through an AJAX load of the block contents.
  addBlock : function(event, ui, editor, context) {
    var self = this;
    if (ui.item.is('.context-block-addable')) {
      var bid = ui.item.attr('id').split('context-block-addable-')[1];

      // Construct query params for our AJAX block request.
      var params = Drupal.settings.contextBlockEditor.params;
      params.context_block = bid + ',' + context;
      if (!Drupal.settings.contextBlockEditor.block_tokens || !Drupal.settings.contextBlockEditor.block_tokens[bid]) {
        alert(Drupal.t('An error occurred trying to retrieve block content. Please contact a site administer.'));
        return;
     }
     params.context_token = Drupal.settings.contextBlockEditor.block_tokens[bid];

      // Replace item with loading block.
      //ui.sender.append(ui.item);

      var blockLoading = $('<div class="context-block-item context-block-loading"><span class="icon"></span></div>');
      ui.item.addClass('context-block-added');
      ui.item.after(blockLoading);


      $.getJSON(Drupal.settings.contextBlockEditor.path, params, function(data) {
        if (data.status) {
          var newBlock = $(data.block);
          if ($('script', newBlock)) {
            $('script', newBlock).remove();
          }
          blockLoading.fadeOut(function() {
            $(this).replaceWith(newBlock);
            self.initBlocks(newBlock);
            self.updateBlocks();
            Drupal.attachBehaviors(newBlock);
          });
        }
        else {
          blockLoading.fadeOut(function() { $(this).remove(); });
        }
      });
    }
    else if (ui.item.is(':has(a.context-block)')) {
      self.updateBlocks();
    }
  },
  // Update form hidden field with JSON representation of current block visibility states.
  setState : function() {
    var self = this;

    $(this.regions).each(function() {
      var region = $('.context-block-region', this).attr('id').split('context-block-region-')[1];
      var blocks = [];
      $('a.context-block', $(this)).each(function() {
        if ($(this).attr('class').indexOf('edit-') != -1) {
          var bid = $(this).attr('id').split('context-block-')[1];
          var context = $(this).attr('class').split('edit-')[1].split(' ')[0];
          context = context ? context : 0;
          var block = {'bid': bid, 'context': context};
          blocks.push(block);
        }
      });
      self.state[region] = blocks;
    });
    // Serialize here and set form element value.
    $('input.context-block-editor-state', this.editor).val(JSON.stringify(this.state));
  },
  //Disable text selection.
  disableTextSelect : function() {
    if ($.browser.safari) {
      $('.block:has(a.context-block):not(:has(input,textarea))').css('WebkitUserSelect','none');
    }
    else if ($.browser.mozilla) {
      $('.block:has(a.context-block):not(:has(input,textarea))').css('MozUserSelect','none');
    }
    else if ($.browser.msie) {
      $('.block:has(a.context-block):not(:has(input,textarea))').bind('selectstart.contextBlockEditor', function() { return false; });
    }
    else {
      $(this).bind('mousedown.contextBlockEditor', function() { return false; });
    }
  },
  //Enable text selection.
  enableTextSelect : function() {
    if ($.browser.safari) {
      $('*').css('WebkitUserSelect','');
    }
    else if ($.browser.mozilla) {
      $('*').css('MozUserSelect','');
    }
    else if ($.browser.msie) {
      $('*').unbind('selectstart.contextBlockEditor');
    }
    else {
      $(this).unbind('mousedown.contextBlockEditor');
    }
  },
  // Start editing. Attach handlers, begin draggable/sortables.
  editStart : function(editor, context) {
    var self = this;
    // This is redundant to the start handler found in context_ui.js.
    // However it's necessary that we trigger this class addition before
    // we call .sortable() as the empty regions need to be visible.
    $(document.body).addClass('context-editing');
    this.editor.addClass('context-editing');
    this.disableTextSelect();
    this.initBlocks($('.block:has(a.context-block.edit-'+context+')'));
    this.initRegions($('.context-block-region').parent());
    this.updateBlocks();

    $('a.context_ui_dialog-stop').hide();

    $('.editing-context-label').remove();
    var label = $('#context-editable-trigger-'+context+' .label').text();
    label = Drupal.t('Now Editing: ') + label;
    editor.parent().parent()
      .prepend('<div class="editing-context-label">'+ label + '</div>');

    // First pass, enable sortables on all regions.
    $(this.regions).each(function() {
      var region = $(this);
      var params = {
        revert: true,
        dropOnEmpty: true,
        placeholder: 'draggable-placeholder',
        forcePlaceholderSize: true,
        items: '> .block:has(a.context-block.editable)',
        handle: 'a.context-block-handle',
        start: function(event, ui) { self.scriptFix(event, ui, editor, context); },
        stop: function(event, ui) { self.addBlock(event, ui, editor, context); },
        receive: function(event, ui) { self.addBlock(event, ui, editor, context); },
        over: function(event, ui) { self.updateRegion(event, ui, region, 'over'); },
        out: function(event, ui) { self.updateRegion(event, ui, region, 'out'); },
        cursorAt: {left: 300, top: 0}
      };
      region.sortable(params);
    });

    // Second pass, hook up all regions via connectWith to each other.
    $(this.regions).each(function() {
      $(this).sortable('option', 'connectWith', ['.ui-sortable']);
    });

    // Terrible, terrible workaround for parentoffset issue in Safari.
    // The proper fix for this issue has been committed to jQuery UI, but was
    // not included in the 1.6 release. Therefore, we do a browser agent hack
    // to ensure that Safari users are covered by the offset fix found here:
    // http://dev.jqueryui.com/changeset/2073.
    if ($.ui.version === '1.6' && $.browser.safari) {
      $.browser.mozilla = true;
    }
  },
  // Finish editing. Remove handlers.
  editFinish : function() {
    this.editor.removeClass('context-editing');
    this.enableTextSelect();

    $('.editing-context-label').remove();

    // Remove UI elements.
    $(this.blocks).each(function() {
      $('a.context-block-handle, a.context-block-remove', this).remove();
      if($(this).hasClass('context-block-empty')) {
        $(this).addClass('context-block-hidden');
      }
      $(this).removeClass('draggable');
    });

    $('a.context_ui_dialog-stop').show();

    this.regions.sortable('destroy');

    this.setState();

    // Unhack the user agent.
    if ($.ui.version === '1.6' && $.browser.safari) {
      $.browser.mozilla = false;
    }
  }
}; //End of DrupalContextBlockEditor prototype

})(jQuery);
;
