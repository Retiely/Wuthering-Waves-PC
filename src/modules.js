const fs = require('fs').promises; // 使用fs模块的promises接口
const fsA = require('fs'); // 使用fs模块的promises接口
const fileMamage = require('@/utils/fileManage.js')
const fetchData = require('@/utils/getPost.js');
const { exec } = require('child_process');
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
async function findDirectory(rootDir, directoryName) {
  try {
    const rootPath = `${rootDir}\\`;
    const files = await fs.readdir(rootPath, { withFileTypes: true });
    const accessPromises = [];

    for (const dirent of files) {
      if (dirent.isDirectory() && dirent.name !== 'System Volume Information' && !dirent.name.startsWith('.') && !dirent.name.startsWith('$')) {
        const fullPath = path.join(rootDir, dirent.name);
        if (dirent.name === directoryName) {
          return fullPath
        } else {
          accessPromises.push(await fs.access(fullPath, fs.F_OK).then(() => fullPath).catch(err => { }));
        }
      }
    }
    //二级目录
    const accessfulls = (await Promise.all(accessPromises)).filter(Boolean);
    for (const accessfull of accessfulls) {
      const accessfullfiles = await fs.readdir(path.join(accessfull), { withFileTypes: true });
      for (const accessfullfile of accessfullfiles) {
        if (accessfullfile.isDirectory() && accessfullfile.name !== 'System Volume Information' && !accessfullfile.name.startsWith('.') && !accessfullfile.name.startsWith('$')) {
          const fullPath = path.join(accessfull, accessfullfile.name);
          if (accessfullfile.name === directoryName && accessfullfile.name) {
            return fullPath
          }
        }
      }
    }
  } catch (err) {
    if (err.code === 'ENOENT') {
      throw err; // 重新抛限错误
    }
    if (err.code !== 'EPERM') {
      throw err; // 重新抛出非权限错误
    }
    // 忽略EPERM错误，继续执行
  }
}
//获取目录
async function findLogsDirectory() {
  const drives = await getDrives();
  const directoryToFind = 'Wuthering Waves';
  for (const drive of drives) {
    const directoryPath = await findDirectory(drive.trim(), directoryToFind);
    if (directoryPath !== undefined) {
      const logsDirectory = path.join(directoryPath, 'Wuthering Waves Game', 'Client', 'Saved', 'Logs');
      //console.log(logsDirectory)
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
      const content = fsA.readFileSync(logdirpath, 'utf8');
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
  //const dir = await findLogsDirectory()
  const configReadData = JSON.parse(fsA.readFileSync(path.join(process.cwd(), 'userData', 'config.json'), 'utf-8'))["configFile"]
  const matches = await searchFiles(configReadData);
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

async function existsExcelData(player_id, userDataPath, echartfiedAllDataS) {
  const encoded = Buffer.from(JSON.stringify(echartfiedAllDataS)).toString('base64').replace('=', '');
  //检查userData/config.json的{}是否有数据,进行添加，如果没就新建一个
  if (fsA.existsSync(path.join(userDataPath, 'config.json'))) {
    const configReadData = JSON.parse(fsA.readFileSync(path.join(userDataPath, 'config.json'), 'utf-8'))
    configReadData['optinVaule'].push([player_id, encoded])
    configReadData['current'] = player_id
    // 使用Map去重
    let uniqueOptinVaule = new Map();
    for (let [playerId, newencoded] of configReadData['optinVaule']) {
      uniqueOptinVaule.set(playerId, newencoded); // Map会自动处理键的唯一性
    }
    // 转换Map回数组格式
    let uniqueOptinVauleArray = Array.from(uniqueOptinVaule);
    configReadData['optinVaule'] = uniqueOptinVauleArray
    fsA.writeFileSync(path.join(userDataPath, 'config.json'), JSON.stringify(configReadData, null, 2), 'utf-8');
    return Promise.resolve(configReadData)
  } else {
    let configData = {
      "optinVaule": [[player_id, encoded]],
      "lang": "zh-cn",
      "current": player_id
    }
    fsA.writeFileSync(path.join(userDataPath, 'config.json'), JSON.stringify(configData, null, 2), 'utf-8');
    return Promise.resolve(configData)
  }
}

async function clearDataPie(echartfiedDataAll) {
  let echartfiedAllData = echartfiedDataAll
  let ExceldataALl = { data: [] }; // 初始化一个对象，其中包含一个空数组来存储所有祈愿活动的数据
  let ExceldataALlFilter = { data: [] };
  // 遍历echartfiedAllData对象中的每个祈愿活动
  for (const keyName of Object.keys(echartfiedAllData)) {
    const dataArray = []; // 初始化一个空数组来存储当前祈愿活动的数据
    const dataArrayFilter = []
    let ExceldataALls = {}
    // 遍历当前祈愿活动下的每个分类（例如“3星角色”、“4星角色”等）
    ExceldataALls['title'] = keyName
    for (const keyNameMember of Object.keys(echartfiedAllData[keyName])) {
      // 检查当前分类的值是否为数组，并计算其长度
      const keyNameMemberArray = Array.isArray(echartfiedAllData[keyName][keyNameMember])
      if (keyNameMemberArray && keyNameMember !== "5星顺序") {
        const length = echartfiedAllData[keyName][keyNameMember].length;
        // 创建一个对象，包含分类名称和条目数量，然后将其添加到dataArray数组中
        dataArray.push({ name: keyNameMember, value: length });
        if (length > 0 && keyNameMember !== "proportionData") {
          dataArrayFilter.push({ name: keyNameMember, value: length });
        }
      }
      if (keyNameMember === '5星顺序') {
        // 如果当前分类是subtextjs，则获取其值
        ExceldataALls['5星顺序'] = echartfiedAllData[keyName][keyNameMember]
      }
      if (keyNameMember === 'subtextjs') {
        // 如果当前分类是subtextjs，则获取其值
        ExceldataALls['subtextjs'] = echartfiedAllData[keyName][keyNameMember]
      }
      if (keyNameMember === '已抽取') {
        // 如果当前分类是subtextjs，则获取其值
        ExceldataALls['已抽取'] = echartfiedAllData[keyName][keyNameMember]
      }
      if (keyNameMember === 'proportionData') {
        // 如果当前分类是subtextjs，则获取其值
        ExceldataALls['proportionData'] = echartfiedAllData[keyName][keyNameMember]
      }
      if (keyNameMember === 'totalDraws') {
        // 如果当前分类是subtextjs，则获取其值
        ExceldataALls['totalDraws'] = echartfiedAllData[keyName][keyNameMember]
      }
      // 其他非数组类型的分类可以在此处处理或跳过
    }
    ExceldataALls['data'] = dataArrayFilter

    // 将当前祈愿活动的名称、数据数组和subtextjs作为一个对象添加到ExceldataALl对象的数组中
    ExceldataALl.data.push(ExceldataALls);

    // 检查dataArray是否为空，如果不为空，则将其添加到ExceldataALl对象的数组中
    if (dataArrayFilter.length > 0) {
      ExceldataALlFilter.data.push(ExceldataALls);
    }
  }
  return Promise.resolve(ExceldataALlFilter)
  //return ExceldataALlFilter
}
async function userGetPost() {
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
  const getLogs = NewgroupedAarryId[0]
  const userDataPath = fileMamage.addFile('userData');
  const userPlayer_idPath = path.join(userDataPath, `userExcelList-${getLogs['player_id']}.json`);
  const fetchDatas = await fetchData(userPlayer_idPath, getLogs)
  const echartfiedAllDataS = await clearDataPie(fetchDatas)
  const encodedExcel = await existsExcelData(getLogs['player_id'], userDataPath, echartfiedAllDataS)
  return Promise.resolve(encodedExcel)// 直接返回 fetchData 的结果
}
async function userStartFlie() {//开始时后读配置
  const userPlayer_idPath = path.join(process.cwd(), 'userData\\config.json');
  if (fsA.existsSync(userPlayer_idPath)) {
    const echartfiedAllDataS = JSON.parse(fsA.readFileSync(userPlayer_idPath, 'utf8'))
    if (echartfiedAllDataS["optinVaule"].length > 0) {
      return Promise.resolve(echartfiedAllDataS)
    }
    return
  }
}
async function userhandleChangeFlie(handleChangeValue) {
  const configReadData = JSON.parse(fsA.readFileSync(path.join(process.cwd(), 'userData\\config.json'), 'utf-8'))
  configReadData.current = handleChangeValue
  return Promise.resolve(configReadData)
}
async function depositFilePaths(filePaths) {
  console.log(filePaths)
  fileMamage.addFile('userData');
  let configData = {
    "optinVaule": [],
    "lang": "zh-cn",
    "current": "",
    "configFile": filePaths[0].replace('\\Client.log', '')
  }
  fsA.writeFileSync(path.join(process.cwd(), 'userData', 'config.json'), JSON.stringify(configData, null, 2), 'utf-8')
}
function GetFileInfo() {
  fileMamage.addFile('userData');
  const userPlayer_idPath = path.join(process.cwd(), 'userData\\config.json');
  if (fsA.existsSync(userPlayer_idPath)) {
    const configReadData = JSON.parse(fsA.readFileSync(path.join(process.cwd(), 'userData\\config.json'), 'utf-8'))
    return configReadData
  }
}
module.exports = { userGetPost, userStartFlie, userhandleChangeFlie, depositFilePaths, GetFileInfo };
/* 
const getLog = require('@/utils/getLog.js')
const fileMamage = require('@/utils/fileManage.js')
const fetchData = require('@/utils/getPost.js');

启动module模块 =>  getlog =>  检查userData文件夹是否存在，不存在创建 =>  fs.existsSync()检查文件是否存在{
    存在 =>  读取json文件  =>  判断文件是否为空， 如果为空则 fethData获取数据
    不存在 => fethData获取数据
}

启动 => 读配置(option的值和value的值和name的值一样的),
第一次，无文件，无数据，直接写入
*/