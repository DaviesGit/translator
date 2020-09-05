const database = require('P:/Works/Electron/Translator/database.js');
const log = require('P:/Works/Node.js/log/log.js');
const translator = require('P:/Works/Electron/Translator/translate_library.js');
database.init_database(function (error) {
    if (error) {
        log(error);
    } else {
        translator.init(function (error) {
            if (error) {
                log(error);
            } else {
                translator.get_baidu_translate('how', function (response) {
                    response = JSON.stringify(response);
                    database.store_raw_translate_result('how', '', response, function (error) {
                        if (error) {
                            log(error);
                        } else {

                        }
                    });
                });
            }
        });
    }
})




const path = require('path');
const fs = require('fs');
const translator = require(path.join(__dirname, './translate_library.js'));
translator.init();

translator.get_google_translate('test', function (response) {
    console.log(response);
});
translator.get_baidu_translate('test', function (response) {
    console.log(response);
});

const demons = require('P:/Works/Electron/Translator/demons.js');
setTimeout(function () {
    demons.start_translate(function (info) {
        console.log(info);
    });
}, 1000);

