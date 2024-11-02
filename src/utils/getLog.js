const { exec } = require('child_process');
const fs = require('fs').promises; // 使用fs模块的promises接口
const fsA = require('fs'); // 使用fs模块的promises接口
const path = require('path');

//获取磁盘列表
async function getDrives() {
  return new Promise((resolve, reject) => {
    exec('wmic logicaldisk get name', (error, stdout, stderr) => {
      if (error) {
        reject(error);
      }
      const drives = stdout.trim().split('\r\r\n').filter(line => line.trim() !== 'Name');
      resolve(drives);
    });
  });
}

// 递归查找目录
async function findDirectory(rootDir, directoryName) {
  const files = await fs.readdir(rootDir);
  for (const file of files) {
    if (file == directoryName && file != undefined) {
      const absolutePath = path.join(rootDir, file);
      return absolutePath
    }
  }
}

//获取目录
async function findLogsDirectory() {
  const drives = await getDrives();
  const directoryToFind = 'Wuthering Waves';
  for (const drive of drives) {
    const directoryPath = await findDirectory(drive.trim(), directoryToFind);
    if (directoryPath != undefined) {
      const logsDirectory = path.join(directoryPath, 'Wuthering Waves Game', 'Client', 'Saved', 'Logs');
      return logsDirectory
    }
  }
}
async function searchFiles(dir) {
  const regex = /https.*\/aki\/gacha\/index.html#\/record[\?=&\w\-]+/g;
  let matches = [];
  if (fsA.existsSync(dir)) {
    let filesList = []
    const files = await fs.readdir(dir);
    for (const file of files) {
      if (file !== undefined && file !== null) {
        filesList.push(file)
      }
    }
    var logFiles = filesList.filter(files => files.endsWith('.log'))
    logFiles.sort((a, b) => b.localeCompare(a));
    logFiles.forEach(filej => {
      const logdirpath = path.join(dir, filej)
      const content =  fsA.readFileSync(logdirpath, 'utf8');
      const fileMatches = content.match(regex);
      if (fileMatches !== null && fileMatches !== undefined) {
        matches.push(fileMatches)
      }
    })
  }
  return Promise.resolve(matches)
}
// 定义一个异步函数来递归查找所有 .log 文件并提取匹配的内容
async function findAndExtractLogs() {
  const dir = await findLogsDirectory()
  const matches = await searchFiles(dir);
  return matches;
}

//筛选数据的函数
async function getLog() {
  const matches = await findAndExtractLogs();
  //去重
  const uniqueArray = [...new Set(matches[0])];
  const Aarry = []
  const groupedAarryId = []
  const NewgroupedAarryId = []

  for (const matche of uniqueArray) {
    const AarryIDS = matche.split('?')[1].split('&')
    Aarry.push(AarryIDS)
  }
  //const objArray = AarryIdVaule.map((item, index) => ({ [AarryIdName[index]]: item }));//双数组合成字典

  for (const Aarryi of Aarry) {
    let Aarrygruop = []
    for (let index = 0; index < Aarryi.length; index++) {
      const element = Aarryi[index].split('=');
      Aarrygruop.push({ [element[0]]: element[1] })
    }
    groupedAarryId.push(Aarrygruop)
  }

  const combinedObject = {};
  for (let index = 0; index < groupedAarryId.length; index++) {
    groupedAarryId[index].forEach(obj => {
      Object.keys(obj).forEach(key => {
        combinedObject[key] = obj[key];
      });
    });
    NewgroupedAarryId.push(combinedObject)
  }
  return Promise.resolve(NewgroupedAarryId[0])
}

module.exports = getLog;