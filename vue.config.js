const { defineConfig } = require('@vue/cli-service')
const path = require('path')
module.exports = defineConfig({
  pages: {
    index: {
      entry: 'src/main.js',
      title: "Wuthering Waves PC 抽卡记录工具",
    }
  },
  transpileDependencies: true,
  pluginOptions: {
    electronBuilder: {
      externals: ['getLog','userGetPost'],
      // If you are using Yarn Workspaces, you may have multiple node_modules folders
      // List them all here so that VCP Electron Builder can find them
      nodeModulesPath: ['../../node_modules', './node_modules'],
      customFileProtocol: "./",
      builderOptions: {
        "asar": false,
        "appId": "com.Wuthering.WavesPC",
        "productName": "Wuthering Waves PC 抽卡记录工具", //项目名，也是生成的安装文件名，即aDemo.exe
        "copyright": "Copyright © 2020", //版权信息
        "win": {
          "icon": path.join(__dirname, "./build/icons/icon.ico"),
          "target": "nsis", //利用nsis制作安装程序
        },
        "extraFiles":["./userData"],
        "nsis": {
          "oneClick": false, // 是否一键安装
          "allowElevation": true, // 允许请求提升。 如果为false，则用户必须使用提升的权限重新启动安装程序。
          "allowToChangeInstallationDirectory": true, // 允许修改安装目录
          "installerIcon": "./build/icons/icon.ico", // 安装图标
          "uninstallerIcon": "./build/icons/icon.ico", //卸载图标
          "installerHeaderIcon": "./build/icons/icon.ico", // 安装时头部图标
          "createDesktopShortcut": true, // 创建桌面图标
          "createStartMenuShortcut": true, // 创建开始菜单图标
          "shortcutName": "icon", // 图标名称
        },
      }
    }
  }
})
