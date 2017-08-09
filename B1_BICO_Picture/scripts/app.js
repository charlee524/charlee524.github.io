(function(){

	/*

	Weird workspace bug:

	Make sure there are no saved workspaces
	Launch the app
	Log in
	Reload the page
	Open workspace manager

	Note that there is now a saved workspace with "used: null x null"

	*/

	'use strict';

	document.onselectstart = function() { return false; };

	//Comment this line when you need to right-click to inspect elements in the browser:
	document.oncontextmenu = function (e){ return ns.suppressDefault(e); };

	window[window.globalNamespaceName] = window[window.globalNamespaceName] || {};
	var ns = window[window.globalNamespaceName];

	/* globals FontFaceObserver */	// Make JSHint happy

	if (!ns.PrototypeOptions){
		ns.PrototypeOptions = {};
	}

	if (!ns.B2App){
		ns.B2App = {
			B2APP_ID: 'b2app',
			launched: true,
			loggedIn: true,
			logoutDisabled: true,
			autosaveDisabled: false,

			fontsToPreload: ['Bloomberg_Prop', 'Bloomberg_Prop_Bold', 'Bloomberg_Crix', 'Segoe_UI', 'Avenir_reg', 'Avenir_demi', 'Avenir_bold'],

			prefs: {
				ON: 'on',
				OFF: 'off',
				WINDOW_MODE_CLASSIC: 'classic',
				WINDOW_MODE_TABBED: 'tabbed',

				window: {
					mode: 'tabbed', // ns.B2App.prefs.WINDOW_MODE_TABBED,
					numberOfClassicPanels: 4,
					classicSizing: false,
					selectedClassicSize: 'large',
					contentSize: 100,
					showMSGIndicator: true,
					showSidePanel: false,
					showBookmarksBar: false,
					wrapBookmarksButtons: false,
					askBeforeClosePanel: false,
					// The remaining window prefs are deprecated
					defaultSidePanel: false,
					defaultFavoritesBar: false,
					numberOfCommandLineWindows: 'Unlimited',
					enableTabs: true,
					defaultShowMSGIndicator: true,
					showLegacyWindows: false,
					numberOfDefaultWindows: 4   /*  This is used only when logging in for the first time; it can't be changed in the settings dialog */
				},

				// TODO: Rename this 'ns.B2App.prefs.layout' and update all references ??
				workspace: {
					saveAutomatically: true,
					saveRunningFunctions: true,
				},

				printing: {
					printer: '\\\\NYPRINT08\\NY731-6W-S263AP',
					orientation: 'portrait',
					whiteBackground: true,
					grayscale: false,
					twoSided: false,
					pageNumbers: false
				},

				experimental: {
					sidebarActivationState: 'shrink',
					useHLAlgorithm: false,
					allowMultipleWorkspaces: false,
					useB2CodeKeys: true,
					enableGrouping: false,
					screenCacheDuration: 500,
					windowDocking: false,
					applicationRowHeights: 23,
					classicMode: false,
					useSystemChrome: true,
					simpleGoMenu: false,
					simpleSettings: false
				},

				LPToolbar: {
					autoHide: false,
					docking: (ns.LPToolbar) ? ns.LPToolbar.DOCKING_FLOAT : 'floating', // DO NOT DELETE
					orientation: (ns.LPToolbar) ? ns.LPToolbar.DEFAULT_ORIENTATION : ns.Views.HORIZONTAL,
					maximizeOnDragToEdge: true
				},
			}
		};

		ns.B2App.load = function (onComplete) {
			document.addEventListener('DOMContentLoaded', function () {
				ns.B2App.loadFonts(onComplete);
			} );
		};
	
		ns.B2App.loadFonts = function (onComplete) {
			var observer = new FontFaceObserver('Segoe_UI', {});
			observer.check().then(function () {
				ns.B2App.checkBloombergFontLoaded(onComplete);
			}, function () {
				//console.log('Segoe_UI is not available.');
			});
		};

		ns.B2App.checkBloombergFontLoaded = function(onComplete){
			var observer = new FontFaceObserver('Bloomberg_Prop', {});
			observer.check().then(function () {
				ns.B2App.checkBloombergBoldFontLoaded(onComplete);
			}, function () {
				//console.log('Bloomberg_Prop is not available.');
			});
		};

		ns.B2App.checkBloombergBoldFontLoaded = function(onComplete){
			var observer = new FontFaceObserver('Bloomberg_Prop_Bold', {});
			observer.check().then(function () {
				onComplete();
			}, function () {
				//console.log('Bloomberg_Prop_Bold is not available.');
			});
		};

		ns.B2App.openLogoutDialog = function (window, exitAfterLogout) {
			if (ns.LogoutDialog){
				var options = {exitAfterLogout: exitAfterLogout};
				if (ns.MRSLocalStorage){
					if (ns.B2App.blankWorkspace || ns.B2App.remoteDesktopWorkspace){
						options.enableSaveWorkspace = true;
					}
				}
				ns.LogoutDialog.create(window, options);
			}
		};

		/*
		ns.B2App.openWorkspaceManager = function(){
			var options = {
				title: 'Workspace Manager',
				width: 624, height: 516,
				minWidth: 300, minHeight: 150
			};
			var win = ns.B1Window.create(options); // DEPRECATED
			// var win = new ns.B1Window(options); // TO BE REPLACED WITH THIS
			win.maximizeDisabled = true;
			win.positionCentered();
		};
		*/

		ns.B2App.saveNewWorkspaceAndLogOut = function(title){

			// console.log('B2App.saveNewWorkspaceAndLogOut');

			var newWorkspace;
			if (this.remoteDesktopWorkspace){
				newWorkspace = this.remoteDesktopWorkspace;
			} else if (this.blankWorkspace){
				newWorkspace = this.blankWorkspace;
			}
			var windowData = this.getWindowData();
			if (ns.MRSLocalStorage && ns.Workspaces){
				newWorkspace.title = title;
				newWorkspace.windowData = windowData;
				newWorkspace.groupData = ns.LPGroups.getSaveData();
				ns.Workspaces.refreshLastUsedDate(newWorkspace);
				var id = ns.Workspaces.generateWorkspaceId(title);
				ns.MRSLocalStorage.setItem('lastLoadedWorkspace', id);
				ns.MRSLocalStorage.setWorkspace(id, newWorkspace);
				this.blankWorkspace = null;
				this.remoteDesktopWorkspace = null;
				this.autosaveDisabled = true; // Prevents the 'logout' handler from performing a workspace save
			} else {
				this.savedWindowData = windowData;
			}
			this.logOut();
		};

		ns.B2App.handleEvent = function (e) {
			switch(e.type) {

				case 'keydown':
				if (e.keyCode === ns.Keycodes.ALT){
					ns.suppressDefault(e);
				} else if (e.ctrlKey && this.shiftDown && e.keyCode === 83){
					// Ctrl - Shift - S opens a save workspace dialog
					if (ns.SaveWorkspaceCopyDialog){
						ns.SaveWorkspaceCopyDialog.create();
					} else {
						console.log('Received control-key command to open SaveWorkspaceCopyDialog, but the code file "workspaces.js" was not loaded.');
					}
				} else if (e.keyCode === ns.Keycodes.SHIFT){
					this.shiftDown = true;
				} else if (e.keyCode === ns.Keycodes.CTRL){
					if (this.ctrlDown !== true){
						this.ctrlDown = true;
						if (ns.LPWindow){
							ns.LPWindow.onControlKeyChange();
						}
					}
				} else {
					if (ns.Windows){
						var activeWin = ns.Windows.getActive();
						if (activeWin){
							if (e.keyCode === ns.Keycodes.PAUSE){
								if (activeWin.type === ns.BloombergPanel.TYPE && this.loggedIn){
									activeWin.openLogoutDialog();
								}
							} else if (e.keyCode === ns.Keycodes.ENTER){
								if (!this.loggedIn && activeWin !== ns.Windows.loginWindow){
									if (activeWin.onSplashEnterGo){
										activeWin.onSplashEnterGo();
									}
								}
							}
						}
					}
				}
				break;

				case 'keyup':
				if (e.keyCode === ns.Keycodes.SHIFT){
					this.shiftDown = false;
				} else if (e.keyCode === ns.Keycodes.CTRL){
					if (this.ctrlDown){
						this.ctrlDown = false;
						if (ns.LPWindow){
							ns.LPWindow.onControlKeyChange();
						}
					}
				}
				break;
			}
		};

		ns.B2App.launch = function(){
			this.launched = true;
			ns.Taskbar.setButtonSelected(ns.Taskbar.BB_BUTTON_ID, true);
			//this.addAppIcon();
			this.prepareInitialLogin();
		};

		// These two functions were used when there were two different Bloomberg buttons in the task bar a la actual B2 style
		/*
		ns.B2App.addAppIcon = function(){
			var bbAppButton = ns.Taskbar.addButton('b2app', 'taskbar-b2app');
			bbAppButton.setSelected(true);
			this.callMethodNameAfterDelay('fadeDeselectTaskbarBB', 500);
		};

		ns.B2App.fadeDeselectTaskbarBB = function(){
			ns.Taskbar.instance.buttons['bb'].fadeBGAndDeselect();
		};
		*/

		ns.B2App.exit = function(){
			this.launched = false;
			ns.Taskbar.setButtonSelected(ns.Taskbar.BB_BUTTON_ID, false);
			ns.Windows.loginWindow = null;
			var openWindows = ns.Windows.getWindowsByAppId('b2app');
			for (var i=0; i<openWindows.length; i++){
				openWindows[i].close();
			}
			//ns.Taskbar.removeButton('b2app');
		};

		ns.B2App.saveWindowData = function(){

			// console.log( 'B2App.saveWindowData');

			var windowData = this.getWindowData();
			if (ns.MRSLocalStorage){
				var workspace;
				if (this.currentWorkspaceId){
					workspace = ns.MRSLocalStorage.getWorkspaces()[ns.B2App.currentWorkspaceId];
				} else {
					workspace = ns.B2App.blankWorkspace;
				}
				workspace.windowData = windowData;

				workspace.usedRes = ns.Workspaces.getUsedRes(workspace.windowData);

				ns.Workspaces.refreshLastUsedDate(workspace);

				workspace.groupData = ns.LPGroups.getSaveData();

				if (this.currentWorkspaceId){
					ns.MRSLocalStorage.setWorkspace(ns.B2App.currentWorkspaceId, workspace);
				}
			} else {
				this.savedWindowData = windowData;
			}
		};

		ns.B2App.getWindowData = function(){
			var win, i, windowData = [];
			//if (ns.Windows.bloombergBar){
				//windowData.push( ns.Windows.bloombergBar.getSaveData() );
			//}
			for (i=0; i<ns.Windows.windowList.length; i++){
				win = ns.Windows.windowList[i];
				
				if (win.type === ns.BloombergPanel.TYPE || ns.LPWindow.prototype.isPrototypeOf(win)){
				// if (win.type === ns.BloombergPanel.TYPE || win.isLPWindow){


				//if (types.indexOf(win.type) > -1){

					//console.log('saving window:');
					//console.log(win);
					var data = win.getSaveData();
					//position = win.position.copy();
					//size = win.size.copy();
					//var data = {x: position.x, y: position.y, width: size.width, height: size.height, type: win.type};
					windowData.push( data );

				}
				//console.log('------------');
			}
			return windowData;
		};

		ns.B2App.logOut = function(){

			if (this.logoutDisabled){
				//console.log( 'Logging out is disabled!');
			} else {
				//console.log( 'Logging out!');
				this.loggedIn = false;

				if (!this.autosaveDisabled){
					this.saveWindowData();
				}

				this.currentWorkspaceId = null;
				this.blankWorkspace = null;
				this.remoteDesktopWorkspace = null;

				//if (ns.Windows.bloombergBar){
					//ns.Windows.bloombergBar.destroy();
				//}

				if (ns.LPToolbar){
					ns.LPToolbar.destroy();
				}

				if (ns.IB){
					ns.IB.closeWindow();
				}

				if (ns.Notifications){
					ns.Notifications.dismissAll();
				}

				var windows = ns.Windows.getWindowsByAppId(ns.B2App.B2APP_ID);
				var i, win, windowsToClose = [];
				for (i=0; i<windows.length; i++){
					win = windows[i];
					if (win.type !== ns.BloombergPanel.TYPE){
						windowsToClose.push(win);
					}
				}
				for (i=0; i<windowsToClose.length; i++){
					windowsToClose[i].close();
				}
				
				if (ns.Windows.windowList.length === 0){
					this.prepareInitialLogin();
				} else {
					var activeWin = ns.Windows.getActive();
					if (!activeWin){
						ns.Windows.windowList[ns.Windows.windowList.length - 1].activate();
					}
					windows = ns.Windows.getWindowsOfType(ns.BloombergPanel.TYPE); // ns.Windows.getWindowsByAppId(ns.B2App.B2APP_ID);
					for (i=0; i<windows.length; i++){
						win = windows[i];
						if (win.active){
							win.removeContent();
							win.setTabsEnabled(false);
							win.setCommandLineVisible(false);
							win.setIPanelVisible(false);
							win.callMethodNameAfterDelay('makeLoginWindow', 1000);
						} else {
							if (this.logoutOption === ns.PrototypeOptions.CLOSE_OTHER_WINDOWS_ON_LOGOUT){
								win.close();
							} else if (this.logoutOption === ns.PrototypeOptions.WINDOWS_STAY_OPEN_ON_LOGOUT){
								win.showSplash();
							}
						}
					}
					for (i=0; i<ns.Windows.windowList.length; i++){
						win = ns.Windows.windowList[i];
						if (win.updateOptionsWindowControlVisible){
							win.updateOptionsWindowControlVisible();
						}
					}
				}
			}
		};

		ns.B2App.preloadFonts = function(){
			var el = document.createElement('div'), span, i, len = this.fontsToPreload.length;
			for (i=0; i<len; i++){
				span = document.createElement('span');
				span.style.color = 'transparent';
				span.style.fontFamily = this.fontsToPreload[i];
				span.innerHTML = '.';
				el.appendChild(span);
			}
			document.body.appendChild(el);
			setTimeout( function () { document.body.removeChild(el); }, 10);
		};

		ns.B2App.prepareInitialLogin = function(){
			if (!ns.Windows.loginWindow){
				var desktopRect = ns.Desktop.getRect();
				var blankWorkspace = ns.Workspaces.createBlankWorkspace(desktopRect.width, desktopRect.height);
				var winData, i, options, bbWindowData = [];

				for (i=0; i<blankWorkspace.windowData.length; i++){
					winData = blankWorkspace.windowData[i];
					if (winData.type === ns.BloombergPanel.TYPE){
						bbWindowData.push(winData);
					}
				}

				var loginWindowIndex = 0;
				for (i=0; i<bbWindowData.length; i++){
					winData = bbWindowData[i];
					options = {
						x: winData.x,
						y: winData.y,
						width: winData.width,
						height: winData.height,
						noBuildAnimation: true,
						tabsEnabled: false
					};
					if (i === loginWindowIndex){
						options.login = true;
					} else {
						options.splash = true;
					}

					var win = new ns.BloombergPanel( options );

					if (win.scaleToFitContent){
						win.scaleToFitContent();
					}

					/*var childNodes = win.contentArea.childNodes;
					if (childNodes.length > 0){
						var contentRect = childNodes[0].getBoundingClientRect();
						var contentHolderRect = win.contentArea.getBoundingClientRect();
						if ( contentRect.width > contentHolderRect.width ){
							win.setPercentScale( contentHolderRect.width * 100 / contentRect.width );
						}
					}*/

					win.animateIn();
				}

				if (ns.Windows.loginWindow){
					ns.Windows.loginWindow.activate();
					ns.Windows.loginWindow.getContentView().focusNameInput(); // ugly !!!
				}

			}
		};

		ns.B2App.preloadFonts();
		document.body.addEventListener('keydown', ns.B2App, false);
		document.body.addEventListener('keyup', ns.B2App, false);
	}

})();
