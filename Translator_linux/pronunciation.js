(function () {
    const jQuery = require('./js/jquery-3.2.1.js'),
        $ = jQuery;
    const database = require('./database.js');

    var play_queue = [];
    var queue_is_running = false;
    var current_pronunciation = null;

    function init() {
        database.init();
    }

    function clear_queue() {
        play_queue = [];
        if (queue_is_running && null !== current_pronunciation) {
            current_pronunciation.cancel();
            queue_is_running = false;
        }
    }

    function run_play_queue() {
        if (queue_is_running || play_queue.length === 0) {
            return false;
        }
        var without_delay = true;
        function _loop() {
            var play = play_queue.shift();
            if (!play) {
                current_pronunciation = null;
                queue_is_running = false;
                return;
            }
            function pronunciation() {
                var is_cancel = false;
                var audio = null;
                var timeout = setTimeout(function () {
                    audio = play_audio(play[0], play[1], function (status) {
                        if (is_cancel) {
                            play[3](status);
                            return;
                        }
                        if (!status)
                            without_delay = true;
                        _loop();
                        play[3](status);
                    });
                }, without_delay ? 0 : play[2]);
                without_delay = false;
                pronunciation.cancel = function () {
                    audio && (audio.volume = 0);
                    is_cancel = true;
                    clearTimeout(timeout);
                }
            }
            current_pronunciation = pronunciation;
            pronunciation();
        }
        _loop();
        queue_is_running = true;
    }

    function add2queue(word, client, delay, callback) {
        play_queue.push([word, client, delay, callback]);
        run_play_queue();
    }

    function play_audio(word, client, callback) {
        var buffer = database['get_' + client](word);
        if (!buffer) {
            callback(false);
            return false;
        }
        var blob = new Blob([buffer], { type: 'audio/mpeg' });
        var url = URL.createObjectURL(blob);
        var audio = document.createElement('audio');
        audio.src = url;
        audio.volume = 0.5;
        audio.onended = function (event) {
            callback(true);
        }
        audio.play();
        return audio;
    }



    function play_baidu_American_pronunciation(word, callback) {
        return play_audio(word, 'baidu_American_pronunciation', callback);
    }
    function play_google_American_pronunciation(word, callback) {
        return play_audio(word, 'google_American_pronunciation', callback);
    }
    function play_cambridge_American_pronunciation(word, callback) {
        return play_audio(word, 'cambridge_American_pronunciation', callback);
    }
    function play_collins_American_pronunciation(word, callback) {
        return play_audio(word, 'collins_American_pronunciation', callback);
    }
    function play_baidu_British_pronunciation(word, callback) {
        return play_audio(word, 'baidu_British_pronunciation', callback);
    }
    function play_google_British_pronunciation(word, callback) {
        return play_audio(word, 'google_British_pronunciation', callback);
    }
    function play_cambridge_British_pronunciation(word, callback) {
        return play_audio(word, 'cambridge_British_pronunciation', callback);
    }
    function play_collins_British_pronunciation(word, callback) {
        return play_audio(word, 'collins_British_pronunciation', callback);
    }
    module.exports = {
        init: init,
        play_audio: play_audio,
        clear_queue: clear_queue,
        add2queue: add2queue,
        play_baidu_American_pronunciation: play_baidu_American_pronunciation,
        play_google_American_pronunciation: play_google_American_pronunciation,
        play_cambridge_American_pronunciation: play_cambridge_American_pronunciation,
        play_collins_American_pronunciation: play_collins_American_pronunciation,
        play_baidu_British_pronunciation: play_baidu_British_pronunciation,
        play_google_British_pronunciation: play_google_British_pronunciation,
        play_cambridge_British_pronunciation: play_cambridge_British_pronunciation,
        play_collins_British_pronunciation: play_collins_British_pronunciation,
    }
})();