(function () {
    'use strict';
    const path = require('path');
    const fs = require('fs');
    const database = require('../database.js');
    const database_get = require('../database_get.js');
    // const sqlite3 = require(path.join(__dirname, '../../node-sqlite3-4.0.2')).verbose();

    const configuration = {
        en_full_file_path: path.join(__dirname, '../../database/words/en_full.json'),
        en_full_object_file_path: path.join(__dirname, '../../database/words/en_full_object.json'),
        stardict_file_path: path.join(__dirname, '../../database/words/stardict.json'),
        stardict_object_file_path: path.join(__dirname, '../../database/words/stardict_object.json'),
        google_synonym_file_path: path.join(__dirname, '../../database/words/google_synonym.json'),
        google_synonym_object_file_path: path.join(__dirname, '../../database/words/google_synonym_object.json'),
        words_conbine_with_en_full_file_path: path.join(__dirname, '../../database/words/words_conbine_with_en_full/words_conbine_with_en_full.json'),
        words_conbine_with_en_full_object_file_path: path.join(__dirname, '../../database/words/words_conbine_with_en_full/words_conbine_with_en_full_object.json'),
        en_full: null,
        en_full_object: null,
        items_per_time: 1000,
    }

    const progress = {};

    function get_all_words(db_path, json_path) {
        progress.get_all_words = 0;
        var words = [];
        var database = new sqlite3.Database(db_path, sqlite3.OPEN_READWRITE, function (error) {
            if (error) {
                console.log('connect database failed! error is: ' + error.message);
            } else {
                database.all('SELECT word from stardict', {}, function (error, rows) {
                    if (error) {
                        alert('SELECT word from words error! the error is: ' + error.message);
                    } else {
                        rows.forEach(function (ele) {
                            words.push(ele.word);
                            ++progress.get_all_words;
                        });
                        fs.writeFileSync(json_path, JSON.stringify(words));
                        alert('get_all_words all ok!');
                    }
                });
            }
        });
    }

    function is_valid(word) {
        return /^[\x20\x27\x2D\x2E\x30-\x39\x41-\x5A\x5F\x61-\x7A]+$/.test(word);
    }

    function get_google_synonym(file_directory) {
        var valid_synonym = {};
        var invalid_synonym = {};
        var en_full = JSON.parse(fs.readFileSync(configuration.en_full_file_path, {
            encoding: 'utf8'
        }));
        var en_full_object = JSON.parse(fs.readFileSync(configuration.en_full_object_file_path, {
            encoding: 'utf8'
        }));
        var en_full_length = en_full.length;
        database_get.init();

        function get_all_synonyms(word) {
            var synonyms = [];
            if (word && word[11]) {
                word[11].forEach(function (synonym) {
                    synonym[1].forEach(function (synonym) {
                        synonyms = synonyms.concat(synonym[0]);
                    });
                });
            }
            if (word && word[1]) {
                word[1].forEach(function (synonym) {
                    synonym[2].forEach(function (synonym) {
                        synonyms = synonyms.concat(synonym[1]);
                    });
                });
            }
            return synonyms;
        }

        function _is_exist(word) {
            if ('undefined' === typeof en_full_object[word]) {
                return false;
            }
            return true;
        }

        progress.synonym = 0;
        progress.synonym_exist = 0;
        for (var i = 0; i < en_full_length; ++i) {
            var word = database_get.get_google_raw_translation(en_full[i]);
            var synonyms = get_all_synonyms(word);
            synonyms.forEach(function (synonym) {
                if (!_is_exist(synonym)) {
                    if (is_valid(synonym)) {
                        valid_synonym[synonym] ? (++valid_synonym[synonym]) : (valid_synonym[synonym] = 1);
                    } else {
                        var phrases = make_phrase_valid(synonym);
                        phrases.forEach(function (phrase) {
                            if (!_is_exist(phrase)) {
                                if (is_valid(phrase)) {
                                    valid_synonym[phrase] ? (++valid_synonym[phrase]) : (valid_synonym[phrase] = 1);
                                } else {
                                    invalid_synonym[phrase] ? (++invalid_synonym[phrase]) : (invalid_synonym[phrase] = 1);
                                }
                            }
                        });
                    }
                } else {
                    ++progress.synonym_exist;
                }
            });
            ++progress.synonym;
        }
        fs.writeFileSync(path.join(file_directory, './valid_synonym.json'), JSON.stringify(valid_synonym));
        fs.writeFileSync(path.join(file_directory, './invalid_synonym.json'), JSON.stringify(invalid_synonym));
    }

    function make_phrase_valid(phrase) {
        function make_valid(phrase) {
            var valid = [],
                _temp_valid = [];

            function remove_slash(phrase) {
                var phrases = [];
                _temp_phrases = '';
                var result = phrase.match(/[\w\/'-]+\/[\w\/'-]+/);
                if (!result) {
                    return [phrase];
                }
                var words = result[0].split('\/');
                words.forEach(function (word) {
                    _temp_phrases = phrase.replace(result[0], word);
                    phrases = phrases.concat(remove_slash(_temp_phrases));
                });
                return phrases;
            }

            function remove_bracket(phrase) {
                var phrases = [],
                    _temp_phrases = '';
                var result = phrase.match(/\([\w '-]+\)/);
                if (!result) {
                    return [phrase];
                }
                _temp_phrases = phrase.replace(result[0], '').trim().replace(/\s+/g, ' ');
                phrases = phrases.concat(remove_bracket(_temp_phrases));
                _temp_phrases = phrase.replace(/\(/, '').replace(/\)/, '').trim().replace(/\s+/g, ' ');
                phrases = phrases.concat(remove_bracket(_temp_phrases));
                return phrases;
            }
            _temp_valid = remove_slash(phrase);
            _temp_valid.forEach(function (phrase) {
                valid = valid.concat(remove_bracket(phrase));
            });
            return valid;
        }
        return make_valid(phrase);
    }

    function array2object(array_file, object_file) {
        var array = JSON.parse(fs.readFileSync(array_file, {
            encoding: 'utf8'
        }));
        var object = {};
        for (var i = 0, len = array.length; i < len; ++i) {
            object[array[i]] = i;
        }
        fs.writeFileSync(object_file, JSON.stringify(object));
    }

    function is_exist(word, object) {
        if ('undefined' === typeof object[word]) {
            return false;
        }
        return true;
    }

    function exist_test() {
        var en_full = JSON.parse(fs.readFileSync(configuration.en_full_file_path, {
            encoding: 'utf8'
        }));
        // var en_full_object = JSON.parse(fs.readFileSync(configuration.en_full_object_file_path, { encoding: 'utf8' }));

        // var stardict = JSON.parse(fs.readFileSync(configuration.stardict_file_path, { encoding: 'utf8' }));
        var stardict_object = JSON.parse(fs.readFileSync(configuration.stardict_object_file_path, {
            encoding: 'utf8'
        }));

        var none_exist = [];
        en_full.forEach(function (word) {
            if (!is_exist(word, stardict_object)) {
                none_exist.push(word);
            }
        });
        console.log(none_exist);
    }

    function other_test() {

        // var en_full = JSON.parse(fs.readFileSync(configuration.en_full_file_path, { encoding: 'utf8' }));
        // var en_full_object = JSON.parse(fs.readFileSync(configuration.en_full_object_file_path, { encoding: 'utf8' }));

        // var stardict = JSON.parse(fs.readFileSync(configuration.stardict_file_path, { encoding: 'utf8' }));
        // var stardict_object = JSON.parse(fs.readFileSync(configuration.stardict_object_file_path, { encoding: 'utf8' }));

        // var words_conbine_with_en_full = JSON.parse(fs.readFileSync(configuration.words_conbine_with_en_full_file_path, { encoding: 'utf8' }));
        // var words_conbine_with_en_full_object = JSON.parse(fs.readFileSync(configuration.words_conbine_with_en_full_object_file_path, { encoding: 'utf8' }));

        // var valid_google_synonym = JSON.parse(fs.readFileSync('database/words/google_synonym/valid_synonym.json', { encoding: 'utf8' }));

        // var google_synonym = valid_google_synonym,
        //     _google_synonym = [],
        //     __google_synonym = [],
        //     google_synonym_object = {};

        // for (var prop in google_synonym) {
        //     _google_synonym[google_synonym[prop]] ? _google_synonym[google_synonym[prop]].push(prop) : (_google_synonym[google_synonym[prop]] = [prop]);
        // }
        // _google_synonym.reverse();
        // _google_synonym.forEach(function (synonym) {
        //     __google_synonym = __google_synonym.concat(synonym);
        // });
        // __google_synonym.forEach(function (synonym, index) {
        //     google_synonym_object[synonym] = index;
        // });

        // fs.writeFileSync('database/words/google_synonym.json', JSON.stringify(__google_synonym));
        // fs.writeFileSync('database/words/google_synonym_object.json', JSON.stringify(google_synonym_object));

        // var words = [];
        // en_full.forEach(function (word) {
        //     if (word.length > 30) {
        //         words.push(word);
        //     }
        // });
        // console.log(words_conbine_with_en_full.length);

        // var google_synonym = JSON.parse(fs.readFileSync('database/words/words_conbine_with_en_full/google_synonym.json', { encoding: 'utf8' }));
        // var stardict_mangle = JSON.parse(fs.readFileSync('database/words/words_conbine_with_en_full/stardict_mangle.json', { encoding: 'utf8' }));

        // stardict_mangle = google_synonym.concat(stardict_mangle);

        // fs.writeFileSync('database/words/words_conbine_with_en_full/words_conbine_with_en_full.json', JSON.stringify(stardict_mangle));

        // var words_conbine_with_en_full_object = {};
        // stardict_mangle.forEach(function (word, index) {
        //     words_conbine_with_en_full_object[word] = index;
        // });

        // fs.writeFileSync('database/words/words_conbine_with_en_full/words_conbine_with_en_full_object.json', JSON.stringify(words_conbine_with_en_full_object));

    }

    function generate_stardict_word() {
        // var en_full = JSON.parse(fs.readFileSync(configuration.en_full_file_path, { encoding: 'utf8' }));
        var en_full_object = JSON.parse(fs.readFileSync(configuration.en_full_object_file_path, {
            encoding: 'utf8'
        }));
        var stardict = JSON.parse(fs.readFileSync(configuration.stardict_file_path, {
            encoding: 'utf8'
        }));
        // var stardict_object = JSON.parse(fs.readFileSync(configuration.stardict_object_file_path, { encoding: 'utf8' }));
        // var google_synonym = JSON.parse(fs.readFileSync(configuration.google_synonym_file_path, { encoding: 'utf8' }));
        var google_synonym_object = JSON.parse(fs.readFileSync(configuration.google_synonym_object_file_path, {
            encoding: 'utf8'
        }));

        var _stardict = [],
            _stardict_mangle = [];
        stardict.forEach(function (word) {
            if (!is_exist(word, en_full_object) && !is_exist(word, google_synonym_object)) {
                _stardict.push(word);
            }
        });
        fs.writeFileSync('database/words/stardict_word_without_en_full&google_synonym/stardict.json', JSON.stringify(_stardict));

        // var status = new Array[_stardict.length];
        // status.fill(0);
        // var current_length = _stardict.length;
        // function get_index(_index) {
        //     var count = 0,
        //         index = 0;
        //     while (_index > count) {
        //         while (status[++index]);
        //         ++count;
        //     }
        //     status[index] = 1;
        //     --current_length;
        //     return index;
        // }

        progress._stardict_mangle = 0;
        current = 0;
        while (_stardict.length) {
            var index = Math.floor(Math.random() * _stardict.length);
            var word = _stardict.splice(index, 1);
            _stardict_mangle.push(word[0]);
            ++progress._stardict_mangle;
            if (progress._stardict_mangle / 10000 >= current) {
                console.log(progress._stardict_mangle);
                ++current;
            }
        }
        fs.writeFileSync('database/words/stardict_word_without_en_full&google_synonym/stardict_mangle.json', JSON.stringify(_stardict_mangle));
    }



    module.exports = {
        get_all_words: get_all_words,
        get_google_synonym: get_google_synonym,
        array2object: array2object,
        exist_test: exist_test,
        other_test: other_test,
        generate_stardict_word: generate_stardict_word,
        progress: progress,
    }
})();
