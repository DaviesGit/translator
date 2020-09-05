(function () {
    $ = require('./js/jquery-3.2.1.js');
    const fs = require('fs');


    let data = {
        token: {
            is_init: false,
            google_TKK: null,
            baidu_token: null,
            baidu_gtk: null
        }
    };
    const configuration = {
        request_timeout: 60 * 1000,
        request_retry_times: 99,
        request_retry_delay: 60 * 1000
    }



    function _ajax(url, method, callback, data) {
        var request_times = 0;
        if ('function' !== typeof callback) {
            callback = function () { };
        }
        var is_called = false;
        function callback_once(response, text_status) {
            if (!is_called) {
                is_called = true;
                callback(response, text_status);
            }
        }

        function make_request() {
            var timeout = setTimeout(function () {
                debugger;
                if (!is_called) {
                    if (request_times < configuration.request_retry_times) {
                        setTimeout(make_request, configuration.request_retry_delay);
                    } else {
                        callback_once('', 'error! server cancel connection or others');
                    }
                }
            }, configuration.request_timeout * 1.5);
            ++request_times;
            $.ajax(url, {
                success: function (response, text_status) {
                    clearTimeout(timeout);
                    callback_once(response, text_status);
                },
                error: function (XML_http_request, text_status, error) {
                    if (404 === XML_http_request.status) {
                        this.success('', text_status + '_404');
                    } else {
                        if (request_times < configuration.request_retry_times) {
                            clearTimeout(timeout);
                            setTimeout(make_request, configuration.request_retry_delay);
                        } else {
                            this.success('', text_status);
                        }
                    }
                },
                timeout: configuration.request_timeout,
                method: method,
                data: data
            });
        }
        make_request();
    }

    function init_token(callback) {
        if (data.token.is_init) {
            if (callback)
                callback();
            return;
        }
        function update_status() {
            if (data.token.google_TKK && data.token.baidu_token && data.token.baidu_gtk) {
                data.token.is_init = true;
                if (callback)
                    callback();
            }
        }
        _ajax('https://fanyi.baidu.com/', 'GET', function (response, text_status) {
            try {
                if ('success' !== text_status)
                    throw 'get baidu translate page error!'
                var regexp = /token: *\'[0-9a-z]+\'/;
                var token = regexp.exec(response);
                if (!token.length) {
                    throw ('not find baidu token');
                }
                token = token[0];
                regexp = /[0-9a-z]+/;
                token = regexp.exec(token.substr(6));
                if (!token.length) {
                    throw ('not find baidu token');
                }
                token = token[0];
                data.token.baidu_token = token;
                //get gtk
                var gtk = response.match(/window\.gtk *= *\'\d+\.\d+\'/);
                if (!gtk.length) {
                    throw ('not find baidu gtk');
                }
                gtk = gtk[0];
                gtk = gtk.match(/\d+\.\d+/);
                if (!gtk.length) {
                    throw ('not find baidu gtk');
                }
                gtk = gtk[0];
                data.token.baidu_gtk = gtk;
                update_status();
            } catch (e) {
                if (callback) {
                    callback(e);
                }
                return;
            }
        });
        _ajax('https://translate.google.com/', 'GET', function (response, text_status) {
            try {
                if ('success' !== text_status)
                    throw 'get google translate page error!'

                var token = response.match(/tkk:'\d+.\d+'/);
                if (!token || !token.length) {
                    throw ('not find google token');
                }
                token = token[0].substring(5, token[0].length - 1);
                // var regexp = /TKK=eval\(\'[^\']+\'\);/;
                // var token = regexp.exec(response);
                // if (!token.length) {
                //     throw ('not find google token');
                // }
                // token = token[0];
                // token = token.substring(10, token.length - 3);
                // regexp = /\\x3d-?\d+;/g;
                // var ab = token.match(regexp);
                // if (2 !== ab.length) {
                //     throw ('eval google token error!');
                // }
                // ab = +ab[0].substring(4, ab[0].length - 1) + (+ab[1].substring(4, ab[1].length - 1));
                // regexp = /;return \d+\+/;
                // var before = regexp.exec(token);
                // if (!before.length) {
                //     throw ('eval google token error!');
                // }
                // before = before[0];
                // before = before.substring(8, before.length - 1);
                // data.token.google_TKK = before + '.' + ab;
                data.token.google_TKK = token;
                update_status();
            }
            catch (e) {
                if (callback) {
                    callback(e);
                }
                return;
            }
        });
    }

    function get_google_key(a) {
        if (!data.token.is_init)
            return false;
        var er = function (a, b) {
            for (var c = 0; c < b.length - 2; c += 3) {
                var d = b.charAt(c + 2);
                d = "a" <= d ? d.charCodeAt(0) - 87 : Number(d);
                d = "+" == b.charAt(c + 1) ? a >>> d : a << d;
                a = "+" == b.charAt(c) ? a + d & 4294967295 : a ^ d;
            }
            return a;
        }
        b = data.token.google_TKK;
        d = b.split(".");
        b = Number(d[0]) || 0;
        for (var e = [], f = 0, g = 0; g < a.length; g++) {
            var l = a.charCodeAt(g);
            128 > l ? e[f++] = l : (2048 > l ? e[f++] = l >> 6 | 192 : (55296 == (l & 64512) && g + 1 < a.length && 56320 == (a.charCodeAt(g + 1) & 64512) ? (l = 65536 + ((l & 1023) << 10) + (a.charCodeAt(++g) & 1023),
                e[f++] = l >> 18 | 240,
                e[f++] = l >> 12 & 63 | 128) : e[f++] = l >> 12 | 224,
                e[f++] = l >> 6 & 63 | 128),
                e[f++] = l & 63 | 128)
        }
        a = b;
        for (f = 0; f < e.length; f++)
            a += e[f],
                a = er(a, "+-a^+6");
        a = er(a, "+-3^+b+-f");
        a ^= Number(d[1]) || 0;
        0 > a && (a = (a & 2147483647) + 2147483648);
        a %= 1E6;
        return (a.toString() + "." + (a ^ b));
    }

    function get_baidu_key(r) {
        if (!data.token.is_init)
            return false;

        function n(r, o) {
            for (var t = 0; t < o.length - 2; t += 3) {
                var a = o.charAt(t + 2);
                a = a >= "a" ? a.charCodeAt(0) - 87 : Number(a),
                    a = "+" === o.charAt(t + 1) ? r >>> a : r << a,
                    r = "+" === o.charAt(t) ? r + a & 4294967295 : r ^ a
            }
            return r
        }
        function e(r) {
            var o = r.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g);
            if (null === o) {
                var t = r.length;
                t > 30 && (r = "" + r.substr(0, 10) + r.substr(Math.floor(t / 2) - 5, 10) + r.substr(-10, 10))
            } else {
                for (var e = r.split(/[\uD800-\uDBFF][\uDC00-\uDFFF]/), C = 0, h = e.length, f = []; h > C; C++)
                    "" !== e[C] && f.push.apply(f, a(e[C].split(""))),
                        C !== h - 1 && f.push(o[C]);
                var g = f.length;
                g > 30 && (r = f.slice(0, 10).join("") + f.slice(Math.floor(g / 2) - 5, Math.floor(g / 2) + 5).join("") + f.slice(-10).join(""))
            }
            u = data.token.baidu_gtk;
            for (var d = u.split("."), m = Number(d[0]) || 0, s = Number(d[1]) || 0, S = [], c = 0, v = 0; v < r.length; v++) {
                var A = r.charCodeAt(v);
                128 > A ? S[c++] = A : (2048 > A ? S[c++] = A >> 6 | 192 : (55296 === (64512 & A) && v + 1 < r.length && 56320 === (64512 & r.charCodeAt(v + 1)) ? (A = 65536 + ((1023 & A) << 10) + (1023 & r.charCodeAt(++v)),
                    S[c++] = A >> 18 | 240,
                    S[c++] = A >> 12 & 63 | 128) : S[c++] = A >> 12 | 224,
                    S[c++] = A >> 6 & 63 | 128),
                    S[c++] = 63 & A | 128)
            }
            for (var p = m, F = "" + String.fromCharCode(43) + String.fromCharCode(45) + String.fromCharCode(97) + ("" + String.fromCharCode(94) + String.fromCharCode(43) + String.fromCharCode(54)), D = "" + String.fromCharCode(43) + String.fromCharCode(45) + String.fromCharCode(51) + ("" + String.fromCharCode(94) + String.fromCharCode(43) + String.fromCharCode(98)) + ("" + String.fromCharCode(43) + String.fromCharCode(45) + String.fromCharCode(102)), b = 0; b < S.length; b++)
                p += S[b],
                    p = n(p, F);
            return p = n(p, D),
                p ^= s,
                0 > p && (p = (2147483647 & p) + 2147483648),
                p %= 1e6,
                p.toString() + "." + (p ^ m)
        }
        return {
            token: data.token.baidu_token,
            sign: e(r)
        };
    }

    function get_pronunciation(url, callback) {
        if ('function' !== typeof callback) {
            callback = function () { };
        }
        var XML_http_request = new XMLHttpRequest();
        XML_http_request.open('GET', url, true);
        XML_http_request.responseType = 'blob';
        XML_http_request.onload = function (event) {
            var blob = XML_http_request.response;
            var file_reader = new FileReader();
            file_reader.onload = function (event) {
                var buffer = new Buffer(event.target.result, 'binary');
                if (!buffer.length) {
                    callback({
                        error: 'get_pronunciation server returned buffer.length is 0'
                    })
                } else {
                    callback({
                        buffer: buffer
                    });
                }
            }
            file_reader.readAsArrayBuffer(blob);
        };
        XML_http_request.onerror = function (event) {
            callback({
                error: 'XML_http_request.status: ' + XML_http_request.status
            });
        }
        XML_http_request.send(null);
    }

    function get_baidu_translate(word, callback) {
        if (!data.token.is_init) {
            callback(false);
            return false
        }
        baidu_key = get_baidu_key(word);
        _ajax('https://fanyi.baidu.com/v2transapi', 'POST',
            function (response, text_status) {
                if ('success' !== text_status)
                    return callback(false);
                callback(response);
            },
            {
                from: 'en',
                to: 'zh',
                query: word,
                transtype: 'realtime',
                simple_means_flag: 3,
                sign: baidu_key.sign,
                token: baidu_key.token
            });
    }
    function get_google_translate(word, callback) {
        if (!data.token.is_init) {
            callback(false);
            return false
        }
        if ('function' !== typeof callback) {
            callback = function () { };
        }
        var tk = get_google_key(word);
        _ajax('https://translate.google.com/translate_a/single?client=t&sl=en&tl=zh-CN&hl=en&dt=at&dt=bd&dt=ex&dt=ld&dt=md&dt=qca&dt=rw&dt=rm&dt=ss&dt=t&ie=UTF-8&oe=UTF-8&otf=2&ssel=0&tsel=0&kc=2&tk=' + tk + '&q=' + encodeURIComponent(word), 'GET',
            function (response, text_status) {
                try {
                    if ('success' !== text_status)
                        throw 'get google translate result error!'
                    callback(response);
                } catch (e) {
                    callback(false);
                }
            });
    }

    function get_baidu_pronunciation(word, callback) {
        var result = {
            error: {
                American: null,
                British: null
            },
            buffer: {
                American: null,
                British: null
            }
        };
        if ('function' !== typeof callback) {
            callback = function () { };
        }
        var total_thread = 2,
            wait_count = 0;
        function wait_all_finish() {
            ++wait_count;
            if (wait_count >= total_thread) {
                callback(result);
            }
        }
        get_pronunciation('https://fanyi.baidu.com/gettts?lan=en&text=' + encodeURIComponent(word) + '&spd=3&source=web',
            function (_result) {
                result.error.American = _result.error;
                result.buffer.American = _result.buffer;
                wait_all_finish();
            });
        get_pronunciation('https://fanyi.baidu.com/gettts?lan=uk&text=' + encodeURIComponent(word) + '&spd=3&source=web',
            function (_result) {
                result.error.British = _result.error;
                result.buffer.British = _result.buffer;
                wait_all_finish();
            });

    }
    function get_google_pronunciation(word, callback) {
        var result = {
            error: {
                American: null,
                British: null
            },
            buffer: {
                American: null,
                British: null
            }
        };
        if ('function' !== typeof callback) {
            callback = function () { };
        }
        var total_thread = 2,
            wait_count = 0;
        function wait_all_finish() {
            ++wait_count;
            if (wait_count >= total_thread) {
                callback(result);
            }
        }
        if (!data.token.is_init) {
            callback(false);
            return false
        }
        var tk = get_google_key(word);
        var len = word.length;
        get_pronunciation('https://translate.google.com/translate_tts?ie=UTF-8&q=' + encodeURIComponent(word) + '&tl=en&total=1&idx=0&textlen=' + len + '&tk=' + tk + '&client=t&prev=input',
            function (_result) {
                result.error.American = _result.error;
                result.buffer.American = _result.buffer;
                wait_all_finish();
            });
        get_pronunciation('https://translate.google.com/translate_tts?ie=UTF-8&q=' + encodeURIComponent(word) + '&tl=uk&total=1&idx=0&textlen=' + len + '&tk=' + tk + '&client=t&prev=input',
            function (_result) {
                result.error.British = _result.error;
                result.buffer.British = _result.buffer;
                wait_all_finish();
            });
    }

    function get_cambridge_pronunciation(word, callback) {
        var result = {
            error: {
                American: null,
                British: null
            },
            buffer: {
                American: null,
                British: null
            }
        };
        if ('function' !== typeof callback) {
            callback = function () { };
        }
        var total_thread = 2,
            wait_count = 0;
        function wait_all_finish() {
            ++wait_count;
            if (wait_count >= total_thread) {
                callback(result);
            }
        }
        _ajax('https://dictionary.cambridge.org/us/search/english/direct/?q=' + encodeURIComponent(word), 'GET',
            function (response, text_status) {
                if ('success' !== text_status) {
                    result.error.American = "$.get('https://dictionary.cambridge.org/dictionary/english-chinese-simplified/' + word,...) failed!";
                    result.error.British = "$.get('https://dictionary.cambridge.org/dictionary/english-chinese-simplified/' + word,...) failed!";
                    callback(result);
                } else {
                    var url = {};
                    for (country of ['us', 'uk']) {
                        url[country] = response.match(RegExp('<span[^>]*>' + country + '<\\/span>\\s*<span[^>]*data-src-mp3="[^>]*>'));
                        if (!url[country]) {
                            result.error['us' === country ? 'American' : 'British'] = 'cannot find cambridge ' + country + ' pronunciation url';
                            wait_all_finish()
                            continue;
                        }
                        url[country] = url[country][0].match(/data-src-mp3="[^"]+"/);
                        if (!url[country]) {
                            result.error['us' === country ? 'American' : 'British'] = 'cannot find cambridge ' + country + ' pronunciation url';
                            wait_all_finish()
                            continue;
                        }
                        url[country] = 'https://dictionary.cambridge.org' + url[country][0].substring(14, url[country][0].length - 1);

                        function _get_pronunciation(country) {
                            get_pronunciation(url[country], function (_result) {
                                result.error['us' === country ? 'American' : 'British'] = _result.error;
                                result.buffer['us' === country ? 'American' : 'British'] = _result.buffer;
                                wait_all_finish();
                            });
                        }
                        _get_pronunciation(country);
                    }
                }
            }
        );
    }
    function get_collins_pronunciation(word, callback) {
        var result = {
            error: {
                default: null,
                American: null,
                British: null
            },
            buffer: {
                default: null,
                American: null,
                British: null
            }
        };
        if ('function' !== typeof callback) {
            callback = function () { };
        }
        var total_thread = 3,
            wait_count = 0;
        function wait_all_finish() {
            ++wait_count;
            if (wait_count >= total_thread) {
                callback(result);
            }
        }
        _ajax('https://www.collinsdictionary.com/search/?dictCode=english&q=' + encodeURIComponent(word), 'GET',
            function (response, text_status) {
                if ('success' !== text_status) {
                    result.error.default = "_ajax('https://www.collinsdictionary.com/search/?dictCode=english&q=' + word...) failed!";
                    result.error.American = "_ajax('https://www.collinsdictionary.com/search/?dictCode=english&q=' + word...) failed!";
                    result.error.British = "_ajax('https://www.collinsdictionary.com/search/?dictCode=english&q=' + word...) failed!";
                    callback(result);
                } else {
                    var url = {};
                    for (country of ['American', 'British']) {
                        url[country] = response.match(RegExp('in ' + country + '((?!data-src-mp3)[^])+data-src-mp3="[^"]+"'));
                        if (!url[country]) {
                            result.error[country] = 'cannot find collins ' + country + ' pronunciation url';
                            wait_all_finish()
                            continue;
                        }
                        url[country] = url[country][0].match(/data-src-mp3="[^"]+"/);
                        if (!url[country]) {
                            result.error[country] = 'cannot find collins ' + country + ' pronunciation url';
                            wait_all_finish()
                            continue;
                        }
                        url[country] = url[country][0].substring(14, url[country][0].length - 1);
                        function _get_pronunciation(country) {
                            get_pronunciation(url[country], function (_result) {
                                result.error[country] = _result.error;
                                result.buffer[country] = _result.buffer;
                                wait_all_finish();
                            });
                        }
                        _get_pronunciation(country);
                    }
                    url.default = response.match(/\([^)]+data-src-mp3[^\)]+\)/);
                    if (!url.default) {
                        result.error.default = 'cannot find collins ' + 'default' + ' pronunciation url';
                        wait_all_finish()
                        return;
                    }
                    url.default = url.default[0].match(/data-src-mp3="[^"]+"/);
                    url.default = url.default[0].substring(14, url.default[0].length - 1);
                    if (url.American === url.default || url.British === url.default) {
                        result.error.default = null;
                        result.buffer.default = null;
                        wait_all_finish();
                        return;
                    }
                    get_pronunciation(url.default, function (_result) {
                        result.error.default = _result.error;
                        result.buffer.default = _result.buffer;
                        wait_all_finish();
                    });
                }
            });
    }

    module.exports = {
        data: data,
        init: init_token,
        get_baidu_translate: get_baidu_translate,
        get_google_translate: get_google_translate,

        get_baidu_pronunciation: get_baidu_pronunciation,
        get_google_pronunciation: get_google_pronunciation,
        get_cambridge_pronunciation: get_cambridge_pronunciation,
        get_collins_pronunciation: get_collins_pronunciation
    }
})();
