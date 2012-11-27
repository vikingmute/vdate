/*!
 * vdate.js v1.0.0 - 2012-11-26
 * By Vikingmute (http://vikingmute.com)
 */

/**
 * TODO: add open & close method in vcalendar object
 */

(function($, window, document, undefined){

 'use strict';

//defualt settings
var settings = {
	lan:"en",
	width:310
}
//language settings

var language = {
	"ch":{
		cal_days_labels : ['日', '一', '二', '三', '四', '五', '六'],
		cal_months_labels : ['一月', '二月', '三月', '四月',
						   '五月', '六月', '七月', '八月', '九月',
						   '十月', '十一月', '十二月'],
		cal_next_month_label:'下一月',
		cal_prev_month_label:'上一月'
	},
	"en":{
		cal_days_labels : ['Sun', 'Mon', 'Tus', 'Wed', 'Thu', 'Fri', 'Sat'],
		cal_months_labels : ['Jan', 'Feb', 'Mar', 'Apr',
						   'May', 'Jun', 'Jul', 'Aug', 'Sep',
						   'Oct', 'Nov', 'Dec'],
		cal_next_month_label:'Next',
		cal_prev_month_label:'Prev'
	}
}
//
var now = new Date(),
	today = new Date(now.getFullYear(), now.getMonth(), now.getDate()),
	now_time = +now,
	today_time = +today,
	one_day = 86400000;

//module to generate the whole canlendar

var vcalendar = (function(){
	var getDaysNum = function (year, month) {
		return 32 - new Date(year, month, 32).getDate();
	}

	var generateTable =function(start){
		var month = start.getMonth(),
			year = start.getFullYear(),
			starting_day = start.getDay(), // Hacking this to make Monday the first day
			month_length = getDaysNum(year, month),
			month_name = language[settings.lan].cal_months_labels[month];
		var html = '<div class="calendar_inner" style="width:'+settings.width+'px"><div class="calendar_month">'
				+ '<a href="###" class="pre_month">'+language[settings.lan].cal_prev_month_label+'</a>' 
				+ '<h3>'+ month_name +' ' +year +'</h3>' 
				+ '<a href="###" class="next_month">'+language[settings.lan].cal_next_month_label+'</a>' 
			+'</div>';
		html += '<table class="calendar_day'
			+ '" cellspacing="0" cellpadding="0" data-month="'
			+ (month + 1)
			+ '" data-year="'
			+ year
			+ '">';
			html += '<thead>';
		
			for(var i = 0; i <= 6; i++ ){
				html += '<th class="calendar-day-label' + ((i == 6) ? ' week_sat' : '') + ((i == 0) ? ' week_sun' : '') + '">'
				+ language[settings.lan].cal_days_labels[i]
				+ '<\/th>';
			}
			html += '<\/tr><\/thead><tbody><tr>';
		var day = start.getDate(),
			len = Math.ceil((month_length + starting_day) / 7),
			date_time = +start;
		for (var i = 0; i < len; i++) {
			// this loop is for weekdays (cells)
			for (var j = 0; j <= 6; j++) { 
				var valid = (day <= month_length && (i > 0 || j >= starting_day));
				if (valid) {
					html += '<td><a class="calendar-day '
					+ ((today_time === date_time) ? ' day_today' : '')
					+ ((today_time > date_time) ? ' day_invalid' : '') + '"'

					+ (valid ? ('data-date="'
					+ year
					+ '-'
					+ ('0' + (month + 1)).slice(-2)
					+ '-'
					+ ('0' + day).slice(-2) + '"') : '')

					+ 'href="#">';
					html += day;
					day++;
					date_time += one_day;
				}
				else {
					html += '<td><a class="day_no '
					+ 'href="#">';
					html += '&nbsp;';
				}
				html += '<\/a><\/td>';
				
				
			}
			// stop making rows if we've run out of days
			if (day > month_length) {
				break;
			} else {
				html += '<\/tr><tr>';
			}
		}
		html += '<\/tr><\/tbody><\/table></div>';

		return {html:html,currentDate:{month:month,year:year}};
	}

	//return the vdate out
	return{
		//the main dom tree
		holder:'',

		//to start it off
		init:function(start){
			this.holder = $('<div class="calendar"></div>');
			$('body').append(this.holder);
			this.holder.html(generateTable(start).html);
			this.bindEvents();
			return this;
		},
		open:function(style){
			this.holder.css('visibility','visible');
			this.holder.css(style);
		},
		close:function(){
			this.holder.css({'height':0});
		},
		bindEvents:function(){
			var self = this
			$(document).bind('click',function(e){
				var $target = $(e.target);
				console.log($target.is(self.holder));
			})
		}
	}

})()




$.fn.vdate = function( options ) {
	var opts = $.extend({},settings,options);
	return this.each(function() {
		var self = $(this);

		var realTime = new Date();
		var start = new Date(realTime.getFullYear(),realTime.getMonth());
		var vobj = vcalendar.init(start);
		self.bind('click',function(e){
			var otop = self.offset().top + self.height() + 10;
			var oleft = self.offset().left;
			var wh = $('.calendar_inner').height() + 10;
			vobj.open({'height':wh,'top':otop,'left':oleft});
			e.preventDefault();
		})
	})
}
})(jQuery,window,document)