(function(){

	// TODO: Thumbnail for AddToFavoritesWindow

	// TODO: Prevent minimizing when there are no taskbar thumbnails

	'use strict';

	window[window.globalNamespaceName] = window[window.globalNamespaceName] || {};
	var ns = window[window.globalNamespaceName];

	ns.Windows = {
		windowList: [],
		//barList: [], // Vestigial
		loginWindow: null,
		bloombergSettingsWindow: null,
		bloombergSettingsWindowDisabled: false,

		toggleAlwaysOnTop: function(win){
			var wasOnTop = win.isAlwaysOnTop();
			win.alwaysOnTop = !win.alwaysOnTop;
			var isOnTop = win.isAlwaysOnTop();
			if (isOnTop !== wasOnTop){
				this.moveToFront(win);
			}
		},

		sortOnZIndex: function(winArr){
			winArr.sort(function(a,b){
				if (a.el.style.zIndex > b.el.style.zIndex){
					return 1;
				}
				if (a.el.style.zIndex < b.el.style.zIndex){
					return -1;
				}
				return 0;
			});
		},

		removeAllBBAppWindows: function (){
			// Destroy the singletons first
			if (ns.LPToolbar){
				ns.LPToolbar.destroy();
			}
			if (ns.IB){
				ns.IB.closeWindow();
			}
			// All others
			var b2appWindows = ns.Windows.getWindowsByAppId(ns.B2App.B2APP_ID);
			var win, i;
			for (i=0; i<b2appWindows.length; i++){
				win = b2appWindows[i];
				if (win.type === ns.BloombergPanel.TYPE){
					ns.Window.prototype.close.apply(win); // Skip the close animation and app-closing check performed in BloombergPanel's close function
				} else {
					win.close();
				}
			}
		},

		getLPWindows: function (){
			var win, i, arr = [];
			for (i=0; i<this.windowList.length; i++){
				win = this.windowList[i];
				if (ns.LPWindow.prototype.isPrototypeOf(win)){
					arr.push(win);
				}
			}
			return arr;
		},

		getDialogOpener: function(){
			var dialogOpener, activeWin = this.getActive();
			if (activeWin){
				if (activeWin.type === ns.BloombergPanel.TYPE){ // if (activeWin.type === ns.BloombergPanel.TYPE || activeWin.type === ns.BloombergBar.TYPE){
					dialogOpener = activeWin;
				}
			}
			if (!dialogOpener){
				var bbWindows = this.getWindowsOfType(ns.BloombergPanel.TYPE);
				dialogOpener = bbWindows[bbWindows.length - 1];
			}
			return dialogOpener;
		},

		addWindow: function(windowToAdd){
			// TODO: Make sure it is impossible to add the same window twice !!!
			var highestZIndex = 0; // This is typically the number of windows in the list; exceptions occur when multi-resize hilites occupy z-indexes
			var highestAlwaysOnTopZIndex = 0;
			var regularWindows = [];
			var alwaysOnTopWindows = [];
			var win, i;
			for (i=0; i<this.windowList.length; i++){
				win = this.windowList[i];
				if (win.isAlwaysOnTop()){
					alwaysOnTopWindows.push(win);
					highestAlwaysOnTopZIndex = Math.max(win.el.style.zIndex, highestAlwaysOnTopZIndex);
				} else {
					regularWindows.push(win);
					highestZIndex = Math.max(win.el.style.zIndex, highestZIndex);
				}
			}
			if (windowToAdd.isAlwaysOnTop()){
				alwaysOnTopWindows.push(windowToAdd);
				windowToAdd.el.style.zIndex = highestAlwaysOnTopZIndex + 1;
			} else {
				regularWindows.push(windowToAdd);
				windowToAdd.el.style.zIndex = highestZIndex + 1;
				for (i=alwaysOnTopWindows.length-1; i>=0; i--){
					win = alwaysOnTopWindows[i];
					win.el.style.zIndex = win.el.style.zIndex + 1;
				}
			}
			this.windowList = regularWindows.concat(alwaysOnTopWindows);
		},

		removeWindow: function(win) {
			ns.Taskbar.onWindowClose(win);
			var pos = this.windowList.indexOf(win);
			if (pos > -1){
				this.windowList.splice(pos, 1);
			}
			win.el = null; // TODO: look into why this is here, because it seems like a really bad idea !!!
		},

		deactivateAll: function() {
			// Currently this is only called by Desktop and Taskbar
			var i, len = this.windowList.length;
			for (i=0; i<len; i++){
				this.windowList[i].deactivate();
			}
		},

		getActive: function() {
			var activeWin = null;
			var i, win, len = this.windowList.length;
			for (i=0; i<len; i++){
				win = this.windowList[i];
				if (win.active){
					activeWin = win;
					break;
				}
			}
			return activeWin;
		},

		moveToFront: function (winToMove){
			var i, win, pos = this.windowList.indexOf(winToMove);
			this.windowList.splice(pos, 1);
			var regularWindows = [];
			var alwaysOnTopWindows = [];
			for (i=0; i<this.windowList.length; i++){
				win = this.windowList[i];
				if (win.isAlwaysOnTop()){
					alwaysOnTopWindows.push(win);
				} else {
					regularWindows.push(win);
				}
			}
			if (winToMove.isAlwaysOnTop()){
				this.windowList = regularWindows.concat(alwaysOnTopWindows);
				this.windowList.push(winToMove);
			} else {
				this.windowList = regularWindows;
				this.windowList.push(winToMove);
				this.windowList = this.windowList.concat(alwaysOnTopWindows);
			}
			for (i=0; i<this.windowList.length; i++){
				win = this.windowList[i];
				win.el.style.zIndex = (i + 1);
				if (win !== winToMove){
					win.deactivate();
				}
			}
			if (winToMove.associatedModal){
				this.moveToFront(winToMove.associatedModal);
			}
		},

		getWindowsOfType: function (type){
			var win, i, arr = [];
			for (i=0; i<this.windowList.length; i++){
				win = this.windowList[i];
				if (win.type === type){
					arr.push(win);
				}
			}
			return arr;
		},

		getWindowsByAppId: function (appId){
			var win, i, ok, arr = [];
			switch (appId){

				case ns.B2App.B2APP_ID:
				for (i=0; i<this.windowList.length; i++){
					win = this.windowList[i];
					ok = true;
					if (ns.ExcelWindow){
						if (win.type === ns.ExcelWindow.TYPE){
							ok = false;
						}
					}
					if (ok){
						arr.push(win);
					}
				}
				break;

				case 'excel':
				for (i=0; i<this.windowList.length; i++){
					win = this.windowList[i];
					if (ns.ExcelWindow){
						if (win.type === ns.ExcelWindow.TYPE){
							arr.push(win);
						}
					}
				}
				break;

			}
			return arr;
		},

		getWindowById: function (id){
			var win, i;
			for (i=0; i<this.windowList.length; i++){
				win = this.windowList[i];
				if (win.id === id){
					return win;
				}
			}
			return null;
		},

		getTopWindowOfType: function (type){
			var arr = this.getWindowsOfType(type);
			return (arr.length > 0) ? arr[arr.length-1] : null ;
		},

		createWin7BgElements: function (view, bg) {
			var gradientBounds = ns.Views.create('div', ['gradient-bounds'], bg);
			ns.Views.create('div', ['gradient'], gradientBounds); // TODO: Keep a reference to this element so thumbnail hilite on active window can hide it !!!
			ns.Views.create('div', ['corner-hilite', 'left'], bg);
			ns.Views.create('div', ['corner-hilite', 'right'], bg);
			ns.Views.create('div', ['inner-border'], bg);
		},

		createWin7Title: function(view, parent) {
			view.win7title = ns.Views.create('div', ['win7-title'], parent);
			var glowBox = ns.Views.create('div', ['glow-box'], view.win7title);
			view.titleGlow = ns.Views.create('div', ['glow'], glowBox);
			var titleBox = ns.Views.create('div', ['bb-window-title-box'], view.win7title);
			var innerDiv = ns.Views.create('div', [], titleBox);
			view.titleSpan = ns.Views.create('span', [], innerDiv);
		},

		onDockingChanged: function() {
			/*if (this.bloombergBar){
				var barBottom = this.bloombergBar.position.y + this.bloombergBar.size.height;
				var barRight = this.bloombergBar.position.x + this.bloombergBar.size.width;
				for (var i=0; i<this.windowList.length; i++){
					var win = this.windowList[i];
					if (win !== this.bloombergBar){
						if (win.maximized){
							win.showMaximized();
						} else {
							if (ns.BloombergBar.isDockedToTop()){
								if (win.position.y < barBottom ){
									win.setPosition(win.position.x, barBottom);
								}
							} else if (ns.BloombergBar.isDockedToLeft()){
								if (win.position.x < barRight ){
									win.setPosition(barRight, win.position.y);
								}
							}
						}
					}
				}
			}*/
		},

		openBloombergSettings: function(category) {
			if (!this.bloombergSettingsWindowDisabled){
				if (ns.Windows.bloombergSettingsWindow){
					this.moveToFront(ns.Windows.bloombergSettingsWindow);
					ns.Windows.bloombergSettingsWindow.activate();
				} else {
					ns.BloombergSettingsWindow.create(category);
				}
			}
			return ns.Windows.bloombergSettingsWindow;
		},

		openSimpleSettings: function(category) {
			if (!this.bloombergSettingsWindowDisabled){
				if (ns.Windows.bloombergSettingsWindow){
					this.moveToFront(ns.Windows.bloombergSettingsWindow);
					ns.Windows.bloombergSettingsWindow.activate();
				} else {
					ns.SimpleSettingsWindow.create(category);
				}
			}
			return ns.Windows.bloombergSettingsWindow;
		},

		openGroupManager: function(selectedGroup) {
			if (ns.Windows.groupManagerWindow){
				this.moveToFront(ns.Windows.groupManagerWindow);
				ns.Windows.groupManagerWindow.activate();
			} else {
				ns.LPGroupManager.create(selectedGroup);
			}
			return ns.Windows.groupManagerWindow;
		},

		getRezizeTypeFromSides: function (sides){
			var r;
			if (sides.indexOf(ns.Views.TOP) > -1){
				if (sides.indexOf(ns.Views.LEFT) > -1){
					r = ns.Window.RESIZE_NW;
				} else if (sides.indexOf(ns.Views.RIGHT) > -1){
					r = ns.Window.RESIZE_NE;
				} else {
					r = ns.Window.RESIZE_N;
				}
			} else if (sides.indexOf(ns.Views.BOTTOM) > -1){
				if (sides.indexOf(ns.Views.LEFT) > -1){
					r = ns.Window.RESIZE_SW;
				} else if (sides.indexOf(ns.Views.RIGHT) > -1){
					r = ns.Window.RESIZE_SE;
				} else {
					r = ns.Window.RESIZE_S;
				}
			} else if (sides.indexOf(ns.Views.LEFT) > -1){
				r = ns.Window.RESIZE_W;
			} else if (sides.indexOf(ns.Views.RIGHT) > -1){
				r = ns.Window.RESIZE_E;
			}
			return r;
		}

	};

	// Object > View > Draggable > Window

	ns.Window = function () {
		ns.Window.parent.constructor.apply(this, arguments);
		this.type = ns.Window.TYPE;
		this.id = ns.Window.nextUniqueWindowId;
		this.el.setAttribute('data-id', this.id); // Just for looking in the browser's element inspector. Not to be used in coding !!!

		ns.Window.nextUniqueWindowId++;
		this.title = 'Generic Window Title';
		this.windowEventsDisabled = false;
		this.active = false;
		this.maximized = false;
		this.resizers = [];

		this.minSize = new ns.Size(ns.Window.DEFAULT_MIN_WIDTH, ns.Window.DEFAULT_MIN_HEIGHT);

		this.maxSize = new ns.Size(ns.Window.DEFAULT_MAX_WIDTH, ns.Window.DEFAULT_MAX_HEIGHT);

		this.el.addEventListener('mousedown', this, true); // Using capture

		this.el.addEventListener('dblclick', this, false);

		this.frozen = false;
		this.alwaysOnTop = false;
	};

	ns.Window.nextUniqueWindowId = 1;

	ns.Window.TYPE = 'generic';

	ns.Window.DEFAULT_SCALE = 62.5;

	ns.Window.DEFAULT_DRAG_ELEMENT_STYLE = 'drag-bar';

	ns.Window.CURSOR_STYLE_SUFFIX = '-cursor-global';
	ns.Window.RESIZER_STYLE_SUFFIX = '-resize';
	ns.Window.RESIZER_PROP_SUFFIX = 'Resize';

	ns.Window.DEFAULT_MIN_WIDTH = 244; // 234;
	ns.Window.DEFAULT_MIN_HEIGHT = 128;

	ns.Window.DEFAULT_MAX_WIDTH = 2560; // ???
	ns.Window.DEFAULT_MAX_HEIGHT = 2560; // ???

	ns.Window.MIN_VISIBLE_SIZE = 15;

	ns.Window.ACTIVATE_EVENT = 'activate';
	ns.Window.DEACTIVATE_EVENT = 'deactivate';
	ns.Window.RESIZE_START_EVENT = 'resize-start';
	ns.Window.RESIZE_EVENT = 'resize';
	ns.Window.RESIZE_COMPLETE_EVENT = 'resize-complete';
	ns.Window.CLOSE_EVENT = 'close';
	ns.Window.ZOOM_EVENT = 'zoom';

	ns.Window.RESIZE_SE = 'se';
	ns.Window.RESIZE_SW = 'sw';
	ns.Window.RESIZE_NW = 'nw';
	ns.Window.RESIZE_NE = 'ne';
	ns.Window.RESIZE_S = 's';
	ns.Window.RESIZE_W = 'w';
	ns.Window.RESIZE_N = 'n';
	ns.Window.RESIZE_E = 'e';

	ns.Window.MINIMIZE_TOOLTIP_ID = 'minimize';
	ns.Window.MAXIMIZE_TOOLTIP_ID = 'maximize';
	ns.Window.CLOSE_TOOLTIP_ID = 'close';

	ns.Window.TOOLBAR_DOCK_SAVED_X = 'unshiftedX';
	ns.Window.TOOLBAR_DOCK_SAVED_Y = 'unshiftedY';
	ns.Window.TOOLBAR_DOCK_SAVED_W = 'unshiftedW';
	ns.Window.TOOLBAR_DOCK_SAVED_H = 'unshiftedH';

	ns.extend(ns.Window, ns.Draggable);

	ns.Window.prototype.createWindows7Button = function(style, parent, tooltipId, tooltipText) {
		var btn = ns.Views.create('div', ['win7-btn', style], parent);
		btn.addEventListener('click', this, false);
		if (tooltipId){
			this.tooltips[tooltipId] = new ns.Tooltip(btn, tooltipText, {duration: 5000, style:'yellow-tooltip', fade:true});
		}
		return btn;
	};

	ns.Window.prototype.onCloseButtonClick = function () {
		//console.log('Window.onCloseButtonClick');
		this.onCloseRequested();
	};

	ns.Window.prototype.onTaskbarThumbCloseClick = function () {
		// Called by TaskbarClass.onThumbCloseClick
		//console.log('Window.onTaskbarThumbCloseClick');
		this.onCloseRequested();
	};

	ns.Window.prototype.onCloseRequested = function () {
		if (!this.closeDisabled){
			this.close();
		}
	};

	ns.Window.prototype.onClick = function (e) {
		switch (e.currentTarget){

			case this.closeButton:
			this.onCloseButtonClick();
			break;

			case this.maximizeButton:
			if (!this.maximizeDisabled){
				this.toggleMaximize();
			}
			break;

			case this.minimizeButton:
			if (!this.minimizeDisabled){
				this.minimize();
			}
			break;
		}
	};

	ns.Window.prototype.isAlwaysOnTop = function () {
		return this.alwaysOnTop;
	};

	ns.Window.prototype.getTitle = function () {
		return this.title;
	};

	ns.Window.prototype.setContent = function (element) {
		// No default implementation
	};

	ns.Window.prototype.createWin7WindowControls = function (parent) {

		var controlsBox = ns.Views.create('div', 'win7-ctrls', parent);
		this.minimizeButton = this.createWindows7Button('minimize', controlsBox, ns.Window.MINIMIZE_TOOLTIP_ID, 'Minimize');
		this.maximizeButton = this.createWindows7Button('maximize', controlsBox, ns.Window.MAXIMIZE_TOOLTIP_ID, 'Maximize');
		this.closeButton = this.createWindows7Button('close', controlsBox, ns.Window.CLOSE_TOOLTIP_ID, 'Close');

		/*
		this.minimizeButton = this.createButton( ['btn','chr','minimize'], parent);
		this.maximizeButton = this.createButton( ['btn','chr','maximize'], parent);
		this.closeButton = this.createButton( ['btn','chr','close'], parent);
		this.tooltips[ns.Window.MINIMIZE_TOOLTIP_ID] = new ns.Tooltip(this.minimizeButton, 'Minimize', {duration: 5000, style:'yellow-tooltip', fade:true});
		this.tooltips[ns.Window.MAXIMIZE_TOOLTIP_ID] = new ns.Tooltip(this.maximizeButton, 'Maximize', {duration: 5000, style:'yellow-tooltip', fade:true});
		this.tooltips[ns.Window.CLOSE_TOOLTIP_ID] = new ns.Tooltip(this.closeButton, 'Close', {duration: 5000, style:'yellow-tooltip', fade:true});
		*/

	};

	ns.Window.prototype.createWin7WindowControlsCloseOnly = function (parent) {
		var controlsBox = ns.Views.create('div', 'win7-ctrls-close-only', parent);
		this.closeButton = this.createWindows7Button('close', controlsBox, ns.Window.CLOSE_TOOLTIP_ID, 'Close');
	};

	ns.Window.prototype.fitInDesktop = function () {
		var winRect = this.el.getBoundingClientRect();
		var desktopRect = ns.Desktop.getRect(true);
		this.setSize( Math.min(winRect.width, desktopRect.width), Math.min(winRect.height, desktopRect.height) );
		var deltaX = Math.max(0, winRect.left + this.size.width - desktopRect.right);
		var deltaY = Math.max(0, winRect.top + this.size.height - desktopRect.bottom);
		if (deltaX > 0 || deltaY > 0){
			this.setPosition( Math.max(0, this.position.x - deltaX), Math.max(0, this.position.y - deltaY) );
		}
	};

	ns.Window.prototype.getSaveData = function () {
		var position = this.position.copy();
		var size = this.size.copy();
		var minimized = (this.minimized) ? true : false ;
		return {x: position.x, y: position.y, width: size.width, height: size.height, minimized: minimized, type: this.type};
	};

	ns.Window.prototype.appendTaskbarThumbnailImage = function (parent) {
		var div = ns.Views.create('div', ['thumb-image', 'default-thumb-image'], parent);
		parent.appendChild(div);
	};

	ns.Window.prototype.appendTaskbarThumbnailIcon = function (parent) {
		ns.Views.create('div', ['icon'], parent); // desktop.css, '.thumbnail-win .icon'
	};

	ns.Window.prototype.addAllResizers = function(fragment) {
		this.addResizer(ns.Window.RESIZE_SE, fragment);
		this.addResizer(ns.Window.RESIZE_SW, fragment);
		this.addResizer(ns.Window.RESIZE_NW, fragment);
		this.addResizer(ns.Window.RESIZE_NE, fragment);
		this.addResizer(ns.Window.RESIZE_S, fragment);
		this.addResizer(ns.Window.RESIZE_W, fragment);
		this.addResizer(ns.Window.RESIZE_N, fragment);
		this.addResizer(ns.Window.RESIZE_E, fragment);
	};

	ns.Window.prototype.addResizer = function(id, fragment) {
		var style = id + ns.Window.RESIZER_STYLE_SUFFIX;
		var resizer = ns.Views.create('div', ['resizer', style], fragment);
		this[id + ns.Window.RESIZER_PROP_SUFFIX] = resizer;
		this.resizers.push(resizer);
	};

	ns.Window.prototype.toggleMaximize = function() {
		if (this.maximized){
			this.setPosition(this.unmaximizedPosition.x, this.unmaximizedPosition.y);
			this.setSize(this.unmaximizedSize.width, this.unmaximizedSize.height);
			this.el.classList.remove('maximized');
		} else {
			this.unmaximizedPosition = this.position.copy();
			this.unmaximizedSize = this.size.copy();
			this.showMaximized();
		}
		this.maximized = !this.maximized;
	};

	ns.Window.prototype.showMaximized = function() {
		var desktopRect = ns.Desktop.getAvailableRect();
		desktopRect.convertToLocalSpace(this.el.parentNode.getBoundingClientRect());
		this.setSize(desktopRect.width, desktopRect.height);
		this.setPosition(desktopRect.left, desktopRect.top);
		this.el.classList.add('maximized');
	};

	ns.Window.prototype.minimize = function () {
		var taskbarAppButton, okToMinimize = true;
		var appWindows = ns.Windows.getWindowsByAppId(ns.B2App.B2APP_ID);
		if (appWindows.indexOf(this) > -1){
			taskbarAppButton = ns.Taskbar.getButtonById(ns.Taskbar.BB_BUTTON_ID);
			if (!taskbarAppButton){
				okToMinimize = false;
			}
		} else if (ns.ExcelWindow){
			if (this.type === ns.ExcelWindow.TYPE){
				taskbarAppButton = ns.Taskbar.getButtonById(ns.Taskbar.EXCEL_BUTTON_ID);
				if (!taskbarAppButton){
					okToMinimize = false;
				}
			}
		}
		if (okToMinimize){
			this.minimized = true;
			this.el.classList.add('minimized');
			this.deactivate();
		}
	};

	ns.Window.prototype.unminimize = function () {
		this.minimized = false;
		this.el.classList.remove('minimized');
	};

	ns.Window.prototype.activate = function() {
		ns.Desktop.deactivate();
		if (!this.active){
			/*if (ns.Windows.bloombergBar){
				if (ns.BloombergBar.shouldBeOnTop()){
					if (this !== ns.Windows.bloombergBar){
						ns.BloombergBar.deactivate();
					}
				}
			}*/
			this.active = true;
			ns.Windows.moveToFront(this);
			this.showActive(true);
			if (!this.windowEventsDisabled){
				this.onWindowEvent(ns.Window.ACTIVATE_EVENT);
			}
		}
	};

	ns.Window.prototype.deactivate = function() {
		if (this.active){
			this.active = false;
			this.showActive(false);
			if (!this.windowEventsDisabled){
				this.onWindowEvent(ns.Window.DEACTIVATE_EVENT);
			}
		}
	};

	ns.Window.prototype.showActive = function(bool) {
		//console.log(this);
		var bg = this.el.querySelector('.bg');
		if (bool){
			this.el.classList.add('active');
			if (bg){
				bg.classList.add('pie-active'); // For IE 9, force CSS3 Pie repaint for bg gradient
			}
		} else {
			this.el.classList.remove('active');
			if (bg){
				bg.classList.remove('pie-active');
			}
		}
	};

	ns.Window.prototype.startResize = function (e, nonEventTarget){
		var target = (nonEventTarget) ? nonEventTarget : e.target ;
		switch(target) {
			case this.seResize:
			this.resizeType = ns.Window.RESIZE_SE;
			this.resizeFn = function (e){
				this.resizeSE(e);
			};
			break;

			case this.swResize:
			this.resizeType = ns.Window.RESIZE_SW;
			this.resizeFn = function (e){
				this.resizeSW(e);
			};
			break;

			case this.nwResize:
			this.resizeType = ns.Window.RESIZE_NW;
			this.resizeFn = function (e){
				this.resizeNW(e);
			};
			break;

			case this.neResize:
			this.resizeType = ns.Window.RESIZE_NE;
			this.resizeFn = function (e){
				this.resizeNE(e);
			};
			break;

			case this.sResize:
			this.resizeType = ns.Window.RESIZE_S;
			this.resizeFn = function (e){
				this.resizeS(e);
			};
			break;

			case this.wResize:
			this.resizeType = ns.Window.RESIZE_W;
			this.resizeFn = function (e){
				this.resizeW(e);
			};
			break;

			case this.nResize:
			this.resizeType = ns.Window.RESIZE_N;
			this.resizeFn = function (e){
				this.resizeN(e);
			};
			break;

			case this.eResize:
			this.resizeType = ns.Window.RESIZE_E;
			this.resizeFn = function (e){
				this.resizeE(e);
			};
			break;
		}
		this.setResizeCursor();
		if (!this.windowEventsDisabled){
			this.onWindowEvent(ns.Window.RESIZE_START_EVENT);
		}
	};

	ns.Window.prototype.resizeSE = function (e){
		var delta = this.getDragDelta(e);

		//var minW = Math.max( this.minWidth, ns.Window.MIN_VISIBLE_SIZE - this.position.x );
		var minW = Math.max( this.minSize.width, ns.Window.MIN_VISIBLE_SIZE - this.position.x );

		this.setSize(
			Math.max(minW, Math.min(this.getMaxWResizeE(), this.origSize.width + delta.width)),
			//Math.max(this.minHeight, Math.min(this.getMaxHResizeS(), this.origSize.height + delta.height))
			Math.max(this.minSize.height, Math.min(this.getMaxHResizeS(), this.origSize.height + delta.height))
		);
	};

	ns.Window.prototype.resizeSW = function (e){

		var delta = this.getDragDelta(e);
		var right = this.origPos.x + this.origSize.width;

		//var maxX = Math.min(right - this.minWidth, ns.Desktop.getRect().width - ns.Window.MIN_VISIBLE_SIZE);
		var maxX = Math.min(right - this.minSize.width, ns.Desktop.getRect().width - ns.Window.MIN_VISIBLE_SIZE);

		//var minX = Math.max(0, right - this.maxWidth);
		var minX = Math.max(0, right - this.maxSize.width);
		var newX = Math.max(minX, Math.min( maxX, this.origPos.x + delta.width ) );

		this.setSize(
			right - newX,
			//Math.max(this.minHeight, Math.min(this.getMaxHResizeS(), this.origSize.height + delta.height))
			Math.max(this.minSize.height, Math.min(this.getMaxHResizeS(), this.origSize.height + delta.height))
		);
		this.setPosition(newX, this.origPos.y);
	};

	ns.Window.prototype.resizeNW = function (e){

		var delta = this.getDragDelta(e);
		var right = this.origPos.x + this.origSize.width;
		var bottom = this.origPos.y + this.origSize.height;

		//var maxX = Math.min(right - this.minWidth, ns.Desktop.getRect().width - ns.Window.MIN_VISIBLE_SIZE);
		var maxX = Math.min(right - this.minSize.width, ns.Desktop.getRect().width - ns.Window.MIN_VISIBLE_SIZE);

		var minX = Math.max(0, right - this.maxSize.width);
		//var minX = Math.max(0, right - this.maxWidth);
		var newX = Math.max(minX, Math.min( maxX, this.origPos.x + delta.width ) );

		//var maxY = Math.min(bottom - this.minHeight, ns.Desktop.getRect(true).height - ns.Window.MIN_VISIBLE_SIZE);
		var maxY = Math.min(bottom - this.minSize.height, ns.Desktop.getRect(true).height - ns.Window.MIN_VISIBLE_SIZE);

		//var minY = Math.max(0, bottom - this.maxHeight);
		var minY = Math.max(0, bottom - this.maxSize.height);

		var newY = Math.max(minY, Math.min( maxY, this.origPos.y + delta.height ) );
		this.setSize(
			right - newX,
			bottom - newY
		);
		this.setPosition(newX, newY);
	};

	ns.Window.prototype.resizeNE = function (e){
		var delta = this.getDragDelta(e);
		var bottom = this.origPos.y + this.origSize.height;

		//var maxY = Math.min(bottom - this.minHeight, ns.Desktop.getRect(true).height - ns.Window.MIN_VISIBLE_SIZE);
		var maxY = Math.min(bottom - this.minSize.height, ns.Desktop.getRect(true).height - ns.Window.MIN_VISIBLE_SIZE);

		//var minY = Math.max(0, bottom - this.maxHeight);
		var minY = Math.max(0, bottom - this.maxSize.height);
		var newY = Math.max(minY, Math.min( maxY, this.origPos.y + delta.height ) );

		//var minW = Math.max( this.minWidth, ns.Window.MIN_VISIBLE_SIZE - this.position.x );
		var minW = Math.max( this.minSize.width, ns.Window.MIN_VISIBLE_SIZE - this.position.x );

		this.setSize(
			Math.max(minW, Math.min(this.getMaxWResizeE(), this.origSize.width + delta.width)),
			bottom - newY
		);
		this.setPosition(this.origPos.x, newY);
	};

	ns.Window.prototype.resizeS = function (e){
		this.setHeight(this.calculateResizeS(e) - this.position.y);
		if (!this.windowEventsDisabled){
			this.onWindowEvent(ns.Window.RESIZE_EVENT);
		}
	};

	ns.Window.prototype.calculateResizeS = function (e){
		//var newH = Math.max(this.minHeight, Math.min(this.getMaxHResizeS(), this.origSize.height + this.getDragDelta(e).height));
		var newH = Math.max(this.minSize.height, Math.min(this.getMaxHResizeS(), this.origSize.height + this.getDragDelta(e).height));
		return newH + this.position.y;
	};

	ns.Window.prototype.resizeW = function (e){
		var newLeft = this.calculateResizeW(e);
		this.setWidth(this.position.x + this.size.width - newLeft);
		this.setX(newLeft);
		if (!this.windowEventsDisabled){
			this.onWindowEvent(ns.Window.RESIZE_EVENT);
		}
	};

	ns.Window.prototype.calculateResizeW = function (e){
		var right = this.origPos.x + this.origSize.width;

		//var maxX = Math.min(right - this.minWidth, ns.Desktop.getRect().width - ns.Window.MIN_VISIBLE_SIZE);
		var maxX = Math.min(right - this.minSize.width, ns.Desktop.getRect().width - ns.Window.MIN_VISIBLE_SIZE);

		var minX = Math.max( this.availResizeRect.left, right - this.maxSize.width);
		//var minX = Math.max( this.availResizeRect.left, right - this.maxWidth);
		return Math.max(minX, Math.min( maxX, this.origPos.x + this.getDragDelta(e).width ) ); 
	};

	ns.Window.prototype.resizeN = function (e){
		var newTop = this.calculateResizeN(e);
		this.setHeight(this.position.y + this.size.height - newTop);
		this.setY(newTop);
		if (!this.windowEventsDisabled){
			this.onWindowEvent(ns.Window.RESIZE_EVENT);
		}
	};

	ns.Window.prototype.calculateResizeN = function (e){
		var bottom = this.origPos.y + this.origSize.height;

		//var maxY = Math.min(bottom - this.minHeight, ns.Desktop.getRect(true).height - ns.Window.MIN_VISIBLE_SIZE);
		var maxY = Math.min(bottom - this.minSize.height, ns.Desktop.getRect(true).height - ns.Window.MIN_VISIBLE_SIZE);

		//var minY = Math.max(this.availResizeRect.top, bottom - this.maxHeight);
		var minY = Math.max(this.availResizeRect.top, bottom - this.maxSize.height);

		return Math.max(minY, Math.min( maxY, this.origPos.y + this.getDragDelta(e).height ) );
	};

	ns.Window.prototype.resizeE = function (e){
		this.setWidth(this.calculateResizeE(e) - this.position.x);
		if (!this.windowEventsDisabled){
			this.onWindowEvent(ns.Window.RESIZE_EVENT);
		}
	};

	ns.Window.prototype.calculateResizeE = function (e){

		//var minW = Math.max( this.minWidth, ns.Window.MIN_VISIBLE_SIZE - this.position.x );
		var minW = Math.max( this.minSize.width, ns.Window.MIN_VISIBLE_SIZE - this.position.x );

		var newW = Math.max(minW, Math.min(this.getMaxWResizeE(), this.origSize.width + this.getDragDelta(e).width)); 
		return newW + this.position.x;
	};

	ns.Window.prototype.setResizeCursor = function() {
		document.body.classList.add(this.resizeType + ns.Window.CURSOR_STYLE_SUFFIX);
	};

	ns.Window.prototype.clearResizeCursor = function() {
		document.body.classList.remove(this.resizeType + ns.Window.CURSOR_STYLE_SUFFIX);
	};

	ns.Window.prototype.getDragDelta = function(e) {
		return new ns.Size(e.clientX - this.dragOffset.x - this.origPos.x, e.clientY - this.dragOffset.y - this.origPos.y);
	};

	ns.Window.prototype.getMaxWResizeE = function() {
		return Math.min( this.maxSize.width, Math.max( this.availResizeRect.right - this.position.x, ns.Window.MIN_VISIBLE_SIZE - this.position.x ) );
		//return Math.min( this.maxWidth, Math.max( this.availResizeRect.right - this.position.x, ns.Window.MIN_VISIBLE_SIZE - this.position.x ) );
	};

	ns.Window.prototype.getMaxHResizeS = function() {
		// console.log( Math.min( this.maxHeight, ns.Desktop.getRect().height - this.position.y) ); 
		return Math.min( this.maxSize.height, this.availResizeRect.bottom - this.position.y);
		//return Math.min( this.maxHeight, this.availResizeRect.bottom - this.position.y);
	};

	ns.Window.prototype.showZoomTipE = function(e) {
		this.showZoomTip(e, this.position.x + this.size.width);
	};

	ns.Window.prototype.showZoomTipW = function(e) {
		this.showZoomTip(e, this.position.x);
	};

	ns.Window.prototype.showZoomTip = function(e, x) {
		ns.ResizeTip.instantiate();
		ns.Window.resizeTip.show(e, x);
	};

	ns.Window.prototype.close = function() {
		ns.Tooltip.hideForContainedElement(this.el);
		this.remove();
		var eventName, i;
		this.getDragElement().removeEventListener('mousedown', this, false); // is this really necessary ???
		for (i=0; i<ns.EventManager.events.length; i++){
			eventName = ns.EventManager.events[i];
			document.body.removeEventListener(eventName, this, true);
			document.body.removeEventListener(eventName, this, false);
		}
		ns.Windows.removeWindow(this);

		/* TODO: Remove other listeners to handle following memory leak in older browsers
		(From: http://stackoverflow.com/questions/12528049/if-a-dom-element-is-removed-are-its-listeners-also-removed-from-memory)
		Older browsers - specifically older versions of IE - are known to have memory leak issues
		due to event listeners keeping hold of references to the elements they were attached to.
		*/
		if (!this.windowEventsDisabled){
			this.onWindowEvent(ns.Window.CLOSE_EVENT);
		}
	};

	ns.Window.prototype.onWindowEvent = function(eventType) {
		// No default implementation
	};

	ns.Window.prototype.positionCentered = function (){
		var availRect = ns.Desktop.getAvailableRect();
		availRect.convertToLocalSpace(this.el.parentNode.getBoundingClientRect());
		var desktopCenter = availRect.getCenter();
		var x = Math.floor(desktopCenter.x - this.size.width/2);
		var y = Math.floor(desktopCenter.y - this.size.height/2);
		x = Math.max(0, x);
		y = Math.max(0, y);
		this.setPosition(x,y);
	};

	ns.Window.prototype.animateIn = function (){
		this.el.classList.add('pre-open');
		this.callMethodNameAfterDelay('addOpenAnim', 1);
	};

	ns.Window.prototype.addOpenAnim = function (){
		this.el.classList.add('open-anim');
		this.callMethodNameAfterDelay('onOpenAnimComplete', 110);
	};

	ns.Window.prototype.onOpenAnimComplete = function (){
		this.el.classList.remove('pre-open');
		this.el.classList.remove('open-anim');
	};

	ns.Window.prototype.displayTitle = function(str) {
		if (this.titleSpan){
			this.titleSpan.parentNode.style.maxWidth = '';
			this.titleSpan.innerHTML = str;
			var rect = this.titleSpan.getBoundingClientRect();
			this.titleSpan.parentNode.style.maxWidth = (rect.width + 36) + 'px';
			this.titleGlow.style.maxWidth = (rect.width) + 'px';
		}
	};

	ns.Window.prototype.setFrozen = function (bool) {
		// Currently called only when opening a child modal window
		if (this.frozen !== bool){
			if (bool){
				ns.Views.create('div', ['absolute-fill','frozen-cover'], this.el);
			} else {
				var cover = this.el.querySelector('.frozen-cover');
				cover.parentNode.removeChild(cover);
			}
			this.frozen = bool;
		}
	}; 

	ns.Window.prototype.prepareSimulatedResize = function(cursor) {
		this.availResizeRect = this.getAvailResizeRect();
		this.startDragEvent = {clientX: cursor.position.x, clientY: cursor.position.y}; 
		this.setBounds();
		this.origPos = this.position.copy();
		this.origSize = this.size.copy();
		var rect = this.el.getBoundingClientRect();
		this.dragOffset = new ns.Point(cursor.position.x - rect.left, cursor.position.y - rect.top);
	};

	ns.Window.prototype.adjustForToolbarDocking = function (adjustX, adjustY) {
		var x = this.position.x;
		var y = this.position.y;
		if (this.hasOwnProperty(ns.Window.TOOLBAR_DOCK_SAVED_X)){
			x = this[ns.Window.TOOLBAR_DOCK_SAVED_X];
			delete this[ns.Window.TOOLBAR_DOCK_SAVED_X];
		}
		if (this.hasOwnProperty(ns.Window.TOOLBAR_DOCK_SAVED_Y)){
			y = this[ns.Window.TOOLBAR_DOCK_SAVED_Y];
			delete this[ns.Window.TOOLBAR_DOCK_SAVED_Y];
		}
		if (adjustX !== 0){
			this[ns.Window.TOOLBAR_DOCK_SAVED_X] = x;
			x += adjustX;
		}
		if (adjustY !== 0){
			this[ns.Window.TOOLBAR_DOCK_SAVED_Y] = y;
			y += adjustY;
		}
		this.setPosition(x, y);
	};

	ns.Window.prototype.undoToolbarDockingAdjustment = function (adjustX, adjustY) {
		//console.log('undoToolbarDockingAdjustment');
		var x = this.position.x;
		var y = this.position.y;
		if (this.hasOwnProperty(ns.Window.TOOLBAR_DOCK_SAVED_X)){
			x = this[ns.Window.TOOLBAR_DOCK_SAVED_X];
			delete this[ns.Window.TOOLBAR_DOCK_SAVED_X];
		}
		if (this.hasOwnProperty(ns.Window.TOOLBAR_DOCK_SAVED_Y)){
			y = this[ns.Window.TOOLBAR_DOCK_SAVED_Y];
			delete this[ns.Window.TOOLBAR_DOCK_SAVED_Y];
		}
		this.setPosition(x, y);
	};

	ns.Window.prototype.deleteToolbarDockingSaveData = function(){
		//console.log('deleteToolbarDockingSaveData:');
		//console.log(this);
		delete this[ns.Window.TOOLBAR_DOCK_SAVED_X];
		delete this[ns.Window.TOOLBAR_DOCK_SAVED_W];
		delete this[ns.Window.TOOLBAR_DOCK_SAVED_Y];
		delete this[ns.Window.TOOLBAR_DOCK_SAVED_H];
	};

	ns.Window.prototype.createCustomMenuItem = function(name, menu, row) {
		ns.MenuCustomItems.create(name, menu, row);
	};

	// 	Overrides 	//////////////////////////////////////////////////////////////////////////////////////////////

	ns.Window.prototype.setSize = function (w, h) {
		ns.Window.parent.setSize.apply(this, arguments);
		if (!this.windowEventsDisabled){
			this.onWindowEvent(ns.Window.RESIZE_EVENT);
		}
	};

	ns.Window.prototype.destroy = function () {
		// TODO: seems to be called only by ns.B2App.logOut (in app.js)
		ns.Window.parent.destroy.apply(this);
		ns.Windows.removeWindow(this);
	};

	ns.Window.prototype.handleEvent = function (e) {
		if (this.frozen){
			if (this.associatedModal){
				if (e.type === 'mousedown'){
					this.associatedModal.activate();
				}
			}
			ns.suppressDefault(e);
			return;
		}

		switch(e.type) {

			//case 'mousedown':
			//console.log('Window.handleEvent: mousedown');
			// The 'onDown' method in the Draggable superclass is consuming the mousedown !!!
			//ns.Window.parent.handleEvent.apply(this, arguments);
			//break;

			case 'click':
			if (!this.moved){
				this.onClick(e);
			}
			break;

			case 'dblclick':
			if (e.target === this.getDragElement()){
				this.toggleMaximize();
			}
			break;

			default:
			ns.Window.parent.handleEvent.apply(this, arguments);
			break;
		}


		/*if (e.type === 'click'){
			if (!this.moved){
				this.onClick(e);
			}

		} else if (e.type === 'dblclick'){
			if (e.target === this.getDragElement()){
				this.toggleMaximize();
			}
		} else {
			ns.Window.parent.handleEvent.apply(this, arguments);
		}*/
	};

	ns.Window.prototype.onDown = function(e) {
		this.moved = false;
		this.activate();
		this.resizeType = null;
		if (e.target === this.getDragElement()){
			return this.downOnDragElement(e);
		} else if (this.resizers.indexOf(e.target) > -1){
			this.downOnResizer(e);
		}
	};

	ns.Window.prototype.getDragElement = function() {
		return this.el.querySelector('.' + ns.Window.DEFAULT_DRAG_ELEMENT_STYLE);
	};

	ns.Window.prototype.downOnDragElement = function(e) {
		if (!this.maximized){
			this.startDrag(e);
			this.setDragCursor();
			return ns.suppressDefault(e);
		}
		return true;
	};

	ns.Window.prototype.downOnResizer = function(e) {
		if (!this.maximized){
			this.startResize(e);
			this.origPos = this.position.copy();
			this.origSize = this.size.copy();
			this.startDrag(e);
		}
	};

	ns.Window.prototype.startDrag = function() {
		ns.Window.parent.startDrag.apply(this, arguments);
		this.availResizeRect = this.getAvailResizeRect();
		this.setDragMinMax();
	};

	ns.Window.prototype.getAvailResizeRect = function() {
		// This is overridden in LPWindow when there is a docked Toolbar
		var desktopRect = ns.Desktop.getRect();
		return new ns.Rect(0, 0, desktopRect.width, desktopRect.height);
	};

	ns.Window.prototype.setDragMinMax = function() {
		// No default implementation
	};

	ns.Window.prototype.onMove = function(e) {
		if (this.resizeType){
			this.resizeFn(e);
		} else {
			ns.Window.parent.onMove.apply(this, arguments);
		}
	};

	ns.Window.prototype.onUp = function() {
		ns.Window.parent.onUp.apply(this, arguments);
		if (this.resizeType){
			this.clearResizeCursor();
			if (ns.Window.resizeTip){
				ns.Window.resizeTip.hide();
			}

			if (!this.windowEventsDisabled){
				this.onWindowEvent(ns.Window.RESIZE_COMPLETE_EVENT);
			}
			this.resizeType = null;
		} else if (this.moved){
			this.onUpCheckMinY();
		}
	};

	ns.Window.prototype.onUpCheckMinY = function() {
		var minY = 0;
		/*if (ns.BloombergBar){
			if ( ns.BloombergBar.isDockedToTop() ){
				minY = ns.BloombergBar.DOCKED_HEIGHT;
			}
		}*/
		if (this.position.y < minY){
			this.setPosition(this.position.x, minY);
		}
	};

	ns.Window.prototype.setDragMinMax = function () {
		this.parentScaleX = 1;
		this.parentScaleY = 1;
		this.minX = 0 - Number.MAX_VALUE;
		this.maxX = Number.MAX_VALUE;
		this.minY = -30;  // No more than 30 pixels can be offscreen at screen top;  TODO: Make this a constant !!!
		var desktopRect = ns.Desktop.getAvailableRect();
		this.maxY = desktopRect.height - 20; // Minimum 20 pixels visible when partially offscreen at bottom; TODO: Make this a constant !!!
	};

	/*
	ns.Window.prototype.setBounds = function() {
		// TODO: Put the vertical constraint values into constants !!!
		// Default Window drag bounds don't restrict horizontal dragging, but guarantee minimum heights visible at screen's top or bottom 
		var availRect = (ns.Desktop) ? ns.Desktop.getRect(true) : new ns.Rect (0, 0, window.innerWidth, window.innerHeight);

		var rect = this.el.getBoundingClientRect();
		this.bounds = new ns.Rect(
			availRect.left - (this.startDragEvent.clientX - rect.left),
			availRect.top - 30, // No more than 30 pixels can be offscreen at screen top
			availRect.right + (rect.right - this.startDragEvent.clientX),
			availRect.bottom + rect.height - 20 // Minimum 20 pixels visible when partially offscreen at bottom
		);
		this.bounds.convertToLocalSpace(this.el.parentNode.getBoundingClientRect());
	};
	*/
	

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	// Object > View > Draggable > Window  > ChildModalWindow

	ns.ChildModalWindow = function (element, title, opener){
		ns.ChildModalWindow.parent.constructor.apply(this, [element, {noDragListener:true} ]);
		this.type = ns.ChildModalWindow.TYPE;
		this.title = title;
		this.opener = opener;
		this.opener.associatedModal = this;
		this.opener.setFrozen(true);

		var fragment = document.createDocumentFragment();
		this.bg = ns.Views.create('div', 'bg', fragment);
		var inner = ns.Views.create('div', 'win-inner', fragment);

		this.titleEl = ns.Views.create('div', 'title', inner);
		this.titleEl.innerHTML = title;

		ns.Views.create('div', ns.Window.DEFAULT_DRAG_ELEMENT_STYLE, inner);
		this.winCtrls = ns.Views.create('div', 'ctrls', fragment);
		this.closeButton = this.createButton( ['btn','win-close'], this.winCtrls);
		this.el.appendChild(fragment);
	};

	ns.ChildModalWindow.TYPE = 'child-modal';

	ns.extend(ns.ChildModalWindow, ns.Window);

	ns.ChildModalWindow.prototype.centerWithinOpener = function(){
		var openerRect = ns.Rect.create(this.opener.el.getBoundingClientRect());
		openerRect.convertToLocalSpace( ns.Desktop.getRect() );
		var openerCenter = openerRect.getCenter();
		var rect = this.el.getBoundingClientRect();
		this.setPosition(openerCenter.x - Math.round(rect.width/2), openerCenter.y - Math.round(rect.height/2));
		var dialogRect = this.el.getBoundingClientRect();
		var desktopRect = ns.Desktop.getAvailableRect();
		var deltaX = 0;
		var deltaY = 0;
		if (dialogRect.left < desktopRect.left){
			deltaX = desktopRect.left - dialogRect.left;
		} else if (dialogRect.right > desktopRect.right){
			deltaX = desktopRect.right - dialogRect.right;
		}
		if (dialogRect.top < desktopRect.top){
			deltaY = desktopRect.top - dialogRect.top;
		} else if (dialogRect.bottom > desktopRect.bottom){
			deltaY = desktopRect.bottom - dialogRect.bottom;
		}
		if (deltaX !== 0 || deltaY !== 0){
			this.setPosition( this.position.x + deltaX, this.position.y + deltaY );
		}
	};

	// Overrides

	ns.ChildModalWindow.prototype.activate = function(){
		ns.Windows.moveToFront(this.opener);
		ns.ChildModalWindow.parent.activate.apply(this);
	};

	ns.ChildModalWindow.prototype.close = function(){
		ns.ChildModalWindow.parent.close.apply(this);
		this.opener.associatedModal = null;
		this.opener.setFrozen(false);
		this.opener.activate();
	};

})();
