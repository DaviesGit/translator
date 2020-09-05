(function () {
    const path = require('path');
    const fs = require('fs');
    // const sqlite3 = require(path.join(__dirname, '../node-sqlite3-4.0.2')).verbose();

    var directory_index = 0;
    var data_directory = 'database/translator/merged/merged';
    //    while (fs.existsSync(data_directory = path.join(__dirname, '../database/translator/new_data' + directory_index))) {
    //        ++directory_index;
    //    }
    //    fs.mkdirSync(data_directory);

    configuration = {
        is_init: false,
        baidu_raw_translation_data_path: data_directory + '/baidu_raw_translation.data',
        google_raw_translation_data_path: data_directory + '/google_raw_translation.data',
        baidu_American_pronunciation_data_path: data_directory + '/baidu_American_pronunciation.data',
        google_American_pronunciation_data_path: data_directory + '/google_American_pronunciation.data',
        cambridge_American_pronunciation_data_path: data_directory + '/cambridge_American_pronunciation.data',
        collins_American_pronunciation_data_path: data_directory + '/collins_American_pronunciation.data',
        baidu_British_pronunciation_data_path: data_directory + '/baidu_British_pronunciation.data',
        google_British_pronunciation_data_path: data_directory + '/google_British_pronunciation.data',
        cambridge_British_pronunciation_data_path: data_directory + '/cambridge_British_pronunciation.data',
        collins_British_pronunciation_data_path: data_directory + '/collins_British_pronunciation.data',

        baidu_raw_translation_index_path: data_directory + '/baidu_raw_translation.index',
        google_raw_translation_index_path: data_directory + '/google_raw_translation.index',
        baidu_American_pronunciation_index_path: data_directory + '/baidu_American_pronunciation.index',
        google_American_pronunciation_index_path: data_directory + '/google_American_pronunciation.index',
        cambridge_American_pronunciation_index_path: data_directory + '/cambridge_American_pronunciation.index',
        collins_American_pronunciation_index_path: data_directory + '/collins_American_pronunciation.index',
        baidu_British_pronunciation_index_path: data_directory + '/baidu_British_pronunciation.index',
        google_British_pronunciation_index_path: data_directory + '/google_British_pronunciation.index',
        cambridge_British_pronunciation_index_path: data_directory + '/cambridge_British_pronunciation.index',
        collins_British_pronunciation_index_path: data_directory + '/collins_British_pronunciation.index',
        baidu_raw_translation_data: [],
        google_raw_translation_data: [],
        baidu_American_pronunciation_data: [],
        google_American_pronunciation_data: [],
        cambridge_American_pronunciation_data: [],
        collins_American_pronunciation_data: [],
        baidu_British_pronunciation_data: [],
        google_British_pronunciation_data: [],
        cambridge_British_pronunciation_data: [],
        collins_British_pronunciation_data: [],
        baidu_raw_translation_index: [],
        google_raw_translation_index: [],
        baidu_American_pronunciation_index: [],
        google_American_pronunciation_index: [],
        cambridge_American_pronunciation_index: [],
        collins_American_pronunciation_index: [],
        baidu_British_pronunciation_index: [],
        google_British_pronunciation_index: [],
        cambridge_British_pronunciation_index: [],
        collins_British_pronunciation_index: [],
        property: [
            'baidu_raw_translation',
            'google_raw_translation',
            'baidu_American_pronunciation',
            'google_American_pronunciation',
            'cambridge_American_pronunciation',
            'collins_American_pronunciation',
            'baidu_British_pronunciation',
            'google_British_pronunciation',
            'cambridge_British_pronunciation',
            'collins_British_pronunciation',
        ],
    }



    class Callback_once {
        constructor(times, callback) {
            if ('function' !== typeof callback) {
                callback = function () {};
            }
            var callback_times = times,
                callback_count = 0,
                is_called = false;
            if (!callback_times) {
                callback_times = 1;
            }
            var callback_once = function (param) {
                if (!is_called) {
                    ++callback_count;
                    if (param && param.error) {
                        is_called = true;
                        callback(param);
                    }
                    if (callback_count >= callback_times) {
                        is_called = true;
                        callback(param);
                    }
                }
            }
            callback_once.reset = function (times, _callback) {
                is_called = false;
                callback_count = 0;
                if (0 < times) {
                    callback_times = times;
                }
                if (_callback) {
                    callback = _callback;
                }
            }
            callback_once.set_times = function (times) {
                callback_times = times;
            }
            callback_once.get_times = function () {
                return callback_times;
            }
            callback_once.add_times = function (times) {
                callback_times += times;
            }
            callback_once.get_count = function () {
                return callback_count;
            }
            callback_once.callback = function (param) {
                callback(param);
            }
            callback_once.end_callback = function (param) {
                is_called = true;
                callback(param);
            }

            return callback_once;
        }
    }


    class Wait_all_finish {
        constructor(times, callback) {
            if ('function' !== typeof callback) {
                callback = function () {};
            }
            var wait_times = times,
                wait_count = 0,
                is_called = false;
            if (!wait_times) {
                wait_times = 1;
            }
            var wait_all_finish = function (param) {
                if (!is_called) {
                    ++wait_count;
                    if (param && param.error) {
                        is_called = true;
                        callback(param);
                    }
                    if (wait_count >= wait_times) {
                        is_called = true;
                        callback(param);
                    }
                }
            }
            wait_all_finish.reset = function (times, _callback) {
                is_called = false;
                wait_count = 0;
                if (0 < times) {
                    wait_times = times;
                }
                if (_callback) {
                    callback = _callback;
                }
            }
            wait_all_finish.set_times = function (times) {
                wait_times = times;
            }
            wait_all_finish.get_times = function () {
                return wait_times;
            }
            wait_all_finish.add_times = function (times) {
                wait_times += times;
            }
            wait_all_finish.get_count = function () {
                return wait_count;
            }
            wait_all_finish.callback = function (param) {
                callback(param);
            }
            wait_all_finish.end_callback = function (param) {
                is_called = true;
                callback(param);
            }

            return wait_all_finish;
        }
    }



    function init_database(callback) {
        if (configuration.is_init) {
            return callback ? callback() : void(0);
        }
        configuration.is_init = true;
        var properties = [
            'baidu_raw_translation_data',
            'google_raw_translation_data',
            'baidu_American_pronunciation_data',
            'google_American_pronunciation_data',
            'cambridge_American_pronunciation_data',
            'collins_American_pronunciation_data',
            'baidu_British_pronunciation_data',
            'google_British_pronunciation_data',
            'cambridge_British_pronunciation_data',
            'collins_British_pronunciation_data',
            'baidu_raw_translation_index',
            'google_raw_translation_index',
            'baidu_American_pronunciation_index',
            'google_American_pronunciation_index',
            'cambridge_American_pronunciation_index',
            'collins_American_pronunciation_index',
            'baidu_British_pronunciation_index',
            'google_British_pronunciation_index',
            'cambridge_British_pronunciation_index',
            'collins_British_pronunciation_index',
        ];
        properties.forEach(function (property) {
            configuration[property][0] = fs.openSync(configuration[property + '_path'], 'a+');
            configuration[property][1] = fs.fstatSync(configuration[property][0]).size;
        });
        callback ? callback() : void(0);
    }

    function _storage_baidu_raw_translation_data(word, data) {
        var len = fs.writeSync(configuration.baidu_raw_translation_data[0], data);
        if (data.length !== len) {
            debugger;
        }
        var index = Buffer.from(word + ' ' + configuration.baidu_raw_translation_data[1] + ' ' + len + '\n', 'utf8');
        configuration.baidu_raw_translation_data[1] += len;
        if (index.length !== fs.writeSync(configuration.baidu_raw_translation_index[0], index)) {
            debugger;
        }
    }

    function _storage_baidu_raw_translation_data_flush() {
        fs.fdatasyncSync(configuration.baidu_raw_translation_data[0]);
        fs.fdatasyncSync(configuration.baidu_raw_translation_index[0]);
    }

    function storage_baidu_raw_translation_data(word, data) {
        _storage_baidu_raw_translation_data();
        word, data
        _storage_baidu_raw_translation_data_flush();
    }

    function _storage_google_raw_translation_data(word, data) {
        var len = fs.writeSync(configuration.google_raw_translation_data[0], data);
        if (data.length !== len) {
            debugger;
        }
        var index = Buffer.from(word + ' ' + configuration.google_raw_translation_data[1] + ' ' + len + '\n', 'utf8');
        configuration.google_raw_translation_data[1] += len;
        if (index.length !== fs.writeSync(configuration.google_raw_translation_index[0], index)) {
            debugger;
        }
    }

    function _storage_google_raw_translation_data_flush() {
        fs.fdatasyncSync(configuration.google_raw_translation_data[0]);
        fs.fdatasyncSync(configuration.google_raw_translation_index[0]);
    }

    function storage_google_raw_translation_data(word, data) {
        _storage_google_raw_translation_data(word, data);
        _storage_google_raw_translation_data_flush();
    }

    function _storage_baidu_American_pronunciation_data(word, data) {
        var len = fs.writeSync(configuration.baidu_American_pronunciation_data[0], data);
        if (data.length !== len) {
            debugger;
        }
        var index = Buffer.from(word + ' ' + configuration.baidu_American_pronunciation_data[1] + ' ' + len + '\n', 'utf8');
        configuration.baidu_American_pronunciation_data[1] += len;
        if (index.length !== fs.writeSync(configuration.baidu_American_pronunciation_index[0], index)) {
            debugger;
        }
    }

    function _storage_baidu_American_pronunciation_data_flush() {
        fs.fdatasyncSync(configuration.baidu_American_pronunciation_data[0]);
        fs.fdatasyncSync(configuration.baidu_American_pronunciation_index[0]);
    }

    function storage_baidu_American_pronunciation_data(word, data) {
        _storage_baidu_American_pronunciation_data(word, data);
        _storage_baidu_American_pronunciation_data_flush();
    }

    function _storage_google_American_pronunciation_data(word, data) {
        var len = fs.writeSync(configuration.google_American_pronunciation_data[0], data);
        if (data.length !== len) {
            debugger;
        }
        var index = Buffer.from(word + ' ' + configuration.google_American_pronunciation_data[1] + ' ' + len + '\n', 'utf8');
        configuration.google_American_pronunciation_data[1] += len;
        if (index.length !== fs.writeSync(configuration.google_American_pronunciation_index[0], index)) {
            debugger;
        }
    }

    function _storage_google_American_pronunciation_data_flush() {
        fs.fdatasyncSync(configuration.google_American_pronunciation_data[0]);
        fs.fdatasyncSync(configuration.google_American_pronunciation_index[0]);
    }

    function storage_google_American_pronunciation_data(word, data) {
        _storage_google_American_pronunciation_data(word, data);
        _storage_google_American_pronunciation_data_flush();
    }

    function _storage_cambridge_American_pronunciation_data(word, data) {
        var len = fs.writeSync(configuration.cambridge_American_pronunciation_data[0], data);
        if (data.length !== len) {
            debugger;
        }
        var index = Buffer.from(word + ' ' + configuration.cambridge_American_pronunciation_data[1] + ' ' + len + '\n', 'utf8');
        configuration.cambridge_American_pronunciation_data[1] += len;
        if (index.length !== fs.writeSync(configuration.cambridge_American_pronunciation_index[0], index)) {
            debugger;
        }
    }

    function _storage_cambridge_American_pronunciation_data_flush() {
        fs.fdatasyncSync(configuration.cambridge_American_pronunciation_data[0]);
        fs.fdatasyncSync(configuration.cambridge_American_pronunciation_index[0]);
    }

    function storage_cambridge_American_pronunciation_data(word, data) {
        _storage_cambridge_American_pronunciation_data(word, data);
        _storage_cambridge_American_pronunciation_data_flush();
    }

    function _storage_collins_American_pronunciation_data(word, data) {
        var len = fs.writeSync(configuration.collins_American_pronunciation_data[0], data);
        if (data.length !== len) {
            debugger;
        }
        var index = Buffer.from(word + ' ' + configuration.collins_American_pronunciation_data[1] + ' ' + len + '\n', 'utf8');
        configuration.collins_American_pronunciation_data[1] += len;
        if (index.length !== fs.writeSync(configuration.collins_American_pronunciation_index[0], index)) {
            debugger;
        }

    }

    function _storage_collins_American_pronunciation_data_flush() {
        fs.fdatasyncSync(configuration.collins_American_pronunciation_data[0]);
        fs.fdatasyncSync(configuration.collins_American_pronunciation_index[0]);
    }

    function storage_collins_American_pronunciation_data(word, data) {
        _storage_collins_American_pronunciation_data(word, data);
        _storage_collins_American_pronunciation_data_flush();
    }

    /*  American
        -----------------------------------------------------------------------------------------------------------------------------
        British */

    function _storage_baidu_British_pronunciation_data(word, data) {
        var len = fs.writeSync(configuration.baidu_British_pronunciation_data[0], data);
        if (data.length !== len) {
            debugger;
        }
        var index = Buffer.from(word + ' ' + configuration.baidu_British_pronunciation_data[1] + ' ' + len + '\n', 'utf8');
        configuration.baidu_British_pronunciation_data[1] += len;
        if (index.length !== fs.writeSync(configuration.baidu_British_pronunciation_index[0], index)) {
            debugger;
        }
    }

    function _storage_baidu_British_pronunciation_data_flush() {
        fs.fdatasyncSync(configuration.baidu_British_pronunciation_data[0]);
        fs.fdatasyncSync(configuration.baidu_British_pronunciation_index[0]);
    }

    function storage_baidu_British_pronunciation_data(word, data) {
        _storage_baidu_British_pronunciation_data(word, data);
        _storage_baidu_British_pronunciation_data_flush();
    }

    function _storage_google_British_pronunciation_data(word, data) {
        var len = fs.writeSync(configuration.google_British_pronunciation_data[0], data);
        if (data.length !== len) {
            debugger;
        }
        var index = Buffer.from(word + ' ' + configuration.google_British_pronunciation_data[1] + ' ' + len + '\n', 'utf8');
        configuration.google_British_pronunciation_data[1] += len;
        if (index.length !== fs.writeSync(configuration.google_British_pronunciation_index[0], index)) {
            debugger;
        }
    }

    function _storage_google_British_pronunciation_data_flush() {
        fs.fdatasyncSync(configuration.google_British_pronunciation_data[0]);
        fs.fdatasyncSync(configuration.google_British_pronunciation_index[0]);
    }

    function storage_google_British_pronunciation_data(word, data) {
        _storage_google_British_pronunciation_data(word, data);
        _storage_google_British_pronunciation_data_flush();
    }

    function _storage_cambridge_British_pronunciation_data(word, data) {
        var len = fs.writeSync(configuration.cambridge_British_pronunciation_data[0], data);
        if (data.length !== len) {
            debugger;
        }
        var index = Buffer.from(word + ' ' + configuration.cambridge_British_pronunciation_data[1] + ' ' + len + '\n', 'utf8');
        configuration.cambridge_British_pronunciation_data[1] += len;
        if (index.length !== fs.writeSync(configuration.cambridge_British_pronunciation_index[0], index)) {
            debugger;
        }
    }

    function _storage_cambridge_British_pronunciation_data_flush() {
        fs.fdatasyncSync(configuration.cambridge_British_pronunciation_data[0]);
        fs.fdatasyncSync(configuration.cambridge_British_pronunciation_index[0]);
    }

    function storage_cambridge_British_pronunciation_data(word, data) {
        _storage_cambridge_British_pronunciation_data(word, data);
        _storage_cambridge_British_pronunciation_data_flush();
    }

    function _storage_collins_British_pronunciation_data(word, data) {
        var len = fs.writeSync(configuration.collins_British_pronunciation_data[0], data);
        if (data.length !== len) {
            debugger;
        }
        var index = Buffer.from(word + ' ' + configuration.collins_British_pronunciation_data[1] + ' ' + len + '\n', 'utf8');
        configuration.collins_British_pronunciation_data[1] += len;
        if (index.length !== fs.writeSync(configuration.collins_British_pronunciation_index[0], index)) {
            debugger;
        }

    }

    function _storage_collins_British_pronunciation_data_flush() {
        fs.fdatasyncSync(configuration.collins_British_pronunciation_data[0]);
        fs.fdatasyncSync(configuration.collins_British_pronunciation_index[0]);
    }

    function storage_collins_British_pronunciation_data(word, data) {
        _storage_collins_British_pronunciation_data(word, data);
        _storage_collins_British_pronunciation_data_flush();
    }

    function _storage_baidu_raw_translation_data_close() {
        fs.closeSync(configuration.baidu_raw_translation_data[0]);
        fs.closeSync(configuration.baidu_raw_translation_index[0]);
    }

    function _storage_google_raw_translation_data_close() {
        fs.closeSync(configuration.google_raw_translation_data[0]);
        fs.closeSync(configuration.google_raw_translation_index[0]);
    }

    function _storage_baidu_American_pronunciation_data_close() {
        fs.closeSync(configuration.baidu_American_pronunciation_data[0]);
        fs.closeSync(configuration.baidu_American_pronunciation_index[0]);
    }

    function _storage_google_American_pronunciation_data_close() {
        fs.closeSync(configuration.google_American_pronunciation_data[0]);
        fs.closeSync(configuration.google_American_pronunciation_index[0]);
    }

    function _storage_cambridge_American_pronunciation_data_close() {
        fs.closeSync(configuration.cambridge_American_pronunciation_data[0]);
        fs.closeSync(configuration.cambridge_American_pronunciation_index[0]);
    }

    function _storage_collins_American_pronunciation_data_close() {
        fs.closeSync(configuration.collins_American_pronunciation_data[0]);
        fs.closeSync(configuration.collins_American_pronunciation_index[0]);
    }

    function _storage_baidu_British_pronunciation_data_close() {
        fs.closeSync(configuration.baidu_British_pronunciation_data[0]);
        fs.closeSync(configuration.baidu_British_pronunciation_index[0]);
    }

    function _storage_google_British_pronunciation_data_close() {
        fs.closeSync(configuration.google_British_pronunciation_data[0]);
        fs.closeSync(configuration.google_British_pronunciation_index[0]);
    }

    function _storage_cambridge_British_pronunciation_data_close() {
        fs.closeSync(configuration.cambridge_British_pronunciation_data[0]);
        fs.closeSync(configuration.cambridge_British_pronunciation_index[0]);
    }

    function _storage_collins_British_pronunciation_data_close() {
        fs.closeSync(configuration.collins_British_pronunciation_data[0]);
        fs.closeSync(configuration.collins_British_pronunciation_index[0]);
    }


    module.exports = {
        init_database: init_database,
        storage_baidu_raw_translation_data: storage_baidu_raw_translation_data,
        storage_google_raw_translation_data: storage_google_raw_translation_data,
        storage_baidu_American_pronunciation_data: storage_baidu_American_pronunciation_data,
        storage_google_American_pronunciation_data: storage_google_American_pronunciation_data,
        storage_cambridge_American_pronunciation_data: storage_cambridge_American_pronunciation_data,
        storage_collins_American_pronunciation_data: storage_collins_American_pronunciation_data,
        _storage_baidu_raw_translation_data: _storage_baidu_raw_translation_data,
        _storage_google_raw_translation_data: _storage_google_raw_translation_data,
        _storage_baidu_American_pronunciation_data: _storage_baidu_American_pronunciation_data,
        _storage_google_American_pronunciation_data: _storage_google_American_pronunciation_data,
        _storage_cambridge_American_pronunciation_data: _storage_cambridge_American_pronunciation_data,
        _storage_collins_American_pronunciation_data: _storage_collins_American_pronunciation_data,
        _storage_baidu_raw_translation_data_flush: _storage_baidu_raw_translation_data_flush,
        _storage_google_raw_translation_data_flush: _storage_google_raw_translation_data_flush,
        _storage_baidu_American_pronunciation_data_flush: _storage_baidu_American_pronunciation_data_flush,
        _storage_google_American_pronunciation_data_flush: _storage_google_American_pronunciation_data_flush,
        _storage_cambridge_American_pronunciation_data_flush: _storage_cambridge_American_pronunciation_data_flush,
        _storage_collins_American_pronunciation_data_flush: _storage_collins_American_pronunciation_data_flush,
        _storage_baidu_raw_translation_data_close: _storage_baidu_raw_translation_data_close,
        _storage_google_raw_translation_data_close: _storage_google_raw_translation_data_close,
        _storage_baidu_American_pronunciation_data_close: _storage_baidu_American_pronunciation_data_close,
        _storage_google_American_pronunciation_data_close: _storage_google_American_pronunciation_data_close,
        _storage_cambridge_American_pronunciation_data_close: _storage_cambridge_American_pronunciation_data_close,
        _storage_collins_American_pronunciation_data_close: _storage_collins_American_pronunciation_data_close,

        storage_baidu_British_pronunciation_data: storage_baidu_British_pronunciation_data,
        storage_google_British_pronunciation_data: storage_google_British_pronunciation_data,
        storage_cambridge_British_pronunciation_data: storage_cambridge_British_pronunciation_data,
        storage_collins_British_pronunciation_data: storage_collins_British_pronunciation_data,
        _storage_baidu_British_pronunciation_data: _storage_baidu_British_pronunciation_data,
        _storage_google_British_pronunciation_data: _storage_google_British_pronunciation_data,
        _storage_cambridge_British_pronunciation_data: _storage_cambridge_British_pronunciation_data,
        _storage_collins_British_pronunciation_data: _storage_collins_British_pronunciation_data,
        _storage_baidu_British_pronunciation_data_flush: _storage_baidu_British_pronunciation_data_flush,
        _storage_google_British_pronunciation_data_flush: _storage_google_British_pronunciation_data_flush,
        _storage_cambridge_British_pronunciation_data_flush: _storage_cambridge_British_pronunciation_data_flush,
        _storage_collins_British_pronunciation_data_flush: _storage_collins_British_pronunciation_data_flush,
        _storage_baidu_British_pronunciation_data_close: _storage_baidu_British_pronunciation_data_close,
        _storage_google_British_pronunciation_data_close: _storage_google_British_pronunciation_data_close,
        _storage_cambridge_British_pronunciation_data_close: _storage_cambridge_British_pronunciation_data_close,
        _storage_collins_British_pronunciation_data_close: _storage_collins_British_pronunciation_data_close,


    }
})();
