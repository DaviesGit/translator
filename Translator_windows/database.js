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
            'baidu_American_pronunciation',
            'google_American_pronunciation',
            'cambridge_American_pronunciation',
            'collins_American_pronunciation',
            // 'baidu_British_pronunciation',
            // 'google_British_pronunciation',
            // 'cambridge_British_pronunciation',
            // 'collins_British_pronunciation',
        ],
        range: 128,
        minimal_word_range: 5,
    }

    function init(callback) {
        configuration.is_init = true;
        configuration.properties.forEach(function (property) {
            //            configuration.files[property + '_index'] = JSON.parse(fs.readFileSync(path.join(__dirname, '../database/data_index/' + property + '.json'), {
            //                encoding: 'utf8'
            //            }));
            configuration.files[property + '_index'] = [];
            configuration.files[property + '_index'][0] = fs.openSync(path.join(__dirname, '../database/data/' + property + '_sorted.index'), 'r');
            configuration.files[property + '_index'][1] = fs.fstatSync(configuration.files[property + '_index'][0]).size;
            configuration.files[property + '_data'] = fs.openSync(path.join(__dirname, '../database/data/' + property + '.data'), 'r');
        });
        return true;
    }

    function wordString2Array(word) {
        var word_text, word_offset, word_length, temp_location;
        temp_location = word.length;
        word_offset = word_length = word.lastIndexOf(' ', temp_location - 1);
        word_length = +word.substring(word_length + 1, temp_location);
        temp_location = word_offset;
        word_text = word_offset = word.lastIndexOf(' ', temp_location - 1);
        word_offset = +word.substring(word_offset + 1, temp_location);
        temp_location = word_text;
        word_text = word.substring(0, temp_location);
        return [word_text, word_offset, word_length];
    }

    function read_location_word(file, location, range) {
        file_description = configuration.files[file + '_index'][0];
        !range && (range = configuration.range);
        var range_begain = Math.floor(range / 2);
        var range_end = range - range_begain;
        var read_begain = location - range_begain;
        if (0 > read_begain) {
            range_begain += read_begain;
            read_begain = 0;
        }
        var read_end = location + range_end;
        if (read_end > configuration.files[file + '_index'][1]) {
            read_end = configuration.files[file + '_index'][1];
        }
        var buffer = new Buffer(read_end - read_begain);
        if ((read_end - read_begain) !== fs.readSync(file_description, buffer, 0, read_end - read_begain, read_begain)) {
            return null;
        }
        buffer = String(buffer);

        range_begain >= buffer.length && (range_begain = buffer.length - 1);
        var word_begain = buffer.lastIndexOf('\n', range_begain);
        if (-1 === word_begain && 0 !== read_begain)
            return read_location_word(file, location, 2 * range);
        ++word_begain;
        var word_end = buffer.indexOf('\n', word_begain + 1);
        if (-1 === word_begain)
            return read_location_word(file, location, 2 * range);
        var word = buffer.slice(word_begain, word_end);
        return wordString2Array(word);
    }

    // return buffer0>buffer1;
    function is_greater(buffer0, buffer1) {
        var len = Math.max(buffer0.length, buffer1.length)
        for (var i = 0; i < len; ++i) {
            if (undefined !== buffer0[i]) {
                if (undefined === buffer1[i])
                    return true;
                if (buffer0[i] === buffer1[i])
                    continue;
                return buffer0[i] > buffer1[i];
            } else {
                return false;
            }
        }
        return false;
    }

    function _get_data(file, word, location, range) {
        !location && (location = Math.floor(configuration.files[file + '_index'][1] / 2));
        !range && (range = configuration.files[file + '_index'][1]);
        if (configuration.minimal_word_range > range)
            return false;
        var word_buffer = Buffer.from(word);
        var current_word = read_location_word(file, location);
        var current_word_buffer = Buffer.from(current_word[0]);
        if (!word_buffer.equals(current_word_buffer)) {
            range = Math.ceil(range / 2);
            if (is_greater(word_buffer, current_word_buffer))
                location += Math.floor(range / 2);
            else
                location -= Math.floor(range / 2);
            return _get_data(file, word, location, range);
        }
        var offset = current_word[1],
            length = current_word[2];
        var buffer = new Buffer(length);
        if (length !== fs.readSync(configuration.files[file + '_data'], buffer, 0, length, offset))
            return false;
        return buffer;

        //        var location = configuration.files[file + '_index'][word];
        //        if (!location)
        //            return false;
        //        var offset = location[0],
        //            length = location[1];
        //        var buffer = new Buffer(length);
        //        if (length !== fs.readSync(configuration.files[file + '_data'], buffer, 0, length, offset))
        //            return false;
        //        return buffer;
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
