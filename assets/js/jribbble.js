(function(e,t,n,r){"use strict";e.jribbble={};var i=function(t,n){e.ajax({type:"GET",url:"http://api.dribbble.com"+t,data:n[1]||{},dataType:"jsonp",success:function(e){if(typeof e==="undefined"){n[0]({error:true})}else{n[0](e)}}})};var s={getShotById:"/shots/$/",getReboundsOfShot:"/shots/$/rebounds/",getShotsByList:"/shots/$/",getShotsByPlayerId:"/players/$/shots/",getShotsThatPlayerFollows:"/players/$/shots/following/",getPlayerById:"/players/$/",getPlayerFollowers:"/players/$/followers/",getPlayerFollowing:"/players/$/following/",getPlayerDraftees:"/players/$/draftees/",getCommentsOfShot:"/shots/$/comments/",getShotsThatPlayerLikes:"/players/$/shots/likes/"};var o=function(e){return function(){var t=[].slice.call(arguments),n=e.replace("$",t.shift());i(n,t)}};for(var u in s){e.jribbble[u]=o(s[u])}})(jQuery,window,document);