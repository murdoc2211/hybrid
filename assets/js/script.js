/*  TABLE OF CONTENT
    1. Common function
    2. Initialing
*/
/*================================================================*/
/*  1. Common function
/*================================================================*/
paceOptions = {
    elements: true
};
(function($){ 
    "use strict";
    var sfApp={
    	tags_list:[],
		isMobile:function(){
	        if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
	            return true;
	        }
	        else
	            return false;
	    },
	    nextPrevPost:function(){
	        if($('.next-prev-posts').length){
	            var page = 0;
	            var isFound=false;            
	            var result = new Array();            
	            var $prevPost = null;
	            var $prevPostLastPage = null;
	            var currentUrl = $('.next-prev-posts').data('current-url');
	            console.log('process page: '+page);
	            if(currentUrl != ''){
	                var timeout = setInterval(function(){
	                    page=page+1;
	                    var ajaxUrl=rootUrl+'/rss/'+page+'/';
	                    if(page==1){
	                        ajaxUrl=rootUrl+'/rss/';
	                    }
	                    $.ajax({
	                        type: 'GET',
	                        url: ajaxUrl,
	                        dataType: "xml",
	                        success: function(xml) {
	                            console.log('process page: '+page);
	                            if($(xml).length){   
	                                var total = $('item', xml).length;                                                        
	                                $('item', xml).each( function(index, element) {                                    
	                                    if(index==0){
	                                        $prevPost = null;
	                                    }                                    
	                                    if(index>1){
	                                        $prevPostLastPage = null;
	                                    }
	                                    if(index == total-1){
	                                        $prevPostLastPage = $(element);   
	                                    }                                                                        
	                                    // Found next
	                                    if(isFound){
	                                        sfApp.fillNextPrevPostData('next',$(element));
	                                        if($prevPostLastPage!=null){
	                                            sfApp.fillNextPrevPostData('prev',$prevPostLastPage);
	                                        }                                                                                              
	                                        clearInterval(timeout);                                        
	                                        return false;                     
	                                    }
	                                    else if(currentUrl == $(element).find('link').eq(0).text()){
	                                        isFound = true;                                                          
	                                        if(index>0){
	                                            sfApp.fillNextPrevPostData('prev',$(xml).find('item').eq(index-1));                                                                                 
	                                        }                      
	                                    }                                    
	                                });
	                            }
	                        }
	                    });
	                }, 2000);                                
	            }
	        }
	    },
	    fillNextPrevPostData:function( type, data ){
	        var $container = $('.next-prev-posts');
	        $( '.'+ type, $container ).attr( 'href', $( data ).find( 'link' ).eq(0).text());
	        $( '.'+ type, $container ).attr( 'title', $( data ).find( 'title' ).eq(0).text());
	        $( '.'+ type + ' h4', $container ).html( $( data ).find( 'title' ).eq(0).text());
	        $( '.' + type, $container ).addClass( 'has-result' );
	        var nextBoxHeight = $( '.next', $container ).outerHeight();
	        var prevBoxHeight = $( '.prev', $container ).outerHeight();
	        if( nextBoxHeight > prevBoxHeight ) {            
	            $( '.prev', $container ).css( { height: nextBoxHeight } );
	        }
	        else{            
	            $( '.next', $container ).css( { height: prevBoxHeight } );
	        }
	        $container.addClass( 'has-result' );	                
	        var $desc = $($(data).find('description').eq(0).text());
	        console.log($desc.first());
	        if($desc.first().is('img')){
	        	var $cover=$desc.first();
	        	var coverSrc=$cover.attr('src');
	        	if( '/' === coverSrc.charAt(coverSrc.length - 1) ){
	        		coverSrc = coverSrc.substring(0, coverSrc.length - 1);	
	        	}	        	
	        	if( '' !== coverSrc ){
	        		$('.'+type,$container).css('background-image', 'url("' + coverSrc + '")');
	                $('.'+type,$container).addClass('has-background');
	        	}
	        }                       
	    },
	    widgetEvents:function(){
	    	if( $('.flickr-feed').length ){
	            $('.flickr-feed').each(function() {
	                var flickr_id='';
	                if($(this).data('user-id')){
	                    flickr_id=$(this).data('user-id');
	                }
	                if(flickr_id==''){
	                    $(this).html('<li><strong>Please enter Flickr user id before use this widget</strong></li>');
	                }
	                else{
	                    var feedTemplate='<li><a href="{{image_b}}" target="_blank"><img src="{{image_m}}" alt="{{title}}" /></a></li>';
	                    var size=15;
	                    if($(this).data('size'))
	                        size=$(this).data('size');
	                    var isPopupPreview=false;
	                    if($(this).data('popup-preview'))
	                        isPopupPreview=$(this).data('popup-preview');
	                    if(isPopupPreview){
	                        feedTemplate='<li><a href="{{image_b}}"><img src="{{image_m}}" alt="{{title}}" /></a></li>';
	                    }
	                    $(this).jflickrfeed({
	                        limit: size,
	                        qstrings: {
	                            id: flickr_id
	                        },
	                        itemTemplate: feedTemplate
	                    }, function(data) {
	                        if(isPopupPreview){
	                            $(this).magnificPopup({
	                                delegate: 'a',
	                                type: 'image',
	                                closeOnContentClick: false,
	                                closeBtnInside: false,
	                                mainClass: 'mfp-with-zoom mfp-img-mobile',
	                                gallery: {
	                                    enabled: true,
	                                    navigateByImgClick: true,
	                                    preload: [0,1] // Will preload 0 - before current, and 1 after the current image
	                                },
	                                image: {
	                                    verticalFit: true,
	                                    tError: '<a href="%url%">The image #%curr%</a> could not be loaded.'
	                                }
	                            });
	                        }
	                    });
	                }
	            });
	        }
	        if($('.dribbble-feed').length && $.jribbble ){
	            $('.dribbble-feed').each(function(){
	                var $this=$(this);
	                var userId='';
	                if($this.data('userid')){
	                    userId = $this.data('userid');
	                }
	                if( userId != '' ){                    
	                    var display=15;
	                    if($this.data('display'))
	                        display=$this.data('display');
	                    var isPopupPreview=false;
	                    if($this.data('popup-preview'))
	                        isPopupPreview=$this.data('popup-preview');
	                    $.jribbble.getShotsByPlayerId(userId, function (listDetails) {                        
	                        var html = [];
	                        $.each(listDetails.shots, function (i, shot) {
	                            html.push('<li><a href="' + shot.url + '"><img src="' + shot.image_teaser_url + '" alt="' + shot.title + '"></a></li>');
	                        });
	                        $this.html(html.join(''));	                        
	                        if(isPopupPreview){
	                            $this.magnificPopup({
	                                delegate: 'a',
	                                type: 'image',
	                                tLoading: 'Loading image #%curr%...',
	                                closeOnContentClick: true,
	                                closeBtnInside: false,
	                                fixedContentPos: true,
	                                mainClass: 'mfp-no-margins mfp-with-zoom', // class to remove default margin from left and right side
	                                image: {
	                                    verticalFit: true,
	                                    tError: '<a href="%url%">The image #%curr%</a> could not be loaded.'
	                                },
	                                gallery: {
	                                    enabled: true,
	                                    navigateByImgClick: true,
	                                    preload: [0,1] // Will preload 0 - before current, and 1 after the current image
	                                }
	                            });
	                        }
	                    }, {page: 1, per_page: display});
	                }
	                
	            });
	        }
	        if( $( '.instagram-feed' ).length && $.fn.spectragram ) {            
	            $( '.instagram-feed' ).each(function(){
	                var $this=$(this);
	                if( $this.data( 'userid' ) != '' && $this.data( 'api-token' ) != '' && $this.data( 'api-clientid' ) != '' ) {
	                    $.fn.spectragram.accessData = {
	                        accessToken: $this.data('api-token'),
	                        clientID: $this.data('api-clientid')
	                    };
	                    var display=15;
	                    var wrapEachWithStr='<li></li>';
	                    if($(this).data('display'))
	                        display=$(this).data('display');
	                    $(this).spectragram('getUserFeed',{
	                        query: $this.data( 'userid' ),
	                        max: display
	                    });
	                }
	                else{
	                    $(this).html('<li><strong>Please change instagram api access info before use this widget</strong></li>');
	                }
	            });
	        }
	        if($('.recent-posts').length){
	            $('.recent-posts').each(function(){
	                var $this=$(this);
	                var showPubDate = false;
	                var showDesc = false;
	                var descCharacterLimit = 70;
	                var size = 5;	
	                if($this.data('size')){
	                    size = $this.data('size');	                
	                }
	                if($this.data('pubdate')){
	                    showPubDate = $this.data('pubdate');
	                }
	                if( $this.data('desc') ) {
	                    showDesc = $this.data('desc');
	                    if($this.data('character-limit')){
	                        descCharacterLimit = $this.data('character-limit');
	                    }
	                }	                
	                $.ajax({
	                    type: 'GET',
	                    url: rootUrl + '/rss/',
	                    dataType: 'xml',
	                    success: function(xml) {
	                        if($(xml).length){
	                            var htmlStr='';	                            
	                            var count = 0;
	                            var date;
	                            var desc;
	                            $('item', xml).each( function() {
	                                if( size>0 && count < size ) {
	                                    htmlStr += '<li>';  
	                                    htmlStr += '<a href="' + $(this).find('link').eq(0).text() + '">' + $(this).find('title').eq(0).text() + '</a>'; 
	                                    if ( showPubDate ){
	                                    	date = new Date( $(this).find('pubDate').eq(0).text() );
		                                    htmlStr +='<span class="post-date">' + date.toDateString() + '</span>';
		                                }
		                                if( showDesc ){
		                                	desc = $(this).find('description').eq(0).text();		                                	
                                        	desc = $(desc).text();
                                        	if (descCharacterLimit > 0 && desc.length > descCharacterLimit) {
	                                            htmlStr += '<span class="post-desc">' + desc.substr( 0, descCharacterLimit ) + '</span>';
	                                        }
	                                        else{
	                                            htmlStr += '<span class="desc">' + desc + "</span>";
	                                        }
		                                }
	                                    htmlStr += '</li>';
	                                    count++;
	                                }
	                                else{
	                                    return false;
	                                }
	                            });                            
	                            htmlStr='<ul>'+ htmlStr + '</ul>';                            
	                            $this.append(htmlStr);	                            
	                        }
	                    },
	                    error: function (xhr, ajaxOptions, thrownError) {
	                        console.log(thrownError);
	                    }
	                });
	            });
	        }
	        if($('.sf-tags').length){	        	
	        	$('.sf-tags').each(function(){
	        		var $this = $(this);
	        		if(! sfApp.tags_list.length){
		        		var page = 0;	        	
		        		var maxPage = 0;		        		
						$.ajax({
			                type: 'GET',
			                url: rootUrl,
			                success: function(response){
			                    var $response=$(response);
			                    var postPerPage=$response.find('.post-list .row .post').length; 
			                    var totalPage=parseInt($response.find('.total-page').html());
			                    maxPage=Math.floor( ( postPerPage * totalPage ) / 15 ) +1 ;                                       
			                    var timeout = setInterval(function(){
			                        page = page + 1;                
			                        var ajaxUrl = rootUrl+'/rss/'+page+'/';
			                        if(page==1){
			                            ajaxUrl=rootUrl+'/rss/';
			                        } 
			                        if( page > maxPage ) {
			                            clearInterval(timeout);		
			                            sfApp.fillTagData($this);                            
			                        }
			                        else{                                                                          
			                            $.ajax({
			                                type: 'GET',
			                                url: ajaxUrl,
			                                dataType: 'xml',
			                                success: function(xml) {
			                                    if($(xml).length){                                                           
			                                        $('item', xml).each( function() { 			                                        		                                        	
			                                        	if( $(this).find('category').length ){
			                                        		$(this).find('category').each( function() { 
			                                        			var tag = $(this).text();
																if ( '_full_width' !== tag && '_left_sidebar' !== tag && '_right_sidebar' !== tag ) {
																	var tagOj= {'tagName': tag,'total': 1};
																	var hasOld=false;
											                        for(var i = 0; i < sfApp.tags_list.length; i++){
											                            if(tag === sfApp.tags_list[i].tagName){
											                                tagOj.total=sfApp.tags_list[i].total+1;
											                                sfApp.tags_list[i]=tagOj;
											                                hasOld=true;
											                                break;
											                            }
											                        }
											                        if(!hasOld){
											                            sfApp.tags_list.push(tagOj);																	
											                        }
																}
			                                        		});
			                                        	}
			                                        });
			                                    }
			                                }
			                            });   
			                        }             
			                    }, 1000); 
			                }
			            }); 
					}
					else{
						sfApp.fillTagData($this);
					}
	        	});
	        }
	        if($('.newsletter-form').length){
	            $('.newsletter-form').each(function(){
	                var $this = $(this);
	                $('input', $this).not('[type=submit]').jqBootstrapValidation({
	                    submitSuccess: function ($form, event) {                                       
	                        event.preventDefault();                                            
	                        var url=$form.attr('action');
	                        if(url=='' || url=='YOUR_WEB_FORM_URL_HERE'){
	                            alert('Please config your mailchimp form url for this widget');
	                            return false;
	                        }
	                        else{
	                            url=url.replace('/post?', '/post-json?').concat('&c=?');
	                            var data = {};
	                            var dataArray = $form.serializeArray();
	                            $.each(dataArray, function (index, item) {
	                                data[item.name] = item.value;
	                            });
	                            $.ajax({
	                                url: url,
	                                data: data,
	                                success: function(resp){
	                                    if ('success' !== resp.result ) {                                       
	                                        $this.find( '.alert .alert-title').html('Error');
	                                        $this.find( '.alert .alert-text' ).html( resp.result );
	                                        $this.find( '.alert').addClass('alert-danger');  
	                                    }
	                                    $this.find('.alert').fadeIn();
	                                },
	                                dataType: 'jsonp',
	                                error: function (resp, text) {
	                                    console.log('mailchimp ajax submit error: ' + text);
	                                }
	                            });
	                            return false;
	                        }
	                        return false;
	                    }
	                });
	            });            
	        }
	        if( $( '.sf-fb-like-box' ).length ){
	        	$( '.sf-fb-like-box' ).each(function(){
	        		var page_url = '';
	        		if( $(this).data('pageurl') ){
	        			page_url = $(this).data('pageurl');	        			
	        		}
	        		if( '' !== page_url ){
	        			var color_scheme = 'light';
	        			var $maybe_footer = $(this).closest('.widget-area-wrap');
	        			if( $maybe_footer.length && !$('body').is('.dark') ){
	        				color_scheme = 'dark';
	        			}
	        			var htmlStr = '<iframe src="//www.facebook.com/plugins/likebox.php?href=' + page_url + '&amp;width&amp;height=258&amp;colorscheme=' + color_scheme + '&amp;show_faces=true&amp;header=false&amp;stream=false&amp;show_border=false" scrolling="no" frameborder="0" style="border:none; overflow:hidden; height:258px; width:100%;" allowTransparency="true"></iframe>';
	        			$(this).html( htmlStr );
	        		}
	        	});
	        }	
	        if($('.search-keyword-widget').length){
	            $('.search-keyword-widget').keypress(function(event) { 
	            	var $this = $(this); 	  	            	          	
	                if (event.which == 13) {
	                	var $sf_search_widget = $(this).closest('.sf-search-widget');
	                	if( $sf_search_widget.length ){
	                		var $result_container = $( '.search-result-widget-wrap .search-result-widget-inner .search-result-widget', $sf_search_widget );
	                		if( $result_container ){
	                			if( $this.val() !='' && $this.val().length>=3 ){                             
			                        $result_container.html('<li class="loading-text">Searching ...</li>');
			                        $result_container.addClass('searching');
			                        var $search_result_wrap = $result_container.closest('.search-result-widget-wrap');
			                        if( $search_result_wrap.length ){
			                        	$search_result_wrap.addClass('scroll');
			                        }			                        
			                        sfApp.search( $this.val(), $result_container );	 	                                               
			                    }
			                    else{
			                        $result_container.html('<li class="loading-text">Please enter at least 3 characters!</li>');
			                        $result_container.addClass('searching');
			                    }
			                    var $form_group = $this.closest('.form-group');
			                    if( $form_group.length ){
				            		var $icon = $('.sf-widget-search-icon', $form_group);	
				            		if( $icon.length ){
				            			$( '.fa', $icon ).removeClass('fa-search');
				            			$( '.fa', $icon ).addClass('fa-times');
				            			$icon.addClass('searched');
				            		}
				            	}
	                		}
	                	}
	                }
	            });				
	        }      
	        $('.sf-widget-search-icon').click(function(){
				var $this = $(this); 
				if($this.is('.searched')){
					$this.removeClass('searched');
					$('.fa', $this).removeClass('fa-times');
					$('.fa', $this).addClass('fa-search');
					var $sf_search_widget = $(this).closest('.sf-search-widget');
	            	if( $sf_search_widget.length ){
	            		var $search_result_wrap = $( '.search-result-widget-wrap', $sf_search_widget );
	            		if( $search_result_wrap.length ){
	            			$search_result_wrap.removeClass('scroll');
	            		}
	            		var $result_container = $( '.search-result-widget-wrap .search-result-widget-inner .search-result-widget', $sf_search_widget );
	            		if( $result_container.length ){
	            			$result_container.html('');
							$result_container.removeClass('searching');							
	            		}
	            	}
				}				
			}); 
	    },
	    fillTagData:function(element){
	    	if( $(element).length && sfApp.tags_list.length ) {
	    		var items = 10;
	    		if($(element).data('max-items')){
	    			items = $(element).data('max-items');
	    		}
	    		var count = 0;
		    	var htmlStr = '<ul>';
		    	$.each( sfApp.tags_list, function( index, tag ) {
		    		var tagLink = tag.tagName.toLowerCase().replace(/ /g, '-');
		    		htmlStr += '<li><a href="' + rootUrl + '/tag/' + tagLink + '"><span class="name">' + tag.tagName + '</span><span class="count">' + tag.total + '</span></a></li>';
				  	count++;
				  	if( count >= items ) {				  		
				  		return false;
				  	}
				});				
		    	htmlStr += '</ul>';
				$(element).html(htmlStr);
			}
	    },
	    paginationEvents:function(){

	    },
	    scrollEvents:function(){
	    	$(window).scroll(function() {
	            if ($(window).scrollTop() > $('.main-wrap').offset().top ) {
	                $('.go-to-top-wrap').fadeIn();	                	                
	            }	            
	            else {
	                $('.go-to-top-wrap').fadeOut();
	            }
	        });
	    },
	    searchEvents:function(){
	    	if($('.search-button').length){
	            $('.search-button').click(function(){
	                $('#search-keyword').val('');
	                var $search=$('.search-container');                
	                if(!$(this).is('.active')){
	                    $('body').addClass('open-search');
	                    $search.addClass('open');
	                    $(this).addClass('active');                    
	                }
	                else{
	                    $('body').removeClass('open-search');
	                    $search.removeClass('open');
	                    $(this).removeClass('active');
	                    $('.search-result').removeClass('searching');                    
	                }
	            });
	        }
	        if($('#search-keyword').length){
	            $('#search-keyword').keypress(function(event) {            
	                if (event.which == 13) {
	                    if( $('#search-keyword').val() !='' && $('#search-keyword').val().length>=3 ){                             
	                        $('.search-result').html('<li class="loading-text">Searching ...</li>');
	                        $('.search-result').addClass('searching');
	                        $('.search-result-wrap').addClass('scroll');
	                        sfApp.search($('#search-keyword').val(), $('.search-result') );
	                    }
	                    else{
	                        $('.search-result').html('<li class="loading-text">Please enter at least 3 characters!</li>');
	                        $('.search-result').addClass('searching');
	                    }
	                }
	            });
	        }
	    },
	    search:function(keyword, container){
	        var hasResult=false;
	        var page = 0;
	        var maxPage=0;        
	        if(keyword != ''){                  
	            $.ajax({
	                type: 'GET',
	                url: rootUrl,
	                success: function(response){
	                    var $response=$(response);
	                    var postPerPage=$response.find('.post-list .row .post').length; 
	                    var totalPage=parseInt($response.find('.total-page').html());
	                    maxPage=Math.floor((postPerPage*totalPage)/15)+1;                                       
	                    var timeout = setInterval(function(){
	                        page=page+1;                
	                        var ajaxUrl=rootUrl+'/rss/'+page+'/';
	                        if(page==1){
	                            ajaxUrl=rootUrl+'/rss/';
	                        } 
	                        if(page>maxPage){
	                            clearInterval(timeout);
	                            if(!hasResult){
	                            	if($('.loading-text', container).length){
	                                	$('.loading-text', container).html('Apologies, but no results were found. Please try another keyword!');
	                                }
	                            }
	                        }
	                        else{                                                                          
	                            $.ajax({
	                                type: 'GET',
	                                url: ajaxUrl,
	                                dataType: "xml",
	                                success: function(xml) {
	                                    if($(xml).length){                                                           
	                                        $('item', xml).each( function() {                                                                          
	                                            if($(this).find('title').eq(0).text().toLowerCase().indexOf(keyword.toLowerCase())>=0 ||
	                                                    $(this).find('description').eq(0).text().toLowerCase().indexOf(keyword.toLowerCase())>=0){
	                                                hasResult=true;
	                                                if($('.loading-text', container).length){
	                                                    $('.loading-text',container).remove();
	                                                }	                                                
	                                                container.append('<li><a href="'+$(this).find('link').eq(0).text()+'">'+$(this).find('title').eq(0).text()+'</a></li>');
	                                            }                    
	                                        });
	                                    }
	                                }
	                            });   
	                        }             
	                    }, 1000); 
	                }
	            });                                           
	        }
	    },
	    menuEvents:function(){
	    	if($('.mobile-nav-button').length){
	            $('.mobile-nav-button').click(function(){                
	                var $menu = $('.sf-nav-wrap');                
	                if(!$(this).is('.active')){                    
	                    $('body').addClass('open-menu');
	                    $menu.addClass('open');
	                    $(this).addClass('active');    	                                  
	                }
	                else{
	                    $('body').removeClass('open-menu');
	                    $menu.removeClass('open');
	                    $(this).removeClass('active');	                    
	                }
	            });
	        }   
	        $('.sf-nav-widget li.has-children > a').click(function(e){
        		if( '#' === $( this ).attr('href') ){
        			e.preventDefault();	
        		}	        		
        		var $parent = $(this).parent();
        		$('.sub-menu:first', $parent ).slideToggle();
        		if( !$parent.is( '.open' ) ){
        			$parent.addClass('open');
        		}
        		else{
        			$parent.removeClass('open');	
        		}
        	});     
	        if( sfApp.isMobile() || $(window).width() <= 1024 ){
	        	$('.sf-nav li.has-children > a').click(function(e){
	        		if( '#' === $( this ).attr('href') ){
	        			e.preventDefault();	
	        		}	        		
	        		var $parent = $(this).parent();
	        		$('.sub-menu:first', $parent ).slideToggle();
	        		if( !$parent.is( '.open' ) ){
	        			$parent.addClass('open');
	        		}
	        		else{
	        			$parent.removeClass('open');	
	        		}
	        	});   
	        }
	    },
	    goToTopEvents:function(){	    	
            $('.go-to-top').click(function () {
                $('html, body').animate({scrollTop: 0}, 800);
                return false;
            });	        
	    },
	    resizeEvents:function(){
	    	sfApp.uiInit();
	    },
	    triggerEvents:function(){	    	
	    	sfApp.menuEvents();
	    	sfApp.widgetEvents();
	    	sfApp.nextPrevPost();
	    	sfApp.searchEvents();
	    	sfApp.scrollEvents();
	    	sfApp.resizeEvents();
	    	sfApp.goToTopEvents();
	    },
	    hexColor:function(colorval) {
	        var parts = colorval.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
	        delete(parts[0]);
	        for (var i = 1; i <= 3; ++i) {
	            parts[i] = parseInt(parts[i]).toString(16);
	            if (parts[i].length == 1) parts[i] = '0' + parts[i];
	        }
	        return '#' + parts.join('');
	    },
	    gmapInit:function(){
	        if($('.gmap').length){
	            var your_latitude=$('.gmap').data('latitude');
	            var your_longitude=$('.gmap').data('longitude');            
	            var mainColor=sfApp.hexColor( $('.gmap-container').css('backgroundColor') );
	            var myLatlng = new google.maps.LatLng(your_latitude,your_longitude);
	            var mapOptions = {
	                zoom: 17,
	                mapTypeId: google.maps.MapTypeId.ROADMAP,
	                mapTypeControl: false,
	                panControl: false,
	                zoomControl: false,
	                scaleControl: false,
	                streetViewControl: false,
	                scrollwheel: false,
	                center: myLatlng,
	                styles: [{"stylers":[{"hue": mainColor, "lightness" : 100}]}]
	            }
	            var map = new google.maps.Map(document.getElementById('gmap'), mapOptions);
	            var markerIcon = new google.maps.MarkerImage(
	                            rootUrl +'assets/img/map-marker.png',
	                            null, // size
	                            null, // origin
	                            new google.maps.Point( 32, 32 ), // anchor (move to center of marker)
	                            new google.maps.Size( 64, 64 ) // scaled size (required for Retina display icon)
	                        );            
	            var marker = new google.maps.Marker({
	                position: myLatlng,
	                flat: true,
	                icon: markerIcon,
	                map: map,
	                optimized: false,
	                title: 'i-am-here',
	                visible: true
	            });
	        }        
	    },
	    uiInit:function(){
	    	// optimize sidebar for 1024px screen
	    	if( $(window).width() === 1024 ) {
	    		if( $('.sidebar').length ){
	    			var $main_content = $('.main-content');
	    			if( $main_content.is('.col-md-9') ){
	    				$main_content.removeClass('col-md-9');
	    				$main_content.addClass('col-md-8');
	    			}
	    			if( $main_content.is('.col-md-push-3') ){
	    				$main_content.removeClass('col-md-push-3');
	    				$main_content.addClass('col-md-push-4');
	    			}
	    			var $sidebar = $('.sidebar');
	    			if( $sidebar.is('.col-md-3') ){
	    				$sidebar.removeClass('col-md-3');
	    				$sidebar.addClass('col-md-4');
	    			}	    			
	    			if( $sidebar.is('.col-md-pull-9') ){
	    				$sidebar.removeClass('col-md-pull-9');
	    				$sidebar.addClass('col-md-pull-8');
	    			}
	    			$('body').addClass('sf-optimized-size');
	    		}
	    	}
	    },
	    misc:function(){
	    	if(!sfApp.isMobile() && $('body').data('parallax') ){
	            skrollr.init({
	                forceHeight: false
	            });   
	        }        
	        if($('.gmap').length){
	            sfApp.gmapInit();
	            google.maps.event.addDomListener(window, 'load', sfApp.gmapInit);
	            google.maps.event.addDomListener(window, 'resize', sfApp.gmapInit);
	        }
	        $('.post-content').fitVids();	
	        var currentUrl=window.location.href;

	        // Set active for main menu
	        var $currentMenu = $('.sf-nav').find('a[href="'+currentUrl+'"]');
	        if( $currentMenu.length ){            
	            $('.sf-nav li.active').removeClass('active');
	            $currentMenu.parent().addClass('active');            
	            $currentMenu.parents('.has-children').addClass('active');            
	        }

	        // Set active for widget menu
	        if( $('.sf-nav-widget').length ){
	        	var $currentItem = $('.sf-nav-widget').find('a[href="'+currentUrl+'"]');
	        	if( $currentItem.length ){
	        		$('.sf-nav-widget li.active').removeClass('active');
	        		$currentItem.parent().addClass('active');
	        		$currentItem.parents('.has-children').addClass('active');            
	        	}
	        }
	        $('input, textarea').placeholder();

	        // Magnific Popup for Image
	        if( $('.post-content .content-area').length ){
	        	var $images = $('.post-content .content-area').find('img[alt*="popup-preview"]');
	        	if( $images.length ){
	        		$images.each(function(){
	        			$(this).wrap( '<a class="popup-preview" href="' + $(this).attr('src') + '"></a>' );
	        			var $wrap = $(this).parent();
	        			var alt = $(this).attr( 'alt' );
	        			if( alt.indexOf( 'alignright' ) >=0 ) {
	        				$wrap.addClass( 'alignright' );
	        			}
	        			if( alt.indexOf( 'alignleft' ) >=0 ) {
	        				$wrap.addClass( 'alignleft' );
	        			}
	        			if( alt.indexOf( 'aligncenter' ) >=0 ) {
	        				$wrap.addClass( 'aligncenter' );
	        			}
	        		});
	        		$('.popup-preview').magnificPopup({
			          	type: 'image',
			          	closeOnContentClick: true,
			          	closeBtnInside: false,
			          	fixedContentPos: true,
			          	mainClass: 'mfp-no-margins mfp-with-zoom', // class to remove default margin from left and right side
			          	image: {
			            	verticalFit: true
			          	},
			          	gallery: {
					      	enabled: true
					    },
			          	zoom: {
			            	enabled: true,
			            	duration: 300 // don't foget to change the duration also in CSS
			          	}
			        });
	        	}	        	
	        }
	    },
	    init: function () {	
	    	sfApp.uiInit();
	    	sfApp.triggerEvents();    		    	
			sfApp.misc();						
		}
	};
	$(document).ready(function() {
	    "use strict";  
	    sfApp.init();
	});
	$(window).resize(function () {
	    "use strict";    
	    if(this.resizeTO){
	        clearTimeout(this.resizeTO);
	    }  
	    this.resizeTO = setTimeout(function() {
	        $(this).trigger('resizeEnd');
	    }, 500);
	});
	$(window).bind('resizeEnd', function() {
	    "use strict";    
	    sfApp.resizeEvents();    	    
	});
})(jQuery);