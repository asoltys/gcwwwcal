/*!
 * Calendar interface v1.23 / Interface du calendrier v1.23
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * www.tbs.gc.ca/ws-nw/wet-boew/terms / www.sct.gc.ca/ws-nw/wet-boew/conditions
 */
var eventsCalendar= {
	init: function(){
		var date = (new Date);
		var year = date.getFullYear();
		var month = date.getMonth();
		
		$('.wet-boew-calendar-events').each(function(index, value) {
			if(value.hideEvents || value.hideEvents == 'true' ||  value.hideEvents == 1 ||  value.hideEvents == '1'){
				$(this).addClass("cn-invisible");
			}
			
			if ($('.year', this) && $('.month', this)) {
				year = $('.year', this).text(); // we are going to assume this is always a number
				if ($('.month', this).hasClass('textformat')) {
					var digit = $.inArray($('.month', this).text(), calendar.dictionary.monthNames);
					month = digit;
				} else {
					month = $('.month', this).text() - 1;
				}
			}
			
			var events = eventsCalendar.getEvents(this);
			var containerid = $(this).attr('class').split(' ').slice(-1);
            
            if($("#cn-centre-col-inner").css("padding-left") == "0px") {
                $("#" + containerid).css("margin-left", "10px");
            }

			$("#" + containerid).bind("calendarDisplayed", function (e, year, month, days) {
				eventsCalendar.addEvents(year, month, days, containerid, events.list);
				eventsCalendar.showOnlyEventsFor(year,month, containerid);
			});
			calendar.create(containerid, year, month, true, calendar.getISOStringFromDate(events.minDate), calendar.getISOStringFromDate(events.maxDate));
		});
		
	},
	
	getEvents: function (obj) {
		// set some defaults due to classing over-rides
		var direct_linking = ($(obj).hasClass('event-anchoring')) ? false : true ; // do we want to link to event calendar or not - this will forced the links in the calendar to be page id if true
		var events =
		{
			minDate:null, 
			maxDate:null, 
			iCount: 0,
			list:[
				{
					a:1
				}
			]
		};
		
		var objEventsList = null;
		if ($("ol", obj).length > 0) {
			objEventsList = $("ol", obj);
		}
		else if ($("ul", obj).length > 0) {
			objEventsList = $("ul", obj);
		}
		
		if (objEventsList != null){
			objEventsList.children("li").each(function(e){
				var event = $(this);
				var _objTitle = event.find("*:header:first");
				var title = _objTitle.text();
				var _origLink = event.find("a").first();
				var link = _origLink.attr("href");
				/*** Modification direct-linking or page-linking
				*     - added the ability  to have class set the behaviour of the links
				*     - default is to use the link of the item as the event link in the calendar
				*     - 'event-anchoring' class dynamically generates page anchors on the links it maps to the event
				* ***/
				if (!direct_linking){
					var link_id = (event.attr('id')) ? event.attr('id') : eventsCalendar.randomId(6);
					event.attr("id",link_id );
					
					//Fixes IE tabbing error (http://www.earthchronicle.com/ECv1point8/Accessibility01IEAnchoredKeyboardNavigation.aspx)
					if ( /MSIE/.test(navigator.userAgent) ) { event.attr("tabindex", "-1")};
					
					link = "#" + link_id;
				}
				/*** Modification XHTML 1.0 strict compatible
				*    - XHTML 1.0 Strict does not contain the time element
				****/
				var date = (new Date);
				var tCollection = event.find("time, span.datetime");
				/** Date spanning capability
				*   - since there maybe some dates that are capable of spanning over months we need to identify them
				*     the process is see how many time nodes are in the event. 2 nodes will trigger a span
				*/
				if (tCollection.size() > 1){
					// this is a spanning event
					var strDate1 = ( $(tCollection[0]).get(0).nodeName.toLowerCase() == 'time' ) ? $(tCollection[0]).attr("datetime").substr(0, 10).split("-") :  $(tCollection[0]).attr("class").match(/datetime\s+\{date\:\s*(\d+-\d+-\d+)\}/)[1].substr(0, 10).split("-") ;
					var strDate2 = ( $(tCollection[1]).get(0).nodeName.toLowerCase() == 'time' ) ? $(tCollection[1]).attr("datetime").substr(0, 10).split("-") :  $(tCollection[1]).attr("class").match(/datetime\s+\{date\:\s*(\d+-\d+-\d+)\}/)[1].substr(0, 10).split("-") ;

					date.setFullYear(strDate1[0], strDate1[1] - 1, strDate1[2]);

					// now loop in events to load up all the days that it would be on tomorrow.setDate(tomorrow.getDate() + 1);
					for ( var z = 0; z < dates.daysBetween( strDate1, strDate2 ) + 1; z++) {

					if (events.minDate == null || date < events.minDate) {
							events.minDate = date;
					}
					if (events.maxDate == null || date > events.maxDate) {
						events.maxDate = date;
					}

					events.list[events.iCount] = { "title": title, "date": new Date(date.getTime()),"href": link };
					date  = new Date( date.setDate(date.getDate() + 1) );
					// add a viewfilter
					if (!_objTitle.hasClass("filter-" + (date.getFullYear()) + "-" + calendar.strPad(date.getMonth()+1,2) ) ) {  _objTitle.addClass("filter-" + (date.getFullYear()) + "-" + calendar.strPad(date.getMonth()+1,2) ) }
						events.iCount++;
					}

				}else if (tCollection.size() === 1){
					// this is a single day event
					var strDate = ( $(tCollection[0]).get(0).nodeName.toLowerCase() == 'time' ) ? $(tCollection[0]).attr("datetime").substr(0, 10).split("-") :  $(tCollection[0]).attr("class").match(/datetime\s+\{date\:\s*(\d+-\d+-\d+)\}/)[1].substr(0, 10).split("-") ;

					date.setFullYear(strDate[0], strDate[1] - 1, strDate[2]);
					
					if (events.minDate == null || date < events.minDate){events.minDate = date;}
					if (events.maxDate == null || date > events.maxDate){events.maxDate = date;}
					events.list[events.iCount] ={"title" : title, "date" : date, "href" : link};
					// add a viewfilter
					if (!_objTitle.hasClass("filter-" + (date.getFullYear()) + "-" + calendar.strPad(date.getMonth()+1,2) ) ) {  _objTitle.addClass("filter-" + (date.getFullYear()) + "-" + calendar.strPad(date.getMonth()+1,2) ) }
					events.iCount++;
				}

			// end of loop through objects/events
			});
		}
		window.events = events;
		return events;
	},

	/*** Modification Random Id generating function
	*  @param sint  - length of randomly generated string
	***/
	randomId: function(sint) {
		var s= '';
		var randomchar = function(){
			var n= Math.floor(Math.random()*62);
			if(n<10) return n; //1-10
			if(n<36) return String.fromCharCode(n+55); //A-Z
			return String.fromCharCode(n+61); //a-z

		}
		while( s.length < sint ) s += randomchar();
		return "id" + s;
	},
	
	addEvents: function(year, month, days, containerid, eventslist){
		var container = $("#" + containerid);
		//Fix required to make up with the IE z-index behavior mismatch
		days.each(function(index, day){
			$(day).css("z-index", 31 - index);
			$(day).css("z-index", 31 - index);
		});
		//Determines for each event, if it occurs in the display month
		//@modification - the author used a jQuery native $.each function for looping. This is a great function, but has a tendency to like HTMLELEMENTS and jQuery objects better. We have modified this to a for loop to ensure that all the elements are accounted for.
		for (var e = 0; e < eventslist.length; e++) {
			var date = new Date(eventslist[e].date);
			
			if (date.getMonth() == month && date.getFullYear() == year){
				var day = $(days[date.getDate()-1]);
                day.removeClass('ui-datepicker-unselectable ui-state-disabled');
				//Gets the day cell to display an event
				var content = day.children("div").html();
				var dayEvents;
				// lets see if the cell is empty is so lets create the cell
				if (day.children("a").size() < 1) {
					day.empty();
					var link = $("<a href=\"#ev-" + day.attr("id") + "\" class=\"calEvent ui-state-default\">" + content + "</a>");
					day.append(link);
					dayEvents = $("<ul class=\"cn-invisible\"></ul>");
					
					//Show day events on mouse over
					day.bind("mouseover", {details: dayEvents}, function(event){
						event.data.details.dequeue();
						event.data.details.removeClass("cn-invisible");
						event.data.details.addClass("ev-details");
					});
					
					//Hide days events on mouse out
					day.bind("mouseout", {details: dayEvents}, function(event){
						event.data.details.delay(100).queue(function (){
							$(this).removeClass("ev-details");
							$(this).addClass("cn-invisible");
							$(this).dequeue();
						});
					});
					
                    link.hover(function(){$(this).addClass("ui-state-hover");});                    
                    link.mouseout(function(){$(this).removeClass("ui-state-hover");})             
                    
					//Show day events when tabbing in
					link.bind("focus", {details: dayEvents}, function(event){
						event.data.details.removeClass("cn-invisible");
						event.data.details.addClass("ev-details");
                        $(this).addClass("ui-state-hover");
					});
					//hide day events when tabbing out
					link.bind("blur", {details: dayEvents}, function(event){
						event.data.details.removeClass("ev-details");
						event.data.details.addClass("cn-invisible");
                        $(this).removeClass("ui-state-hover");
					});
					
					day.append(dayEvents);
				}else{
					// Modificiation - added and else to the date find due to event collions not being handled. So the pionter was getting lost
					dayEvents = day.find('ul.cn-invisible');
				}
				
				var eventDetails = $("<li><a href=\"" + eventslist[e].href +  "\">" + eventslist[e].title + "</a></li>");
				dayEvents.append(eventDetails);
				
				var item_link = eventDetails.children("a");
                
                item_link.hover(function(){$(this).addClass("ui-state-hover");});
                item_link.mouseout(function(){$(this).removeClass("ui-state-hover");});    
				
				//Hide day events when the last event for the day loose focus
				item_link.bind("blur", {details: dayEvents}, function (event) {
					event.data.details.removeClass("ev-details");
                    $(this).removeClass("ui-state-hover");
					event.data.details.addClass("cn-invisible");
				});
				
				//Show day events when tabbing in
				item_link.bind("focus", {details: dayEvents}, function (event) {
					event.data.details.removeClass("cn-invisible");
					event.data.details.addClass("ev-details");
                    $(this).addClass("ui-state-hover");
				});

			} // end of date range visible
		} // end of event list loop
	},

 	 /*** showOnlyEventsFor
	*    - this is s a simplified way of hiding and displaying events that are bound to the months
	*    - TODO: need to incorporate a method for date spans [Completed]
	*    - TODO: simplify filtering method to reduce pernode filtering [completed]
	* @param year
	* @param month
	*/
	showOnlyEventsFor: function (year, month, calendarid){
		$('.'+ calendarid +' li.calendar-display-onshow').addClass('cn-invisible');
//	          $('li.calendar-display-onshow').filter(function(){
//			var times = $(this).find('span.datetime, time');
//			if ( times.length > 1 ) {
//                 		 // there is a date range we need to see if this works
//                  		var date1 = $(times[0]).attr("class").match(/datetime\s+\{date\:\s*(\d+-\d+-\d+)\}/)[1].substr(0, 10).split("-");
//                  		var date2 = $(times[1]).attr("class").match(/datetime\s+\{date\:\s*(\d+-\d+-\d+)\}/)[1].substr(0, 10).split("-");
//
//                  		if ( dates.inRange(new Array(year, month+1, dates.daysInMonth(year,month)), date1, date2 ) || dates.inRange(new Array(year, month+1, 1), date1, date2 ) )
//                  			return true;
//             		 }else{
//                   		var date1 = $(times[0]).attr("class").match(/datetime\s+\{date\:\s*(\d+-\d+-\d+)\}/)[1].substr(0, 10).split("-");
//                   		 if ((date1[0] == year ) && (date1[1] == month+1 ) )
//                     			return true;
//             		 }
//              		return false;
//          	}).removeClass('cn-invisible');
	
		// FIXED: by adding a class to the heading of every event we now can filter view through lazy css-filtering
		$('.'+ calendarid +' li.calendar-display-onshow').has(':header[class*=filter-'+year+'-'+calendar.strPad(parseInt(month)+1,2)+']').removeClass('cn-invisible');
	}

}

// Add Style Sheet Support for this plug-in
Utils.addCSSSupportFile(Utils.getSupportPath() + "/eventscalendar/styles.css");

// Loads a library that the plugin depends on from the lib folder
PE.load('calendar/wet-boew.calendar.js');

//Add HTML5Shiv to allow IE8 to select HTML5 tags (such as the time tag)
document.write("<!--[if lt IE 9]><script src=\"http://html5shiv.googlecode.com/svn/trunk/html5.js\"></script><![endif]-->");

$("document").ready(function() {
    eventsCalendar.init();
});