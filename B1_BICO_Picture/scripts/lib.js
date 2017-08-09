window.globalNamespaceName = 'bloomberg';

(function(){

	'use strict';

	window[window.globalNamespaceName] = window[window.globalNamespaceName] || {};
	var ns = window[window.globalNamespaceName];

	ns.extend = function (Child, Parent) {
		function Ctor(){}
		Ctor.prototype = Parent.prototype;
		Child.prototype = new Ctor();
		Child.prototype.constructor = Child;
		Child.parent = Parent.prototype;
	};

	ns.suppressDefault = function (e){
		if (e.preventDefault) e.preventDefault();
		if (e.stopPropagation) e.stopPropagation();
		return false;
	};

	ns.sign = function(n) {
		return n ? n < 0 ? -1 : 1 : 0 ;
	};

	ns.subtractArray = function (arrA, arrB) {
		var el, i, len = arrB.length;
		for (i=0; i<len; i++){
			el = arrB[i];
			while (arrA.indexOf(el) > -1){
				arrA.splice( arrA.indexOf(el), 1 );
			}
		}
	};

	ns.addWheelListener = function (elem, callback, useCapture) {
		_addWheelListener( elem, support, callback, useCapture );
 		if( support == "DOMMouseScroll" ) { // Handle MozMousePixelScroll in older Firefox
 			_addWheelListener( elem, "MozMousePixelScroll", callback, useCapture );
 		}
 	};

	ns.Object = function(){};

	ns.Object.prototype.callMethodNameAfterDelay = function (a, c) {
		var b = this;
		var d = Array.prototype.slice.call(arguments, 2);
		var e = function () {
			b[a].apply(b, d);
		};
		return setTimeout(e, c);
	};

	if (!ns.Mouse){
		ns.Mouse = new ns.Object();
		ns.Mouse.x = null;
		ns.Mouse.y = null;
		ns.Mouse.down = null;
		ns.Mouse.outside = null;
		document.addEventListener('mousedown', ns.Mouse, true);
		document.addEventListener('mousemove', ns.Mouse, true);
		document.addEventListener('mouseleave', ns.Mouse, false);
		window.addEventListener('mouseup', ns.Mouse, true); // Using 'window' catches mouseups outside of the document if you dragged from inside the window

		ns.Mouse.handleEvent = function (e) {
			switch(e.type) {

				case 'mouseleave':
				this.outside = true; // This event will not fire while the mouse is down
				break;

				case 'mousedown':
				this.down = true;
				break;

				case 'mousemove':
				if (this.x !== e.clientX || this.y !== e.clientY){
					this.x = e.clientX;
					this.y = e.clientY;
					this.checkOutside(e);
				}
				break;

				case 'mouseup':
				this.down = false;
				this.checkOutside(e);
				break;
			}
		};

		ns.Mouse.checkOutside = function (e) {
			var rect = new ns.Rect( 0, 0, window.innerWidth, window.innerHeight );
			this.outside = !rect.containsXY( this.x, this.y );
		};
	}

	ns.Keycodes = {
		BACKSPACE: 8,
		TAB: 9,
		ENTER: 13,
		SHIFT: 16,
		CTRL: 17,
		ALT: 18,
		PAUSE: 19,
		ESC: 27,
		SPACEBAR: 32,
		LEFT: 37,
		UP: 38,
		RIGHT: 39,
		DOWN: 40,
		DELETE: 46,
		OPTION: 91
	};

	ns.Combination = {
		// Based on: http://www.geeksforgeeks.org/print-all-possible-combinations-of-r-elements-in-a-given-array-of-size-n/
		generate: function(arr, r){
			var combos = [];
			ns.Combination._gen(arr, new Array(r), 0, arr.length-1, 0, r, combos);
			return combos;
		}, 
		_gen: function(arr, data, start, end, index, r, combos){
			if (index === r){
	        	combos.push( data.slice() );
	        } else {
	        	for (var i=start; i<=end && end-i+1 >= r-index; i++){
	        		data[index] = arr[i];
	        		ns.Combination._gen(arr, data, i+1, end, index+1, r, combos);
	        	}
	        }
		}
	};

	ns.StringUtils = {
		getLongDate: function (){
			var d = new Date();
			var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
			var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
			return days[d.getDay()]  +', '+ months[d.getMonth()] +' '+ d.getDate() +', '+ d.getFullYear();
		},

		formatDate: function (d) {
			return (d.getMonth()  + 1) + '/' + d.getDate() + '/' + d.getFullYear();
		},

		formatTime: function (d) {
			var hrs = d.getHours();
			var amPm = (hrs < 12) ? 'AM' : 'PM' ;
			hrs = hrs % 12;
			if (hrs === 0) hrs = 12;
			var mins =  d.getMinutes() + '';
			if (mins.length === 1){
				mins = '0' + mins;
			}
			return hrs +':'+ mins +' '+ amPm;
		}
	};

	ns.EventManager = {
		disabled: false,
		events: ['mouseenter','mousedown','mousemove','mouseleave','mouseup','click','dblclick', 'keydown', 'keyup'],
		disableAll: function (){
			for (var i=0; i<this.events.length; i++){
				document.addEventListener(this.events[i], ns.suppressDefault, true);
			}
			this.disabled = true;
		},
		enableAll: function (){
			for (var i=0; i<this.events.length; i++){
				document.removeEventListener(this.events[i], ns.suppressDefault, true);
			}
			this.disabled = false;
		}
	};

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	ns.Point = function (a, b) {
		this.x = (a !== null && !isNaN(a)) ? a : 0;
		this.y = (b !== null && !isNaN(b)) ? b : 0;
	};

	ns.Point.prototype.convertToLocalSpace = function (rect) {
		this.x -= rect.left;
		this.y -= rect.top;
	};

	ns.Point.fromEvent = function (e) {
		var a = (e.touches && e.touches.length > 0) ? e.touches[0] : e;
		return new ns.Point(a.pageX, a.pageY);
	};

	ns.Point.prototype.copy = function () {
		return new ns.Point(this.x, this.y);
	};

	ns.Point.prototype.equals = function (a) {
		return (this.x === a.x && this.y === a.y);
	};

	ns.Point.prototype.getDistance = function (pt) {
		return Math.sqrt( Math.pow((this.x-pt.x), 2) + Math.pow((this.y-pt.y), 2) );
	};

	ns.Point.prototype.toString = function () {
		return "Point[" + this.x + "," + this.y + "]";
	};

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	ns.Size = function(b, a) {
		this.width = (b !== null && !isNaN(b)) ? b : 0;
		this.height = (a !== null && !isNaN(a)) ? a : 0;
	};

	ns.Size.prototype.copy = function () {
		return new ns.Size(this.width, this.height);
	};

	ns.Size.prototype.equals = function (a) {
		return (this.width === a.width && this.height === a.height);
	};

	ns.Size.prototype.toString = function () {
		return "Size[" + this.width + "," + this.height + "]";
	};

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	ns.Rect = function (l, t, r, b) {
		this.left = l;
		this.top = t;
		this.right = Math.max(l, r);
		this.bottom = Math.max(t, b);
		this.width = this.right - this.left;
		this.height = this.bottom - this.top;
	};

	ns.Rect.prototype.convertToLocalSpace = function (rect) {
		this.left -= rect.left;
		this.top -= rect.top;
		this.right -= rect.left;
		this.bottom -= rect.top;
	};

	ns.Rect.prototype.setLeft = function (l) {
		this.left = l;
		this.right = Math.max(this.left, this.right);
		this.width = this.right - this.left;
	};

	ns.Rect.prototype.setTop = function (t) {
		this.top = t;
		this.bottom = Math.max(this.top, this.bottom);
		this.height = this.bottom - this.top;
	};

	ns.Rect.prototype.setRight = function (r) {
		this.right = r;
		this.left = Math.min(this.right, this.left);
		this.width = this.right - this.left;
	};

	ns.Rect.prototype.setBottom = function (b) {
		this.bottom = b;
		this.top = Math.min(this.bottom, this.top);
		this.height = this.bottom - this.top;
	};

	ns.Rect.prototype.setWidth = function (w) {
		this.width = Math.max(0, w);
		this.right = this.left + this.width;
	};

	ns.Rect.prototype.setHeight = function (h) {
		this.height = Math.max(0, h);
		this.bottom = this.top + this.height;
	};

	ns.Rect.prototype.copy = function () {
		return new ns.Rect(this.left, this.top, this.right, this.bottom);
	};

	ns.Rect.prototype.equals = function (r) {
		return (this.left === r.left && this.top === r.top && this.right === r.right && this.bottom === r.bottom);
	};

	ns.Rect.prototype.getCenter = function () {
		// TODO: Add option to prevent rounding to integers
		return new ns.Point(this.left + Math.round(this.width/2), this.top + Math.round(this.height/2));
	};

	ns.Rect.prototype.contains = function (pt) {
		if (this.left > pt.x){
			return false;
		} else if (this.right < pt.x){
			return false;
		} else if (this.top > pt.y){
			return false;
		} else if (this.bottom < pt.y){
			return false;
		}
		return true;
	};

	ns.Rect.prototype.containsXY = function (x, y) {
		if (this.left > x){
			return false;
		} else if (this.right < x){
			return false;
		} else if (this.top > y){
			return false;
		} else if (this.bottom < y){
			return false;
		}
		return true;
	};

	ns.Rect.prototype.containsRect = function (r) {
		if (r.left < this.left){
			return false;
		} else if (r.top < this.top){
			return false;
		} else if (r.right > this.right){
			return false;
		} else if (r.bottom > this.bottom){
			return false;
		}
		return true;
	};

	ns.Rect.prototype.intersects = function (r) {
		if (this.left >= r.right){
			return false;
		} else if (this.right <= r.left){
			return false;
		} else if (this.top >= r.bottom){
			return false;
		} else if (this.bottom <= r.top){
			return false;
		}
		return true;
	};

	ns.Rect.prototype.union = function (r) {
		return new ns.Rect(
			Math.min(this.left, r.left),
			Math.min(this.top, r.top),
			Math.max(this.right, r.right),
			Math.max(this.bottom, r.bottom) );
	};

	ns.Rect.prototype.getIntersectionSize = function (r) {
		var w = Math.max(0, Math.min(this.right, r.right) - Math.max(this.left, r.left));
		var h = Math.max(0, Math.min(this.bottom, r.bottom) - Math.max(this.top, r.top));
		return new ns.Size(w, h);
	};

	// Static (class) functions

	ns.Rect.create = function (r) {
		return new ns.Rect(r.left, r.top, r.right, r.bottom);
	};

	ns.Rect.verticalRegionOverlap = function(rectATop, rectAHeight, rectBTop, rectBHeight){
		return (rectBTop < rectATop + rectAHeight && rectBTop + rectBHeight > rectATop );
	};

	ns.Rect.horizontalRegionOverlap = function(rectALeft, rectAWidth, rectBLeft, rectBWidth){
		return (rectBLeft < rectALeft + rectAWidth && rectBLeft + rectBWidth > rectALeft );
	};

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	ns.Views = {
		TOP: 'top',
		BOTTOM: 'bottom',
		LEFT: 'left',
		RIGHT: 'right',
		VERTICAL: 'vertical',
		HORIZONTAL: 'horizontal',
		DEFAULT_MIN_WIDTH: 0,
		DEFAULT_MIN_HEIGHT: 0,
		MIN: 'min',
		MAX: 'max',
		CENTER: 'center',
		SIM_CONTROL_CLASS: 'sim-element',
		SIMULATED_CLASS: 'simulated',

		appContainer: document.body,

		setInlineFontSize: function(element, scale){
			element.style.fontSize = 'calc(1em * ' + (scale * .625) + ')';
		},

		axisOfSide: function(side){
			return (side === this.TOP || side === this.BOTTOM) ? this.HORIZONTAL : this.VERTICAL ;
		},

		oppositeSide: function(side){
			return (side === this.LEFT) ? this.RIGHT : 
				(side === this.RIGHT) ? this.LEFT :
					(side === this.TOP) ? this.BOTTOM : this.TOP;
		},

		updateAppRect: function(){
			this.appRect = this.appContainer.getBoundingClientRect();
		},

		getEnclosingRect: function(views){
			var left = Number.MAX_VALUE;
			var top = Number.MAX_VALUE; 
			var right = 0;
			var bottom = 0;
			var view, i;
			for (i=0; i<views.length; i++){
				view = views[i];
				left = Math.min(view.position.x, left);
				top = Math.min(view.position.y, top);
				right = Math.max(view.position.x + view.size.width, right);
				bottom = Math.max(view.position.y + view.size.height, bottom);
			}
			return new ns.Rect(left, top, right, bottom);
		},

		getElementsEnclosingRect: function(elements){
			var left = Number.MAX_VALUE;
			var top = Number.MAX_VALUE; 
			var right = 0;
			var bottom = 0;
			var elRect, i;
			for (i=0; i<elements.length; i++){
				elRect = elements[i].getBoundingClientRect();
				left = Math.min(elRect.left, left);
				top = Math.min(elRect.top, top);
				right = Math.max(elRect.right, right);
				bottom = Math.max(elRect.bottom, bottom);
			}
			return new ns.Rect(left, top, right, bottom);
		},

		getElementCenter: function (element){
			return ns.Rect.create(element.getBoundingClientRect()).getCenter();
		},

		create: function(type, classNameOrNames, parent){
			classNameOrNames = classNameOrNames === undefined ? [] : classNameOrNames ;
			var arr = (typeof classNameOrNames === 'string') ? [classNameOrNames] : classNameOrNames ;
			var el = document.createElement(type);
			for (var i=0; i<arr.length; i++){
				el.classList.add(arr[i]);
			}
			if (parent){
				parent.appendChild(el);
			}
			return el;
		},

		createImage: function(path, classNameOrNames, loadCallbackTargetView){
			var img = ns.Views.create('img', classNameOrNames);
			if ( loadCallbackTargetView ){
				img.addEventListener('load', function(e){loadCallbackTargetView.onImageLoaded(e);}, false);
			}
			img.setAttribute('src', path);
			return img;
		},

		removeChildNodes: function(node) {
			if (!node){
				return;
			}
			var child, i, len = node.childNodes.length;
			if (len > 0){
				for (i=len-1; i>=0; i--){
					child = node.childNodes[i];
					child.parentNode.removeChild(child);
				}
			}
		},

		getParentNodeByName: function (el, name){
			var i, node = el;
			while (node !== document.body){
				if (node.parentNode){
					if (node.parentNode.nodeName === name){
						return node.parentNode;
					} else if (node.parentNode.nodeType === Node.DOCUMENT_FRAGMENT_NODE){
						break;
					}
					node = node.parentNode;
				} else {
					break;
				}
			}
			return null;
		},

		getParentNodeWithClassName: function (el, classNameOrNames){
			var arr = (typeof classNameOrNames === 'string') ? [classNameOrNames] : classNameOrNames ;
			var len = arr.length;
			var i, node = el;
			while (node !== document.body){
				for (i = 0; i<len; i++){
					if (node.classList.contains( arr[i] )){
						return node;
					}
				}
				if (node.parentNode){
					if (node.parentNode.nodeType === Node.DOCUMENT_FRAGMENT_NODE){
						break;
					}
					node = node.parentNode;
				} else {
					break;
				}
			}
			return null;
		},

		getSimulatedControl: function (el){
			return this.getParentNodeWithClassName(el, this.SIM_CONTROL_CLASS);
		},

		getOppositeSide: function (side){
			return (side === this.LEFT) ? this.RIGHT : 
						(side === this.RIGHT) ? this.LEFT :
							(side === this.TOP) ? this.BOTTOM :
								(side === this.BOTTOM) ? this.TOP : null ;
		}
	};

	ns.Views.SIDES = [ns.Views.LEFT, ns.Views.TOP, ns.Views.RIGHT, ns.Views.BOTTOM];
	ns.Views.AXES = [ns.Views.HORIZONTAL, ns.Views.VERTICAL];

	// Object > View

	ns.View = function (element, options) {
		// For use with absolutely positioned divs
		ns.View.parent.constructor.apply(this, arguments);
		this.el = element;

		this.minSize = new ns.Size(ns.Views.DEFAULT_MIN_WIDTH, ns.Views.DEFAULT_MIN_HEIGHT);

		this.anchorSide = { x: ns.Views.LEFT, y: ns.Views.TOP }; // By default, anchor left and top
		var cs;
		if (window.getComputedStyle) {
			cs = window.getComputedStyle(this.el);
		} else if (this.el.currentStyle){
			cs = this.el.currentStyle;
		}
		if (cs){
			if (cs.left === 'auto' && !isNaN(parseInt(cs.right, 10)) ){
				this.anchorSide.x = ns.Views.RIGHT; // Anchor right based on computed style
			}
			if (cs.top === 'auto' && !isNaN(parseInt(cs.bottom, 10)) ){
				this.anchorSide.y = ns.Views.BOTTOM; // Anchor bottom based on computed style
			}
		}
		if (options){
			if (options.anchorSideX){
				this.anchorSide.x = options.anchorSideX;
			}
			if (options.anchorSideY){
				this.anchorSide.y = options.anchorSideY;
			}
			if (options.minWidth){
				this.minSize.width = options.minWidth;

			}
			if (options.minHeight){
				this.minSize.height = options.minHeight;
			}
		}
		this.size = new ns.Size();
		this.readSize();
		this.position = new ns.Point();
		this.readPosition(); // If the element has not yet been added to the DOM, position and size are all zeros here

		this.tooltips = (this.tooltips) ? this.tooltips : {};
	};

	ns.extend(ns.View, ns.Object);

	ns.View.prototype.onImageLoaded = function(){
		// Intended for override; no default implementation
		// console.log('View.onImageLoaded: ' + arguments[0].target.getAttribute('src'));
	};

	ns.View.prototype.removeTooltip = function (name) {
		var tooltip = this.tooltips[name];
		if (tooltip){
			tooltip.deactivate();
			delete this.tooltips[name];
		}
	};

	ns.View.prototype.deactivateTooltips = function () {
		var p;
		for (p in this.tooltips){
			if (this.tooltips.hasOwnProperty(p)) {
				this.tooltips[p].deactivate();
			}
		}
	};

	ns.View.prototype.getRect = function () {
		return new ns.Rect(
			this.getSide(ns.Views.LEFT),
			this.getSide(ns.Views.TOP),
			this.getSide(ns.Views.RIGHT),
			this.getSide(ns.Views.BOTTOM)
		);
	};

	ns.View.prototype.getSide = function (side) {
		var val;
		switch(side) {

			case ns.Views.LEFT:
			if (this.anchorSide.x === ns.Views.RIGHT){
				val = this.el.parentNode.getBoundingClientRect().width - this.position.x - this.size.width;
			} else {
				val = this.position.x;
			}
			break;

			case ns.Views.TOP:
			if (this.anchorSide.y === ns.Views.BOTTOM){
				val = this.el.parentNode.getBoundingClientRect().height - this.position.y - this.size.height;
			} else {
				val = this.position.y;
			}
			break;

			case ns.Views.RIGHT:
			if (this.anchorSide.x === ns.Views.RIGHT){
				val = this.el.parentNode.getBoundingClientRect().width - this.position.x;
			} else {
				val = this.position.x + this.size.width;
			}
			break;

			case ns.Views.BOTTOM:
			if (this.anchorSide.y === ns.Views.BOTTOM){
				val = this.el.parentNode.getBoundingClientRect().height - this.position.y;
			} else {
				val = this.position.y + this.size.height;
			}
			break;
		}
		return val;
	};

	ns.View.prototype.setSide = function (side, n) {
		switch(side) {

			case ns.Views.LEFT:
			if (this.anchorSide.x === ns.Views.RIGHT){
				this.setWidth(this.el.parentNode.getBoundingClientRect().width - this.position.x - n);
			} else {
				this.setWidth(this.position.x + this.size.width - n);
				this.setX(n);
			}
			break;

			case ns.Views.TOP:
			if (this.anchorSide.y === ns.Views.BOTTOM){
				this.setHeight(this.el.parentNode.getBoundingClientRect().height - this.position.y - n);
			} else {
				this.setHeight(this.position.y + this.size.height - n);
				this.setY(n);
			}
			break;

			case ns.Views.RIGHT:
			if (this.anchorSide.x === ns.Views.RIGHT){
				this.setWidth( this.position.x + this.size.width - n );
				this.setX(n);
			} else {
				this.setWidth(n - this.position.x);
			}
			break;

			case ns.Views.BOTTOM:
			if (this.anchorSide.y === ns.Views.BOTTOM){
				this.setHeight( this.position.y + this.size.height - n );
				this.setY(n);
			} else {
				this.setHeight(n - this.position.y);
			}
			break;
		}
	};

	ns.View.prototype.setPosition = function (x, y) {
		this.setX(x);
		this.setY(y);
	};

	ns.View.prototype.setX = function (x) {
		this.position.x = x;
		this.el.style[this.anchorSide.x] = x + 'px';
	};

	ns.View.prototype.setY = function (y) {
		this.position.y = y;
		this.el.style[this.anchorSide.y] = y + 'px';
	};

	ns.View.prototype.setSize = function (w, h) {
		this.setWidth(Math.max( this.minSize.width, w));
		this.setHeight(Math.max( this.minSize.height, h));
	};

	ns.View.prototype.setWidth = function (w) {
		this.size.width = w;
		this.el.style.width = w + 'px';
	};

	ns.View.prototype.setHeight = function (h) {
		this.size.height = h;
		this.el.style.height = h + 'px';
	};

	ns.View.prototype.removeSizeStyle = function () {
		this.el.style.width = '';
		this.el.style.height = '';
	};

	ns.View.prototype.removePositionStyle = function () {
		this.el.style.left = '';
		this.el.style.top = '';
		this.el.style.right = '';
		this.el.style.bottom = '';
	};

	ns.View.prototype.remove = function () {
		if (this.el.parentNode){
			this.el.parentNode.removeChild(this.el);
		}
	};

	ns.View.prototype.destroy = function () {
		this.remove();
		this.cancelAnimation();
	};

	ns.View.prototype.setTransform = function (str) {
		this.el.style.msTransform = str; // IE
		this.el.style.webkitTransform = str; // Chrome and Safari
		this.el.style.MozTransform = str; // Firefox
		this.el.style.OTransform = str; // Opera
		this.el.style.transform = str;
	};

	ns.View.prototype.readPosition = function () {
		var left = this.el.offsetLeft;
		var top = this.el.offsetTop;
		if (this.anchorSide.x === ns.Views.LEFT){
			this.position.x = left;
		} else if (this.anchorSide.x === ns.Views.RIGHT){
			this.position.x = this.el.parentNode.getBoundingClientRect().width - this.size.width - left;
		}
		if (this.anchorSide.y === ns.Views.TOP){
			this.position.y = top;
		} else if (this.anchorSide.y === ns.Views.BOTTOM){
			this.position.y = this.el.parentNode.getBoundingClientRect().height - this.size.height - top;
		}
	};

	ns.View.prototype.readSize = function () {
		// Called in the constructor and in 'animateRect'
		var w, h;
		if (window.getComputedStyle !== undefined) {
			var cs = window.getComputedStyle(this.el);
			w = (cs.width) ? cs.width : 0;
			h = (cs.height) ? cs.height : 0;
		} else if (this.el.currentStyle){
			w = (this.el.currentStyle.width) ? this.el.currentStyle.width : 0;
			h = (this.el.currentStyle.height) ? this.el.currentStyle.height : 0;
		}
		this.size.width = parseInt(w, 10);
		this.size.height = parseInt(h, 10);
	};

	ns.View.prototype.readParentScale = function () {
		this.parentScaleX = 1;
		this.parentScaleY = 1;
		if (this.el.parentNode && this.el.parentNode !== ns.Views.appContainer ){
			var rect = this.el.getBoundingClientRect();
			var parentRect = this.el.parentNode.getBoundingClientRect();
			this.parentScaleX = parentRect.width / this.el.parentNode.offsetWidth;
			this.parentScaleY = parentRect.height / this.el.parentNode.offsetHeight;
		}
	};

	ns.View.prototype.createButton = function(classes, parent) {
		var btn = ns.Views.create('button', classes, parent);
		btn.addEventListener('click', this, false);
		btn.classList.add(ns.Views.SIM_CONTROL_CLASS);
		return btn;
	};

	ns.View.prototype.animatePosition = function (point, duration, easing, callback){
		this.endX = point.x;
		this.endY = point.y;
		this.duration = duration;
		this.easing = easing;
		this.callback = callback;
		this.startTime = new Date().getTime();
		this.startPosition = this.position.copy();
		this.deltaX = this.endX - this.startPosition.x;
		this.deltaY = this.endY - this.startPosition.y;
		this.animating = true;
		requestAnimationFrame(this.stepThroughPositionAnimation.bind(this));
	};

	ns.View.prototype.stepThroughPositionAnimation = function (){
		var elapsed = new Date().getTime() - this.startTime;
		if (elapsed < this.duration){
			this.setPosition(
				this.easing(elapsed, this.startPosition.x, this.deltaX, this.duration),
				this.easing(elapsed, this.startPosition.y, this.deltaY, this.duration)
			);
			this.callStepFunction();
			requestAnimationFrame(this.stepThroughPositionAnimation.bind(this));
		} else if (this.duration > 0){
			this.setPosition(this.endX, this.endY);
			this.callStepFunction();
			this.animating = false;
			if (this.callback){
				var callback = this.callback;
				this.callback = null;
				callback();
			}
		}
	};

	ns.View.prototype.callStepFunction = function (){
		if (this.animationStepFunction){
			this.animationStepFunction();
		}
	};

	ns.View.prototype.animateRect = function (rect, duration, easing, callback){
		this.endX = rect[this.anchorSide.x];
		this.endY = rect[this.anchorSide.y];
		this.endWidth = rect.width;
		this.endHeight = rect.height;
		this.duration = duration;
		this.easing = easing;
		this.callback = callback;
		this.startTime = new Date().getTime();
		this.readPosition();
		this.readSize();
		this.startPosition = this.position.copy();
		this.startSize = this.size.copy();
		this.deltaX = this.endX - this.startPosition.x;
		this.deltaY = this.endY - this.startPosition.y;
		this.deltaWidth = this.endWidth - this.startSize.width;
		this.deltaHeight = this.endHeight - this.startSize.height;
		this.animating = true;
		requestAnimationFrame(this.stepThroughRectAnimation.bind(this));
	};

	ns.View.prototype.stepThroughRectAnimation = function (){
		var elapsed = new Date().getTime() - this.startTime;
		if (elapsed < this.duration){
			this.setPosition(
				this.easing(elapsed, this.startPosition.x, this.deltaX, this.duration),
				this.easing(elapsed, this.startPosition.y, this.deltaY, this.duration)
			);
			this.setSize(
				this.easing(elapsed, this.startSize.width, this.deltaWidth, this.duration),
				this.easing(elapsed, this.startSize.height, this.deltaHeight, this.duration)
			);
			this.callStepFunction();
			requestAnimationFrame(this.stepThroughRectAnimation.bind(this));
		} else if (this.duration > 0){
			this.setPosition(this.endX, this.endY);
			this.setSize(this.endWidth, this.endHeight);
			this.callStepFunction();
			this.animating = false;
			if (this.callback){
				var callback = this.callback;
				this.callback = null;
				callback();
			}
		}
	};

	ns.View.prototype.cancelAnimation = function (){
		this.duration = 0;
		this.callback = null;
		this.stepFunction = null;
		this.animating = false;
	};

	ns.View.prototype.setAnchorSide = function (axis, minOrMax, allowLayoutChange) {
		var vert = (axis === ns.Views.VERTICAL);
		var coord = vert ? 'y' : 'x' ;
		var dim = vert ? 'height' : 'width' ; 
		var max = (minOrMax === ns.Views.MAX);
		var side = max ? (vert ? ns.Views.BOTTOM : ns.Views.RIGHT) : (vert ? ns.Views.TOP : ns.Views.LEFT) ;
		var opposite = max ? (vert ? ns.Views.TOP : ns.Views.LEFT) : (vert ? ns.Views.BOTTOM : ns.Views.RIGHT) ;
		if (!allowLayoutChange){
			this.position[coord] = this.el.parentNode.getBoundingClientRect()[dim] - this.size[dim] - this.position[coord];
		}
		this.el.style[side] = this.position.x + 'px';
		this.el.style[opposite] = 'auto';
		this.anchorSide[coord] = side;
	};

	ns.View.prototype.addMoveListener = function() {
		//console.log( 'View.addMoveListener:' );
		//console.log( this );
		//console.log( '-----------------' );
		document.addEventListener('mousemove', this, false);
	};

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	// Object > View > Draggable

	ns.Draggable = function (element, options) {
		ns.Draggable.parent.constructor.apply(this, [element]);
		this.dragOptions = (!options) ? {} : options;
		if (!this.dragOptions.hasOwnProperty('ignoreDragOutsideDocument')){
			this.dragOptions.ignoreDragOutsideDocument = true;
		}
		if (!this.dragOptions.noDragListener){
			this.addDragListener();
		}
		//this.ignoreBoundsWhileDragging = false;
	};

	ns.Draggable.DRAG_CURSOR_STYLE = 'drag-cursor-global';

	ns.extend(ns.Draggable, ns.View);

	ns.Draggable.prototype.getDragElement = function() {
		return this.el;
	};

	ns.Draggable.prototype.addDragListener = function() {
		var dragElement = this.getDragElement();
		dragElement.addEventListener('mousedown', this, false);
		dragElement.ondragstart = function() { return false; };
	};

	ns.Draggable.prototype.setDragCursor = function() {
		document.body.classList.add(ns.Draggable.DRAG_CURSOR_STYLE);
	};

	ns.Draggable.prototype.clearDragCursor = function() {
		document.body.classList.remove(ns.Draggable.DRAG_CURSOR_STYLE);
	};
	
	ns.Draggable.prototype.handleEvent = function (e) {
		switch(e.type) {
			case 'mousedown':
			this.onDown(e);
			break;
			case 'mousemove':
			this.onMove(e);
			break;
			case 'mouseup':
			this.onUp(e);
		}
	};

	ns.Draggable.prototype.onDown = function(e) {
		this.down = true;
		this.moved = false;
		this.startDrag(e);
		this.setDragCursor();
		ns.suppressDefault(e);
	};

	/*ns.Draggable.prototype.setBounds = function() {
		if (this.dragOptions.setBoundsToParent && this.el.parentNode){
			var rect = this.el.parentNode.getBoundingClientRect();
			this.bounds = new ns.Rect(0, 0, rect.width, rect.height);
		} else {
			this.bounds = new ns.Rect(0 - Number.MAX_VALUE, 0 - Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
		}
	};*/

	// '<div><a href="' + FUNCTION_CONTENT[function[i]].tourID + '"">Take a Tour</a></div>'

	ns.Draggable.prototype.startDrag = function (e) {
		//console.log('Draggable.startDrag');
		this.startDragEvent = e;
		this.down = true;
		this.moved = false;

		this.minX = 0 - Number.MAX_VALUE;
		this.minY = 0 - Number.MAX_VALUE;
		this.maxX = Number.MAX_VALUE;
		this.maxY = Number.MAX_VALUE;

		this.readParentScale();

		var rect = this.el.getBoundingClientRect();
		var parentRect = this.el.parentNode.getBoundingClientRect();
		if (this.dragOptions.setBoundsToParent){
			this.minX = 0;
			this.minY = 0;
			this.maxX = (parentRect.width - rect.width) / this.parentScaleX ;
			this.maxY = (parentRect.height - rect.height) / this.parentScaleY ;
		}
		this.setDragMinMax();
		this.dragOffset = new ns.Point(
			e.clientX - rect.left + parentRect.left,
			e.clientY - rect.top + parentRect.top
		);
		document.addEventListener('mouseup', this, false);
		document.addEventListener('mousemove', this, false);
	};

	ns.Draggable.prototype.setDragMinMax = function () {
		// Allow subclasses to override the default min max
	};

	ns.Draggable.prototype.onMove = function(e) {

		if (this.down){
			if (!this.moved){
				this.moved = true;

				// TODO: this does not belong here !!!
				if (ns.Tooltip){
					ns.Tooltip.hide();
				}

			}
			if (this.ignoreDragOutsideDocument){
				if (e.clientX < 0 || e.clientY < 0 || e.clientX > document.documentElement.clientWidth || e.clientY > document.documentElement.clientHeight){
					return;
				}
			}

			var x = (e.clientX - this.dragOffset.x) / this.parentScaleX;
			var y = (e.clientY - this.dragOffset.y) / this.parentScaleY;

			if (this.dragOptions.ignoreBoundsWhileDragging){
				this.setPosition(x, y);
			} else {
				this.setPosition(
					Math.max(this.minX, Math.min(x, this.maxX)),
					Math.max(this.minY, Math.min(y, this.maxY))
				);
			}
		}
	};

	ns.Draggable.prototype.onUp = function() {
		if (this.down){
			this.down = false;
			document.removeEventListener('mouseup', this, false);
			document.removeEventListener('mousemove', this, false);
			this.clearDragCursor();
		}
	};

	// 	Overrides

	ns.Draggable.prototype.destroy = function () {
		this.getDragElement().removeEventListener('mousedown', this, false);
		document.removeEventListener('mousemove', this, false);
		document.removeEventListener('mouseup', this, false);
		ns.Draggable.parent.destroy.apply(this);
	};

	// 	Private implementation for ns.addWheelListener ///////////////////////////////////////////////////////////////////////

	//  From: https://developer.mozilla.org/en-US/docs/Web/Events/wheel (slightly modified to make jshint happy)

	var prefix = "",  _addEventListener, support;
	if (window.addEventListener) {
		_addEventListener = "addEventListener";
	} else {
		_addEventListener = "attachEvent";
		prefix = "on";
	}
	support = "onwheel" in document.createElement("div") ? "wheel" :
              document.onmousewheel !== undefined ? "mousewheel" :
              "DOMMouseScroll";
 	function _addWheelListener( elem, eventName, callback, useCapture ) {
 		elem[ _addEventListener ](prefix + eventName, support == "wheel" ? callback : function( originalEvent ) {
 			if (!originalEvent){
 				originalEvent = window.event;
 			}
 			var event = {
 				originalEvent: originalEvent,
 				target: originalEvent.target || originalEvent.srcElement,
 				type: "wheel",
 				deltaMode: originalEvent.type == "MozMousePixelScroll" ? 0 : 1,
 				deltaX: 0,
 				deltaZ: 0,
 				preventDefault: function() {
 					if (originalEvent.preventDefault){
 						originalEvent.preventDefault();
 					} else {
 						originalEvent.returnValue = false;
 					}
 				}
 			};
 			if (support == "mousewheel"){
 				event.deltaY = - 1/40 * originalEvent.wheelDelta;
 				if (originalEvent.wheelDeltaX){
 					event.deltaX = - 1/40 * originalEvent.wheelDeltaX;
 				}
 			} else {
 				event.deltaY = originalEvent.detail;
 			}
 			return callback( event );
 		}, useCapture || false );
 	}

 	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

 	ns.distanceToPolygon = function (pt, poly) {
		var d = Number.MAX_VALUE, len = poly.length, i;
		for (i=0; i<len; i++){
			d = Math.min(distanceToSegment(pt, poly[i], poly[(i+1)%len] ), d);
		}
		return d;
	};

	ns.distanceToSegment = function (pt, A, B) {
		function sqr(n) { return n * n; }
		function dist(A, B) { return sqr(A.x - B.x) + sqr(A.y - B.y); }
		function distToSegSquared(pt, A, B) {
			var d = dist(A, B);
			if (d == 0) return dist(pt, A);
			var t = ((pt.x - A.x) * (B.x - A.x) + (pt.y - A.y) * (B.y - A.y)) / d;
			t = Math.max(0, Math.min(1, t));
			return dist( pt, [A.x + t * (B.x - A.x), A.y + t * (B.y - A.y) ]);
		}
		return Math.sqrt(distToSegSquared(pt, A, B));
	};

	ns.pointInQuadrilateral = function (pt, A, B, C, D) {
		return pointInTriangle (pt, A, B, C) || pointInTriangle (pt, A, C, D);
	};

	ns.pointInTriangle = function (pt, A, B, C) {
		function vec(from, to) {  return [to.x - from.x, to.y - from.y];  }
		var v0 = vec(A, C);
		var v1 = vec(A, B);
		var v2 = vec(A, pt);
		function dot(u, v) {  return u.x * v.x + u.y * v.y;  }
		var dot00 = dot(v0, v0);
		var dot01 = dot(v0, v1);
		var dot02 = dot(v0, v2);
		var dot11 = dot(v1, v1);
		var dot12 = dot(v1, v2);
		var invDenom = 1.0 / (dot00 * dot11 - dot01 * dot01);
		var u = (dot11 * dot02 - dot01 * dot12) * invDenom;
		var v = (dot00 * dot12 - dot01 * dot02) * invDenom;
		return (u >= 0) && (v >= 0) && (u + v < 1);
	};

})();