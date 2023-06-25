/* Author: Eduardo Ludi */
//window.nativeWindow.stage.quality = 'BEST';
//window.nativeWindow.stage.displayState = runtime.flash.display.StageDisplayState.FULL_SCREEN_INTERACTIVE;


/* Global variables */ 
	var audioElement = document.getElementById("audio");
	var separator = '/'; 
	var base_path = '.';
		
	var lyrics_dir = base_path + separator + 'static/Letra';
	var music_dir = base_path + separator + 'static/Musica';
	
	var selected_himn = '';
	var selected_number = 0;
	var selected_title = '';
	var selected_slides = 0;
	var selected_times = '';
	var selected_duration = 0;
	var music_mode = 'Letra';
	var music_modes = ['Letra','Instrumental','Cantado'];
	var modes = ['lyrics','instrumental','voices'];
	var mode_id = 0;
	var theme = 'all';
	var range = [0];
	
	var autoplay_timer;
	var pause_after = 500;
	var single_play = true;
	
	var can_play = false;
	var playing = false;
	var slide = 1;
	var force_jump = false;

$(document).ready(function(){
	initReplaceChars();
	findByNumber(0); // preload
});
	
	
	
	
	
	/* Key Bindings */
	$('body').keyup(function(event){
		key = event.which;
		//consola(key);
		switch(key) {	
		case 187: // +
			selected_to_playlist();
			break;
		case 107: // + numeric keyboard
			selected_to_playlist();
			break;
		case 13: // Enter
			single_play = true;
			do_play();
			break;
		case 8: // Backspace
			go_home();
			break;
		case 27: // Esc
			go_home();
			break;
		case 122: // F11
			toggle_fullscreen();
			break;
		case 37: // up
			if (playing) { force_jump = true; prev_lyrics(); }
			break;
		case 38: // left
			if (playing) { force_jump = true; prev_lyrics(); }
			break;
		case 39: // right
			if (playing) { force_jump = true; next_lyrics(); }
			break;
		case 40: // bottom
			if (playing) { force_jump = true; next_lyrics(); }
			break;
		case 32: // Spacebar
			if (playing) { playpause_audio(); }
			break;
		}
	});
	
	
	$('body').keydown(function(event){
		key = event.which;
		//consola(key);
		switch(key) {
		case 27: // Esc
			event.preventDefault();
			break;
		}
	});
	
	$('body').click(function(event){
		if (active_help) {
			toggle_help(event);
		}
	});
	
	/* START ANIMATIONS */
	$('#main').hide().delay(0).show(0,function(){
		$('#title').hide().delay(500).fadeIn('slow');
		$('#searchbox').hide().delay(750).fadeIn('slow');
		$('#playlist').hide().delay(1000).fadeIn('slow');
	});
	
	// App Buttons
	$('#app_buttons').on('click', '.button', function(event){
		event.preventDefault();
	});
	
	// help
	var active_help = false;
	$('.help_mode').hide();
	$('#app_buttons').on('click', '.button.help', function(event){
		toggle_help(event);
	});
	
	function toggle_help(event) {
		event.stopPropagation();
		if (active_help) {
			$('.help_mode').hide('fast');
			$('#background').animate({opacity: 1.0});
			active_help = false;
		} else {
			var to_hide = $('.help_mode');
			if ($('#add_to_playlist:visible').size() == 0) {
				to_hide = to_hide.not('.add_to_playlist');
			}
			to_hide.show('fast');
			$('#background').animate({opacity: 0.7});
			$('#logos').animate({opacity: 0.5});
			active_help = true;
		}
	}
	
	// fullscreen
	$('#app_buttons').on('click', '.button.fullscreen', function(event){
		//consola(is_fullscreen());
		toggle_fullscreen();
	});
	
	// SearchBox
	
	$('#number_tbx').keyup(function(event){
		var number = Math.abs(parseInt($(this).val()));
		
		if (!isNaN(number)) {
			if (number < 1)   { number = 1; }
			if (number > 613) { number = 613 }
		} else {
			number = null;
		} 
		$('#number_tbx').val(number);
		
		if (number >= 1 && number <= 613) {
			findByNumber(number);
			enable_play();
			enable_add_to_playlist();
		} else {
			$('#title_tbx').val('');
			disable_play();
		 	disable_add_to_playlist();
		}
		
		toogle_clear_find();
	});
	
	function key_is_number(event) {
		return ((event.which >= 48 && event.which <= 57) || (event.which >= 96 && event.which <= 105));
	}
	
	function key_is_other_symbol(event) {
		var symbols = [106, 187, 189, 191];
		var is_symbol = false;
		for(i=0;i<symbols.length;i++) {
			is_symbol = (event.which == symbols[i]);
			if (is_symbol) { return true; }
		}
		return is_symbol;
	}
	
	function key_is_control(event) {
		return (event.which > 8 && event.which < 46);
	}
	
	$('#title_tbx').keydown(function(event) {
		if ( key_is_number(event) || key_is_other_symbol(event) ) {
			event.preventDefault();
		}
	});
	
	$('#title_tbx').keyup(function(event) {
		if ($(this).attr('disabled') != 'disabled') {
			
			nkic = !key_is_control(event);
			if (nkic) {
				disable_play();
				disable_add_to_playlist();
			}
			hide_menus();
			var term = $(this).val();
		
			if (event.which == 40) {
				first_result = $('#search_results').find('input')[0];
				$(first_result).attr('checked','checked').focus();
			} else if (nkic) {
				$('#search_results li').hide('fast').remove();

				toogle_clear_find();
				
				if (term.length >= 3) {
					findByTitle(term);
					if (results == 0) {
						$('#search_results').fadeOut('fast');
					} else {
						$('#search_results').fadeIn('fast');
					}
				} else {
					$('#search_results').fadeOut('fast');
				}
			}	
		}
	});
	
	$('#number_tbx,#title_tbx').mouseup(function(event){
		$(this).select();
		$('#search_results').fadeOut('fast');
	});
	
	function toogle_clear_find() {
		term = $('#title_tbx').val();
		
		if (term.length >= 1) {
			$('.clear_find').fadeIn('fast');
		} else {
			$('.clear_find').fadeOut('fast');
		}
	}
	
	function clear_find() {
		$('#number_tbx').val('');
		$('#title_tbx').val('');
		$('#slides_hbx').val('');
		$('#times_hbx').val('');
		toogle_clear_find();
	}
	
	$('.clear_find').hide();
	
	$('.clear_find').click(function(event){
		clear_find();
		hide_search_results();
		disable_add_to_playlist();
	});
	
	disable_play();
	
	function enable_play() {
		can_play = true;
		$('#play').removeClass('disabled');
	}
	function disable_play() {
		can_play = false;
		$('#play').addClass('disabled');
	}
	
	$(document).on('click enter', '#play', function(event) {
		if (!$(this).hasClass('disabled')) {
			single_play = true;
			do_play();
		}
	});
	
	$('#search_results').tinyscrollbar();
	
	$('#search_results').on('focus change keydown', 'input',function() {
		var item 				= $(this).closest('li');
		selected_number = item.data('number');
		selected_title  = item.data('title');
		selected_slides = item.data('slides');
		selected_times  = item.data('times');
		$('#search_results li').removeClass('selected');
		item.addClass('selected');
		$('#number_tbx').val(selected_number);
		$('#title_tbx').val(selected_title);
		$('#slides_hbx').val(selected_slides);
		$('#times_hbx').val(selected_times);
		enable_play();
		enable_add_to_playlist();
	});
	
	$('#search_results').on('keydown', 'input', function(event) {
		//consola(event.which);
		var key = event.which;
		if (key == 40 || key == 39) {
			//consola('down');
		} else if (key == 38 || key == 37) {
			//consola('up');
		}
	});
	
	$('#search_results').on('click', 'li',function(event) {
		$(this).find('input').focus();
	});
	
	
	$('#search_results').on({
		mouseenter: function(event) {
			consola("Search results mouseenter!");
			addme = $(this).find('.to_playlist');
			addme.fadeIn('fast');
		},
		mouseleave: function(event) {
			consola("Search results mouseleave!");
			addme = $(this).find('.to_playlist');
			addme.fadeOut('slow');
		}, 
		click: function(event) {
			if($(event.target).hasClass('to_playlist')){
				consola("Search_results click!");
				event.stopPropagation();
				item = $(this).closest('li');
				results_to_playlist(item);
			}
		}
	}, 'li');
	
	$('#search_results .close').hide();
	$('#search_results .scrollbar').fadeTo(0,0.2);
	
	$(document).on({
		mouseenter: function(event) {
			close = $(this).find('.close');
			close.fadeIn('slow');
			scroll = $(this).find('.scrollbar');
			scroll.fadeTo('fast',0.8);
		},
		mouseleave: function(event) {
			close = $(this).find('.close');
			close.fadeOut('fast');
			scroll = $(this).find('.scrollbar');
			scroll.fadeTo('slow',0.2);
		}
	}, '#search_results')
	
	$('#search_results .close').click(function(event){
		consola("search results close");
		event.stopPropagation();
		event.preventDefault();
		$(this).fadeOut('fast', function(){
			hide_search_results();
		});
	});
	
	function hide_menus() {
		$('.menu').hide('fade','fast');
	}
	function hide_search_results() {
		$('#search_results').hide('fade','fast');
	}
	
	$('body').click(function(event){
		hide_menus();
	});
	
	$('.button_menu').click(function(event){
		event.preventDefault();
		event.stopPropagation();
		hide_search_results();
		$(this).next('.menu').toggle('fade','fast');
	});
	
	$('.menu li').click(function(event){
		event.stopPropagation();
		var item = $(this);
		var id   = item.attr('id');
		var menu = item.closest('.menu');
		var wrap = item.closest('.menu_wrapper');
		
		menu.find('li').removeClass('selected');
		item.addClass('selected');
		wrap.find('.button_menu').attr('class','button_menu '+id);
		menu.toggle();
		
		switch(menu.attr('id')) { 
		case 'mode_menu':
			switch(item.attr('id').replace(/mode_/,'')) {
			case 'lyrics':	
				mode_id = 0;
				music_mode = 'Letra';
				break;
			case 'instrumental':
				mode_id = 1;
				music_mode = 'Instrumental';
				break;
			case 'voices':	
				mode_id = 2;
				music_mode = 'Cantado';
				break;
			}
			//consola('mode: ' + music_mode);
			break;
		case 'theme_menu': 
			clear_find(); // remove all text form fields
			theme = item.attr('id').replace(/theme_/,'');
			range = item.data('range').split('-').map( function(x) { return parseInt(x) } );
			$('#search_results li').hide('fast').remove();
			findByTitle($('#title_tbx').val());
			if (results > 0) {
				$('#search_results').fadeIn('fast');
			} else {
				$('#search_results').fadeOut('fast');
			}	
			$('#search_results').tinyscrollbar_update();
			break; 
		}
	});
	
	/* PLAYLIST */
	function toggle_playlist() {
		playlist = $('#playlist');
		playlist_outer = playlist.find('> .outer');
		playlist_items_size = playlist.find('.inner .item').size();
		logos = $('#logos');
		buttons = $('#playlist').find('#play_list, #shuffle_list, #clear_list,#save_list');
		switch(playlist_items_size) {
		case  1:
			playlist.animate({'height': 180});
			playlist_outer.animate({'height': 170});
			playlist.find('.inner .item').first().addClass('current');
			logos.animate({'bottom':190});
			buttons.fadeIn('fast');
			break;
		case 0:
			playlist.animate({'height': 25});
			playlist_outer.animate({'height': 25});
			logos.animate({'bottom':30});
			buttons.fadeOut('fast');
			break;
		}
	}
	function add_to_playlist() {
		consola('Add to playlist!');
		if (not_blank(sel_number) && not_blank(sel_title)) {
			item = $('<div class="item"><a href="#" class="remove">&nbsp;</a></div>');
			mode = $('<span class="mode"></span>')
			number = $('<strong class="number"></strong>');
			title = $('<em class="title"></em>'); 
			playme = $('<div class="playme"></div>');
			item.data('number',sel_number);
			item.data('title',sel_title);
			item.data('slides',sel_slides);
			item.data('times',sel_times);
			item.data('mode',mode_id);
			item.append(playme);
			item.append(mode.addClass(modes[mode_id]));
			item.append(number.html(sel_number));
			item.append(title.html(sel_title));
			item.appendTo('#playlist .inner').show('highlight',{color:'#004159'},'slow');
			toggle_move_list_buttons();
			toggle_playlist();
		}
	}
	
	function selected_to_playlist() {
		consola("Selected to playlist!");
		sel_number	= $('#number_tbx').val();
		sel_title	= $('#title_tbx').val();
		sel_slides	= $('#slides_hbx').val();
		sel_times	= $('#times_hbx').val();
		
		add_to_playlist();
		
		$('#number_tbx').select();
	}
	
	function results_to_playlist(item) {
		consola("Results to playlist!");
		sel_number	= $(item).data('number');
		sel_title	= $(item).data('title');
		sel_slides	= $(item).data('slides');
		sel_times	= $(item).data('times');
		add_to_playlist();
	}
	
	disable_add_to_playlist();
	
	function enable_add_to_playlist() {
		$('#mode_and_play').animate({'width': 179, 'right': -12}, 'fast');
		var button = $('#add_to_playlist');
		var help = $('.help_mode.add_to_playlist');
		if (button.css('display') == 'none') {
			button.show('slide','fast');
			if (active_help) { help.show('slide','fast'); }
		}
	}
	
	function disable_add_to_playlist() {
		$('#mode_and_play').animate({'width': 121, 'right': 46}, 'fast');
		var button = $('#add_to_playlist');
		var help = $('.help_mode.add_to_playlist');
		if (button.css('display') == 'block') {
			$('#add_to_playlist').hide('slide','fast');
			help.hide('slide','fast');
		}
	}
	
	$('#add_to_playlist').click(function(event) {
		selected_to_playlist();
	});
	
	$(document).on('click', 'a', function(event){
		event.preventDefault();
		event.stopPropagation();
	});
	
	var dragging = false;
	$('#playlist').disableSelection();
	$('#playlist .inner').sortable( { 
		placeholder: 'placeholder', 
		forcePlaceholderSize: false, 
		axis: 'x', 
		container: 'parent',
		start: function(event, ui) {
			dragging = true;
		},
		stop: function(event, ui) {
			dragging = false;
		}
	});
	
	
	
	$('#playlist').on( {
		click: function(event) { 
			if (!dragging) {
				if($(event.target).hasClass('remove')){
					event.stopPropagation();
					var item = $(this).closest('.item');
					item.hide('fast',function(){
						item.remove();
						toggle_move_list_buttons();
						toggle_playlist();
					});
				}else{
					consola("No dragging");
					$('#playlist').find('.item.current').removeClass('current');
					item = $(this);
					item.addClass('current');
					current = item;
					single_play = false;
					do_play();
				}
			}
		},
		mouseenter: function(event) {
			if (!dragging) {
				item = $(this);
				item.find('.playme').stop().fadeIn('fast');
				is_hover = true;
				setTimeout(function(){
					if (is_hover) { item.find('.remove').fadeIn('fast');	}
				},100);
				item.addClass('hover',300);
			}
		},
		mouseleave: function(event) {
			if (!dragging) {
				item = $(this);
				item.find('.playme').fadeOut('fast');
				item.find('.remove').fadeOut('fast');
				item.removeClass('hover',300);
				is_hover = false;
			}
		}
	}, '.item');	
	
	
	var moving_list = false; 
	var playlist_inner_div = $('#playlist .inner');
	var playlist_item_width = (144+10);
	var how_much_move = playlist_item_width*2; // (width(+margin+border) + margin-left) * how_many_items
	
	function move_playlist(elem,direction) {
		event.preventDefault();
		if (!$(elem).hasClass('disabled')) {
			if (!moving_list) {
				left = parseInt(playlist_inner_div.css('left'));
				moving_list = true;
				left = (direction == 'left') ? (left + how_much_move) : (left - how_much_move);
				$('#playlist .inner').animate({'left': left}, 'fast', function(){
					moving_list = false;
					toggle_move_list_buttons();
				});
			}
		}
	}
	
	var list_left_button = $('#playlist .move_button.left');
	var list_right_button = $('#playlist .move_button.right');
	
	list_left_button.addClass('disabled');
	list_right_button.addClass('disabled');
	
	function toggle_move_list_buttons() {
		var left = parseInt(playlist_inner_div.css('left'));
		var items_count = $('#playlist .inner .item').size();
		var playlist_width = parseInt($('#playlist').width());
		var playlist_inner_width = (playlist_item_width * items_count);
		
		if (playlist_inner_width < playlist_width ) {
			left = 25;
			playlist_inner_div.css('left', left);
			list_left_button.addClass('disabled');
		}
		
		if (left >= 25) {
			list_left_button.addClass('disabled');
		} else if (left < 0) {	
			list_left_button.removeClass('disabled');
		}
		if ((left < 0) && ((Math.abs(left)+playlist_width) > playlist_inner_width)) {
			list_right_button.addClass('disabled');
		} else if ( (playlist_inner_width) > playlist_width) {
			list_right_button.removeClass('disabled');
		}
	}
	
	$('#playlist').on('click', '.move_button.left', function(event) {
		move_playlist(this,'left');
	});
	$('#playlist').on('click', '.move_button.right', function(event) {
		move_playlist(this,'right');
	});
	
	
	var tooltip;
	$('#playlist .actions .button span').hide();
	$('#playlist .actions').on({
		mouseenter: function(event) {
			tooltip = $(this).find('span');
			tooltip.fadeIn('fast');
		},
		mouseleave: function(event) {
			tooltip = $(this).find('span');
			tooltip.fadeOut('slow');
		}
	}, '.button');
	
	
	$('#playlist').find('#play_list, #shuffle_list, #clear_list, #save_list').hide();
	
	
	function list_size() {
		return $('#playlist .item').size()
	}
	
	function list_empty() {
		return (list_size() == 0);
	}
	
	function clear_list(callback) {
		if (!list_empty()) {
			var clear_dialog = $('<div></div>');
			clear_dialog.append($('#clearlist_dialog p').html());
			clear_dialog.dialog({
				title: $('#clearlist_dialog .title').html(),
				resizable: false,
				modal: true,
				buttons: {
					'Si, limpiar lista': function() {
						var items = playlist.find('.item');
						items.hide('fast');
						setTimeout(function() { 
							items.remove();
							toggle_playlist();
						}, 300);
						$( this ).dialog( "close" );
						callback();
					},
					No: function() {
						$( this ).dialog( "close" );
					}
				}
			});
		} else {
			callback();
		}
	}
	
	$('#playlist #shuffle_list, #playlist #clear_list')
	$('#playlist #clear_list').click(function(event){ 
		clear_list(function(){ return false; });
	});	
	
	function shuffle_list() {
		var parent = $('#playlist .inner');
		var divs = parent.children();
		while (divs.length) {
			parent.append(divs.splice(Math.floor(Math.random() * divs.length), 1)[0]);
		}
	}
	
	$('#playlist #shuffle_list').click(function(event){
		var shuffle_dialog = $('<div></div>');
		shuffle_dialog.append($('#shufflelist_dialog p').html());
		shuffle_dialog.dialog({
			title: $('#shufflelist_dialog .title').html(),
			resizable: false,
			modal: true,
			buttons: {
				'Si, mezclar lista': function() {
					shuffle_list()
					$( this ).dialog( "close" );
				},
				No: function() {
					$( this ).dialog( "close" );
				}
			}
		});
	});
	
	$('#playlist #play_list').click(function(event){ 
		current = playlist.find('.current');
		single_play = false;
		can_play = true;
		do_play();
	});
	
	/* PLAY STAGE */
	
	$('#playing,#pause').hide();
	
	var playlist = $('#playlist .inner');
	var player, channel;
	var current, prev, next;
	var next_exists = false;
	var prev_exists = false;
	
	var playtime = 0;
	
	
	
	function toggle_controls() {
		consola('Toggle controls!');
		find_current_and_nears();
		if (prev_exists || slide > 1) { 
			$('#playing .controls .prev').show();
		} else {
			$('#playing .controls .prev').hide();
		}
		if (next_exists || slide < selected_slides ) {
			$('#playing .controls .next').show();
		} else {
			$('#playing .controls .next').hide();
		}
	}
	
	
	
	function play_prev() {
		consola('Play prev!');
		find_current_and_nears();
		//consola(prev_exists);
		if (prev_exists) {
			current.removeClass('current');
			prev.addClass('current');
			find_current_and_nears();
			playing = false;
			clear_to_play();
			do_play(true);
		}
	}
	
	
	
	function play_selected(reverse) {
		consola("Play selected");
		if (music_mode != 'Letra') {			
			can_play = false;
			audioElement.setAttribute('src', generateMusicPath());
			
			var refresh = 100;
			clear_to_play();
			locked_controls = false;
			
			autoplay_timer = setInterval(function(){
				if (!paused && can_play && selected_duration > 0) {
					playtime = parseInt(audioElement.currentTime)*1000;
					
					if (playtime == selected_duration) {
						consola('should end');
						audio_ended();
					} else if (reverse) {
						consola('should reverse');
						force_jump = true;
						seek_audio(selected_slides-1);
						reverse = false;
					} else if (selected_times[slide-1] < (playtime+1000)) {
						consola('should next lyrics');
						next_lyrics();
					}
				}
			}, refresh);
		}
	}	
	
	
	var pause_seek = 0;
	var paused = false;
	var locked_controls = false;
	var next_after_pause = false;
	
	function playpause_audio(){
		consola('Play pause audio!');
		if (paused) {
			audioElement.play();
			paused = false;
			locked_controls = false;
			$('#pause').fadeOut('fast');
			if (next_after_pause) {
				play_next();
				next_after_pause = false;
			}
		} else {
			$('#pause').fadeTo('fast',0.95);
			audioElement.pause();
			paused = true;
			locked_controls = true;
		}
	}
	
	function seek_audio(sl) { // sl = slide
	consola('Seek audio!');
		if (force_jump) {
			consola('force_jump');
			var instant = 0;
			if (sl > 0) { 
				instant = selected_times[sl-1];
				slide = sl;
			};
			audioElement.currentTime = parseInt(instant/1000);
			
			playtime = instant;
			force_jump = false;
		}
	}
	
	var playing_controls = $('#playing .controls');
	
	function hideControls() {
		consola('Hide controls!');
		playing_controls.fadeOut('fast');
	}

	function showControls() {
		consola('Show controls!');
		playing_controls.fadeIn('fast');
	}
	

	// Oculta y muestra el mouse cuando se mueve
    var idleMouseTimer;
    var forceMouseHide = false;
    $("body").css('cursor', 'none');
    $("body").mousemove(function(ev) {
            if(!forceMouseHide) {
                    $("body").css('cursor', '');

                    clearTimeout(idleMouseTimer);

                    idleMouseTimer = setTimeout(function() {
                            $("body").css('cursor', 'none');

                            forceMouseHide = true;
                            setTimeout(function() {
                                    forceMouseHide = false;
                            }, 200);
                    }, 1500);
            }
    });
	
	function audio_fade_out(callback) {
		consola('Audio fade out!');
		$('#audio').animate({volume: 0}, 500);
		setTimeout(function() {
			audioElement.pause();
			audioElement.volume = 1;
			//audioElement.src = "";
		}, 500);
	}
	
	function next_lyrics() {
		consola('Next lyrics!');
		if (!locked_controls) {
			if (slide < selected_slides) {
				if (mode_id != 0) {
					seek_audio(slide);
				}
				slide++;
				$('#lyrics').attr('src',generateLyricsPath(slide));
				if (slide == 2) {
					$('#playing .controls .prev').show('fade','slow');
				}
				if (slide == selected_slides && !next_exists) {
					$('#playing .controls .next').hide('fade','fast');
				}
			} else {
				if (!list_empty()) {
					find_current_and_nears();
					//consola("Next?"+next_exists+" Slide="+slide+" Slides="+selected_slides)
					if (next_exists && slide == selected_slides) {
						locked_controls = true; // looks controls until true
						audio_fade_out(function() { play_next() });
					}
				}
			}
		}
	}

	function prev_lyrics() {
		consola('Prev lyrics!');
		if (!locked_controls) {
			if (slide > 1) {
				slide--;
				$('#lyrics').attr('src',generateLyricsPath(slide));
				if (slide == (selected_slides-1)) {
					$('#playing .controls .next').show('fade','slow');
				}
				if (slide == 1 && !prev_exists) {
					$('#playing .controls .prev').hide('fade','fast');
				}
				if (slide > 0 && mode_id != 0) {
					seek_audio(slide-1);
				}
			} else {
				if (!list_empty()) { 
					find_current_and_nears(); 
					consola("Prev?="+prev_exists+" Slide="+slide);
					if (prev_exists) {
						locked_controls = true; // looks controls until true
						audio_fade_out(function() { play_prev(); });
					}
				}
			}
		}
	}
	
	$('.credits_inner').on('click', 'a', function(event) {
		var container = $(this).closest('#info_credits');
		var scrollTo 	= container.find($(this).attr('href'));
		var scrollTop = (container.scrollTop() + scrollTo.offset().top - container.offset().top);
		container.animate({ scrollTop: scrollTop },'slow');
	});
	
	
	$(document).on('click', '#pause', function(event) {
		playpause_audio();
	});
	
	$('#playing .controls .next').click(function(event){
		force_jump = true;
		next_lyrics();
	});
	
	$('#playing .controls .prev').click(function(event){
		force_jump = true;
		prev_lyrics();
	});
	
	$('#playing .controls .home').click(function(event){
		go_home();
	});
	


	// Fullscreen

	function go_fullscreen() {
		consola("Go fullscreen!");
		document.querySelector("body").requestFullscreen({ navigationUI: "show" })
	}
	function is_fullscreen() {
		consola("Is fullscreen!");
		if (!window.screenTop && !window.screenY) {
			return true;
		}
		return false;
	}
	function go_normalscreen() {
		consola("Go normalscreen!");
		document.exitFullscreen();
	}
	
	function toggle_fullscreen() {
		if (is_fullscreen()) {
			go_normalscreen();
		} else {
			go_fullscreen();
		}
	}
	
	// Paths
	function generatePaths(number,title) {
		selected_himn = generateSelectedHimn(number,title);
	}

	function generateSelectedHimn(number,title) {
		//return (padValue(number,'0',3) + " - " + $.trim(replaceChars(title).replace(/_+/gm,' ').replace(/-+/gm,'').replace(/\s+/gm,' ')));//.replace(/\s+/gm,'%20');
	    	return padValue(number,'0',3);
	}
	
	function generateMusicPath() {
		var music_file = music_dir + separator + music_mode + separator + selected_himn + ".mp3";
		return music_file;
	}
	function generateLyricsPath(number) {
		consola("generateLyricsPath ("+number+")");
		var lyrics_file = lyrics_dir + separator + selected_himn + separator + padValue(number,'0',2) + ".jpg";
		consola(lyrics_file);
		return lyrics_file;
	}
	
	/* This function will pad the left or right side of any variable passed in */
	function padValue(to_pad, padChar, finalLength) {
	  //check the length for escape clause
	  if(to_pad.toString().length >= finalLength) { return to_pad; }
	  return padValue(padChar + to_pad, padChar, finalLength);
	}
	
	/* Replace Chars */
	var sdiakA;
	var bdiakA;

	function initReplaceChars(){
		var sdiak = "áäàéëèíïìóöòúüùÁÄÀÉËÈÍÏÌÖÓÒÜÚÙñÑ !¡?¿'";
		var bdiak = "aaaeeeiiiooouuuAAAEEEIIIOOOUUUnN_----_";
		sdiakA = new Array();
		bdiakA = new Array();

		for (var i=0;i<sdiak.length;i++){
			if (sdiak.charAt(i) == "?") {
				sdiakA.push(new RegExp(/\?/g));
			} else {
				sdiakA.push(new RegExp(sdiak.charAt(i), "g"));
			}
		}
		for (i=0;i<sdiak.length;i++) {
			bdiakA.push(bdiak.charAt(i))
		}
	}
	
	function replaceChars(string) {
		for (var i=0; i < sdiakA.length; i++) {
			string = string.replace(sdiakA[i], bdiakA[i]);
		}
		return (string)
	}
	
	// Busquedas
	function hiliter(word, source) {
		var rgxp = new RegExp(word, 'ig');
		var mtch = source.match(rgxp)
		var repl = (mtch != null) ? ('<span class="highlight">' + mtch + '</span>') : word;
		return source.replace(rgxp, repl);
	}
	
	function blank(text) {
		return (text == undefined || text == '')
	}
	function not_blank(text) {
		return !blank(text);
	}
	
	function between(n,a,b){
		return (a<=n && b>=n);
	}
	
	
	
	function textMatch(searchTerm,sourceText,beginWithOnly) {
		beginWithOnly = typeof beginWithOnly !== 'undefined' ? beginWithOnly : false;
		var termNormalized	= (beginWithOnly ? "^" : "" ) + replaceChars($.trim(searchTerm));
		var textNormalized	= replaceChars($.trim(sourceText)).toLowerCase();
		var searchRegex			= new RegExp(termNormalized,"i");
		var regexMatch			= textNormalized.search(searchRegex);
		return (regexMatch >= 0);
	}
	
	function findByNumber(find_number) {
		$('#himns').find('.himn[data-number="'+find_number+'"]').each(function(){
			var himn   = $(this);
			var number = himn.data('number');
			var title  = himn.data('title');
			var slides = himn.data('slides');
			var times  = himn.data('times');
			if (find_number == number) {
				$('#title_tbx').val(title);
				$('#slides_hbx').val(slides);
				$('#times_hbx').val(times);
			}
		});
	}
	
	var results = 0;
	function findByTitle(find_term) {
		results = 0;
		$('#himns').find('.himn').each(function(){
			var himn   = $(this);
			var title  = himn.data('title');
			var number = himn.data('number');
			var slides = himn.data('slides');
			var times  = himn.data('times');
			if (textMatch(find_term,title)) {
				if (range[0] == 0 || between(parseInt(number),range[0],range[1])) {
					results++;
					var item  = $('<li class="item"></li>');
					var input = $('<input type="radio" id="result_'+number+'" name="results" value="'+number+'" title="'+title+'"/>');
					var label = $('<label for="result_'+number+'"></label>');
					var addme = $('<a class="to_playlist" href="#"><span>(+)</span></a>');
					item.append(input);
					label.html(accent_folded_hilite(title,find_term))
					item.append(label);
					item.append(addme);
					item.data('number', number);
					item.data('title', title);
					item.data('slides', slides);
					item.data('times', times);
					$('#search_results ul').append(item);
					$('#search_results').tinyscrollbar_update(); 
				}
			}
		});
	}
	
	
	// Audio

	function audio_ready() {
		consola('Audio ready!');
		can_play = true;
		selected_duration = parseInt(audioElement.duration * 1000);
		if(audioElement.volume<1){
			audioElement.volume = 1;
		}
		consola("volume: "+audioElement.volume);
		consola("currentTime: "+audioElement.currentTime);
		consola("src: "+audioElement.src);
		audioElement.play();
	}
	
	function audio_ended() {
		consola('Audio ended!');
		//playing = false;
		clear_to_play();
		setTimeout(function() {
			if (single_play) {
				go_home();
			} else {
				play_next();
			}
		}, pause_after);
	}
	
	function consola(text) {
		//console.log(text);
	}
	
	function clear_to_play() {
		consola('Clear to play!');
		can_play = true;
		slide = 1;
		playtime = 0;
		clearInterval(autoplay_timer);
	}
	
	function go_home() {
		consola('Go home!');
		selected_slides = 0;
		$('#button_help').show();
		clear_to_play();
		playing = false;
		$('#main input').removeAttr('disabled');
		$('#main').show('fast', function(){
			$('#playing').fadeOut('fast');
			if (music_mode != 'Letra') {
				audio_fade_out(function(){ return true; });
			}
		});
	}
	
	function play_next() {
		consola('Play next!');
		find_current_and_nears();
		//consola(next_exists);
		if (next_exists) {
			current.removeClass('current');
			next.addClass('current');
			find_current_and_nears();
			clear_to_play();
			playing = false;
			do_play();
		} else {
			go_home();
		}
	}
	
	function find_current_and_nears() {
		consola('Find current and nears!');
		if (!list_empty()) {
			current = playlist.find('.current');
			if (current.size()>0) {
				prev = current.prev('.item');
				next = current.next('.item');
				prev_exists = (prev.size() == 1);
				next_exists = (next.size() == 1);
			} else {
				current = playlist.find('.item:first-child').addClass('current');
				find_current_and_nears();
			}
		}
	}
	
	function do_play(){
		consola('Do play!');
		var reverse = arguments[0];
		var snum,stit,ssli,slim;
		$('#button_help').hide();
		
		if (single_play) {
			consola("single_play");
			snum = $('#number_tbx').val();
			stit = $('#title_tbx').val();
			ssli = $('#slides_hbx').val();
			stim = $('#times_hbx').val(); 
		} else {
			consola("No single_play");
			snum = current.data('number');
			stit = current.data('title');
			ssli = current.data('slides');
			stim = current.data('times');
			mode_id	   = current.data('mode');
			music_mode = music_modes[mode_id];
		}
		
		selected_number = parseInt(snum);
		selected_title 	= stit;
		selected_slides = parseInt(ssli);
		selected_times 	= stim.split(',').map( function(x) { return parseInt(x) } );
		slide = ( reverse ? selected_slides : 1 );
		
		if (!playing && not_blank(selected_number) && not_blank(selected_title) ) {
		
			generatePaths(selected_number,selected_title);
			playing = true;
			paused = false;
			
			$('#lyrics').data('slides', selected_slides);
			$('#lyrics').attr('src', generateLyricsPath(slide));
			
			toggle_controls();
			
			$('#playing').fadeIn('fast', function(){
				$('#main input').attr('disabled','disabled');
				play_selected(reverse);
			});
		}
	}