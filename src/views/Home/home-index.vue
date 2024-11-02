<template>
  <div id="Card-Main">
    <div class="Card-MainHeader">
      <div class="Main-Header-card">
        <div class="Header-card">
          <div id="refresh-button" class="button-card">
            <button id="refreshButton" @click="refreshButton()"><span class="iconfont icon-shuaxin"></span>
              更新数据</button>
          </div>
          <div id="export-excel" class="button-card">
            <button id="exportExcel"><span class="iconfont icon-wenjianjia1"></span> 导出Excel</button>
          </div>
          <div id="add-data" class="button-card">
            <button id="addData"><span class="iconfont icon-tianjia"></span></button>
          </div>
        </div>
        <div class="Header-card-tip">
          <div id="tip-error">{{ tipError }}</div>
        </div>
      </div>
      <div class="Main-end-card">
        <div class="dropdown">
          <el-select v-model="selectModelValue" :placeholder="placeholderValue" @change="handleChange">
            <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </div>
        <div id="configuration-setting" class="button-card setting-card">
          <router-link to="/Manage"><button id="configurationSetting"><span
                class="iconfont icon-shezhi"></span></button></router-link>
        </div>
      </div>
    </div>
    <div class="Card-MainBottom">
      <div id="echarts-cardMain"></div>
    </div>
  </div>
</template>

<script>
const { ipcRenderer } = window.require('electron');
const drawExcel = require('@/utils/drawExcel');

export default {
  data() {
    return {
      options: '',
      placeholderValue: "新账号",
      selectModelValue: "",// 当前选中的值  
      tipError: "请打开游戏内任意一个抽卡记录后再点击“更新数据”按钮"
    }
  },
  methods: {
    // 处理选项变化的方法  
    handleChange(value) {
      // 在这里可以根据value执行查询操作  
      ipcRenderer.send('handleChange-window', value);
    },
    refreshButton() {
      ipcRenderer.send('refresh-window');
    }
  },
  mounted() {
    setTimeout(() => {
      ipcRenderer.send('finis-hreply');
    }, 300)
    // 监听来自主进程的数据回复
    ipcRenderer.on('data-reply-result', (event, data) => {
      this.tipError = "请打开游戏内任意一个抽卡记录后再点击“更新数据”按钮"
      if (data !== undefined && data !== null) {
        let echartfiedAllData = data;
        drawExcel.createPie(echartfiedAllData)
        let optinList = drawExcel.optinVauleList(echartfiedAllData)
        this.options = optinList.option
        this.placeholderValue = optinList.current
      } else {
        this.tipError = "操作失败 - 获取 打开游戏 记录失败 "
      }
    });
    ipcRenderer.on('data-reply-error', (event, error) => {
      console.log(error)
      this.tipError = error['text']
    });

    ipcRenderer.on('data-finishreply', (event, data) => {
      // 处理从主进程接收到的数据
      this.tipError = "请打开游戏内任意一个抽卡记录后再点击“更新数据”按钮"
      if (data !== undefined && data !== null) {
        let echartfiedAllData = data;
        drawExcel.createPie(echartfiedAllData)
        let optinList = drawExcel.optinVauleList(echartfiedAllData)
        this.options = optinList.option
        this.placeholderValue = optinList.current
      } else {
        this.tipError = "操作失败 - 获取历史 游戏 抽卡记录失败"
      }
    });

    ipcRenderer.on('data-handleChange', (event, data) => {
      this.tipError = "请打开游戏内任意一个抽卡记录后再点击“更新数据”按钮"
      console.log(data)
      if (data !== undefined && data !== null) {
        let echartfiedAllData = data;
        drawExcel.createPie(echartfiedAllData)
        let optinList = drawExcel.optinVauleList(echartfiedAllData)
        this.options = optinList.option
        this.placeholderValue = optinList.current
      } else {
        this.tipError = "切换操作失败 - 请重新 打开 游戏 抽卡记录"
      }
    })
  }
};
</script>


<style>
.Card-MainHeader {
  width: 100%;
  height: 80px;
  display: flex;
  flex-direction: row;
}

.Main-Header-card {
  position: relative;
  width: 80%;
  height: 60px;
  display: flex;
  flex-direction: column;
}

.Main-end-card {
  width: 25%;
  display: flex;
  height: 80px;
  flex-direction: row;
}

.Card-MainHeader .button-card {
  position: relative;
  margin: 20px 10px;
}

.Card-MainHeader .select-card {
  position: relative;
  margin: 20px 10px;
}

.dropdown {
  position: relative;
  margin: 20px 10px;
}

/* left button.css */

.button-card button {
  width: 100px;
  height: 35px;
  box-shadow: none;
  border: none;
  background: rgb(255, 255, 255);
  border-radius: 3px;
  box-shadow: 0px 0px 4px;
  text-align: center;
  text-shadow: #464646;
  outline: none;
}

.button-card button {
  text-align: center;
  text-wrap: 2px;
  word-wrap: 2px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

#refresh-button button {
  color: #409EFF;
}

#refresh-button button:hover {
  color: #ffff;
  background: #409EFF;
}

#export-excel button {
  color: #44b10e;
}

#export-excel button:hover {
  color: #ffff;
  background-color: #44b10e;
  /* 获取焦点时的背景色 */
}

#add-data button {
  width: 50px;
  color: rgba(99, 99, 99, 0.658);
}

/*下拉菜单卡片*/

.dropdown button {
  width: 120px;
  height: 35px;
  box-shadow: none;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  box-shadow: 0px 0px 8px rgba(14, 14, 14, 0.2);
  text-align: center;
  text-shadow: #464646;
  outline: none;
  cursor: pointer;
  color: #000000ad;
}

.dropdown button span {
  margin-left: 10px;
  text-align: center;
}

.dropdown-card {
  position: relative;
  width: 120px;
  border: 1px solid #f5f5f5b9;
  top: 10px;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.5s, visibility 0.2s;
  z-index: 1;
  border-radius: 3px;
  box-shadow: 0px 0px 8px rgba(14, 14, 14, 0.2);
  display: flex;
  flex-direction: column;
  background-color: #fff;
}

.dropdown-card .dropdown-card-bubbleup {
  position: relative;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 7px 7px;
  border-color: transparent transparent rgba(14, 14, 14, 0.1);
  top: -8px;
  left: 30px;
}

.dropdown-card .dropdown-card-bubbleup:after {
  content: '';
  border-style: solid;
  border-width: 0 7px 7px;
  border-color: transparent transparent #fff;
  position: absolute;
  top: 2px;
  margin-left: -7px;
}

.dropdown.open .dropdown-card {
  opacity: 1;
  visibility: visible;
}

.dropdown-card div.dropdown-card-select-content {
  margin: 0px;
  padding: 0px;
  height: 35px;
  line-height: 35px;
  font-size: 12px;
  justify-content: center;
  text-align: center;
  margin: 3px 0px;
  color: #000;
  font-weight: 540;
  text-align: center;
  text-shadow: #464646;
}

.dropdown-card:hover div.dropdown-card-select-content {

  color: #409EFF
}


/*right style*/
#configurationSetting {
  width: 50px;
  height: 35px;
  box-shadow: none;
  border: none;
  background: rgb(255, 255, 255);
  border-radius: 3px;
  box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.3);
  text-align: center;
  text-shadow: #464646;
  outline: none;
  font-size: 16px;
  font-weight: bolder;
  text-align: center;
}

#configurationSetting span {
  color: #00000091;
}

/* styles.css */
#Card-Main {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  background-color: #fff;
}

.Card-MainBottom {
  margin-top: 10px;
  width: 100%;
  height: fit-content;
}

/*echart style*/
#echarts-cardMain {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}

.echarts-ChildCard {
  width: 300px;
  height: 100%;
  background-color: wheat;
  display: flex;
  flex-direction: column;
  margin: 0px 10px;
}

/* Add styles here to customize the appearance of your app */
.notation_Card {
  width: 320px;
  font-size: 12px;
}

.extracted {
  margin: 8px 32px;
  color: #4d4d4d;
}

.css_totallNum {
  color: #19C723;
}

.css_extractedNum {
  color: #409EFF;
}

.proportion {
  display: flex;
  flex-direction: column;
}

.proportionSpanStyle span {
  margin: 0px 8px;
}

div#tip-error {
  margin: 8px 0px;
  font-size: 12px;
  color: #8b8989;
  user-select: none;

}

.Header-card {
  display: flex;
  flex-direction: row;
}

.Header-card-tip {
  position: absolute;
  bottom: -30px;
  left: 10px;
}
</style>
