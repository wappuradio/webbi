$(function() {
	var audio = $('audio')[0], events = [], from, scrolling = false, week = 0, player, inter = -1, lastframe = 0, pageY = 0;
function getRandom(arr, n) {
    var result = new Array(n),
        len = arr.length,
        taken = new Array(len);
    if (n > len)
        throw new RangeError("getRandom: more elements taken than available");
    while (n--) {
        var x = Math.floor(Math.random() * len);
        result[n] = arr[x in taken ? taken[x] : x];
        taken[x] = --len;
    }
    return result;
}

	function layout() {
		if($('.new').length > 0) $('#page').removeClass('wide');
		else if($(window).width() >= 1024) $('#page').addClass('wide');
		else $('#page').removeClass('wide');
	}
	$(window).resize(function() {
		layout();
	});
	layout();
	var parent = $("#bannerit");
	var divs = parent.children();
	while (divs.length) {
		parent.append(divs.splice(Math.floor(Math.random() * divs.length), 1)[0]);
	}
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
			startStream('videoplayer', window.location.protocol.replace(/http/, 'ws')+'//'+getRandom(servers, 1)[0]+'/visio-ws', true, 'auto', 2000)
		} else if(ws !== undefined) {
			ws.close();
			ws = undefined;
		}
	});
	function color(str) {
		for (var i = 0, hash = 0; i < str.length; hash = str.charCodeAt(i++) + ((hash << 5) - hash));
		for (var i = 0, color = "#"; i < 3; color += ("00" + ((hash >> i++ * 8) & 0xFF).toString(16)).slice(-2));
		return color;
	}
	$('#face').click(function() {
		var title = $(this).prop('title');
		$('.ohjelmacol').removeClass('active');
		$('.ohjelma').each(function() {
			if($(this).find('h2').html() == title) {
				$(this).click();
				return;
			}
		});
	});
	function current() {
		var allbanners = $("#bannerit a");
		var friends = $('.friends');
		var width = friends.width();
		var n = Math.floor(width/240);
		var banners = getRandom(allbanners, n);
		friends.html('');
		for(var i = 0; i < banners.length; i++) {
			friends.append(banners[i].outerHTML);
		}

		var now = moment();
		for(var i in events) {
			var e = events[i];
			if (moment.tz(e.start, 'Europe/Helsinki').isBefore(now) && moment.tz(e.end, 'Europe/Helsinki').isAfter(now)) {
				var img = e.photo;
				var thumb = e.thumb;
				function setInfo(id, data) {
					if($('#'+id).text() != data) {
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
				$('#face').prop('src', thumb);
				$('#face').prop('title', e.title);
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
	setInterval(news, 30000);

 	function license() {
		$.get('license.md', function(data) {
			var converter = new showdown.Converter({noHeaderId: true});
			var html = converter.makeHtml(data);
			if(html != '') {
				$('.license').html(html);
				$('.license').show();
				$('html, body').animate({ scrollTop: $('html').height() }, 2000);
			}
		});
	}
	$('.lisenssit').click(function(e) {
		e.preventDefault();
		license();
	});

	var options = {
		events: function(start, end, timezone, callback) {
			if(events.length > 0) {
				callback(events);
			} else {
			        $.getJSON('https://wappuradio.fi/api/programs', function(data) {
					events = data;
					callback(data);
				});
			}
		},
		eventBackgroundColor: 'rgb(231,17,0)',
		eventBorderColor: '#fff',
		eventTextColor: '#fff',
		defaultDate: '2018-04-17',
		defaultView: 'agendaWeek',
		header: {
			left: '',
			center: '',
			right: ''
		},
		slotEventOverlap: false,
		allDaySlot: false,
		slotDuration: '01:00:00',
		firstDay: 2,
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
				if($(this).find('h2').text() == event.title) {
					$(this).click();
					return;
				}
			});
		},
		eventAfterAllRender: function (view) {
			if(moment().isAfter('2018-04-24')) {
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
				var name = e.title.toLocaleLowerCase().replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/[^a-z0-9]/gi, '');
				if(e.title == '▲') name = 'hessukolmio';
				var img = 'img/host/'+name+'.jpg';
				var thumb = 'img/host/thumb/'+name+'.jpg';
				//img = 'img/host/testi.png';
				//thumb = 'img/host/thumb/testi.png';
				e.desc = e.desc.replace(/(\s*\n+\s*)/, '<br><br>');
				//$('.ohjelmat .row').append('<div class="col-xs ohjelmacol"><div class="box ohjelma" data-offset="'+Math.floor(Math.random()*100)+'"><h2>'+e.title+'</h2><img class="lazy" data-original="'+img+'" alt="'+e.title+'" width="160" height="160"><div class="kuvaus">'+e.desc+'<div class="tekijat">'+(e.host?'Studiossa: '+e.host:'')+(e.prod?'<div>Tuottaja: '+e.prod+'</div>':'')+'</div></div></div></div>');
				$('.ohjelmat .row').append('<div class="col-xs ohjelmacol"><div class="box ohjelma" data-offset="'+Math.floor(Math.random()*100)+'"><h2>'+e.title+'</h2><img class="lazy" src="'+thumb+'" alt="'+e.title+'" width="160" height="160"><div class="kuvaus">'+e.desc+'<div class="tekijat">'+(e.host?'Studiossa: '+e.host:'')+(e.prod?'<div>Tuottaja: '+e.prod+'</div>':'')+'</div></div></div></div>');
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
	options.defaultDate = '2018-04-24';
	options.id = 'ohjelmakartta2';
	$('#ohjelmakartta2').fullCalendar(options);
	$('.face:nth-child(2)').addClass('back');
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
			startStream('videoplayer', window.location.protocol.replace(/http/, 'ws')+'//'+getRandom(servers, 1)[0]+'/visio-ws', true, 'auto', 2000)
			$('#videoplayer').slideDown(750);
		} else {
			ga('send', 'event', 'Video', 'stop');
			$('#videoplayer').slideUp(750, function() {
				if(ws !== undefined) {
					ws.close();
					ws = undefined;
				}
			});
		}
	});
	$('.ohjelmat').on('click', '.ohjelma', function(e) {
		if($(e.target).is('a')) return;
		if(!$(this).parent().hasClass('active')) {
			from = this;
			var title = $(this).find('h2').html();
			ga('send', 'event', 'Program', 'view', title);
			$(this).find('img').attr('src', $(this).find('img').attr('src').replace(/thumb\//, ''));
			$('.ohjelmacol').removeClass('active');
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
		var pos = $(window).scrollTop();
		var top = $('.top').position().top;
		if (pos >= top) {
			$('.sivumenu').addClass('scrolled');
		} else {
			$('.sivumenu').removeClass('scrolled');
		}
		if(inter >= 0) return; //todo
		/*if(+new Date() - lastframe > 17) {
			window.requestAnimationFrame(function() { scrolled(pos); });
			lastframe = +new Date();
		}*/
	});
	var scrolled = function(pos) {
		var windowHeight = $(window).height();
		var n = 0;
		$('.ohjelma img, #face').each(function() {
			var $img = $(this);
			var firstTop = $img.offset().top;
			var height = $img.height();
			if (top + height < pos || top > pos + windowHeight) {
				return;
			}
			var jump = 0.39*height*2803/400/122; // mitä tässä lasketaan :D
			var speed = height/600;
			if(height == 160) {
				speed = speed*0.5
			}
			var offset = [], position = [];
			for(var i = 0; i < 3; i++) {
				Math.seedrandom(n);
				n++;
				position[i] = Math.floor((firstTop-pos)*speed*(Math.random()+0.5));
				offset[i] = Math.floor(1000*Math.random());
				offset[i] = (offset[i]-offset[i]%jump)+(position[i]-position[i]%jump)+'px';
			}
			// todo: firefox
			offset = '-10% '+offset[0]+', 50% '+offset[1]+', 110% '+offset[2];
			$img.css('background-position', offset);
		});
		if(scrolling) return;
		from = undefined;
	}
	//scrolled();
	$('.week').click(function(e) {
		e.preventDefault();
		$('.card').toggleClass('flip');
	});
	var volume = new Dragdealer('volume', {
		horizontal: false,
		vertical: true,
		snap: true,
		slide: false,
		steps: 100,
		animationCallback: function(x, y) {
			$('audio')[0].volume = (1-y);
			if(1-y > 0) {
				$('#volume .handle i').removeClass('fa-volume-off').addClass('fa-volume-up');
			} else {
				$('#volume .handle i').removeClass('fa-volume-up').addClass('fa-volume-off');
			}
		}
	});
	$('#volume.dragdealer').click(function (e) {
		if(e.target.id != 'volume') return;
		var vol = (e.pageY-$('#volume').offset().top)/$('#volume').height();
		volume.setValue(0, vol, true);
	});
	$('#volume .handle').mousedown(function(e) {
		pageY = e.pageY;
	});
	$('#volume .handle').mouseup(function(e) {
		if(e.pageY == pageY) {
			$('#volume .handle i').removeClass('fa-volume-up').addClass('fa-volume-off');
			volume.setValue(0, 1, true);
		}
	});
	$('.lightswitch').click(function(e) {
		e.preventDefault();
		$('#page').toggleClass('disco');
		if(inter >= 0) {
			clearInterval(inter);
			inter = -1;
		} else {
			inter = setInterval(function() { scrolled(Date.now()/6%10000) }, 17);
		} //todo
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
				barHeight = dataArray[i]/1.45;
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
	$('.ohjelmakartta').swipe({
		swipeLeft: function(e, direction, distance, duration, fingerCount, fingerData) {
			$('.week:first').click();
		},
		swipeRight: function(e, direction, distance, duration, fingerCount, fingerData) {
			$('.week:first').click();
		},
		excludedElements: 'label, button, input, select, textarea, .noSwipe'
	});


	var socket = io();
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
	setInterval(function() {
		var alku = new Date("2018-04-17 14:00:00")
		var loppu = new Date("2018-04-30 15:00:00")
		var nyt = new Date()
		if(nyt < alku || nyt > loppu) {
			if($('.onair').html() != 'OFF AIR') $('.onair').html('OFF AIR')
		} else {
			if($('.onair').html() != 'ON AIR') $('.onair').html('ON AIR')
		}
	}, 10000)

var servers = ['mordor.wappuradio.fi', 'stream.wappuradio.fi'], ws;

//startStream('videoplayer', window.location.protocol.replace(/http/, 'ws')+'//'+getRandom(servers, 1)[0]+'/visio-ws', true, 'auto', 2000);

function startStream(playerId, wsUri, useWorker, webgl, reconnectMs) {
        if (!window.player) {
                window.player = new Player({ useWorker: useWorker, webgl: webgl, size: { width: 848, height: 480 } })
                var playerElement = document.getElementById(playerId)
                playerElement.appendChild(window.player.canvas)
                window.player.canvas.addEventListener('dblclick', function() {
                        if(window.player.canvas.requestFullScreen) window.player.canvas.requestFullScreen();
                        else if(window.player.canvas.webkitRequestFullScreen) window.player.canvas.webkitRequestFullScreen();
                        else if(window.player.canvas.mozRequestFullScreen) window.player.canvas.mozRequestFullScreen();
                })
        }
        document.addEventListener('webkitfullscreenchange', exitHandler, false);
        document.addEventListener('mozfullscreenchange', exitHandler, false);
        document.addEventListener('fullscreenchange', exitHandler, false);
        document.addEventListener('MSFullscreenChange', exitHandler, false);

        function exitHandler() {
                if(document.fullScreenElement || document.webkitCurrentFullScreenElement || document.mozFullScreenElement) {
                        window.player.canvas.style.width = '100vw'
                        window.player.canvas.style.marginBottom = '0'
                        window.player.canvas.style.border = '0'
                } else {
                        window.player.canvas.style.width = ''
                        window.player.canvas.style.marginBottom = '20px'
                        window.player.canvas.style.border = '1px solid #eee'
                }
        }

	if(ws !== undefined) {
		ws.close()
	}
        ws = new WebSocket(wsUri)
        ws.binaryType = 'arraybuffer'
        ws.onopen = function (e) {
                console.log('websocket connected')
                ws.onmessage = function (msg) {
                        window.player.decode(new Uint8Array(msg.data))
                }
        }
        /*ws.onclose = function (e) {
                console.log('websocket disconnected')
                if (reconnectMs > 0) {
                        var el = playerId, uri = wsUri
                        setTimeout(function() { startStream(el, uri) }, reconnectMs)
                }
        }*/
}

});
