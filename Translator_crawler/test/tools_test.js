var database_merge = require('./tools/database_merge.js');
database_merge.init(function () {
    if (database_merge.configuration.is_db_initialized) {
        database_merge.start_merge();
    }
});


var begin = database_merge.configuration.progress.pronunciation.baidu_American.all +
    database_merge.configuration.progress.pronunciation.google_American.all +
    database_merge.configuration.progress.pronunciation.cambridge_American.all +
    database_merge.configuration.progress.pronunciation.collins_American.all +
    database_merge.configuration.progress.pronunciation.baidu_British.all +
    database_merge.configuration.progress.pronunciation.google_British.all +
    database_merge.configuration.progress.pronunciation.cambridge_British.all +
    database_merge.configuration.progress.pronunciation.collins_British.all +
    database_merge.configuration.progress.translation.baidu +
    database_merge.configuration.progress.translation.google;
var end = 0;
setTimeout(function () {
    end = database_merge.configuration.progress.pronunciation.baidu_American.all +
        database_merge.configuration.progress.pronunciation.google_American.all +
        database_merge.configuration.progress.pronunciation.cambridge_American.all +
        database_merge.configuration.progress.pronunciation.collins_American.all +
        database_merge.configuration.progress.pronunciation.baidu_British.all +
        database_merge.configuration.progress.pronunciation.google_British.all +
        database_merge.configuration.progress.pronunciation.cambridge_British.all +
        database_merge.configuration.progress.pronunciation.collins_British.all +
        database_merge.configuration.progress.translation.baidu +
        database_merge.configuration.progress.translation.google;
    var increase = end - begin;
    console.log('speed is: ' + increase + ' items/s');
}, 1000);

database_merge.configuration.progress
database_merge.configuration.progress.pronunciation


var database_merge = require('./tools/database_merge.js');
database_merge.init(function () {
    if (database_merge.configuration.is_db_initialized) {
        // database_merge.count();
        debugger;
        // database_merge.generate_en_full_log_db();
        // database_merge.generate_data()
        database_merge.generate_all()
    }
});


var database_merge_multiply = require('./tools/database_merge_multiply.js');
database_merge_multiply.init();
database_merge_multiply.generate();
console.log('all finished!');



var generate_index_json = require('./tools/generate_index_json.js');
generate_index_json.generate_index_json()
console.log('all finished!');




var database_merge_log = require('./tools/database_merge_log.js');
database_merge_log.generate_empty_data();


var database_utility = require('./tools/database_utility.js');
debugger;
database_utility.get_all_words('Dictionary/ECDICT/stardict.db', 'database/words/stardict.json');


var database_utility = require('./tools/database_utility.js');
// database_utility.get_google_synonym('database/words/google_synonym');
// database_utility.array2object('database/words/stardict.json','database/words/stardict_object.json');
// database_utility.exist_test();
database_utility.other_test();
// database_utility.generate_stardict_word();


var words_generate = require('./tools/words_generate.js');
words_generate.generate_words_array()
console.log('all finished!');


var words_generate = require('./tools/words_generate.js');
words_generate.merge_all_words()
console.log('all finished!');


var words_generate = require('./tools/words_generate.js');
words_generate.shuffle('database/words/output/merged.json','database/words/output/merged_shuffle.json');
console.log('all finished!');




var database_merge_multiply_log = require('./tools/database_merge_multiply_log.js');
database_merge_multiply_log.generate_log();
console.log('all finished!');




var sort_index = require('./tools/sort_index.js');
sort_index.sort_index();
console.log('all finished!');



















