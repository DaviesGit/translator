(function (global) {
    const path = require('path');
    const fs = require('fs');
    // const database = require('../database.js');
    const names = [
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
        ];

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

    function generate_log() {
        var all_words = JSON.parse(fs.readFileSync('database/translator/words/output/merged.json', {
            encoding: 'utf8'
        }));
        var all_words_object = JSON.parse(fs.readFileSync('database/translator/words/output/merged_object.json', {
            encoding: 'utf8'
        }));
        var log = [];
        all_words.forEach(function (word) {
            var word = [word, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0];
            log.push(word);
        });
        var file = [];
        names.forEach(function (name) {
            var text=fs.readFileSync(path.join('database/translator/merged/merged/', name + '.index'), {
                encoding: 'utf8'
            });
            var words =text.split('\n');
            words.pop();
            var json_words = {};
            words.forEach(function (word, index, array) {
                var word_text, word_offset, word_length, temp_location;
                temp_location = word.length;
                word_offset = word_length = word.lastIndexOf(' ', temp_location - 1);
                word_length = +word.substring(word_length + 1, temp_location);
                temp_location = word_offset;
                word_text = word_offset = word.lastIndexOf(' ', temp_location - 1);
                word_offset = +word.substring(word_offset + 1, temp_location);
                temp_location = word_text;
                word_text = word.substring(0, temp_location);
                json_words[word_text] = [word_offset, word_length];
            });
            file.push(json_words);
        });
        for (var i = 0, len = file.length; i < len; ++i) {
            for (word in file[i]) {
                var index = all_words_object[word];
                log[index][3 * i + 1] = 1;
            }
        }
        fs.writeFileSync('database/translator/merged/merged_log.txt', toStorageString(log));

    }


    module.exports = {
        generate_log: generate_log,
    }
})(global);
