const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow() {
    const screen_size = electron.screen.getPrimaryDisplay().workAreaSize;
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 500,
        height: 240,
        frame: false,
        transparent: true,
        x: screen_size.width - 500,
        y: 0,
    });
    const menu = new electron.Menu();
    menu.append(new electron.MenuItem({
        label: 'save word',
        accelerator: 'CmdOrCtrl+S',
        click: function () {
            mainWindow.webContents.send('save_word', true);
        },
    }));
    menu.append(new electron.MenuItem({
        label: 'remove word',
        accelerator: 'CmdOrCtrl+R',
        click: function () {
            mainWindow.webContents.send('remove_word', true);
        },
    }));
    menu.append(new electron.MenuItem({
        label: 'learn',
        accelerator: 'CmdOrCtrl+L',
        click: function () {
            mainWindow.webContents.send('toggle_learn', true);
        },
    }));
    menu.append(new electron.MenuItem({
        label: 'learn delay',
        accelerator: 'CmdOrCtrl+T',
        click: function () {
            mainWindow.webContents.send('learn_delay', true);
        },
    }));
    menu.append(new electron.MenuItem({
        label: 'histories',
        accelerator: 'CmdOrCtrl+h',
        click: function () {
            mainWindow.webContents.send('show_histories', true);
        },
    }));
    menu.append(new electron.MenuItem({
        label: 'previous word',
        accelerator: 'CmdOrCtrl+,',
        click: function () {
            mainWindow.webContents.send('previous_word', true);
        },
    }));
    menu.append(new electron.MenuItem({
        label: 'next word',
        accelerator: 'CmdOrCtrl+.',
        click: function () {
            mainWindow.webContents.send('next_word', true);
        },
    }));
    menu.append(new electron.MenuItem({
        label: 'refresh',
        accelerator: 'CmdOrCtrl+F5',
        click: function () {
            mainWindow.loadURL(url.format({
                pathname: path.join(__dirname, 'index.html'),
                protocol: 'file:',
                slashes: true
            }))
        },
    }));
    menu.append(new electron.MenuItem({
        label: 'dev tools',
        accelerator: 'F12',
        click: function () {
            mainWindow.webContents.openDevTools();
        },
    }));
    mainWindow.setMenu(menu);
    mainWindow.setAlwaysOnTop(true);

    var is_show = true;
    var shortcut_show = electron.globalShortcut.register('CmdOrCtrl+shift+I', function () {
        !is_show && mainWindow.setSize(mainWindow.getSize()[0], 140);
        is_show = true;
        mainWindow.show();
        mainWindow.focus();
        mainWindow.webContents.send('input_focus', true);
    })
    var shortcut_hide = electron.globalShortcut.register('CmdOrCtrl+shift+H', function () {
        if (is_show) {
            mainWindow.blur();
            // mainWindow.hide();
            mainWindow.setSize(mainWindow.getSize()[0], 0);
            is_show = false;
        } else {
            mainWindow.setSize(mainWindow.getSize()[0], 140);
            mainWindow.show();
            is_show = true;
        }
    })
    if (!(shortcut_show && shortcut_show)) {
        console.log('Register hotkey failed!');
    }

    electron.ipcMain.on('set_window_size', (event, size) => {
        is_show && mainWindow && mainWindow.setSize(size.width, size.height);
    });

    // mainWindow.webContents.openDevTools();

    // and load the index.html of the app.
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }))


    //const session = mainWindow.webContents.session;
    const {
        session
    } = require('electron');
    const cookies = session.defaultSession.cookies;
    // console.log(cookies);
    cookies.on('changed', function (event, cookie, cause, removed) {

        // console.log(event, cookie, cause, removed);
        if (-1 === cookie.domain.search('baidu') && !removed) {
            // cookies.remove('https://www' + cookie.domain, cookie.name, function (data) {
            //   // console.log(data);
            // });
        }
        // session.defaultSession.clearStorageData([], function (data) {
        //   // console.log(data);
        // });
    });
    session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
        debugger;
        details.requestHeaders['User-Agent'] = 'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36';
        if (-1 !== details.url.search('https://translate.google.com/translate_tts')) {
            delete details.requestHeaders.Cookie;
        }
        callback({
            cancel: false,
            requestHeaders: details.requestHeaders
        });
    });

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })
}

/* for electron 3.x*/
// var should_quit = app.makeSingleInstance(function (commandLine, workingDirectory) {
//     // Someone tried to run a second instance, we should focus our window.
//     if (mainWindow) {
//         if (mainWindow.isMinimized()) mainWindow.restore();
//         is_show = true;
//         mainWindow.show();
//         mainWindow.webContents.send('input_focus', true);
//     }
// });
// if (should_quit) {
//     app.quit();
//     return;
// }

var is_locked = app.requestSingleInstanceLock();
if (!is_locked) {
    app.quit();
    return;
}
app.on('second-instance', function (event, commandLine, workingDirectory) {
    if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        is_show = true;
        mainWindow.show();
        mainWindow.focus();
        mainWindow.webContents.send('input_focus', true);
    }
});



// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
