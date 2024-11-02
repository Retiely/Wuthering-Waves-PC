import { app, protocol, BrowserWindow, Menu, ipcMain, dialog } from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
const { userGetPost, userStartFlie, userhandleChangeFlie, depositFilePaths, GetFileInfo } = require('@/modules')
const path = require('path')

const isDevelopment = process.env.NODE_ENV !== 'production';

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
]);

async function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 1035,
    height: 600,
    resizable: false,
    webPreferences: {
      nodeIntegration: !process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: process.env.ELECTRON_NODE_INTEGRATION
    },
    icon: path.join(__dirname, '../build/icons/icon.ico'),
    title: "Wuthering Waves PC 抽卡记录工具"
  });

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    //if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol('app');
    win.loadURL('app://./index.html');
  }

  // 监听来自渲染进程的消息
  ipcMain.on('refresh-window', (event, arg) => {
    userGetPost().then(result => {
      event.reply('data-reply-result', result);
    }).catch(error => {
      event.reply('data-reply-error', error);
    });
  });

  ipcMain.on('handleChange-window', (event, arg) => {
    console.log('接收到消息：', arg);
    // 你可以在这里处理接收到的数据
    userhandleChangeFlie(arg).then(result => {
      event.reply('data-handleChange', result)
    }).catch(error => {
      // 处理错误
      event.reply('data-handleChange', error)
    });
  })

  ipcMain.on('GetFileInfo', (event, arg) => {
    let info = GetFileInfo()
    event.reply("GetFile-Info",info)
  })

  //
  ipcMain.on('GetFile-MangeChange', (event, arg) => {
    dialog.showOpenDialog({
      properties: ['openFile']
    }).then(result => {
      if (!result.canceled && result.filePaths.length > 0) {
        console.log(result.filePaths); // 打印用户选择的文件路径
        // 你可以把文件路径发送回渲染进程
        depositFilePaths(result.filePaths)
        event.reply('selected-file', result.filePaths);
      }
    }).catch(err => {
      console.log(err);
    });
  });

  ipcMain.on('finis-hreply', (event, arg) => {
    userStartFlie(arg).then(result => {
      event.reply('data-finishreply', result)
    }).catch(error => {});
  });
  //let userStartFlies = await userStartFlie()
  //setTimeout(() => {
  //  win.webContents.send('data-finishreply', userStartFlies)
  //}, 1500)
  //win.webContents.openDevTools()
}


app.whenReady().then(() => {
  createWindow();
  // 隐藏整个应用程序的菜单栏
  Menu.setApplicationMenu(null);
  // 其他需要在应用程序准备就绪后执行的代码...
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit();
      }
    });
  } else {
    process.on('SIGTERM', () => {
      app.quit();
    });
  }
}
