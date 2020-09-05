(function () {
    const path = require('path');
    const fs = require('fs');
    // const sqlite3 = require(path.join(__dirname, '../node-sqlite3-4.0.2')).verbose();

    configuration = {
        is_init: false,
        files: {},
        properties: [
            'baidu_raw_translation',
            'google_raw_translation',
            // 'baidu_American_pronunciation',
            // 'google_American_pronunciation',
            // 'cambridge_American_pronunciation',
            // 'collins_American_pronunciation',
            // 'baidu_British_pronunciation',
            // 'google_British_pronunciation',
            // 'cambridge_British_pronunciation',
            // 'collins_British_pronunciation',
        ],
    }

    function init(callback) {
        configuration.is_init = true;
        configuration.properties.forEach(function (property) {
            configuration.files[property + '_index'] = JSON.parse(fs.readFileSync(path.join(__dirname, '../database/translator/new_data_index/' + property + '.json'), { encoding: 'utf8' }));
            configuration.files[property + '_data'] = fs.openSync(path.join(__dirname, '../database/translator/new_data/' + property + '.data'), 'r');
        });
        return true;
    }

    function _get_data(file, word) {
        var location = configuration.files[file + '_index'][word];
        if (!location)
            return false;
        var offset = location[0],
            length = location[1];
        var buffer = new Buffer(length);
        if (length !== fs.readSync(configuration.files[file + '_data'], buffer, 0, length, offset))
            return false;
        return buffer;
    }
    function get_baidu_raw_translation(word) {
        var buffer = _get_data('baidu_raw_translation', word);
        return buffer ? JSON.parse(buffer) : buffer;
    }
    function get_google_raw_translation(word) {
        var buffer = _get_data('google_raw_translation', word);
        return buffer ? JSON.parse(buffer) : buffer;
    }
    // -----------------------------------------------------------------------------------------
    function get_baidu_American_pronunciation(word) {
        var buffer = _get_data('baidu_American_pronunciation', word);
        return buffer;
    }
    function get_google_American_pronunciation(word) {
        var buffer = _get_data('google_American_pronunciation', word);
        return buffer;
    }
    function get_cambridge_American_pronunciation(word) {
        var buffer = _get_data('cambridge_American_pronunciation', word);
        return buffer;
    }
    function get_collins_American_pronunciation(word) {
        var buffer = _get_data('collins_American_pronunciation', word);
        return buffer;
    }
    function get_baidu_British_pronunciation(word) {
        var buffer = _get_data('baidu_British_pronunciation', word);
        return buffer;
    }
    function get_google_British_pronunciation(word) {
        var buffer = _get_data('google_British_pronunciation', word);
        return buffer;
    }
    function get_cambridge_British_pronunciation(word) {
        var buffer = _get_data('cambridge_British_pronunciation', word);
        return buffer;
    }
    function get_collins_British_pronunciation(word) {
        var buffer = _get_data('collins_British_pronunciation', word);
        return buffer;
    }



    module.exports = {
        init: init,

        get_baidu_raw_translation: get_baidu_raw_translation,
        get_google_raw_translation: get_google_raw_translation,
        get_baidu_American_pronunciation: get_baidu_American_pronunciation,
        get_google_American_pronunciation: get_google_American_pronunciation,
        get_cambridge_American_pronunciation: get_cambridge_American_pronunciation,
        get_collins_American_pronunciation: get_collins_American_pronunciation,
        get_baidu_British_pronunciation: get_baidu_British_pronunciation,
        get_google_British_pronunciation: get_google_British_pronunciation,
        get_cambridge_British_pronunciation: get_cambridge_British_pronunciation,
        get_collins_British_pronunciation: get_collins_British_pronunciation,
    }
})();