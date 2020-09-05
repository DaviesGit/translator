(function (global) {

    const path = require('path');
    const database = require('../database.js');
    const fs = require('fs');
    const sqlite3 = require(path.join(__dirname, '../../node-sqlite3-4.0.2')).verbose();

    const configuration = {
        en_full_log: path.join(__dirname, '../../database/translator_merged/en_full_log.db'),
        en_full_log_db: null,

        en_full: path.join(__dirname, '../../en_full.db'),
        en_full_db: null,


        raw_translation: [
            path.join(__dirname, '../../database/translator/old_data/old1/raw_translation_database.db'),
            path.join(__dirname, '../../database/translator/old_data/old2/raw_translation_database.db'),
            path.join(__dirname, '../../database/translator/old_data/old3/raw_translation_database.db'),
            path.join(__dirname, '../../database/translator/old_data/old4/raw_translation_database.db'),
            path.join(__dirname, '../../database/translator/old_data/old5/raw_translation_database.db'),
            path.join(__dirname, '../../database/translator/old_data/old6/raw_translation_database.db'),
            path.join(__dirname, '../../database/translator/old_data/old7/raw_translation_database.db'),
            path.join(__dirname, '../../database/translator/old_data/old8/raw_translation_database.db'),
            path.join(__dirname, '../../database/translator/old_data/old_big1/raw_translation_database.db'),
            path.join(__dirname, '../../database/translator/old_data/old_big2/raw_translation_database.db'),
        ],
        pronunciation: [
            path.join(__dirname, '../../database/translator/old_data/old1/pronunciation_database.db'),
            path.join(__dirname, '../../database/translator/old_data/old2/pronunciation_database.db'),
            path.join(__dirname, '../../database/translator/old_data/old3/pronunciation_database.db'),
            path.join(__dirname, '../../database/translator/old_data/old4/pronunciation_database.db'),
            path.join(__dirname, '../../database/translator/old_data/old5/pronunciation_database.db'),
            path.join(__dirname, '../../database/translator/old_data/old6/pronunciation_database.db'),
            path.join(__dirname, '../../database/translator/old_data/old7/pronunciation_database.db'),
            path.join(__dirname, '../../database/translator/old_data/old8/pronunciation_database.db'),
            path.join(__dirname, '../../database/translator/old_data/old_big1/pronunciation_database.db'),
            path.join(__dirname, '../../database/translator/old_data/old_big2/pronunciation_database.db'),
        ],
        target: {
            // baidu_translation: path.join(__dirname, '../../database/translator_merged/baidu_translation.db'),
            // google_translation: path.join(__dirname, '../../database/translator_merged/google_translation.db'),
            // baidu_American_pronunciation: path.join(__dirname, '../../database/translator_merged/baidu_American_pronunciation.db'),
            // baidu_British_pronunciation: path.join(__dirname, '../../database/translator_merged/baidu_British_pronunciation.db'),
            // google_American_pronunciation: path.join(__dirname, '../../database/translator_merged/google_American_pronunciation.db'),
            // google_British_pronunciation: path.join(__dirname, '../../database/translator_merged/google_British_pronunciation.db'),
            // cambridge_American_pronunciation: path.join(__dirname, '../../database/translator_merged/cambridge_American_pronunciation.db'),
            // cambridge_British_pronunciation: path.join(__dirname, '../../database/translator_merged/cambridge_British_pronunciation.db'),
            // collins_American_pronunciation: path.join(__dirname, '../../database/translator_merged/collins_American_pronunciation.db'),
            // collins_British_pronunciation: path.join(__dirname, '../../database/translator_merged/collins_British_pronunciation.db'),
        },

        raw_translation_db: [],
        pronunciation_db: [],
        target_db: {
            baidu_translation: null,
            google_translation: null,
            baidu_American_pronunciation: null,
            baidu_British_pronunciation: null,
            google_American_pronunciation: null,
            google_British_pronunciation: null,
            cambridge_American_pronunciation: null,
            cambridge_British_pronunciation: null,
            collins_American_pronunciation: null,
            collins_British_pronunciation: null
        },
        rows_per_time: 1000,
        is_db_initialized: false,
        progress: {
            translation: {
                baidu: 0,
                baidu_error: 0,
                google: 0,
                google_error: 0
            },
            pronunciation: {
                baidu_American: {
                    all: 0,
                    error: 0
                },
                baidu_British: {
                    all: 0,
                    error: 0
                },
                google_American: {
                    all: 0,
                    error: 0
                },
                google_British: {
                    all: 0,
                    error: 0
                },
                collins_American: {
                    all: 0,
                    error: 0
                },
                collins_British: {
                    all: 0,
                    error: 0
                },
                cambridge_American: {
                    all: 0,
                    error: 0
                },
                cambridge_British: {
                    all: 0,
                    error: 0
                },
            }
        },
        _progress: 0
    }

    class Callback_once {
        constructor(times, callback) {
            if ('function' !== typeof callback) {
                callback = function () { };
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
                callback = function () { };
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

    function connect_database(file, callback) {
        var callback_once = new Callback_once(1, callback);
        var database = new sqlite3.Database(file, sqlite3.OPEN_READWRITE, function (error) {
            if (error) {
                callback_once({
                    error: 'connect database failed! error is: ' + error.message
                });
            } else {
                callback_once({
                    database: database
                })
            }
        });
    }

    function init(callback) {

        if ('function' !== typeof callback) {
            callback = function () { };
        }
        function _callback(param) {
            if (!(param && param.error)) {
                configuration.is_db_initialized = true;
            }
            callback(param);
        }
        var callback_once = new Callback_once(1 /* + 10 */ + 2 + 1 + 1, _callback);

        var len = configuration.raw_translation.length;
        var i = 0;
        function _connect_loop() {
            if (i >= len) {
                callback_once();
                return;
            }
            var wait_all_finish = new Wait_all_finish(2, _connect_loop);
            connect_database(configuration.raw_translation[i], function (result) {
                if (result && result.error) {
                    debugger;
                    wait_all_finish(result);
                } else {
                    configuration.raw_translation_db.push(result.database);
                    wait_all_finish();
                }
            });
            connect_database(configuration.pronunciation[i], function (result) {
                if (result && result.error) {
                    debugger;
                    wait_all_finish(result);
                } else {
                    configuration.pronunciation_db.push(result.database);
                    wait_all_finish();
                }
            });
            ++i;
        }
        _connect_loop();

        //callback 10 times
        // for (var key in configuration.target) {
        //     (function (key) {
        //         connect_database(configuration.target[key], function (result) {
        //             if (result && result.error) {
        //                 callback_once(result);
        //             } else {
        //                 configuration.target_db[key] = result.database;
        //                 callback_once();
        //             }
        //         });
        //     })(key);
        // }


        connect_database(configuration.en_full, function (result) {
            if (result && result.error) {
                callback_once(result);
            } else {
                configuration.en_full_db = result.database;
                callback_once();
            }
        });

        connect_database(configuration.en_full_log, function (result) {
            if (result && result.error) {
                callback_once(result);
            } else {
                configuration.en_full_log_db = result.database;
                callback_once();
            }
        });

        fs.open('P:/temp_conemu/data.csv', 'a', function (err, fd) {
            if (err) {
                console.error(err);
                debugger;
                return;
            }
            configuration.fd = fd;
            callback_once();
        });
        database.init_database(function () {
            callback_once();
        });
    }

    function generate_all() {
        var en_full = JSON.parse(String(fs.readFileSync('database/translator/old_data/en_full.json')));
        // var en_full_frequency = JSON.parse(String(fs.readFileSync('database/translator/old_data/en_full_frequency.json')));
        var raw_translation_location = JSON.parse(String(fs.readFileSync('database/translator/old_data/raw_translation_location.json')));
        var American_pronunciation_location = JSON.parse(String(fs.readFileSync('database/translator/old_data/American_pronunciation_location.json')));
        var British_pronunciation_location = JSON.parse(String(fs.readFileSync('database/translator/old_data/British_pronunciation_location.json')));

        var en_full_len = en_full.length;
        var baidu_raw_translation_current_location = 0;
        var google_raw_translation_current_location = 0;
        var baidu_American_pronunciation_current_location = 0;
        var google_American_pronunciation_current_location = 0;
        var cambridge_American_pronunciation_current_location = 0;
        var collins_American_pronunciation_current_location = 0;
        var baidu_British_pronunciation_current_location = 0;
        var google_British_pronunciation_current_location = 0;
        var cambridge_British_pronunciation_current_location = 0;
        var collins_British_pronunciation_current_location = 0;

        /* 
                configuration.en_full_db.all('SELECT * from words', {}, function (error, rows) {
                    if (error) {
                        alert('SELECT * from words error! the error is: ' + error.message);
                    } else {
                        rows.forEach(function (ele) {
                            en_full.push(ele.word);
                            en_full_frequency.push(ele.frequency);
                        });
                        // fs.writeFileSync('database/translator/en_full.json', JSON.stringify(en_full));
                        // fs.writeFileSync('database/translator/en_full_frequency.json', JSON.stringify(en_full_frequency));
                        en_full_len = en_full.length;
                        var _wait_all_finish = new Wait_all_finish(configuration.raw_translation_db.length + configuration.pronunciation_db.length + configuration.pronunciation_db.length, _generate);
                        configuration.raw_translation_db.forEach(function (database, index) {
                            database.all('SELECT word from raw_translation', {}, function (error, rows) {
                                if (error) {
                                    alert('SELECT word from raw_translation error! the error is: ' + error.message);
                                } else {
                                    for (let len1 = rows.length, i1 = 0; i1 < len1; ++i1) {
                                        var index_word = en_full.indexOf(rows[i1].word);
                                        raw_translation_location[index_word] = [index, i1];
                                    }
                                    _wait_all_finish();
                                }
                            });
                        });
                        configuration.pronunciation_db.forEach(function (database, index) {
                            database.all('SELECT word from American_pronunciation', {}, function (error, rows) {
                                if (error) {
                                    alert('SELECT word from American_pronunciation error! the error is: ' + error.message);
                                } else {
                                    for (let len1 = rows.length, i1 = 0; i1 < len1; ++i1) {
                                        var index_word = en_full.indexOf(rows[i1].word);
                                        American_pronunciation_location[index_word] = [index, i1];
                                    }
                                    _wait_all_finish();
                                }
                            });
                        });
                        configuration.pronunciation_db.forEach(function (database, index) {
                            database.all('SELECT word from British_pronunciation', {}, function (error, rows) {
                                if (error) {
                                    alert('SELECT word from British_pronunciation error! the error is: ' + error.message);
                                } else {
                                    for (let len1 = rows.length, i1 = 0; i1 < len1; ++i1) {
                                        var index_word = en_full.indexOf(rows[i1].word);
                                        British_pronunciation_location[index_word] = [index, i1];
                                    }
                                    _wait_all_finish();
                                }
                            });
                        });
                    }
                });
        
         */

        function _generate() {
            // fs.writeFileSync('database/translator/raw_translation_location.json', JSON.stringify(raw_translation_location));
            // fs.writeFileSync('database/translator/American_pronunciation_location.json', JSON.stringify(American_pronunciation_location));
            // fs.writeFileSync('database/translator/British_pronunciation_location.json', JSON.stringify(British_pronunciation_location));


            function __generate_baidu_raw_translation_loop(callback) {
                while (!raw_translation_location[baidu_raw_translation_current_location] && baidu_raw_translation_current_location < en_full_len)
                    ++baidu_raw_translation_current_location;

                if (baidu_raw_translation_current_location >= en_full_len) {
                    callback();
                    return;
                }
                var range_start = baidu_raw_translation_current_location,
                    range_end;
                for (var i = 0; i < configuration.rows_per_time; ++i) {
                    ++baidu_raw_translation_current_location;
                    if (en_full_len <= baidu_raw_translation_current_location
                        || !raw_translation_location[baidu_raw_translation_current_location]
                        || raw_translation_location[range_start][0] !== raw_translation_location[baidu_raw_translation_current_location][0]
                        || raw_translation_location[baidu_raw_translation_current_location][1] - 1 !== raw_translation_location[baidu_raw_translation_current_location - 1][1]) {
                        break;
                    }
                }
                range_end = baidu_raw_translation_current_location;
                var OFFSET = raw_translation_location[range_start][1];
                var LIMIT = raw_translation_location[range_end - 1][1] - raw_translation_location[range_start][1] + 1;
                configuration.raw_translation_db[raw_translation_location[range_start][0]].all('SELECT word,baidu from raw_translation LIMIT $LIMIT OFFSET $OFFSET', {
                    $LIMIT: LIMIT,
                    $OFFSET: OFFSET
                }, function (error, rows) {
                    if (error) {
                        alert('SELECT * from raw_translation LIMIT $LIMIT OFFSET $OFFSET error! the error is: ' + error.message);
                        debugger;
                    } else {
                        rows.forEach(function (ele) {
                            if (!ele.baidu || '{' !== ele.baidu[0])
                                return;
                            database._storage_baidu_raw_translation_data(ele.word, Buffer.from(ele.baidu));
                        });
                        database._storage_baidu_raw_translation_data_flush();
                        __generate_baidu_raw_translation_loop(callback);
                    }
                });
            }
            function __generate_google_raw_translation_loop(callback) {
                while (!raw_translation_location[google_raw_translation_current_location] && google_raw_translation_current_location < en_full_len)
                    ++google_raw_translation_current_location;

                if (google_raw_translation_current_location >= en_full_len) {
                    callback();
                    return;
                }
                var range_start = google_raw_translation_current_location,
                    range_end;
                for (var i = 0; i < configuration.rows_per_time; ++i) {
                    ++google_raw_translation_current_location;
                    if (en_full_len <= google_raw_translation_current_location
                        || !raw_translation_location[google_raw_translation_current_location]
                        || raw_translation_location[range_start][0] !== raw_translation_location[google_raw_translation_current_location][0]
                        || raw_translation_location[google_raw_translation_current_location][1] - 1 !== raw_translation_location[google_raw_translation_current_location - 1][1]) {
                        break;
                    }
                }
                range_end = google_raw_translation_current_location;
                var OFFSET = raw_translation_location[range_start][1];
                var LIMIT = raw_translation_location[range_end - 1][1] - raw_translation_location[range_start][1] + 1;
                configuration.raw_translation_db[raw_translation_location[range_start][0]].all('SELECT word,google from raw_translation LIMIT $LIMIT OFFSET $OFFSET', {
                    $LIMIT: LIMIT,
                    $OFFSET: OFFSET
                }, function (error, rows) {
                    if (error) {
                        alert('SELECT * from raw_translation LIMIT $LIMIT OFFSET $OFFSET error! the error is: ' + error.message);
                        debugger;
                    } else {
                        rows.forEach(function (ele) {
                            if (!ele.google || '[' !== ele.google[0])
                                return;
                            database._storage_google_raw_translation_data(ele.word, Buffer.from(ele.google));
                        });
                        database._storage_google_raw_translation_data_flush();
                        __generate_google_raw_translation_loop(callback);
                    }
                });
            }
            function __generate_baidu_American_pronunciation_loop(callback) {
                while (!American_pronunciation_location[baidu_American_pronunciation_current_location] && baidu_American_pronunciation_current_location < en_full_len)
                    ++baidu_American_pronunciation_current_location;

                if (baidu_American_pronunciation_current_location >= en_full_len) {
                    callback();
                    return;
                }
                var range_start = baidu_American_pronunciation_current_location,
                    range_end;
                for (var i = 0; i < configuration.rows_per_time; ++i) {
                    ++baidu_American_pronunciation_current_location;
                    if (en_full_len <= baidu_American_pronunciation_current_location
                        || !American_pronunciation_location[baidu_American_pronunciation_current_location]
                        || American_pronunciation_location[range_start][0] !== American_pronunciation_location[baidu_American_pronunciation_current_location][0]
                        || American_pronunciation_location[baidu_American_pronunciation_current_location][1] - 1 !== American_pronunciation_location[baidu_American_pronunciation_current_location - 1][1]) {
                        break;
                    }
                }
                range_end = baidu_American_pronunciation_current_location;
                var OFFSET = American_pronunciation_location[range_start][1];
                var LIMIT = American_pronunciation_location[range_end - 1][1] - American_pronunciation_location[range_start][1] + 1;
                configuration.pronunciation_db[American_pronunciation_location[range_start][0]].all('SELECT word,baidu from American_pronunciation LIMIT $LIMIT OFFSET $OFFSET', {
                    $LIMIT: LIMIT,
                    $OFFSET: OFFSET
                }, function (error, rows) {
                    if (error) {
                        alert('SELECT word,baidu from American_pronunciation LIMIT $LIMIT OFFSET $OFFSET error! the error is: ' + error.message);
                        debugger;
                    } else {
                        rows.forEach(function (ele) {
                            if (!ele.baidu || 0xff !== ele.baidu[0])
                                return;
                            database._storage_baidu_American_pronunciation_data(ele.word, Buffer.from(ele.baidu));
                        });
                        database._storage_baidu_American_pronunciation_data_flush();
                        __generate_baidu_American_pronunciation_loop(callback);
                    }
                });
            }
            function __generate_google_American_pronunciation_loop(callback) {
                while (!American_pronunciation_location[google_American_pronunciation_current_location] && google_American_pronunciation_current_location < en_full_len)
                    ++google_American_pronunciation_current_location;

                if (google_American_pronunciation_current_location >= en_full_len) {
                    callback();
                    return;
                }
                var range_start = google_American_pronunciation_current_location,
                    range_end;
                for (var i = 0; i < configuration.rows_per_time; ++i) {
                    ++google_American_pronunciation_current_location;
                    if (en_full_len <= google_American_pronunciation_current_location
                        || !American_pronunciation_location[google_American_pronunciation_current_location]
                        || American_pronunciation_location[range_start][0] !== American_pronunciation_location[google_American_pronunciation_current_location][0]
                        || American_pronunciation_location[google_American_pronunciation_current_location][1] - 1 !== American_pronunciation_location[google_American_pronunciation_current_location - 1][1]) {
                        break;
                    }
                }
                range_end = google_American_pronunciation_current_location;
                var OFFSET = American_pronunciation_location[range_start][1];
                var LIMIT = American_pronunciation_location[range_end - 1][1] - American_pronunciation_location[range_start][1] + 1;
                configuration.pronunciation_db[American_pronunciation_location[range_start][0]].all('SELECT word,google from American_pronunciation LIMIT $LIMIT OFFSET $OFFSET', {
                    $LIMIT: LIMIT,
                    $OFFSET: OFFSET
                }, function (error, rows) {
                    if (error) {
                        alert('SELECT word,google from American_pronunciation LIMIT $LIMIT OFFSET $OFFSET error! the error is: ' + error.message);
                        debugger;
                    } else {
                        rows.forEach(function (ele) {
                            if (!ele.google || 0xff !== ele.google[0])
                                return;
                            database._storage_google_American_pronunciation_data(ele.word, Buffer.from(ele.google));
                        });
                        database._storage_google_American_pronunciation_data_flush();
                        __generate_google_American_pronunciation_loop(callback);
                    }
                });
            }
            function __generate_cambridge_American_pronunciation_loop(callback) {
                while (!American_pronunciation_location[cambridge_American_pronunciation_current_location] && cambridge_American_pronunciation_current_location < en_full_len)
                    ++cambridge_American_pronunciation_current_location;

                if (cambridge_American_pronunciation_current_location >= en_full_len) {
                    callback();
                    return;
                }
                var range_start = cambridge_American_pronunciation_current_location,
                    range_end;
                for (var i = 0; i < configuration.rows_per_time; ++i) {
                    ++cambridge_American_pronunciation_current_location;
                    if (en_full_len <= cambridge_American_pronunciation_current_location
                        || !American_pronunciation_location[cambridge_American_pronunciation_current_location]
                        || American_pronunciation_location[range_start][0] !== American_pronunciation_location[cambridge_American_pronunciation_current_location][0]
                        || American_pronunciation_location[cambridge_American_pronunciation_current_location][1] - 1 !== American_pronunciation_location[cambridge_American_pronunciation_current_location - 1][1]) {
                        break;
                    }
                }
                range_end = cambridge_American_pronunciation_current_location;
                var OFFSET = American_pronunciation_location[range_start][1];
                var LIMIT = American_pronunciation_location[range_end - 1][1] - American_pronunciation_location[range_start][1] + 1;
                configuration.pronunciation_db[American_pronunciation_location[range_start][0]].all('SELECT word,cambridge from American_pronunciation LIMIT $LIMIT OFFSET $OFFSET', {
                    $LIMIT: LIMIT,
                    $OFFSET: OFFSET
                }, function (error, rows) {
                    if (error) {
                        alert('SELECT word,cambridge from American_pronunciation LIMIT $LIMIT OFFSET $OFFSET error! the error is: ' + error.message);
                        debugger;
                    } else {
                        rows.forEach(function (ele) {
                            if (!ele.cambridge || 0x49 !== ele.cambridge[0])
                                return;
                            database._storage_cambridge_American_pronunciation_data(ele.word, Buffer.from(ele.cambridge));
                        });
                        database._storage_cambridge_American_pronunciation_data_flush();
                        __generate_cambridge_American_pronunciation_loop(callback);
                    }
                });
            }
            function __generate_collins_American_pronunciation_loop(callback) {
                while (!American_pronunciation_location[collins_American_pronunciation_current_location] && collins_American_pronunciation_current_location < en_full_len)
                    ++collins_American_pronunciation_current_location;

                if (collins_American_pronunciation_current_location >= en_full_len) {
                    callback();
                    return;
                }
                var range_start = collins_American_pronunciation_current_location,
                    range_end;
                for (var i = 0; i < configuration.rows_per_time; ++i) {
                    ++collins_American_pronunciation_current_location;
                    if (en_full_len <= collins_American_pronunciation_current_location
                        || !American_pronunciation_location[collins_American_pronunciation_current_location]
                        || American_pronunciation_location[range_start][0] !== American_pronunciation_location[collins_American_pronunciation_current_location][0]
                        || American_pronunciation_location[collins_American_pronunciation_current_location][1] - 1 !== American_pronunciation_location[collins_American_pronunciation_current_location - 1][1]) {
                        break;
                    }
                }
                range_end = collins_American_pronunciation_current_location;
                var OFFSET = American_pronunciation_location[range_start][1];
                var LIMIT = American_pronunciation_location[range_end - 1][1] - American_pronunciation_location[range_start][1] + 1;
                configuration.pronunciation_db[American_pronunciation_location[range_start][0]].all('SELECT word,collins from American_pronunciation LIMIT $LIMIT OFFSET $OFFSET', {
                    $LIMIT: LIMIT,
                    $OFFSET: OFFSET
                }, function (error, rows) {
                    if (error) {
                        alert('SELECT word,collins from American_pronunciation LIMIT $LIMIT OFFSET $OFFSET error! the error is: ' + error.message);
                        debugger;
                    } else {
                        rows.forEach(function (ele) {
                            if (!ele.collins || 0xff !== ele.collins[0])
                                return;
                            database._storage_collins_American_pronunciation_data(ele.word, Buffer.from(ele.collins));
                        });
                        database._storage_collins_American_pronunciation_data_flush();
                        __generate_collins_American_pronunciation_loop(callback);
                    }
                });
            }
            function __generate_baidu_British_pronunciation_loop(callback) {
                while (!British_pronunciation_location[baidu_British_pronunciation_current_location] && baidu_British_pronunciation_current_location < en_full_len)
                    ++baidu_British_pronunciation_current_location;

                if (baidu_British_pronunciation_current_location >= en_full_len) {
                    callback();
                    return;
                }
                var range_start = baidu_British_pronunciation_current_location,
                    range_end;
                for (var i = 0; i < configuration.rows_per_time; ++i) {
                    ++baidu_British_pronunciation_current_location;
                    if (en_full_len <= baidu_British_pronunciation_current_location
                        || !British_pronunciation_location[baidu_British_pronunciation_current_location]
                        || British_pronunciation_location[range_start][0] !== British_pronunciation_location[baidu_British_pronunciation_current_location][0]
                        || British_pronunciation_location[baidu_British_pronunciation_current_location][1] - 1 !== British_pronunciation_location[baidu_British_pronunciation_current_location - 1][1]) {
                        break;
                    }
                }
                range_end = baidu_British_pronunciation_current_location;
                var OFFSET = British_pronunciation_location[range_start][1];
                var LIMIT = British_pronunciation_location[range_end - 1][1] - British_pronunciation_location[range_start][1] + 1;
                configuration.pronunciation_db[British_pronunciation_location[range_start][0]].all('SELECT word,baidu from British_pronunciation LIMIT $LIMIT OFFSET $OFFSET', {
                    $LIMIT: LIMIT,
                    $OFFSET: OFFSET
                }, function (error, rows) {
                    if (error) {
                        alert('SELECT word,baidu from British_pronunciation LIMIT $LIMIT OFFSET $OFFSET error! the error is: ' + error.message);
                        debugger;
                    } else {
                        rows.forEach(function (ele) {
                            if (!ele.baidu || 0xff !== ele.baidu[0])
                                return;
                            database._storage_baidu_British_pronunciation_data(ele.word, Buffer.from(ele.baidu));
                        });
                        database._storage_baidu_British_pronunciation_data_flush();
                        __generate_baidu_British_pronunciation_loop(callback);
                    }
                });
            }
            function __generate_google_British_pronunciation_loop(callback) {
                while (!British_pronunciation_location[google_British_pronunciation_current_location] && google_British_pronunciation_current_location < en_full_len)
                    ++google_British_pronunciation_current_location;

                if (google_British_pronunciation_current_location >= en_full_len) {
                    callback();
                    return;
                }
                var range_start = google_British_pronunciation_current_location,
                    range_end;
                for (var i = 0; i < configuration.rows_per_time; ++i) {
                    ++google_British_pronunciation_current_location;
                    if (en_full_len <= google_British_pronunciation_current_location
                        || !British_pronunciation_location[google_British_pronunciation_current_location]
                        || British_pronunciation_location[range_start][0] !== British_pronunciation_location[google_British_pronunciation_current_location][0]
                        || British_pronunciation_location[google_British_pronunciation_current_location][1] - 1 !== British_pronunciation_location[google_British_pronunciation_current_location - 1][1]) {
                        break;
                    }
                }
                range_end = google_British_pronunciation_current_location;
                var OFFSET = British_pronunciation_location[range_start][1];
                var LIMIT = British_pronunciation_location[range_end - 1][1] - British_pronunciation_location[range_start][1] + 1;
                configuration.pronunciation_db[British_pronunciation_location[range_start][0]].all('SELECT word,google from British_pronunciation LIMIT $LIMIT OFFSET $OFFSET', {
                    $LIMIT: LIMIT,
                    $OFFSET: OFFSET
                }, function (error, rows) {
                    if (error) {
                        alert('SELECT word,google from British_pronunciation LIMIT $LIMIT OFFSET $OFFSET error! the error is: ' + error.message);
                        debugger;
                    } else {
                        rows.forEach(function (ele) {
                            if (!ele.google || 0xff !== ele.google[0])
                                return;
                            database._storage_google_British_pronunciation_data(ele.word, Buffer.from(ele.google));
                        });
                        database._storage_google_British_pronunciation_data_flush();
                        __generate_google_British_pronunciation_loop(callback);
                    }
                });
            }
            function __generate_cambridge_British_pronunciation_loop(callback) {
                while (!British_pronunciation_location[cambridge_British_pronunciation_current_location] && cambridge_British_pronunciation_current_location < en_full_len)
                    ++cambridge_British_pronunciation_current_location;

                if (cambridge_British_pronunciation_current_location >= en_full_len) {
                    callback();
                    return;
                }
                var range_start = cambridge_British_pronunciation_current_location,
                    range_end;
                for (var i = 0; i < configuration.rows_per_time; ++i) {
                    ++cambridge_British_pronunciation_current_location;
                    if (en_full_len <= cambridge_British_pronunciation_current_location
                        || !British_pronunciation_location[cambridge_British_pronunciation_current_location]
                        || British_pronunciation_location[range_start][0] !== British_pronunciation_location[cambridge_British_pronunciation_current_location][0]
                        || British_pronunciation_location[cambridge_British_pronunciation_current_location][1] - 1 !== British_pronunciation_location[cambridge_British_pronunciation_current_location - 1][1]) {
                        break;
                    }
                }
                range_end = cambridge_British_pronunciation_current_location;
                var OFFSET = British_pronunciation_location[range_start][1];
                var LIMIT = British_pronunciation_location[range_end - 1][1] - British_pronunciation_location[range_start][1] + 1;
                configuration.pronunciation_db[British_pronunciation_location[range_start][0]].all('SELECT word,cambridge from British_pronunciation LIMIT $LIMIT OFFSET $OFFSET', {
                    $LIMIT: LIMIT,
                    $OFFSET: OFFSET
                }, function (error, rows) {
                    if (error) {
                        alert('SELECT word,cambridge from British_pronunciation LIMIT $LIMIT OFFSET $OFFSET error! the error is: ' + error.message);
                        debugger;
                    } else {
                        rows.forEach(function (ele) {
                            if (!ele.cambridge || 0x49 !== ele.cambridge[0])
                                return;
                            database._storage_cambridge_British_pronunciation_data(ele.word, Buffer.from(ele.cambridge));
                        });
                        database._storage_cambridge_British_pronunciation_data_flush();
                        __generate_cambridge_British_pronunciation_loop(callback);
                    }
                });
            }
            function __generate_collins_British_pronunciation_loop(callback) {
                while (!British_pronunciation_location[collins_British_pronunciation_current_location] && collins_British_pronunciation_current_location < en_full_len)
                    ++collins_British_pronunciation_current_location;

                if (collins_British_pronunciation_current_location >= en_full_len) {
                    callback();
                    return;
                }
                var range_start = collins_British_pronunciation_current_location,
                    range_end;
                for (var i = 0; i < configuration.rows_per_time; ++i) {
                    ++collins_British_pronunciation_current_location;
                    if (en_full_len <= collins_British_pronunciation_current_location
                        || !British_pronunciation_location[collins_British_pronunciation_current_location]
                        || British_pronunciation_location[range_start][0] !== British_pronunciation_location[collins_British_pronunciation_current_location][0]
                        || British_pronunciation_location[collins_British_pronunciation_current_location][1] - 1 !== British_pronunciation_location[collins_British_pronunciation_current_location - 1][1]) {
                        break;
                    }
                }
                range_end = collins_British_pronunciation_current_location;
                var OFFSET = British_pronunciation_location[range_start][1];
                var LIMIT = British_pronunciation_location[range_end - 1][1] - British_pronunciation_location[range_start][1] + 1;
                configuration.pronunciation_db[British_pronunciation_location[range_start][0]].all('SELECT word,collins from British_pronunciation LIMIT $LIMIT OFFSET $OFFSET', {
                    $LIMIT: LIMIT,
                    $OFFSET: OFFSET
                }, function (error, rows) {
                    if (error) {
                        alert('SELECT word,collins from British_pronunciation LIMIT $LIMIT OFFSET $OFFSET error! the error is: ' + error.message);
                        debugger;
                    } else {
                        rows.forEach(function (ele) {
                            if (!ele.collins || 0xff !== ele.collins[0])
                                return;
                            database._storage_collins_British_pronunciation_data(ele.word, Buffer.from(ele.collins));
                        });
                        database._storage_collins_British_pronunciation_data_flush();
                        __generate_collins_British_pronunciation_loop(callback);
                    }
                });
            }



            // __generate_baidu_raw_translation_loop(function () {
            //     console.log('ok!');
            // });


            __generate_baidu_raw_translation_loop(function () {
                console.log('baidu_raw_translation has finished!');
            });
            __generate_google_raw_translation_loop(function () {
                console.log('google_raw_translation has finished!');
            });
            __generate_baidu_American_pronunciation_loop(function () {
                console.log('baidu_American_pronunciation has finished!');
            });
            __generate_google_American_pronunciation_loop(function () {
                console.log('google_American_pronunciation has finished!');
            });
            __generate_cambridge_American_pronunciation_loop(function () {
                console.log('cambridge_American_pronunciation has finished!');
            });
            __generate_collins_American_pronunciation_loop(function () {
                console.log('collins_American_pronunciation has finished!');
            });
            __generate_baidu_British_pronunciation_loop(function () {
                console.log('baidu_British_pronunciation has finished!');
            });
            __generate_google_British_pronunciation_loop(function () {
                console.log('google_British_pronunciation has finished!');
            });
            __generate_cambridge_British_pronunciation_loop(function () {
                console.log('cambridge_British_pronunciation has finished!');
            });
            __generate_collins_British_pronunciation_loop(function () {
                console.log('collins_British_pronunciation has finished!');
            });

        }
        _generate();

    }



    module.exports = {
        configuration: configuration,
        generate_all: generate_all,
        init: init
    }
})(global);





