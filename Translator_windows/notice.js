(function () {

    const jQuery = require('./js/jquery-3.2.1.js'),
        $ = jQuery;
    var view = null;

    var previous_timeout = null;
    function show(notice, type, delay) {
        !type && (type = 'alert-success');
        !delay && (delay = 5 * 1000);
        if (null !== previous_timeout) {
            clearTimeout(previous_timeout);
        }
        $('#notice_row .alert').attr('class', 'alert ' + type + ' m-0');
        $('#notice').text(notice);
        $('#notice_row').height('');
        !view && (view = require('./view.js'));
        setTimeout(function () { view.update_window_size(null, null, 300) }, 1000);
        delay !== -1 && (previous_timeout = setTimeout(hide, delay));
    }
    function hide() {
        if ($('#notice_row').height()) {
            $('#notice_row').height(0);
            !view && (view = require('./view.js'));
            setTimeout(function () { view.update_window_size(null, null, 300) }, 1000);
        }
    }
    module.exports = {
        show: show,
        hide: hide,
    }
})();