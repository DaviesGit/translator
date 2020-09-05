// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.


$ = require('./js/jquery-3.2.1.js');
// const database = require('./database.js');
// const translator = require('./translate_library.js');
const jQuery_e_ajax = require('./js/jQuery_e_ajax.js');
jQuery_e_ajax.add2jQuery($);



const path = require('path');
const fs = require('fs');
const demons_multithreading = require(path.join(__dirname, './demons_multithreading.js'));

window.is_ready_to_close = false;
window.onbeforeunload = function (e) {
    if (window.is_ready_to_close) {
    } else {
        alert('please use close button in window!');
        e.returnValue = false;
    }
};



window.button_click_times = 0;
function button_fun() {
    switch (button_click_times) {
        case 0:
            $('#button_').text('wait to start . . . .').prop("disabled", true);
            demons_multithreading.init(function (error) {
                if (error) {
                    alert(error);
                    debugger;
                }
                demons_multithreading.start_demons(function (param) { console.log(param); });
                $('#button_').removeClass('btn-success').addClass('btn-danger').text('stop').prop("disabled", false);
                ++button_click_times;
            });
            break;
        case 1:
            $('#button_').text('wait to close . . . .').prop("disabled", true);
            demons_multithreading.stop_demons(function (param) {
                $('#button_').removeClass('btn-danger').addClass('btn-primary').text('close').prop("disabled", false);
                window.is_ready_to_close = true;
                ++button_click_times;
            });
            break;
        case 2:
            window.close();
            break;
    }
}

$(function () {
    $('#button_').on('click', button_fun);
    $('#button_storage').on('click', function () {
        demons_multithreading.storage_log();
    });
    var force_exit_times = 0;
    $('#button_force_exit').on('click', function () {
        ++force_exit_times;
        if (2 < force_exit_times) {
            window.is_ready_to_close = true;
            window.close();
        }
    });



    (function connect_loop() {
        external_command.execute_commands(['rasdial "12" s201813160712 981128'], null, function () {
            $.e_ajax({
                url: 'https://baidu.com',
                retry_times: 1,
                callback: function (param) {
                    if ('success' !== param.status) {
                        connect_loop();
                    } else {
                        button_fun();
                    }
                },
            });
        });
    })();



    // setTimeout(function () {
    //     $('#button_').text('wait to close . . . .').prop("disabled", true);
    //     demons_multithreading.stop_demons(function (param) {
    //         $('#button_').removeClass('btn-danger').addClass('btn-primary').text('close').prop("disabled", false);
    //         window.is_ready_to_close = true;
    //         external_command.execute_commands(['shutdown /r /t 60'], null, function () {
    //             window.close();
    //         });
    //     });
    // }, 24 * 60 * 60 * 1000);


})




