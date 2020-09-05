(function () {

    const notice = require('./notice.js');
    const jQuery = require('./js/jquery-3.2.1.js'),
        $ = jQuery;
    const view = require('./view.js');
    const pronunciation = require('./pronunciation');

    function translate(word, pronunciation_delay, callback) {
        !pronunciation_delay && (pronunciation_delay = 500);
        view.reset_view();

        if (!view.update_baidu_result(word)) {
            callback && callback(false);
            return false;
        }

        var result_oxford = view.update_oxford_result(word),
            result_google = view.update_google_result(word);
        if (!result_oxford && !result_google) {
            $('#baidu_result').show();
        }

        pronunciation.clear_queue();

        pronunciation.add2queue(word, 'baidu_American_pronunciation', pronunciation_delay, function () { });
        pronunciation.add2queue(word, 'google_American_pronunciation', pronunciation_delay, function () { });
        pronunciation.add2queue(word, 'cambridge_American_pronunciation', pronunciation_delay, function () { });
        pronunciation.add2queue(word, 'collins_American_pronunciation', pronunciation_delay, function () { callback && callback(true); });
        return true;

    }

    function show_more() {
        view.show_more(++show_more.deep);
    }
    show_more.deep = 0;
    module.exports = {
        translate: translate,
        show_more: show_more,
    }
})();
