(function(){

	'use strict';

	// TODO: Yellow tooltip CSS has funky line height on IE 11

	window[window.globalNamespaceName] = window[window.globalNamespaceName] || {};
	var ns = window[window.globalNamespaceName];

	// Object > Tooltip

	ns.Tooltip = function (element, text, options) {
		//console.log( element );
		ns.Tooltip.parent.constructor.apply(this);
		this.el = element;
		this.text = text;
		this.options = (options) ? options : {};
		this.el.addEventListener('mouseenter', this, false);
		this.el.addEventListener('mouseleave', this, false);
		this.el.addEventListener('mousedown', this, false);
	};

	ns.Tooltip.DELAY = 500;
	ns.Tooltip.HIDE_DELAY = 220;
	ns.Tooltip.STYLE = 'tooltip';

	ns.Tooltip.CURSOR_OFFSET_X = 5;
	ns.Tooltip.CURSOR_OFFSET_Y = 15;

	ns.Tooltip.startHideTimer = function () {
		ns.Tooltip.cancelHideTimer();
		ns.Tooltip.hideTimerID = window.setTimeout( function(){
			ns.Tooltip.hide();
		}, ns.Tooltip.HIDE_DELAY);
	};

	ns.Tooltip.cancelHideTimer = function () {
		if (ns.Tooltip.hideTimerID !== null){
			window.clearTimeout(ns.Tooltip.hideTimerID);
		}
		ns.Tooltip.hideTimerID = null;
	};

	ns.Tooltip.startDurationTimer = function (duration) {
		ns.Tooltip.cancelDurationTimer();
		ns.Tooltip.durationTimerID = window.setTimeout( function(){
			ns.Tooltip.hide();
		}, duration);
	};

	ns.Tooltip.cancelDurationTimer = function () {
		if (ns.Tooltip.durationTimerID !== null){
			window.clearTimeout(ns.Tooltip.durationTimerID);
		}
		ns.Tooltip.durationTimerID = null;
	};

	ns.Tooltip.hide = function () {
		if (ns.Tooltip.el){
			if (ns.Tooltip.el.parentNode){
				ns.Tooltip.el.parentNode.removeChild(ns.Tooltip.el);
			}
		}
		ns.Tooltip.activeInstance = null;
	};

	ns.Tooltip.hideForContainedElement = function (container) {
		if (ns.Tooltip.activeInstance){
			if (container.contains(ns.Tooltip.activeInstance.el)){
				ns.Tooltip.hide();
			}
		}
	};

	ns.extend(ns.Tooltip, ns.Object);

	ns.Tooltip.prototype.deactivate = function () {
		this.el.removeEventListener('mouseenter', this, false);
		this.el.removeEventListener('mouseleave', this, false);
		this.el.removeEventListener('mousedown', this, false);
		this.el.removeEventListener('mousemove', this, false);
		this.cancelTimer();
		this.deactivated = true;
		if (ns.Tooltip.activeInstance === this){
			ns.Tooltip.hide();
		}
	};

	ns.Tooltip.prototype.handleEvent = function (e) {
		if (!this.disabled){
			switch(e.type) {

				case 'mouseenter':
				this.onEnter(e);
				break;

				case 'mouseleave':
				this.cancelTimer();
				this.el.removeEventListener('mousemove', this, false);
				if (this.options.fade){
					if (ns.Tooltip.el){
						ns.Tooltip.el.style.opacity = 0;
						ns.Tooltip.startHideTimer();
					}
				} else {
					ns.Tooltip.hide();
				}
				break;

				case 'mousemove':
				this.startTimer(e);
				break;

				case 'mousedown':
				// console.log( 'tooltip mousedown' );
				this.cancelTimer();
				this.el.removeEventListener('mousemove', this, false);
				ns.Tooltip.hide();
				break;
			}
		}
	};

	ns.Tooltip.prototype.onEnter = function (e) {
		this.startTimer(e);
		this.el.addEventListener('mousemove', this, false);
	};

	ns.Tooltip.prototype.show = function (e) {
		var okToShow = true;
		if (this.disabled){
			okToShow = false;
		} else if (this.options.desktopFocus){
			okToShow = (ns.Windows.getActive() === null);
		}
		if (okToShow){
			if (!ns.Tooltip.el){
				ns.Tooltip.el = document.createElement('div');
				ns.Tooltip.el.classList.add(ns.Tooltip.STYLE);
			} else {
				var style, i, removeClasses = [];
				for (i=0; i<ns.Tooltip.el.classList.length; i++) {
					style = ns.Tooltip.el.classList.item(i);
					if (style !== ns.Tooltip.STYLE){
						removeClasses.push(style);
					}
				}
				for (i=0; i<removeClasses.length; i++) {
					ns.Tooltip.el.classList.remove(removeClasses[i]);
				}
			}

			ns.Tooltip.cancelHideTimer();
			ns.Tooltip.cancelDurationTimer();

			if (this.options.style){
				ns.Tooltip.el.classList.add(this.options.style);
			} 

			if (this.options.fade){
				ns.Tooltip.el.style.opacity = 0;
				ns.Tooltip.el.style.transition = 'opacity .2s';
				this.callMethodNameAfterDelay('setOpacity', 1, 1);
			} else {
				ns.Tooltip.el.style.opacity = '';
			}

			ns.Tooltip.el.innerHTML = this.text;

			ns.Views.appContainer.appendChild(ns.Tooltip.el);
			var minX = 0;
			var maxX = Number.MAX_VALUE;
			var minY = 0;
			var maxY = Number.MAX_VALUE;

			var desktopRect = ns.Desktop.getRect(true); // bool excludes taskbar 
			if (desktopRect){
				var rect = ns.Tooltip.el.getBoundingClientRect();
				maxX = desktopRect.width - rect.width;
				maxY = desktopRect.height - rect.height;
			}

			var left, top, appRect = ns.Views.appContainer.getBoundingClientRect();

			if (this.options.hasOwnProperty('relativeX')){
				left = this.el.getBoundingClientRect().left + this.options.relativeX;
			} else {
				var cursorOffsetX = this.options.hasOwnProperty('cursorOffsetX') ? this.options.cursorOffsetX : ns.Tooltip.CURSOR_OFFSET_X ;
				left = e.clientX + cursorOffsetX - appRect.left;
			}
			ns.Tooltip.el.style.left = Math.max(minX, Math.min(maxX, left)) + 'px';

			if (this.options.hasOwnProperty('relativeY')){
				top = this.el.getBoundingClientRect().top + this.options.relativeY;
			} else {
				var cursorOffsetY = this.options.hasOwnProperty('cursorOffsetY') ? this.options.cursorOffsetY : ns.Tooltip.CURSOR_OFFSET_Y ;
				top = e.clientY + cursorOffsetY - appRect.top;
			}
			ns.Tooltip.el.style.top = Math.max(minY, Math.min(maxY, top)) + 'px';

			if (this.options.hasOwnProperty('duration')){
				ns.Tooltip.startDurationTimer(this.options.duration);
			}

			this.el.removeEventListener('mousemove', this, false);

			ns.Tooltip.activeInstance = this;
		}
	};

	ns.Tooltip.prototype.setOpacity = function () {
		if (!this.deactivated){
			ns.Tooltip.el.style.opacity = 1;
		}
	};

	ns.Tooltip.prototype.startTimer = function (e) {
		this.cancelTimer();
		var tip = this;
		ns.Tooltip.mouseTimerID = window.setTimeout( function(){
			tip.show(e);
		}, ns.Tooltip.DELAY);
	};

	ns.Tooltip.prototype.cancelTimer = function () {
		if (ns.Tooltip.mouseTimerID !== null){
			window.clearTimeout(ns.Tooltip.mouseTimerID);
		}
		ns.Tooltip.mouseTimerID = null;
	};

	ns.Tooltip.prototype.disable = function () {
		this.disabled = true;
		this.cancelTimer();
	};

	ns.Tooltip.prototype.enable = function () {
		this.disabled = false;
	};

})();