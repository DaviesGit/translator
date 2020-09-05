(function () {
    const electron = require('electron');
    const jQuery = require('./js/jquery-3.2.1.js'),
        $ = jQuery;
    const bezier_easing = require('./js/bezier-easing.js');
    const database = require('./database.js');
    const notice = require('./notice.js')
    var learn_demon = null;

    const word_exchange_properties = [
        'done',
        'er',
        'est',
        'ing',
        'past',
        'pl',
        'third',
    ]
    const configuration = {
        google_maximum_meaning_items: 1,
        oxford_maximum_meaning_items: 2,
        oxford_maximum_example_items: 1,
    }

    function init() {
        database.init();
    }

    function get_abbreviation(type) {
        switch (type) {
            case 'conjunction':
                return 'conj';
            case 'adverb':
                return 'adv';
            case 'preposition':
                return 'prep';
            case 'interjection':
                return 'interj';
            case 'adjective':
                return 'adj';
            case 'pronoun':
                return 'pron';
            case 'noun':
                return 'n';
            case 'verb':
                return 'v';


            case 'abbreviation':
                return 'abbr';
            case 'exclamation':
                return 'exclam';

            default:
                return type;
        }
    }

    function update_table(table, parts) {
        parts.forEach(function (part) {
            var tr = `
            <tr>
                <td class="text-right">`+ (part.part ? part.part : '') + `</td>
                <td>`+ part.means.join('; ') + `</td>
            </tr>`;
            $(table).append(tr);
        });
    }
    function update_synonymy_table(parts) {
        if (!parts || !parts.length) {
            return false;
        }
        parts.forEach(function (part) {
            var word_lists = `
            <ul  class="list-inline mb-0">`+
                (function () {
                    var lists = '';
                    for (word of part.d) {
                        lists += '<li class="list-inline-item border rounded">' + word + '</li>';
                    }
                    return lists;
                })()
                + `
            </ul> `;
            var tr = `
            <tr>
                <td class="text-right">`+ (part.p ? part.p : '') + `</td>
                <td>`+ word_lists + `</td>
            </tr>`;
            $('#synonymy tbody').append(tr);
        });
        return true;
    }
    function update_exchange_table(table, exchanges) {
        var is_word_exchange_table_show = false;
        for (property of word_exchange_properties) {
            if (exchanges && exchanges['word_' + property] && exchanges['word_' + property].length) {
                var exchange = exchanges['word_' + property].join('<br>');
                $('#word_exchange>table>thead>tr').append('<th class="p-0 text-center">' + property + '</th>');
                $('#word_exchange>table>tbody>tr').append('<td class="p-0 text-center">' + exchange + '</td>');
                is_word_exchange_table_show = true;
            }
        }
        return is_word_exchange_table_show;
    }
    function update_google_en_result(result) {
        function _get_synonyms(id) {
            var synonyms = [];
            result[11] && result[11].forEach(function (ele1, index) {
                ele1[1].forEach(function (ele2) {
                    if (id === ele2[1]) {
                        synonyms = synonyms.concat(ele2[0]);
                    }
                });
            });
            return synonyms;
        }
        var rows = '';
        result[12].forEach(function (means, index) {
            var row =
                `<tr>
                    <td class="text-right">`+ get_abbreviation(means[0]) + `.` + `</td>
                    <td class="p-0">`+
                (function () {
                    var data = '';
                    means[1].forEach(function (mean, index) {
                        data +=
                            `<div style="display:` + (index >= configuration.google_maximum_meaning_items ? 'none' : 'block') + `;" class="google word_meaning_container">
                                <hr class="m-0">
                                <div class="p-1">
                                    <div class="google word_meaning"><span><strong>`+ mean[0] + `</strong></span></div>` +
                            (mean[2] ? (`
                                    <div class="google word_example pl-2 pb-1"><q>`+ mean[2] + `</q></div>`) : ``) +
                            `       <div style="display: none;" class="google word_synonym">
                                        <ul class="list-inline mb-0 pb-1">`+
                            (function () {
                                var lists = '';
                                var synonyms = _get_synonyms(mean[1]);
                                synonyms.forEach(function (word, index) {
                                    lists +=
                                        `<li class="list-inline-item border rounded">` + word + `</li>
                                                    `;
                                });
                                return lists;
                            })() + `
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            `;
                    });
                    return data;
                })() + `
                    </td>
                </tr>`;
            rows += row + '\n';
        });
        if (rows) {
            $('#en_result tbody').append('<tr><td></td><td></td></tr><tr style="background-color: #00e7ff; "><td></td><td></td></tr>');
            $('#en_result tbody').append(rows);
        }
    }
    function update_oxford_en_result(result) {
        function get_specify_objects(array, tag) {
            var targets = [];
            var tags = Array.from(arguments).slice(1);
            array.forEach(function (ele) {
                tags.forEach(function (tag) {
                    if (tag === ele.tag) {
                        targets.push(ele);
                    }
                });
            });
            return targets;
        }
        var rows = '';
        result.forEach(function (means, index) {
            if (('p-g' !== means.tag) && ('h-g' !== means.tag)) {
                return;
            }
            var types = get_specify_objects(means.data, 'p');
            if (!types.length) {
                return;
            } else {
                var type = {
                    p: [],
                };
                types.forEach(function (_type) {
                    type.p.push(_type.p + '.');
                });
                type.p = type.p.join('<br>');
            }
            var target_means = [],
                _means = null;
            function _expand_xrs(xrs) {
                var _means = (function () {
                    var targets = [];
                    xrs.forEach(function (mean) {
                        mean = get_specify_objects(mean.data, 'xr');
                        targets = targets.concat(mean);
                    });
                    return targets;
                })();
                return _means;
            }
            if ((_means = get_specify_objects(means.data, 'sd-g')).length) {
                target_means = (function () {
                    var targets = [];
                    _means.forEach(function (mean) {
                        if (get_specify_objects(mean.data, 'd').length) {
                            targets.push(mean);
                        } else {
                            mean = get_specify_objects(mean.data, 'n-g');
                            targets = targets.concat(mean);
                            mean.forEach(function (mean) {
                                if ((mean = get_specify_objects(mean.data, 'xrs')).length) {
                                    mean.forEach(function (mean) {
                                        if ('eq' === mean.xt) {
                                            mean = _expand_xrs([mean]);
                                            targets = targets.concat(mean);
                                        }
                                    });
                                }
                            });
                        }
                    });
                    return targets;
                })();
            }
            if ((_means = get_specify_objects(means.data, 'n-g')).length) {
                target_means = target_means.concat(_means);
            }
            if ((_means = get_specify_objects(means.data, 'd')).length) {
                target_means.push(means);
            }
            if ((_means = get_specify_objects(means.data, 'pvs-g')).length) {
                _means = (function () {
                    var targets = [];
                    _means.forEach(function (mean) {
                        if (get_specify_objects(mean.data, 'd').length) {
                            targets.push(mean);
                        } else {
                            mean = get_specify_objects(mean.data, 'pv-g', );
                            targets = targets.concat(mean);
                        }
                    });
                    return targets;
                })();
                target_means = target_means.concat(_means);
            }
            if ((_means = get_specify_objects(means.data, 'ids-g')).length) {
                _means = (function () {
                    var targets = [];
                    _means.forEach(function (mean) {
                        if (get_specify_objects(mean.data, 'd').length) {
                            targets.push(mean);
                        } else {
                            mean = get_specify_objects(mean.data, 'id-g', );
                            targets = targets.concat(mean);
                        }
                    });
                    return targets;
                })();
                target_means = target_means.concat(_means);
            }
            if ((_means = get_specify_objects(means.data, 'xrs')).length) {
                target_means = target_means.concat(_expand_xrs(_means));
            }
            get_specify_objects(target_means, 'xr').forEach(function (mean) {
                mean.data = [{
                    tag: 'd',
                    enText: mean.data[0].text,
                    chText: mean.data[0].hoverText,
                }];
            });
            if (0 === target_means.length) {
                return;
            }

            var row =
                `<tr>
                    <td class="text-right">`+ type.p + `</td>
                    <td class="p-0">`
                + (function () {
                    var data = '';
                    target_means.forEach(function (mean, index) {
                        var mean_text = get_specify_objects(mean.data, 'd')[0];
                        if (!mean_text) {
                            mean_text = get_specify_objects(mean.data, 'ud')[0];
                        }
                        if (!mean_text) {
                            return;
                        }
                        data += `
                        <div style="display:`+ (index >= configuration.oxford_maximum_meaning_items ? 'none' : 'block') + `;" class="oxford` + ('id-g' === mean.tag ? ' idiom' : '') + ` word_meaning_container">
                            <hr class="m-0">
                            <div class="p-1">
                                <div class="oxford word_meaning"><span><strong>`+ mean_text.enText + `</strong></span></div>
                                <div style="display: none;" class="oxford word_meaning_translation"><span><strong>`+ mean_text.chText + `</strong></span></div>
                                `+
                            (function () {
                                var data = '';
                                var examples = get_specify_objects(mean.data, 'x');
                                examples.forEach(function (example, index) {
                                    data +=
                                        `<div style="display: ` + (index >= configuration.oxford_maximum_example_items ? 'none' : 'block') + `;" class="oxford word_example pl-2 pb-1">
                                            <hr class="m-0">
                                            <q>`+ example.enText + `</q>
                                            <div style="display: none;" class="oxford word_example_translation pt-1 pb-1"><q>`
                                        + example.chText +
                                        `   </q></div>
                                        </div>`;

                                });
                                return data;
                            })() + `
                            </div>
                        </div>\n`;
                    });
                    return data;
                })()
                + `
                    </td>
                </tr>`
            rows += row + '\n';
        });
        if (rows) {
            $('#en_result tbody').append(rows);
        }
    }

    var current_size = {}
    var current_set_loop = null;
    function set_window_size(size, easing_width, easing_height, delay, callback) {
        current_set_loop && current_set_loop.cancel();
        current_size.width = window.innerWidth;
        current_size.height = window.innerHeight;
        easing_width = easing_width ? easing_width : bezier_easing(0.5, 0, 0.5, 1);
        easing_height = easing_height ? easing_height : bezier_easing(0.5, 0, 0.5, 1);
        delay = delay ? delay : 0;
        callback = callback ? callback : function () { };
        var progress = 0;
        var loop_times = 12;
        function _easing_loop(size) {
            ++progress;
            if (progress > loop_times) {
                current_set_loop = null;
                return callback();
            }
            var width = size.width ? current_size.width + easing_width(progress / loop_times) * (size.width - current_size.width) : current_size.width;
            var height = size.height ? current_size.height + easing_height(progress / loop_times) * (size.height - current_size.height) : current_size.height;
            width = Math.round(width);
            (1 > width) && (width = 1);
            height = Math.round(height);
            (1 > height) && (height = 1);
            $('.container_outer').height(height);
            electron.ipcRenderer.send('set_window_size', {
                width: width,
                height: height,
            });
            var timeout = setTimeout(function () { _easing_loop(size) }, delay / loop_times);
            _easing_loop.cancel = function () {
                clearTimeout(timeout);
                current_set_loop = null;
            }
        }
        _easing_loop(size);
        current_set_loop = _easing_loop;
    }

    function reset_view() {
        $('#info').text('');
        $('#dst').text('');
        $('#baidu_result_table>tr').remove();
        $('#synonymy').hide();
        $('#synonymy tbody>tr').remove();
        $('#en_result tbody>tr').remove();
        $('#word_exchange tr>*').remove();
        $('#word_exchange').hide();
        $('#baidu_result').hide();
        $('#word').focus();
        notice.hide();
    }
    function show_more(deep) {
        if (deep) {
            $('#en_result .google.word_meaning_container .google.word_synonym').show();
            $('#en_result .oxford.word_meaning_container').show();
            $('#en_result .google.word_meaning_container').show();
            --deep;
        }
        if (deep) {
            $('#baidu_result').show();
            $('#en_result .oxford.word_meaning_container .oxford.word_meaning_translation').show();
            $('#en_result .oxford.word_meaning_container .oxford.word_example_translation').show();
            --deep;
        }
        if (deep) {
            $('#en_result .oxford.word_meaning_container .oxford.word_example').show();
            --deep;
        }
        update_window_size(null, null);
    }
    function update_google_result(word) {
        var result = database.get_google_raw_translation(word);
        if (result && result[12] && result[12].length) {
            update_google_en_result(result);
            return true;
        } else {
            setTimeout(function () { update_window_size(null, null) }, 1000);
            return false;
        }
    }
    function update_oxford_result(word) {
        var result = database.get_baidu_raw_translation(word);
        if (result &&
            result.dict_result &&
            result.dict_result.oxford &&
            result.dict_result.oxford.entry &&
            result.dict_result.oxford.entry[0] &&
            result.dict_result.oxford.entry[0].data &&
            result.dict_result.oxford.entry[0].data.length) {
            update_oxford_en_result(result.dict_result.oxford.entry[0].data);
            return true;
        } else {
            setTimeout(function () { update_window_size(null, null) }, 1000);
            return false;
        }
    }
    function update_baidu_result(word) {
        var result = database.get_baidu_raw_translation(word);
        // console.log(result);
        if (result) {
            !learn_demon && (learn_demon = require('./learn_demon.js'));
            var _word = learn_demon.get_word(word);
            var dst = ph_am;
            var ph_am, ph_en;
            if (result.dict_result.simple_means) {
                ph_am = result.dict_result.simple_means.symbols[0].ph_am;
                ph_en = result.dict_result.simple_means.symbols[0].ph_en;
                update_table('#baidu_result_table', result.dict_result.simple_means.symbols[0].parts);
                update_exchange_table('#word_exchange', result.dict_result.simple_means.exchange) && $('#word_exchange').show();
            }
            if (result.dict_result.sanyms && result.dict_result.sanyms.length) {
                update_synonymy_table(result.dict_result.sanyms[0].data) && $('#synonymy').show();
            }
            $('#dst').html('<strong class="pr-1">' +
                word +
                '</strong><span class="pr-2">' +
                (ph_am ? ('[' + ph_am + ']') : '') +
                (ph_en ? ('[' + ph_en + ']') : '') +
                '&nbsp;(' + (_word ? _word[1] : 0) +
                '):</span>' +
                result.trans_result.data[0].dst);

            setTimeout(function () { update_window_size(null, null) }, 1);
            return true;
        } else {
            setTimeout(function () { update_window_size(null, null) }, 1000);
            return false;
        }
    }
    function update_window_size(easing_width, easing_height, delay, callback) {
        var height = $('.container_inner').height();
        set_window_size({ height: height }, easing_width, easing_height, delay, callback);
    }
    function minify_window() {
        $('.container.unselectable.dragable').attr('class', 'container unselectable dragable height_animation').height(0);
        $('#search_box').attr('class', 'container height_animation').height(0);
        setTimeout(update_window_size, 600);
    }
    function normalize_window() {
        $('.container.unselectable.dragable').attr('class', 'container unselectable dragable height_animation_quickly').height('');
        $('#search_box').attr('class', 'container height_animation_quickly').height('');
        setTimeout(update_window_size, 300);
    }
    function scroll_element(selector, relative_position) {
        var element = $(selector)[0];
        if (!element) {
            return false;
        }
        element.scroll({
            top: element.scrollTop + relative_position,
            behavior: 'smooth',
        });
        return true;
    }
    module.exports = {
        init: init,
        update_table: update_table,
        reset_view: reset_view,
        show_more: show_more,
        scroll_element: scroll_element,
        set_window_size: set_window_size,
        update_window_size: update_window_size,
        minify_window: minify_window,
        normalize_window: normalize_window,
        update_baidu_result: update_baidu_result,
        update_google_result: update_google_result,
        update_oxford_result: update_oxford_result,
    };
})();