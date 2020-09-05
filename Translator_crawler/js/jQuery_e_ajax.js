(function() {
    function add2jQuery(jQuery) {
        // param = {
        //     basic: 'param pair',
        //     callback: function (param) {
        //         param = {
        //             status: 'success',
        //             data: {},
        //         }
        //     },
        //     checker: function (param) {
        //         param = {
        //             status: 'success',
        //             data: {},
        //         }
        //     },
        //     retry_delay: 0,
        //     retry_times: 0,
        // }
        function e_ajax(param) {
            var callback = 'function' === typeof param.callback ? param.callback : function() {};
            var checker = 'function' === typeof param.checker ? param.checker : function(param) {
                if (param.retry_times && param.request_times < param.retry_times)
                    return false;
                else
                    return true;
                return 'success' === param.status;
            };
            delete param.callback;
            delete param.chekcer;
            var retry_times = param.retry_times ? param.retry_times : 0;
            delete param.retry_times;
            var retry_delay = param.retry_delay ? param.retry_delay : 60 * 1000;
            delete param.retry_delay;
            delete param.success;
            delete param.error;
            param.timeout = param.timeout ? param.timeout : 60 * 1000;

            var request_times = 0;
            var is_called = false;

            function callback_once(param) {
                if (!is_called) {
                    is_called = true;
                    callback(param);
                }
            }

            function _make_request() {
                if (request_times > retry_times) {
                    callback_once({
                        status: 'error_retry_times_exceeded',
                        data: 'error, too many request_times > retry_times'
                    });
                    return;
                }
                ++request_times;
                var timeout = setTimeout(_make_request, param.timeout * 1.5);
                var _param = jQuery.fn.extend({
                    success: function(response, text_status, XHR_http_request) {
                        clearTimeout(timeout);
                        var param = {
                            status: text_status,
                            data: {
                                response: response,
                                text_status: text_status,
                                XHR_http_request: XHR_http_request
                            }
                        };
                        if (checker(param)) {
                            callback_once(param);
                        } else {
                            setTimeout(_make_request, retry_delay);
                        }
                    },
                    error: function(XHR_http_request, text_status, error) {
                        clearTimeout(timeout);
                        var param = {
                            status: text_status,
                            data: {
                                error: error,
                                text_status: text_status,
                                XHR_http_request: XHR_http_request
                            }
                        };
                        if (!checker(Object.assign({
                            request_times: request_times,
                            retry_times: retry_times,
                        }, param))) {
                            setTimeout(_make_request, retry_delay);
                        } else {
                            callback_once(param);
                        }
                    }
                }, param);
                jQuery.ajax(_param);
            }
            _make_request();
        }
        if ('function' === typeof jQuery && 'object' === typeof jQuery.fn) {
            jQuery.e_ajax = e_ajax;
        } else {
            alert('error passed parameter is not a jQuery object!');
        }
    }
    module.exports = {
        add2jQuery: add2jQuery
    }
})();