

var fs = require('fs')
var elmo = fs.readFileSync('O:/Download/index.html');
elmo


const database = require('P:/Works/Electron/Translator/database.js');
database.init_database();

database.get_pronunciation('mate', function (result) {
    function add_button(name,pronunciation) {
        var blob = new Blob([pronunciation], { type: 'audio/mpeg' });
        var url = URL.createObjectURL(blob);
        var audio = $('<audio>');
        audio.attr('src', url);
        var button = $('<a>').text('>>>' + name + '<<<').append(audio).css('display','block');
        button.on('click', function (event) {
            var audio = $('audio', event.target);
            audio[0].play();
        });
        $('body').append(button);
    }
    for (name_1 in result.pronunciations) {
        for (name_2 in result.pronunciations[name_1]) {
            add_button(name_1 + '_' + name_2, result.pronunciations[name_1][name_2]);
        }
    }
    add_button('------------------------------------------------------------------------')
});


var oReq = new XMLHttpRequest();
oReq.open("GET", "https://fanyi.baidu.com/gettts?lan=uk&text=free&spd=3&source=web", true);
oReq.responseType = "blob";
oReq.onload = function (oEvent) {
    var blob = oReq.response; // Note: not oReq.responseText
    window.blob = blob;
    var file_reader = new FileReader();
    file_reader.onload = function (event) {
        buffer = new Buffer(event.target.result, 'binary');
        database.store_pronunciation('test2', {
            google_pronunciation: '',
            baidu_pronunciation: buffer,
            cambridge_pronunciation: buffer,
            collins_pronunciation: ''
        }, function (error) {
            console.log
        });

    }
    file_reader.readAsArrayBuffer(blob);
};
oReq.send(null);


const translator = require('./translate_library.js');
const fs = require('fs');
translator.get_baidu_pronunciation('free', function (result) {
    console.log(result)
    fs.writeFile('T:/temp/a.mp3', result.buffer.American, function () { });
    fs.writeFile('T:/temp/b.mp3', result.buffer.British, function () { });
})
translator.get_google_pronunciation('free', function (result) {
    console.log(result)
    fs.writeFile('T:/temp/a.mp3', result.buffer.American, function () { });
    fs.writeFile('T:/temp/b.mp3', result.buffer.British, function () { });
})
translator.get_cambridge_pronunciation('free', function (result) {
    console.log(result)
    fs.writeFile('T:/temp/a.mp3', result.buffer.American, function () { });
    fs.writeFile('T:/temp/b.mp3', result.buffer.British, function () { });
})
translator.get_collins_pronunciation('testing', function (result) {
    console.log(result)
    fs.writeFile('T:/temp/a.mp3', result.buffer.American, function () { });
    fs.writeFile('T:/temp/b.mp3', result.buffer.British, function () { });
})


