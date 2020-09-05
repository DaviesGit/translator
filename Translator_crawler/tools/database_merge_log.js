(function (global) {
    // const sqlite3 = require('S:/ApplicationBinary/Nodejs_Tools/node-sqlite3/node-sqlite3-4.0.2').verbose();

    const path = require('path');




    const fs = require('fs');
    const sqlite3 = require(path.join(__dirname, '../../node-sqlite3-4.0.2')).verbose();

    const configuration = {
        en_full_log: path.join(__dirname, '../../database/translator_merged/en_full_log.db'),
        en_full_log_db: null,

        en_full: path.join(__dirname, '../../en_full.db'),
        en_full_db: null,


        raw_translation: [
            path.join(__dirname, '../../database/translator/old1/raw_translation_database.db'),
            path.join(__dirname, '../../database/translator/old2/raw_translation_database.db'),
            path.join(__dirname, '../../database/translator/old3/raw_translation_database.db'),
            path.join(__dirname, '../../database/translator/old4/raw_translation_database.db'),
            path.join(__dirname, '../../database/translator/old5/raw_translation_database.db'),
            path.join(__dirname, '../../database/translator/old6/raw_translation_database.db'),
            path.join(__dirname, '../../database/translator/old7/raw_translation_database.db'),
            path.join(__dirname, '../../database/translator/old8/raw_translation_database.db'),
            path.join(__dirname, '../../database/translator/old_big1/raw_translation_database.db'),
            path.join(__dirname, '../../database/translator/old_big2/raw_translation_database.db'),
            // path.join(__dirname, '../../database/translator/old_big3/raw_translation_database.db'),
        ],
        pronunciation: [
            path.join(__dirname, '../../database/translator/old1/pronunciation_database.db'),
            path.join(__dirname, '../../database/translator/old2/pronunciation_database.db'),
            path.join(__dirname, '../../database/translator/old3/pronunciation_database.db'),
            path.join(__dirname, '../../database/translator/old4/pronunciation_database.db'),
            path.join(__dirname, '../../database/translator/old5/pronunciation_database.db'),
            path.join(__dirname, '../../database/translator/old6/pronunciation_database.db'),
            path.join(__dirname, '../../database/translator/old7/pronunciation_database.db'),
            path.join(__dirname, '../../database/translator/old8/pronunciation_database.db'),
            path.join(__dirname, '../../database/translator/old_big1/pronunciation_database.db'),
            path.join(__dirname, '../../database/translator/old_big2/pronunciation_database.db'),
            // path.join(__dirname, '../../database/translator/old_big3/pronunciation_database.db'),
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
        var callback_once = new Callback_once(1 /* + 10 */ + 2 + 1, _callback);

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
    }

    function start_merge() {
        function merge_translation(callback) {
            var callback_once = new Callback_once(1, callback);
            var records = 0,
                index = 0;

            function merge_loop() {
                var database = configuration.raw_translation_db.pop();
                if (!database) {
                    callback_once({
                        info: 'no error!'
                    });
                    return;
                }
                database.get('SELECT COUNT(*) FROM raw_translation',
                    function (error, row) {
                        if (error) {
                            callback_once({
                                error: 'SELECT COUNT(*) FROM raw_translation failed! the error is: ' + error.message
                            });
                        } else {
                            if (!row) {
                                callback_once({
                                    error: 'SELECT COUNT(*) FROM raw_translation failed! the error is: ' + error.message
                                });
                            } else {
                                records = row["COUNT(*)"];
                                index = 0;
                                function database_loop() {
                                    if (index >= records) {
                                        merge_loop();
                                        return;
                                    }
                                    database.all('SELECT * from raw_translation LIMIT ' + configuration.rows_per_time + ' OFFSET $index', {
                                        $index: index
                                    }, function (error, rows) {
                                        if (error) {
                                            callback_once({
                                                error: 'SELECT * from raw_translation LIMIT configuration.rows_per_time OFFSET $index failed! the error is: ' + error.message
                                            });
                                        } else {
                                            if (!rows) {
                                                callback_once({
                                                    error: 'SELECT * from raw_translation LIMIT configuration.rows_per_time OFFSET $index failed! the error is: ' + error.message
                                                });
                                            } else {
                                                function generate_update_object(rows, client) {
                                                    var statements = [];
                                                    log = [],
                                                        compare_char = client === 'baidu' ? '{' : '[';

                                                    for (var i = 0; i < rows.length; ++i) {
                                                        statements.push({
                                                            $word: rows[i].word,
                                                            $translation: (rows[i][client][0] && (rows[i][client][0] === compare_char)) ? rows[i][client] : (() => { log.push(rows[i]); return null; })()
                                                        });
                                                    }
                                                    if (log.length) {
                                                        console.error(log);
                                                    }
                                                    return statements;
                                                }
                                                var baidu = generate_update_object(rows, 'baidu');
                                                var google = generate_update_object(rows, 'google');


                                                var wait_all_finish = new Wait_all_finish(2, function () {
                                                    index += configuration.rows_per_time;
                                                    database_loop();
                                                });
                                                var statement_baidu = configuration.target_db.baidu_translation.prepare('UPDATE words SET translation=$translation WHERE word=$word', function (error) {
                                                    if (error) {
                                                        callback_once({
                                                            error: 'UPDATE words SET translation=$translation WHERE word=$word failed! error is: ' + error.message
                                                        });
                                                    } else {
                                                        baidu.forEach(function (element) {
                                                            statement_baidu.run(element, function (error) {
                                                                ++configuration.progress.translation.baidu;
                                                                if (error) {
                                                                    ++configuration.progress.translation.baidu_error;
                                                                    callback_once({
                                                                        error: 'UPDATE words SET translation=$translation WHERE word=$word failed! error is: ' + error.message
                                                                    });
                                                                }
                                                            });
                                                        });
                                                        statement_baidu.finalize(function (error) {
                                                            if (error) {
                                                                callback_once({
                                                                    error: 'UPDATE words SET translation=$translation WHERE word=$word failed! error is: ' + error.message
                                                                });
                                                            } else {
                                                                wait_all_finish();
                                                            }
                                                        });
                                                    }
                                                });
                                                var statement_google = configuration.target_db.google_translation.prepare('UPDATE words SET translation=$translation WHERE word=$word', function (error) {
                                                    if (error) {
                                                        callback_once({
                                                            error: 'UPDATE words SET translation=$translation WHERE word=$word failed! error is: ' + error.message
                                                        });
                                                    } else {
                                                        google.forEach(function (element) {
                                                            statement_google.run(element, function (error) {
                                                                ++configuration.progress.translation.google;
                                                                if (error) {
                                                                    ++configuration.progress.translation.google_error;
                                                                    callback_once({
                                                                        error: 'UPDATE words SET translation=$translation WHERE word=$word failed! error is: ' + error.message
                                                                    });
                                                                }
                                                            });
                                                        });
                                                        statement_google.finalize(function (error) {
                                                            if (error) {
                                                                callback_once({
                                                                    error: 'UPDATE words SET translation=$translation WHERE word=$word failed! error is: ' + error.message
                                                                });
                                                            } else {
                                                                wait_all_finish();
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        }
                                    });
                                }
                                database_loop();
                            }
                        }
                    }
                );

            }
            merge_loop();
        }

        function merge_pronunciation(callback) {
            var callback_once = new Callback_once(1, callback);
            var American_pronunciation_records = 0,
                American_pronunciation_index = 0,
                British_pronunciation_records = 0,
                British_pronunciation_index = 0;

            function merge_loop() {
                var database = configuration.pronunciation_db.pop();
                if (!database) {
                    callback_once({
                        info: 'no error!'
                    });
                    return;
                }
                database.get('SELECT COUNT(*) FROM American_pronunciation',
                    function (error, row) {
                        if (error) {
                            callback_once({
                                error: 'SELECT COUNT(*) FROM American_pronunciation failed! the error is: ' + error.message
                            });
                        } else {
                            if (!row) {
                                callback_once({
                                    error: 'SELECT COUNT(*) FROM American_pronunciation failed! the error is: ' + error.message
                                });
                            } else {
                                American_pronunciation_records = row["COUNT(*)"];
                                American_pronunciation_index = 0;
                                function database_loop() {
                                    if (American_pronunciation_index >= American_pronunciation_records) {
                                        merge_loop();
                                        return;
                                    }
                                    database.all('SELECT * from American_pronunciation LIMIT ' + configuration.rows_per_time + ' OFFSET $index', {
                                        $index: American_pronunciation_index
                                    }, function (error, rows) {
                                        if (error) {
                                            callback_once({
                                                error: 'SELECT * from American_pronunciation LIMIT configuration.rows_per_time OFFSET $index failed! the error is: ' + error.message
                                            });
                                        } else {
                                            if (!rows) {
                                                callback_once({
                                                    error: 'SELECT * from American_pronunciation LIMIT configuration.rows_per_time OFFSET $index failed! the error is: ' + error.message
                                                });
                                            } else {
                                                function generate_update_object(rows, client, check) {
                                                    var objects = [];
                                                    log = [];
                                                    for (var i = 0; i < rows.length; ++i) {
                                                        objects.push({
                                                            $word: rows[i].word,
                                                            $pronunciation: (rows[i][client] && (rows[i][client][0] === check)) ? rows[i][client] : (() => { log.push(rows[i]); return null; })()
                                                        });
                                                    }
                                                    if (log.length) {
                                                        console.log(client);
                                                        console.error(log);
                                                    }
                                                    return objects;
                                                }

                                                function update_pronunciation_db(database, objects, count, callback) {
                                                    var statement = database.prepare('UPDATE words SET pronunciation=$pronunciation WHERE word=$word', function (error) {
                                                        if (error) {
                                                            callback_once({
                                                                error: 'UPDATE words SET translation=$translation WHERE word=$word failed! error is: ' + error.message
                                                            });
                                                        } else {
                                                            objects.forEach(function (element) {
                                                                statement.run(element, function (error) {
                                                                    ++count.all;
                                                                    if (error) {
                                                                        ++count.error;
                                                                        callback_once({
                                                                            error: 'UPDATE words SET translation=$translation WHERE word=$word failed! error is: ' + error.message
                                                                        });
                                                                    }
                                                                });
                                                            });
                                                            statement.finalize(function (error) {
                                                                if (error) {
                                                                    callback_once({
                                                                        error: 'UPDATE words SET translation=$translation WHERE word=$word failed! error is: ' + error.message
                                                                    });
                                                                } else {
                                                                    callback();
                                                                }
                                                            });
                                                        }
                                                    });
                                                }

                                                var wait_all_finish = new Wait_all_finish(4, function () {
                                                    American_pronunciation_index += configuration.rows_per_time;
                                                    database_loop();
                                                });

                                                var baidu = generate_update_object(rows, 'baidu', 0xff);
                                                var google = generate_update_object(rows, 'google', 0xff);
                                                var cambridge = generate_update_object(rows, 'cambridge', 0x49);
                                                var collins = generate_update_object(rows, 'collins', 0xff);

                                                update_pronunciation_db(configuration.target_db.baidu_American_pronunciation, baidu, configuration.progress.pronunciation.baidu_American, wait_all_finish);
                                                update_pronunciation_db(configuration.target_db.google_American_pronunciation, google, configuration.progress.pronunciation.google_American, wait_all_finish);
                                                update_pronunciation_db(configuration.target_db.cambridge_American_pronunciation, cambridge, configuration.progress.pronunciation.cambridge_American, wait_all_finish);
                                                update_pronunciation_db(configuration.target_db.collins_American_pronunciation, collins, configuration.progress.pronunciation.collins_American, wait_all_finish);

                                            }
                                        }
                                    });
                                }
                                database_loop();
                            }
                        }
                    }
                );

                database.get('SELECT COUNT(*) FROM British_pronunciation',
                    function (error, row) {
                        if (error) {
                            callback_once({
                                error: 'SELECT COUNT(*) FROM British_pronunciation failed! the error is: ' + error.message
                            });
                        } else {
                            if (!row) {
                                callback_once({
                                    error: 'SELECT COUNT(*) FROM British_pronunciation failed! the error is: ' + error.message
                                });
                            } else {
                                British_pronunciation_records = row["COUNT(*)"];
                                British_pronunciation_index = 0;
                                function database_loop() {
                                    if (British_pronunciation_index >= British_pronunciation_records) {
                                        merge_loop();
                                        return;
                                    }
                                    database.all('SELECT * from British_pronunciation LIMIT ' + configuration.rows_per_time + ' OFFSET $index', {
                                        $index: British_pronunciation_index
                                    }, function (error, rows) {
                                        if (error) {
                                            callback_once({
                                                error: 'SELECT * from British_pronunciation LIMIT configuration.rows_per_time OFFSET $index failed! the error is: ' + error.message
                                            });
                                        } else {
                                            if (!rows) {
                                                callback_once({
                                                    error: 'SELECT * from British_pronunciation LIMIT configuration.rows_per_time OFFSET $index failed! the error is: ' + error.message
                                                });
                                            } else {
                                                function generate_update_object(rows, client, check) {
                                                    var objects = [];
                                                    log = [];
                                                    for (var i = 0; i < rows.length; ++i) {
                                                        objects.push({
                                                            $word: rows[i].word,
                                                            $pronunciation: (rows[i][client] && (rows[i][client][0] === check)) ? rows[i][client] : (() => { log.push(rows[i]); return null; })()
                                                        });
                                                    }
                                                    if (log.length) {
                                                        console.error(log);
                                                    }
                                                    return objects;
                                                }

                                                function update_pronunciation_db(database, objects, count, callback) {
                                                    var statement = database.prepare('UPDATE words SET pronunciation=$pronunciation WHERE word=$word', function (error) {
                                                        if (error) {
                                                            callback_once({
                                                                error: 'UPDATE words SET translation=$translation WHERE word=$word failed! error is: ' + error.message
                                                            });
                                                        } else {
                                                            objects.forEach(function (element) {
                                                                statement.run(element, function (error) {
                                                                    ++count.all;
                                                                    if (error) {
                                                                        ++count.error;
                                                                        callback_once({
                                                                            error: 'UPDATE words SET translation=$translation WHERE word=$word failed! error is: ' + error.message
                                                                        });
                                                                    }
                                                                });
                                                            });
                                                            statement.finalize(function (error) {
                                                                if (error) {
                                                                    callback_once({
                                                                        error: 'UPDATE words SET translation=$translation WHERE word=$word failed! error is: ' + error.message
                                                                    });
                                                                } else {
                                                                    callback();
                                                                }
                                                            });
                                                        }
                                                    });
                                                }

                                                var wait_all_finish = new Wait_all_finish(4, function () {
                                                    British_pronunciation_index += configuration.rows_per_time;
                                                    database_loop();
                                                });

                                                var baidu = generate_update_object(rows, 'baidu', 0xff);
                                                var google = generate_update_object(rows, 'google', 0xff);
                                                var cambridge = generate_update_object(rows, 'cambridge', 0x49);
                                                var collins = generate_update_object(rows, 'collins', 0xff);

                                                update_pronunciation_db(configuration.target_db.baidu_British_pronunciation, baidu, configuration.progress.pronunciation.baidu_British, wait_all_finish);
                                                update_pronunciation_db(configuration.target_db.google_British_pronunciation, google, configuration.progress.pronunciation.google_British, wait_all_finish);
                                                update_pronunciation_db(configuration.target_db.cambridge_British_pronunciation, cambridge, configuration.progress.pronunciation.cambridge_British, wait_all_finish);
                                                update_pronunciation_db(configuration.target_db.collins_British_pronunciation, collins, configuration.progress.pronunciation.collins_British, wait_all_finish);

                                            }
                                        }
                                    });
                                }
                                database_loop();
                            }
                        }
                    }
                );

            }
            merge_loop();
        }


        // merge_translation(function (result) {
        //     console.log(result);
        // });

        // merge_pronunciation(function (result) {
        //     console.log(result);
        // });


    }

    function count() {
        var len = configuration.raw_translation_db.length;
        var i = 0;
        function _loop() {
            if (i >= len) {
                console.log('ok');
                return;
            }
            var wait_all_finish = new Wait_all_finish(3, _loop);
            configuration.raw_translation_db[i].get('SELECT count(*) from raw_translation', {}, function (error, rows) {
                if (error) {
                    alert('SELECT count(*) from raw_translation! the error is: ' + error.message);
                } else {
                    console.log(rows);
                    wait_all_finish();
                }
            });

            configuration.pronunciation_db[i].get('SELECT count(*) from American_pronunciation', {}, function (error, rows) {
                if (error) {
                    alert('SELECT count(*) from American_pronunciation error! the error is: ' + error.message);
                } else {
                    console.log(rows);
                    wait_all_finish();
                }
            });

            configuration.pronunciation_db[i].get('SELECT count(*) from British_pronunciation', {}, function (error, rows) {
                if (error) {
                    alert('SELECT count(*) from British_pronunciation error! the error is: ' + error.message);
                } else {
                    console.log(rows);
                    wait_all_finish();
                }
            });
            ++i;
        }

        _loop();

    }
    /* 
        function generate_en_full_log_db() {
            var en_full = [];
            var raw_translation_location = [];
            var American_pronunciation_location = [];
            var British_pronunciation_location = [];
            var current_location = 0;
    
            configuration.en_full_db.all('SELECT word from words', {}, function (error, rows) {
                if (error) {
                    alert('SELECT word from words error! the error is: ' + error.message);
                } else {
                    rows.forEach(function (ele) {
                        en_full.push(ele.word);
                    });
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
    
    
            function _generate() {
                // database = new sqlite3.Database(path.join(__dirname, '../../database/translator_merged/en_full_log.db'), sqlite3.OPEN_READWRITE, function (error) {
                //     if (error) {
                //         alert('connect database failed! error is: ' + error.message);
                //     } else {
                function _generate_loop() {
    
    
                    if (en_full.length < current_location) {
                        console.log('all finish!');
                        fs.close(configuration.fd, function () {
                            console.log('file closed!');
                        });
                        return;
                    }
    
                    // {
                    //     $word: null,
                    //     $is_baidu_translate_ok: null,
                    //     $is_google_translate_ok: null,
                    //     $is_baidu_American_pronunciation_ok: null,
                    //     $is_baidu_British_pronunciation_ok: null,
                    //     $is_google_American_pronunciation_ok: null,
                    //     $is_google_British_pronunciation_ok: null,
                    //     $is_cambridge_American_pronunciation_ok: null,
                    //     $is_cambridge_British_pronunciation_ok: null,
                    //     $is_collins_American_pronunciation_ok: null,
                    //     $is_collins_British_pronunciation_ok: null
                    // };
                    var row2insert = [];
                    while (!raw_translation_location[current_location] && en_full.length > current_location) {
                        row2insert.push({
                            $word: en_full[current_location],
                            $is_baidu_translate_ok: null,
                            $is_google_translate_ok: null,
                            $is_baidu_American_pronunciation_ok: null,
                            $is_baidu_British_pronunciation_ok: null,
                            $is_google_American_pronunciation_ok: null,
                            $is_google_British_pronunciation_ok: null,
                            $is_cambridge_American_pronunciation_ok: null,
                            $is_cambridge_British_pronunciation_ok: null,
                            $is_collins_American_pronunciation_ok: null,
                            $is_collins_British_pronunciation_ok: null
                        });
                        ++current_location;
                    }
                    if (en_full.length <= current_location) {
                        var string = '';
                        row2insert.forEach(function (ele) {
                            string += ele.$word + ',' + ele.$is_baidu_translate_ok + ',' + ele.$is_google_translate_ok + ',' + ele.$is_baidu_American_pronunciation_ok + ',' + ele.$is_baidu_British_pronunciation_ok + ',' + ele.$is_google_American_pronunciation_ok + ',' + ele.$is_google_British_pronunciation_ok + ',' + ele.$is_cambridge_American_pronunciation_ok + ',' + ele.$is_cambridge_British_pronunciation_ok + ',' + ele.$is_collins_American_pronunciation_ok + ',' + ele.$is_collins_British_pronunciation_ok + '\n';
                        });
                        fs.write(configuration.fd, string, function (err, written, string) {
                            if (err) {
                                console.error(err);
                                return;
                            }
                            _generate_loop();
                        });
                        return;
                    }
                    var range_start = current_location,
                        range_end;
                    for (var i = 0; i < configuration.rows_per_time; ++i) {
                        ++current_location;
                        if (en_full.length <= current_location || !raw_translation_location[current_location] || raw_translation_location[range_start][0] !== raw_translation_location[current_location][0] || raw_translation_location[current_location][1] - 1 !== raw_translation_location[current_location - 1][1]) {
                            break;
                        }
                    }
                    range_end = current_location;
                    var OFFSET = raw_translation_location[range_start][1];
                    var LIMIT = raw_translation_location[range_end - 1][1] - raw_translation_location[range_start][1] + 1;
                    var all_rows = {
                        raw_translation: null,
                        American_pronunciation: null,
                        British_pronunciation: null,
                    }
                    var wait_all_finish = new Wait_all_finish(3, function () {
                        for (var len = all_rows.raw_translation.length, i = 0; i < len; ++i) {
                            if (all_rows.raw_translation[i].word !== all_rows.American_pronunciation[i].word || all_rows.raw_translation[i].word !== all_rows.British_pronunciation[i].word)
                                debugger;
                            row2insert.push({
                                $word: all_rows.raw_translation[i].word,
                                $is_baidu_translate_ok: all_rows.raw_translation[i].baidu && all_rows.raw_translation[i].baidu[0] === '{' ? true : false,
                                $is_google_translate_ok: all_rows.raw_translation[i].google && all_rows.raw_translation[i].google[0] === '[' ? true : false,
                                $is_baidu_American_pronunciation_ok: all_rows.American_pronunciation[i].baidu && all_rows.American_pronunciation[i].baidu[0] === 0xff ? true : false,
                                $is_baidu_British_pronunciation_ok: all_rows.British_pronunciation[i].baidu && all_rows.British_pronunciation[i].baidu[0] === 0xff ? true : false,
                                $is_google_American_pronunciation_ok: all_rows.American_pronunciation[i].google && all_rows.American_pronunciation[i].google[0] === 0xff ? true : false,
                                $is_google_British_pronunciation_ok: all_rows.British_pronunciation[i].google && all_rows.British_pronunciation[i].google[0] === 0xff ? true : false,
                                $is_cambridge_American_pronunciation_ok: all_rows.American_pronunciation[i].cambridge && all_rows.American_pronunciation[i].cambridge[0] === 0x49 ? true : false,       // consider null[0] type error!
                                $is_cambridge_British_pronunciation_ok: all_rows.British_pronunciation[i].cambridge && all_rows.British_pronunciation[i].cambridge[0] === 0x49 ? true : false,
                                $is_collins_American_pronunciation_ok: all_rows.American_pronunciation[i].collins && all_rows.American_pronunciation[i].collins[0] === 0xff ? true : false,
                                $is_collins_British_pronunciation_ok: all_rows.British_pronunciation[i].collins && all_rows.British_pronunciation[i].collins[0] === 0xff ? true : false
                            });
                        }
                        var string = '';
                        row2insert.forEach(function (ele) {
                            string += ele.$word + ',' + ele.$is_baidu_translate_ok + ',' + ele.$is_google_translate_ok + ',' + ele.$is_baidu_American_pronunciation_ok + ',' + ele.$is_baidu_British_pronunciation_ok + ',' + ele.$is_google_American_pronunciation_ok + ',' + ele.$is_google_British_pronunciation_ok + ',' + ele.$is_cambridge_American_pronunciation_ok + ',' + ele.$is_cambridge_British_pronunciation_ok + ',' + ele.$is_collins_American_pronunciation_ok + ',' + ele.$is_collins_British_pronunciation_ok + '\n';
                        });
    
                        fs.write(configuration.fd, string, function (err, written, string) {
                            if (err) {
                                console.error(err);
                                return;
                            }
                            _generate_loop();
                        });
    
                        // var wait_all_finish = new Wait_all_finish(row2insert.length, _generate_loop);
                        // row2insert.forEach(function (ele) {
                        //     configuration.en_full_log_db.run('INSERT INTO words(word,is_baidu_translate_ok,is_google_translate_ok,is_baidu_American_pronunciation_ok,is_baidu_British_pronunciation_ok,is_google_American_pronunciation_ok,is_google_British_pronunciation_ok,is_cambridge_American_pronunciation_ok,is_cambridge_British_pronunciation_ok,is_collins_American_pronunciation_ok,is_collins_British_pronunciation_ok) VALUES($word,$is_baidu_translate_ok,$is_google_translate_ok,$is_baidu_American_pronunciation_ok,$is_baidu_British_pronunciation_ok,$is_google_American_pronunciation_ok,$is_google_British_pronunciation_ok,$is_cambridge_American_pronunciation_ok,$is_cambridge_British_pronunciation_ok,$is_collins_American_pronunciation_ok,$is_collins_British_pronunciation_ok)',
                        //         ele,
                        //         function (error) {
                        //             if (error) {
                        //                 alert('INSERT INTO word.... error! the error is: ' + error.message);
                        //                 debugger;
                        //             } else {
                        //                 wait_all_finish();
                        //                 if (!window.generate_en_full_log_db_progress) {
                        //                     window.generate_en_full_log_db_progress = 1;
                        //                 } else {
                        //                     ++window.generate_en_full_log_db_progress;
                        //                 }
                        //             }
                        //         }
                        //     );
                        // });
                    });
                    configuration.raw_translation_db[raw_translation_location[range_start][0]].all('SELECT * from raw_translation LIMIT $LIMIT OFFSET $OFFSET', {
                        $LIMIT: LIMIT,
                        $OFFSET: OFFSET
                    }, function (error, rows) {
                        if (error) {
                            alert('SELECT * from raw_translation LIMIT $LIMIT OFFSET $OFFSET error! the error is: ' + error.message);
                            debugger;
                        } else {
                            all_rows.raw_translation = rows;
                            wait_all_finish();
                        }
                    });
                    configuration.pronunciation_db[raw_translation_location[range_start][0]].all('SELECT * from American_pronunciation LIMIT $LIMIT OFFSET $OFFSET', {
                        $LIMIT: LIMIT,
                        $OFFSET: OFFSET
                    }, function (error, rows) {
                        if (error) {
                            alert('SELECT * from American_pronunciation LIMIT $LIMIT OFFSET $OFFSET error! the error is: ' + error.message);
                            debugger;
                        } else {
                            all_rows.American_pronunciation = rows;
                            wait_all_finish();
                        }
                    });
                    configuration.pronunciation_db[raw_translation_location[range_start][0]].all('SELECT * from British_pronunciation LIMIT $LIMIT OFFSET $OFFSET', {
                        $LIMIT: LIMIT,
                        $OFFSET: OFFSET
                    }, function (error, rows) {
                        if (error) {
                            alert('SELECT * from British_pronunciation LIMIT $LIMIT OFFSET $OFFSET error! the error is: ' + error.message);
                            debugger;
                        } else {
                            all_rows.British_pronunciation = rows;
                            wait_all_finish();
                        }
                    });
    
                }
                _generate_loop();
                //     }
                // });
            }
    
        }
     */


    function generate_en_full_log_db() {
        var en_full = [];
        var en_full_log = [];

        configuration.en_full_db.all('SELECT word from words', {}, function (error, rows) {
            if (error) {
                alert('SELECT word from words error! the error is: ' + error.message);
            } else {
                rows.forEach(function (ele) {
                    en_full.push(ele.word);
                    en_full_log.push([]);
                });


                // word                                   
                // is_baidu_translate_ok                  
                // is_google_translate_ok                 
                // is_baidu_American_pronunciation_ok     
                // is_baidu_British_pronunciation_ok      
                // is_google_American_pronunciation_ok    
                // is_google_British_pronunciation_ok     
                // is_cambridge_American_pronunciation_ok 
                // is_cambridge_British_pronunciation_ok  
                // is_collins_American_pronunciation_ok   
                // is_collins_British_pronunciation_ok    
                var len = configuration.raw_translation_db.length;
                var i = -1;

                function _loop() {
                    if (++i >= len) {
                        _generate();
                        return;
                    }
                    var _wait_all_finish = new Wait_all_finish(3, _loop);

                    var index1 = 0;
                    function __loop1() {
                        configuration.raw_translation_db[i].all('SELECT * from raw_translation LIMIT $LIMIT OFFSET $OFFSET', {
                            $LIMIT: configuration.rows_per_time,
                            $OFFSET: index1
                        }, function (error, rows) {
                            if (error) {
                                alert('SELECT * from raw_translation error! the error is: ' + error.message);
                            } else {
                                if (!rows.length) {
                                    _wait_all_finish();
                                    return;
                                }
                                for (let len1 = rows.length, i1 = 0; i1 < len1; ++i1) {
                                    var index_word = en_full.indexOf(rows[i1].word);
                                    en_full_log[index_word][0] = rows[i1].baidu && rows[i1].baidu[0] === '{' ? 1 : 0;
                                    en_full_log[index_word][1] = rows[i1].google && rows[i1].google[0] === '[' ? 1 : 0;
                                    ++configuration._progress;
                                }
                                index1 += configuration.rows_per_time;
                                __loop1();
                            }
                        });
                    }
                    __loop1();


                    var index2 = 0;
                    function __loop2() {
                        configuration.pronunciation_db[i].all('SELECT * from American_pronunciation LIMIT $LIMIT OFFSET $OFFSET', {
                            $LIMIT: configuration.rows_per_time,
                            $OFFSET: index2
                        }, function (error, rows) {
                            if (error) {
                                alert('SELECT * from American_pronunciation error! the error is: ' + error.message);
                            } else {
                                if (!rows.length) {
                                    _wait_all_finish();
                                    return;
                                }
                                for (let len1 = rows.length, i1 = 0; i1 < len1; ++i1) {
                                    var index_word = en_full.indexOf(rows[i1].word);
                                    en_full_log[index_word][2] = rows[i1].baidu && rows[i1].baidu[0] === 0xff ? 1 : 0;
                                    en_full_log[index_word][4] = rows[i1].google && rows[i1].google[0] === 0xff ? 1 : 0;
                                    en_full_log[index_word][6] = rows[i1].cambridge && rows[i1].cambridge[0] === 0x49 ? 1 : 0;
                                    en_full_log[index_word][8] = rows[i1].collins && rows[i1].collins[0] === 0xff ? 1 : 0;
                                    ++configuration._progress;
                                }
                                index2 += configuration.rows_per_time;
                                __loop2();
                            }
                        });
                    }
                    __loop2();


                    var index3 = 0;
                    function __loop3() {
                        configuration.pronunciation_db[i].all('SELECT * from British_pronunciation LIMIT $LIMIT OFFSET $OFFSET', {
                            $LIMIT: configuration.rows_per_time,
                            $OFFSET: index3
                        }, function (error, rows) {
                            if (error) {
                                alert('SELECT * from British_pronunciation error! the error is: ' + error.message);
                            } else {
                                if (!rows.length) {
                                    _wait_all_finish();
                                    return;
                                }
                                for (let len1 = rows.length, i1 = 0; i1 < len1; ++i1) {
                                    var index_word = en_full.indexOf(rows[i1].word);
                                    en_full_log[index_word][3] = rows[i1].baidu && rows[i1].baidu[0] === 0xff ? 1 : 0;
                                    en_full_log[index_word][5] = rows[i1].google && rows[i1].google[0] === 0xff ? 1 : 0;
                                    en_full_log[index_word][7] = rows[i1].cambridge && rows[i1].cambridge[0] === 0x49 ? 1 : 0;
                                    en_full_log[index_word][9] = rows[i1].collins && rows[i1].collins[0] === 0xff ? 1 : 0;
                                    ++configuration._progress;
                                }
                                index3 += configuration.rows_per_time;
                                __loop3();
                            }
                        });
                    }
                    __loop3();
                }
                _loop();
            }
        });


        function _generate() {
            var string = '';
            debugger;
            en_full.forEach(function (word, index) {

                string += word + ','
                    + (en_full_log[index][0] ? 1 : 0) + ','
                    + (en_full_log[index][1] ? 1 : 0) + ','
                    + (en_full_log[index][2] ? 1 : 0) + ','
                    + (en_full_log[index][3] ? 1 : 0) + ','
                    + (en_full_log[index][4] ? 1 : 0) + ','
                    + (en_full_log[index][5] ? 1 : 0) + ','
                    + (en_full_log[index][6] ? 1 : 0) + ','
                    + (en_full_log[index][7] ? 1 : 0) + ','
                    + (en_full_log[index][8] ? 1 : 0) + ','
                    + (en_full_log[index][9] ? 1 : 0) + '\n';
            });


            fs.open('P:/temp_conemu/data.json', 'a+', function (err, fd) {
                if (err) {
                    console.error(err);
                    debugger;
                    return;
                }
                fs.write(fd, JSON.stringify(en_full_log), function (err, written, string) {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    fs.close(fd, function () {
                        console.log('all finished!');
                    });
                });
            });

            fs.write(configuration.fd, string, function (err, written, string) {
                if (err) {
                    console.error(err);
                    return;
                }
                fs.close(configuration.fd, function () {
                    console.log('all finished!');
                });
            });
        }

    }
    function generate_data() {
        debugger;
        var data = [];
        var buffer = fs.readFileSync('database/translator/log/data_log.json');
        var array = JSON.parse(String(buffer));
        configuration.en_full_db.all('SELECT word from words', {}, function (error, rows) {
            if (error) {
                alert('SELECT word from words error! the error is: ' + error.message);
            } else {
                rows.forEach(function (ele, index) {
                    var word = [ele.word,
                    array[index][0] ? 1 : 0, 1, 0,
                    array[index][1] ? 1 : 0, 1, 0,
                    array[index][2] ? 1 : 0, 1, 0,
                    array[index][3] ? 1 : 0, 1, 0,
                    array[index][4] ? 1 : 0, 1, 0,
                    array[index][5] ? 1 : 0, 1, 0,
                    array[index][6] ? 1 : 0, 1, 0,
                    array[index][7] ? 1 : 0, 1, 0,
                    array[index][8] ? 1 : 0, 1, 0,
                    array[index][9] ? 1 : 0, 1, 0,
                    ];
                    data.push(word);
                });
                fs.writeFileSync('database/translator/log', JSON.stringify(data));
            }
        });

    }
    function generate_empty_data() {
        var data = [];
        const en_full = JSON.parse(String(fs.readFileSync('database/words/words_conbine_with_en_full/words_conbine_with_en_full.json')));
        en_full.forEach(function (word) {
            var word = [word, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0];
            data.push(word);
        });
        fs.writeFileSync('database/words/words_conbine_with_en_full/words_conbine_with_en_full_log.json', JSON.stringify(data));
    }

    module.exports = {
        configuration: configuration,
        start_merge: start_merge,
        generate_en_full_log_db: generate_en_full_log_db,
        generate_data: generate_data,
        generate_empty_data: generate_empty_data,
        count: count,
        init: init
    }
})(global);





