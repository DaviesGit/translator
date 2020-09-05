(function () {
    const path = require('path');
    const fs = require('fs');
    const translator = require('./translator.js');
    const pronunciation = require('./pronunciation');
    const configuration = {
        maximum_histories: 10,
    }

    var saved_words = JSON.parse(fs.readFileSync(path.join(__dirname, '../Translator4.55.12/saved_words.json'), {
        encoding: 'utf8'
    }));
    var addition_words = JSON.parse(fs.readFileSync(path.join(__dirname, '../Translator4.55.12/google_synonym.json'), {
        encoding: 'utf8'
    }));
    var addition_words_length = addition_words.length;
    var valid_length = 0;
    var learn_history = [];

    function add2history(word) {
        learn_history.unshift(word);
        while (learn_history.length > configuration.maximum_histories) {
            learn_history.pop();
        }
    }

    function get_histories() {
        return learn_history;
    }

    function update_length() {
        saved_words.forEach(function (word) {
            valid_length += word[1];
        });
    }

    function init() {
        update_length();
        return true;
    }

    function get_word(word) {
        for (var i = 0, len = saved_words.length; i < len; ++i) {
            if (word === saved_words[i][0]) {
                return saved_words[i];
            }
        }
        return false;
    }


    var timeout_array = [];

    function save2file(delay) {
        var timeout = setTimeout(function () {
            var timeout = 0;
            while (undefined !== (timeout = timeout_array.pop()))
                clearTimeout(timeout);
            fs.writeFileSync(path.join(__dirname, '../Translator4.55.12/saved_words.json'), JSON.stringify(saved_words));
        }, delay);
        timeout_array.push(timeout);
    }

    function save_word(word) {
        save2file(10 * 1000);
        ++valid_length;
        var _word = get_word(word);
        if (_word) {
            ++_word[1];
            return _word;
        } else {
            saved_words.push([word, 1]);
            return [word, 1];
        }
    }

    function remove_word(word) {
        var _word = get_word(word);
        if (!_word)
            return false;
        --_word[1];
        --valid_length;
        if (0 >= _word[1]) {
            var index = saved_words.indexOf(_word);
            saved_words.splice(index, 1);
        }
        save2file(10 * 1000);
        return _word;
    }

    function random_word() {
        var location = Math.floor(Math.random() * valid_length);
        var current_location = 0;
        for (var i = 0, len = saved_words.length; i < len; ++i) {
            current_location += saved_words[i][1];
            if (current_location > location) {
                return saved_words[i][0];
            }
        }
    }
    function random_addition_word() {
        return addition_words[Math.random() * addition_words_length | 0];
    }

    function is_stop_status() {
        return is_stop;
    }

    var is_stop = true;

    function start(delay, weight) {
        !weight && (weight = 0.6);
        if (!is_stop)
            return false;
        !delay && (delay = 1000);
        is_stop = false;

        function _loop() {
            if (is_stop)
                return;
            var word = (Math.random() - weight <= 0 ? random_word() : random_addition_word()).trim();
            add2history(word);
            translator.show_more.deep = 0;
            translator.translate(word, 500, function () {
                setTimeout(_loop, delay);
            });
        }
        _loop();
    }

    function stop() {
        if (true === is_stop) {
            return false;
        }
        is_stop = true;
        pronunciation.clear_queue();
        return true;
    }
    module.exports = {
        init: init,
        get_word: get_word,
        save_word: save_word,
        remove_word: remove_word,
        start: start,
        stop: stop,
        is_stop_status: is_stop_status,
        add2history: add2history,
        get_histories: get_histories,
    }
})();
