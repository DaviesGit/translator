(function (global) {
    path = require('path');
    path.join(__dirname, '../database/translator/log.db')
    const sqlite3 = require(path.join(__dirname, '../node-sqlite3-4.0.2')).verbose();
    const en_full_db = path.join(__dirname, '../en_full.db');
    const word_index_file = path.join(__dirname, '../Translator4.55.12/word_index.txt');

    const fs = require('fs');
    let word_index;
    const database = require('./database.js');
    const translator = require('./translate_library.js');
    const words_db = new sqlite3.Database(en_full_db, sqlite3.OPEN_READONLY, function (error) {
        if (error) {
            configuration.is_status_ok = false;
        } else {
            configuration.is_status_ok = true;
        }
    });
    const log_db = new sqlite3.Database(path.join(__dirname, '../database/translator/log.db'), sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, function (error) {
        if (error) {

        } else {
            log_db.serialize(function () {
                log_db.run('CREATE TABLE IF NOT EXISTS logs (word TEXT, is_ok BOOLEAN, details TEXT)', function (error) {
                    if (error) {

                    } else {

                    }

                })
            });
        }
    });
    const configuration = {
        is_status_ok: false,
        translate_interval: 5 * 1000
    }
    const start_translate = function (callback) {
        if (!configuration.is_status_ok) {
            return false;
        }
        if ('function' !== typeof callback) {
            callback = function () { };
        }
        translator.init(function (error) {
            if (error) {
                callback(error);
            } else {
                database.init_database(function (error) {
                    if (error) {
                        callback(error);
                    } else {
                        function get_next_word(callback) {
                            if ('function' !== typeof callback) {
                                callback = function () { };
                            }
                            function get_next_word_index() {
                                var index;
                                if (!word_index) {
                                    word_index = +fs.readFileSync(word_index_file, 'utf8');
                                    word_index = word_index ? --word_index : 0;
                                }
                                index = word_index;
                                ++word_index;
                                fs.writeFileSync(word_index_file, '' + word_index);
                                return index;
                            }
                            var index = get_next_word_index();
                            words_db.get('SELECT word from words LIMIT 1 OFFSET $index', {
                                $index: index
                            }, function (error, row) {
                                if (error) {
                                    callback({
                                        error: 'SELECT word from words LIMIT 1 OFFSET $index failed! error is: ' + error
                                    });
                                } else {
                                    if (!row) {
                                        callback({
                                            error: 'not find row specified!'
                                        });
                                    } else {
                                        callback({
                                            word: row.word
                                        })
                                    }
                                }
                            });
                        }
                        function store_result(word, result) {
                            database.store_raw_translate_result(word,
                                result.translation.google_result ? JSON.stringify(result.translation.google_result) : null,
                                result.translation.baidu_result ? JSON.stringify(result.translation.baidu_result) : null,
                                function (error) {
                                    if (error) {
                                        callback({
                                            error: 'database.store_raw_translate_result word: (' + word + ') failed!'
                                        })
                                    } else {
                                    }
                                });
                            database.store_pronunciation(word, {
                                American: {
                                    google_pronunciation: result.pronunciation.google_result.American,
                                    baidu_pronunciation: result.pronunciation.baidu_result.American,
                                    cambridge_pronunciation: result.pronunciation.cambridge_result.American,
                                    collins_pronunciation: result.pronunciation.collins_result.American
                                },
                                British: {
                                    google_pronunciation: result.pronunciation.google_result.British,
                                    baidu_pronunciation: result.pronunciation.baidu_result.British,
                                    cambridge_pronunciation: result.pronunciation.cambridge_result.British,
                                    collins_pronunciation: result.pronunciation.collins_result.British
                                }
                            }, function (error) {
                                if (error) {
                                    callback({
                                        error: 'database.store_pronunciation word: (' + word + ') failed!'
                                    })
                                } else {
                                }
                            });
                        }
                        function calculate_status(result) {
                            var _result = {
                                is_ok: false,
                                translation: {
                                    google_result: 'object' === typeof result.translation.google_result,
                                    baidu_result: 'object' === typeof result.translation.baidu_result
                                },
                                pronunciation: {
                                    google_result:
                                    {
                                        American: !!(result.pronunciation.google_result.American) && (60 !== result.pronunciation.google_result.American[0]),
                                        British: !!(result.pronunciation.google_result.British) && (60 !== result.pronunciation.google_result.British[0])
                                    },
                                    baidu_result:
                                    {
                                        American: !!(result.pronunciation.baidu_result.American) && (60 !== result.pronunciation.baidu_result.American[0]),
                                        British: !!(result.pronunciation.baidu_result.British) && (60 !== result.pronunciation.baidu_result.British[0])
                                    },
                                    cambridge_result:
                                    {
                                        American: !!(result.pronunciation.cambridge_result.American) && (60 !== result.pronunciation.cambridge_result.American[0]),
                                        British: !!(result.pronunciation.cambridge_result.British) && (60 !== result.pronunciation.cambridge_result.British[0])
                                    },
                                    collins_result:
                                    {
                                        American: !!(result.pronunciation.collins_result.American) && (60 !== result.pronunciation.collins_result.American[0]),
                                        British: !!(result.pronunciation.collins_result.British) && (60 !== result.pronunciation.collins_result.British[0])
                                    }
                                }
                            };
                            if (_result.translation.google_result &&
                                _result.translation.baidu_result &&
                                _result.pronunciation.google_result.American &&
                                _result.pronunciation.google_result.British &&
                                _result.pronunciation.baidu_result.American &&
                                _result.pronunciation.baidu_result.British &&
                                _result.pronunciation.cambridge_result.American &&
                                _result.pronunciation.cambridge_result.British &&
                                _result.pronunciation.collins_result.American &&
                                _result.pronunciation.collins_result.British) {
                                _result.is_ok = true;
                            }
                            return _result;
                        }
                        function _loop() {
                            setTimeout(loop, configuration.translate_interval);
                        }
                        function loop() {
                            get_next_word(function (result) {
                                if (result.error) {
                                    callback(result);
                                    _loop();
                                } else {
                                    var word = result.word;
                                    var _result = {
                                        translation: {},
                                        pronunciation: {}
                                    };
                                    var total_thread = 6,
                                        wait_count = 0;
                                    function wait_all_finish() {
                                        ++wait_count;
                                        if (wait_count >= total_thread) {
                                            var status = calculate_status(_result);
                                            status.word = word;
                                            if (!status.is_ok) {
                                                console.error(status);
                                            } else {
                                                console.log(status);
                                            }
                                            log_db.run('INSERT INTO logs(word, is_ok, details) VALUES ($word, $is_ok, $details)', {
                                                $word: word,
                                                $is_ok: status.is_ok,
                                                $details: JSON.stringify(status)
                                            }, function (error) {
                                                if (error) {
                                                    callback('storage log error! the error is: ' + error);
                                                }
                                            })
                                            store_result(word, _result);
                                            _loop();
                                        }
                                    }
                                    translator.get_baidu_translate(word, function (response) {
                                        if (!response) {
                                            _result.translation.baidu_result = null;
                                        } else {
                                            _result.translation.baidu_result = response;
                                        }
                                        wait_all_finish();
                                    });
                                    translator.get_google_translate(word, function (response) {
                                        if (!response) {
                                            _result.translation.google_result = null;
                                        } else {
                                            _result.translation.google_result = response;
                                        }
                                        wait_all_finish();
                                    });
                                    translator.get_baidu_pronunciation(word, function (result) {
                                        _result.pronunciation.baidu_result = result.buffer;
                                        wait_all_finish();
                                    });
                                    translator.get_google_pronunciation(word, function (result) {
                                        _result.pronunciation.google_result = result.buffer;
                                        wait_all_finish();
                                    });
                                    translator.get_cambridge_pronunciation(word, function (result) {
                                        _result.pronunciation.cambridge_result = result.buffer;
                                        wait_all_finish();
                                    });
                                    translator.get_collins_pronunciation(word, function (result) {
                                        _result.pronunciation.collins_result = {
                                            American: result.buffer.American ? result.buffer.American : result.buffer.default,
                                            British: result.buffer.British ? result.buffer.British : result.buffer.default,
                                        };
                                        wait_all_finish();
                                    });
                                }
                            });
                        }
                        loop();
                    }
                });
            }
        });

    }
    module.exports = {
        start_translate: start_translate
    };
})(global);