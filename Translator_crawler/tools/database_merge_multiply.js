(function (global) {
    const path = require('path');
    const fs = require('fs');
    const database = require('../database.js');
    const configuration = {
        directories: [
            // path.join('/translator/en_full/new_data'),
            // path.join('/translator/en_full/new_data_baidu'),
            // path.join('/translator/stardict_word_without_en_full_google_synonym/translator0/new_data'),
            // path.join('/translator/stardict_word_without_en_full_google_synonym/translator1/new_data'),
            // path.join('/translator/stardict_word_without_en_full_google_synonym/translator2/new_data'),
            path.join('database/translator/merged/merged'),
            path.join('database/translator/stardict_word_without_en_full_google_synonym/translator3/new_data'),
        ],
        max_index: 99,

        files: [],
        file_names: [
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
        location: {},
        // en_full_file_path: path.join(__dirname, '../../database/distribute/words/distribute_words.json'),
        // en_full_object_file_path: path.join(__dirname, '../../database/distribute/words/distribute_words_object.json'),
               en_full_file_path: path.join('database/translator/words/output/merged.json'),
               en_full_object_file_path: path.join('database/translator/words/output/merged_object.json'),
        // words_combine_with_en_full_file_path: path.join(__dirname, '../../database/words/words_combine_with_en_full.json'),
        // words_combine_with_en_full_object_file_path: path.join(__dirname, '../../database/words/words_combine_with_en_full_object.json'),
        en_full: null,
        en_full_object: null,
        items_per_time: 1000,
    }

    function init() {
               for (var directory of configuration.directories) {
                   for (var i = 0; i < configuration.max_index; ++i) {
                       if (fs.existsSync(directory + i)) {
                           var file = {};
                           configuration.file_names.forEach(function (name) {
                               file[name + '_index'] = fs.readFileSync(path.join(directory + i, name + '.index'), {
                                   encoding: 'utf8'
                               });
                               file[name + '_data'] = fs.openSync(path.join(directory + i, name + '.data'), 'r');
                           });
                           configuration.files.push(file);
                       }
                   }
               }

        // var directory = 'database/data';
        // var file = {};
        // configuration.file_names.forEach(function (name) {
        //     file[name + '_index'] = fs.readFileSync(path.join(directory, name + '_sorted.index'), {
        //         encoding: 'utf8'
        //     });
        //     file[name + '_data'] = fs.openSync(path.join(directory, name + '.data'), 'r');
        // });
        // configuration.files.push(file);

        configuration.file_names.forEach(function (name) {
            configuration.location[name] = [];
        });
        configuration.en_full = JSON.parse(fs.readFileSync(configuration.en_full_file_path, {
            encoding: 'utf8'
        }));
        // configuration.en_full = configuration.en_full.concat(JSON.parse(fs.readFileSync(configuration.words_combine_with_en_full_file_path, { encoding: 'utf8' })));
        configuration.en_full_object = JSON.parse(fs.readFileSync(configuration.en_full_object_file_path, {
            encoding: 'utf8'
        }));
        // Object.assign(configuration.en_full_object, JSON.parse(fs.readFileSync(configuration.words_combine_with_en_full_object_file_path, { encoding: 'utf8' })));

        // var en_full_object = {};
        // for (var i = 0, len = configuration.en_full.length; i < len; ++i) {
        //     en_full_object[configuration.en_full[i]] = i;
        // }
        // fs.writeFileSync(configuration.en_full_object_file_path, JSON.stringify(en_full_object));

        database.init_database();
    }

    function generate() {
        var en_full_len = configuration.en_full.length;
        configuration.files.forEach(function (file, index) {
            configuration.file_names.forEach(function (name) {
                var words = file[name + '_index'].split('\n');
                words.pop();
                words.forEach(function (word, i, array) {
                    var word_text, word_offset, word_length, temp_location;
                    temp_location = word.length;
                    word_offset = word_length = word.lastIndexOf(' ', temp_location - 1);
                    word_length = +word.substring(word_length + 1, temp_location);
                    temp_location = word_offset;
                    word_text = word_offset = word.lastIndexOf(' ', temp_location - 1);
                    word_offset = +word.substring(word_offset + 1, temp_location);
                    temp_location = word_text;
                    word_text = word.substring(0, temp_location);

                    var location = configuration.en_full_object[word_text];
                    if (!location)
                        debugger;
                    configuration.location[name][location] = [index, word_offset, word_length];
                });
                console.log('finish ' + name + ' reading!');
            });
        });

        // fs.writeFileSync(path.join(__dirname, '../../database/translator_new/temp_location.json'), JSON.stringify(configuration.location));
        // configuration.location = JSON.parse(fs.readFileSync(path.join(__dirname, '../../database/translator_new/temp_location.json')));
        function merge(file_name) {
            var location = 0;
            var progress = 0;
            while (true) {
                while (!configuration.location[file_name][location] && location < en_full_len)
                    ++location;

                if (location >= en_full_len)
                    break;

                if (location > progress * 1e4)
                    ++progress && console.log(file_name + ' progress: ' + progress);

                var range_start = location,
                    range_end;
                for (var i = 0; i < configuration.items_per_time; ++i) {
                    ++location;
                    if (en_full_len <= location ||
                        !configuration.location[file_name][location] ||
                        configuration.location[file_name][range_start][0] !== configuration.location[file_name][location][0] ||
                        configuration.location[file_name][location - 1][1] + configuration.location[file_name][location - 1][2] !== configuration.location[file_name][location][1]) {
                        break;
                    }
                }
                range_end = location;
                var offset = configuration.location[file_name][range_start][1]
                var total_length = 0;
                for (var i = range_start; i < range_end; ++i) {
                    total_length += configuration.location[file_name][i][2];
                }
                var buffer = new Buffer(total_length);
                fs.readSync(configuration.files[configuration.location[file_name][range_start][0]][file_name + '_data'], buffer, 0, total_length, offset);

                var buffer_location = 0;
                for (var i = range_start; i < range_end; ++i) {
                    database['_storage_' + file_name + '_data'](configuration.en_full[i], buffer.subarray(buffer_location, buffer_location + configuration.location[file_name][i][2]));
                    buffer_location += configuration.location[file_name][i][2];
                }
            }
            database['_storage_' + file_name + '_data_flush']();
            database['_storage_' + file_name + '_data_close']();
        }

        // merge('baidu_raw_translation');
        configuration.file_names.forEach(function (name) {
            console.log('start ' + name + ' merge!');
            merge(name);
        });
    }
    module.exports = {
        configuration: configuration,
        init: init,
        generate: generate,
    }
})(global);
