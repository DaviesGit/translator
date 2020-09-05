(function () {
    const child_process = require('child_process');
    const global_configuration = require('../global_configuration.js');
    const fs = require('fs');
    const path = require('path');

    function execute_commands(commands, notice, callback) {
        !commands && (commands = []);
        !notice && (notice = function () { });
        !callback && (callback = function () { });
        commands = Array.from(commands);
        // commands.unshift('chcp 65001');
        commands.push('exit');
        var child = child_process.spawn('cmd.exe', ['/Q'], {
            cwd: path.join(global_configuration.work_directory),
        });
        child.stdout.on('data', function (data) {
            notice({
                type: 'stdout',
                data: data,
            });
        });
        child.stderr.on('data', function (data) {
            notice({
                type: 'stderr',
                data: data,
            });
        });
        child.on('close', function (code) {
            callback({
                status: 0 === code,
                code: code,
            });
        });
        commands.forEach(function (command) {
            child.stdin.write(command + '\n', 'utf8');
        });
    }
    module.exports = {
        execute_commands: execute_commands,
    }
})();