(function () {

    const notice = require('./notice.js');
    const jQuery = require('./js/jquery-3.2.1.js'),
        $ = jQuery;
    const view = require('./view.js');
    const pronunciation = require('./pronunciation.js');
    const configuration = require('./configuration.js');

    const history = {
        queue: [],
        location: 0,
    }

    function translate(word, is_add2history, pronunciation_delay, callback) {
        !pronunciation_delay && (pronunciation_delay = 500);
        view.reset_view();

        if (!view.update_baidu_result(word)) {
            callback && callback(false);
            return false;
        }

        false !== is_add2history && add_word2history(word);

        var result_oxford = view.update_oxford_result(word),
            result_google = view.update_google_result(word);
        if (!result_oxford && !result_google) {
            $('#baidu_result').show();
        }
        pronunciation.clear_queue();

        pronunciation.add2queue(word, 'google_American_pronunciation', pronunciation_delay, function () { });
        pronunciation.add2queue(word, 'cambridge_American_pronunciation', pronunciation_delay, function () { });
        pronunciation.add2queue(word, 'collins_American_pronunciation', pronunciation_delay, function () { });
        pronunciation.add2queue(word, 'baidu_American_pronunciation', pronunciation_delay, function () { callback && callback(true); });
        return true;

    }
    function next_word() {
        if (history.location < history.queue.length)
            translate(history.queue[history.location++], false);
        else
            return false;
        return true;
    }
    function previous_word() {
        if (1 < history.location)
            translate(history.queue[(--history.location) - 1], false);
        else
            return false;
        return true;
    }
    function add_word2history(word) {
        if (word === history.queue[history.location - 1])
            return false;
        history.queue = history.queue.slice(0, history.location);
        history.queue.push(word);
        if (history.queue.length > configuration.translate_max_history)
            history.queue.shift();
        history.location = history.queue.length;
        return true;
    }

    function show_more() {
        view.show_more(++show_more.deep);
    }
    show_more.deep = 0;
    module.exports = {
        translate: translate,
        show_more: show_more,
        next_word: next_word,
        previous_word: previous_word,
        add_word2history: add_word2history,
    }
})();
