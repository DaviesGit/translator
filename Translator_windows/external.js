(function () {
    const child_process = require('child_process');

    function open_url(url) {
        var start = (process.platform == 'darwin' ? 'open' : process.platform == 'win32' ? 'start' : 'xdg-open');
        child_process.exec(start + ' "" "' + url + '"');
    }
    function google_search(query) {
        query = query.replace(' ', '+');
        query = encodeURI(query);
        open_url('https://www.google.com/search?q=' + query);
    }
    function baidu_search(query) {
        query = encodeURI(query);
        open_url('https://www.baidu.com/s?wd=' + query);
    }
    function baidu_website_translate2EN(query) {
        query = encodeURI(query);
        open_url('https://fanyi.baidu.com/#zh/en/' + query);
    }
    function baidu_website_translate2CN(query) {
        query = encodeURI(query);
        open_url('https://fanyi.baidu.com/#en/zh/' + query);
    }
    function google_website_translate2EN(query) {
        query = encodeURI(query);
        open_url('https://translate.google.com/#view=home&op=translate&sl=auto&tl=en&text=' + query);
    }
    function google_website_translate2CN(query) {
        query = encodeURI(query);
        open_url('https://translate.google.com/#view=home&op=translate&sl=auto&tl=zh-CN&text=' + query);
    }
    module.exports = {
        open_url: open_url,
        google_search: google_search,
        baidu_search: baidu_search,
        baidu_website_translate2EN: baidu_website_translate2EN,
        baidu_website_translate2CN: baidu_website_translate2CN,
        google_website_translate2EN: google_website_translate2EN,
        google_website_translate2CN: google_website_translate2CN,
    }
})();