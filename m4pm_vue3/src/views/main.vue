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
import { ref, onMounted, provide, inject, watch } from "vue";
import { computed } from "@vue/reactivity";

// 判斷token狀況
import { useQuery, useMutation } from '@vue/apollo-composable';
import UsersGQL from "../graphql/Users";
import { errorHandle, logIn, logOut, toTWDate } from '../methods/User';

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

  // 時間軸參數
  const mouseX = ref("");
  const mouseY = ref("");
  const pointerX = ref("");
  const pointerY = ref("");
  const timebarStart = ref("");
  const timebarEnd = ref("");
  
  const timebarWidth = ref("");
  const pointerWidth = ref(1); // 游標寬度
  const timebarFirstDateNum = ref("");
  const timebarLastDateNum = ref("");
  const timebarPtDateNum = ref("");

  const timebarFirstDateStr = ref("");
  const timebarLastDateStr = ref("");
  const timebarPtDateStr = ref("");

  const timebarType = ref(0); // 0:年 1:季 2:月 3:週
  const mounthDays = [[31,29,31,30,31,30,31,31,30,31,30,31],[31,28,31,30,31,30,31,31,30,31,30,31]]; // 各月份日數
  const tbarDOM = ref();
  const tbarPointer = ref();
  const tbarItem = ref([]);

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
    let div=document.getElementById('timepointer');
    let div2=document.getElementById('timepointer2');
    let timebar=document.getElementById('timebar');
    let caselistbox=document.getElementById('caselistbox');
    const parentXY = getPosition(caselistbox);
    let tbarSize = await getTBarSize();
    if (!div) {
      return;
    }
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
      div2.style.left = "0px";
    }else if(intX > (tbarSize.boxRight-tbarSize.borderWidth)){
      div.style.left= (tbarSize.boxWidth) +"px";
      div2.style.left= (tbarSize.boxWidth) +"px";
    }else{
      div.style.left=(intX-tbarSize.boxLeft)+"px";
      div2.style.left=(intX-tbarSize.boxLeft)+"px";
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
    timebarPtDateStr.value = toLocalDateString(new Date(nowDateNum));
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

    if(type===0){
      // 以年顯示，內部顯示12個月，以3個月移動，結束為該年最後一日
      lastDateYY = firstDate.getFullYear();
      lastDateMM = firstDate.getMonth() + 11; // 顯示增加11個月
      lastDateFD = new Date(lastDateYY,lastDateMM,1); // 取得結束月的第1天
      // console.log('lastDateFD',lastDateFD);
      lastDateDD = mounthDays[((lastDateFD.getFullYear() % 4)===0)?0:1][lastDateFD.getMonth()]; // 取得結束月的最後1天
      lastDate = new Date(lastDateFD.getFullYear(),lastDateFD.getMonth(),lastDateDD); // 以UTC建立避免時區問題
    }else if(type===1){
      // 以季顯示，內部顯示3個月，以1個月移動 
    }else if(type===2){
      // 以月顯示，內部顯示為日，以1個日移動
    }else if(type===3){
      // 以週顯示
    }
    timebarLastDateNum.value = lastDate.valueOf();
    timebarLastDateStr.value = toLocalDateString(lastDate);
  }
  // 轉換日期文字
  function toLocalDateString(dateobj){
    return dateobj.getFullYear() + '-' + (dateobj.getMonth()+1).toString().padStart(2, '0') + '-' + dateobj.getDate().toString().padStart(2, '0');
  }
  // 前一個時間
  function preTBar(){
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

    if(type===0){
      // 以年顯示，內部顯示12個月，以3個月移動，結束為該年最後一日
      updateFD_Y = nowFD_Y;
      updateFD_M = nowFD_M - 3;
      updateFD_D = nowFD_D;
      firstDateObj = new Date(updateFD_Y,updateFD_M,updateFD_D);
    }else if(type===1){
      // 以季顯示，內部顯示3個月，以1個月移動 
    }else if(type===2){
      // 以月顯示，內部顯示為日，以1個日移動
    }else if(type===3){
      // 以週顯示
    }
    timebarFirstDateNum.value = firstDateObj.valueOf();
    timebarFirstDateStr.value = toLocalDateString(firstDateObj);
    setlastDate();
    buildTimeStep();
  }
  // 後一個時間
  function nextTBar(){
    // console.log('nextTBar');
    let type = timebarType.value;
    let nowFD = new Date(timebarFirstDateNum.value);
    let nowFD_Y = nowFD.getFullYear();
    let nowFD_M = nowFD.getMonth();
    let nowFD_D = nowFD.getDate();

    let updateFD_Y;
    let updateFD_M;
    let updateFD_D;

    let firstDateObj;

    if(type===0){
      // 以年顯示，內部顯示12個月，以3個月移動，結束為該年最後一日
      updateFD_Y = nowFD_Y;
      updateFD_M = nowFD_M + 3;
      updateFD_D = nowFD_D;
      firstDateObj = new Date(updateFD_Y,updateFD_M,updateFD_D);
    }else if(type===1){
      // 以季顯示，內部顯示3個月，以1個月移動 
    }else if(type===2){
      // 以月顯示，內部顯示為日，以1個日移動
    }else if(type===3){
      // 以週顯示
    }
    timebarFirstDateNum.value = firstDateObj.valueOf();
    timebarFirstDateStr.value = toLocalDateString(firstDateObj);
    setlastDate();
    buildTimeStep();
  }
  // 創建時間軸刻度
  function buildTimeStep(){
    let type = timebarType.value;
    let firstDateObj = new Date(timebarFirstDateNum.value);
    let lastDateObj = new Date(timebarLastDateNum.value);
    let tBarWidth = timebarWidth.value
    let tBarList = [];
    let sumWidth = 0;
    let tBarTotalDays = 0;

    if(type===0){
      // 以年顯示，內部顯示12個月，以3個月移動，結束為該年最後一日
      let totalStep = 12;
      for(let i=0;i<totalStep;i++){
        let tempY = firstDateObj.getFullYear();
        let tempM = firstDateObj.getMonth();
        let tempD = firstDateObj.getDate();
        let tempDateObj = new Date(tempY,tempM+i,tempD);
        let isLeapY = (tempDateObj.getFullYear() % 4 === 0)?0:1;

        //  日期間格比總日數少1，第1天位置在0不是1，所以-1
        if(isLeapY===0){
          // 閏年
          tBarTotalDays = 365;
        }else{
          tBarTotalDays = 364;
        }
        // 計算每個left
        // (目前日-起始日)/總間隔*總寬度
        let left = (tempDateObj.valueOf() - timebarFirstDateNum.value)/(tBarTotalDays*24*60*60*1000) * timebarWidth.value;

        let thisDays = mounthDays[isLeapY][tempDateObj.getMonth()];
        let thisWidth;

        if(i===(totalStep-1)){
          thisWidth = tBarWidth - sumWidth;
        }else{
          thisWidth = (thisDays / tBarTotalDays * tBarWidth);
        }
        sumWidth = sumWidth + thisWidth;

        tBarList.push({
          left: left + 'px',
          mounth: tempDateObj.getMonth()+1,
          label: (tempDateObj.getMonth()+1) + '月',
          width: thisWidth + 'px'
        })
        tbarItem.value = tBarList;
      }
    }else if(type===1){
      // 以季顯示，內部顯示3個月，以1個月移動 
    }else if(type===2){
      // 以月顯示，內部顯示為日，以1個日移動
    }else if(type===3){
      // 以週顯示
    }
    // console.log(tBarList)

  }

  function tbarStyle(index){
    let classStr='h-100 tbarstep';
    let tBarList = tbarItem.value;
    if(index!==0){
      classStr = classStr + ' border-start';
    }

    if(tBarList[index].mounth===1){
      classStr = classStr + ' jan-mon'
    }
    return classStr
  }
//#endregion 時間軸==========End

onMounted(()=>{
  window.addEventListener('resize',movetimepointer);
  window.addEventListener('resize',buildTimeStep);
  // 游標移動事件==>時間軸游標變化
  document.onmousemove = movetimepointer;
  // 設定初始時間軸起始點
  initFirstDate();
  
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
        <div style="width: calc(100% - 25rem);" class="h-100 border">
          <!-- 上方 固定功能列 -->
          <div style="height: 4rem;" class="w-100 d-flex">
            <!-- 左上 案件操作 固定寬度 -->
            <div style="width: 12rem;" class="h-100 border-end">
              案件操作
              <div>{{timebarPtDateStr}}</div>
            </div>
            <!-- 右上 時間控制 變動寬度 -->
            <div style="width: calc(100% - 12rem);" class="h-100">
              <!-- 上部 時間操作列 -->
              <div class="h-50 d-flex justify-content-between border-bottom overflow-hidden">
                <div class="d-flex">
                  <div>{{timebarFirstDateStr}}</div>
                  <MDBBtn size="sm" color="primary" @click.stop="preTBar">前</MDBBtn>
                </div>
                <div>
                  時間操作：滑鼠({{ mouseX }}, {{ mouseY }})，游標({{ pointerX }}, {{ pointerY }})
                </div>
                <div class="d-flex">
                  <MDBBtn size="sm" color="primary" @click.stop="nextTBar">後</MDBBtn>
                  <div>{{timebarLastDateStr}}</div>
                </div>
              </div>
              <!-- 下部 時間顯示列 -->
              <div id="timebar" style="position:relative ;" class="h-50">
                <div v-for="(x,i) in tbarItem" :style="'position: absolute;top:0;left: '+ x.left +';width:' + x.width" :class="tbarStyle(i)">{{ x.label }}</div>
                <div id="timepointer" :style="'position: absolute;color: red;border-left: 1px solid red;border-width:' + pointerWidth + 'px'" class="h-100"></div>
              </div>
            </div>
          </div>
          <!-- 下方 浮動案件列表 -->
          <div id="caselistbox" style="position: relative; height: calc(100% - 4rem);" class="w-100 border-top">
            <p>下方 浮動案件列表</p>
            <p>時間操作：滑鼠({{ mouseX }}, {{ mouseY }})，游標({{ pointerX }}, {{ pointerY }})</p>
            <p>時間軸起點：{{timebarStart}}</p>
            <p>時間軸終點：{{timebarEnd}}</p>
            <p>時間軸物件寬度(timebarWidth)：{{timebarWidth}}</p>
            <p>時間軸內部寬度：{{pointerWidth}}</p>
            <p>時間軸起始日(數)：{{timebarFirstDateNum}}，時間軸起始日(字)：{{timebarFirstDateStr}}</p>
            <p>時間軸結束日(數)：{{timebarLastDateNum}}，時間軸結束日(字)：{{timebarLastDateStr}}</p>
            <p>游標日期(數)：{{timebarPtDateNum}}，游標日期(字)：{{timebarPtDateStr}}</p>
            <div :style="'position:absolute;top:0; left:12rem ; width: calc(100% - 12rem)'" class="h-100">
              <div id="timepointer2" :style="'position: absolute;top:0;border-left: 1px solid blue;border-width:' + pointerWidth + 'px'" class="h-100"></div>
            </div>
            
          </div>
        </div>
        <!-- 右側 功能欄 固定寬度 -->
        <div style="width: 25rem;" class="h-100 border">
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