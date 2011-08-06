/*!
 * jQuery PDF Pager, v0.9, June 30, 2011
 * 
 * Copyright 2011, Jason Crane
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */
 
;(function($) {

    $.pdfPager = function( element, options ) {	
			
			// default settings
			var settings = {
			
				// required path to folder containing pdfs on server
				pdfFolder: '',
				
				// required total number of pdfs to be displayed
				pages: null,
				
				// optional base url for pdf viewer
				// allows for override of google docs pdf viewer 
				// potentially could use zoho's service or something else 
				viewerBaseUrl: 'http://docs.google.com/viewer?embedded=true&url=',
				
				// optional number of pdf to start with
				startPage: 1,
				
				// optional path to config file that would contain object with pages variable, possibly others
				// useful if you don't know how many pdfs there will be ahead of time
				// if, for example, a publication varies between 36 and 40 pages each week
				// and a back-end process spits the pdfs into a folder for you
				config: null,
				
				// optional callback trigged when the page is changed (prev/next click or input change);
				onChange: function() {},
				
				// optional namespace
				namespace: ''
			};
			
			
			var plugin = this;
			
			// hold merged settings and make them available
			plugin.settings = {};
			
			var $element = $(element);
			
			// declare variables
			var namespace, url,
				
				// cache jquery object
				$el = this,
				
				// this is used to determine if an input change was triggered
				// by a click of next or prev, so the change event of loading
				// a new pdf can be suppressed if it is
				isClickEvent = false;
				
			
			// create navigation elements
			function createNav() {
								
				// declare variables
				// wrap the iframe in a namespaced div
				var wrapper = $element.wrap('<div id="' + namespace + '-wrapper" />'),
				
					// get iframe width
					width = $element.width(),
					
					// create the nav container
					nav = $('<div id="' + namespace + '-pdf-nav" class="pdf-nav" style="width: ' + width + 'px" />'),
					
					// create the 'previous' link
					prevLink = $('<a id="' + namespace + '-prev" class="pdf-nav-link pdf-prev" href="#"/>'), 
					
					// create the 'next' link
					nextLink = $('<a id="' + namespace + '-next" class="pdf-nav-link pdf-next" href="#"/>'), 
					
					// create the input that allows changing pdfs by entering a number
					input = $('<input id="' + namespace + '-page-input" type="text" class="page-input" value="' + settings.startPage + '" />'),
					
					// create container for the total number of pages
					total = $('<span id="total-pages">' + settings.pages + '</span>');
				
				// append the previous text
				prevLink.append('<span>&laquo; Previous</span>');
				
				// append the next text
				nextLink.append('<span>Next &raquo;</span>');
				
				// append new elements to the nav
				nav.append(prevLink, input, ' of ' , total, nextLink);
				
				// insert the nav before the iframe
				nav.insertBefore($element);
			}
			
			// click event callback function
			// accepts object that was clicked
			function clickHandler(e, $this) {
								
				// prevent default click event
				e.preventDefault();
				
				// declare variables
				var isPrev, adjustment, navAlertText;
				
				// was prev clicked?
				if ( $this.attr('id') === namespace + '-prev') {
					
					// set boolean so we know we're going backwards
					isPrev = true;
					
					// going backwards, so subtract 1 from current page
					adjustment = -1;
					
					// set alert message to be used if user is viewing the first page already
					navAlertText = 'You\'re already viewing the first page.';
					
				}
				
				if ( $this.attr('id') === namespace + '-next') {
					
					// set boolean so we know we're going forward
					isPrev = false;
					
					// going forward, so add 1 to current page
					adjustment = 1;
					
					// set alert message to be used if user is viewing the last page already
					navAlertText = 'You\'re already viewing the last page.';
				}
				
				// get the current page from the iframe's 'currPage' data
				var currPage = $element.data('currPage');

				// if user is on first page and is going backwards
				// or if user is on last page and going forward
				if ( ( currPage === 1 && isPrev === true ) || ( currPage === settings.pages.toString() && isPrev === false ) ) {
				
					// tell the user they're going the wrong way
					alert(navAlertText);
					
					return false;
				
				}
				
				else {
					
					// add or subtract 1 from the current page number
					// also make sure it's a number and not a string
					currPage = parseFloat(currPage) + adjustment;
					
					// turn that into a string to add to the url
					var currPageStr = currPage.toString();
					
					// change the iframe src attribute to get the new pdf
					// and update the 'currPage' data						
					$element.attr('src',url + currPageStr + '.pdf').data('currPage', currPage);
					
					// set variable telling input's change event that we clicked
					// and so it doesn't need to do anything further
					isClickEvent = true;
					
					// set the new page number in the input
					$('#' + namespace + '-page-input').val(currPage);
					
					// call the onChange callback
					settings.onChange.call(this);
					
					// reset isClickevent to false so an input change is allowed again
					isClickEvent = false;
				
				}
				
			}
			
			// set up click and change events for nav
			function handleEvents() {
				
				// nav link click event, namespaced in case we want to unbind / .die() / later on
				$('.pdf-nav-link', '#' + namespace + '-pdf-nav').live('click.' + namespace, function(e) {
					
					// click callback, pass clicked element as argument 
					clickHandler( e, $(this) );
					
				});
				
				// test namespaced events
				/* $('h1').click(function() {
					alert('yay');
					$('.pdf-nav-link', '#' + namespace + '-pdf-nav').die('click.' + namespace);
				}); */
				
				// page input change event
				$('#' + namespace + '-page-input').live('change', function() {
					
					// a click event changes the value of the input
					// so we check if this was a click event (set by clickHandler)
					// and ignore the change if that's the case
					if (isClickEvent) {
						return;
					}
					
					// cache the input
					var $this = $(this);
					
					// get the value
					var val = $this.val();
					
					// make the value a number
					var valNum = parseFloat(val);
					
					// it's not a click event
					isClickEvent = false;
					
					// make sure the entered number is within the valid range
					if (valNum > 0 && valNum <= settings.pages) {
						
						// get the new pdf
						$element.attr('src',url + val + '.pdf');
						
						// update the currPage data
						$element.data('currPage', valNum);
						
						// call the onChange callback
						settings.onChange.call(this);
					
					}
					
					else {
						
						// reset the input value to the current page
						$this.val($element.data('currPage'));
						
						// notify the user to enter a valid page number
						alert('Please enter a page number between 1 and ' + settings.pages + ' to view that page.');
					
					}
				
				});
				
			}
			
			plugin.init = function() {
				
				// return if no options object, have to have a pdf folder and the number of pdfs
				// any of those options could be set in a config file, though
				if ( !options ) {
					return;
				}
		
				// merge the options passed in with the default settings object
				$.extend( settings, options );
												
				if (settings.namespace.length) {
					namespace = settings.namespace;
				}
				
				else {
					namespace = element.id;
				}
				
				// build url for pdf viewer
				url = settings.viewerBaseUrl + settings.pdfFolder + '/';
				
				// set the iframe to pull the starting pdf 
				$element.attr('src',url + settings.startPage.toString() + '.pdf').data('currPage',settings.startPage);
				
				// create navigation element
				createNav();
				
				// set up event handling
				handleEvents();
			};
			
			// get a config file, formatted as JSON, that can contain settings not known at runtime
			function getConfig() {
				
				$.getJSON(options.config, function(data) {
					
					// if we're setting the pages variable
					// it needs to be converted from a string to a number
					if (data.pages) {
						data.pages = parseFloat(data.pages);
					}
					
					// merge these new settings with the plugin's settings object
					$.extend(settings, data);
					
					// initialize the plugin
					plugin.init();
					
				});
			
			}
			
			if (options.config) {
				getConfig();
			}
			
			else {
				plugin.init();
			}
						
		};	
			
		$.fn.pdfPager = function( options ) {	
			
			// public return 
			return this.each(function() {
				
				// if plugin has not already been attached to the element
				if (undefined === $(this).data('pdfPager')) {
					
					// create new instance of the plugin
					var plugin = new $.pdfPager(this, options);

					// store reference to plugin object
					$(this).data('pdfPager',plugin);		
				}	
				
			});			
		};
})(jQuery);