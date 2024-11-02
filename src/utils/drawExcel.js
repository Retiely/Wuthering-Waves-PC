const drawExcel = {}

// 画饼图的函数
drawExcel.ChartPie = function (containerId, title, data, subtextjs) {
    var chartDom = document.getElementById(containerId);
    if (!chartDom) {
        chartDom = document.createElement('div');
        chartDom.id = containerId;
        document.getElementById('echarts-cardMain').appendChild(chartDom);
    }
    let echarts = require('echarts');
    let myChart = echarts.init(chartDom, 'shine');
    let option = {
        title: {
            text: title,
            subtext: subtextjs,
            subtextStyle: {
                color: '#6b6b6b', // 副标题字体颜色
                fontSize: 12, // 副标题字体大小
            },
            bottom: 0,
            left: 'center'
        },
        tooltip: {
            trigger: 'item'
        },
        LabelLayout: {
            hideOverlap: true
        },
        legend: {
            orient: 'horizontal',
            left: '30px',
            selected: {
                '3星武器': false, // 将部分B设置为不显示
            }
        },
        series: [
            {
                type: 'pie',
                radius: '50%',
                data: data,
                emphasis: {
                    itemStyle: {
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                },
                labelLine: {
                    length: 8,
                    length2: 8
                },
            }
        ]
    };
    myChart.setOption(option);
}

drawExcel.documentText = function (ExceldataALlFilter) {
    document.documentElement.style.setProperty('--scrollbar-width', 'none');
    const notationCards = document.querySelectorAll('.notation_Card');
    // 遍历这些元素并移除它们
    notationCards.forEach(function (card) {
        card.remove();
    });

    for (const [index, Exceldata] of ExceldataALlFilter['data'].entries()) {
        // console.log(Exceldata)

        const notation_Card = document.createElement('div');
        notation_Card.id = `notation_Card${index}`
        notation_Card.className = "notation_Card"
        document.getElementById(`echarts-${index}`).appendChild(notation_Card);

        const extracted = document.createElement('div');
        extracted.id = `extracted-index${index}`
        extracted.className = "extracted"
        extracted.innerHTML = `<span>一共 <span class="css_totallNum"> ${Exceldata["totalDraws"]} </span>抽已累计<span class="css_extractedNum"> ${Exceldata["已抽取"]} </span>抽未出 5 星</span>`
        document.getElementById(`notation_Card${index}`).appendChild(extracted);

        if (Exceldata['title'] == "新手祈愿活动" || Exceldata['title'] == "武器常驻祈愿活动") {
            extracted.style.display = 'none';
        }

        const proportion = document.createElement('div');
        proportion.id = `proportion-index${index}`
        proportion.className = "proportion"
        document.getElementById(`notation_Card${index}`).appendChild(proportion);


        let colorArry = ['rgb(54, 47, 244)', 'rgb(79, 182, 78)', 'rgb(239, 38, 139)']
        // 遍历 Exceldata 中的 proportionData
        for (const key in Exceldata["proportionData"]) {
            // 创建 span 元素
            const proportionSpan = document.createElement('span');
            proportionSpan.id = `proportionSpan-${key}`;
            proportionSpan.className = `proportionSpan-${key}`;
            proportionSpan.style.marginTop = '5px'
            proportionSpan.style.marginLeft = '23px'
            proportionSpan.style.color = colorArry[key]
            proportionSpan.innerHTML = `<span class="proportionSpanStyle"><span> ${Exceldata["proportionData"][key][0].replace("占比", "")}: </span> <span> ${Exceldata["proportionData"][key][1]} </span>  <span> [${Exceldata["proportionData"][key][2]}%] </span> </span>`;

            // 将 span 元素添加到 div 中
            proportion.appendChild(proportionSpan);

            if (Exceldata['title'] === "新手祈愿活动" || Exceldata['title'] === "武器常驻祈愿活动") {
                proportionSpan.style.display = 'none';
            }
        }

        const history = document.createElement('div');
        history.id = `history-index${index}`
        history.className = "history_Card"
        history.style.marginLeft = '30px'
        history.style.marginTop = '3px'

        let result = `<span style="color:#363636;">5星历史记录：</span>`;

        let colorArryhistory = ['rgb(79, 182, 78)', 'rgb(54, 47, 244)', 'rgb(79, 182, 78)', 'rgb(239, 38, 139)', '#91cc75'];
        let colorIndex = 0; // 初始化索引变量
        if (Exceldata['5星顺序'] && Exceldata['5星顺序'].length > 0) {
            Exceldata['5星顺序'].forEach((item) => {
                // 获取当前索引对应的颜色
                let currentColor = colorArryhistory[colorIndex];
                // 递增索引，如果索引超出数组长度，则重置为0
                colorIndex = (colorIndex + 1) % colorArryhistory.length;
                //let randomIndex = Math.floor(Math.random() * colorArryhistory.length);
                result += `<span style="color:${currentColor};">${item.name}[${item.drawsDifference}]</span>\n`;
                history.innerHTML = result;
            });
        } else {
            history.innerHTML = result;
        }
        document.getElementById(`notation_Card${index}`).appendChild(history);
        if (Exceldata['title'] === "新手祈愿活动" || Exceldata['title'] === "武器常驻祈愿活动") {
            history.style.display = 'none';
        }
    }
}

drawExcel.createPie = function (configData) {
    let currentPlayerId = configData.current;
    let encodedValue = null;
    // 遍历"optinVaule"数组，寻找与currentPlayerId相匹配的player_id
    for (let [playerId, encoded] of configData.optinVaule) {
        if (playerId === currentPlayerId) {
            encodedValue = encoded;
            break; // 找到匹配项后退出循环
        }
    }
    // 解码Base64字符串
    const ExceldataALlFilter = JSON.parse(Buffer.from(encodedValue, 'base64').toString())

    const echartChildCard = document.querySelectorAll('.echartChildCard');
    // 遍历这些元素并移除它们
    echartChildCard.forEach(function (card) {
        card.remove();
    });
    // 循环创建饼图
    for (const [index, Exceldata] of ExceldataALlFilter['data'].entries()) {
        //console.log(index, Exceldata); // 输出索引和对应的元素

        const echartCard = document.createElement('div');
        echartCard.id = `echarts-${index}`
        echartCard.className = `echarts-ChildCard-${index} echartChildCard`
        echartCard.style.marginLeft = '10px'
        document.getElementById('echarts-cardMain').appendChild(echartCard);

        // 创建一个新的<div>元素作为饼图的容器
        const container = document.createElement('div');
        container.id = `echarts-pie-${Exceldata['title'].replace(/\s+/g, '')}`; // 创建一个基于标题的唯一ID
        container.style.width = '320px'; // 设置容器宽度
        container.style.height = '320px'; // 设置容器高度
        document.getElementById(`echarts-${index}`).appendChild(container); // 将容器添加到#echarts-cardMain下

        if (Exceldata['title'] == "新手祈愿活动" || Exceldata['title'] == "武器常驻祈愿活动") {
            container.style.display = 'none'; // 设置容器宽度
        }
        // 调用ChartPie函数来初始化饼图
        drawExcel.ChartPie(container.id, Exceldata['title'], Exceldata['data'], Exceldata["subtextjs"]);
    }
    drawExcel.documentText(ExceldataALlFilter)
}

drawExcel.optinVauleList = function (configData) {
    // 使用map函数提取所有的player_id
    let playerObjects = configData.optinVaule
        .filter(([playerId]) => playerId !== configData.current)
        .map(([playerId, encoded]) => ({
            value: playerId,
            label: playerId
        }));
    return { "option": playerObjects, "current": configData.current }
}
module.exports = drawExcel;