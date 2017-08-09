(function(){

	// FORMAT:  left icon id | title | item id | keyboard command text | submenu id

	'use strict';

	window[window.globalNamespaceName] = window[window.globalNamespaceName] || {};
	var ns = window[window.globalNamespaceName];
	ns.Data = ns.Data || {};

	// TODO: If ns.B2App.prefs.window.numberOfCommandLineWindows is not 'Unlimited', don't include 'New Window' option in the options menu

	ns.Data.menus = {

		LPExport: [
			'|Upload Image',
			'|Copy Image',
			'|Print Component'
		],

		LPWindowOptions: [
        	'|Distribute',
        	'|Best Fit',
        	'|Lock Connected Components',
        	'|Unlock Connected Components',
        	'|Pin Position on Desktop'
        ],

        LPInternal: [
	        '|Check Monid Stats',
	        '|Convert Standard Monitors',
	        '|DGRT',
	        '|Remote Launchpad to',
	        '|SuperFunction Tools'
        ],

        B1NewsPanelOptions: [
			'|Toggle on/off|doNothing',
			'checkmark|Default on|newsDefaultOn',
			'checkmark|Default off|newsDefaultOff'
	    ],

		B1MessagePanelOptions: [
			'checkmark|Default on|messageDefaultOn',
			'checkmark|Default off|messageDefaultOff'
	    ],

		B1CaptureScreen: [
			'|Send via MSG',
			'|Send via IB',
			'|Add NOTE',
			'|Add to FILE',
			'Divider',
			'|Print',
			'|Save',
			'|View',
			'|Copy to Clipboard'
		],

		B1CaptureClipping: [
			'|Send via MSG',
			'|Send via IB',
			'|Add NOTE',
			'|Add to FILE',
			'Divider',
			'|Print',
			'|Save',
			'|View',
			'|Copy to Clipboard'
		],

		LPToolbarLaunchpad: [
			'|New Page',
			'|Pages|||LPToolbarPagesNew',
			'Divider',
			'|Views|||LPToolbarViewsNew',
			'Divider',
			'|Refresh',
			'|Exit Launchpad'
		],

		LPToolbarPagesNew: [
			'|New',
			'|Delete',
			'|Rename',
			'|Send',
			'Divider',
			'|Windows|||LPToolbarWindows',
			'Divider',
			'|Un-share Page|unsharePage',
			'|Open a Page Shared with Me',
			'|Manage Shared Pages',
			'Divider',
			'|Share Page',
			'|Enable Pages Shortcut'
		],

		LPToolbarWindows: [
			'|Panel 1',
			'|Panel 2',
			'|Chart',
			'|Quote Line',
			'|Price Ratios',
			'|Canvas 1'
		],

		LPToolbarViewsNew: [
			'|New',
			'Divider',
			'|Open...',
			'|Open Recent',
			'|Save a Backup',
			'Divider',
			'|Reload this View',
			'|Send this View...',
			'Divider',
			'|Manage Views...'
		],

		LPToolbarRightClick: [
			'toggle|Dock|docked',
			'toggle|Auto Hide|autoHide',
			'Divider',
			'radio|Horizontal|horizontalOrientation',
			'radio|Vertical|verticalOrientation',
			'toggle|Maximize When Dragged To Edge|maximizeOnDragToEdge'
		],

		/*LPToolbarOptions: [
			'toggle|Dock|docked',
			'toggle|Auto Hide|autoHide',
			'Divider',
			'radio|Horizontal|horizontalOrientation',
			'radio|Vertical|verticalOrientation',
			'toggle|Maximize When Dragged To Edge|maximizeOnDragToEdge',
			'Divider',
			'|Launchpad Settings',
			'|Export|||LPToolbarExport',
			'|Help|||LPToolbarHelpNew',
			'Divider',
			'|Window Options|||LPToolbarWindowOptions',
			'|Internal Only|||LPToolbarInternalNew',
			'Divider',
			'|Exit Launchpad'
		],*/

		LPToolbarOptions: [
			'options|Settings|||LPToolbarSettings',
			'export|Export|||LPToolbarExport',
			'help|Help & Feedback|||LPToolbarHelp',
			'Divider',
			'|Window Options|||LPToolbarWindowOptions',
			'|Internal Only|||LPToolbarInternal',
			'Divider',
			'|Exit Launchpad'
		],

		/*LPToolbarWindowOptions: [
        	'|Distribute',
        	'|Best Fit',
        	'checkmark|Always On Top|alwaysOnTop',
        	'|Lock Connected Components',
        	'|Unlock Connected Components',
        	'|Pin Position on Desktop'
        ],*/

        LPToolbarWindowOptions: [
        	'toggle|Always On Top|alwaysOnTop',
        	'toggle|Pin Position on Desktop',
        	'|Add Shortcut',
        	'toggle|Lock Connected Components',
        	'|Unlock This Component'
        ],

		LPToolbarSettings: [
			'|Launchpad Toolbar Settings|toolbarSettingsWindow',
			'Divider',
			'|General Launchpad Settings',
			'|Keyboard Shortcuts',
			'|Linking and Grouping',
			'|Custom Functions',
			'Divider',
			'|Manage Views',
			'Divider',
			'|Monitor Manager',
			'|Chart Manager',
			'|Alert Manager',
			'Divider',
			'|Resource Meter'
		],

		LPToolbarInternal: [
			'|Component Id: -1 DBId: -1|componentId',
			'|JavaScript Console',
			'|Widget Debugger',
			'|Info',
			'|Properties',
			'|UX Checker'
		],

		/* LPToolbarInternal: [
	        '|Check Monid Stats',
	        '|Convert Standard Monitors',
	        '|DGRT',
	        '|Remote Launchpad to',
	        'toggle|Launch Components in Schema Mode',
	        '|SuperFunction Tools'
        ], */

		/* LPToolbarInternalNew: [
	        '|Check Monid Stats',
	        '|Convert Standard Monitors',
	        '|DGRT',
	        '|Remote Launchpad to',
	        'toggle|Launch in Schema Mode',
	        '|SuperFunction Tools'
        ], */

		LPToolbarPages: [
	        '|New Page',
	        '|Delete Page',
	        '|Rename Page',
	        '|Save Page As|savePageAs',
	        '|Send Page',
	        'Divider',
	        '|Share Page',
	        '|Un-share Page|unsharePage',
	        '|Open a Page Shared with Me',
	        '|Manage Shared Pages',
	        'Divider',
	        '|Enable Pages Shortcut'
        ],

		/*LPToolbarExport: [
			'|Upload Entire Desktop Image',
			'|Print Components'
		],*/

		LPToolbarExport: [
			'|Send Screenshot to PFM',
			'|Send Desktop Screenshot to PFM',
			'|Copy Component to Clipboard',
			'Divider',
			'|Print Component',
			'Divider',
			'|Print All Desktop',
			'|Print Launchpad only',
			'|Print One Component Per Page',
		],

		LPToolbarHelpNew: [
	        '|Launchpad Help Document',
	        '|Contact Help Desk'
        ],

		LPToolbarMenu: [
			'|Views',
			'|Pages',
			'|Settings',
			'|Tools',
			'|Help',
			'|Internal'
		],

		LPToolbarViews: [
			'|Save View',
			'|Save View As...',
			'|Set Current View as Default',
			'|Sample Views...',
			'|Restore View|||LPToolbarViewsRestore',
			'Divider',
			'|New',
			'|Open...',
			'|Open Recent...',
			'|Reload Current View',
			'|Send...',
			'|View Manager...',
			'|Rename',
			'Divider',
			'|Print|||LPToolbarViewsPrint',
			'Divider',
			'|Exit Launchpad',
		],

		LPToolbarViewsRestore: [
			'|Restore Current View',
			'|Restore View Tool'
		],

		LPToolbarViewsPrint: [
			'|Desktop Snapshot',
			'|Launchpad Only',
			'|One LP Component per page'
		],

        /*LPToolbarPages: [
	        '|New Page...',
	        '|Delete Page...',
	        '|Rename Page...',
	        '|Save Page As...',
	        '|Send Page...',
	        'Divider',
	        '|Share Page...',
	        '|Un-share Page...',
	        '|Open a Page Shared with Me...',
	        '|Manage Shared Pages...',
	        'Divider',
	        '|Enable Page Shortcut',
	        '|Customize Page Button Layout',
	        '|Auto-fit Page Buttons'
        ],

        LPToolbarSettings: [
	        'toggle|Move Entire Launchpad with Toolbar',
	        'toggle|Show LP Components on Task Bar',
	        '|Default View to Load...',
	        'toggle|View Bloomberg Panels as LP Components...',
	        'toggle|Enable Autocomplete on hotspot for all views'
        ],*/

        LPToolbarTools: [
	        '|Group Manager...|openGroupManager',
	        '|Shortcut Manager...',
	        '|View Manager...',
	        '|Sample Views...',
	        '|Monitor Manager...',
	        '|Chart Manager...',
	        '|Alert Manager...',
	        '|Custom Function Window Manager...',
	        '|Resource Meter...'
        ],

        /*LPToolbarHelp: [
	        '|Getting Started...',
	        '|Help Page...',
	        '|Live Help...',
        ],*/

        LPToolbarHelp: [
	        '|Help',
	        '|Feedback',
        ],

		LPChartMenu: [
			'|Actions',
			'|Edit'
		],

		LPMonitorMenu: [
			'|Monitor',
			'|View',
			'|Indicators',
			'|News|||LPMonitorNews'
			/*,
			'|Link To'
			*/
		],

		LPMonitorMonitor: [
			'|Manage Hotspot Dropdown...',
			'|Manage Monitors...',
			'Divider',
			'|Rename...',
			'|Duplicate',
			'|Share...',
			'|Send Via MSG...',
			'|Import Securities...',
			'Divider',
			'|Print',
			'|Export to Excel',
			'Divider',
			'|Advanced Settings...',
			'|Help',
			'|Feedback',
			'Divider',
			'|Close'
		],

		LPMonitorView: [
			'|Group By...',
			'|Summary Statistics...',
			'|Sort...',
			'Divider',
			'toggle|Freeze Rows',
			'toggle|Show Column Headings',
			'|Unhide All Columns',
			'|Unhide All Rows',
			'toggle|Show Filter Row',
			'toggle|Show Status Bar',
			'Divider',
			'|Panes|||LPMonitorViewPanes',
			'|Zoom|||LPMonitorViewZoom',
			'|Row Heights...',
			'|Color Themes...',
			'Divider',
			'|Column Visualization...',
			'|Manage Columns...',
			'Divider',
			'|Refresh'
		],

		LPMonitorViewPanes: [
			'toggle|Single Pane',
			'toggle|Two Panes',
			'toggle|Three Panes',
			'toggle|Four Panes',
			'toggle|Five Panes',
			'toggle|Six Panes',
			'toggle|More than six panes',
			'Divider',
			'|Freeze Panes...',
			'toggle|Enable Vertical Scrollbar'
		],

		LPMonitorViewZoom: [
			'toggle|50%',
			'toggle|55%',
			'toggle|60%',
			'toggle|65%',
			'toggle|70%',
			'toggle|75%',
			'toggle|80%',
			'toggle|85%',
			'toggle|90%',
			'toggle|95%',
			'toggle|100%',
			'toggle|125%',
			'toggle|150%',
			'toggle|200%',
			'toggle|250%',
			'toggle|300%',
			'toggle|Custom Zoom...'
		],

		LPMonitorIndicators: [
			'|Price and Volume Outliers',
			'Divider',
			'|Alerts|||LPMonitorIndicatorsAlerts',
		],

		LPMonitorIndicatorsAlerts: [
			'toggle|Enable Monitor Alerts',
			'Divider',
			'|Create New Monitor Alerts...',
			'|Edit Monitor Alerts...',
			'|Delete All Monitor Alerts',
			'Divider',
			'|Reset All Monitor Alerts'
		],

		LPMonitorNews: [
			'toggle|Show News Alerts/News Heat|showNewsAlerts',
			'Divider',
			'|Event Notifications...',
			'Divider',
			'|Mark All News as Read|||LPMonitorMarkNews',
			'Divider',
			'|View News on All Securities',
			'|View Research on All Securities',
			'|Launch linked News Panel...|launchLinkedNewsPanel'
		],

		LPMonitorMarkNews: [
			'|This Monitor',
			'|On All Monitors'
		],

		LPMonitorLinkTo: [
			'|Intraday Market Map',
			'|Real-Time Permissions',
			'Divider',
			'|Component Groups...',
		],

		LPChartActions: [
			'|G - My Graphs',
			'Divider',
			'|Create New Chart (G1)...',
			'Divider',
			'|Save a Copy...',
			'|Tag Chart...',
			'|Rename...',
			'|Delete...',
			'Divider',
			'|Share...',
			'|Send Update Notice',
			'Divider',
			'|Export|||LPChartExport',
			'|Print',
			'Divider',
			'|Refresh',
			'Divider',
			'|Undo',
			'|Redo'
		],

		LPChartExport: [
			'|Vector Graphics (SVG)',
			'|Image (JPEG, PNG, BMP, TIFF)',
			'|Image (PDF)',
			'|Export to PDF (Images Using Security List)...'
		],

		LPChartEdit: [
			'|Securities &amp; Data...',
			'|Normalization...',
			'|Chart Colors/Styles...',
			'|Date Range...',
			'|Legend Options...',
			'Divider',
			'|Apply Theme To the Chart',
			'|Create Theme From Chart',
			'Divider',
			'|Show View Options',
			'Divider',
			'|Copy Data to Clipboard',
			'|Copy Image to Clipboard',
			'|Copy Region to Clipboard',
			'toggle|Hide Toolbar with Menu'
		],

		LPTabContext: [
			'|Delete Tab|deleteLPTab'
		],

		LPTabOptions: [
			'|Add Tab|addTab',
			'|Customize Tabs...'
		],

		LPNewsMenu: [
			'|Search News',
			'|Sources',
			'|Display &amp; Edit|||LPNewsDisplayAndEdit',
			'|Custom Searches',
			'|Settings|||LPNewsSettings'
		],

		LPNewsDisplayAndEdit: [
			'|Save Search',
			'|Set Alert Delivery...',
			'|Edit Languages',
			'|Set as Blue Scrolling News Panel',
			'Divider',
			'|Use Advanced Editor'
		],

		LPNewsSettings: [
			'toggle|Show Title &amp; Criteria|titleAndCriteria',
			'toggle|Toggle Title &amp; Criteria via Options|toggleTCViaOptions',
			'Divider',
			'toggle|Show Search Tabs|showSearchTabs',
			'|Font Size|||fontSize',
			'toggle|Show Read Indicators|showReadIndicators',
			'toggle|Show Best Stories|showBestStories',
			'toggle|Highlight Incoming Headlines|highlightIncomingHeadlines',
			'|Headline Color Highlighting Rules...',
			'Divider',
			'|Wire/Time/Ticker|||wireTimeTicker',
			'toggle|Show Tickers|showTickers'
			/*,
			'Divider',
			'|Open Stories In|||openStoriesIn',
			'Divider',
			'|Add to Security Group',
			'|Add to Monitor Group',
			'Divider',
			'|All News Settings'*/
		],

		fontSize: [
			'toggle|Extra Small|extraSmallFontSize',
			'toggle|Small|smallFontSize',
			'toggle|Normal|normalFontSize',
			'toggle|Large|largeFontSize',
			'toggle|Extra Large|extraLargeFontSize'
		],

		wireTimeTicker: [
			'toggle|Display on Left|displayWTTickerOnLeft',
			'toggle|Display on Right|displayWTTickerOnRight',
			'toggle|Hide|hideWTTicker'
		],

		openStoriesIn: [
			'toggle|Launchpad News Reader|launchpadNewsReader',
			'toggle|Panel 1|panel1',
			'toggle|Panel 1|panel2',
			'toggle|Panel 1|panel3',
			'toggle|Panel 1|panel4'
		],

		IBOptions: [
			'ib_chat|Chat Logs||Ctrl F',
			'ib_contacts|Contacts||Ctrl D',
			'ib_feed|Hide IB Feed||Ctrl E',
			'options|Settings||Ctrl /',
			'Divider',
			'export|Export|||LPExport',
			'help|Help',
			'Divider',
			'custom|zoomControls',
			'Divider',
			'|Component|||LPExport',
			'Divider',
			'|Internal|||LPInternal'
		],

		exportIB: [
			'|Send screenshot via MSG',
			'|Upload screenshot to PFM',
			'|Download screenshot to file...',
			'|Copy screenshot to clipboard',
			'|New Page',
			'Divider',
			'|Print'
		],

		ibHelp: [
			'|Help',
			'|Feedback'
		],

		barBurger: [
			'|New Tab|newTab|Ctrl+T',
			'|New Window|newWindow|Ctrl+N',
			'Divider',
			'custom|zoomControls',
			'Divider',
			'|Workspaces|||barWorkspaces',
			'|Pages|||barPages',
			'Divider',
			'|Toolbar Settings|||barSettings',
			'Divider',
			'options|Bloomberg Settings|openBloombergSettings|Ctrl+Shift+,',
			'Divider',
			'|Log Out|logout|OFF&lt;Go&gt;'
		],
		barWorkspaces: [
			'checkmark|Abdul\'s Macbook|abdulsMacbook',
			'checkmark|Office Desktop|officeDesktop',
			'checkmark|Home Computer|homeComputer',
			'checkmark|London Office|londonOffice',
			'Divider',
			'|New Workspace...',
			'|Manage Workspaces...',
			'Divider',
			'|Workspace Settings...'
		],
		barPages: [
			'checkmark|Page 1|page1',
			'checkmark|Page 2|page2',
			//'checkmark|News|news',
			//'checkmark|LP MVP|lpMvp',
			//'checkmark|Empty|empty',
			//'checkmark|Clean|clean',
			'Divider',
			'|Add New Page...',
			'|Manage Pages...'
		],
		barPageContext: [
			'|New Page',
			'|Rename Page',
			'|Remove Page'
		],
		barSettings: [
			'toggle|Dock|docked', // 'checkmark|Dock|docked',
			//'checkmark|Float|floating',
			'Divider',
			'toggle|Auto Hide|autoHide',
			'toggle|Always On Top|alwaysOnTop',
			'Divider',
			'toggle|Show Quick Launcher|quickLauncher',
			'toggle|Show Pages|pages',
			'toggle|Show MSG Indicator|showMSGIndicator'
			/*'checkmark|Dock to the Top|top',
			'checkmark|Dock to the Bottom|bottom',
			'checkmark|Float|floating',
			'checkmark|Auto Hide|autoHide',
			'Divider',
			'toggle|Always On Top|alwaysOnTop',
			'Divider',
			'toggle|Show Quick Launcher|quickLauncher',
			'toggle|Show Pages|pages',
			'toggle|Show MSG Indicator|showMSGIndicator'*/
		],

		windowOptions: [
			// '|New Window|newWindow|Ctrl+N',
			// 'Divider',
			// 'zoom|Zoom||Ctrl+=/Ctrl++',
			//'custom|zoomControls',
			// 'fullscreen|Full Screen||Alt+&lt;Go&gt;',
			// 'Divider',
			//'Divider',
			'options|Window Settings|openBloombergSettings|Ctrl+Shift+,',
			'favorites|Bookmarks|||favorites',
			'Divider',
			'|Internal Only|||internalOnly',
			'Divider',
			'|News/Message Panels|||newsMessagePanels',
			'Divider',
			'|Log Out|logout|OFF&lt;Go&gt;'
		],

		internalOnly: [
			'toggle|Show Legacy Windows|toggleLegacyWindows|Ctrl+Shift+.',
			'toggle|Show Side Panel|toggleSidePanel|Ctrl+Shift+K',
			'toggle|Show Message Indicator|toggleMessageIndicator',
			//'Divider',
			//'|B1 Tiny',
			//'|B1 Small',
			//'|B1 Normal',
			//'|B1 Large'
		],
		newsMessagePanels: [
			'checkmark|None|newsMessagePanelsNone',
			'|News Headlines',
			'|Message|messagePanel',
			'Divider',
			'toggle|Show Controls|toggleShowControls',
			'toggle|Show Scroll Bar|toggleShowScrollBar',
			'Divider',
			'custom|numberOfLines'
		],
		favorites: [
			'favorites|Add Bookmark...|openAddToFavorites',
			'Divider',
			'toggle|Show Bookmarks Bar|toggleFavoritesBar|Ctrl+Shift+B',
			// 'toggle|Show Bookmarks Side Panel|toggleFavoritesSidePanel',
			'|Manage Bookmarks|showFavoriteSettings|BOOK&lt;Go&gt;'
		],
		moreWindowOptions: [
			'toggle|Always On Top|alwaysOnTop',
			'toggle|Lock Window|toggleLocked',
			'toggle|Pin Position to Desktop|pinPositionToDesktop',
			'Divider',
			'|Fill Empty Space',
			'|Zoom Content to Window',
			'Divider',
			'toggle|Show Message Indicator|showMessageIndicator'
		],
		default: ['|Paste']
	};
})();
