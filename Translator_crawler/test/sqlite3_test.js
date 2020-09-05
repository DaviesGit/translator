
path = require('path');
const sqlite3 = require(path.join(__dirname, '../node-sqlite3-4.0.2')).verbose();
var database= new sqlite3.Database(':memory:', sqlite3.OPEN_CREATE | sqlite3.OPEN_READWRITE, function (error) {
    if (error) {
        console.log(error);
    } else {
        console.log('success!');
    }
});





pronunciation_database = new sqlite3.Database('P:/Works/database/translator/pronunciation_database.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, function (error) {
    if (error) {
        console.log(error);
    } else {
        console.log('success!');
    }
});




const database = require('P:/Works/Electron/Translator/database.js');

database.init_database(function (error) {
    console.log(error);
});
database.store_raw_translate_result('test4', '', 'null', function (error) {
    console.log(error);
});




configuration.raw_translation_database.run('UPDATE raw_translation SET google=$google_translation, baidu=$baidu_translation WHERE word=$word',
    {
        $word: 'free',
        $google_translation: 'null',
        $baidu_translation: null
    },
    function (error) {
        if (error) {
            if (callback) {
                callback('UPDATE raw_translation SET google=$google_translation, baidu=$baidu_translation WHERE word=$word failed! error is: ' + error.message);
            }
        } else {
            if (callback) {
                callback();
            }
        }
    }
)