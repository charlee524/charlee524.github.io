(function(){

	// TODO: Feasibility study on generating realistic thumbnails using cloneNode

	// TODO: If a notification is showing and the user opens the taskbar 'hidden icons' tray, it is behind the notification !!!

	// BUG: If the thumbnail tray is open, you mouseout from the associated taskbar button onto the taskbar and then quickly onto the tray, the tray
	// will hide !!! <-- I think this is fixed now - test more before deleting this comment !!!

	// TODO: Tooltips for thumbs

	'use strict';

	window[window.globalNamespaceName] = window[window.globalNamespaceName] || {};
	var ns = window[window.globalNamespaceName];

	// Object > Desktop (Static, for access to DesktopView singleton)
	// Object > View > DesktopView  (Instantiate with Desktop.create() )

	if (!ns.Desktop){
		ns.Desktop = new ns.Object(); 
		ns.Desktop.STYLE = 'desktop';
		ns.Desktop.ELEMENT_QUERY = '.' + ns.Desktop.STYLE;
		ns.Desktop.instance = null;
		ns.Desktop.logEnabled = true;

		ns.Desktop.create = function (options){
			if (!this.instance){
				this.options = options;
				this.instance = new DesktopView();
				if (options){
					if (options.icons){
						var iconId, i;
						for (i=0; i<options.icons.length; i++){
							iconId = options.icons[i];
							switch (iconId){

								case 'recycle':
								this.addIcon(iconId, 'desktop-recycle', 'Contains the files and folders that you have deleted.');
								break;

								case 'bb':
								this.addIcon(iconId, 'desktop-bb', 'Location: WINTRV (C:\\blp\\Wintrv)');
								break;
							}
						}
					}
				}
			}
		};

		ns.Desktop.log = function (msg){
			if (this.logEnabled){
				if (this.instance){
					if (!this.instance.logger){
						this.instance.initLogger();
					}
					this.instance.logger.innerHTML += (msg + '<br>');
				}
			}
		};

		ns.Desktop.getRect = function (excludeTaskbar){
			var rect;
			if (this.instance){
				rect = ns.Rect.create( this.instance.el.getBoundingClientRect() );
				if (excludeTaskbar){
					if (ns.Taskbar.instance){
						rect.setBottom( ns.Taskbar.instance.el.getBoundingClientRect().top );
					}
				}
			}
			return rect;
		};

		ns.Desktop.getAvailableRect = function (){
			// Return the rect of the area not covered by taskbar or docked bar
			var rect;
			if (this.instance){
				rect = ns.Rect.create( this.instance.el.getBoundingClientRect() );
				if (ns.Taskbar.instance){
					rect.setBottom( ns.Taskbar.instance.el.getBoundingClientRect().top );
				}
				if (ns.LPToolbar && ns.B2App.prefs.LPToolbar.docking === ns.LPToolbar.DOCKING_DOCKED){
					switch (ns.LPToolbar.instance.attachToSide){

						case ns.Views.TOP:
						rect.setTop(ns.LPToolbar.HORIZONTAL_HEIGHT);
						break;

						case ns.Views.BOTTOM:
						rect.setBottom(rect.bottom - ns.LPToolbar.HORIZONTAL_HEIGHT);
						break;

						case ns.Views.LEFT:
						rect.setLeft(ns.LPToolbar.VERTICAL_WIDTH);
						break;

						case ns.Views.RIGHT:
						rect.setRight(rect.right - ns.LPToolbar.VERTICAL_WIDTH);
						break;
					}
				}
			}
			return rect;
		};

		ns.Desktop.addIcon = function (id, style, tooltip){
			var icon, iconTooltip;
			if (this.instance){
				icon = ns.Views.create('button', ['btn', style], this.instance.iconsDiv);
				this.instance.icons[id] = icon;
				if (tooltip){
					iconTooltip = new ns.Tooltip(icon, tooltip, {duration: 5000, style:'gradient-tooltip', fade:true, desktopFocus:true });
				}
			}
			return icon;
		};

		ns.Desktop.setIconsOffset = function (offsetX, offsetY){
			ns.Desktop.setIconsOffsetX(offsetX);
			ns.Desktop.setIconsOffsetY(offsetY);
		};

		ns.Desktop.setIconsOffsetX = function (offset){
			if (this.instance){
				this.instance.iconsDiv.style.left = (offset === 0) ? '' : offset + 'px';
			}
		};

		ns.Desktop.setIconsOffsetY = function (offset){
			if (this.instance){
				this.instance.iconsDiv.style.top = (offset === 0) ? '' : offset + 'px';
			}
		};

		ns.Desktop.getIconById = function (id) {
			var icon;
			if (this.instance){
				icon = this.instance.icons[id];
			}
			return icon;
		};

		ns.Desktop.deactivate = function (){
			if (this.instance){
				this.instance.deactivate();
			}
		};

	}

	var DesktopView = function(){
		var desktopElement = ns.Views.create('div',['absolute-fill',ns.Desktop.STYLE]);
		this.iconsDiv = ns.Views.create('div','absolute-fill', desktopElement);
		var selectionBoxDiv = ns.Views.create('div', 'desktop-selection', desktopElement);
		this.selectionBox = new ns.View(selectionBoxDiv);
		this.selectionBox.setSize(0,0);
		ns.Views.appContainer.appendChild(desktopElement);
		DesktopView.parent.constructor.apply(this, [desktopElement]);
		this.el.addEventListener('mousedown', this, false);
		this.icons = {};
		//document.addEventListener('keydown', this, false); // For testing only
	};

	ns.extend(DesktopView, ns.View);

	DesktopView.prototype.handleEvent = function (e) {
		switch(e.type) {
			case 'mousedown':
			var iconsToDeselect = this.getSelectedIcons();
			if (this.isIcon(e.target)){
				var pos = iconsToDeselect.indexOf(e.target);
				if (pos > -1){ // Already selected
					iconsToDeselect.splice(pos, 1);
				}
				e.target.classList.add('select');
			}
			for (var i=0; i<iconsToDeselect.length; i++){
				iconsToDeselect[i].classList.remove('select');
			}
			ns.Windows.deactivateAll();
			document.addEventListener('mouseup', this, false);
			document.addEventListener('mousemove', this, false);
			this.startSelectionBox(e);
			break;

			case 'mousemove':
			this.updateSelectionBox(e);
			//this.lastMoveEvent = e;
			break;

			case 'mouseup':
			document.removeEventListener('mouseup', this, false);
			document.removeEventListener('mousemove', this, false);
			this.endSelectionBox();
			//this.lastMoveEvent = e;
			break;

			//case 'mouseenter':
			//this.mouseOutsideDocument = false;
			//break;

			//case 'mouseleave':
			//this.mouseOutsideDocument = true;
			//break;

			// For testing purposes, to check document.activeElement after TAB keyDown
			//case 'keydown':
			//if (e.keyCode === ns.Keycodes.TAB){
				//this.callMethodNameAfterDelay('logActiveElement', 10);
			//}
			//break;

		}
	};

	DesktopView.prototype.startSelectionBox = function(e) {
		var rect = this.el.getBoundingClientRect();
		this.selectionBox.dragOffset = new ns.Point(rect.left, rect.top);
		this.selectionBox.setPosition(e.clientX - this.selectionBox.dragOffset.x, e.clientY - this.selectionBox.dragOffset.y);
		this.selectionBox.setSize(0,0);
		this.selectionBox.anchorPoint = this.selectionBox.position.copy();
		this.selectionBox.el.style.display = 'block';
	};

	DesktopView.prototype.updateSelectionBox = function(e) {
		var x = e.clientX - this.selectionBox.dragOffset.x, y = e.clientY - this.selectionBox.dragOffset.y;
		this.selectionBox.setPosition(
			Math.min(x, this.selectionBox.anchorPoint.x),
			Math.min(y, this.selectionBox.anchorPoint.y)
		)
		this.selectionBox.setSize(
			Math.max(x, this.selectionBox.anchorPoint.x) - this.selectionBox.position.x, 
			Math.max(y, this.selectionBox.anchorPoint.y) - this.selectionBox.position.y
		);
	};

	DesktopView.prototype.endSelectionBox = function(e) {
		this.selectionBox.el.style.display = '';
	};

	DesktopView.prototype.logActiveElement = function() {
		console.log( document.activeElement );
	};

	DesktopView.prototype.isIcon = function(element) {
		for (var p in this.icons){
			if (element === this.icons[p]){
				return true;
			}
		}
		return false;
	};

	DesktopView.prototype.getSelectedIcons = function() {
		var icon, p, arr = [];
		for (p in this.icons){
			if (this.icons.hasOwnProperty(p)) {
				icon = this.icons[p];
				if (icon.classList.contains('select')){
					arr.push(icon);
				}
			}
		}
		return arr;
	};

	DesktopView.prototype.deactivate = function() {
		var iconsToDeselect = this.getSelectedIcons();
		for (var i=0; i<iconsToDeselect.length; i++){
			iconsToDeselect[i].classList.remove('select');
		}
	};

	DesktopView.prototype.initLogger = function() {
		this.logger = ns.Views.create('div', ['desktop-logger'], this.el);

	};

	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	// Object > Taskbar (Static, for access to TaskbarClass singleton)
	// Object > View > TaskbarClass  (Instantiate with Taskbar.create() )

	if (!ns.Taskbar){
		ns.Taskbar = new ns.Object();

		ns.Taskbar.instance = null;

		ns.Taskbar.BB_BUTTON_ID = 'bb';
		ns.Taskbar.EXCEL_BUTTON_ID = 'excel';

		//ns.Taskbar.B2APP_BUTTON_ID = 'b2app'; // I hate this !!!!

		ns.Taskbar.getAppIdFromButtonId = function (buttonId) {
			return (buttonId === ns.Taskbar.BB_BUTTON_ID) ? ns.B2App.B2APP_ID : buttonId ;
		};

		ns.Taskbar.create = function () {
			if (!this.instance){
				this.instance = new TaskbarClass();
			}
		};

		ns.Taskbar.cancelButtonTimers = function () {
			var button, id;
			if (this.instance){
				for (id in this.instance.buttons){
					if (this.instance.buttons.hasOwnProperty(id)) {
						button = this.instance.buttons[id];
						button.cancelEnterTimer();
						button.cancelLeaveTimer();
					}
				}
			}
		};

		ns.Taskbar.addButton = function (id, style) {
			var button;
			if (this.instance){
				if (!this.instance.buttons[id]){
					button = new ns.TaskbarButton(this.instance, id, style);
					this.instance.buttons[id] = button;
				}
			}
			return button;
		};

		ns.Taskbar.removeButton = function (id) {
			if (this.instance){
				var button = this.instance.buttons[id];
				if (button){
					if (this.instance.thumbnailsOpener === button){
						this.instance.thumbnailsOpener = null;
					}
					button.destroy();
					delete this.instance.buttons[id];
				}
			}
		};

		ns.Taskbar.setButtonSelected = function (id, bool) {
			if (this.instance){
				this.instance.buttons[id].setSelected(bool);
			}
		};

		ns.Taskbar.onNewWindow = function (win) {
			if (this.instance){
				this.instance.addThumbIfTrayVisible(win);
			}
		};

		ns.Taskbar.onWindowContentChange = function (win) {
			if (this.instance){
				this.instance.updateThumbIfTrayVisible(win);
			}
		};

		ns.Taskbar.onWindowClose = function (win) {
			if (this.instance){
				this.instance.removeThumbIfTrayVisible(win.id);
			}
		};

		ns.Taskbar.getButtonById = function (id) {
			var button;
			if (this.instance){
				button = this.instance.buttons[id];
			}
			return button;
		};

	}

	var TaskbarClass = function () {
		this.buttons = {};

		var el = document.createElement('div');
		el.classList.add('taskbar');

		ns.Views.create('div', ['taskbar-bg'], el);

		var startGlow = ns.Views.create('div', ['start-glow'], el);
		this.trayTooltip = new ns.Tooltip(startGlow, 'Start', { duration: 5000, style:'gradient-tooltip', fade:true, cursorOffsetX:0, relativeY:-20 });

		var taskbarRight = ns.Views.create('div', ['taskbar-right'], el);
		this.timeDiv = ns.Views.create('div', ['time'], taskbarRight);
		this.dateDiv = ns.Views.create('div', ['date'], taskbarRight);

		this.trayButton = ns.Views.create('button', ['btn','taskbar-tray-btn'], el); 
		this.trayButton.addEventListener('click', this.onTrayButton.bind(this), false);
		this.trayTooltip = new ns.Tooltip(this.trayButton, 'Show hidden icons', { duration: 5000, style:'gradient-tooltip', fade:true, cursorOffsetX:0 });

		ns.Views.appContainer.appendChild(el);

		TaskbarClass.parent.constructor.apply(this, [el]);

		this.el.addEventListener('mousedown', this, false);

		this.createThumbnailsTray();

		this.showDateTime();

		var that = this;
		setInterval(function(){
			that.showDateTime();
		}, 60000);

	};

	ns.extend(TaskbarClass, ns.View);

	TaskbarClass.prototype.onTaskbarButtonEnter = function (taskbarButton) {
		if (this.areThumbnailsHidden()){
			var disableThumbnails = (ns.Desktop.options) ? ns.Desktop.options.disableThumbnails : false;
			if (!disableThumbnails){
				this.lastActiveTaskbarButtonEnteredId = taskbarButton.id;
				this.showThumbnails(true, taskbarButton.id);
			}
		} else {
			if (taskbarButton.id === this.lastActiveTaskbarButtonEnteredId){
				this.showThumbnails(false);
			} else {
				if (this.thumbnailsTray.classList.contains('list')){
					this.switchThumbnailsWithoutTransition(taskbarButton.id);
					return;
				}
				var newThumbCount = ns.Windows.getWindowsByAppId( ns.Taskbar.getAppIdFromButtonId(taskbarButton.id) ).length;
				var newPanelWidth = this.calculatePanelWidth(newThumbCount);
				if (newPanelWidth > ns.Desktop.getRect(true).width){
					this.switchThumbnailsWithoutTransition(taskbarButton.id);
					return;
				}

				// Transition between two non-list-style states for the tray
				
				var oldThumbCount = ns.Windows.getWindowsByAppId( ns.Taskbar.getAppIdFromButtonId(this.lastActiveTaskbarButtonEnteredId) ).length;
				var transitionDuration = 200;

				this.thumbnailsTray.classList.add('animate-left');
				for (var i=0; i<this.thumbs.length; i++){
					this.thumbs[i].prepareForAppSwitch();
				}

				var panel = this.getPanel();
				ns.Views.removeChildNodes(panel);
				var spacer = ns.Views.create('div', ['thumbnails-spacer'], panel );
				spacer.style.height = '163px';
				this.setSpacerWidth( spacer, oldThumbCount * 217 );
				var temp = ns.Views.create('div', ['thumbnails-temp'], spacer );
				for (i=0; i<this.thumbs.length; i++){
					this.thumbs[i].addToTemp(temp);
				}
				this.thumbs = [];
				temp.classList.add( (oldThumbCount > newThumbCount) ? 'shrink' :  'fadeout' ); 
				this.callMethodNameAfterDelay('removeTempThumbs', transitionDuration, temp);
				this.callMethodNameAfterDelay('setSpacerWidth', 0, spacer, newThumbCount * 217 );

				var oldPanelRect = panel.getBoundingClientRect();
				var newLeftBeforeMove = oldPanelRect.left - ((newPanelWidth - oldPanelRect.width) / 2);
				var div = document.createElement('div');
				div.style.position = 'absolute';
				div.style.width = (newPanelWidth - 44) + 'px';
				div.style.left = (newLeftBeforeMove + 22) + 'px';
				div.style.top = spacer.getBoundingClientRect().top + 'px';
				div.style.height = spacer.getBoundingClientRect().height + 'px';
				document.body.appendChild(div);

				this.drawThumbnails(taskbarButton.id, div);
				for (i=0; i<this.thumbs.length; i++){
					this.thumbs[i].savePosition();
				}
				this.removeTempThumbs(div);
				var newTempClass = (oldThumbCount < newThumbCount) ? 'thumbnails-new-temp-small' : 'thumbnails-new-temp' ;
				var newTemp = ns.Views.create('div', [newTempClass], spacer );

				for (i=0; i<this.thumbs.length; i++){
					this.thumbs[i].addToTemp(newTemp);
				}
				var fadeInClass = (oldThumbCount < newThumbCount) ? 'grow' : 'fadein' ;
				this.callMethodNameAfterDelay('fadeInTempThumbs', 0, newTemp, fadeInClass );

				this.thumbnailsTray.style.left = this.getPanelLeftFromWidth( newPanelWidth, taskbarButton.id) + 'px';
				this.lastActiveTaskbarButtonEnteredId = taskbarButton.id;
				this.callMethodNameAfterDelay('afterFadeInTempThumbs', transitionDuration );
			}
		}
	};

	TaskbarClass.prototype.switchThumbnailsWithoutTransition = function (taskbarButtonId) {
		this.lastActiveTaskbarButtonEnteredId = taskbarButtonId;
		this.thumbnailsTray.style.transition = 'none';
		this.thumbnailsTray.classList.remove('showing');
		this.callMethodNameAfterDelay('endSwitchThumbnailsWithoutTransition', 10, taskbarButtonId);
	};

	TaskbarClass.prototype.endSwitchThumbnailsWithoutTransition = function (taskbarButtonId) {
		this.thumbnailsTray.style.transition = '';
		this.showThumbnails(true, taskbarButtonId);
	};

	TaskbarClass.prototype.afterFadeInTempThumbs = function (temp) {
		var panel = this.getPanel();
		for (var i=0; i<this.thumbs.length; i++){
			this.thumbs[i].addToPanel(panel);
		}
		var spacer = this.thumbnailsTray.querySelector('.thumbnails-spacer');
		spacer.parentNode.removeChild(spacer);
	};

	TaskbarClass.prototype.getPanel = function () {
		return this.thumbnailsTray.querySelector('.thumbnails-panel');
	};

	TaskbarClass.prototype.removeTempThumbs = function (temp) {
		temp.parentNode.removeChild(temp);
	};

	TaskbarClass.prototype.fadeInTempThumbs = function (temp, fadeInClass) {
		temp.classList.add(fadeInClass);
	};

	TaskbarClass.prototype.setSpacerWidth = function (spacer, w) {
		spacer.style.width = w + 'px';
	};

	TaskbarClass.prototype.calculatePanelWidth = function (thumbCount) {
		return thumbCount * 217 + 44; // !!! This will have to do for now..these values are .thumbnail-win's width, and .thumbnails-panel's (padding + margin + border-width) x 2
	};

	TaskbarClass.prototype.showThumbnails = function (redrawThumbs, taskbarButtonId) {
		if (redrawThumbs){
			this.drawThumbnails(taskbarButtonId, this.getPanel() );
		}
		this.thumbnailsTray.style.width = '';
		this.thumbnailsTray.style.display = '';
		this.thumbnailsTray.classList.remove('animate-left'); // ??? Should we not do this if you're switching ?
		if (redrawThumbs){
			var width = this.thumbnailsTray.getBoundingClientRect().width;
			this.thumbnailsTray.style.left = this.getPanelLeftFromWidth(width, taskbarButtonId) + 'px';
		}
		this.thumbnailsTray.classList.add('showing');
	};

	TaskbarClass.prototype.areThumbnailsHidden = function () {
		var style = document.defaultView.getComputedStyle(this.thumbnailsTray);
		return (style.visibility === 'hidden');
	};

	TaskbarClass.prototype.hideThumbnails = function () {
		//console.log( 'hideThumbnails' );
		this.thumbnailsTray.classList.remove('showing');
		this.callMethodNameAfterDelay('afterTrayHidden', 220);
		this.showAllWindows();
	};

	TaskbarClass.prototype.afterTrayHidden = function () {
		/*
		if (!ns.Desktop.instance.mouseOutsideDocument){
			// Check if after thumbnails are hidden the cursor is over the associated taskbar button
			var btn = ns.Taskbar.getButtonById(this.lastActiveTaskbarButtonEnteredId);
			if (btn){
				var pt = new ns.Point(ns.Mouse.x, ns.Mouse.y);
				var rect = ns.Rect.create( btn.el.getBoundingClientRect() );
				if (rect.contains(pt)) {
					btn.startEnterTimer();
				}
			}
		}*/
	};

	TaskbarClass.prototype.createThumbnailsTray = function () {
		this.thumbs = [];
		this.thumbnailsTray = ns.Views.create('div', ['thumbnails-tray'], ns.Views.appContainer);
		ns.Views.create('div', ['thumbnails-panel'], this.thumbnailsTray);
		this.thumbnailsTray.addEventListener('mouseenter', this.onEnterThumbnails.bind(this), false);

		this.thumbnailsTray.addEventListener('mouseleave', this.onLeaveThumbnails.bind(this), false);  // RESTORE THIS !!!
	};

	TaskbarClass.prototype.onEnterThumbnails = function () {
		this.cancelThumbnailsLeaveTimer();
		for (var p in ns.Taskbar.instance.buttons){
			if (ns.Taskbar.instance.buttons.hasOwnProperty(p)) {
				ns.Taskbar.instance.buttons[p].cancelLeaveTimer();
			}
		}
	};

	TaskbarClass.prototype.onLeaveThumbnails = function () {
		this.startThumbnailsLeaveTimer();
	};

	TaskbarClass.prototype.onThumbnailsLeaveTimer = function () {
		this.hideThumbnails();
	};

	TaskbarClass.prototype.startThumbnailsLeaveTimer = function () {
		this.cancelThumbnailsLeaveTimer();
		this.thumbnailsLeaveTimerID = this.callMethodNameAfterDelay('onThumbnailsLeaveTimer', ns.TaskbarButton.LEAVE_TIMER_DURATION);
	};

	TaskbarClass.prototype.cancelThumbnailsLeaveTimer = function () {
		if (this.thumbnailsLeaveTimerID){
			window.clearTimeout(this.thumbnailsLeaveTimerID);
		}
		this.thumbnailsLeaveTimerID = null;
	};

	TaskbarClass.prototype.drawThumbnails = function (taskbarButtonId, parent) {
		ns.Views.removeChildNodes(parent);
		var win, i, windows = [], appWindows = ns.Windows.getWindowsByAppId( ns.Taskbar.getAppIdFromButtonId(taskbarButtonId) );
		var windows = [], len = appWindows.length;
		for (i=0; i<len; i++){
			win = appWindows[i];
			if (!win.noTaskbarThumbnail){
				windows.push(win);
			}
		}
		len = windows.length;
		if ( this.calculatePanelWidth(len) > ns.Desktop.getRect(true).width ){
			this.thumbnailsTray.classList.add('list');
		} else {
			this.thumbnailsTray.classList.remove('list');
		}
		this.thumbs = [];
		switch (taskbarButtonId){

			case ns.Taskbar.BB_BUTTON_ID:

			//if (ns.Windows.bloombergBar){
				//this.drawThumbnail(ns.Windows.bloombergBar, parent);
			//}

			windows.sort(function(a,b){
				if (a.id > b.id){
					return 1;
				}
				if (a.id < b.id){
					return -1;
				}
				return 0;
			});

			for (i=0; i<len; i++){
				win = windows[i];
				//if (win !== ns.Windows.bloombergBar ){
					this.drawThumbnail(win, parent);
				//}
			}
			break;

			case ns.Taskbar.EXCEL_BUTTON_ID:
			for (i=0; i<len; i++){
				this.drawThumbnail(windows[i], parent);
			}
			break;
		}
	};

	TaskbarClass.prototype.drawThumbnail = function (win, parent) {
		var thumb = new ns.TaskbarThumb(win, parent);
		this.thumbs.push(thumb);
		return thumb;
	};

	TaskbarClass.prototype.updateThumbIfTrayVisible = function (win) {
		if (!this.areThumbnailsHidden()){ 
			var thumb = this.getThumbById(win.id);
			if (thumb){
				thumb.setTitle(win);
				var imageBox = thumb.el.querySelector('.image-box');
				ns.Views.removeChildNodes(imageBox);
				win.appendTaskbarThumbnailImage(imageBox);
			}
		}
	};

	TaskbarClass.prototype.getAllWindows = function () {
		/*var windows = ns.Windows.windowList.concat();
		if (ns.Windows.bloombergBar){
			if (windows.indexOf(ns.Windows.bloombergBar) === -1){
				windows.unshift(ns.Windows.bloombergBar);
			}
		}
		return windows;*/
		return ns.Windows.windowList.concat();
	};

	TaskbarClass.prototype.onEnterThumb = function (thumb) {
		var id = thumb.associateWindowId;
		if (this.thumbnailsTray.classList.contains('showing')){
			var windows = this.getAllWindows();
			// Hide all windows except the one with this id
			for (var i=0; i<windows.length; i++){
				var win = windows[i];
				if (win.id !== id){
					win.el.style.visibility = 'hidden';
				} else {
					win.el.style.visibility = 'visible';
				}
			}
		}
	};

	TaskbarClass.prototype.onLeaveThumb = function (thumb) {
		this.showAllWindows();
		/*var id = thumb.associateWindowId;
		var windows = this.getAllWindows();
		// Show all windows
		for (var i=0; i<windows.length; i++){
			var win = windows[i];
			win.el.style.visibility = '';
		}*/
	};

	TaskbarClass.prototype.showAllWindows = function (thumb) {
		var windows = this.getAllWindows();
		// Show all windows
		for (var i=0; i<windows.length; i++){
			var win = windows[i];
			win.el.style.visibility = '';
		}
	};

	TaskbarClass.prototype.onClickThumb = function (thumb) {
		var id = thumb.associateWindowId;
		var win = ns.Windows.getWindowById(id);
		win.unminimize();
		var handled = false;
		/*if (win === ns.Windows.bloombergBar){
			if (ns.B2App.prefs.bloombergBar.autoHide){
				if (win.getAutohideState() === ns.BloombergBar.AUTOHIDE_HIDDEN_STATE){
					win.animateInFromHidden( {fromKeyCommand: true} );
					handled = true;
				}
			}
		}*/
		if (!handled){
			ns.Windows.moveToFront(win);
			win.activate();
		}
		this.thumbnailsTray.classList.remove('showing');
		this.thumbnailsTray.style.display = 'none'; // Hides the fadout animation
	};

	TaskbarClass.prototype.onThumbCloseClick = function (thumb) {
		var id = thumb.associateWindowId; // parseInt(thumb.getAttribute('data-id'), 10);
		var win = ns.Windows.getWindowById(id);
		win.onTaskbarThumbCloseClick();
	};

	TaskbarClass.prototype.getThumbById = function (id) {
		var i, thumb = null;
		for (i=0; i<this.thumbs.length; i++){
			thumb = this.thumbs[i];
			if (thumb.associateWindowId === id){
				return thumb;
			}
		}
		return thumb;
		//return this.thumbnailsTray.querySelector("[data-id='" + id + "']");
	};

	TaskbarClass.prototype.removeThumbIfTrayVisible = function (id) {
		// Called by 'onThumbCloseClick' and 'ns.Taskbar.onWindowClose' (which is called from 'ns.Windows.removeWindow')
		if (!this.areThumbnailsHidden() && ns.B2App.launched){
			var thumb = this.getThumbById(id);
			if (!thumb.el.classList.contains('collapse')){
				// If all windows have their visibility set to hidden except the one associated with this thumb, make them all visible again
				var peeking = true;
				for (var i=0; i<ns.Windows.windowList.length; i++){
					var win = ns.Windows.windowList[i];
					if ((win.id === id) === (win.el.style.visibility === 'hidden')){
						peeking = false;
						break;
					}
				}
				if (peeking){
					// this.onLeaveThumb(id);
					this.onLeaveThumb(thumb);
				}
				var thumbWidth = thumb.el.getBoundingClientRect().width;
				thumb.el.classList.add('collapse');
				this.callMethodNameAfterDelay('onThumbRemoved', 220, thumb);
				this.thumbnailsTray.classList.add('animate-left');
				this.thumbnailsTray.style.width = '';
				var width = this.thumbnailsTray.getBoundingClientRect().width - thumbWidth;
				this.thumbnailsTray.style.left = this.getPanelLeftFromWidth(width, this.lastActiveTaskbarButtonEnteredId) + 'px'; // NO !!! should be id corresponding to last thumbnails drawn
			}
		}
	};

	TaskbarClass.prototype.addThumbIfTrayVisible = function (win) {
		if (!this.areThumbnailsHidden()){ 
			if (win.active){
				for (var i=0; i<this.thumbs.length; i++){
					var otherThumb = this.thumbs[i];
					var activatedElement = otherThumb.el.querySelector('.activated');
					if (activatedElement){
						activatedElement.parentNode.removeChild(activatedElement);
					}
				}
			}
			var thumb = this.drawThumbnail(win); // By not passing a parent, the thumb is not yet added to the DOM
			this.callMethodNameAfterDelay('addThumb', 220, thumb);
			this.thumbnailsTray.classList.add('animate-left');
			var newWidth = this.thumbnailsTray.getBoundingClientRect().width + 217;
			this.thumbnailsTray.style.width = newWidth + 'px';
			this.thumbnailsTray.style.left = this.getPanelLeftFromWidth(newWidth, ns.Taskbar.BB_BUTTON_ID) + 'px'; // !!! This is OK for now since you cannot open more than one excel window, but needs work !!!
		}
	};

	TaskbarClass.prototype.addThumb = function (thumb) {
		var panel = this.getPanel(); // this.thumbnailsTray.querySelector('.thumbnails-panel');
		panel.appendChild(thumb.el);
	};

	TaskbarClass.prototype.getPanelLeftFromWidth = function (width, taskbarButtonId, noMinMax) {
		//console.log('taskbarButtonId: ' + taskbarButtonId);
		var taskbarButton = ns.Taskbar.getButtonById(taskbarButtonId);
		var buttonRect = ns.Rect.create(taskbarButton.el.getBoundingClientRect());
		buttonRect.convertToLocalSpace(this.el.parentNode.getBoundingClientRect());
		var left = Math.round(buttonRect.left + buttonRect.width / 2 - width / 2 );
		if (noMinMax){
			return left;
		}
		return Math.max(0, left );
	};

	TaskbarClass.prototype.onThumbRemoved = function (thumb) {
		thumb.el.parentNode.removeChild(thumb.el);
		this.thumbs.splice(this.thumbs.indexOf(thumb), 1);
		var pt = new ns.Point(ns.Mouse.x, ns.Mouse.y);
		var rect = ns.Rect.create( this.thumbnailsTray.getBoundingClientRect() );
		if (!rect.contains(pt)) {
			this.startThumbnailsLeaveTimer();
		}
	};

	TaskbarClass.prototype.showDateTime = function () {
		var d = new Date();
		this.timeDiv.innerHTML = ns.StringUtils.formatTime(d);
		this.dateDiv.innerHTML = ns.StringUtils.formatDate(d);
		//this.timeDiv.innerHTML = '3:16 PM';
		//this.dateDiv.innerHTML = '3/3/2015';
		//console.log('showDateTime');*/
	};

	TaskbarClass.prototype.handleEvent = function (e) {
		switch(e.type) {
			case 'mousedown':
			ns.Desktop.deactivate();
			ns.Windows.deactivateAll();
			break;
		}
	};

	TaskbarClass.prototype.onTrayButton = function (e) {
		e.target.classList.add('select');
		if (!this.tray){
			this.openTray();
		}
	};

	TaskbarClass.prototype.openTray = function () {
		var el = document.createElement('div');
		el.classList.add('win7');
		el.classList.add('active');
		el.classList.add('taskbar-tray');
		ns.Views.appContainer.appendChild(el);
		this.tray = new ns.TaskbarTray(el, this, '.taskbar-tray-btn');
	};

	TaskbarClass.prototype.taskbarTrayClosed = function () {
		this.tray = null;
		this.trayButton.classList.remove('select');
	};


	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	// Object > View > TaskbarTray

	ns.TaskbarTray = function (el, opener, openButtonSelector) {
		this.opener = opener;
		this.openButtonSelector = openButtonSelector;
		ns.TaskbarTray.parent.constructor.apply(this, [el]);
		var fragment = document.createDocumentFragment();

		var bg = ns.Views.create('div', ['absolute-fill', 'bg'], fragment);
		ns.Windows.createWin7BgElements(this, bg);

		var contentBoxOuter = ns.Views.create('div', ['content-box'], fragment);
		this.contentArea = ns.Views.create('div', ['absolute-fill','content-area'], contentBoxOuter);

		var options = ns.Views.create('button', ['btn', 'taskbar-tray-options'], this.contentArea);
		ns.Views.create('div', ['taskbar-tray-options-icon'], options);
		options.addEventListener('click', this.showPrototypeOptions.bind(this), false);
		this.optionsTooltip = new ns.Tooltip(options, 'Prototype Options', {style:'gradient-tooltip',fade:true});

		this.el.appendChild(fragment);
		document.body.addEventListener('mousedown', this, true);

		this.scale = ns.Window.DEFAULT_SCALE;
	};

	ns.extend(ns.TaskbarTray, ns.View);

	ns.TaskbarTray.prototype.showPrototypeOptions = function (e) {
		// No default implementation
	};

	ns.TaskbarTray.prototype.handleEvent = function (e) {
		switch(e.type) {
			case 'mousedown':
			if (this.el.contains(e.target)){
				//
			} else if (e.target === this.opener.el.querySelector(this.openButtonSelector)){
				//console.log('opener button click');
			} else {
				this.el.parentNode.removeChild(this.el);
				document.body.removeEventListener('mousedown', this, true);
				this.opener.taskbarTrayClosed();
				this.opener = null;
			}
			break;
		}
	};

	ns.TaskbarTray.prototype.selectMenuItem = function (id) {
		ns.Menus.closeAll();
	};

	ns.TaskbarTray.prototype.checkMenuItem = function (id, menu) {
		// No default implementation
	};

	ns.TaskbarTray.prototype.isNotUncheckable = function (id) {
		return false;
	};

	ns.TaskbarTray.prototype.getCheckboxValue = function (id) {
		return ns.B2App.prototypeOptionValues[id];
	};

	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	// Object > View > TaskbarButton

	ns.TaskbarButton = function (taskbar, id, style) {
		this.id = id;
		var btnEl = ns.Views.create('div', ['taskbar-btn', style]);
		ns.Views.create('div', ['absolute-fill', 'bg'], btnEl);
		ns.Views.create('div', ['absolute-fill', 'gradient'], btnEl);
		var hotTrackBox = ns.Views.create('div', ['hot-track-box'], btnEl);
		this.hotTrack = ns.Views.create('div', ['hot-track'], hotTrackBox);

		// TODO: The right of this box can change depending on the number of open windows in the app
		var iconBox = ns.Views.create('div', ['icon-box'], btnEl);

		ns.Views.create('div', ['icon'], iconBox);
		taskbar.el.appendChild(btnEl);
		ns.TaskbarButton.parent.constructor.apply(this, [btnEl]);
		this.el.addEventListener('mouseenter', this, false);

		this.el.addEventListener('mouseleave', this, false);

		this.el.addEventListener('mousemove', this, false);
	};

	ns.TaskbarButton.ENTER_TIMER_DURATION = 600;
	ns.TaskbarButton.LEAVE_TIMER_DURATION = 600;

	ns.extend(ns.TaskbarButton, ns.View);

	ns.TaskbarButton.prototype.onClick = function(e){
		this.setSelected(true);
		this.hotTrack.style.opacity = 1;
	};

	ns.TaskbarButton.prototype.handleEvent = function(e){
		switch (e.type){

			case 'mouseenter':
			if (this.selected){
				this.hotTrack.style.opacity = 1;
				this.startEnterTimer();
				ns.Taskbar.instance.cancelThumbnailsLeaveTimer();
			}
			break;

			case 'mousemove':
			if (this.selected){
				this.hotTrack.style.left = (e.clientX - this.el.getBoundingClientRect().left) + 'px';
			}
			break;

			case 'mouseleave':
			if (this.selected){
				this.hotTrack.style.opacity = 0;
				this.startLeaveTimer();
			}
			break;
		}
	};		

	ns.TaskbarButton.prototype.setSelected = function(bool){
		if (bool){
			this.el.classList.add('select');
		} else {
			this.el.classList.remove('select');
		}
		this.selected = bool;
		this.el.querySelector('.bg').style.opacity = '';
	};

	ns.TaskbarButton.prototype.fadeBGAndDeselect = function(){
		this.el.querySelector('.bg').style.opacity = 0;
		this.callMethodNameAfterDelay('setSelected', 220, false);
	};

	ns.TaskbarButton.prototype.startEnterTimer = function(){
		ns.Taskbar.cancelButtonTimers();
		this.enterTimerID = this.callMethodNameAfterDelay('onEnterTimer', ns.TaskbarButton.ENTER_TIMER_DURATION);
	};

	ns.TaskbarButton.prototype.onEnterTimer = function(){
		this.enterTimerID = null;
		ns.Taskbar.instance.onTaskbarButtonEnter(this);
	};

	ns.TaskbarButton.prototype.cancelEnterTimer = function(){
		if (this.enterTimerID){
			window.clearTimeout(this.enterTimerID);
		}
		this.enterTimerID = null;
	};

	ns.TaskbarButton.prototype.startLeaveTimer = function(){
		ns.Taskbar.cancelButtonTimers();
		this.leaveTimerID = this.callMethodNameAfterDelay('onLeaveTimer', ns.TaskbarButton.LEAVE_TIMER_DURATION);
	};

	ns.TaskbarButton.prototype.onLeaveTimer = function(){
		this.leaveTimerID = null;
		if (this.selected){
			ns.Taskbar.instance.hideThumbnails(this);
		}
	};

	ns.TaskbarButton.prototype.cancelLeaveTimer = function(){
		if (this.leaveTimerID){
			window.clearTimeout(this.leaveTimerID);
		}
		this.leaveTimerID = null;
	};

	ns.TaskbarButton.prototype.destroy = function(){
		this.cancelEnterTimer();
		this.cancelLeaveTimer();
		this.el.removeEventListener('mouseenter', this, false);
		this.el.removeEventListener('mouseleave', this, false);
		this.el.removeEventListener('mousemove', this, false);
		ns.TaskbarButton.parent.destroy.apply(this);
	};

	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


	// Object > View > TaskbarThumb

	ns.TaskbarThumb = function (win, parent) {

		this.associateWindowId = win.id;

		var el = ns.Views.create('div', ['thumbnail-win'], parent);

		if (win.active){
			 ns.Views.create('div', ['activated'], el);
		}
		ns.Views.create('div', ['bg'], el);
		var topLine = ns.Views.create('div', ['top-line'], el);

		win.appendTaskbarThumbnailIcon(topLine);

		ns.Views.create('div', ['title'], topLine);

		this.closeButton = ns.Views.create('div', ['close-btn'], topLine);
		this.closeButton.addEventListener('click', this, false);

		var imageBox = ns.Views.create('div', ['image-box'], el);

		win.appendTaskbarThumbnailImage(imageBox);

		el.addEventListener('click', this, false);
		el.addEventListener('mouseenter', this, false);
		el.addEventListener('mouseleave', this, false);

		ns.TaskbarThumb.parent.constructor.apply(this, [el]);

		this.setTitle(win);
	};

	ns.extend(ns.TaskbarThumb, ns.View);

	ns.TaskbarThumb.prototype.handleEvent = function(e){
		switch (e.type){

			case 'click':
			if (e.currentTarget === this.closeButton){
				ns.Taskbar.instance.onThumbCloseClick(this);
				ns.suppressDefault(e);
			} else if (e.currentTarget === this.el){
				ns.Taskbar.instance.onClickThumb(this);
			}
			break;

			case 'mouseenter':
			ns.Taskbar.instance.onEnterThumb(this);
			break;

			case 'mouseleave':
			ns.Taskbar.instance.onLeaveThumb(this);
			break;
		}
	};

	ns.TaskbarThumb.prototype.setTitle = function (win) {
		var title = win.getTitle();
		if (win.type === ns.BloombergPanel.TYPE || win.type === ns.Popout.TYPE){
			var subtitle = win.getSubtitle();
			if (subtitle){
				title += ' - ' + subtitle;
			}
			if (title !== 'Bloomberg'){
				title += ' - Bloomberg';
			}
		}
		this.el.querySelector('.title').innerHTML = title;
	};

	ns.TaskbarThumb.prototype.savePosition = function () {
		var rect = this.el.getBoundingClientRect();
		this.previousPosition = new ns.Point( rect.left, rect.top );
	};

	ns.TaskbarThumb.prototype.prepareForAppSwitch = function () {
		this.savePosition();
		this.el.removeEventListener('click', this, false);
		this.el.removeEventListener('mouseenter', this, false);
		this.el.removeEventListener('mouseleave', this, false);
		this.closeButton.removeEventListener('click', this, false);
		var activated = this.el.querySelector('.activated');
		if (activated){
			activated.parentNode.removeChild(activated);
		}
		var topLine = this.el.querySelector('.top-line');
		topLine.parentNode.removeChild(topLine);
	};

	ns.TaskbarThumb.prototype.addToTemp = function (temp) {
		var tempRect = temp.getBoundingClientRect();
		this.el.style.position = 'absolute';
		this.el.style.left = (this.previousPosition.x - tempRect.left) + 'px';
		this.el.style.top = (this.previousPosition.y - tempRect.top) + 'px';
		temp.appendChild(this.el);
	};

	ns.TaskbarThumb.prototype.addToPanel = function (panel) {
		this.el.style.position = '';
		this.el.style.left = '';
		this.el.style.top = '';
		panel.appendChild(this.el);
	};

})();
