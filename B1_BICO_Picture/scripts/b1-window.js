(function(){

	'use strict';

	window[window.globalNamespaceName] = window[window.globalNamespaceName] || {};
	var ns = window[window.globalNamespaceName];

	/*
	The control bar changes its font -size based on the height of the window. This changes its height and causes elements inside to reflow, ellipsize, etc., but no transform is used.
	A scaling transform is then applied to the area beneath the control bar.
	*/

	// Object > View > Draggable > Window > B1Window

	ns.B1Window = function (initData) {

		initData = initData ? initData : {};

		this.functionName = (initData.initialFunction) ? initData.initialFunction : ns.B1Window.NO_FUNCTION_NAME;

		//if (initData.functions){
			//this.functions = initData.functions;
		//} else {
			//this.functions = [this.functionName];
		//}

		this.securities = (initData.securities) ? initData.securities : {} ;
		if (initData.initialSecurity){
			this.selectedSecurity = this.securities[initData.initialSecurity];
		}

		var el = ns.Views.create('div', ['win7','b1']);
		ns.Views.appContainer.appendChild(el);
		ns.B1Window.parent.constructor.apply(this, [el, {noDragListener:true} ]);
		this.type = ns.B1Window.TYPE;
		this.windowEventsDisabled = true; // Ignore window events before constructor finishes

		var fragment = document.createDocumentFragment();
		var bg = ns.Views.create('div', ['bg'], fragment);

		ns.Windows.createWin7BgElements(this, bg);
		ns.Windows.createWin7Title(this, fragment);
		this.win7title.classList.add('no-options');

		this.windowIcon = ns.Views.create('div', ['bb-window-icon'], fragment);
		this.windowIconText = ns.Views.create('span', [], this.windowIcon);

		ns.Views.create('div', ns.Window.DEFAULT_DRAG_ELEMENT_STYLE, fragment);

		this.contentArea = ns.Views.create('div', ['content-box'], fragment);

		this.flexBox = ns.Views.create('div', [], this.contentArea);
		this.flexBox.style.display = 'flex';
		this.flexBox.style.flexFlow = 'column';
		this.flexBox.style.height = '100%';

		var toolbarBox = ns.Views.create('div', [], this.flexBox);
		toolbarBox.style.flex = '0 1 auto';
		toolbarBox.style.position = 'relative';

		var belowToolbarBox = ns.Views.create('div', [], this.flexBox);
		belowToolbarBox.style.flex = '1 1 auto';
		belowToolbarBox.style.position = 'relative';

		this.B1Toolbar = ns.Views.create('div', ['b1-toolbar'], toolbarBox);

		var toolbarTable = ns.Views.create('div', 'table-expand', this.B1Toolbar);
		var toolbarRow = ns.Views.create('div', 'row-expand', toolbarTable);

		var toolbarArrowsCell = ns.Views.create('div', 'cell', toolbarRow);
		ns.Views.create('div', ['sprite', 'b1-toolbar-arrows'], toolbarArrowsCell);

		this.securitiesMenuButton = this.createToolbarMenuButton(toolbarRow, '', 'b1-menu-down-caret');
		this.securitiesMenuButton.addEventListener('mousedown', this, false);
		if (this.selectedSecurity){
			this.securitiesMenuButton.querySelector('span').innerHTML = this.selectedSecurity.title;
		}

		this.functionsMenuButton = this.createToolbarMenuButton(toolbarRow, this.functionName, 'b1-menu-down-caret');
		this.functionsMenuButton.addEventListener('mousedown', this, false);

		this.createToolbarMenuButton(toolbarRow, 'Related Functions Menu', 'b1-menu-dbl-down-caret');

		ns.Views.create('div', 'cell-spacer', toolbarRow);

		var messageCell = ns.Views.create('div', 'b1-toolbar-cell', toolbarRow);
		ns.Views.create('span', ['message-btn'], messageCell).innerHTML = 'Message';

		this.favoritesBtn = ns.Views.create('div', 'b1-toolbar-btn', toolbarRow);
		ns.Views.create('div', ['sprite', 'b1-toolbar-icn', 'b1-favorites-icn'], this.favoritesBtn);
		this.favoritesTooltip = new ns.Tooltip(this.favoritesBtn, 'Save this function to your favorites,<br>or access your list of saved functions and securities.', {style:'lp-tooltip'});

		this.exportBtn = ns.Views.create('div', 'b1-toolbar-btn', toolbarRow);
		ns.Views.create('div', ['sprite', 'b1-toolbar-icn', 'b1-export-icn'], this.exportBtn);
		ns.Views.create('div', ['sprite', 'b1-export-overlay'], this.exportBtn);
		this.exportTooltip = new ns.Tooltip(this.exportBtn, 'Capture screen content to save, send, export, and print.', {style:'lp-tooltip'});

		this.optionsBtn = ns.Views.create('div', 'b1-toolbar-btn', toolbarRow);
		ns.Views.create('div', ['sprite', 'b1-toolbar-icn', 'b1-options-icn'], this.optionsBtn);
		this.optionsTooltip = new ns.Tooltip(this.optionsBtn, 'Change the size of your Bloomberg window or update your system defaults.', {style:'lp-tooltip'});
		this.optionsBtn.addEventListener('click', this, false);

		this.helpBtn = ns.Views.create('div', 'b1-toolbar-btn', toolbarRow);
		ns.Views.create('div', ['sprite', 'b1-toolbar-icn', 'b1-help-icn'], this.helpBtn);
		this.helpTooltip = new ns.Tooltip(this.helpBtn, 'Access an online Help Page for this function.', {style:'lp-tooltip'});

		var contentHolder = ns.Views.create('div', ['b1-content'], belowToolbarBox);

		this.scalingBox = ns.Views.create('div', ['scaling-box'], contentHolder);

		this.commandLine = ns.Views.create( 'div', 'b1-cmd-box', this.scalingBox );
		ns.Views.create('div', 'b1-cmd-triangle', this.commandLine );

		this.twoLine = ns.Views.create( 'div', 'b1-two-line', this.scalingBox );

		this.titleRegion = ns.Views.create( 'div', 'b1-title-region', this.scalingBox );
		this.titleButtonBar = ns.Views.create( 'div', 'b1-title-button-bar', this.titleRegion );
		this.appTitle = ns.Views.create( 'div', 'b1-app-title', this.titleRegion );

		this.appRegion = ns.Views.create( 'div', 'b1-app-region', this.scalingBox );

		this.iPanel = ns.Views.create( 'div', 'b1-ipanel-box', this.scalingBox );

		this.createWin7WindowControls(fragment);

		this.addAllResizers(fragment);
		this.el.appendChild(fragment);

		if (this.functionName !== ns.B1Window.NO_FUNCTION_NAME){
			this.bbContent = this.createContent(initData.initialFunction, initData.initialArgument);  
		}

		var topWindow = ns.Windows.getTopWindowOfType(ns.B1Window.TYPE);
		if (topWindow){
			this.setPosition(topWindow.position.x + ns.B1Window.NEW_WINDOW_OFFSET_X, topWindow.position.y + ns.B1Window.NEW_WINDOW_OFFSET_Y);
		} else {
			this.setPosition(ns.B1Window.NEW_WINDOW_DEFAULT_X, ns.B1Window.NEW_WINDOW_DEFAULT_Y);
		}

		if (initData.hasOwnProperty('minWidth')){
			this.minSize.width = initData.minWidth;
		}
		if (initData.hasOwnProperty('minHeight')){
			this.minSize.height = initData.minHeight;
		}

		var defaultSize = ns.B1Window.getNewWindowSize(initData);
		var w = (initData.hasOwnProperty('width')) ? initData.width : defaultSize.width ;
		var h = (initData.hasOwnProperty('height')) ? initData.height : defaultSize.height ;
		this.setSize( w, h );

		var defaultPosition = ns.B1Window.getNewWindowPosition();
		var x = (initData.hasOwnProperty('x')) ? initData.x : defaultPosition.x ;
		var y = (initData.hasOwnProperty('y')) ? initData.y : defaultPosition.y ;
		this.setPosition( x, y );

		this.showContent();

		if (initData.title){
			this.title = initData.title;
			this.displayTitle(initData.title);
		}
		if (initData.closeDisabled){
			this.closeDisabled = true;
		}

		this.applyClassicSizing();

		ns.Windows.addWindow(this);
		this.activate();
		ns.Taskbar.onNewWindow(this);
		this.windowEventsDisabled = false;
	};

	ns.B1Window.TYPE = 'b1';

	ns.B1Window.NO_FUNCTION_NAME = '---';

	ns.B1Window.B1_MENU_STYLE = 'b1-menu';
	ns.B1Window.ACTIVE_STYLE = 'active';
	ns.B1Window.SECURITIES_MENU_ID = 'B1Securities';
	ns.B1Window.FUNCTIONS_MENU_ID = 'B1Functions';
	ns.B1Window.OPTIONS_MENU_ID = 'B1Options';

	ns.B1Window.TINY_SIZE_ID = 'tiny';
	ns.B1Window.SMALL_SIZE_ID = 'small';
	ns.B1Window.NORMAL_SIZE_ID = 'normal';
	ns.B1Window.LARGE_SIZE_ID = 'large';
	ns.B1Window.EXTRA_LARGE_SIZE_ID = 'extraLarge';
	ns.B1Window.HUGE_SIZE_ID = 'huge';

	ns.B1Window.PRESET_SIZES = {};
	ns.B1Window.PRESET_SIZES[ns.B1Window.TINY_SIZE_ID] = new ns.Size(512,418);
	ns.B1Window.PRESET_SIZES[ns.B1Window.SMALL_SIZE_ID] = new ns.Size(672,502);
	ns.B1Window.PRESET_SIZES[ns.B1Window.NORMAL_SIZE_ID] = new ns.Size(752,586);
	ns.B1Window.PRESET_SIZES[ns.B1Window.LARGE_SIZE_ID] = new ns.Size(992,754);
	ns.B1Window.PRESET_SIZES[ns.B1Window.EXTRA_LARGE_SIZE_ID] = new ns.Size(1312,978);
	ns.B1Window.PRESET_SIZES[ns.B1Window.HUGE_SIZE_ID] = new ns.Size(1712,1286);

	ns.B1Window.OPTIONS_MENU_DEF  = [
		'checkmark|Tiny|' + ns.B1Window.TINY_SIZE_ID,
		'checkmark|Small|' + ns.B1Window.SMALL_SIZE_ID,
		'checkmark|Normal|' + ns.B1Window.NORMAL_SIZE_ID,
		'checkmark|Large|' + ns.B1Window.LARGE_SIZE_ID,
		'checkmark|Extra Large|' + ns.B1Window.EXTRA_LARGE_SIZE_ID,
		'checkmark|Huge|' + ns.B1Window.HUGE_SIZE_ID,
		'|Full Screen|fullScreen',
		'Divider',
		'|Autocomplete Settings...|doNothing',
		'|News Panel|||B1NewsPanelOptions',
		'|Message Panel|||B1MessagePanelOptions',
		'Divider',
		'|Prompt Logoff|doNothing',
		'|Print Setup...|doNothing',
		'|Terminal Defaults|closeWindow|Alt+D',
		'|Software Version|doNothing',
		'Divider',
		'|Exit Bloomberg|doNothing'
	];

	ns.B1Window.CHROME_WIDTH = 14;
	ns.B1Window.CHROME_HEIGHT = 36;

	ns.B1Window.NORMAL_CONTENT_BOX_INNER_HEIGHT = ns.B1Window.PRESET_SIZES[ns.B1Window.NORMAL_SIZE_ID].height - ns.B1Window.CHROME_HEIGHT;

	ns.B1Window.NORMAL_SCALE_BOX_WIDTH = 720;
	ns.B1Window.NORMAL_SCALE_BOX_HEIGHT = 509;

	ns.B1Window.NEW_WINDOW_DEFAULT_X = 297;
	ns.B1Window.NEW_WINDOW_DEFAULT_Y = 163;
	ns.B1Window.NEW_WINDOW_OFFSET_X = 25;
	ns.B1Window.NEW_WINDOW_OFFSET_Y = 25;

	// Static methods //////////////////////////////////////////////////////////////////////////////////////////////////////

	ns.B1Window.getNewWindowSize = function(initData) {
		var presetSizeId = (initData.initialPresetSize) ? (initData.initialPresetSize) : ns.B1Window.NORMAL_SIZE_ID ;
		return ns.B1Window.PRESET_SIZES[presetSizeId];
	};

	ns.B1Window.getNewWindowPosition = function() {
		var topWindow = ns.Windows.getTopWindowOfType(ns.B1Window.TYPE);
		var x = (topWindow) ? topWindow.position.x + ns.B1Window.NEW_WINDOW_OFFSET_X : ns.B1Window.NEW_WINDOW_DEFAULT_X ;
		var y = (topWindow) ? topWindow.position.y + ns.B1Window.NEW_WINDOW_OFFSET_Y : ns.B1Window.NEW_WINDOW_DEFAULT_Y ;
		return new ns.Point(x, y);
	};

	ns.extend(ns.B1Window, ns.Window);

	// Instance methods //////////////////////////////////////////////////////////////////////////////////////////////////////

	ns.B1Window.prototype.setFunctionTitle = function (str) {
		this.appTitle.innerHTML = str;
	};

	ns.B1Window.prototype.addTitleBarButton = function (config) {
		var btn = this.createTitleBarButton(config);
		btn.addEventListener('click', this.onTitleBarButtonClick.bind(this, config), false);
		return btn;
	};

	ns.B1Window.prototype.addTitleBarMenuButton = function (config) {
		config = (config) ? config : {};
		config.downCaret = true;
		var btn = this.createTitleBarButton(config);
		btn.addEventListener('mousedown', this.onTitleBarMenuButtonMousedown.bind(this, config), false);
		return btn;
	};

	ns.B1Window.prototype.createTitleBarButton = function (config) {
		config = (config) ? config : {};
		var text = (config.text) ? config.text : '';
		var styles = ['b1-title-bar-btn'];
		if (config.styles){
			styles = styles.concat(config.styles);
		}
		var btn = ns.Views.create('div', ['b1-title-bar-btn'], this.titleButtonBar);
		if (config.hasOwnProperty('numberGo')){
			ns.Views.create('span', ['number-go'], btn).innerHTML = config.numberGo;
		}
		ns.Views.create('span', [], btn).innerHTML = text;
		if (config.downCaret){
			ns.Views.create('div', 'b1-title-bar-btn-down-caret', btn);
		}
		return btn;
	};

	ns.B1Window.prototype.onTitleBarButtonClick = function (config, e) {
		if (this.bbContent){
			if (config.id && this.bbContent.onTitleBarButtonClick){
				this.bbContent.onTitleBarButtonClick(config.id, e)
			}
		}
	};

	ns.B1Window.prototype.onTitleBarMenuButtonMousedown = function (config, e) {
		if (this.bbContent){
			if (config.menuId && this.bbContent.getMenuDefinition){
				this.activeTitleBarMenuId = config.menuId;
				this.activeTitleBarMenuButton = e.currentTarget;
				var def = this.bbContent.getMenuDefinition(this.activeTitleBarMenuId);
				var menuOptions = {classes:['b1-title-bar-menu']}; // TODO: Make this style a constant
				ns.Menus.openAtElement(this.activeTitleBarMenuId, def, this, this.activeTitleBarMenuButton, menuOptions);
				this.activeTitleBarMenuButton.classList.add(ns.B1Window.ACTIVE_STYLE);
			}
		}
	};

	ns.B1Window.prototype.applyClassicSizing = function () {
		var contentRect = this.flexBox.getBoundingClientRect();
		var pct = contentRect.height / ns.B1Window.NORMAL_CONTENT_BOX_INNER_HEIGHT;
		ns.Views.setInlineFontSize( this.B1Toolbar, pct );
		this.zoom = pct * 100;
		var rect = this.scalingBox.parentNode.getBoundingClientRect();
		var scaleX = rect.width / ns.B1Window.NORMAL_SCALE_BOX_WIDTH;
		var scaleY = rect.height / ns.B1Window.NORMAL_SCALE_BOX_HEIGHT;
		this.scalingBox.style.transform = 'scale(' + scaleX + ',' + scaleY + ')';
	};

	ns.B1Window.prototype.showContentByCommand = function(cmd, arg) {
		//console.log('B1Window.showContentByCommand');
		if (this.bbContent){
			this.bbContent.destroy();
		}
		this.functionName = cmd.toUpperCase();
		this.bbContent = this.createContent(cmd, arg);
		this.showContent();
		return this.bbContent;
	};

	ns.B1Window.prototype.createContent = function(functionName, arg) {
		var contentView;
		if (ns.PrototypeFunctions){
			var ctor = ns.PrototypeFunctions[functionName];
			if (!ctor){
				ctor = ns.PrototypeFunctions[functionName.toLowerCase()];
			}
			if (ctor){
				contentView = new ctor({owner:this});
			}
		}
		return contentView;
	};

	ns.B1Window.prototype.showContent = function (){
		ns.Views.removeChildNodes(this.appRegion);
		ns.Views.removeChildNodes(this.twoLine);
		ns.Views.removeChildNodes(this.titleButtonBar);
		if (this.functionName !== ns.B1Window.NO_FUNCTION_NAME){
			this.setWindowIconText(this.functionName);
			if (this.bbContent){
				this.setFunctionTitle(this.bbContent.title);
				this.appRegion.appendChild(this.bbContent.el);
				this.bbContent.onDOMReady();
			}

		}
		ns.Taskbar.onWindowContentChange(this);
	};

	ns.B1Window.prototype.setWindowIconText = function (string){
		this.windowIconText.style.fontSize = '';
		var iconWidth = this.windowIcon.getBoundingClientRect().width;
		this.windowIconText.innerHTML = string;
		if (this.windowIconText.getBoundingClientRect().width > iconWidth){
			this.windowIconText.style.fontSize = '8px';
		}
	};

	ns.B1Window.prototype.loadIPanelImage = function (path) {
		ns.Views.removeChildNodes(this.iPanel);
		var img = ns.Views.createImage( path, [], this );
		this.iPanel.appendChild(img);
	};

	ns.B1Window.prototype.onWindowEvent = function(eventType) {
		if (!this.windowEventsDisabled){
			if (this.bbContent){
				if (eventType === ns.Window.CLOSE_EVENT){
					this.bbContent.destroy();
				} else {
					this.bbContent.onWindowEvent(eventType);
				}
			}
		}
	};

	ns.B1Window.prototype.handleEvent = function (e) {
		var handled = false;
		var menuOptions = {classes:[ns.B1Window.B1_MENU_STYLE]};
		switch (e.type) {

			case 'click':
			if (e.currentTarget === this.optionsBtn){
				ns.Menus.openAtElement(ns.B1Window.OPTIONS_MENU_ID, ns.B1Window.OPTIONS_MENU_DEF, this, e.currentTarget, menuOptions);
				handled = true;
			}
			break;

			case 'mousedown':
			switch (e.currentTarget){

				case this.securitiesMenuButton:
				e.currentTarget.classList.add(ns.B1Window.ACTIVE_STYLE);
				ns.Menus.openAtElement(ns.B1Window.SECURITIES_MENU_ID, this.getSecuritiesMenuDefinition(), this, e.currentTarget, menuOptions);
				handled = true;
				break;

				case this.functionsMenuButton:
				e.currentTarget.classList.add(ns.B1Window.ACTIVE_STYLE);
				ns.Menus.openAtElement(ns.B1Window.FUNCTIONS_MENU_ID, this.getFunctionsMenuDefinition(), this, e.currentTarget, menuOptions);
				handled = true;
				break;
			}
			break;
		}
		if (!handled){
			ns.B1Window.parent.handleEvent.apply(this, arguments);
		}
	};

	ns.B1Window.prototype.createToolbarMenuButton = function (row, str, iconStyle) {
		var toolbarSecuritiesCell = ns.Views.create('div', 'b1-toolbar-cell', row);
		var toolbarSecuritiesBtn = ns.Views.create('div', 'b1-toolbar-menu-btn', toolbarSecuritiesCell);
		ns.Views.create('span', [], toolbarSecuritiesBtn).innerHTML = str;
		ns.Views.create('div', ['sprite','b1-menu-flag'], toolbarSecuritiesBtn);
		if (iconStyle){
			ns.Views.create('div', ['sprite',iconStyle], toolbarSecuritiesBtn);
		}
		return toolbarSecuritiesBtn;
	};

	ns.B1Window.prototype.toggleMaximize = function() {
		ns.B1Window.parent.toggleMaximize.apply(this, arguments);
		this.applyClassicSizing();
	};

	ns.B1Window.prototype.onMove = function(e) {
		ns.B1Window.parent.onMove.apply(this, arguments);
		if (this.resizeType){
			this.applyClassicSizing();
		}
	};

	ns.B1Window.prototype.minimize = function () {
		var taskbarAppButton = ns.Taskbar.getButtonById(ns.Taskbar.B2APP_BUTTON_ID);
		if (taskbarAppButton){
			ns.B1Window.parent.minimize.apply(this);
		} else {
			// If there is no taskbar thumbnail tray, this window will stay invisible forever, so minimization is not allowed
		}
	};

	ns.B1Window.prototype.selectMenuItem = function (id, e, menuId) {
		if (this.activeTitleBarMenuId){
			if (this.bbContent){
				if (this.bbContent.onTitleBarMenuItemSelect){
					this.bbContent.onTitleBarMenuItemSelect(id, e, menuId);
				}
			}
		} else {

			// console.log( 'menuId: ' + menuId ); // B1Securities or B1Functions
			switch (menuId){

				case ns.B1Window.SECURITIES_MENU_ID:
				var security = this.securities[id];
				if (security){
					if (security !== this.selectedSecurity){
						this.selectedSecurity = security;
						this.securitiesMenuButton.querySelector('span').innerHTML = this.selectedSecurity.title;
						if (this.bbContent){
							if (this.bbContent.onSecuritySelected){
								this.bbContent.onSecuritySelected(this.selectedSecurity);
							}
						}
					}
				}
				break;

				case ns.B1Window.FUNCTIONS_MENU_ID:
				if (id !== this.functionName){
					this.functionName = id;
					this.functionsMenuButton.querySelector('span').innerHTML = this.functionName;
					this.showContentByCommand(id);
				}
				break;

				case ns.B1Window.OPTIONS_MENU_ID:
				var size = ns.B1Window.PRESET_SIZES[id];
				if (size){
					this.setSize(size.width, size.height);
					this.applyClassicSizing();
				}
				break;
			}
		}
	};

	ns.B1Window.prototype.getRadioValue = function (id) {
		var size = ns.B1Window.PRESET_SIZES[id];
		if (size){
			return this.size.equals( size );
		} else {
			switch (id){

				case 'newsDefaultOff':
				return true;
				break;

				case 'messageDefaultOff':
				return true;
				break;
			}
		}
		return false;
	};

	ns.B1Window.prototype.getSecuritiesMenuDefinition = function () {
		var notesText = 'Notes';
		if (this.selectedSecurity){
			if (this.selectedSecurity.notification){
				notesText = 'New Notes';
			}
		}
		var def = [
			'notes_b1|' + notesText + '|notes',
			'alerts_b1|Market Alerts|alerts',
			'Divider',
			'header|Recent Securities&nbsp;'
		];
		var id, data;
		for (id in this.securities){
			data = this.securities[id];
			def.push('|' + data.title + '|' + id);
		}
		return def;
	};

	ns.B1Window.prototype.getFunctionsMenuDefinition = function () {
		var def = [];
		if (ns.PrototypeFunctions){
			var functionName, upperCaseFunctionName;
			for (var functionName in ns.PrototypeFunctions){
				if (ns.PrototypeFunctions.hasOwnProperty(functionName)){
					upperCaseFunctionName = functionName.toUpperCase();
					def.push( '|' + upperCaseFunctionName + '|' + upperCaseFunctionName );
				}
			}
		}
		return def;
	};

	ns.B1Window.prototype.onMenuClose = function (menu) {
		if (this.activeTitleBarMenuId){
			this.activeTitleBarMenuButton.classList.remove(ns.B1Window.ACTIVE_STYLE);
			delete this.activeTitleBarMenuButton;
			delete this.activeTitleBarMenuId;
		} else {
			switch (menu.id) {

				case ns.B1Window.SECURITIES_MENU_ID:
				this.securitiesMenuButton.classList.remove(ns.B1Window.ACTIVE_STYLE);
				break;

				case ns.B1Window.FUNCTIONS_MENU_ID:
				this.functionsMenuButton.classList.remove(ns.B1Window.ACTIVE_STYLE);
				break;
			}
		}
	};

})();
