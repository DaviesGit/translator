(function (global) {
    const path = require('path');
    // const sqlite3 = require(path.join(__dirname, '../node-sqlite3-4.0.2')).verbose();
    // const en_full_db = path.join(__dirname, '../en_full.db');
    // const word_index_file = path.join(__dirname, '../Translator4.55.12/word_index.txt');

    const fs = require('fs');
    let word_index;
    const database = require('./database.js');
    const translator = require('./translate_library.js');

    const configuration = {
        translate_interval: 5 * 1000,
        demons: {
            baidu_raw_translation_demon: {
                loop_delay: 10 * 1000,
                bunch_delay: 0,
                bunch_number: 10,
            },
            google_raw_translation_demon: {
                loop_delay: 10 * 1000,
                bunch_delay: 0,
                bunch_number: 10,
            },
            baidu_American_pronunciation_demon: {
                loop_delay: 10 * 1000,
                bunch_delay: 0,
                bunch_number: 10,
            },
            google_American_pronunciation_demon: {
                loop_delay: 10 * 1000,
                bunch_delay: 0,
                bunch_number: 10,
            },
            cambridge_American_pronunciation_demon: {
                loop_delay: 10 * 1000,
                bunch_delay: 0,
                bunch_number: 10,
            },
            collins_American_pronunciation_demon: {
                loop_delay: 10 * 1000,
                bunch_delay: 0,
                bunch_number: 10,
            },
            baidu_British_pronunciation_demon: {
                loop_delay: 10 * 1000,
                bunch_delay: 0,
                bunch_number: 10,
            },
            google_British_pronunciation_demon: {
                loop_delay: 10 * 1000,
                bunch_delay: 0,
                bunch_number: 10,
            },
            cambridge_British_pronunciation_demon: {
                loop_delay: 10 * 1000,
                bunch_delay: 0,
                bunch_number: 10,
            },
            collins_British_pronunciation_demon: {
                loop_delay: 10 * 1000,
                bunch_delay: 0,
                bunch_number: 10,
            },
        },
        stop: {
            callback: null,
            wait2stop: null,
            is_stopped: false,
            has_finished: 0,
        },
        en_full_log_path: path.join(__dirname, '../translator_configuration/en_full_log.json'),
        location_path: path.join(__dirname, '../translator_configuration/location.json'),
        storage_log_interval: 5 * 60 * 1000,
        storage_log_interval_hand: null,
        count: 0,
    }

    function toStorageString(log) {
        var string = '';
        for (var i = 0, len = log.length, temp; i < len; ++i) {
            string += log[i].join('') + '\n';
        }
        return string;
    }

    function toArray(string) {
        var array = string.split('\n');
        array.pop();
        for (var i = 0, len = array.length; i < len; ++i) {
            array[i] = ((temp = array[i].slice(-30).split('').map(x => +x)).unshift(array[i].slice(0, -30)), temp);
        }
        return array;
    }
    const en_full_log = toArray(fs.readFileSync(configuration.en_full_log_path, {
        encoding: 'utf8'
    }));
    const en_full_log_length = en_full_log.length;
    const location = JSON.parse(fs.readFileSync(configuration.location_path, {
        encoding: 'utf8'
    }));

    //backup
    fs.copyFileSync(configuration.en_full_log_path, path.join(path.join(configuration.en_full_log_path, '../'), 'backup', path.basename(configuration.en_full_log_path)));
    fs.copyFileSync(configuration.location_path, path.join(path.join(configuration.location_path, '../'), 'backup', path.basename(configuration.location_path)));

    // location = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    // location = {
    //     baidu_raw_translation: 0,
    //     google_raw_translation: 0,
    //     baidu_American_pronunciation: 0,
    //     baidu_British_pronunciation: 0,
    //     google_American_pronunciation: 0,
    //     google_British_pronunciation: 0,
    //     cambridge_American_pronunciation: 0,
    //     cambridge_British_pronunciation: 0,
    //     collins_American_pronunciation: 0,
    //     collins_British_pronunciation: 0,

    // }
    // s= ['word',
    //     'is_baidu_translate_ok',
    //     'is_baidu_translate_try',
    //     'baidu_translate_try_times',
    //     'is_google_translate_ok',
    //     'is_google_translate_try',
    //     'google_translate_try_times',
    //     'is_baidu_American_pronunciation_ok',
    //     'is_baidu_American_pronunciation_try',
    //     'baidu_American_pronunciation_try_times',
    //     'is_baidu_British_pronunciation_ok',
    //     'is_baidu_British_pronunciation_try',
    //     'baidu_British_pronunciation_try_times',
    //     'is_google_American_pronunciation_ok',
    //     'is_google_American_pronunciation_try',
    //     'google_American_pronunciation_try_times',
    //     'is_google_British_pronunciation_ok',
    //     'is_google_British_pronunciation_try',
    //     'google_British_pronunciation_try_times',
    //     'is_cambridge_American_pronunciation_ok',
    //     'is_cambridge_American_pronunciation_try',
    //     'cambridge_American_pronunciation_try_times',
    //     'is_cambridge_British_pronunciation_ok',
    //     'is_cambridge_British_pronunciation_try',
    //     'cambridge_British_pronunciation_try_times',
    //     'is_collins_American_pronunciation_ok',
    //     'is_collins_American_pronunciation_try',
    //     'collins_American_pronunciation_try_times',
    //     'is_collins_British_pronunciation_ok',
    //     'is_collins_British_pronunciation_try',
    //     'collins_British_pronunciation_try_times'],


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


    function storage_log() {
        fs.writeFileSync(configuration.en_full_log_path, toStorageString(en_full_log));
        fs.writeFileSync(configuration.location_path, JSON.stringify(location));
    }

    function get_next_word2pronunciation(index1, index2) {
        if (en_full_log_length <= location[index1] || en_full_log_length <= location[index1])
            return false;

        while (en_full_log[location[index1]][index1 * 3 + 1] && en_full_log[location[index2]][index2 * 3 + 1] ||
            (!en_full_log[location[index1]][index1 * 3 + 2] && !en_full_log[location[index2]][index2 * 3 + 2])) {
            ++location[index1];
            ++location[index2];
            if (en_full_log_length <= location[index1] || en_full_log_length <= location[index1])
                return false;
        }
        var word = en_full_log[location[index1]][0];
        ++en_full_log[location[index1]][index1 * 3 + 3];
        ++en_full_log[location[index2]][index2 * 3 + 3];
        ++location[index1];
        ++location[index2];
        return word;
    }

    function bunch_get_next_word2pronunciation(index1, index2, bunch) {
        var result = [];
        for (var i = 0; i < bunch; ++i) {
            var word = get_next_word2pronunciation(index1, index2);
            word && result.push(word);
        }
        return result;
    }

    function get_next_word2translate(index) {
        if (en_full_log_length <= location[index])
            return false;
        while (en_full_log[location[index]][index * 3 + 1] || !en_full_log[location[index]][index * 3 + 2]) {
            ++location[index];
            if (en_full_log_length <= location[index])
                return false;
        }
        var word = en_full_log[location[index]][0];
        ++en_full_log[location[index]][index * 3 + 3];
        ++location[index];
        return word;
    }

    function bunch_get_next_word2translate(index, bunch) {
        var result = [];
        for (var i = 0; i < bunch; ++i) {
            var word = get_next_word2translate(index);
            word && result.push(word);
        }
        return result;
    }

    function get_word_status(word) {
        for (var i = 0, len = en_full_log.length; i < len; ++i) {
            if (word === en_full_log[i][0]) {
                return en_full_log[i];
            }
        }
    }

    function update_word_status(word, is_ok, is_try, try_time) {
        var status = get_word_status(word);
        if (is_ok) {
            'number' === typeof is_ok[0] ? status[0 * 3 + 1] = is_ok[0] : void(0);
            'number' === typeof is_ok[1] ? status[1 * 3 + 1] = is_ok[1] : void(0);
            'number' === typeof is_ok[2] ? status[2 * 3 + 1] = is_ok[2] : void(0);
            'number' === typeof is_ok[3] ? status[3 * 3 + 1] = is_ok[3] : void(0);
            'number' === typeof is_ok[4] ? status[4 * 3 + 1] = is_ok[4] : void(0);
            'number' === typeof is_ok[5] ? status[5 * 3 + 1] = is_ok[5] : void(0);
            'number' === typeof is_ok[6] ? status[6 * 3 + 1] = is_ok[6] : void(0);
            'number' === typeof is_ok[7] ? status[7 * 3 + 1] = is_ok[7] : void(0);
            'number' === typeof is_ok[8] ? status[8 * 3 + 1] = is_ok[8] : void(0);
            'number' === typeof is_ok[9] ? status[9 * 3 + 1] = is_ok[9] : void(0);
        }
        if (is_try) {
            'number' === typeof is_try[0] ? status[0 * 3 + 2] = is_try[0] : void(0);
            'number' === typeof is_try[1] ? status[1 * 3 + 2] = is_try[1] : void(0);
            'number' === typeof is_try[2] ? status[2 * 3 + 2] = is_try[2] : void(0);
            'number' === typeof is_try[3] ? status[3 * 3 + 2] = is_try[3] : void(0);
            'number' === typeof is_try[4] ? status[4 * 3 + 2] = is_try[4] : void(0);
            'number' === typeof is_try[5] ? status[5 * 3 + 2] = is_try[5] : void(0);
            'number' === typeof is_try[6] ? status[6 * 3 + 2] = is_try[6] : void(0);
            'number' === typeof is_try[7] ? status[7 * 3 + 2] = is_try[7] : void(0);
            'number' === typeof is_try[8] ? status[8 * 3 + 2] = is_try[8] : void(0);
            'number' === typeof is_try[9] ? status[9 * 3 + 2] = is_try[9] : void(0);
        }
        if (try_time) {
            'number' === typeof try_time[0] ? status[0 * 3 + 3] = try_time[0] : void(0);
            'number' === typeof try_time[1] ? status[1 * 3 + 3] = try_time[1] : void(0);
            'number' === typeof try_time[2] ? status[2 * 3 + 3] = try_time[2] : void(0);
            'number' === typeof try_time[3] ? status[3 * 3 + 3] = try_time[3] : void(0);
            'number' === typeof try_time[4] ? status[4 * 3 + 3] = try_time[4] : void(0);
            'number' === typeof try_time[5] ? status[5 * 3 + 3] = try_time[5] : void(0);
            'number' === typeof try_time[6] ? status[6 * 3 + 3] = try_time[6] : void(0);
            'number' === typeof try_time[7] ? status[7 * 3 + 3] = try_time[7] : void(0);
            'number' === typeof try_time[8] ? status[8 * 3 + 3] = try_time[8] : void(0);
            'number' === typeof try_time[9] ? status[9 * 3 + 3] = try_time[9] : void(0);
        }
    }


    function start_baidu_raw_translation_demon(callback) {
        function _loop() {
            var words = bunch_get_next_word2translate(0, configuration.demons.baidu_raw_translation_demon.bunch_number);
            if (!words.length) {
                console.log('baidu_raw_translation_demon has finished!');
                callback({
                    type: 'notice',
                    message: 'baidu_raw_translation_demon has finished!',
                });
                ++configuration.stop.has_finished;
                return;
            }
            var wait_all_finish = new Wait_all_finish(words.length, function () {
                database._storage_baidu_raw_translation_data_flush();
                if (configuration.stop.is_stopped) {
                    console.log('baidu_raw_translation_demon has exited!');
                    return configuration.stop.wait2stop();
                }
                setTimeout(_loop, configuration.demons.baidu_raw_translation_demon.loop_delay);
            });
            words.forEach(function (word) {
                translator.get_baidu_translate(word, function (response) {
                    if (!response) {
                        callback({
                            type: 'notice',
                            message: 'get_baidu_translate failed!'
                        });
                        wait_all_finish();
                        return;
                    } else {
                        if ('object' !== typeof response) {
                            callback({
                                type: 'notice',
                                message: 'get_baidu_translate failed! return message error!'
                            });
                            wait_all_finish();
                            return;
                        }
                        var buffer = Buffer.from(JSON.stringify(response), 'utf8');
                        database._storage_baidu_raw_translation_data(word, buffer);
                        var is_ok = [];
                        is_ok[0] = 1;
                        update_word_status(word, is_ok);
                        ++configuration.count;
                        $('#count').text('baidu_raw_translation, ' + configuration.count);
                        wait_all_finish();
                    }
                });
            });
        }
        _loop();
    }

    function start_google_raw_translation_demon(callback) {
        function _loop() {
            var words = bunch_get_next_word2translate(1, configuration.demons.google_raw_translation_demon.bunch_number);
            if (!words.length) {
                console.log('google_raw_translation_demon has finished!');
                callback({
                    type: 'notice',
                    message: 'google_raw_translation_demon has finished!',
                });
                ++configuration.stop.has_finished;
                return;
            }
            var wait_all_finish = new Wait_all_finish(words.length, function () {
                database._storage_google_raw_translation_data_flush();
                if (configuration.stop.is_stopped) {
                    console.log('google_raw_translation_demon has exited!');
                    return configuration.stop.wait2stop();
                }
                setTimeout(_loop, configuration.demons.google_raw_translation_demon.loop_delay);
            });
            words.forEach(function (word) {
                translator.get_google_translate(word, function (response) {
                    if (!response) {
                        callback({
                            type: 'notice',
                            message: 'get_google_translate failed!'
                        });
                        wait_all_finish();
                        return;
                    } else {
                        if ('object' !== typeof response) {
                            callback({
                                type: 'notice',
                                message: 'get_google_translate failed! return message error!'
                            });
                            wait_all_finish();
                            return;
                        }
                        var buffer = Buffer.from(JSON.stringify(response), 'utf8');
                        database._storage_google_raw_translation_data(word, buffer);
                        var is_ok = [];
                        is_ok[1] = 1;
                        update_word_status(word, is_ok);
                        ++configuration.count;
                        $('#count').text('google_raw_translation, ' + configuration.count);
                        wait_all_finish();
                    }
                });
            });
        }
        _loop();
    }

    function start_baidu_pronunciation_demon(callback) {
        function _loop() {
            var words = bunch_get_next_word2pronunciation(2, 3, configuration.demons.baidu_American_pronunciation_demon.bunch_number);
            if (!words.length) {
                console.log('baidu_pronunciation_demon has finished!');
                callback({
                    type: 'notice',
                    message: 'baidu_pronunciation_demon has finished!',
                });
                ++configuration.stop.has_finished;
                return;
            }
            var wait_all_finish = new Wait_all_finish(words.length, function () {
                database._storage_baidu_American_pronunciation_data_flush();
                database._storage_baidu_British_pronunciation_data_flush();
                if (configuration.stop.is_stopped) {
                    console.log('baidu_pronunciation_demon has exited!');
                    return configuration.stop.wait2stop();
                }
                setTimeout(_loop, configuration.demons.baidu_American_pronunciation_demon.loop_delay);
            });
            words.forEach(function (word) {
                translator.get_baidu_pronunciation(word, function (response) {
                    var is_ok = [];
                    if (response.buffer.American && 0xff === response.buffer.American[0]) {
                        database._storage_baidu_American_pronunciation_data(word, response.buffer.American);
                        is_ok[2] = 1;
                    }
                    if (response.buffer.British && 0xff === response.buffer.British[0]) {
                        database._storage_baidu_British_pronunciation_data(word, response.buffer.British);
                        is_ok[3] = 1;
                    }
                    update_word_status(word, is_ok);
                    ++configuration.count;
                    $('#count').text('baidu_pronunciation, ' + configuration.count);
                    wait_all_finish();
                });
            });
        }
        _loop();
    }

    function start_google_pronunciation_demon(callback) {
        function _loop() {
            var words = bunch_get_next_word2pronunciation(4, 5, configuration.demons.google_American_pronunciation_demon.bunch_number);
            if (!words.length) {
                console.log('google_pronunciation_demon has finished!');
                callback({
                    type: 'notice',
                    message: 'google_pronunciation_demon has finished!',
                });
                ++configuration.stop.has_finished;
                return;
            }
            var wait_all_finish = new Wait_all_finish(words.length, function () {
                database._storage_google_American_pronunciation_data_flush();
                database._storage_google_British_pronunciation_data_flush();
                if (configuration.stop.is_stopped) {
                    console.log('google_pronunciation_demon has exited!');
                    return configuration.stop.wait2stop();
                }
                setTimeout(_loop, configuration.demons.google_American_pronunciation_demon.loop_delay);
            });
            words.forEach(function (word) {
                translator.get_google_pronunciation(word, function (response) {
                    var is_ok = [];
                    if (response.buffer.American && 0xff === response.buffer.American[0]) {
                        database._storage_google_American_pronunciation_data(word, response.buffer.American);
                        is_ok[4] = 1;
                    }
                    if (response.buffer.British && 0xff === response.buffer.British[0]) {
                        database._storage_google_British_pronunciation_data(word, response.buffer.British);
                        is_ok[5] = 1;
                    }
                    update_word_status(word, is_ok);
                    ++configuration.count;
                    $('#count').text('google_pronunciation, ' + configuration.count);
                    wait_all_finish();
                });
            });
        }
        _loop();
    }

    function start_cambridge_pronunciation_demon(callback) {
        function _loop() {
            var words = bunch_get_next_word2pronunciation(6, 7, configuration.demons.cambridge_American_pronunciation_demon.bunch_number);
            if (!words.length) {
                console.log('cambridge_pronunciation_demon has finished!');
                callback({
                    type: 'notice',
                    message: 'cambridge_pronunciation_demon has finished!',
                });
                ++configuration.stop.has_finished;
                return;
            }
            var wait_all_finish = new Wait_all_finish(words.length, function () {
                database._storage_cambridge_American_pronunciation_data_flush();
                database._storage_cambridge_British_pronunciation_data_flush();
                if (configuration.stop.is_stopped) {
                    console.log('cambridge_pronunciation_demon has exited!');
                    return configuration.stop.wait2stop();
                }
                setTimeout(_loop, configuration.demons.cambridge_American_pronunciation_demon.loop_delay);
            });
            words.forEach(function (word) {
                translator.get_cambridge_pronunciation(word, function (response) {
                    var is_ok = [];
                    var is_try = [];
                    if (response.buffer.American && 0x49 === response.buffer.American[0]) {
                        database._storage_cambridge_American_pronunciation_data(word, response.buffer.American);
                        is_ok[6] = 1;
                    } else {
                        if (response.error.American && -1 !== response.error.American.indexOf('cannot find ')) {
                            is_try[6] = 0;
                        }
                    }
                    if (response.buffer.British && 0x49 === response.buffer.British[0]) {
                        database._storage_cambridge_British_pronunciation_data(word, response.buffer.British);
                        is_ok[7] = 1;
                    } else {
                        if (response.error.British && -1 !== response.error.British.indexOf('cannot find ')) {
                            is_try[7] = 0;
                        }
                    }
                    update_word_status(word, is_ok, is_try);
                    ++configuration.count;
                    $('#count').text('cambridge_pronunciation, ' + configuration.count);
                    wait_all_finish();
                });
            });
        }
        _loop();
    }

    function start_collins_pronunciation_demon(callback) {
        function _loop() {
            var words = bunch_get_next_word2pronunciation(8, 9, configuration.demons.collins_American_pronunciation_demon.bunch_number);
            if (!words.length) {
                console.log('collins_pronunciation_demon has finished!');
                callback({
                    type: 'notice',
                    message: 'collins_pronunciation_demon has finished!',
                });
                ++configuration.stop.has_finished;
                return;
            }
            var wait_all_finish = new Wait_all_finish(words.length, function () {
                database._storage_collins_American_pronunciation_data_flush();
                database._storage_collins_British_pronunciation_data_flush();
                if (configuration.stop.is_stopped) {
                    console.log('collins_pronunciation_demon has exited!');
                    return configuration.stop.wait2stop();
                }
                setTimeout(_loop, configuration.demons.collins_American_pronunciation_demon.loop_delay);
            });
            words.forEach(function (word) {
                translator.get_collins_pronunciation(word, function (response) {
                    var is_ok = [];
                    var is_try = [];
                    if (response.buffer.American && 0xff === response.buffer.American[0]) {
                        database._storage_collins_American_pronunciation_data(word, response.buffer.American);
                        is_ok[8] = 1;
                    } else if (response.buffer.default && 0xff === response.buffer.default[0]) {
                        database._storage_collins_American_pronunciation_data(word, response.buffer.default);
                        is_ok[8] = 1;
                    } else {
                        if (response.error.American && -1 !== response.error.American.indexOf('cannot find ')) {
                            is_try[8] = 0;
                        }
                    }
                    if (response.buffer.British && 0xff === response.buffer.British[0]) {
                        database._storage_collins_British_pronunciation_data(word, response.buffer.British);
                        is_ok[9] = 1;
                    } else if (response.buffer.default && 0xff === response.buffer.default[0]) {
                        database._storage_collins_British_pronunciation_data(word, response.buffer.default);
                        is_ok[9] = 1;
                    } else {
                        if (response.error.British && -1 !== response.error.British.indexOf('cannot find ')) {
                            is_try[9] = 0;
                        }
                    }
                    update_word_status(word, is_ok, is_try);
                    ++configuration.count;
                    $('#count').text('collins_pronunciation, ' + configuration.count);
                    wait_all_finish();
                });
            });
        }
        _loop();
    }


    function init(callback) {
        translator.init(function (error) {
            if (error) {
                callback(error);
            } else {
                database.init_database(callback);
            }
        });
    }

    function start_demons(callback) {

        start_baidu_raw_translation_demon(callback);
        start_google_raw_translation_demon(callback);
        start_baidu_pronunciation_demon(callback);
        start_google_pronunciation_demon(callback);
        start_cambridge_pronunciation_demon(callback);
        start_collins_pronunciation_demon(callback);
        configuration.storage_log_interval_hand = setInterval(storage_log, configuration.storage_log_interval);

    }

    function stop_demons(callback) {
        configuration.stop.is_stopped = true;
        clearInterval(configuration.storage_log_interval_hand);
        configuration.stop.wait2stop = new Wait_all_finish(6 - configuration.stop.has_finished, function () {
            storage_log();
            callback();
        });
    }

    module.exports = {
        init: init,
        start_demons: start_demons,
        stop_demons: stop_demons,
        storage_log: storage_log,
        start_baidu_raw_translation_demon: start_baidu_raw_translation_demon,
        start_google_raw_translation_demon: start_google_raw_translation_demon,
        start_baidu_pronunciation_demon: start_baidu_pronunciation_demon,
        start_google_pronunciation_demon: start_google_pronunciation_demon,
        start_cambridge_pronunciation_demon: start_cambridge_pronunciation_demon,
        start_collins_pronunciation_demon: start_collins_pronunciation_demon,
    };
})(global);
