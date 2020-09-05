(function () {
    const fs = require('fs');
    const path = require('path');
    const configuration = {
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
        files: [],
        base_path: '/translator/merged'
    }
    function generate_index_json() {
        configuration.file_names.forEach(function (file_name) {
            configuration.files[file_name + '_index'] = fs.readFileSync(path.join( configuration.base_path + '/' + file_name + '.index'), { encoding: 'utf8' });
            var words = configuration.files[file_name + '_index'].split('\n');
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
            fs.writeFileSync(path.join(configuration.base_path + '/' + file_name + '.json'), JSON.stringify(json_words));
            console.log(file_name + ' has been finished!');
        });
    }

    module.exports = {
        generate_index_json: generate_index_json,
    }
})();