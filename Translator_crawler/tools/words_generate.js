(function () {
    'use strict';
    const path = require('path');
    const fs = require('fs');
    const database_utility = require('./database_utility.js');



    function generate_words_array() {
        function get_word4all_num(line) {
            var start = line.indexOf(' ') + 1;
            var end = line.lastIndexOf(' '),
                end = line.lastIndexOf(' ', end - 1);
            return line.slice(start, end);
        }


        //        var text = fs.readFileSync('database/words/2.all.num/all.num', {
        //            encoding: 'utf8'
        //        });
        //        var words = text.split('\n');
        //        words.shift();
        //        words.pop();
        //        var processed_words = [];
        //        for (var line of words) {
        //            processed_words.push(get_word4all_num(line));
        //        }
        //        fs.writeFileSync('database/words/2.all.num/all.num.json', JSON.stringify(processed_words));
        //        database_utility.array2object('database/words/2.all.num/all.num.json', 'database/words/2.all.num/all.num_object.json');
        //        

        var text = fs.readFileSync('database/words/9.words.txt/words.txt', {
            encoding: 'utf8'
        });
        var words = text.split('\n');
        words.pop();
        var processed_words = [];
        for (var line of words) {
            processed_words.push(line);
        }
        fs.writeFileSync('database/words/9.words.txt/words.json', JSON.stringify(processed_words));
        database_utility.array2object('database/words/9.words.txt/words.json', 'database/words/9.words.txt/words_object.json');

    }

    function is_exist(word, object) {
        if ('undefined' === typeof object[word]) {
            return false;
        }
        return true;
    }


    function merge_all_words() {
        const BASE_PATH = '/translator/words';
        var files = [
//            '1.en_full/en_full',
//            '2.all.num/all.num',
            '3.20k.txt/20k',
            '4.google_synonym/google_synonym',
//            '5.stardict/stardict',
//            '6.words.txt/words',
//            '7.words3.txt/words3',
//            '8.wordlist.txt/wordlist',
//            '9.words.txt/words',
        ];
        var all_words = [];
        for (var file of files) {
            all_words.push([
                JSON.parse(fs.readFileSync(path.join(BASE_PATH, file + '.json'), {
                    encoding: 'utf8'
                }))
//                , JSON.parse(fs.readFileSync(path.join(BASE_PATH, file + '_object.json'), {
                 //                    encoding: 'utf8'
                 //                }))
            ]);
        }
        var words = [];
        var words_object = {};
        var words_object_length = 0;
        for (var word of all_words) {
            var count = 0;
            for (var w of word[0]) {
                if (!words_object[w]) {
                    ++count;
                    words.push(w);
                    words_object[w] = words_object_length++;
                }
            }
            console.log('valid word: ', count);
        }
        fs.writeFileSync('database/words/merged.json', JSON.stringify(words));
        fs.writeFileSync('database/words/output/merged_object.json', JSON.stringify(words_object));

    }

    function shuffle(input, output) {
        var input_array = JSON.parse(fs.readFileSync(input, {
            encoding: 'utf8'
        }))
        for (var i = 0, len = input_array.length; i < len; ++i) {
            var index = Math.floor(Math.random() * len);
            var word = input_array[i];
            input_array[i] = input_array[index];
            input_array[index] = word;
        }
        var output_array = input_array;
        fs.writeFileSync(output, JSON.stringify(output_array));
        database_utility.array2object(output, 'database/words/output/merged_shuffle_object.json');
    }


    module.exports = {
        generate_words_array: generate_words_array,
        merge_all_words: merge_all_words,
        shuffle: shuffle,
    }
})();
