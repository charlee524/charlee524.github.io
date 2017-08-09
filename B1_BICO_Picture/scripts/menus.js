(function(){

	'use strict';

	// BUG: Mouse down on an item; without releasing, move cursor to submenu item - submenu should not open !!!!

	// QUESTION: Mouse down on an item; without releasing, move cursor to desktop, then release - should menu close ???

	// TODO: Let submenus use the same styles as their openers

	window[window.globalNamespaceName] = window[window.globalNamespaceName] || {};
	var ns = window[window.globalNamespaceName];

	ns.Menus = {

		// SUBMENU_CLICK_ENABLED: true, // Experimental; if true, clicking a menu item that opens a submenu will execute the first command in that submenu

		SUBMENU_X_OFFSET: 1,

		MENU_ITEM_STYLE: 'menu-item',
		SELECTED_ITEM_STYLE: 'selected',

		DOWN_RIGHT: 'downRight',	// Below anchor, extending right (left-aligned)		- This is the default
		DOWN_LEFT: 'downLeft',		// Below anchor, extending left (right-aligned)
		UP_RIGHT: 'upRight',		// Above anchor, extending right (left-aligned) 
		UP_LEFT: 'upLeft',			// Above anchor, extending left (right-aligned)		- Used by prototype options menu

		RIGHT_DOWN: 'rightDown',	// Right of anchor, extending down (top-aligned)	- Used by vertical LP Toolbar not docked to right
		LEFT_DOWN: 'leftDown',		// Left of anchor, extending down (top-aligned)		- Used by LP Toolbar docked to right
		RIGHT_UP: 'rightUp',		// Right of anchor, extending up (bottom-aligned)
		LEFT_UP: 'leftUp',			// Left of anchor, extending up (bottom-aligned)

		ICON_LUT: {
			zoom:'menu-zoom-icon',
			fullscreen: 'menu-fullscreen-icon',
			favorites: 'menu-favorites-icon',
			options: 'menu-options-icon',
			notes_b1:'menu-notes-b1-icon',
			alerts_b1:'menu-alerts-b1-icon',
			export: 'menu-export-icon',
			help: 'menu-help-icon',
			ib_chat: 'menu-ib-chat-icon',
			ib_contacts: 'menu-ib-contacts-icon',
			ib_feed: 'menu-ib-feed-icon',
			sort_ascending: 'menu-sort-ascending',   // This is only used in the Grid Columns prototype
			sort_descending: 'menu-sort-descending' // This is only used in the Grid Columns prototype
		},

		menuList: [],

		getFirstCommand: function (def){
			var i, arr, val, len = def.length;
			for (i=0; i<len; i++){
				arr = def[i].split('|');
				if (arr.length > 2){
					val = arr[2];
					if (val.length > 0){
						return val;
					}
				}
			}
			return;
		},

		openAtElement: function (id, def, opener, anchorElement, options){
			var anchorRect = ns.Rect.create( anchorElement.getBoundingClientRect() ); // Usually this is a button or a menu item
			anchorRect.convertToLocalSpace( ns.Desktop.getRect() );
			return this.createMenu(id, def, opener, anchorRect, options);
		},

		openAtPoint: function (id, def, opener, point, options){
			point.convertToLocalSpace( ns.Desktop.getRect() );
			var anchorRect = new ns.Rect( point.x, point.y, point.x, point.y );
			return this.createMenu(id, def, opener, anchorRect, options);
		},

		createMenu: function (id, def, opener, anchorRect, options){
			var x = anchorRect.left;
			var y = anchorRect.bottom;
			if (options){
				if (options.orientation){
					switch (options.orientation){

						case ns.Menus.RIGHT_UP:
						x = anchorRect.right;
						break;

						case ns.Menus.LEFT_DOWN:
						y = anchorRect.top;
						break;

						case ns.Menus.RIGHT_DOWN:
						x = anchorRect.right;
						y = anchorRect.top;
						break;
					}
				} else {
					options.orientation = ns.Menus.DOWN_RIGHT;
				}
			} else {
				options = {orientation: ns.Menus.DOWN_RIGHT};
			}
			var menu = new ns.Menu(id, def, opener, new ns.Point(x, y), options);
			var rect = menu.el.getBoundingClientRect();
			var desktopRect = ns.Desktop.getRect(true);
			switch (options.orientation){

				case ns.Menus.DOWN_RIGHT:
				case ns.Menus.UP_RIGHT:
				if (x + rect.width > desktopRect.width){
					x = Math.max(0, anchorRect.right - rect.width);
				}
				break;

				case ns.Menus.DOWN_LEFT:
				case ns.Menus.UP_LEFT:
				x = anchorRect.right - rect.width;
				if (x < 0){
					x = anchorRect.left;
				}
				break;

				case ns.Menus.RIGHT_DOWN:
				case ns.Menus.RIGHT_UP:
				if (x + rect.width > desktopRect.width){
					x = Math.max(0, anchorRect.left - rect.width);
				}
				break;

				case ns.Menus.LEFT_DOWN:
				case ns.Menus.LEFT_UP:
				x = anchorRect.left - rect.width;
				if (x < 0){
					x = anchorRect.right;
				}
				break;
			}
			switch (options.orientation){

				case ns.Menus.DOWN_RIGHT:
				case ns.Menus.DOWN_LEFT:
				if (y + rect.height > desktopRect.height){
					y = Math.max(0, anchorRect.top - rect.height);
				}
				break;

				case ns.Menus.UP_RIGHT:
				case ns.Menus.UP_LEFT:
				y = anchorRect.top - rect.height;
				if (y < 0){
					y = anchorRect.bottom;
				}
				break;

				case ns.Menus.RIGHT_DOWN:
				case ns.Menus.LEFT_DOWN:
				if (y + rect.height > desktopRect.height){
					y = Math.max(0, anchorRect.bottom - rect.height);
				}
				break;

				case ns.Menus.RIGHT_UP:
				case ns.Menus.LEFT_UP:
				y = anchorRect.bottom - rect.height;
				if (y < 0){
					y = anchorRect.top;
				}
				break;
			}
			menu.setPosition(x, y);
			return menu;
		},

		getDefinition: function(id){
			var def = [];
			var src = ns.Data.menus[id];
			if (src){
				def = src.concat();
				if (id === 'windowOptions'){

					def.unshift('Divider');
					if (ns.B2App.prefs.window.classicSizing){
						def.unshift('custom|classicSizingControls');
					} else {
						def.unshift('custom|zoomControls');
					}
					def.unshift('Divider');


					//if (ns.B2App.prefs.window.enableTabs || ns.B2App.prefs.window.numberOfCommandLineWindows === 'Unlimited'){
						//def.unshift('Divider');
					//}

					if (ns.B2App.prefs.window.numberOfCommandLineWindows === 'Unlimited'){
						def.unshift('|New Window|newWindow|Ctrl+N');
					}
					if (ns.B2App.prefs.window.enableTabs){
						def.unshift('|New Tab|newTab|Ctrl+T');
					}



				}
			}
			return def;
		},

		getMenusByOpener: function(opener){
			var menu, i, len = this.menuList.length, arr = [];
			for (i=0; i<len; i++){
				menu = this.menuList[i];
				if (menu.opener === opener){
					arr.push(menu);
				}
			}
			return arr;
		},

		closeAll: function(e){
			var menu, i, len = this.menuList.length;
			for (i=0; i<len; i++){
				menu = this.menuList[i];
				menu.deactivateTooltips();
				menu.remove();
				menu.onClose(e);
			}
			this.menuList = [];
			document.body.removeEventListener('mousedown', this, true);
			document.body.removeEventListener('keydown', this, true);
		},

		handleEvent: function(e){
			switch (e.type){

				case 'mousedown':
				if (!this.hitCheck(e.target)){
					if (!ns.EventManager.disabled){
						this.closeAll(e);
						return true;
					}
				}
				ns.suppressDefault(e);
				break;
				
				case 'keydown':
				var menu = this.menuList[this.menuList.length-1];
				var prevSelectedIndex = (isNaN(menu.selectedIndex)) ? -1 : menu.selectedIndex ; 
				var items = menu.el.querySelectorAll('.' + ns.Menus.MENU_ITEM_STYLE);
				if (e.keyCode === ns.Keycodes.ENTER){
					//console.log('enter key at body');
					if (prevSelectedIndex > -1){
						var handledByOpener = false;
						if (menu.opener.handleMenuEnter){
							handledByOpener = menu.opener.handleMenuEnter(e, items[prevSelectedIndex] );
						}
						if (!handledByOpener){
							menu.onKeyboardExecuteMenuItem( items[prevSelectedIndex], e );
						}
						ns.suppressDefault(e);
					}  else {
						this.closeAll(e); // ??? not sure about what should happen here
					}
				} else if (e.keyCode === ns.Keycodes.DOWN || e.keyCode === ns.Keycodes.UP){
					var newSelectedIndex = -1;
					if (e.keyCode === ns.Keycodes.DOWN){
						if (prevSelectedIndex > -1){
							newSelectedIndex = prevSelectedIndex + 1;
							if (newSelectedIndex >= items.length){
								newSelectedIndex = 0; // Wrap to top
							}
						} else {
							newSelectedIndex = (menu.options.startIndex) ? menu.options.startIndex : 0 ;
						}
						ns.suppressDefault(e);
					} else if (e.keyCode === ns.Keycodes.UP){
						if (prevSelectedIndex > -1){
							newSelectedIndex = prevSelectedIndex - 1;
							if (newSelectedIndex < 0){
								newSelectedIndex = items.length-1; // Wrap to bottom
							}
						} else {
							newSelectedIndex = items.length-1;
						}
						ns.suppressDefault(e);
					}
					if (prevSelectedIndex > -1){
						items[prevSelectedIndex].classList.remove(this.SELECTED_ITEM_STYLE);
					}
					if (newSelectedIndex > -1){
						menu.selectedIndex = newSelectedIndex;
						items[menu.selectedIndex].classList.add(this.SELECTED_ITEM_STYLE);
					}
					ns.suppressDefault(e);
					if (menu.opener.onMenuUpDown){
						menu.opener.onMenuUpDown(e, items, prevSelectedIndex, newSelectedIndex );
					}
				} else {
					if (menu.opener.onMenuNonDefaultKeyDown){
						menu.opener.onMenuNonDefaultKeyDown(e, items, prevSelectedIndex );
					}
				}
				break;
			}
		},

		hitCheck: function(target){
			var bool = false;
			for (var i=0; i<this.menuList.length; i++){
				if ( this.menuList[i].el.contains(target)){
					bool = true;
					break;
				}
			}
			return bool;
		},

		onWindowResize: function(){
			this.closeAll();
		}
	};

	window.addEventListener('resize', ns.Menus.onWindowResize.bind(ns.Menus), true);

	// Object > View > Menu

	ns.Menu = function (id, def, opener, point, options) {
		this.id = id;
		this.def = def;
		this.opener = opener; // A window or another menu; implements 'selectMenuItem'
		this.options = (options) ? options : {};
		this.zoom = (this.opener.zoom) ? this.opener.zoom : 100 ;

		var fragment = document.createDocumentFragment();
		var container = document.createElement('div');
		container.style.width = '1000px'; // !!! Hard-coded maximum width !!!
		fragment.appendChild(container);
		var main = document.createElement('div');

		ns.Menu.parent.constructor.apply(this, [main]);

		main.classList.add('menu');
		if (this.options.classes){
			for (var i=0; i<this.options.classes.length; i++){
				main.classList.add(this.options.classes[i]);
			}
		}
		main.classList.add('disable-select');

		ns.Views.setInlineFontSize( main, this.zoom / 100 );

		container.appendChild(main);
		this.drawAllItems(main);

		ns.Views.appContainer.appendChild(container);

		var rows = main.querySelectorAll('.menu-table tr');
		for (var i=0; i<rows.length; i++){
			var row = rows[i];
			var height = Math.round(row.getBoundingClientRect().height);
			row.style.height = height + 'px';
		}

		var rect = main.getBoundingClientRect();

		container.parentNode.removeChild(container);

		main.style.width = rect.width + 'px';
		main.style.height = rect.height + 'px'; // this ccuts the bottom off in IE 11

		ns.Views.appContainer.appendChild(main);

		if (ns.Menus.menuList.length === 0){
			document.body.addEventListener('mousedown', ns.Menus, true);
			if (this.options.useKeyboard){
				document.body.addEventListener('keydown', ns.Menus, true);
			}
		}
		ns.Menus.menuList.push(this);
		this.setPosition(point.x, point.y);
	};

	ns.extend(ns.Menu, ns.View);

	ns.Menu.prototype.drawAllItems = function (main){
		ns.Views.removeChildNodes(main);
		var table, row, cell, val, arr, icn;
		var cmd, submenuId;
		table = document.createElement('table');
		table.classList.add('menu-table');
		for (var i=0; i<this.def.length; i++){
			row = document.createElement('tr');
			val = this.def[i];
			submenuId = '';
			if (val === 'Divider'){
				row.classList.add('menu-divider-new');
				cell = ns.Views.create('td', ['title'], row);
				cell.setAttribute('colspan', '4');
			} else {
				arr = val.split('|');
				if (arr[0] === 'custom'){
					this.opener.createCustomMenuItem(arr[1], this, row);
					row.classList.add(ns.Views.SIM_CONTROL_CLASS);
				} else {
					if (arr[0] === 'header'){
						cell = ns.Views.create('td', ['menu-header'], row);
						cell.setAttribute('colspan', '4');
						cell.innerHTML = arr[1];
					} else {
						row.classList.add(ns.Menus.MENU_ITEM_STYLE);
						row.classList.add(ns.Views.SIM_CONTROL_CLASS);
						icn = arr[0];
						var icnCell = ns.Views.create('td',['icon'], row);
						var titleCell = ns.Views.create('td',['title'], row);
						var titleSpan = ns.Views.create('span',[], titleCell);
						titleSpan.innerHTML = arr[1];
						cmd = '';
						if (arr.length > 2){
							cmd = arr[2];
							if (arr.length > 4){
								submenuId = arr[4];
							}
							row.addEventListener('click', this.onMenuItemClick.bind(this, cmd, submenuId), false);
							if (cmd !== ''){
								row.setAttribute('data-cmd', cmd);
								if (this.options.itemStyles){
									var style = this.options.itemStyles[cmd];
									if (style){
										row.classList.add(style);
									}
								} 
								this.addItemTooltip(row, cmd);
							}
							
							if (this.opener.getDisabled){
								if (this.opener.getDisabled(cmd)){
									row.classList.add('disabled');
								}
							}
						}
						var keysCell = ns.Views.create('td',['keys'], row);
						if (arr.length > 3){
							var keysSpan = ns.Views.create('span',[], keysCell);
							keysSpan.innerHTML = arr[3];
						}
						if (icn !== ''){
							switch(icn){

								case 'toggle':
								this.addCheckbox(icnCell, cmd, this.getCheckboxValue(cmd));
								break;

								case 'radio':
								this.addRadio(icnCell, cmd, this.getRadioValue(cmd));
								break;

								case 'checkmark':
								this.addCheckmark(icnCell, cmd, this.getRadioValue(cmd));
								break;

								default:
								var icnStyle = ns.Menus.ICON_LUT[icn];
								if (icnStyle){
									this.addIcon(icnCell, icnStyle);
								}
								break;
							}
						}
						var caretCell = ns.Views.create('td', ['caret'], row);
						if (submenuId !== ''){
							row.setAttribute('data-cmd', submenuId);
							ns.Views.create('div', ['sprite-4x','menu-right-caret'], caretCell);
							this.addItemTooltip(row, submenuId);
						}
					}
				}
				row.addEventListener('mouseenter', this.onItemEnter.bind(this, submenuId), false);
				row.addEventListener('mouseleave', this.onItemLeave.bind(this, submenuId), false);
			}
			table.appendChild(row);
		}
		main.appendChild(table);
	};

	ns.Menu.prototype.addItemTooltip = function (row, id) {
		if (this.options.hasOwnProperty('tooltips')){
			var tipText = this.options.tooltips[id];
			if (tipText){
				this[id + 'tooltip'] = new ns.Tooltip(row, tipText);
			}
		}
	};

	ns.Menu.prototype.close = function (e) {
		this.deactivateTooltips();
		this.remove();
		var pos = ns.Menus.menuList.indexOf(this);
		if (pos > -1){
			ns.Menus.menuList.splice(pos, 1);
		}
		if (ns.Menus.menuList.length === 0){
			document.body.removeEventListener('mousedown', ns.Menus, true);
			document.body.removeEventListener('keydown', ns.Menus, true);
		}
		this.closeSubmenu();
		this.onClose(e);
	};

	ns.Menu.prototype.onClose = function (e) {
		if (this.opener.onMenuClose){
			this.opener.onMenuClose(this, e);
		}
	};

	ns.Menu.prototype.getCheckboxValue = function (id) {
		var bool = false;
		if (this.opener.getCheckboxValue){
			bool = this.opener.getCheckboxValue(id);
		}
		return bool;
	};

	ns.Menu.prototype.getRadioValue = function (id) {
		var bool = false;
		if (this.opener.getRadioValue){
			bool = this.opener.getRadioValue(id);
		}
		return bool;
	};

	ns.Menu.prototype.getDisabled = function (id) {
		var bool = false;
		if (this.opener.getDisabled){
			bool = this.opener.getDisabled(id);
		}
		return bool;
	};

	ns.Menu.prototype.createCustomMenuItem = function (val, menu, div) {
		if (this.opener.createCustomMenuItem){
			this.opener.createCustomMenuItem(val, menu, div);
		}
	};

	ns.Menu.prototype.onMenuItemClick = function (id, submenuId, e) {
		//console.log('onMenuItemClick: ' + id);
		if (!e.currentTarget.classList.contains('disabled')){
			if (submenuId.length > 0){

				if (ns.Menus.SUBMENU_CLICK_ENABLED){
					var firstCommand = ns.Menus.getFirstCommand( ns.Menus.getDefinition(submenuId) );
					if (firstCommand){
						this.executeMenuItem(firstCommand, e, this.id);
					}
				}

			} else {
				var checkbox = e.currentTarget.querySelector('.menu-checkbox');
				if (checkbox){
					this.handleCheckboxClick(checkbox, id, e);
				} else {
					var isValid = (id) ? (id !== '') : false;
					if (isValid){
						this.executeMenuItem(id, e, this.id);
					}
				}
			}
		}
	};

	ns.Menu.prototype.onKeyboardExecuteMenuItem = function (item, e) {
		this.executeMenuItem(item.getAttribute('data-cmd'), e, this.id);
	};

	ns.Menu.prototype.executeMenuItem = function (id, e, menuId) {
		var handled = false;
		if (this.opener.selectMenuItem){
			this.opener.selectMenuItem(id, e, this.id);
			handled = true;
		} else if (this.opener.executeMenuItem){
			this.opener.executeMenuItem(id, e, menuId);
			handled = true;
		}
		if (handled){
			if (!this.preventRedraw){
				this.drawAllItems(this.el); // Gives visual feedback of changes to enabled states, radios, etc.
			}
		}
		this.callMethodNameAfterDelay('delayedCloseAll', 100, e);
	};

	ns.Menu.prototype.addCheckbox = function (div, id, checked) {
		var checkbox = document.createElement('button');
		checkbox.classList.add('btn');
		checkbox.classList.add('sprite');
		checkbox.classList.add('menu-checkbox');
		if (checked){
			checkbox.classList.add('checked');
		}
		checkbox.addEventListener('click', this.onCheckboxClick.bind(this, id), false);
		div.appendChild(checkbox);
	};

	ns.Menu.prototype.addCheckmark = function (div, id, checked) {
		void(id);
		var checkmark = document.createElement('div');
		checkmark.classList.add('sprite');
		checkmark.classList.add('menu-checkmark');
		if (checked){
			checkmark.classList.add('checked');
		}
		div.appendChild(checkmark);
	};

	ns.Menu.prototype.addRadio = function (div, id, checked) {
		void(id);
		var radio = document.createElement('div');
		radio.classList.add('sprite');
		radio.classList.add('menu-radio');
		if (checked){
			radio.classList.add('checked');
		}
		div.appendChild(radio);
	};

	ns.Menu.prototype.onItemEnter = function (submenuId, e) {
		this.cancelSubmenuTimer();
		var alreadyOpen = (this.submenu) ? (this.submenu.id === submenuId) : false;
		if (!alreadyOpen){
			this.closeSubmenu();
			if (submenuId !== ''){
				this.startSubmenuTimer(submenuId, e);
			}
		}
	};

	ns.Menu.prototype.onItemLeave = function (submenuId) {
		if (submenuId !== ''){
			this.cancelSubmenuTimer();
		}
	};

	ns.Menu.prototype.cancelSubmenuTimer = function () {
		if (this.submenuTimerID !== null){
			window.clearTimeout(this.submenuTimerID);
		}
		this.submenuTimerID = null;
	};

	ns.Menu.prototype.startSubmenuTimer = function (submenuId, e) {
		this.cancelSubmenuTimer();
		var that = this;
		this.submenuTimerID = window.setTimeout( function(){
			that.openSubmenu(submenuId, e);
		}, 500); // TODO: make this delay a constant
	};

	ns.Menu.prototype.openSubmenu = function (submenuId, e) {

		

		var desktopRect = ns.Desktop.getRect(true);
		var openerRect = e.target.getBoundingClientRect();

		var xOffset = ns.Menus.SUBMENU_X_OFFSET;

		if (this.options.hasOwnProperty('submenuXOffset')){
			xOffset = this.options.submenuXOffset;
		}

		var submenuX = openerRect.right - desktopRect.left + xOffset;

		var submenuY = openerRect.top - desktopRect.top;

		var options = [];
		if (this.options.classes){
			options.classes = this.options.classes;
		}

		this.submenu = new ns.Menu(submenuId, ns.Menus.getDefinition(submenuId), this, new ns.Point(submenuX, submenuY), options);

		// If a submenu gets cut off on the right, put it on the left
		var rect = this.submenu.el.getBoundingClientRect();
		var x, y;
		if (rect.right > desktopRect.right){
			x = openerRect.left - desktopRect.left - rect.width;
			y = this.submenu.position.y;
			this.submenu.setPosition(x, y);
		}
		// If hanging off bottom, shift up
		if (rect.bottom > desktopRect.bottom){
			x = this.submenu.position.x;
			y = openerRect.bottom - desktopRect.top - rect.height;
			this.submenu.setPosition(x, y);
		}
		return this.submenu;
	};

	ns.Menu.prototype.closeSubmenu = function () {
		if (this.submenu){
			//console.log('close submenu' );
			this.submenu.close();
			this.submenu = null;
		}
	};

	ns.Menu.prototype.onCheckboxClick = function (id, e) {
		this.handleCheckboxClick(e.target, id, e);
		ns.suppressDefault(e);
	};

	ns.Menu.prototype.handleCheckboxClick = function (checkbox, id, e) {
		// Usually a checkbox is a simple toggle, but sometimes a checkbox can be checked but not unchecked, like a radio button.
		// The menu assumes a checkbox is a toggle, unless the opener tells it otherwise.
		var menuItem = ns.Views.getParentNodeWithClassName(checkbox, ns.Menus.MENU_ITEM_STYLE);
		if (!menuItem.classList.contains('disabled')){
			var checked = checkbox.classList.contains('checked');
			var uncheckable = true;
			var isValid = (id) ? (id !== '') : false;
			if (isValid){
				if (this.opener.isNotUncheckable){
					uncheckable = !this.opener.isNotUncheckable(id);
				}
			}
			if (checked){
				if (uncheckable){
					checkbox.classList.remove('checked');
				}
			} else {
				checkbox.classList.add('checked');
			}
			if (isValid){
				if (this.opener.checkMenuItem){
					this.opener.checkMenuItem(id, this);
				}
				this.callMethodNameAfterDelay('delayedCloseAll', 100, e);
			}
		}
	};

	ns.Menu.prototype.checkMenuItem = function (id) {
		if (this.opener.checkMenuItem){
			this.opener.checkMenuItem(id, this);
		}
	};

	ns.Menu.prototype.delayedCloseAll = function (e) {
		ns.Menus.closeAll(e);
	};

	ns.Menu.prototype.addIcon = function (div, style) {
		var icon = document.createElement('div');
		icon.classList.add('sprite');
		icon.classList.add(style);
		div.appendChild(icon);
	};

	ns.Menu.prototype.showUnchecked = function (id) {
		var checkbox = this.getCheckboxById(id);
		if (checkbox){
			checkbox.classList.remove('checked');
		}
	};

	ns.Menu.prototype.getCheckboxById = function (id) {
		var div = this.getItemById(id);
		return div.querySelector('.menu-checkbox');
	};

	ns.Menu.prototype.simulatedSubmenuOpen = function (id) {
		return this.openSubmenu(id, {target: this.getItemById(id) });
	};

	ns.Menu.prototype.getItemById = function (id) {
		return this.el.querySelector("[data-cmd='" + id + "']");
	};

})();
