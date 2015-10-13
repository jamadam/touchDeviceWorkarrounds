/**
 * jquery.touchDeviceWorkarrounds
 *
 * SYNOPSIS
 *
 *  if ($.touchDeviceWorkarrounds.isTouchDevice() &&
 *                                  $.touchDeviceWorkarrounds.isTargetUA()) {
 *     var tdw = $(".modal").touchDeviceWorkarrounds();
 *     $(".modalOpener").on('click', function(){
 *         ...open modal
 *         tdw.emulatePositionFixedModalWithAbsolute(true);
 *         tdw.preventOverscrollBehindModal(true);
 *     });
 *     $(".modalCloser").on('click', function(){
 *         tdw.preventOverscrollBehindModal(false);
 *         tdw.emulatePositionFixedModalWithAbsolute(false);
 *         ...close modal
 *     });
 * }
 *
 * Copyright (c) jamadam
 * 
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */
;(function($) {
    'use strict';
    
    /**
     * Name of plugin
     */
    var plugname = 'touchDeviceWorkarrounds';
    
    /**
     * constructor
     */
    var Class = function(elem, params){
        this.elem = elem;
        this.elem.data(plugname, [this,{}]);
        this.params = params;
    };
    
    /**
     * Mobile Safari needs to use position:absolute instead of position:fixed.
     * 
     * @param {boolean} true for enable and false for disable
     * @See https://gitlab.skyarc.org/rarea/rarea/issues/1
     * @See https://www.drupal.org/node/878020
     */
    Class.prototype.emulatePositionFixedModalWithAbsolute = function(enable) {
        var modal = this.elem;
        var cont = modal.parent().get(0);
        if (enable) {
            if (modal.css("position") !== "fixed") {
                return;
            }
            var pdata = {
                originalPosX: $(window).scrollLeft(),
                originalPosY: $(window).scrollTop(),
                originalWidth: cont.style.width,
                originalHeight: cont.style.height,
                originalOverflow: cont.style.overflow,
            };
            modal.data(plugname)[1] = pdata;
            cont.style.width = '1px';
            cont.style.height = '1px';
            cont.style.overflow = 'hidden';
            window.scrollTo(0, 0);
            var gWRO = getWindowRelativeOffset(window, cont);
            cont.style.height = (window.innerHeight - gWRO.top) + 'px';
            cont.style.width = (window.innerWidth - gWRO.left) + 'px';
            cont.scrollTop = pdata.originalPosY;
            cont.scrollLeft = pdata.originalPosX;
        } else {
            var pdata = modal.data(plugname)[1];
            cont.style.width = pdata.originalWidth;
            cont.style.height = pdata.originalHeight;
            cont.style.overflow = pdata.originalOverflow;
            window.scrollTo(pdata.originalPosX, pdata.originalPosY);
            modal.data(plugname)[1] = {};
        }
        
        return modal;
    };
    
    /**
     * Workarround for body scrollable bug on most touch devices
     *
     * @param {boolean} true for enable and false for disable
     * @see http://stackoverflow.com/questions/10238084/ios-safari-how-to-disable-overscroll-but-allow-scrollable-divs-to-scroll-norma
     */
    Class.prototype.preventOverscrollBehindModal = function(enable) {
        var ns = plugname + 'preventOverscrollBehindModal';
        var body = $("body");
        var modal = this.elem;
        
        if (enable) {
            var raw = modal.get(0);
            // makes touchmove never starts at top or bottom
            body.on('touchstart.' + ns, function (e) {
                if (modal.has($(e.target)).length) {
                    if (raw.scrollTop === 0) {
                        raw.scrollTop = 1;
                    } else if (raw.scrollHeight === raw.scrollTop + raw.offsetHeight) {
                        raw.scrollTop -= 1;
                    }
                }
            });
            // Prevent default unless original target is drawer
            body.on('touchmove.' + ns, function (e) {
                if (!modal.has($(e.target)).length) {
                    e.preventDefault();
                }
            });
        } else {
            body.off('touchmove.' + ns);
            body.off('touchstart.' + ns);
        }
        
        return modal;
    };
    
    /**
     * Calcurate actual element position in display
     * 
     * @see http://stackoverflow.com/questions/3714628/jquery-get-the-location-of-an-element-relative-to-window
     */
    function getWindowRelativeOffset(win, elem) {
        var offset = {
            left: elem.getBoundingClientRect().left,
            top: elem.getBoundingClientRect().top
        };
        var win1 = elem.ownerDocument.defaultView || elem.ownerDocument.window;
        while (win1 != win) {
            offset.left = offset.left + win1.frameElement.getBoundingClientRect().left;
            offset.top = offset.top + win1.frameElement.getBoundingClientRect().top;
            win1 = win1.parent;
        }
        return offset;
    };
    
    /**
     * Default params
     */
    var default_params = {

    };

    /**
     * Get instance
     */
    $.fn[plugname] = function(params){
        return new Class(this, $.extend(default_params, params, {}));
    };
    
    /**
     * Class methods
     */
    $[plugname] = {
        
        /**
         * Detect touch device
         */
        isTouchDevice: function() {
          return 'ontouchstart' in window // works on most browsers 
              || 'onmsgesturechange' in window; // works on ie10
        },
        
        /**
         * Target devices for the workarrounds
         */
        isTargetUA: function(ua){
            ua = ua || navigator.userAgent;
            if (ua.match(/AppleWebKit/)) {
                var appleWebkitVersion = parseInt(ua.match(/AppleWebKit\/(\d+)/)[1]);
                if (appleWebkitVersion >= 600 && appleWebkitVersion <= 601) {
                    return true;
                }
            }
            return false;
        }
    };
})(jQuery);
