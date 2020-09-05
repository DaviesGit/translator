var a=document.createElement('audio');
a.onended=function(){console.log('ended')};
a.onpause=function(){console.log('pause')};
// a.src='http://111.9.117.35/mp3.9ku.com/m4a2/468785.m4a';
a.src='https://fanyi.baidu.com/gettts?lan=en&text=free&spd=3&source=web';
a.play();
setTimeout(function(){
    a.pause();
},1000);



var database=require('./database.js');
database.get_google_raw_translation('high');
database.get_baidu_raw_translation('high');

