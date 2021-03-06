/*!
 * Calendar interface v1.23 / Interface du calendrier v1.23
 * Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)
 * www.tbs.gc.ca/ws-nw/wet-boew/terms / www.sct.gc.ca/ws-nw/wet-boew/conditions
 */
var calendar = {
	// Used to store localized strings for your plugin.
	dictionary : { 
		weekDayNames : (PE.language == "eng") ? ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] : ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"],
		monthNames : (PE.language == "eng") ? ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"] : ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"],
		currentDay : (PE.language == "eng") ? " (Current Day)" : " (Jour courrant)",
		goToLink :  (PE.language == "eng") ? "Go To<span class=\"cn-invisible\"> Month of Year</span>" : "Aller au <span class=\"cn-invisible\"> mois de l'année</span>",
		goToTitle :  (PE.language == "eng") ? "Go To Month of Year" : "Aller au mois de l'année",
		goToMonth : (PE.language == "eng") ? "Month:" : "Mois : ",
		goToYear : (PE.language == "eng") ? "Year:" : "Année : ",
		goToButton : (PE.language == "eng") ? "Go" : "Aller",
		cancelButton : (PE.language == "eng") ? "Cancel" : "Annuler",
		previousMonth : (PE.language == "eng") ? "Previous Month: " : "Mois précédent : ",
		nextMonth : (PE.language == "eng") ? "Next Month: " : "Mois suivant : "
	},
	
	create: function (containerid, year, month, shownav, mindate, maxdate){
		var objCalendar;
		var container = $('#' + containerid);
		
		container.addClass("cal-container ui-datepicker ui-widget ui-widget-content wet-ui-helper-clearfix ui-corner-all");
		container.removeClass("cal-container-extended");
		
		//Converts min and max date from string to date objects
		var minDate = calendar.getDateFromISOString(mindate);
		if (minDate == null){
			minDate = (new Date);
			minDate.setFullYear(year-1, month,1);
		}
		var maxDate = calendar.getDateFromISOString(maxdate);
		if (maxDate == null){
			maxDate = (new Date)
			maxDate.setFullYear(year+1, month,1);
		}
		
		//Validates that the year and month are in the min and max date range
		if (year > maxDate.getFullYear() || (year ==  maxDate.getFullYear() && month > maxDate.getMonth())){
			year = maxDate.getFullYear();
			month = maxDate.getMonth();
		}else if(year < minDate.getFullYear() || (year == minDate.getFullYear() && month < minDate.getMonth())){
			year = minDate.getFullYear();
			month = minDate.getMonth()
		}
		
		//Reset calendar if the calendar previously existed
		if(container.children("div#cal-" + containerid +"-cnt").length > 0){
			container.children("div#cal-" + containerid +"-cnt").find("ol#cal-" + containerid +"-weekdays, .cal-month, div#cal-" + containerid +"-days").remove();
			objCalendar = container.children("div#cal-" + containerid +"-cnt");
		}else{
			objCalendar = $("<div id=\"cal-" + containerid +"-cnt\" class=\"cal-cnt\"></div>");
			container.append(objCalendar);
		}
        
		//Creates the calendar header
		var calHeader 
		if (container.children("div#cal-" + containerid +"-cnt").children(".cal-header").length > 0){
			calHeader = container.children("div#cal-" + containerid +"-cnt").children(".cal-header")
		}else{
			calHeader = $("<div class=\"cal-header ui-datepicker-header ui-widget-header wet-ui-helper-clearfix ui-corner-all\"></div>");
		}
		
		calHeader.prepend("<div class=\"cal-month\">" + this.dictionary.monthNames[month] + " " + year + "</div>" );
		
		if(shownav){
			//Create the month navigation
			var monthNav = this.createMonthNav(containerid, year, month, minDate, maxDate)
			if ($("#cal-" + containerid + "-monthnav").length < 1){
				calHeader.append(monthNav);
			}
			
			if (container.children("div#cal-" + containerid +"-cnt").children(".cal-header").children(".cal-goto").length < 1){
				//Create the go to form
				calHeader.append(this.createGoToForm(containerid, year, month, minDate, maxDate));
			}
		}
		objCalendar.append(calHeader);
		
		//Create the calendar body
		
		//Creates weekdays | Cree les jours de la semaines
		objCalendar.append(this.createWeekdays(containerid));
		
		//Creates the rest of the calendar | Cree le reste du calendrier
		var days = this.createDays(containerid, year, month)
		var daysList = days.children("ol.cal-day-list").children("li");
		objCalendar.append(days);
        
		//Trigger the calendarDisplayed Event
		container.trigger('calendarDisplayed', [year, month, daysList]);
	},
	
	createMonthNav : function (calendarid, year, month, minDate, maxDate){
		var monthNav
		if ($("#cal-"+ calendarid +  "-monthnav").length > 0){
			monthNav = $("#cal-"+ calendarid +  "-monthnav");
		}else{
			monthNav = $("<div id=\"cal-" + calendarid +  "-monthnav\"></div>")
		}
		
		//Create month navigation links | Cree les liens de navigations
		for(n=0;n<2;n++){
			var suffix;
			var titleSuffix;
			var newMonth;
			var newYear;
			var showButton = true;
			var btnCtn = null;
			var btn = null;
			//Set context for each button
			switch(n){
				case 0:
					suffix = "prevmonth";
					titleSuffix = this.dictionary.previousMonth;
					if (month > 0){
						newMonth = month-1;
						newYear = year;
					}else{
						newMonth = 11;
						newYear = year - 1;
					}
					
					if ((newMonth< minDate.getMonth() && newYear <= minDate.getFullYear()) || newYear < minDate.getFullYear()){
						showButton = false;
					}
					break;
				case 1:
					suffix = "nextmonth";
					titleSuffix = this.dictionary.nextMonth;
					if (month<11){
						newMonth = month + 1
						newYear = year;
					}else{
						newMonth = 0;
						newYear = year + 1;
					}
					
					if ((newMonth > maxDate.getMonth() && newYear >= maxDate.getFullYear()) || newYear > maxDate.getFullYear()){
						showButton = false;
					}
					break;
			}
			
			if (monthNav.children(".cal-" + suffix).length > 0){
				btnCtn = monthNav.children(".cal-" + suffix);
			}
			if (showButton){
				var title = titleSuffix + this.dictionary.monthNames[newMonth] + " " + newYear;
                
				if (btnCtn){
					btn = btnCtn.children("a")
					btn.children("img").attr("alt", title);
					btn.unbind();
				}else{
					btnCtn = $("<div class=\"cal-" + suffix + "\"></div>");
                    
                    if(suffix == 'nextmonth') { 
                        btn = $("<a href=\"javascript:;\" role=\"button\" title=\"" + title + "\" class=\"ui-datepicker-next ui-corner-all\"><span class=\"ui-icon ui-icon-circle-triangle-e\"></span></a>")
                    }
                    else {
                        btn = $("<a href=\"javascript:;\" role=\"button\" title=\"" + title + "\" class=\"ui-datepicker-prev ui-corner-all\"><span class=\"ui-icon ui-icon-circle-triangle-w\"></span></a>")
                    }

					btnCtn.append(btn);
					monthNav.append(btnCtn);
				}
				btn.bind('click', {year: newYear, month : newMonth, mindate: calendar.getISOStringFromDate(minDate), maxdate: calendar.getISOStringFromDate(maxDate)},function(event){
					calendar.create(calendarid, event.data.year, event.data.month, true, event.data.mindate, event.data.maxdate);
					$(this).focus()
				});
			}else{
				if (btnCtn){
					btnCtn.remove();
				}
			}
		}
		return monthNav;
	},
	
    yearChanged : function(event){
        var year = $(this).val(),
            minDate = event.data.minDate,
            maxDate = event.data.maxDate,
            monthField = event.data.monthField;
        
        var minMonth=0, maxMonth=11;
        if(year == minDate.getFullYear()) {
            minMonth = minDate.getMonth();
        }

        if(year == maxDate.getFullYear()) {
            maxMonth = maxDate.getMonth();
        }

        var month = monthField.val();

        // Can't use monthField.empty() or .html('') on <select> in IE
        // http://stackoverflow.com/questions/3252382/why-does-dynamically-populating-a-select-drop-down-list-element-using-javascript
        while(monthField.children('option').length) {
            monthField.get(0).remove(0);
        }
        
        for(var i=minMonth; i<=maxMonth; i++){ // TODO: make sure minMonth < maxMonth
			monthField.append("<option value=\"" + i + "\"" + ((i == month)? " selected=\"selected\"" : "") + ">" + calendar.dictionary.monthNames[i] + "</option>");
		}
    },
    
	createGoToForm : function (calendarid, year, month, minDate, maxDate){
		var goToForm = $("<div class=\"cal-goto\"></div>");
		var form = $("<form id=\"cal-" + calendarid + "-goto\" role=\"form\" style=\"display:none;\" action=\"\"><fieldset><legend>" + this.dictionary.goToTitle + "</legend></fieldset></form>");
		form.submit(function(){calendar.onGoTo(calendarid, minDate, maxDate); return false});
		var fieldset = form.children("fieldset");

		//Create the year field
		var yearContainer = $("<div class=\"cal-goto-year\"><label for=\"cal-" + calendarid + "-goto-year\" class=\"cn-invisible\">" + this.dictionary.goToYear + "</label></div>")
		var yearField = $("<select id=\"cal-" + calendarid + "-goto-year\"></select>");
		for(var y=minDate.getFullYear();y<=maxDate.getFullYear();y++){
			yearField.append($('<option value="' + y + '"' + (y == year? ' selected="selected"' : '') + '>' + y+ '</option>'));
		}

		yearContainer.append(yearField);
		fieldset.append(yearContainer);

		//Create the list of month field
		var monthContainer = $("<div class=\"cal-goto-month\"><label for=\"cal-" + calendarid + "-goto-month\" class=\"cn-invisible\">" + this.dictionary.goToMonth + "</label></div>");
		var monthField = $("<select id=\"cal-" + calendarid + "-goto-month\"></select>");

		monthContainer.append(monthField);
		fieldset.append(monthContainer);

        // FIXME: Handle month filtering for IE6
        if(jQuery.browser.msie && jQuery.browser.version == '6.0') {
            $(this.dictionary.monthNames).each(function(index, value){
                monthField.append("<option value=\"" + index + "\"" + ((index == month)? " selected=\"selected\"" : "") + ">" + value + "</option>");
            });
        }
        else {
            // Update the list of available months when changing the year
            yearField.bind('change', {minDate: minDate, maxDate: maxDate, monthField: monthField}, this.yearChanged);
            yearField.change(); // Populate initial month list        
        }
        
		var buttonContainer = $("<div class=\"cal-goto-button\"></div>");
		var button = $("<input type=\"submit\" value=\"" + this.dictionary.goToButton + "\" />")
		buttonContainer.append(button);
		fieldset.append(buttonContainer);
		
		var buttonCancelContainer = $("<div class=\"cal-goto-button\"></div>");
		var buttonCancel = $("<input type=\"button\" value=\"" + this.dictionary.cancelButton + "\" />");
		buttonCancel.click(function(){calendar.hideGoToForm(calendarid)});
		buttonCancelContainer.append(buttonCancel);
		fieldset.append(buttonCancelContainer);
		
		var goToLinkContainer = $("<p class=\"cal-goto-link\" id=\"cal-" + calendarid + "-goto-link\"></p>");
		var goToLink = $("<a href=\"javascript:;\" role=\"button\" aria-controls=\"cal-" + calendarid + "-goto\" aria-expanded=\"false\">" + this.dictionary.goToLink + "</a>");
		goToLink.click(function(){calendar.showGoToForm(calendarid);})
		goToLinkContainer.append(goToLink);
		
		goToForm.append(goToLinkContainer);
		goToForm.append(form);
		
		return goToForm;
	},
	
	createWeekdays : function(calendarid){
		var weekdays = $("<ol id=\"cal-" + calendarid +"-weekdays\" class=\"cal-weekdays\" role=\"presentation\"></ol>")
		for (var wd=0;wd<7;wd++)
		{
			var txt = this.dictionary.weekDayNames[wd]
			var wday = $("<li id=\"cal-" + calendarid +"-wd" + (wd + 1) + "\" class=\"cal-wd" + (wd + 1) + " ui-datepicker-week-end\"><abbr title=\"" + txt + "\">" + txt.substr(0,1) + "</abbr></li>")
			if(wd == 0 || wd == 6){
				wday.addClass = "we";
			}
			weekdays.append(wday);
		}
		
		return weekdays
	},
	
	createDays : function(calendarid, year, month){
		var cells = $("<div id=\"cal-" + calendarid +"-days\" class=\"cal-days\"></div>")
		var days = $("<ol id=\"cal-" + calendarid +"-" + month + "_" + year + "\" class=\"cal-day-list\"></ol>")
		
		var date = (new Date);
		//Get the day of the week of the first day of the month | Determine le jour de la semaine du premier jour du mois
		date.setFullYear(year,month,1);
		var firstday = date.getDay();

		//Get the last day of the month | Determine le dernier jour du mois
		date.setFullYear(year, month + 1, 0);
		var lastday = date.getDate()-1;
		
		//Get the current date
		date = (new Date);
		date.getDate();
		
		var daycount = 0;
		var breakAtEnd=false;
		
		for (var week=1;week<7;week++){
			for (var day=0;day<7;day++){
				var element;
				var elementParent;
				if ((week == 1 && day<firstday) || (daycount>lastday)){
					//Creates empty cells | Cree les cellules vides
					element = $("<span class=\"cal-empty\">" + String.fromCharCode(160) + "</span>");
					elementParent = cells;
				}else{
					//Creates date cells | Cree les cellules de date
					daycount++;
					var isCurrentDate = (daycount == date.getDate() && month == date.getMonth() && year == date.getFullYear());
					
					if (daycount == 1){cells.append(days);}
					if (daycount > lastday){breakAtEnd = true;}
					element = $("<li class=\"ui-datepicker-unselectable ui-state-disabled\"></li>");

					// var child = $("<div class=\"ui-state-default ui-datepicker-unselectable ui-state-disabled\"></div>");
                    // var child = $("<div class=\"ui-datepicker-unselectable ui-state-disabled\"></div>");
                    // child = $("<div class=\"ui-state-default\"></div>").appendTo(child);
                    
                    var child = $("<div class=\"ui-state-default\"></div>");

                    if (isCurrentDate){
                        child.addClass("ui-state-highlight");
                    }
                    
					if (PE.language == 'eng'){
						var suffix = ""
						if(daycount>10 && daycount <20){
							suffix="th";
						}else{
							switch(daycount%10){
								case 1:
									suffix="st";
									break;
								case 2:
									suffix="nd";
									break;
								case 3:
									suffix="rd";
									break;
								default:
									suffix="th";
							}
						}
						child.append("<span class=\"cn-invisible\">" + this.dictionary.weekDayNames[day] + " " + this.dictionary.monthNames[month] + " </span>" + daycount + "<span class=\"cn-invisible\">" + suffix + " " + year + ((isCurrentDate)? this.dictionary.currentDay : "") + "</span>");
					}else if (PE.language == 'fra'){
						child.append("<span class=\"cn-invisible\">" + this.dictionary.weekDayNames[day]  + " </span>" + daycount + "<span class=\"cn-invisible\"> " + this.dictionary.monthNames[month].toLowerCase() +  " " + year + ((isCurrentDate)? this.dictionary.currentDay : "") + "</span>");
					}
					element.append(child);
					elementParent = days;
				}
				element.attr("id", "cal-" + calendarid +"-w" + week + "d" + (day+1));
				element.addClass("cal-w" + week + "d" + (day+1) /* + " ui-state-default"*/ );

                element.addClass("cal-index-"+daycount);
                
				if(day == 0 || day == 6){
					element.addClass("cal-we")
				}
				elementParent.append(element);
			}
			if (breakAtEnd){break;}
		}
		
		return cells;
	},
	
	showGoToForm : function(calendarid){
		//Hide the month navigation
		$("#cal-" + calendarid +  "-monthnav").children(".cal-prevmonth, .cal-nextmonth").addClass("cn-invisible");
		$("#cal-" + calendarid +  "-monthnav").children(".cal-prevmonth, .cal-nextmonth").children("a").attr("aria-hidden", "true");
		
		var link = $("#cal-" + calendarid + "-goto-link");
		var form = $("#cal-" + calendarid + "-goto");
		
		link.stop().slideUp(0);
		form.stop().slideDown(0).queue(function(){
			$(this).find(":input:eq(0)").focus()
		});
		
		
		link.children("a").attr("aria-hidden","true");
		link.children("a").attr("aria-expanded","true");
		
		$("#" + calendarid).addClass("cal-container-extended");
	},
	
	hideGoToForm : function(calendarid){
		var link = $("#cal-" + calendarid + "-goto-link");
		var form = $("#cal-" + calendarid + "-goto");
		
		form.stop().slideUp(0).queue(function(){
			//Show the month navigation
			$("#cal-" + calendarid +  "-monthnav").children(".cal-prevmonth, .cal-nextmonth").removeClass("cn-invisible");
			$("#cal-" + calendarid +  "-monthnav").children(".cal-prevmonth, .cal-nextmonth").children("a").attr("aria-hidden", "false");
			
			$("#" + calendarid).removeClass("cal-container-extended");
		});
		link.stop().slideDown(0);
		
		link.children("a").attr("aria-hidden","false");
		link.children("a").attr("aria-expanded","false");
		
		
	},
	
	onGoTo : function(calendarid, minDate, maxDate){
		var container = $("#" + calendarid);
		
		var fieldset = container.find("fieldset");
        var month = parseInt(fieldset.find(".cal-goto-month select option:selected").attr('value'));
		var year = parseInt(fieldset.find(".cal-goto-year select").attr("value"));
		
		if(!(month< minDate.getMonth() && year <= minDate.getFullYear()) && !(month > maxDate.getMonth() && year >= maxDate.getFullYear())){
			calendar.create(calendarid, year, month, true, calendar.getISOStringFromDate(minDate), calendar.getISOStringFromDate(maxDate));
			calendar.hideGoToForm(calendarid);
			
			//Go to the first day to avoid having to tab opver the navigation again.
			$("#cal-" + calendarid + "-days").find("a:eq(0)").focus();
		}
	},
	
	getDateFromISOString : function(strdate){
		var date = null;
		
		if(strdate){
			if (strdate.match(/\d{4}-\d{2}-\d{2}/)){
				var date = (new Date);
				date.setFullYear(strdate.substr(0,4), strdate.substr(5,2)-1,  strdate.substr(8,2)-1)
			}
			
			return date;
		}
		return null;
	},
	
	getISOStringFromDate : function(date){
		return date.getFullYear() + '-' + this.strPad(date.getMonth() + 1,2,'0') + '-' + this.strPad(date.getDate() + 1, 2, '0');
	},
	
	strPad : function(i,l,s) {
		var o = i.toString();
		if (!s) { s = '0'; }
		while (o.length < l) {
			o = s + o;
		}
		return o;
	}
}

/** dates
 *  a date function to help with the data comparison
 */
var dates = {
    convert:function(d) {
        // Converts the date in d to a date-object. The input can be:
        //   a date object: returned without modification
        //  an array      : Interpreted as [year,month,day]. NOTE: month is 0-11.
        //   a number     : Interpreted as number of milliseconds
        //                  since 1 Jan 1970 (a timestamp)
        //   a string     : Any format supported by the javascript engine, like
        //                  "YYYY/MM/DD", "MM/DD/YYYY", "Jan 31 2009" etc.
        //  an object     : Interpreted as an object with year, month and date
        //                  attributes.  **NOTE** month is 0-11.
        return (
            d.constructor === Date ? d :
            d.constructor === Array ? new Date(d[0],d[1]-1,d[2]) :
            d.constructor === Number ? new Date(d) :
            d.constructor === String ? new Date(d) :
            typeof d === "object" ? new Date(d.year,d.month,d.date) :
            NaN
        );
    },
    compare:function(a,b) {
        // Compare two dates (could be of any type supported by the convert
        // function above) and returns:
        //  -1 : if a < b
        //   0 : if a = b
        //   1 : if a > b
        // NaN : if a or b is an illegal date
        // NOTE: The code inside isFinite does an assignment (=).
        return (
            isFinite(a=this.convert(a).valueOf()) &&
            isFinite(b=this.convert(b).valueOf()) ?
            (a>b)-(a<b) :
            NaN
        );
    },
    inRange:function(d,start,end) {
        // Checks if date in d is between dates in start and end.
        // Returns a boolean or NaN:
        //    true  : if d is between start and end (inclusive)
        //    false : if d is before start or after end
        //    NaN   : if one or more of the dates is illegal.
        // NOTE: The code inside isFinite does an assignment (=).
       return (
            isFinite(d=this.convert(d).valueOf()) &&
            isFinite(start=this.convert(start).valueOf()) &&
            isFinite(end=this.convert(end).valueOf()) ?
            start <= d && d <= end :
            NaN
        );
    },

    daysInMonth: function(iYear, iMonth)
    {
        // Simplfied function to allow for us to get the days in specific months
        return 32 - new Date(iYear, iMonth, 32).getDate();
    },
    daysBetween: function(datelow, datehigh) {
        // simplified conversion to date object
        date1 = this.convert(datelow);
        date2 = this.convert(datehigh);
        var DSTAdjust = 0;
        // constants used for our calculations below
        oneMinute = 1000 * 60;
        var oneDay = oneMinute * 60 * 24;
        // equalize times in case date objects have them
        date1.setHours(0);
        date1.setMinutes(0);
        date1.setSeconds(0);
        date2.setHours(0);
        date2.setMinutes(0);
        date2.setSeconds(0);
        // take care of spans across Daylight Saving Time changes
        if (date2 > date1) {
            DSTAdjust =
                (date2.getTimezoneOffset() - date1.getTimezoneOffset()) * oneMinute;
        } else {
            DSTAdjust =
                (date1.getTimezoneOffset() - date2.getTimezoneOffset()) * oneMinute;
        }
        var diff = Math.abs(date2.getTime() - date1.getTime()) - DSTAdjust;
        return Math.ceil(diff/oneDay);
    }


}

// Add Style Sheet Support for this plug-in
Utils.addCSSSupportFile(Utils.getLibraryPath() + "/calendar/cal-base.css");
Utils.addCSSSupportFile(Utils.getSupportPath() + "/ui/themes/default/jquery-ui.css");
// Utils.addCSSSupportFile(Utils.getLibraryPath() + "/calendar/cal-theme.css");
// PE.load_ui();