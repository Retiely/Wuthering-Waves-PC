const fs = require('fs');
const path = require('path');
const fileMamage = {}

fileMamage.addFile = function (newDirName) {
    // 新目录的完整路径
    const newDirPath = path.join(process.cwd(), newDirName);
    //const newDirPath = path.join(parentDir, newDirName);
    // 创建新目录
    fs.mkdir(newDirPath, { recursive: true }, (err) => {
        if (err) {
            console.error(err);
        }
    });
    return newDirPath
};

fileMamage.existsFile = function (newDirName) {
    // 获取当前文件的目录
    const currentDir = path.dirname(__filename);

    // 获取上一级目录
    const parentDir = path.join(currentDir, '..');

    // 要检查的目录的完整路径
    const dirPath = path.join(parentDir, newDirName);

    // 检查目录是否存在
    fs.access(dirPath, fs.constants.F_OK, (err) => {
        if (err) {
            fileMamage.addFile(newDirName)
        } else {
            // 目录已存在
            return {}
        }
    });
}

fileMamage.createFile = function (filePath, filedata) {
    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, JSON.stringify(filedata, null, 2), (err) => {
            if (err) {
                reject(err); // 写入失败时，返回错误
            } else {
                resolve({ code: 1 }); // 写入成功时，返回{code: 1}
            }
        });
    });
}

fileMamage.userStartExistsSync = function(userPlayer_idPath){
    if (fs.existsSync(userPlayer_idPath)) {
        const echartfiedAllDataS = fs.readFileSync(userPlayer_idPath, 'utf8');
        return echartfiedAllDataS
    }
}
module.exports = fileMamage;
