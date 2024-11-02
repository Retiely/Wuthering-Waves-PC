const https = require('https');
const fileManage = require('@/utils/fileManage');
const path = require('path')
async function cleanClassifyData(activityData) {
    const classActivityData = {};

    // 迭代对象的键
    for (const key of Object.keys(activityData)) {
        const classifiedData = {
            '3星武器': [],
            '4星角色': [],
            '4星武器': [],
            '5星角色': [],
            '5星武器': [],
            '5星顺序': []// 存储5星物品名称、顺序、与前一个5星的时间差和抽取数之差
        };

        const proportionData = []
        let totalDraws = 0; // 总抽取次数
        let last5StarDraws = 0; // 上一个5星物品时的抽取次数
        let drawsAfterLast5Star = 0; // 最后一个5星物品之后的数据条数

        // 根据time属性对数据进行排序（这里应该是对整个活动数据排序，而不是只针对“角色祈愿活动”）
        const sortedData = [...activityData[key].data].reverse();


        // 转换时间格式为"YYYY/MM/DD"
        const formatTime = (timeString) => {
            const [date, time] = timeString.split(" ");
            const [year, month, day] = date.split("-");
            return `${year}/${month}/${day}`;
        };

        if (sortedData.length > 0) {
            const firstTime = sortedData[0].time;
            const lastTime = sortedData[sortedData.length - 1].time;
            // 格式化时间范围
            const timeRange = `${formatTime(firstTime)} - ${formatTime(lastTime)}`;
            classifiedData['subtextjs'] = timeRange
        } else {
            classifiedData['subtextjs'] = ""
        }

        /*
        const firstTime = sortedData[0].time;
        const lastTime = sortedData[sortedData.length - 1].time;
        // 格式化时间范围
        const timeRange = `${formatTime(firstTime)} - ${formatTime(lastTime)}`;
        classifiedData['subtextjs'] = timeRange
         */
        sortedData.forEach((item, index) => {
            totalDraws++; // 每次迭代都增加总抽取次数

            if (item.qualityLevel === 3) {
                if (item.resourceType === "武器") {
                    classifiedData['3星武器'].push(item);
                }
            }
            if (item.qualityLevel === 4) {
                if (item.resourceType === "角色") {
                    classifiedData['4星角色'].push(item);
                } else if (item.resourceType === "武器") {
                    classifiedData['4星武器'].push(item);
                }
            }
            if (item.qualityLevel === 5) {
                classifiedData['5星顺序'].push({
                    name: item.name,
                    drawsDifference: totalDraws - last5StarDraws
                });

                if (item.resourceType === "角色") {
                    classifiedData['5星角色'].push(item);
                } else if (item.resourceType === "武器") {
                    classifiedData['5星武器'].push(item);
                }

                last5StarDraws = totalDraws;
            }
            classifiedData['AllTotal'] = totalDraws
        });

        // 计算最后一个5星物品之后的数据条数
        if (classifiedData['5星顺序'].length > 0) {
            drawsAfterLast5Star = totalDraws - last5StarDraws;
            // 如果需要，可以将这个值添加到classifiedData中
            classifiedData['已抽取'] = drawsAfterLast5Star;
        } else {
            // 如果没有5星物品，则计算3星和4星物品的总数
            drawsAfterLast5Star =
                classifiedData['3星武器'].length +
                classifiedData['4星角色'].length +
                classifiedData['4星武器'].length;
            classifiedData['已抽取'] = drawsAfterLast5Star; // 在这种情况下，这个值实际上就是全部抽取次数
        }

        proportionData.push(['5星占比', classifiedData['5星角色'].length + classifiedData['5星武器'].length, ((classifiedData['5星角色'].length + classifiedData['5星武器'].length) / totalDraws * 100).toFixed(2)])
        proportionData.push(['4星占比', classifiedData['4星角色'].length + classifiedData['4星武器'].length, ((classifiedData['4星武器'].length + classifiedData['4星武器'].length) / totalDraws * 100).toFixed(2)])
        proportionData.push(['3星占比', classifiedData['3星武器'].length, ((classifiedData['3星武器'].length) / totalDraws * 100).toFixed(2)])

        classifiedData['proportionData'] = proportionData
        classifiedData['totalDraws'] = totalDraws

        classActivityData[key] = classifiedData;
    }
    return Promise.resolve(classActivityData);
}

async function postDatahttp(cardPoolTypeNum, postData) {
    /*
    const postDataS = JSON.stringify({
        "cardPoolId": 'e26a7298d0a0eaa6362918abe0ff8901',
        "cardPoolType": cardPoolTypeNum,
        "languageCode": "zh-Hans",
        "playerId": "107457030",
        "recordId": "d18d81683d5a9c4ab6bfcf9b127ebd4b",
        "serverId": '76402e5b20be2c39f095a152090afddc'
    });
    const postDataS = JSON.stringify({
        "playerId": postData['player_id'],
        "cardPoolId": postData['resources_id'],
        "cardPoolType": cardPoolTypeNum,
        "serverId": postData['svr_id'],
        "languageCode": postData['lang'],
        "recordId": postData['record_id']
    })
     */
    const postDataS = JSON.stringify({
        "playerId": postData['player_id'],
        "cardPoolId": postData['resources_id'],
        "cardPoolType": cardPoolTypeNum,
        "serverId": postData['svr_id'],
        "languageCode": postData['lang'],
        "recordId": postData['record_id']
    })

    const options = {
        hostname: 'gmserver-api.aki-game2.com',
        port: 443,
        path: '/gacha/record/query',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': postDataS.length,
            'Accept': 'application/json, text/plain, */*',
            'Origin': 'https://aki-gm-resources.aki-game.com',
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.2; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36',
            'Referer': 'https://aki-gm-resources.aki-game.com/',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'sec-ch-ua': '"Chromium";v="92"',
            'sec-ch-ua-mobile': '?0'
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                try {
                    const parsedResponse = JSON.parse(responseData);
                    resolve(parsedResponse);
                } catch (err) {
                    reject(err);
                }
            });

        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(postDataS);
        req.end();
    });
}
//postDatahttp()
async function fetchData(userPlayer_idPath, postLogData) {
    let cardPoolTypeS = [
        [1, '角色祈愿活动'],
        [2, '武器祈愿活动'],
        [3, '角色常驻祈愿活动'],
        [4, '武器常驻祈愿活动'],
        [5, '新手祈愿活动']
    ];
    let DataResponse = {};
    for (const cardPoolType of cardPoolTypeS) {
        const postDataResponse = await postDatahttp(cardPoolType[0], postLogData);
        // postDataResponse['data'],可能为空，就是没抽
        if (postDataResponse['code'] !== -1) {
            DataResponse[cardPoolType[1]] = postDataResponse; // 使用方括号来设置动态键名
        } else {
            //return Promise.reject({ code: -1, text: "操作失败 - 请重新 打开 游戏 抽卡记录" ,data:[postLogData,postDataResponse['data']]});
            return Promise.reject({ code: -1, text: "操作失败 - 请重新 打开 游戏 抽卡记录" });
        }
    }
    fileManage.createFile(path.join(process.cwd(), 'userData', `userExcelList-1134.json`), DataResponse)
    let processedData = await cleanClassifyData(DataResponse, userPlayer_idPath);
    fileManage.createFile(userPlayer_idPath, processedData)
    return Promise.resolve(processedData);
}

module.exports = fetchData;

