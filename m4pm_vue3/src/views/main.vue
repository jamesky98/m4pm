<script setup>
import Footer1 from "../components/Footer.vue";
import Navbar1 from "../components/Navbar.vue";
import path from "path-browserify";
import {
  MDBInput,
  MDBTextarea,
  MDBCol,
  MDBRow,
  MDBContainer,
  MDBSelect,
  MDBDatepicker,
  MDBBtn,
  MDBPopconfirm,
  MDBSpinner,
  MDBAnimation,
  MDBAlert,
  MDBModal,
  MDBModalHeader,
  MDBModalTitle,
  MDBModalBody,
  MDBModalFooter,
  MDBTabs,
  MDBTabNav,
  MDBTabContent,
  MDBTabItem,
  MDBTabPane,
  MDBSwitch,
} from 'mdb-vue-ui-kit';
import { ref, onMounted, provide, inject, watch, reactive, toRaw } from "vue";
import { computed } from "@vue/reactivity";

// 判斷token狀況
import { useQuery, useMutation } from '@vue/apollo-composable';
import UsersGQL from "../graphql/Users";
import CaseGQL from "../graphql/Case";
import { errorHandle, logIn, logOut, toTWDate } from '../methods/User';
import jQuery from "jquery";
Object.assign(window, { $: jQuery, jQuery });

const { mutate: getchecktoken } = useMutation(UsersGQL.CHECKTOKEN);
getchecktoken().then(res=>{

}).catch(e=>{
  errorHandle(e,infomsg,alert1);
});

//#region 取得權限==========Start
  const myUserName = ref("");
  const myUserRole = ref("");

  const { onResult: getNowUser, refetch: refgetNowUser } = useQuery(UsersGQL.GETNOWUSER);
  getNowUser(result => {
    if (!result.loading && result && result.data.getNowUser) {
      let getData = result.data.getNowUser;
      myUserName.value = getData.user_name;
      myUserRole.value = getData.role;
    }
  });refgetNowUser();

  const rGroupSetting = inject("rGroupSetting");
  const rGroup = computed(() => {
    let opt1=false;
    if (parseInt(myUserName.value) === parseInt(nowCaseOperator.value)){
      opt1=true;
    }
    return rGroupSetting(myUserRole.value,opt1)
  });
  provide("rGroup", rGroup);
//#endregion 取得權限==========End

//#region 參數==========Start
  // 基本參數
  const NavItem = ref("main");
  provide("NavItem", NavItem);
  const infomsg = ref("");
  const alert1 = ref(false);
  const alertColor = ref("primary");
  const updateKey = ref(0);
  const publicPath = inject('publicPath');

  // 版型參數
  const rightToolWidth = ref(25); // 25rem
  const leftCaseWidth = ref(12); // 12rem
  const leftCaseHeight = ref(6); // 12rem
  const topTimeToolH = ref(4); // 2rem
  const topTBarHeight = ref(2.5); // 2rem

  // 時間軸參數
  const mouseX = ref("");
  const mouseY = ref("");
  const pointerX = ref("");
  const pointerY = ref("");
  const isPointerFix = ref(false);
  const timebarStart = ref("");
  const timebarEnd = ref("");
  
  const timebarWidth = ref("");
  const pointerWidth = ref(1); // 游標寬度

  // 日期參數
  const timebarFirstDateNum = ref(""); // 起始日
  const timebarLastDateNum = ref(""); // 結束日
  const timebarPtDateNum = ref(""); // 游標所在日
  const timebarToDayNum = ref(""); // 今日

  const timebarFirstDateStr = ref("");
  const timebarLastDateStr = ref("");
  const timebarPtDateStr = ref("");
  const timebarToDayStr = ref(""); // 今日

  const timebarTypeLoop = ref(3); // 循環種類數
  const timebarType = ref(0); // 0:年 1:季 2:月 3:週
  const timebarStepList = ref(['年','季','月','週']); // 0:年 1:季 2:月 3:週
  // 矩陣第0行為閏年，第1行為非閏年
  const mounthDays = [[31,29,31,30,31,30,31,31,30,31,30,31],[31,28,31,30,31,30,31,31,30,31,30,31]]; // 各月份日數
  const weekDays = ['日','一','二','三','四','五','六']
  // 0:年(顯示12個月) 1:季(顯示3個月) 2:月(顯示該月天數) 3:週
  const tStep = computed(()=>{
    // let dateobj = new Date(timebarFirstDateNum.value);
    // let isLeapY = (dateobj.getFullYear() % 4===0)?0:1;
    // let mdays = mounthDays[isLeapY][dateobj.getMonth()];
    return [12, 3, 31]
  });

  const tbarDOM = ref();
  const tbarPointer = ref();
  const tbarItem = ref([]);

  var rtime;
  var timeout = false;
  var delta = 200;

  // Case參數==============Start
  const allCases = ref([]);
  const nowCaseID = ref("");
  const nowCaseCode = ref("");
  const nowCaseActive = ref(1);
  const nowCaseData = reactive({});
  const nowCaseParentId = ref("");
  const nowCaseOperator = ref("");
  const nowCaseName = ref("");
  // Case參數==============End

//#endregion 參數==========End


// #region 時間軸==========Start
  // 取得時間軸起迄位置
  function getTBarSize(){
    return new Promise((res,rej)=>{
      let div=document.getElementById('timepointer');
      tbarPointer.value = div;
      let timebar=document.getElementById('timebar');
      tbarDOM.value = timebar;

      const parentXY = getPosition(timebar);
      let borderWidth = pointerWidth.value;
      let boxLeft = parentXY.x;
      let boxWidth = timebar.offsetWidth - borderWidth;
      let boxRight = boxLeft + timebar.offsetWidth;
      

      timebarStart.value = boxLeft;
      timebarEnd.value = boxRight;
      timebarWidth.value = boxWidth;

      let TbarSize = {
        boxLeft: boxLeft,
        boxWidth: boxWidth,
        boxRight: boxRight,
        borderWidth: borderWidth,
      }
      res(TbarSize);
    })
  }
  // 游標移動處理事件
  async function movetimepointer(){
    // console.log('movetimepointer');
    if (isPointerFix.value){return}
    let div=document.getElementById('timepointer');
    let tbarSize = await getTBarSize();
    if (!div) {
      return;
    }
    div.style.display = 'block';
    let intX=window.event.clientX;
    mouseX.value = intX;
    let intY=window.event.clientY;
    mouseY.value = intY;

    if(!intX){
      intX = 0;
    }
    // 計算游標位置，要扣除右邊的邊框寬度
    let parentBase = tbarSize.boxLeft;
    if( intX < tbarSize.boxLeft){
      div.style.left = "0px";
    }else if(intX > (tbarSize.boxRight-tbarSize.borderWidth)){
      div.style.left= (tbarSize.boxWidth) +"px";
    }else{
      div.style.left=(intX-tbarSize.boxLeft)+"px";
    }
    // 顯示游標座標
    const pointerXY = getPosition(div);
    pointerX.value = pointerXY.x - pointerWidth.value;
    pointerY.value = pointerXY.y;

    // 將座標轉換成日期
    // 起始日timebarFirstDateNum 起始座標timebarStart+1為起始日
    // 結束日timebarLastDateNum 結束座標timebarEnd為結束日
    // 目前座標pointerX

    let nowDateNum = parseInt((pointerX.value - timebarStart.value) / timebarWidth.value * (timebarLastDateNum.value - timebarFirstDateNum.value) + timebarFirstDateNum.value); //與起始距離
    
    timebarPtDateNum.value = nowDateNum;
    timebarPtDateStr.value = toLocalDateString(new Date(nowDateNum))+ '(' +weekDays[new Date(nowDateNum).getDay()]+ ')';
  }
  // 取得物件之螢幕座標
  function getPosition (element) {
    var x = 0;
    var y = 0;
    // 搭配上面的示意圖可比較輕鬆理解為何要這麼計算
    while ( element ) {
      x += element.offsetLeft - element.scrollLeft + element.clientLeft;
      y += element.offsetTop - element.scrollLeft + element.clientTop;
      element = element.offsetParent;
    }
    return { x: x, y: y };
  }
  // 設定初始時間軸起始點
  function initFirstDate(){
    let nowDate = new Date();
    // console.log('nowDate',nowDate);
    let firstDateObj = new Date(nowDate.getFullYear(),0,1);
    // console.log('firstDateObj',firstDateObj);
    timebarFirstDateNum.value = firstDateObj.valueOf();
    timebarFirstDateStr.value = toLocalDateString(firstDateObj);
    
    // 設定結束日
    setlastDate();

    getTBarSize().then(res=>{
      // console.log('tbarSize',res)
      buildTimeStep();
    });
  }
  // 設定結束日期
  function setlastDate(){
    let type = timebarType.value;
    let firstDate = new Date(timebarFirstDateNum.value);
    let lastDate;
    let lastDateYY;
    let lastDateMM;
    let lastDateFD;
    let lastDateDD;
    let totalStep = tStep.value[type];
    if(type<2){
      // 以年顯示，內部顯示12個月，以3個月移動，結束為該年最後一日
      // 以季顯示，內部顯示3個月，以1個月移動 
      lastDateYY = firstDate.getFullYear();
      lastDateMM = firstDate.getMonth() + totalStep -1; // 顯示增加11個月
      lastDateFD = new Date(lastDateYY,lastDateMM,1); // 取得結束月的第1天
      // console.log('lastDateFD',lastDateFD);
      lastDateDD = mounthDays[((lastDateFD.getFullYear() % 4)===0)?0:1][lastDateFD.getMonth()]; // 取得結束月的最後1天
      lastDate = new Date(lastDateFD.getFullYear(),lastDateFD.getMonth(),lastDateDD,23,59,59); // 以UTC建立避免時區問題
      // console.log('lastDate',lastDate)
    }else if(type===2){
      // 以月顯示，內部顯示為日，以1個日移動
      lastDateYY = firstDate.getFullYear();
      lastDateMM = firstDate.getMonth();
      lastDateDD = firstDate.getDate()+30; // 取得結束月的最後1天
      lastDate = new Date(lastDateYY,lastDateMM,lastDateDD,23,59,59); // 以UTC建立避免時區問題
      // console.log('lastDate',lastDate)
    }else if(type===3){
      // 以週顯示
    }
    timebarLastDateNum.value = lastDate.valueOf();
    timebarLastDateStr.value = toLocalDateString(lastDate);
    return lastDate.valueOf()
  }
  // 轉換日期文字
  function toLocalDateString(dateobj){
    return dateobj.getFullYear() + '-' + (dateobj.getMonth()+1).toString().padStart(2, '0') + '-' + dateobj.getDate().toString().padStart(2, '0');
  }
  // 變更年季月種類
  function changeTimeBarType(){
    timebarType.value=((timebarType.value+1) % timebarTypeLoop.value);
    let type = timebarType.value;
    // 設定起始日
    let nowFirstDateObj = new Date(timebarFirstDateNum.value);
    let nowY = nowFirstDateObj.getFullYear();
    
    if(type===0){
      // 年的第1天
      let setFirstDateObj = new Date(nowY,0,1);
      timebarFirstDateNum.value = setFirstDateObj.valueOf();
    }else if(type===1){
      // 1,4,7,10月的第1天
    }else if(type===2){
      // 月的第1天
    }else if(type===3){

    }
    updateTBar();
  }
  // 更新時間軸
  function updateTBar(){
    // 更新結束日
    new Promise((res,rej)=>{
      res(setlastDate());
    }).then(res=>{
      // 更新時間軸
      buildTimeStep();
    })
  }

  // 移動時間軸
  function moveTBar(direct){
    // console.log('preTBar');
    let type = timebarType.value;
    let nowFD = new Date(timebarFirstDateNum.value);
    let nowFD_Y = nowFD.getFullYear();
    let nowFD_M = nowFD.getMonth();
    let nowFD_D = nowFD.getDate();

    let updateFD_Y;
    let updateFD_M;
    let updateFD_D;

    let firstDateObj;
    updateFD_Y = nowFD_Y;
    if(type===0){
      // 以年顯示，內部顯示12個月，以3個月移動，結束為該年最後一日
      updateFD_M = nowFD_M + (direct * 3);
      updateFD_D = nowFD_D;
    }else if(type===1){
      // 以季顯示，內部顯示3個月，以1個月移動
      updateFD_M = nowFD_M + (direct * 1);
      updateFD_D = nowFD_D; 
    }else if(type===2){
      // 以月顯示，內部顯示為日，以1個日移動
      updateFD_M = nowFD_M;
      updateFD_D = nowFD_D + (direct * 1); 
    }else if(type===3){
      // 以週顯示
    }
    firstDateObj = new Date(updateFD_Y,updateFD_M,updateFD_D);
    timebarFirstDateNum.value = firstDateObj.valueOf();
    timebarFirstDateStr.value = toLocalDateString(firstDateObj);
    updateTBar();
  }
  
  // 創建時間軸刻度
  function buildTimeStep(){
    let type = timebarType.value;
    let firstDateObj = new Date(timebarFirstDateNum.value);
    let tempY = firstDateObj.getFullYear();
    let tempM = firstDateObj.getMonth();
    let tempD = firstDateObj.getDate();
    let tBarWidth = timebarWidth.value
    let tBarList = [];
    let sumWidth = 0;
    let passTime = timebarLastDateNum.value - timebarFirstDateNum.value;
    let tBarTotalDays = (passTime / 1000 / 60 / 60 / 24);
    let tempDateObj;
    let stepNum;
    let stepUnit;

    let totalStep = tStep.value[type];
    // console.log('totalStep',totalStep)
    for(let i=0;i<totalStep;i++){
      if(type<2){
        // 以年顯示，內部顯示12個月，以3個月移動，結束為該年最後一日
        // 以季顯示，內部顯示3個月，以1個月移動 
        tempDateObj = new Date(tempY,tempM+i,tempD);
        stepNum = tempDateObj.getMonth() + 1;
        stepUnit = '月';
      }else if(type===2){
        // 以月顯示，內部顯示為日，以1個日移動
        tempDateObj = new Date(tempY,tempM,tempD+i);
        stepNum = tempDateObj.getDate();
        stepUnit = '';
      }else if(type===3){
        // 以週顯示
      }
      let isLeapY = (tempDateObj.getFullYear() % 4 === 0)?0:1;
      let thisDays = mounthDays[isLeapY][tempDateObj.getMonth()];
      // 計算每個left
      // (目前日-起始日)/總間隔*總寬度
      let left = (tempDateObj.valueOf() - timebarFirstDateNum.value)/(passTime) * tBarWidth;

      let thisWidth;
      // console.log('tBarTotalDays',tBarTotalDays)
        if(i===(totalStep-1)){
          thisWidth = tBarWidth - sumWidth;
        }else{
          if(type<2){
            thisWidth = (thisDays / tBarTotalDays * tBarWidth);
          }else if(type===2){
            thisWidth = tBarWidth / tBarTotalDays;
          }
        }
      
      sumWidth = sumWidth + thisWidth;

      tBarList.push({
        left: left + 'px',
        step: stepNum,
        label: stepNum + stepUnit,
        width: thisWidth + 'px'
      })
      tbarItem.value = tBarList;
    }
    // console.log(tBarList)
    // 標註今日位置
    let divNow=document.getElementById('timepointerNow');
    let toDayNum = timebarToDayNum.value = new Date().valueOf();
    timebarToDayStr.value = toLocalDateString(new Date(toDayNum))+ '(' +weekDays[new Date(toDayNum).getDay()]+ ')';
    if(toDayNum>=timebarFirstDateNum.value && toDayNum<=timebarLastDateNum.value){
      divNow.style.display = 'block';
      let leftNow = (toDayNum - timebarFirstDateNum.value) / (passTime) * tBarWidth;
      divNow.style.left = leftNow + 'px'
    }else{
      // 隱藏標註線
      divNow.style.display = 'none';
    }
    // 檢查游標日期是否在範圍內
    let div=document.getElementById('timepointer');

    let ptDateNum = timebarPtDateNum.value;
    if(ptDateNum>=timebarFirstDateNum.value && ptDateNum<=timebarLastDateNum.value){
      div.style.display = 'block';
      if(isPointerFix.value){
        let leftNow = (ptDateNum - timebarFirstDateNum.value) / (passTime) * tBarWidth;
        div.style.left = leftNow + 'px'
      }
    }else{
      // 隱藏標註線
      div.style.display = 'none';
    }
  }
  // 設定1月樣式
  function tbarStyle(index){
    let classStr='d-flex align-items-center h-100 tbarstep';
    let tBarList = tbarItem.value;
    if(index!==0){
      classStr = classStr + ' border-start';
    }

    if(tBarList[index].step===1){
      classStr = classStr + ' jan-mon'
    }
    return classStr
  }
  // 視窗小整大小
  function resizeend() {
    if (new Date() - rtime < delta) {
      setTimeout(resizeend, delta);
    } else {
      timeout = false;
      buildTimeStep();
    }               
  }
  // 跳到今日
  function goToDay(){
    let toDayNum = timebarToDayNum.value;
    let toDayObj = new Date(toDayNum);
    let toDayY = toDayObj.getFullYear();
    let toDayM = toDayObj.getMonth();
    let toDayD = toDayObj.getDate();
    let type = timebarType.value;
    let firstDateObj;
    // 設定起始日
      if(type===0){
        // 設定為該年第1日
        firstDateObj = new Date(toDayY,0,1);
      }else if(type===1){
        // 設定為該1,4,7,10月第1日
        toDayM = parseInt(toDayM/3)*3;
        firstDateObj = new Date(toDayY,toDayM,1);
      }else if(type===2){
        // 設定為該月第1日
        firstDateObj = new Date(toDayY,toDayM,1);
      }else if(type===3){

      }
    timebarFirstDateNum.value = firstDateObj.valueOf();
    timebarFirstDateStr.value = toLocalDateString(firstDateObj);
    // 更新時間軸
    updateTBar();
  }
//#endregion 時間軸==========End

//#region 案件操作==========Start
  // 查詢全案件
  const { mutate: getAllCase, onDone: getAllCaseonDone, onError: getAllCaseonError } = useMutation(CaseGQL.GETALLCASE);
  getAllCaseonDone(res => {
    // 載入全部案件資料
    console.log(res.data.getAllCase)
  });
  getAllCaseonError(e=>{errorHandle(e,infomsg,alert1)});

  // 查詢目前案件
  const { mutate: getCaseById, onDone: getCaseByIdonDone, onError: getCaseByIdonError } = useMutation(CaseGQL.GETCASEBYID);
  getCaseByIdonDone(result => {
    // 載入目前案件資料
  });
  getCaseByIdonError(e=>{errorHandle(e,infomsg,alert1)});
  // 選擇案件按鈕事件
  function getNowCaseBtn(id){
    if(id){
      getCaseById({getCaseByIdId: parseInt(id)}).then(res=>{
        console.log('CaseById',res.data.getCaseById);
        let getCase = res.data.getCaseById;
        
        nowCaseID.value = parseInt(getCase.id);
        nowCaseCode.value = getCase.code;
        nowCaseActive.value = (getCase.active)?true:false;
        if(getCase.data){
          nowCaseData.value = getCase.data;
          if(getCase.data.base){
            let getBase = getCase.data.base;
            nowCaseOperator.value = (getBase.operator)?getBase.operator:'';
          }
        }
        nowCaseParentId.value = getCase.parent_id;
      });
    }
  }

  // 儲存目前案件
  const { mutate: saveCase, onDone: saveCaseonDone, onError: saveCaseonError } = useMutation(CaseGQL.SAVECASEBYID);
  saveCaseonDone(result => {
    // 載入目前案件資料
  });
  saveCaseonError(e=>{errorHandle(e,infomsg,alert1)});
  // 儲存案件按鈕事件
  function saveCaseBtn(){
    saveCase({
      saveCaseByIdId: (nowCaseID.value)?nowCaseID.value:-1,
      code: (nowCaseCode.value)?nowCaseCode.value:null,
      active: (nowCaseActive.value)?nowCaseActive.value:1,
      data: (nowCaseData.value)?(nowCaseData.value):null,
      parentId: (nowCaseParentId.value)?nowCaseParentId.value:null
    })
  }


//#endregion 案件操作==========End

onMounted(()=>{
  // 視窗調整大小事件
  window.addEventListener('resize',movetimepointer);
  window.addEventListener('resize',buildTimeStep);
  $(window).resize(function() {
      rtime = new Date();
      if (timeout === false) {
          timeout = true;
          setTimeout(resizeend, delta);
      }
  });

  // 游標移動事件==>時間軸游標變化
  document.onmousemove = movetimepointer;
  // 設定初始時間軸起始點
  initFirstDate();

  getAllCase().then(res=>{
    allCases.value = res.data.getAllCase;
    if(allCases.value.length < 1){
      // 無案件時
      allCases.value.push(
        {
          id: -1,
          code: '',
          active: 1,
          data: {
            base: {
              operator: ''
            },
            items: []
          }
        }
      );
    }
    console.log('allCases',allCases.value);
  });
  
});

</script>
<template>
  <MDBContainer fluid class="h-100">
    <MDBRow class="h-100 flex-column flex-nowrap">
      <!-- 導覽列 -->
      <Navbar1 />
      <!-- 主體 -->
      <div style="height: calc(100% - 6.5em);" class="w-100 p-0 d-flex overflow-auto">
        <!-- 左側 顯示欄 變動寬度 -->
        <div :style="'position: relative;width: calc(100% - ' + rightToolWidth + 'rem);'" class="h-100 border">
          <!-- 上方 固定功能列 -->
          <div :style="'height: ' + (topTimeToolH + topTBarHeight) + 'rem;'" class="w-100 d-flex">
            <!-- 左上 案件操作 固定寬度 -->
            <div :style="'width: ' + leftCaseWidth + 'rem;'" class="h-100 border-end">
              <div :style="'height: '+ topTimeToolH +'rem;'" class="border-bottom">
                目前案件：{{nowCaseID}}-{{nowCaseCode}}
              </div>
              <div :style="'height: '+ topTBarHeight +'rem;'" class="d-flex">
                <div><MDBBtn class="p-1" size="sm" color="primary" @click.stop="">＋</MDBBtn></div>
                <div><MDBBtn class="p-1" size="sm" color="primary" @click.stop="">–</MDBBtn></div>
                <div><MDBBtn :disabled="!nowCaseID" class="p-1" size="sm" color="primary" @click.stop="saveCaseBtn">儲存</MDBBtn></div>
              </div>
            </div>
            <!-- 右上 時間控制 變動寬度 -->
            <div :style="'width: calc(100% - ' + leftCaseWidth + 'rem);'" class="h-100">
              <div :style="'height: ' + topTimeToolH + 'rem;'" class="d-flex justify-content-between border-bottom overflow-hidden">
                <div class="d-flex align-items-center">
                  <div>{{timebarFirstDateStr}}</div>
                  <div><MDBBtn size="sm" color="primary" @click.stop="moveTBar(-1)">前</MDBBtn></div>
                  
                </div>
                <div style="position:relative;" class="d-flex justify-content-center align-items-center flex-grow-1">
                  <div class="d-flex flex-column">
                    <div class="align-items-center">今日：{{timebarToDayStr}}</div>
                    <div class="align-items-center">游標：{{timebarPtDateStr}}</div>
                  </div>
                  <div style="position:absolute;top:0.25rem; right: 1rem">
                    <MDBBtn size="sm" color="primary" @click.stop="goToDay()">今日</MDBBtn>
                    <MDBBtn size="sm" color="primary" @click.stop="changeTimeBarType()">{{timebarStepList[timebarType]}}</MDBBtn>
                    <MDBBtn size="sm" color="primary" @click.stop="isPointerFix=false">＋</MDBBtn>
                  </div>
                </div>
                <div class="d-flex align-items-center">
                  <div><MDBBtn size="sm" color="primary" @click.stop="moveTBar(1)">後</MDBBtn></div>
                  <div>{{timebarLastDateStr}}</div>
                </div>
              </div>
            </div>
          </div>
          <!-- 下方 浮動案件列表 -->
          <div id="caselistbox" :style="'position: relative; height: calc(100% - ' + topTimeToolH + topTBarHeight + 'rem);'" class="w-100 border-top">
            
            <!-- 列表 -->
            <div v-for="(x, i) in allCases" :style="'height: ' + leftCaseHeight + 'rem;'" class="d-flex w-100 border">
              <div :style="'width: ' + leftCaseWidth + 'rem;'" class="p-2 border-end" @click.stop="getNowCaseBtn(x.id)">
                <MDBInput size="sm" type="text" label="案件名稱" v-model="x.code" />
                <MDBInput size="sm" type="text" label="承辦人" v-model="x.data.base.operator" />
              </div>
              <div :style="'width: calc(100% - ' + leftCaseWidth + 'rem)'">
                案件內容
              </div>
            </div>



            <!-- <p>下方 浮動案件列表</p>
            <p>時間操作：滑鼠({{ mouseX }}, {{ mouseY }})，游標({{ pointerX }}, {{ pointerY }})</p>
            <p>時間軸起點：{{timebarStart}}</p>
            <p>時間軸終點：{{timebarEnd}}</p>
            <p>時間軸物件寬度(timebarWidth)：{{timebarWidth}}</p>
            <p>時間軸內部寬度：{{pointerWidth}}</p>
            <p>時間軸起始日(數)：{{timebarFirstDateNum}}，時間軸起始日(字)：{{timebarFirstDateStr}}</p>
            <p>時間軸結束日(數)：{{timebarLastDateNum}}，時間軸結束日(字)：{{timebarLastDateStr}}</p>
            <p>游標日期(數)：{{timebarPtDateNum}}，游標日期(字)：{{timebarPtDateStr}}</p> -->
          </div>
          <!-- 時間軸 -->
          <div id="timebar" class="border-start" :style="'position:absolute;top:' + topTimeToolH + 'rem;left:' + leftCaseWidth + 'rem;height: calc(100% - ' + topTimeToolH + 'rem);width: calc(100% - ' + leftCaseWidth + 'rem);'">
            <!-- 時間軸刻度 -->
            <div :style="'position:relative ;height: ' + topTBarHeight + 'rem;'" class="overflow-hidden">
              <div v-for="(x,i) in tbarItem" :style="'position: absolute;top:0;left: '+ x.left +';width:' + x.width" :class="tbarStyle(i)">{{ x.label }}</div>
            </div>
            <!-- 時間軸游標空間 -->
            <div id="timepointerNow" :style="'position: absolute;top:0;border-left: 1px solid blue;border-width:' + pointerWidth + 'px'" class="h-100"></div>
            <div id="timepointer" :style="'position: absolute;top:0;border-left: 1px solid red;border-width:' + pointerWidth + 'px'" class="h-100" @dblclick.stop="isPointerFix=true"></div>
            
          </div>
        </div>
        <!-- 右側 功能欄 固定寬度 -->
        <div :style="'width: '+ rightToolWidth +'rem;'" class="h-100 border">
          右側功能欄
        </div>
      </div>
      <!-- 頁腳 -->
      <Footer1 :msg="infomsg" />
    </MDBRow>
  </MDBContainer>
</template>
<style>
.jan-mon{
  background-color: #9f9f9f;
  color: white;
}
</style>