
const path = require('path');
const fs = require('fs');
const database = require('./database.js');

database.init_database(function () {
    for (var i = 0; i < 100000; ++i) {
        database._storage_baidu_raw_translation_data('test', 'this is the result!!!');
        database._storage_google_raw_translation_data('test', 'this is the result!!!');
        database._storage_baidu_pronunciation_data('test', 'this is the result!!!');
        database._storage_google_pronunciation_data('test', 'this is the result!!!');
        database._storage_cambridge_pronunciation_data('test', 'this is the result!!!');
        database._storage_collins_pronunciation_data('test', 'this is the result!!!');
    }
    database._storage_baidu_raw_translation_data_flush();
    database._storage_google_raw_translation_data_flush();
    database._storage_baidu_pronunciation_data_flush();
    database._storage_google_pronunciation_data_flush();
    database._storage_cambridge_pronunciation_data_flush();
    database._storage_collins_pronunciation_data_flush();
});





var fs = require('fs');
fs.open('database/translator/new_data/baidu_raw_translation.data', 'r', function (error, fd) {
    if (error) {
        debugger;
    }
    var buffer = new Buffer(69899);
    fs.read(fd, buffer, 0, 69899, 160979265, function (err, bytesRead, buffer) {
        console.log(JSON.parse(String(buffer)));
    });
})




var fs = require('fs');
fs.open('database/translator/new_data/cambridge_American.data', 'r', function (error, fd) {
    if (error) {
        debugger;
    }
    var buffer = new Buffer(4786);
    fs.read(fd, buffer, 0, 4786, 28431559, function (err, bytesRead, buffer) {
        fs.writeFileSync('P:/temp/temp.mp3', buffer);
        // console.log(JSON.parse(String(buffer)));
    });
})




