/**
 * jquery.touchDeviceWorkarrounds
 *
 * SYNOPSIS
 *
 * if ($.touchDeviceWorkarrounds.isTargetDevice()) {
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
        var cont = modal.parents(1);
        if (enable) {
            if (modal.css("position") !== "fixed") {
                return;
            }
            var pdata = {
                originalPosX: $(window).scrollLeft(),
                originalPosY: $(window).scrollTop(),
                originalStyle: cont.attr('style') || ""
            };
            modal.data(plugname)[1] = pdata;
            cont.css({height:window.innerHeight + 'px', overflow:'hidden'});
            window.scrollTo(0, 0);
            cont.get(0).scrollTop = pdata.originalPosY;
            cont.get(0).scrollLeft = pdata.originalPosX;
        } else {
            var pdata = modal.data(plugname)[1];
            cont.attr('style', pdata.originalStyle);
            window.scrollTo(pdata.originalPosX, pdata.originalPosY);
            modal.data(plugname)[1] = {};
        }
        $(window).trigger('scroll');
        
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
        isTargetDevice: function(){
            return navigator.platform == 'iPad' || navigator.platform == 'iPhone' ||
                navigator.platform == 'iPod' || !!navigator.userAgent.match('Mobile Safari');
        }
    };
})(jQuery);
