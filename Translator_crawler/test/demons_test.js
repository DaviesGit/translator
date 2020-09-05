
const path = require('path');
const fs = require('fs');
const demons_multithreading = require(path.join(__dirname, './demons_multithreading.js'));

demons_multithreading.init(function (error) {
    if (error) {
        debugger;
    }
    debugger;
    // demons_multithreading.start_baidu_raw_translation_demon();
    // demons_multithreading.start_baidu_pronunciation_demon();
    // demons_multithreading.start_demons(function (param) { console.log(param); });
    // demons_multithreading.stop_demons(function (param) { console.log(param); });
    demons_multithreading.start_collins_pronunciation_demon();
});



