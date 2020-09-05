// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.


const electron = require('electron');

const notice = require('./notice.js');
const jQuery = require('./js/jquery-3.2.1.js'),
    $ = jQuery;
const database = require('./database.js');
const learn_demon = require('./learn_demon.js');
const view = require('./view.js');
const pronunciation = require('./pronunciation');
const translator = require('./translator.js');
const path = require('path');
const fs = require('fs');
const external = require('./external.js');

const configuration = {
    learn_demon_timeout: 1 * 30 * 1000,
    learn_demon_word_delay: 1000,
}


var current_word = null;

function init() {
    // console.log(electron);
    electron.ipcRenderer.on('input_focus', function (event, arg) {
        $('#word').focus().val('');
        learn_demon.stop();
        event.returnValue = true;
    });
    electron.ipcRenderer.on('save_word', function (event, arg) {
        if (current_word) {
            var _word = learn_demon.save_word(current_word);
            notice.show('Word: >' + _word[0] + '< has been saved! times> ' + _word[1], 'alert-primary', 5 * 1000);
        }
    });
    electron.ipcRenderer.on('remove_word', function (event, arg) {
        if (current_word) {
            var _word = learn_demon.remove_word(current_word);
            if (!_word) {
                notice.show('Not have this word!', 'alert-primary', 5 * 1000);
            } else {
                notice.show('Word: >' + _word[0] + '< has been saved! times> ' + _word[1], 'alert-primary', 5 * 1000);
            }
        }
    });
    var is_auto_learn = true;
    electron.ipcRenderer.on('toggle_learn', function (event, arg) {
        if (is_auto_learn) {
            is_auto_learn = false;
            learn_demon.stop();
            notice.show('Stop learn!');
        } else {
            is_auto_learn = true;
            learn_demon.start();
            notice.show('Start learn!');
        }
    });
    electron.ipcRenderer.on('show_histories', function (event, arg) {
        var histories = learn_demon.get_histories();
        view.reset_view();
        histories.forEach(function (history, index) {
            var tr = `
            <tr>
                <td class="text-right">` + (index + 1) + `</td>
                <td>` + history + `</td>
            </tr>`;
            $('#baidu_result_table').append(tr);
        });
        $('#baidu_result').show();
        view.update_window_size();
    });
    electron.remote.app.on('browser-window-blur', () => {
        is_auto_learn && set_learn_demon_timeout();
    });
    electron.remote.app.on('browser-window-focus', () => {
        learn_demon.stop();
        view.normalize_window();
        clear_learn_demon_timeout();
    });
}

learn_demon.init();
var learn_demon_timeout = null;

function set_learn_demon_timeout() {
    learn_demon_timeout = setTimeout(function () {
        view.minify_window();
        setTimeout(function () {
            learn_demon.start(configuration.learn_demon_word_delay);
        }, 1000);
    }, configuration.learn_demon_timeout);
}

function clear_learn_demon_timeout() {
    learn_demon_timeout && (clearTimeout(learn_demon_timeout) || (learn_demon_timeout = null));
}

function is_en(str) {
    return /^[\x20-\x7E]*$/.test(str);
}

$(function () {
    init();
    var word = $('#word').attr('placeholder', 'Enter word there!');
    view.init();
    view.reset_view();
    // notice.show('Made by Davies!', 'alert-info', 5 * 1000);

    var is_wait4second_time_click = false;
    var wait4second_time_click_word = '';
    $('#form_word').submit(function (event) {
        event.preventDefault();
        var word = $('#word').val().trim();
        if (!word) {
            if (is_wait4second_time_click) {
                is_wait4second_time_click = false;
                return external.google_website_translate2CN(wait4second_time_click_word);
            }
            return notice.show('Please input a word!', 'alert-danger', 5 * 1000);
        }
        $('#word').val('');
        if (!is_en(word)) {
            external.google_website_translate2EN(word);
        } else {
            translator.show_more.deep = 0;
            current_word = word;
            if (!translator.translate(current_word)) {
                notice.show('Cannot find this word!', 'alert-danger', 5 * 1000);
                is_wait4second_time_click = true;
                wait4second_time_click_word = word;
            }
        }
    });
    $(window).keydown(function (event) {
        if (event.ctrlKey) {
            switch (event.keyCode) {
                case '\r'.charCodeAt(0):
                    var query_string = $('#word').val().trim();
                    if (!query_string) {
                        notice.show('Please input a search string!', 'alert-danger', 5 * 1000);
                    } else {
                        if (is_en(query_string)) {
                            external.google_search(query_string);
                            $('#word').val('');
                        } else {
                            external.baidu_search(query_string);
                            $('#word').val('');
                        }
                    }
                    break;
                case 'M'.charCodeAt(0):
                    translator.show_more();
                    break;
                default:
                    break;
            }
        } else {
            switch (event.keyCode) {
                case 38: //up arrow
                    view.scroll_element('#en_result', -240);
                    break;
                case 40: //down arrow
                    view.scroll_element('#en_result', +240);
                    break;
                case 37: //foreground arrow
                    view.scroll_element('#en_result', -240 * 2.8);
                    break;
                case 39: //background arrow
                    view.scroll_element('#en_result', +240 * 2.8);
                    break;
            }
        }
    });

})
