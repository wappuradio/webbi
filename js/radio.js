$(function() {
	var audio = $('audio')[0], events = [], from, scrolling = false, week = 0, player,
	video = {
		dash: 'http://pei.li/dash/raspi.mpd',
		hls: 'http://pei.li/hls/raspi.m3u8'
	},
	conf = {
		key: '591170a2a7c2e0abdcdd9a0d9ab1a9d9',
		source: video,
		playback: {
			autoplay: true,
			muted: true
		},
		style: {
			controls: false,
			width: '100%',
			height: '448px'
		},
		tweaks: {
			max_buffer_level: 2
		}
	};

	function layout() {
		if($('.new').length > 0) $('#page').removeClass('wide');
		else if($(window).width() >= 1024) $('#page').addClass('wide');
		else $('#page').removeClass('wide');
	}
	$(window).resize(function() {
		layout();
	});
	layout();
	var vis = (function(){
		var stateKey, eventKey, keys = {
			hidden: "visibilitychange",
			webkitHidden: "webkitvisibilitychange",
			mozHidden: "mozvisibilitychange",
			msHidden: "msvisibilitychange"
		};
		for (stateKey in keys) {
			if (stateKey in document) {
				eventKey = keys[stateKey];
				break;
			}
		}
		return function(c) {
			if (c) document.addEventListener(eventKey, c);
			return !document[stateKey];
		}
	})();
	vis(function() {
		if(vis() && $('#videoplayer').is(':visible')) {
			player.play();
		} else {
			player.pause();
		}
	});
	function color(str) {
		for (var i = 0, hash = 0; i < str.length; hash = str.charCodeAt(i++) + ((hash << 5) - hash));
		for (var i = 0, color = "#"; i < 3; color += ("00" + ((hash >> i++ * 8) & 0xFF).toString(16)).slice(-2));
		return color;
	}
	function current() {
		var now = moment();
		for(var i in events) {
			var e = events[i];
			if (moment(e.start).isBefore(now) && moment(e.end).isAfter(now)) {
				var img = 'img/'+e.title.toLocaleLowerCase().replace('ä', 'a').replace('ö', 'o').replace(/[^a-z0-9]/gi, '')+'.png';
				img = 'http://lorempixel.com/320/320/';
				function setInfo(id, data) {
					if($('#'+id).html() != data) {
						$('#'+id).fadeOut(500, function() {
							$('#'+id).html(data);
							$('#'+id).fadeIn(500);
						});
					}
				}
				setInfo('prog', e.title);
				setInfo('host', e.host);
				setInfo('prod', e.prod);
				setInfo('time', moment(e.start).format('H:mm')+' — '+moment(e.end).format('H:mm'));
				$('#face').prop('src', img);
				return;
			}
		}
	}
	function news() {
		$.get('news.md', function(data) {
			var converter = new showdown.Converter({noHeaderId: true});
			var html = converter.makeHtml(data);
			if(html != '') {
				html = html.split('<hr />');
				html.shift();
				$('.new').remove();
				if(html.length > 0) {
					for(var i in html) {
						if(html[i].trim() != '') {
							$('.news').append('<div class="new col-xs"><div class="box">'+html[i].trim()+'</div></div>');
						}
					}
				}
			}
			layout();
		});
	}
	news();
	setInterval(news, 300000);

	var options = {
		events: function(start, end, timezone, callback) {
			if(events.length > 0) {
				callback(events);
			} else {
			        $.getJSON('/okdb/ok.json', function(data) {
					events = data;
					callback(data);
				});
			}
		},
		eventBackgroundColor: 'rgb(231,17,0)',
		eventBorderColor: '#fff',
		eventTextColor: '#fff',
		defaultDate: '2016-04-18',
		defaultView: 'agendaWeek',
		header: {
			left: '',
			center: '',
			right: ''
		},
		slotEventOverlap: false,
		allDaySlot: false,
		slotDuration: '01:00:00',
		firstDay: 1,
		contentHeight: 'auto',
		slotLabelFormat: 'H:mm',
		dayNamesShort: ['Su', 'Ma', 'Ti', 'Ke', 'To', 'Pe', 'La'],
		week: 'd. [MMMM"ta" (YYYY)]{" &ndash; "d. MMMM"ta" YYYY}',
		timeFormat: 'H:mm',
		columnFormat: {   
			month: 'dddd',
			week: 'ddd D.M.',
			day: 'dddd D.M.YYYY'
		},
		monthNames: ['Tammikuu', 'Helmikuu', 'Maaliskuu', 'Huhtikuu', 'Toukokuu', 'Kesäkuu', 'Heinäkuu', 'Elokuu', 'Syyskuu', 'Lokakuu', 'Marraskuu', 'Joulukuu'],
		monthNamesShort: ['Tammi', 'Helmi', 'Maalis', 'Huhti', 'Touko', 'Kesä', 'Heinä', 'Elo', 'Syys', 'Loka', 'Marras', 'Joulu'],
		dayNames: ['Sunnuntai', 'Maanantai', 'Tiistai', 'Keskiviikko', 'Torstai', 'Perjantai', 'Lauantai'],
		lazyFetching: true,
		id: 'ohjelmakartta',
		eventClick: function (event, jsEvent, view) {
			$('.ohjelmacol').removeClass('active');
			$('.ohjelma').each(function() {
				if($(this).find('h2').html() == event.title) {
					$(this).click();
					return;
				}
			});
		},
		eventAfterAllRender: function (view) {
			if(moment().isAfter('2016-04-25')) {
				$('.card').addClass('flip');
			}
		},
		loading: function (isLoading, view) {
			if(isLoading || $('.ohjelma').length > 0) return;
			var done = [];
			//events = $('#ohjelmakartta').fullCalendar('clientEvents');
			events.sort(function(a,b) {
				return a.title.toLocaleLowerCase().replace(/[^a-zöäå]/, '').localeCompare(b.title.toLocaleLowerCase().replace(/[^a-zöäå]/, ''));
			});
			$('.ohjelmat .row').html('');
			for(var i in events) {
				if(!events.hasOwnProperty(i)) continue;
				var e = events[i];
				if(done.indexOf(e.title) >= 0) continue;
				if(e.desc.length == 0) continue;
				done.push(e.title);
				var img = 'img/'+e.title.toLocaleLowerCase().replace('ä', 'a').replace('ö', 'o').replace(/[^a-z0-9]/gi, '')+'.png';
				img = 'http://lorempixel.com/320/320/?'+Math.random();
				$('.ohjelmat .row').append('<div class="col-xs ohjelmacol"><div class="box ohjelma"><h2>'+e.title+'</h2><img class="lazy" data-original="'+img+'" alt="'+e.title+'" width="160" height="160"><div class="kuvaus">'+e.desc+'<div class="tekijat">'+(e.host?'Studiossa: '+e.host:'')+(e.prod?'<div>Tuottaja: '+e.prod+'</div>':'')+'</div></div></div></div>');
			}
			$('img.lazy').lazyload({
				effect: 'fadeIn'
			});
			$('.kuvaus').hyphenate('fi');
			current();
			setInterval(current, 10000);
		}
	};
	$('#ohjelmakartta').fullCalendar(options);
	options.defaultDate = '2016-04-25';
	options.id = 'ohjelmakartta2';
	$('#ohjelmakartta2').fullCalendar(options);


	$('header img').click(function(e) {
		e.preventDefault();
	});
	$('.katso').click(function(e) {
		e.preventDefault();
		$('nav .katso i').toggleClass('fa-eye').toggleClass('fa-eye-slash');
		$('.lahetysta').toggle(0);
		$('.tekstia').toggle(0);
		if($('#videoplayer').is(':hidden')) {
			ga('send', 'event', 'Video', 'play');
			if(player === undefined) {
				player = bitdash('videoplayer').setup(conf);
			} else {
				player.load(video);
			}
			$('#videoplayer').slideDown(750);
		} else {
			ga('send', 'event', 'Video', 'stop');
			$('#videoplayer').slideUp(750, function() {
				player.unload();
			});
		}
	});
	$('.ohjelmat').on('click', '.ohjelma', function() {
		if(!$(this).parent().hasClass('active')) {
			from = this;
			var title = $(this).find('h2').html();
			ga('send', 'event', 'Program', 'view', title);
		}
		$(this).parent().toggleClass('active');
		var y = $(this).position().top;
		if(($(this).parent().hasClass('active') || from == this) && y != $(window).scrollTop()) {
			scrolling = true;
			setTimeout(function() { scrolling = false; }, 550);
			$('html,body').stop().animate({ scrollTop: y }, '500', 'swing', function() { 
			});
		}
	});
	$(window).scroll(function(e) {
		$('.sivumenu').css('margin-top', -Math.min($(window).scrollTop(), $('.top').position().top)-3);
		if(scrolling) return;
		from = undefined;
	});
	$('.week').click(function(e) {
		e.preventDefault();
		$('.card').toggleClass('flip');
	});


	$('.lightswitch').click(function(e) {
		e.preventDefault();
		$('#page').toggleClass('disco');
	});
	$('.play').click(function(e) {
		e.preventDefault();
		if(!audio.paused) {
			audio.pause();
			ga('send', 'event', 'Audio', 'stop');
		} else {
			$('#icon, .sivumenu .play i').removeClass('fa-play').addClass('fa-spinner fa-spin');
			audio.play();
			ga('send', 'event', 'Audio', 'play');
		}
	});
	window.AudioContext = window.AudioContext||window.webkitAudioContext;
	if (window.AudioContext !== undefined) {
		var context = new AudioContext();
		var analyser = context.createAnalyser();
		var source = context.createMediaElementSource(audio);
		source.connect(context.destination);
		source.connect(analyser);
		analyser.fftSize = 512;
		var bufferLength = analyser.frequencyBinCount;
		var dataArray = new Uint8Array(bufferLength);
		var canvasParent = $('header').get(0);
		var canvas = document.createElement('canvas');
		canvas.width = canvasParent.offsetWidth;
		canvas.style.width = '100%';
		canvas.height = canvasParent.offsetHeight;
		canvas.style.height = canvasParent.offsetHeight+'px';
		canvas.style.position = 'absolute';
		$('header').before(canvas);
		var canvasCtx = canvas.getContext('2d');
		var width = canvas.width, height = canvas.height;
		canvasCtx.clearRect(0, 0, width, height);
		var fps = 60, now, then = Date.now(), interval = 1000/fps, delta, freq = 0.1, page = $('#page');
		function draw(time) {
			if(!audio.paused) requestAnimationFrame(draw);
			now = Date.now();
			delta = now - then;
			if (delta <= interval) return;
			analyser.getByteFrequencyData(dataArray);
			canvasCtx.clearRect(0, 0, width, height);
			var barWidth = ((width-bufferLength) / bufferLength) * 1.25;
			var barHeight, y, x = 0, red = 255, green = 255, blue = 255, alpha = 0.85, now;
			for (var i = 0; i < bufferLength; i++) {
				barHeight = dataArray[i]/1.5;
				y = height-barHeight;
				if(page.hasClass('disco')) {
					red = Math.floor(Math.sin(freq*i + 0 + now/1000) * 127 + 128);
					green = Math.floor(Math.sin(freq*i + 2 + now/1000) * 127 + 128);
					blue = Math.floor(Math.sin(freq*i + 4 + now/1000) * 127 + 128);
					alpha = 1.15;
				}
				canvasCtx.fillStyle = 'rgba('+red+','+green+','+blue+','+(barHeight/height)*alpha+')';
				canvasCtx.fillRect(x, y, barWidth, barHeight);
				x += barWidth + 1;
			}
			then = now - (delta % interval);
		}
	}
	$(audio).on('playing', function(e) {
		$('#icon, .sivumenu .play i').removeClass('fa-play fa-spinner fa-spin').addClass('fa-pause');
		$(canvas).show();
		if (window.AudioContext !== undefined) requestAnimationFrame(draw);
	});
	$(audio).on('pause', function(e) {
		$('audio').prop('src', '').removeAttr('src');
		$('#icon, .sivumenu .play i').removeClass('fa-pause fa-spinner fa-spin').addClass('fa-play');
		$(canvas).hide();
	});


	var socket = io('http://pei.li:4204');
	var nick = '';
	$('#nick').on('keypress', function (e) {
		if (e.which == 13 && $('#nick').val() != '') {
			nick = $('#nick').val();
			$('#nick').hide();
			$('#text').show().focus();
		}
	});
	$('#text').on('keypress', function (e) {
		if (e.which == 13 && $('#text').val() != '') {
			socket.emit('msg', { nick: nick, text: $('#text').val() });
			$('#text').val('');
		}
	});
	socket.on('msg', function (msg) {
		var time = moment().format('H:mm');
		msg.nick = msg.nick.replace(/</g, '&lt;').replace(/>/g, '&gt;');
		msg.text = msg.text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
		$('#shoutbox').append('<div class="msg"><div class="time">'+time+'</div><div class="nick" style="color: '+color(msg.nick)+'">'+msg.nick+'</div><div class="text">'+msg.text+'</div></div>');
		$('#shoutbox').stop().animate({ scrollTop: $('#shoutbox')[0].scrollHeight }, 500);
	});
	socket.on('np', function (song) {
		song.song = song.song.replace(/</g, '&lt;').replace(/>/g, '&gt;');
		if($('#song').html() != song.song) {
			$('#song').fadeOut(500, function() {
				$('#song').html(song.song);
				$('#song').fadeIn(500);
			});
		}
	});
});
