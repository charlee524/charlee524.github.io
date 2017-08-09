(function(){

	'use strict';

	// TODO: When classic sizing is on, resizing with the shift key down should update scroll bars !!!

	window[window.globalNamespaceName] = window[window.globalNamespaceName] || {};
	var ns = window[window.globalNamespaceName];

	/*
	The general difference between panel and launchpad functions, as described by Eddie, is that 
	launchpad functions size differently and let you hide/show a control area.
	In the prototype framework, another difference is that launchpad functions can be transferred  
	from an LPWindow to an LPLayoutPane by drag-dropping an LPWindow on an LPContainer.

	Normally this is subclassed, but it's directly instantiated in BloombergPanel.createContentGroup
	(for dummy content and the ANR bitmap) where it is assigned values for 'command' and optionally 'argument'.

	Subclasses of this are:
	Login (in login.js)
	Splash (in login.js)
	WelcomeContent (in welcome.js)
	LPChartContent (in lp-chart.js)
	LPMonitorContent (in lp-chart.js)
	LPGenericContent (in lp-generic.js)
	*/

	/*
	TODO:
	Set up a generic flow along the lines of:
	if (B1){
		// B1 Red Menu Bar
	} else if LP {
		// Menutron (Eventually some functions will become the same as B2 UX)
	} else {
		// B2 Control Region
	}
	*/

	// Object > View > BBContentView

	ns.BBContentView = function ( initData ){
		initData = initData ? initData : {};
		this.title = (initData.hasOwnProperty('title')) ? initData.title : 'Default title' ;
		this.subtitle = (initData.hasOwnProperty('subtitle')) ? initData.subtitle : '' ;
		if (initData.hasOwnProperty('owner')){
			this.owner = initData.owner;
		}
		if (initData.hasOwnProperty('groupId')){
			this.groupId = initData.groupId;
		}
		var el = this.createMainElement();
		ns.BBContentView.parent.constructor.apply(this, [el]);
		this.id = ns.BBContentView.nextUniqueId;
		ns.BBContentView.nextUniqueId++;
	};

	ns.BBContentView.nextUniqueId = 1;
	ns.BBContentView.TITLE_BAR_COMBO_BOX_SELECT = 'titleBarComboBoxSelectedId';

	// Static methods

	ns.BBContentView.copyValuesFromWindowInitToContentInit = function (contentInitData, sourceData, initialKeyValues) {
		// Called by an LP window's constructor to pass init values to its content's constructor
		for (var p in initialKeyValues){
			if (initialKeyValues.hasOwnProperty(p)) {
				if (sourceData.hasOwnProperty(p)){
					contentInitData[p] = sourceData[p];
				}
			}
		}
	};

	ns.BBContentView.getContentById = function (id) {
		var win, i, len = ns.Windows.windowList.length;
		var view, ii, views, viewsLen;
		for (i=0; i<len; i++){
			win = ns.Windows.windowList[i];
			if (ns.LPContainer.prototype.isPrototypeOf(win)){
				views = win.getContentViews();
				viewsLen = views.length;
				for (ii=0; ii<viewsLen; ii++){
					view = views[ii];
					if (view.id === id){
						return view;
					}
				}
			} else if (win.content){
				if (win.content.id === id){
					return win.content;
				}
			}
		}
		return null;
	};

	ns.BBContentView.getTypeOfContainingWindow = function(owner) {
		// Currently, possible types are: BloombergPanel, B1Window, LPWindow, and LPContainer
		var type;
		var containingWindow = this.getContainingWindow();
		if (containingWindow){
			if (ns.BloombergPanel.prototype.isPrototypeOf(containingWindow)){
				type = ns.BloombergPanel.TYPE;
			} else if (ns.B1Window.prototype.isPrototypeOf(containingWindow)){
				type = ns.B1Window.TYPE;
			} else if (ns.LPWindow.prototype.isPrototypeOf(containingWindow)){
				type = ns.LPWindow.TYPE;
			} else if (ns.LPContainer.prototype.isPrototypeOf(containingWindow)){
				type = ns.LPContainer.TYPE;
			}
		}
		return type;
	};

	// End static methods

	ns.extend(ns.BBContentView, ns.View);

	// Instance methods

	ns.BBContentView.prototype.onDOMReady = function() {
		// For override; called from BloombergPanel.showContent
	};

	ns.BBContentView.prototype.isDOMReady = function () {
		return (document.body.contains( this.el ));
	};

	ns.BBContentView.prototype.defocus = function () {
		// For override; called from BloombergPanel.defocusContent when command line gets focus
		//console.log('BBContentView.defocus');
	};

	ns.BBContentView.prototype.addBackgroundImage = function(path) {
		var fragment = document.createDocumentFragment();
		var fill = ns.Views.create( 'div', 'absolute-fill', fragment );
		var img = ns.Views.createImage( path, [], this );
		fill.appendChild(img);
		this.el.appendChild(fragment);
		return fill;
	};
 
	ns.BBContentView.prototype.setClassicSizingEnabled = function(bool) {
		if (bool){
			this.el.style.transformOrigin = 'left top';
			this.el.style.right = 'auto';
			this.el.style.bottom = 'auto';
			this.el.style.width = this.owner.unscaledWidth + 'px';
			this.el.style.height = this.owner.unscaledHeight + 'px';
		} else {
			this.el.style.transform = '';
			this.el.style.transformOrigin = '';
			this.el.style.right = '';
			this.el.style.bottom = '';
			this.el.style.width = '';
			this.el.style.height = '';
		}
	};
    /* BICO */  
    ns.BBContentView.prototype.addAnchor = function (){
    	let anchorDiv = document.createElement("div");
    	anchorDiv.setAttribute("class","b1-bico-ancor");
    	return anchorDiv;
    }
 /*     End of BICO */
	ns.BBContentView.prototype.updateClassicSizing = function() {
		if (this.el.parentNode){
			var rect = this.el.parentNode.getBoundingClientRect();
			var scaleX = rect.width / this.owner.unscaledWidth;
			var scaleY = rect.height / this.owner.unscaledHeight;
			this.el.style.transform = 'scale(' + scaleX + ',' + scaleY + ')';
		}
	};

	ns.BBContentView.prototype.copyValuesFromInitData = function (initData, initialKeyValues) {
		// Usually called from inside a content view's constructor; copies properties and values from init data to the content instance
		for (var p in initialKeyValues){
			if (initialKeyValues.hasOwnProperty(p)) {
				this[p] = (initData.hasOwnProperty(p)) ? initData[p] : initialKeyValues[p] ;
			}
		}
	};

	ns.BBContentView.prototype.getOptionsForConvertToWindow = function (initialKeyValues) {
		var options = {};
		if (this.title){
			options.title = this.title;
		}
		if (this.owner.titleBarComboBox){
			options[ns.BBContentView.TITLE_BAR_COMBO_BOX_SELECT] = this.owner.titleBarComboBox.selectedId;
		}
		if (this.groupId){
			options.groupId = this.groupId;
		}
		if (this.owner.controlsTray){
			options.controlsTray = true;
		}
		if (initialKeyValues){
			for (var p in initialKeyValues){
				if (initialKeyValues.hasOwnProperty(p)) {
					options[p] = this[p] ;
				}
			}
		}
		return options;
	};

	ns.BBContentView.prototype.createThumbnailImage = function () {
		// When content is in a BloombergPanel or Popout, this method is called from its appendTaskbarThumbnailImage
		var thumb = ns.Views.create('div', 'cmd-text');
		thumb.innerHTML = this.title;
		return thumb;
	};

	ns.BBContentView.prototype.popout = function () {
		this.owner.showContentByCommand('WELC');
		var win = new ns.Popout(this.title, this.subtitle);
		var fragment = document.createDocumentFragment();
		var childNodes = Array.prototype.slice.call(this.main.childNodes);
		var i, len = childNodes.length;
		for (i=0; i<len; i++){
			fragment.appendChild( childNodes[i] );
		}
		win.contentArea.appendChild(fragment);
		ns.Windows.addWindow(win);
		win.setPosition( this.owner.position.x + 25, this.owner.position.y + 25 );
		this.owner = win;
		win.contentView = this;
		win.activate();
		win.onWindowEvent(ns.Window.RESIZE_EVENT);
		ns.Taskbar.onNewWindow(win);
	};

	ns.BBContentView.prototype.handleEvent = function (e) {
		switch (e.type) {

			case 'click':
			switch (e.currentTarget){

				case this.popoutButton:
				if (ns.BloombergPanel.prototype.isPrototypeOf(this.owner)){
					this.popout();
				}
				break;
			}
			break;
		}
	};

	ns.BBContentView.prototype.isOKToClose = function (requester) {
		// In this default implementation we just let the requester know we are OK with being closed.
		// In rare cases (e.g. IB) a subclass's override will open a dialog and return false.
		// console.log( 'BBContentView.isOKToClose' );
		return true;
	};

	ns.BBContentView.prototype.convertToLPWindow = function(){ // Intended for override
		/*
		Called from LPLayoutPaneInnerView when you drag a pane out of an LPContainer.
		When implementing an override of this method, remember that this content instance is going to be discarded,
		so if it has set up any any event listeners they must be removed.
		*/
		var options = this.getOptionsForConvertToWindow();
		delete this.owner; // Important - all overrides of this method should also do this !!!
		this.destroy();
		return new ns.LPGeneric( options );
	};

	ns.BBContentView.prototype.onGroupButtonClick = function (btn){
		// Overridden in LPNews and LPMonitor
		// console.log( 'BBContentView.onGroupButtonClick' );
		btn.classList.add('active');
		var def;
		if (ns.LPWindow.useFirstTimeGroupMenu()){
			def = ['custom|groupMenuIntroVersion'];
		} else {
			ns.LPWindow.dismissAllCreateGroupInstructions();
			var optionIcon = (ns.LPWindow.GROUP_MENU_RADIO_STYLE) ? 'radio' : 'checkmark' ;
			def = []; //  this.createBaseGroupMenuDef();
			var groupId, i, groupIds = [];
			for (groupId in ns.LPGroups.lut){
				if (ns.LPGroups.lut.hasOwnProperty(groupId)) {
					groupIds.push(groupId);
				}
			}
			if (groupIds.length > 0){
				for (i=0; i<groupIds.length; i++){
					groupId = groupIds[i];
					def.push(optionIcon + '|' + this.createGroupMenuItemHTML(groupId) + '|group:' + groupId );
				}
				def.push(optionIcon + '|No Group|group:none' );
				def.push('Divider');
			}
			def.push('|Create New Group|createNewGroup');
			def.push('Divider');
			def.push('|Group Manager|openGroupManager');
		}
		ns.Menus.openAtElement('groupMenu', def, this, btn);
	};

	ns.BBContentView.prototype.openFirstTimeGroupMenu = function (btn) {
		var def = ['custom|groupMenuIntroVersion'];
		ns.Menus.openAtElement('groupMenu', def, this, btn);
	};

	ns.BBContentView.prototype.openGroupMenu = function () { // DEPRECATED
		console.log('BBContentView.openGroupMenu');
	};

	ns.BBContentView.prototype.getContainingWindow = function(){
		var containingWindow;
		if (this.owner){
			if (ns.LPLayoutPaneInnerView.prototype.isPrototypeOf(this.owner)){
				var rootLayout = this.owner.pane.parentLayout.getRootLayout();
				containingWindow = rootLayout.owner;
			} else {
				containingWindow = this.owner;
			}
		}
		return containingWindow;
	};

	ns.BBContentView.prototype.groupManagerMoveToGroup = function (groupId) {
		var changeData = this.setGroup(groupId);

		console.log( changeData );


		ns.LPGroups.lut[changeData.oldGroupId].onUngroup();
	};

	ns.BBContentView.prototype.setGroup = function (arg) {
		// console.log( 'BBContentView.setGroup' );
		var changeData = {oldGroupId: this.groupId};
		if (arg === 'none'){
			var leavingGroup = (this.groupId) ? this.groupId : null ;
			delete this.groupId;
			if (leavingGroup){
				ns.LPGroups.lut[leavingGroup].onUngroup();
			}
			ns.LPWindow.updateGroupButtonTooltip(this.owner.groupButtonTooltip, false);
		} else {
			this.groupId = arg;
			ns.LPGroups.lut[ this.groupId ].showAnimatedGroupHilite();
			ns.LPWindow.updateGroupButtonTooltip(this.owner.groupButtonTooltip, true);
		}
		this.refreshGroupButton(this.owner.groupButton);

		changeData.newGroupId = this.groupId;
		return changeData;
	};

	ns.BBContentView.prototype.getGroupIds = function () {
		return (this.groupId) ? [this.groupId] : [];
	};

	ns.BBContentView.prototype.onGroupDeleted = function (groupId) {
		if (this.groupId === groupId){
			delete this.groupId;
			this.refreshGroupButton(this.owner.groupButton);
			ns.LPWindow.updateGroupButtonTooltip(this.owner.groupButtonTooltip, false);
		}
	};

	ns.BBContentView.prototype.getInitialGroupIdForManager = function () {
		return (this.groupId) ? this.groupId : null ;
	};

	ns.BBContentView.prototype.isGrouped = function () {
		return (this.groupId) ? true : false;
	};

	ns.BBContentView.prototype.isInGroup = function (groupId) {
		return (this.groupId === groupId);
	};

	ns.BBContentView.prototype.onContainingTabSelected = function() {
		// No default implementation
	};

	ns.BBContentView.prototype.onGroupSecuritySelected = function (group) {
		// No default implementation
	};

	ns.BBContentView.prototype.onGroupMonitorSelected = function (group) {
		// No default implementation
	};

	ns.BBContentView.prototype.getGroupManagerName = function () {
		return 'Generic Component'; // No default implementation
	};

	ns.BBContentView.prototype.createNewGroup = function () {
		// Currently, this is never called because it is overridden by all three of the content types being tested (Monitor, Chart, and News)
		// console.log('BBContentView.createNewGroup');
		var group = ns.LPGroups.createNewGroup();
		this.groupId = group.key;
		this.refreshGroupButton(this.owner.groupButton);
		this.onCreatedNewGroup(group);
	};

	ns.BBContentView.prototype.refreshGroupButton = function (btn) {
		ns.Views.removeChildNodes( btn );
		if (this.groupId){
			btn.classList.add('grouped');
			var group = ns.LPGroups.lut[ this.groupId ];
			ns.Views.create('div', 'group-color-' + group.colorCodeIndex, btn).innerHTML = this.groupId ;
		} else {
			btn.classList.remove('grouped');
		}
	};

	ns.BBContentView.prototype.onCreatedNewGroup = function (group) {
		ns.LPWindow.updateGroupButtonTooltip(this.owner.groupButtonTooltip, true);
		group.showAnimatedGroupHilite();
		//var showInstructions = (ns.B2App.prototypeOptionValues) ? ns.B2App.prototypeOptionValues[ns.PrototypeOptions.GROUP_CREATE_INFO] : false ;
		var showInstructions = true ;
		if (showInstructions){
			if (ns.LPGroups.firstTimeGroupCreate){
				ns.LPWindow.showCreateGroupInstructions(this.owner);
				ns.LPGroups.firstTimeGroupCreate = false;
			}
		}
		if (ns.Windows.groupManagerWindow){
			ns.Windows.groupManagerWindow.onNewGroupCreated();
		}
	};

	ns.BBContentView.prototype.destroy = function () {
		//console.log( 'BBContentView.destroy'  );
		//console.log( this );
		var group, i, groupIds = this.getGroupIds();
		if (groupIds.length > 0){
			this.ungroupOnWindowClose();
			for (i=0; i<groupIds.length; i++){
				group = ns.LPGroups.lut[ groupIds[i] ];
				group.onUngroup();
			}
		}
		ns.BBContentView.parent.destroy.apply(this, arguments);
	};

	ns.BBContentView.prototype.ungroupOnWindowClose = function () {
		console.log('BBContentView.ungroupOnWindowClose');
		delete this.groupId;
	};

	ns.BBContentView.prototype.onComboBoxSelect = function (comboBox, selectedItemData) {
		//console.log(  'BBContentView.onComboBoxSelect' );
		switch (comboBox.id){
			case ns.LPWindow.TITLE_BAR_COMBO_BOX_ID:
			this.onTitleBarComboBoxSelect(selectedItemData, comboBox);
			break;
		}
	};

	ns.BBContentView.prototype.onTitleBarComboBoxSelect = function (itemData) {
		// No default implementation
	};

	ns.BBContentView.prototype.getRadioValue = function (id) {
		//console.log('BBContentView.getRadioValue');
		//console.log(id);
		var bool = false;
		if (id.indexOf('group') === 0){
			var arr = id.split(':');
			var group = arr[1];
			if (group === 'none'){
				bool = !(this.isGrouped());
			} else {
				bool = this.isInGroup(group);
			}
		//} else if (id === 'alwaysOnTop'){
			//return this.alwaysOnTop; // TODO: get this from 'owner'
		}
		return bool;
	};

	ns.BBContentView.prototype.getCheckboxValue = function (id) {


		console.log('BBContentView.getCheckboxValue: ' + id );

		var bool = false;
		switch (id){
			case 'showControls':
			bool = (this.owner.controlsTray === undefined);
			break;
		}
		return bool;
	};


	ns.BBContentView.prototype.selectMenuItem = function (id) {
		//console.log('BBContentView.selectMenuItem: ' + id);

		//console.log('LPWindow selectMenuItem');
		if (id.indexOf('group') === 0){
			var arr = id.split(':');
			var groupArg = arr[1];
			if (ns.LPWindow.TOGGLE_OFF_GROUP && this.isInGroup(groupArg)){
				groupArg = 'none';
			}
			var changeData = this.setGroup(groupArg);
			if (ns.Windows.groupManagerWindow){
				ns.Windows.groupManagerWindow.onWindowChangedGroup(changeData);
			}
		} else {
			switch (id){

				case 'alwaysOnTop':
				ns.Windows.toggleAlwaysOnTop(this);
				break;

				case 'createNewGroup':
				this.createNewGroup();
				break;

				case 'openGroupManager':
				ns.Windows.openGroupManager( this.getInitialGroupIdForManager() );
				break;
			}
		}
	};

	ns.BBContentView.prototype.refreshGroupButton = function (btn) {
		ns.Views.removeChildNodes( btn );
		if (this.groupId){
			btn.classList.add('grouped');
			var group = ns.LPGroups.lut[ this.groupId ];
			ns.Views.create('div', 'group-color-' + group.colorCodeIndex, btn).innerHTML = this.groupId ;
		} else {
			btn.classList.remove('grouped');
		}
	};

	ns.BBContentView.prototype.onLPOptionsButtonClick = function(btn){
		// If the content is in a pane in an LPContainer, this is called from LPLayoutPaneInnerView.handleEvent
		// Otherwise it is called from LPWindow.onClick
		this.openOptionsMenu(btn);
		if (this.controlsTray){
			this.controlsTray.hide();
		}
	};

	ns.BBContentView.prototype.onLPTabGroupEnter = function () {
		console.log('BBContentView.onLPTabGroupEnter');
	};

	ns.BBContentView.prototype.hasControlStrip = function () {
		var optionsCell = this.owner.optionsRow.querySelector('.cell');
		if (optionsCell){
			if (!optionsCell.hasChildNodes()){
				return false;
			}
		}
		return true;
	};

	ns.BBContentView.prototype.openOptionsMenu = function (btn) {
		//console.log( 'BBContentView.openOptionsMenu' ); 
		var menuId = 'GenericLPOptions';
		var def = [
			'options|Settings',
			'export|Export|||LPExport',
			'help|Help',
			'Divider',
			'|Window Options|||LPWindowOptions',
			'|Internal Only|||LPInternal'
		];
		if (this.hasControlStrip()){
			def = [
				'toggle|Show Controls|showControls',
				'toggle|Show Other',
				'Divider'
			].concat(def);
		}
		ns.Menus.openAtElement(menuId, def, this, btn, {classes:['lp']});
	};

	ns.BBContentView.prototype.checkMenuItem = function (id, menu) {
		//console.log( 'BBContentView.checkMenuItem: ' + id );
		switch (id){
			case 'showControls':
			this.toggleControlsTray();
			break;
		}
	};

	ns.BBContentView.prototype.getCheckboxValue = function (id) {
		var bool = false;
		switch (id){
			case 'showControls':
			bool = (this.owner.controlsTray === undefined);
			break;
		}
		return bool;
	};

	ns.BBContentView.prototype.toggleControlsTray = function(){
		var optionsRowHeight;
		if (this.owner.controlsTray){
			this.owner.controlsTray.onDelete();
			delete this.owner.controlsTray;
			optionsRowHeight = this.owner.optionsRow.getBoundingClientRect().height;
		} else {
			optionsRowHeight = this.owner.optionsRow.getBoundingClientRect().height;
			this.owner.controlsTray = new ns.LPControlsTray(this, optionsRowHeight);
		}
	};

	ns.BBContentView.prototype.onMenuClose = function (menu) {
		if (menu.id === 'groupMenu'){
			this.owner.groupButton.classList.remove('active');
		}
	};

	ns.BBContentView.prototype.createCustomMenuItem = function(name, menu, row) {
		//console.log('BBContentView.createCustomMenuItem');
		if (name === "groupMenuIntroVersion"){

			var cell = ns.Views.create('td', []);
			cell.setAttribute('colspan', '4');

			var box = ns.Views.create('div', ['lp-group-intro-msg'], cell);
			ns.Views.create('span', [], box).innerHTML = 'Use security groups to synchronize securities between components.';

			var btn = ns.Views.create('button', ['btn', 'btn-gray', 'lp-create-first-group'], box);
			btn.innerHTML = 'Create Group';
			btn.addEventListener('click', this.createNewGroupFirstTime.bind(this), false);

			row.appendChild(cell);

		} else {

			ns.LPWindow.parent.createCustomMenuItem.apply(this, arguments);

			if (name === 'zoomControls'){

				this.updateMenuZoomText(menu);
				row.querySelector('.minus-btn').addEventListener('click', this.menuZoomOut.bind(this, menu), false);
				row.querySelector('.plus-btn').addEventListener('click', this.menuZoomIn.bind(this, menu), false);
				row.querySelector('.zoom-reset').addEventListener('click', this.menuZoomReset.bind(this, menu), false);
			}

		}
	};

	ns.BBContentView.prototype.createNewGroupFirstTime = function () {
		// console.log('createNewGroupFirstTime');
		this.createNewGroup();
		ns.Menus.closeAll();
	};

	ns.BBContentView.prototype.createGroupMenuItemHTML = function (groupId) {
		var group = ns.LPGroups.lut[groupId];
		return '<div class="lp-group-badge g-' + group.colorCodeIndex + '">' + groupId + '</div> ' + group.name;
	};

	ns.BBContentView.prototype.createWindowTitleBarComboBoxData = function () {
		return []; // Intended for override
	};

	ns.BBContentView.prototype.onWindowEvent = function(eventType) {
		// This is usually overridden
		switch (eventType){
			case ns.Window.RESIZE_EVENT:
			if (this.scroller){
				this.scroller.onChangeSize();
			}
			break;

			case ns.Window.ZOOM_EVENT:
			if (this.scroller){
				this.scroller.onChangeSize();
			}
			break;
		}
	};

	ns.BBContentView.prototype.createMainElement = function() {
		return ns.Views.create('div', ['absolute-fill', 'hide-overflow']);
	};

	ns.BBContentView.prototype.getOwner = function() {
		return this.owner;
	};

	ns.BBContentView.prototype.setOwner = function(newOwner) {
		this.owner = newOwner;
	};

	ns.BBContentView.NOTES_TOOLTIP_ID = 'notes';
	ns.BBContentView.HELP_TOOLTIP_ID = 'help';
	ns.BBContentView.POPOUT_TOOLTIP_ID = 'popout';

	ns.BBContentView.prototype.createB2FunctionTitleBar = function(title, subtitle, parentNode) {
		// Part of the function header
		var titleBar = ns.Views.create('div', ['func-title-bar'], parentNode);
		var row = ns.Views.create('div', ['row'], titleBar);
		var titleBarLeft = ns.Views.create('div', ['left'], row);
		var text = ns.Views.create('div', ['text'], titleBarLeft);
		text.innerHTML = title;
		ns.Views.create( 'div', ['divider'], titleBarLeft);
		text = ns.Views.create('div', ['text'], titleBarLeft);
		text.innerHTML = subtitle;
		ns.Views.create('div', ['sprite','bookmark'], titleBarLeft);
		var titleBarRight = ns.Views.create('div', ['right'], row);

		this.noteButton = this.createButton( ['btn','sprite','note-btn'], titleBarRight);
		this.tooltips[ns.BBContentView.NOTES_TOOLTIP_ID] = new ns.Tooltip(this.noteButton, 'Notes');

		this.helpButton = this.createButton( ['btn','sprite','help-btn'], titleBarRight);
		this.tooltips[ns.BBContentView.HELP_TOOLTIP_ID] = new ns.Tooltip(this.helpButton, 'Help');
		ns.Views.create( 'div', ['divider'], this.helpButton);

		this.popoutButton = this.createButton( ['btn','sprite','popout-btn'], titleBarRight);
		this.tooltips[ns.BBContentView.POPOUT_TOOLTIP_ID] = new ns.Tooltip(this.popoutButton, 'Popout');

		this.functionTitleBar = titleBar;
	};

	ns.BBContentView.prototype.createB2FunctionMain = function(parentNode) {
		this.main = ns.Views.create('div', 'func-main', parentNode);
	};

	//ns.BBContentView.prototype.getOwnerType = function() {
		//return (this.owner) ? ns.BBContentView.getTypeOfContainingWindow(this.owner) : null ;
	//};

	ns.BBContentView.prototype.menuZoomIn = function(menu) {
		if (this.zoom < 200){
			this.setZoom( Math.min(200, this.zoom + 10) );
			this.updateMenuZoomText(menu);
		}
	};

	ns.BBContentView.prototype.menuZoomOut = function(menu) {
		if (this.zoom > 50){
			this.setZoom( Math.max(50, this.zoom - 10) );
			this.updateMenuZoomText(menu);
		}
	};

	ns.BBContentView.prototype.updateMenuZoomText = function(menu) {
		menu.levelDisplay.innerHTML = Math.round( this.zoom ) + '%';
	};

	ns.BBContentView.prototype.menuZoomReset = function(menu) {
		this.setZoom( 100 );
		this.updateMenuZoomText(menu);
		ns.Menus.closeAll();
	};

	ns.BBContentView.prototype.setZoom = function(zoom) {
		this.zoom = zoom;
		this.scale = ns.Window.DEFAULT_SCALE * this.zoom / 100;
		if (this.zoom < 100){
			this.el.classList.add('min-border');
		} else {
			this.el.classList.remove('min-border');
		}
		// this.el.style.fontSize = this.scale + '%';
		ns.Views.setInlineFontSize( this.el, this.zoom / 100 );
		// this.el.style.fontSize = this.getDragElement().style.fontSize = this.scale + '%';
		this.onWindowEvent(ns.Window.ZOOM_EVENT);
	};

})();
