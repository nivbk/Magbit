/*
 * jQuery Selectbox plugin 0.2
 *
 * Copyright 2011-2012, Dimitar Ivanov (http://www.bulgaria-web-developers.com/projects/javascript/selectbox/)
 * Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.
 * 
 * Date: Tue Jul 17 19:58:36 2012 +0300
 */
(function($,undefined){var PROP_NAME="selectbox",FALSE=false,TRUE=true;function Selectbox(){this._state=[];this._defaults={classHolder:"sbHolder",classHolderDisabled:"sbHolderDisabled",classSelector:"sbSelector",classOptions:"sbOptions",classGroup:"sbGroup",classSub:"sbSub",classDisabled:"sbDisabled",classToggleOpen:"sbToggleOpen",classToggle:"sbToggle",classFocus:"sbFocus",speed:200,effect:"slide",onChange:null,onOpen:null,onClose:null}}$.extend(Selectbox.prototype,{_isOpenSelectbox:function(target){if(!target){return FALSE}var inst=this._getInst(target);return inst.isOpen},_isDisabledSelectbox:function(target){if(!target){return FALSE}var inst=this._getInst(target);return inst.isDisabled},_attachSelectbox:function(target,settings){if(this._getInst(target)){return FALSE}var $target=$(target),self=this,inst=self._newInst($target),sbHolder,sbSelector,sbToggle,sbOptions,s=FALSE,optGroup=$target.find("optgroup"),opts=$target.find("option"),olen=opts.length;$target.attr("sb",inst.uid);$.extend(inst.settings,self._defaults,settings);self._state[inst.uid]=FALSE;$target.hide();function closeOthers(){var key,sel,uid=this.attr("id").split("_")[1];for(key in self._state){if(key!==uid){if(self._state.hasOwnProperty(key)){sel=$("select[sb='"+key+"']")[0];if(sel){self._closeSelectbox(sel)}}}}}sbHolder=$("<div>",{id:"sbHolder_"+inst.uid,"class":inst.settings.classHolder,tabindex:$target.attr("tabindex")});sbSelector=$("<a>",{id:"sbSelector_"+inst.uid,href:"#","class":inst.settings.classSelector,click:function(e){e.preventDefault();closeOthers.apply($(this),[]);var uid=$(this).attr("id").split("_")[1];if(self._state[uid]){self._closeSelectbox(target)}else{self._openSelectbox(target)}}});sbToggle=$("<a>",{id:"sbToggle_"+inst.uid,href:"#","class":inst.settings.classToggle,click:function(e){e.preventDefault();closeOthers.apply($(this),[]);var uid=$(this).attr("id").split("_")[1];if(self._state[uid]){self._closeSelectbox(target)}else{self._openSelectbox(target)}}});sbToggle.appendTo(sbHolder);sbOptions=$("<ul>",{id:"sbOptions_"+inst.uid,"class":inst.settings.classOptions,css:{display:"none"}});$target.children().each(function(i){var that=$(this),li,config={};if(that.is("option")){getOptions(that)}else{if(that.is("optgroup")){li=$("<li>");$("<span>",{text:that.attr("label")}).addClass(inst.settings.classGroup).appendTo(li);li.appendTo(sbOptions);if(that.is(":disabled")){config.disabled=true}config.sub=true;getOptions(that.find("option"),config)}}});function getOptions(){var sub=arguments[1]&&arguments[1].sub?true:false,disabled=arguments[1]&&arguments[1].disabled?true:false;arguments[0].each(function(i){var that=$(this),li=$("<li>"),child;if(that.is(":selected")){sbSelector.text(that.text());s=TRUE}if(i===olen-1){li.addClass("last")}if(!that.is(":disabled")&&!disabled){child=$("<a>",{href:"#"+that.val(),rel:that.val()}).text(that.text()).bind("click.sb",function(e){if(e&&e.preventDefault){e.preventDefault()}var t=sbToggle,$this=$(this),uid=t.attr("id").split("_")[1];self._changeSelectbox(target,$this.attr("rel"),$this.text());self._closeSelectbox(target)}).bind("mouseover.sb",function(){var $this=$(this);$this.parent().siblings().find("a").removeClass(inst.settings.classFocus);$this.addClass(inst.settings.classFocus)}).bind("mouseout.sb",function(){$(this).removeClass(inst.settings.classFocus)});if(sub){child.addClass(inst.settings.classSub)}if(that.is(":selected")){child.addClass(inst.settings.classFocus)}child.appendTo(li)}else{child=$("<span>",{text:that.text()}).addClass(inst.settings.classDisabled);if(sub){child.addClass(inst.settings.classSub)}child.appendTo(li)}li.appendTo(sbOptions)})}if(!s){sbSelector.text(opts.first().text())}$.data(target,PROP_NAME,inst);sbHolder.data("uid",inst.uid).bind("keydown.sb",function(e){var key=e.charCode?e.charCode:e.keyCode?e.keyCode:0,$this=$(this),uid=$this.data("uid"),inst=$this.siblings("select[sb='"+uid+"']").data(PROP_NAME),trgt=$this.siblings(["select[sb='",uid,"']"].join("")).get(0),$f=$this.find("ul").find("a."+inst.settings.classFocus);switch(key){case 37:case 38:if($f.length>0){var $next;$("a",$this).removeClass(inst.settings.classFocus);$next=$f.parent().prevAll("li:has(a)").eq(0).find("a");if($next.length>0){$next.addClass(inst.settings.classFocus).focus();$("#sbSelector_"+uid).text($next.text())}}break;case 39:case 40:var $next;$("a",$this).removeClass(inst.settings.classFocus);if($f.length>0){$next=$f.parent().nextAll("li:has(a)").eq(0).find("a")}else{$next=$this.find("ul").find("a").eq(0)}if($next.length>0){$next.addClass(inst.settings.classFocus).focus();$("#sbSelector_"+uid).text($next.text())}break;case 13:if($f.length>0){self._changeSelectbox(trgt,$f.attr("rel"),$f.text())}self._closeSelectbox(trgt);break;case 9:if(trgt){var inst=self._getInst(trgt);if(inst){if($f.length>0){self._changeSelectbox(trgt,$f.attr("rel"),$f.text())}self._closeSelectbox(trgt)}}var i=parseInt($this.attr("tabindex"),10);if(!e.shiftKey){i++}else{i--}$("*[tabindex='"+i+"']").focus();break;case 27:self._closeSelectbox(trgt);break}e.stopPropagation();return false}).delegate("a","mouseover",function(e){$(this).addClass(inst.settings.classFocus)}).delegate("a","mouseout",function(e){$(this).removeClass(inst.settings.classFocus)});sbSelector.appendTo(sbHolder);sbOptions.appendTo(sbHolder);sbHolder.insertAfter($target);$("html").live("mousedown",function(e){e.stopPropagation();$("select").selectbox("close")});$([".",inst.settings.classHolder,", .",inst.settings.classSelector].join("")).mousedown(function(e){e.stopPropagation()})},_detachSelectbox:function(target){var inst=this._getInst(target);if(!inst){return FALSE}$("#sbHolder_"+inst.uid).remove();$.data(target,PROP_NAME,null);$(target).show()},_changeSelectbox:function(target,value,text){var onChange,inst=this._getInst(target);if(inst){onChange=this._get(inst,"onChange");$("#sbSelector_"+inst.uid).text(text)}value=value.replace(/\'/g,"\\'");$(target).find("option[value='"+value+"']").attr("selected",TRUE);if(inst&&onChange){onChange.apply((inst.input?inst.input[0]:null),[value,inst])}else{if(inst&&inst.input){inst.input.trigger("change")}}},_enableSelectbox:function(target){var inst=this._getInst(target);if(!inst||!inst.isDisabled){return FALSE}$("#sbHolder_"+inst.uid).removeClass(inst.settings.classHolderDisabled);inst.isDisabled=FALSE;$.data(target,PROP_NAME,inst)},_disableSelectbox:function(target){var inst=this._getInst(target);if(!inst||inst.isDisabled){return FALSE}$("#sbHolder_"+inst.uid).addClass(inst.settings.classHolderDisabled);inst.isDisabled=TRUE;$.data(target,PROP_NAME,inst)},_optionSelectbox:function(target,name,value){var inst=this._getInst(target);if(!inst){return FALSE}inst[name]=value;$.data(target,PROP_NAME,inst)},_openSelectbox:function(target){var inst=this._getInst(target);if(!inst||inst.isOpen||inst.isDisabled){return }var el=$("#sbOptions_"+inst.uid),viewportHeight=parseInt($(window).height(),10),offset=$("#sbHolder_"+inst.uid).offset(),scrollTop=$(window).scrollTop(),height=el.prev().height(),diff=viewportHeight-(offset.top-scrollTop)-height/2,onOpen=this._get(inst,"onOpen");el.css({top:height+"px",maxHeight:(diff-height)+"px"});inst.settings.effect==="fade"?el.fadeIn(inst.settings.speed):el.slideDown(inst.settings.speed);$("#sbToggle_"+inst.uid).addClass(inst.settings.classToggleOpen);this._state[inst.uid]=TRUE;inst.isOpen=TRUE;if(onOpen){onOpen.apply((inst.input?inst.input[0]:null),[inst])}$.data(target,PROP_NAME,inst)},_closeSelectbox:function(target){var inst=this._getInst(target);if(!inst||!inst.isOpen){return }var onClose=this._get(inst,"onClose");inst.settings.effect==="fade"?$("#sbOptions_"+inst.uid).fadeOut(inst.settings.speed):$("#sbOptions_"+inst.uid).slideUp(inst.settings.speed);$("#sbToggle_"+inst.uid).removeClass(inst.settings.classToggleOpen);this._state[inst.uid]=FALSE;inst.isOpen=FALSE;if(onClose){onClose.apply((inst.input?inst.input[0]:null),[inst])}$.data(target,PROP_NAME,inst)},_newInst:function(target){var id=target[0].id.replace(/([^A-Za-z0-9_-])/g,"\\\\$1");return{id:id,input:target,uid:Math.floor(Math.random()*99999999),isOpen:FALSE,isDisabled:FALSE,settings:{}}},_getInst:function(target){try{return $.data(target,PROP_NAME)}catch(err){throw"Missing instance data for this selectbox"}},_get:function(inst,name){return inst.settings[name]!==undefined?inst.settings[name]:this._defaults[name]}});$.fn.selectbox=function(options){var otherArgs=Array.prototype.slice.call(arguments,1);if(typeof options=="string"&&options=="isDisabled"){return $.selectbox["_"+options+"Selectbox"].apply($.selectbox,[this[0]].concat(otherArgs))}if(options=="option"&&arguments.length==2&&typeof arguments[1]=="string"){return $.selectbox["_"+options+"Selectbox"].apply($.selectbox,[this[0]].concat(otherArgs))}return this.each(function(){typeof options=="string"?$.selectbox["_"+options+"Selectbox"].apply($.selectbox,[this].concat(otherArgs)):$.selectbox._attachSelectbox(this,options)})};$.selectbox=new Selectbox();$.selectbox.version="0.2"})(jQuery);;
/*
 jQuery UI Spinner 1.20

 Copyright (c) 2009-2010 Brant Burnett
 Dual licensed under the MIT or GPL Version 2 licenses.
*/
(function(j){var s="ui-state-active",l=j.ui.keyCode,C=l.UP,D=l.DOWN,t=l.RIGHT,E=l.LEFT,u=l.PAGE_UP,v=l.PAGE_DOWN,J=l.HOME,K=l.END,L=j.browser.msie,M=j.browser.mozilla?"DOMMouseScroll":"mousewheel",N=[C,D,t,E,u,v,J,K,l.BACKSPACE,l.DELETE,l.TAB],O;j.widget("ui.spinner",{options:{min:null,max:null,allowNull:false,group:"",point:".",prefix:"",suffix:"",places:null,defaultStep:1,largeStep:10,mouseWheel:true,increment:"slow",className:null,showOn:"always",width:16,upIconClass:"ui-icon-triangle-1-n",downIconClass:"ui-icon-triangle-1-s",
format:function(a,b){var d=/(\d+)(\d{3})/,g=(isNaN(a)?0:Math.abs(a)).toFixed(b)+"";for(g=g.replace(".",this.point);d.test(g)&&this.group;g=g.replace(d,"$1"+this.group+"$2"));return(a<0?"-":"")+this.prefix+g+this.suffix},parse:function(a){if(this.group==".")a=a.replace(".","");if(this.point!=".")a=a.replace(this.point,".");return parseFloat(a.replace(/[^0-9\-\.]/g,""))}},_create:function(){var a=this.element,b=a.attr("type");if(!a.is("input")||b!="text"&&b!="number")console.error("Invalid target for ui.spinner");
else{this._procOptions(true);this._createButtons(a);a.is(":enabled")||this.disable()}},_createButtons:function(a){function b(e){return e=="auto"?0:parseInt(e)}function d(e){for(var h=0;h<N.length;h++)if(N[h]==e)return true;return false}function g(e,h){if(F)return false;var m=String.fromCharCode(h||e),o=c.options;if(m>="0"&&m<="9"||m=="-")return false;if(c.places>0&&m==o.point||m==o.group)return false;return true}function i(e){function h(){w=0;e()}if(w){if(e===P)return;clearTimeout(w)}P=e;w=setTimeout(h,
100)}function p(){if(!f.disabled){var e=c.element[0],h=this===x?1:-1;e.focus();e.select();j(this).addClass(s);G=true;c._startSpin(h)}return false}function q(){if(G){j(this).removeClass(s);c._stopSpin();G=false}return false}var c=this,f=c.options,r=f.className,y=f.width,n=f.showOn,H=j.support.boxModel,Q=a.outerHeight(),R=c.oMargin=b(a.css("margin-right")),I=c.wrapper=a.css({width:(c.oWidth=H?a.width():a.outerWidth())-y,marginRight:R+y,textAlign:"right"}).after('<span class="ui-spinner ui-widget"></span>').next(),
z=c.btnContainer=j('<div class="ui-spinner-buttons"><div class="ui-spinner-up ui-spinner-button ui-state-default ui-corner-tr"><span class="ui-icon '+f.upIconClass+'">&nbsp;</span></div><div class="ui-spinner-down ui-spinner-button ui-state-default ui-corner-br"><span class="ui-icon '+f.downIconClass+'">&nbsp;</span></div></div>'),x,S,k,w,P,A,B,F,G,T=a[0].dir=="rtl";r&&I.addClass(r);I.append(z.css({height:Q,left:-y-R,top:a.offset().top-I.offset().top+"px"}));k=c.buttons=z.find(".ui-spinner-button");
k.css({width:y-(H?k.outerWidth()-k.width():0),height:Q/2-(H?k.outerHeight()-k.height():0)});x=k[0];S=k[1];r=k.find(".ui-icon");r.css({marginLeft:(k.innerWidth()-r.width())/2,marginTop:(k.innerHeight()-r.height())/2});z.width(k.outerWidth());n!="always"&&z.css("opacity",0);if(n=="hover"||n=="both")k.add(a).bind("mouseenter.uispinner",function(){i(function(){A=true;if(!c.focused||n=="hover")c.showButtons()})}).bind("mouseleave.uispinner",function(){i(function(){A=false;if(!c.focused||n=="hover")c.hideButtons()})});
k.hover(function(){c.buttons.removeClass("ui-state-hover");f.disabled||j(this).addClass("ui-state-hover")},function(){j(this).removeClass("ui-state-hover")}).mousedown(p).mouseup(q).mouseout(q);L&&k.dblclick(function(){if(!f.disabled){c._change();c._doSpin((this===x?1:-1)*f.step)}return false}).bind("selectstart",function(){return false});a.bind("keydown.uispinner",function(e){var h,m,o=e.keyCode;if(e.ctrl||e.alt)return true;if(d(o))F=true;if(B)return false;switch(o){case C:case u:h=1;m=o==u;break;
case D:case v:h=-1;m=o==v;break;case t:case E:h=o==t^T?1:-1;break;case J:e=c.options.min;e!=null&&c._setValue(e);return false;case K:e=c.options.max;e!=null&&c._setValue(e);return false}if(h){if(!B&&!f.disabled){keyDir=h;j(h>0?x:S).addClass(s);B=true;c._startSpin(h,m)}return false}}).bind("keyup.uispinner",function(e){if(e.ctrl||e.alt)return true;if(d(l))F=false;switch(e.keyCode){case C:case t:case u:case D:case E:case v:k.removeClass(s);c._stopSpin();return B=false}}).bind("keypress.uispinner",function(e){if(g(e.keyCode,
e.charCode))return false}).bind("change.uispinner",function(){c._change()}).bind("focus.uispinner",function(){function e(){c.element.select()}L?e():setTimeout(e,0);c.focused=true;O=c;if(!A&&(n=="focus"||n=="both"))c.showButtons()}).bind("blur.uispinner",function(){c.focused=false;if(!A&&(n=="focus"||n=="both"))c.hideButtons()})},_procOptions:function(a){var b=this.element,d=this.options,g=d.min,i=d.max,p=d.step,q=d.places,c=-1,f;if(d.increment=="slow")d.increment=[{count:1,mult:1,delay:250},{count:3,
mult:1,delay:100},{count:0,mult:1,delay:50}];else if(d.increment=="fast")d.increment=[{count:1,mult:1,delay:250},{count:19,mult:1,delay:100},{count:80,mult:1,delay:20},{count:100,mult:10,delay:20},{count:0,mult:100,delay:20}];if(g==null&&(f=b.attr("min"))!=null)g=parseFloat(f);if(i==null&&(f=b.attr("max"))!=null)i=parseFloat(f);if(!p&&(f=b.attr("step"))!=null)if(f!="any"){p=parseFloat(f);d.largeStep*=p}d.step=p=p||d.defaultStep;if(q==null&&(f=p+"").indexOf(".")!=-1)q=f.length-f.indexOf(".")-1;this.places=
q;if(i!=null&&g!=null){if(g>i)g=i;c=Math.max(Math.max(c,d.format(i,q,b).length),d.format(g,q,b).length)}if(a)this.inputMaxLength=b[0].maxLength;f=this.inputMaxLength;if(f>0){c=c>0?Math.min(f,c):f;f=Math.pow(10,c)-1;if(i==null||i>f)i=f;f=-(f+1)/10+1;if(g==null||g<f)g=f}c>0&&b.attr("maxlength",c);d.min=g;d.max=i;this._change();b.unbind(M+".uispinner");d.mouseWheel&&b.bind(M+".uispinner",this._mouseWheel)},_mouseWheel:function(a){var b=j.data(this,"spinner");if(!b.options.disabled&&b.focused&&O===b){b._change();
b._doSpin(((a.wheelDelta||-a.detail)>0?1:-1)*b.options.step);return false}},_setTimer:function(a,b,d){function g(){i._spin(b,d)}var i=this;i._stopSpin();i.timer=setInterval(g,a)},_stopSpin:function(){if(this.timer){clearInterval(this.timer);this.timer=0}},_startSpin:function(a,b){var d=this.options.increment;this._change();this._doSpin(a*(b?this.options.largeStep:this.options.step));if(d&&d.length>0){this.incCounter=this.counter=0;this._setTimer(d[0].delay,a,b)}},_spin:function(a,b){var d=this.options.increment,
g=d[this.incCounter];this._doSpin(a*g.mult*(b?this.options.largeStep:this.options.step));this.counter++;if(this.counter>g.count&&this.incCounter<d.length-1){this.counter=0;g=d[++this.incCounter];this._setTimer(g.delay,a,b)}},_doSpin:function(a){var b=this.curvalue;if(b==null)b=(a>0?this.options.min:this.options.max)||0;this._setValue(b+a)},_parseValue:function(){var a=this.element.val();return a?this.options.parse(a,this.element):null},_validate:function(a){var b=this.options,d=b.min,g=b.max;if(a==
null&&!b.allowNull)a=this.curvalue!=null?this.curvalue:d||g||0;return g!=null&&a>g?g:d!=null&&a<d?d:a},_change:function(){var a=this._parseValue();if(!this.selfChange){if(isNaN(a))a=this.curvalue;this._setValue(a,true)}},_setOption:function(a,b){j.Widget.prototype._setOption.call(this,a,b);this._procOptions()},increment:function(){this._doSpin(this.options.step)},decrement:function(){this._doSpin(-this.options.step)},showButtons:function(a){var b=this.btnContainer.stop();a?b.css("opacity",1):b.fadeTo("fast",
1)},hideButtons:function(a){var b=this.btnContainer.stop();a?b.css("opacity",0):b.fadeTo("fast",0);this.buttons.removeClass("ui-state-hover")},_setValue:function(a,b){this.curvalue=a=this._validate(a);this.element.val(a!=null?this.options.format(a,this.places,this.element):"");if(!b){this.selfChange=true;this.element.change();this.selfChange=false}},value:function(a){if(arguments.length){this._setValue(a);return this.element}return this.curvalue},enable:function(){this.buttons.removeClass("ui-state-disabled");
this.element[0].disabled=false;j.Widget.prototype.enable.call(this)},disable:function(){this.buttons.addClass("ui-state-disabled").removeClass("ui-state-hover");this.element[0].disabled=true;j.Widget.prototype.disable.call(this)},destroy:function(){this.wrapper.remove();this.element.unbind(".uispinner").css({width:this.oWidth,marginRight:this.oMargin});j.Widget.prototype.destroy.call(this)}})})(jQuery);;
/*
  Formalize - version 1.2

  Note: This file depends on the jQuery library.
*/

// Module pattern:
// http://yuiblog.com/blog/2007/06/12/module-pattern
var FORMALIZE = (function($, window, document, undefined) {
  // Internet Explorer detection.
  function IE(version) {
    var b = document.createElement('b');
    b.innerHTML = '<!--[if IE ' + version + ']><br><![endif]-->';
    return !!b.getElementsByTagName('br').length;
  }

  // Private constants.
  var PLACEHOLDER_SUPPORTED = 'placeholder' in document.createElement('input');
  var AUTOFOCUS_SUPPORTED = 'autofocus' in document.createElement('input');
  var IE6 = IE(6);
  var IE7 = IE(7);

  // Expose innards of FORMALIZE.
  return {
    // FORMALIZE.go
    go: function() {
      var i, j = this.init;

      for (i in j) {
        j.hasOwnProperty(i) && j[i]();
      }
    },
    // FORMALIZE.init
    init: {
      // FORMALIZE.init.full_input_size
      full_input_size: function() {
        if (!IE7 || !$('textarea, input.input_full').length) {
          return;
        }

        // This fixes width: 100% on <textarea> and class="input_full".
        // It ensures that form elements don't go wider than container.
        $('textarea, input.input_full').wrap('<span class="input_full_wrap"></span>');
      },
      // FORMALIZE.init.ie6_skin_inputs
      ie6_skin_inputs: function() {
        // Test for Internet Explorer 6.
        if (!IE6 || !$('input, select, textarea').length) {
          // Exit if the browser is not IE6,
          // or if no form elements exist.
          return;
        }

        // For <input type="submit" />, etc.
        var button_regex = /button|submit|reset/;

        // For <input type="text" />, etc.
        var type_regex = /date|datetime|datetime-local|email|month|number|password|range|search|tel|text|time|url|week/;

        $('input').each(function() {
          var el = $(this);

          // Is it a button?
          if (this.getAttribute('type').match(button_regex)) {
            el.addClass('ie6_button');

            /* Is it disabled? */
            if (this.disabled) {
              el.addClass('ie6_button_disabled');
            }
          }
          // Or is it a textual input?
          else if (this.getAttribute('type').match(type_regex)) {
            el.addClass('ie6_input');

            /* Is it disabled? */
            if (this.disabled) {
              el.addClass('ie6_input_disabled');
            }
          }
        });

        $('textarea, select').each(function() {
          /* Is it disabled? */
          if (this.disabled) {
            $(this).addClass('ie6_input_disabled');
          }
        });
      },
      // FORMALIZE.init.autofocus
      autofocus: function() {
        if (AUTOFOCUS_SUPPORTED || !$(':input[autofocus]').length) {
          return;
        }

        $(':input[autofocus]:visible:first').focus();
      },
      // FORMALIZE.init.placeholder
      placeholder: function() {
        if (PLACEHOLDER_SUPPORTED || !$(':input[placeholder]').length) {
          // Exit if placeholder is supported natively,
          // or if page does not have any placeholder.
          return;
        }

        FORMALIZE.misc.add_placeholder();

        $(':input[placeholder]').each(function() {
          // Placeholder obscured in older browsers,
          // so there's no point adding to password.
          if (this.type === 'password') {
            return;
          }

          var el = $(this);
          var text = el.attr('placeholder');

          el.focus(function() {
            if (el.val() === text) {
              el.val('').removeClass('placeholder_text');
            }
          }).blur(function() {
            FORMALIZE.misc.add_placeholder();
          });

          // Prevent <form> from accidentally
          // submitting the placeholder text.
          el.closest('form').submit(function() {
            if (el.val() === text) {
              el.val('').removeClass('placeholder_text');
            }
          }).bind('reset', function() {
            setTimeout(FORMALIZE.misc.add_placeholder, 50);
          });
        });
      }
    },
    // FORMALIZE.misc
    misc: {
      // FORMALIZE.misc.add_placeholder
      add_placeholder: function() {
        if (PLACEHOLDER_SUPPORTED || !$(':input[placeholder]').length) {
          // Exit if placeholder is supported natively,
          // or if page does not have any placeholder.
          return;
        }

        $(':input[placeholder]').each(function() {
          // Placeholder obscured in older browsers,
          // so there's no point adding to password.
          if (this.type === 'password') {
            return;
          }

          var el = $(this);
          var text = el.attr('placeholder');

          if (!el.val() || el.val() === text) {
            el.val(text).addClass('placeholder_text');
          }
        });
      }
    }
  };
// Alias jQuery, window, document.
})(jQuery, this, this.document);

// Automatically calls all functions in FORMALIZE.init
jQuery(document).ready(function() {
  FORMALIZE.go();
});;
