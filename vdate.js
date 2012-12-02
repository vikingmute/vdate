/*!
 * vdate.js v1.0.0 - 2012-11-26
 * By Vikingmute (http://vikingmute.com)
 */

/**
 * TODO: enhance the generateTable function
 */

(function($, window, document, undefined){

 'use strict';

//defualt settings
var settings = {
	lan:"ch",
	width:250,
	disablePrev:false,
	fillInWithToday:true,
	theme:'metro'
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
var now = new Date(),
	today = new Date(now.getFullYear(), now.getMonth(), now.getDate()),
	now_time = +now,
	today_time = +today,
	one_day = 86400000;

//time helper to generate date&time
var timeHelper = {
	formatStr: function (date, flag) {
		var dateStr = [];
		dateStr[0] = date.getFullYear();
		dateStr[1] = (date.getMonth() + 1).toString();
		dateStr[1] = (dateStr[1].length === 1) ? ("0" + dateStr[1]) : dateStr[1];
		dateStr[2] = (date.getDate()).toString();
		dateStr[2] = (dateStr[2].length === 1) ? ("0" + dateStr[2]) : dateStr[2];
		return dateStr.join(flag);
	},
	next:function(num,type){
		var date = new Date();
		type = type || 'str';
		var daygap = 24 * 60 * 60 * 1000 * num;
		var future = new Date(date.getTime() + daygap);
		if(type == 'str'){
			var result = this.formatStr(future,'-');
		}else if(type == 'timestamp'){
			var result = future.getTime();
		}
		return result;
	},
	nextMonth:function(num,type){
		var date = new Date();
		type = type || 'raw';
		date.setMonth(date.getMonth() + num);
		date.setDate(1);
		date.setHours(0,0,0,0);
		if(type == 'str'){
			var result = this.formatStr(date,'-');
		}else if(type == 'timestamp'){
			var result = date.getTime();
		}else{
			var result = date;
		}
		return result;  
	}
}
//module to generate the whole canlendar

var vcalendar = (function(){
	//private methodes
	var monthCounter = 0;

	var getDaysNum = function (year, month) {
		return 32 - new Date(year, month, 32).getDate();
	}
	
	//generate html table functions
	var generateTable = (function(){
		var start, month, year, starting_day, month_length, month_name, day, len, date_time;
		var container = $('<div class="calendar_inner" style="width:'+settings.width+'px;"></div>');
		var initPara = function(para){
			start = para;
			month = start.getMonth();
			year = start.getFullYear();
			starting_day = start.getDay(); // Hacking this to make Monday the first day
			month_length = getDaysNum(year, month);
			month_name = language[settings.lan].cal_months_labels[month];
			day = start.getDate();
			len = Math.ceil((month_length + starting_day) / 7);
			date_time = +start;
		}
		var change = function(){
			var container = $('.calendar_inner');
			container.find('h3').html( month_name +' ' +year);
			container.find('.days_table').remove();
			container.append(formatBody());
		}
		var formatTop = function(){
			var html = '<div class="calendar_month">'
							+ '<a href="###" class="pre_month">'+language[settings.lan].cal_prev_month_label+'</a>' 
							+ '<h3>'+ month_name +' ' +year +'</h3>' 
							+ '<a href="###" class="next_month">'+language[settings.lan].cal_next_month_label+'</a>' 
						+'</div>';
			html += '<table class="calendar_day week_table'
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
				html += '<\/tr><\/thead><tbody></table>';
				return html;
		}
		var formatBody = function(){
			var html = '<table class="calendar_day days_table"><tr>';
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
			html += '<\/tr><\/tbody><\/table>';
			return html;
		}
		return {
			fireUp:function(para){
				initPara(para);
				container.append(formatTop());
				container.append(formatBody());
				return this;
			},
			rawHtml:function(){
				return container.clone().wrap('<p>').parent().html();
			},
			change:function(para){
				initPara(para);
				change();
			}
		}
	})()

	var bindEvents = function(){
		$(document).bind('click',function(e){
			var $target = $(e.target);
			if($target.parents('.calendar').length == 0 && !$target.is(vcalendar.triggerElm)){
				vcalendar.close();
			}
		})
		$('.calendar').delegate('.calendar-day ','click',function(e){
			if(!$(this).hasClass('day_invalid')){
				vcalendar.triggerElm.val($(this).data('date'));
				vcalendar.holder.find('.calendar-day').removeClass('day_selected');
				$(this).addClass('day_selected');
				vcalendar.close();
			}
			e.preventDefault();
		})
		$('.calendar .next_month').bind('click',function(e){
			monthCounter++;
			var next = timeHelper.nextMonth(monthCounter);
			vcalendar.tableObj.change(next);
			e.preventDefault();
		})
		$('.calendar .pre_month').bind('click',function(e){
			monthCounter--;
			var prev = timeHelper.nextMonth(monthCounter);
			vcalendar.tableObj.change(prev);
			e.preventDefault();
		})
	}
	//return the vdate out
	return{
		//the main dom tree
		holder:'',
		triggerElm:'',
		tableObj:'',
		//to start it off
		init:function(start,triggerElm){
			this.holder = $('<div class="calendar"></div>');
			this.triggerElm = triggerElm;
			$('body').append(this.holder);
			this.tableObj = generateTable.fireUp(start)
			this.holder.html(this.tableObj.rawHtml());
			bindEvents();
			return this;
		},
		open:function(style){
			this.holder.css('visibility','visible');
			this.holder.css(style);
		},
		close:function(){
			this.holder.css({'height':0});
			var delayHide = $.proxy(function(){
				this.holder.css({'visibility':'hidden'});
				//this.holder.remove();
			},this)
			setTimeout(delayHide,350);
		}
	}

})()




$.fn.vdate = function( options ) {
	var opts = $.extend({},settings,options);
	return this.each(function() {
		var self = $(this);
		self.val(timeHelper.next(0));
		var start = timeHelper.nextMonth(0);
		var vobj = vcalendar.init(start,self);
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