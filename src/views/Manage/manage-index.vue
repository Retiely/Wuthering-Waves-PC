<template>
    <div class="Manage-box">
        <div class="Manage-box-header">
            <div class="Manage-box-header-guanbi">
                <router-link to="/Home"><span id="iconGuanbi" class="iconfont icon-guanbi"></span></router-link>
            </div>
        </div>
        <div class="Manage-box-bottom">
            <div class="flieManage-box">
                <el-button @click="getFile">配置路径</el-button>
                <el-input class="inputVaule" v-model="inputText" :disabled="true" />
            </div>
        </div>
    </div>
</template>

<script>
const { ipcRenderer } = window.require('electron');
export default {
    data() {
        return {
            inputText: ''
        }
    },
    methods: {
        getFile() {
            // 触发文件选择框
            ipcRenderer.send('GetFile-MangeChange');
            // 监听主进程回复的文件路径
            ipcRenderer.on('selected-file', (event, path) => {
                console.log('Selected file:', path);
                // 在这里，你可以使用用户选择的文件路径
                this.inputText = path[0]
            });
        }
    },
    mounted() {
        // 使用箭头函数确保 this 指向 Vue 实例
        (() => {
            ipcRenderer.send('GetFileInfo');
            ipcRenderer.on('GetFile-Info', (event, pathInfo) => {
                console.log(pathInfo)
                if (pathInfo) {
                    this.inputText = pathInfo["configFile"]; // this 现在指向 Vue 实例
                }else{
                    this.inputText = ""
                }
            });
        })();
    }
}
</script>
<style scoped>
a {
    text-decoration-line: none;
}

body {
    position: relative;
    margin: 0px;
    border: 0px;
    background-color: rgb(255, 255, 255);
}

.Manage-box {
    position: relative;
    width: auto;
    height: auto;
    box-shadow: 0px 0px 10px #b8b8b8;
    border-radius: 3px;
}

.Manage-box-header {
    width: 100%;
    height: 45px;
    display: flex;
    flex-direction: row-reverse;
    border-radius: 3px;
}

span#iconGuanbi {
    font-size: 32px;
    color: #b8b8b8;
}

/*Manage-box-bottom */
.Manage-box-bottom {
    position: relative;
    height: 510px;
}

.flieManage-box {
    position: relative;
    margin: 0px 20px;
    display: flex;
    flex-direction: row;
}

.inputVaule {
    margin: 0px 40px;
}
</style>