<script setup>
import Footer1 from "../components/Footer.vue";
import Navbar1 from "../components/Navbar.vue";
import path from "path-browserify";
import {
  MDBCol, MDBRow, MDBContainer,
  MDBInput, MDBTextarea, MDBSelect, 
  MDBDatepicker, MDBSwitch, MDBCheckbox, 
  MDBBtn, MDBPopconfirm,
  MDBAccordion, MDBAccordionItem,
  MDBSpinner,
  MDBAnimation,
  MDBAlert,
  MDBModal, MDBModalHeader, MDBModalTitle, MDBModalBody, MDBModalFooter,
  MDBTabs, MDBTabNav, MDBTabContent, MDBTabItem, MDBTabPane,
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
  const activeItem = ref('');

  // 版型參數
  const rightToolWidth = ref(25); // 25rem
  const leftCaseWidth = ref(12); // 12rem
  const leftCaseHeight = ref(10); // 8rem
  const topTimeToolH = ref(4); // 2rem
  const topTBarHeight = ref(2.5); // 2rem
  const timeScaleHeight = ref(6); // 3rem

  // 時間軸參數
  const mouseX = ref("");
  const mouseY = ref("");
  const pointerX = ref("");
  const pointerY = ref("");
  const isPointerFix = ref(false);
  const isPointerShow = ref(false);
  const timebarStart = ref("");
  const timebarEnd = ref("");
  
  const timebarWidth = ref("");
  const pointerWidth = ref(1); // 游標寬度

  // 日期參數
  const timebarFirstDateNum = ref(""); // 起始日
  const timebarLastDateNum = ref(""); // 結束日
  const timebarPtDateNum = ref(""); // 游標所在日
  const timebarToDayNum = ref(""); // 今日
  const timebarToDayLeft = computed(()=>{
    let toDayNum = timebarToDayNum.value;
    let tBarWidth = timebarWidth.value
    let passTime = timebarLastDateNum.value - timebarFirstDateNum.value;
    return (toDayNum - timebarFirstDateNum.value) / (passTime) * tBarWidth;
  }); // 今日之座標

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
  const tStep = ref([12, 3, 31]);

  const tbarDOM = ref();
  const tbarPointer = ref();
  const tbarItem = ref([]);

  var rtime;
  var timeout = false;
  var delta = 200;

  // 日曆元件設定
  const monthsFull =['一月,','二月,','三月,','四月,','五月,','六月,','七月,','八月,','九月,','十月,','十一月,','十二月,'];
  const monthsShort= monthsFull;
  const weekdaysFull=['星期日','星期一','星期二','星期三','星期四','星期五','星期六'];
  const weekdaysShort=['星期日','星期一','星期二','星期三','星期四','星期五','星期六'];
  const weekdaysNarrow=['日', '一', '二', '三', '四', '五', '六'];

  // Case參數==============Start
  const allCases = ref([]); // 全案件資料
  const newCase = {
    id: '',
    code: '',
    finished: 0,
    data: {
      base: {
        startdate: '',
        enddate: '',
        guarantee: '',
      },
      items: [],
    },
    parent_id: null,
  }; // 案件初始化資料
  const newItem = {
    sort: '',
    name: '未命名',
    type: -1,
    date: ' ',
    finisheddate: ' ',
  }; // 項目初始化資料
  const nowCaseData = reactive({case: JSON.parse(JSON.stringify(newCase))});
  const nowCaseOperator = ref(""); // 承辦人
  const nowCaseFinished = ref(false); // 是否結案

  const purchaseAM = ref(""); // 採購金額
  const budgetAM = ref(""); // 預算金額
  const additionAM = ref(""); // 增購金額
  const awardPrice = ref(""); // 決標金額

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
    if (!isPointerShow.value){return}
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
  async function updateTBar(){
    // 更新結束日
    return new Promise((res,rej)=>{
      res(setlastDate());
    }).then(res=>{
      return getTBarSize();
    }).then(res=>{
      // 更新時間軸
      return buildTimeStep();
    }).then(res=>{
      return movetimepointer();
    }).then(res=>{
      updateCaseTimeBar(allCases.value);
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
    // console.log('buildTimeStep')
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
  // 視窗小整大小(停用)
  // function resizeend() {
  //   // console.log('resizeend')
  //   // console.log('resizeend',new Date(),rtime,delta)
  //   if (new Date() - rtime < delta) {
  //     // console.log('waiting...')
  //     setTimeout(resizeend, delta);
  //   } else {
  //     // console.log('buildTimeStep')
  //     timeout = false;
  //     updateTBar();
  //   }               
  // }
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
  // 啟動時間軸指標
  function useTimePointer(){
    isPointerFix.value=false
    isPointerShow.value=!isPointerShow.value
  }
  /*日期(數字)轉座標
    sDNum(起始日)
    eDNum(結束日)
    TsDnum(時間軸起始日)
    TeDnum(時間軸結束日)
    tbarW(時間軸寬度px)
  */
  function dateNum2LeftWidth(sDNum, eDNum, todayNum ,TsDnum, TeDnum, tbarW){
    let res = {};
    let dDnum = (TeDnum - TsDnum);
    let scale = tbarW / dDnum;
    if(sDNum){
      if(eDNum){
        res.left = (sDNum - TsDnum) * scale;
        res.width = (eDNum - sDNum) * scale;
        // 今日前
        if((todayNum - sDNum) > 0){
          if((todayNum - sDNum)<dDnum){
            res.passWidth = (todayNum - sDNum) * scale;
          }else{
            res.passWidth = res.width
          }
        }else{
          res.passWidth = 0;
        }
        // 今日後
        if((eDNum - todayNum) > 0){
          if((eDNum - todayNum)<dDnum){
            res.featureWidth = (eDNum - todayNum) * scale;
          }else{
            res.featureWidth = res.width
          }
        }else{
          res.featureWidth = 0;
        }
      }else{
        res.left = (sDNum - TsDnum) * scale;
        res.passWidth = 0;
        res.featureWidth = 0;
        res.width = 0;
      }
    }else{
      res.left = 0;
      res.passWidth = 0;
      res.featureWidth = 0;
      res.width = 0;
    }
    // console.log(res)
    return res
  }
  function date2shortStr(date){
    let dateS = date.split('-');
    let res = dateS[1] + '/' + dateS[2];
    return res
  }
//#endregion 時間軸==========End

//#region 案件操作==========Start
  // 查詢全案件
  const { mutate: getAllCase, onDone: getAllCaseonDone, onError: getAllCaseonError } = useMutation(CaseGQL.GETALLCASE);
  getAllCaseonDone(res => {
    // 載入全部案件資料
    // console.log(res.data.getAllCase)
  });
  getAllCaseonError(e=>{errorHandle(e,infomsg,alert1)});

  // 查詢目前案件
  const { mutate: getCaseById, onDone: getCaseByIdonDone, onError: getCaseByIdonError } = useMutation(CaseGQL.GETCASEBYID);
  getCaseByIdonDone(result => {
    // 載入目前案件資料
  });
  getCaseByIdonError(e=>{errorHandle(e,infomsg,alert1)});

  // 選擇案件按鈕事件
  function getNowCaseBtn(e,id){
    if(id){
      $('.case-selected').removeClass('case-selected');
      $('.casebox').has(e.target).children('.boxline').addClass('case-selected');
      getCaseById({getCaseByIdId: parseInt(id)}).then(res=>{
        // console.log('CaseById',res.data.getCaseById);
        let getCase = res.data.getCaseById;
        nowCaseData.case = getCase;
        nowCaseFinished.value = (nowCaseData.case.finished===1)?true:false;
        
        // nowCaseStartDate.value = (nowCaseData.case.data.base.startdate)?nowCaseData.case.data.base.startdate:' ';
        // nowCaseEnddate.value = (nowCaseData.case.data.base.enddate)?nowCaseData.case.data.base.enddate:' ';
        // nowCaseGuarantee.value = (nowCaseData.case.data.base.guarantee)?nowCaseData.case.data.base.guarantee:' ';

        purchaseAM.value = (nowCaseData.case.data.base.purchase_am)?toCurrency(nowCaseData.case.data.base.purchase_am):'';
        budgetAM.value = (nowCaseData.case.data.base.budget_am)?toCurrency(nowCaseData.case.data.base.budget_am):'';
        additionAM.value = (nowCaseData.case.data.base.addition_am)?toCurrency(nowCaseData.case.data.base.addition_am):'';
        awardPrice.value = (nowCaseData.case.data.base.award_price)?toCurrency(nowCaseData.case.data.base.award_price):'';

        
        // console.log(nowCaseData.case);
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
    nowCaseData.case.data.base.startdate = (nowCaseData.case.data.base.startdate)?(nowCaseData.case.data.base.startdate):' '; 
    nowCaseData.case.data.base.enddate = (nowCaseData.case.data.base.enddate)?(nowCaseData.case.data.base.enddate):' ';
    nowCaseData.case.data.base.guarantee = (nowCaseData.case.data.base.guarantee)?(nowCaseData.case.data.base.guarantee):' ';
    for(let i=0;i<nowCaseData.case.data.items.length;i++){
      // 處理空日期
      nowCaseData.case.data.items[i].date = (nowCaseData.case.data.items[i].date)?nowCaseData.case.data.items[i].date:' ';
      nowCaseData.case.data.items[i].finisheddate = (nowCaseData.case.data.items[i].finisheddate)?nowCaseData.case.data.items[i].finisheddate:' ';
    }
    saveCase({
      saveCaseByIdId: (nowCaseData.case.id)?parseInt(nowCaseData.case.id):-1,
      code: (nowCaseData.case.code)?nowCaseData.case.code:null,
      active: (nowCaseData.case.active)?nowCaseData.case.active:1,
      data: (nowCaseData.case.data)?(nowCaseData.case.data):null,
      parentId: (nowCaseData.case.parent_id)?nowCaseData.case.parent_id:null
    }).then(res=>{
      // 更新
      updateAllCase();
    })
  }
  // 更新總案件列表
  function updateAllCase(){
    getAllCase().then(res=>{
      allCases.value = res.data.getAllCase;
      updateCaseTimeBar(allCases.value)
    });
  }
  function updateCaseTimeBar(myData){
    // let myData = allCases.value = res.data.getAllCase;
      // allCases.value = myData;
      if(myData.length < 1){
        // 無案件時
        allCases.value.push(nowCaseData.value)
      }else{
        // 計算各案件時間軸
        for(let i=0;i<myData.length;i++){
          let startDateNum = new Date(myData[i].data.base.startdate + 'T00:00:00.000').valueOf();
          let endDateNum = new Date(myData[i].data.base.enddate + 'T23:59:59.000').valueOf();
          let guaranteeDateNum = new Date(myData[i].data.base.guarantee + 'T23:59:59.000').valueOf();
          // 執行期間
          myData[i].tbarSize = dateNum2LeftWidth(startDateNum,endDateNum,timebarToDayNum.value,timebarFirstDateNum.value,timebarLastDateNum.value,timebarWidth.value);
          // 保固期間
          myData[i].guarSize = dateNum2LeftWidth(endDateNum,guaranteeDateNum,timebarToDayNum.value,timebarFirstDateNum.value,timebarLastDateNum.value,timebarWidth.value);
          // 各子項目(item)時間位置
          for(let j=0;j<myData[i].data.items.length;j++){
            // console.log(myData[i].data.items[j])
            if(myData[i].data.items[j].date){
              let itemDate = (myData[i].data.items[j].finisheddate && myData[i].data.items[j].finisheddate!==' ')?myData[i].data.items[j].finisheddate:myData[i].data.items[j].date;
              let itemDateNum = new Date(itemDate + 'T00:00:00.000').valueOf();
              myData[i].data.items[j].position = dateNum2LeftWidth(itemDateNum,null,timebarToDayNum.value,timebarFirstDateNum.value,timebarLastDateNum.value,timebarWidth.value);
            }else{
              myData[i].data.items[j].position = -1;
            }
          }
        }
      }
      console.log(myData);
      // console.log('allCases',allCases.value);
  }
  // 新增案件(清空案件基本資料)
  function createNewCase(){
    let newCaseContent = JSON.parse(JSON.stringify(newCase));
    nowCaseData.case = newCaseContent;
    nowCaseData.case.id = -1;
  }
  // 新增項目
  function addItem(){
    let newItemContent = JSON.parse(JSON.stringify(newItem));
    nowCaseData.case.data.items.push(newItemContent);
  }
  // 轉成貨幣格式
  function toCurrency(num){
    let parts = num.toString().split('.');
    let res;
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    if(parts.length===1){
      res = parts[0]
    }else{
      res = parts.join('.');
    }
    return res;
  }
  // 反算貨幣
  function fromCurrency(n)
  {
      return n.replace(/[,]+/g, '');
  }
  function dataFromCurrency(parm,value){
    let res = parseInt(fromCurrency(value));
    nowCaseData.case.data.base[parm] = res;
    switch (parm){
      case 'purchase_am':
        purchaseAM.value = toCurrency(res);
        break;
      case 'budget_am':
        budgetAM.value = toCurrency(res);
        break;
      case 'addition_am':
        additionAM.value = toCurrency(res);
        break;
      case 'award_price':
        awardPrice.value = toCurrency(res);
        break;
    }
    // console.log(nowCaseData.case)
  }

//#endregion 案件操作==========End

function checkEvent(src){
  console.log(src)
}

onMounted(()=>{
  // 視窗調整大小事件
  // window.addEventListener('resize',movetimepointer);
  window.addEventListener('resize',updateTBar);
  // $(window).resize(function() {
  //   console.log('resize')
  //     rtime = new Date();
  //     console.log('rtime',rtime)
  //     console.log('timeout',timeout)
  //     if (timeout === false) {
  //         timeout = true;
  //         console.log('timeout if false')
  //         setTimeout(resizeend, delta);
  //     }
  // });

  // 游標移動事件==>時間軸游標變化
  document.onmousemove = movetimepointer;
  // 設定初始時間軸起始點
  initFirstDate();
  updateAllCase();
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
            <div :style="'width: ' + leftCaseWidth + 'rem;'" class="h-100">
              <div :style="'height: '+ topTimeToolH +'rem;'" class="border-bottom">
                目前案件：{{nowCaseData.case.id}}-{{nowCaseData.case.code}}
              </div>
              <div :style="'height: '+ topTBarHeight +'rem;'" class="d-flex">
                <!-- 增加案件 -->
                <div>
                  <MDBBtn :disabled="!rGroup[3]" class="" size="sm" color="primary" @click.stop="createNewCase">
                    <i class="fas fa-plus"></i>
                  </MDBBtn>
                </div>
                <!-- 刪除案件 -->
                <div>
                  <MDBBtn class="" size="sm" color="primary" @click.stop="">
                    <i class="fas fa-minus"></i>
                  </MDBBtn>
                </div>
              </div>
            </div>
            <!-- 右上 時間控制 變動寬度 -->
            <div :style="'width: calc(100% - ' + leftCaseWidth + 'rem);'" class="h-100 border-start">
              <div :style="'height: ' + topTimeToolH + 'rem;'" class="d-flex justify-content-between border-bottom overflow-hidden">
                <div class="d-flex align-items-center">
                  <div>{{timebarFirstDateStr}}</div>
                  <div><MDBBtn size="sm" color="primary" @click.stop="moveTBar(-1)">前</MDBBtn></div>
                  
                </div>
                <div style="position:relative;" class="d-flex justify-content-center align-items-center flex-grow-1">
                  <div class="d-flex flex-column">
                    <div class="align-items-center">今日：{{timebarToDayStr}}</div>
                    <div v-show="isPointerShow" class="align-items-center">游標：{{timebarPtDateStr}}</div>
                  </div>
                  <div style="position:absolute;top:0.25rem; right: 1rem">
                    <MDBBtn size="sm" color="primary" @click.stop="goToDay()">今日</MDBBtn>
                    <MDBBtn size="sm" color="primary" @click.stop="changeTimeBarType()">{{timebarStepList[timebarType]}}</MDBBtn>
                    <MDBBtn size="sm" color="primary" @click.stop="useTimePointer()">＋</MDBBtn>
                  </div>
                </div>
                <div class="d-flex align-items-center">
                  <div><MDBBtn size="sm" color="primary" @click.stop="moveTBar(1)">後</MDBBtn></div>
                  <div>{{timebarLastDateStr}}</div>
                </div>
              </div>
            </div>
          </div>
          <!-- 時間軸 -->
          <div id="timebar" 
            class="border-start" 
            :style="'position:absolute;top:' + topTimeToolH + 'rem;left:' + leftCaseWidth + 'rem;height: calc(100% - ' + topTimeToolH + 'rem);width: calc(100% - ' + leftCaseWidth + 'rem);'" 
            @dblclick.stop="isPointerFix=true">
            <!-- 時間軸刻度 -->
            <div :style="'position:relative ;height: ' + topTBarHeight + 'rem;'" class="overflow-hidden">
              <div v-for="(x,i) in tbarItem" :style="'position: absolute;top:0;left: '+ x.left +';width:' + x.width" :class="tbarStyle(i)">{{ x.label }}</div>
            </div>
            <!-- 時間軸游標空間 -->
            <div id="timepointerNow" :style="'border-width:' + pointerWidth + 'px'" class="h-100"></div>
            <div v-show="isPointerShow" id="timepointer" :style="'border-width:' + pointerWidth + 'px'" class="h-100"></div>
            
          </div>
          <!-- 下方 浮動案件列表 -->
          <div id="caselistbox" 
            :style="'position: relative; height: calc(100% - ' + (topTimeToolH + topTBarHeight) + 'rem);'" 
            class="w-100 overflow-auto border-top"
            @dblclick.stop="isPointerFix=true">
                        
            <!-- 列表 -->
            <div v-for="(x, i) in allCases" 
              :style="'position: relative; height: ' + leftCaseHeight + 'rem;'" class="d-flex w-100 casebox border" 
              @click.prevent="getNowCaseBtn($event,x.id)" @dblclick.stop="isPointerFix=true">
              <div :style="'width: ' + leftCaseWidth + 'rem;'" class="h-100 p-2 border-end" >
                <div>{{ x.code }}</div>
                <div>{{ x.data.base.operator }}</div>
              </div>
              <div 
                :style="'position: relative; width: calc(100% - ' + leftCaseWidth + 'rem);min-width: 4rem'" 
                class="h-100 overflow-hidden d-flex flex-column">
                <!-- 時程表 -->
                <div :style="'position: relative;height:' + timeScaleHeight + 'rem;'" class="w-100">
                  <!-- 執行期間 -->
                  <!-- 過去 -->
                  <div v-show="x.tbarSize.width>0"
                    :style="'position: absolute;height: 1rem;top:calc((100% / 2) - 0.5rem); left:' + x.tbarSize.left + 'px;background-color: #90f1ef; width:' + x.tbarSize.passWidth + 'px;'" 
                    :class="'border-top border-bottom'"></div>
                  <!-- 未來 -->
                    <div v-show="x.tbarSize.width>0"
                    :style="'position: absolute;height: 1rem;top:calc((100% / 2) - 0.5rem); left:' + timebarToDayLeft + 'px;background-color: #f7d5df; width:' + x.tbarSize.featureWidth + 'px;'" 
                    :class="'border-top border-bottom'"></div>
                  <!-- 保固期間 -->
                  <div v-show="x.guarSize.width>0"
                    :style="'position: absolute;height: 1rem;top:calc((100% / 2) - 0.5rem); left:' + x.guarSize.left + 'px;background-color: #ffef9f; width:' + x.guarSize.width + 'px;'" 
                    :class="'border-top border-bottom'"></div>
                  <!-- Items -->
                  <div v-for="(item, idx) in x.data.items" v-show="item.position.left>=0"
                    :style="'position: absolute;top:calc((100% / 2) - 0.5rem);left:' + item.position.left + 'px;'">
                    <div v-if="((item.date && item.date !== ' ') || (item.finisheddate && item.finisheddate !== ' '))" :class="(item.finisheddate && item.finisheddate !== ' ')?'item-mark item-finished':'item-mark'">
                      <div class="item-line"></div>
                      <div class="item-tri"></div>
                      <div class="item-label">{{ item.name }}</div>
                      <div class="item-date">{{ date2shortStr(item.date) }}</div>
                      <!-- <div><i class="fab fa-android"></i></div> -->
                      <!-- <i class="item-mark fas fa-i-cursor"></i> -->
                    </div>
                  </div>
                </div>
                
                
                <!-- 執行進度 -->
                <div style="position: relative;" class="w-100 flex-fill">
              
                  <div 
                    :style="'position: absolute;height: 1rem;top:calc((100% / 2) - 0.5rem);left:0 ;background-color: red; width:0'" 
                    class="border"></div>  
                </div>
                
                <!-- 經費使用 -->
                <div style="position: relative;" class="w-100 flex-fill">
                  
                  <div 
                    :style="'position: absolute;height: 1rem;top:calc((100% / 2) - 0.5rem);left:0 ;background-color: yellow; width:0'" 
                    class="border"></div>
                </div>
              </div>
              <!-- 框線 -->
              <div style="position:absolute; top:0;lef:0;" class="h-100 w-100 boxline"></div>
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
          
        </div>
        <!-- 右側 功能欄 固定寬度 -->
        <MDBContainer :style="'width: '+ rightToolWidth +'rem;'" class="h-100">
          <MDBRow class="h-100">
            <MDBCol col="12" :style="'height: ' + topTimeToolH + 'rem;'" class="">
              <MDBRow>
                <MDBCol col="12">功能按鈕</MDBCol>
                <MDBCol col="12" class="d-flex">
                  <div><MDBBtn :disabled="!rGroup[3] || (nowCaseData.case.id==='')" size="sm" color="primary" @click.stop="saveCaseBtn">儲存</MDBBtn></div>
                  <!-- 增加案件 -->
                  <div>
                    <MDBBtn :disabled="!rGroup[3]" class="" size="sm" color="primary" @click.stop="addItem">
                      <i class="fas fa-plus"></i>
                    </MDBBtn>
                  </div>
                  <!-- 刪除案件 -->
                  <div>
                    <MDBBtn class="" size="sm" color="primary" @click.stop="">
                      <i class="fas fa-minus"></i>
                    </MDBBtn>
                  </div>    
                </MDBCol>
              </MDBRow>
            </MDBCol>
            <MDBCol col="12" :style="'height: calc(100% - ' + topTimeToolH + 'rem);'" class="px-0 overflow-auto">
              <MDBAccordion v-model="activeItem">
                <MDBAccordionItem
                  headerTitle="基本資料"
                  collapseId="base">
                  <!-- 內容 -->
                  <MDBRow>
                    <MDBCol md="12" class="">
                      案件編號：{{nowCaseData.case.id}}
                      <MDBCheckbox label="已結案" v-model="nowCaseFinished" />
                    </MDBCol>
                    <MDBCol md="6" class="mt-2">
                      <MDBInput size="sm" type="text" label="案件縮寫" counter :maxlength="20" v-model="nowCaseData.case.code" />
                    </MDBCol>
                    <div></div>
                    <MDBCol md="12" class="mt-4">
                      <MDBTextarea size="sm" label="案件名稱" rows="2" v-model="nowCaseData.case.data.base.name" />
                    </MDBCol>
                    <MDBCol md="12" class="mt-2">
                      <MDBInput size="sm" type="text" label="承辦人" v-model="nowCaseData.case.data.base.operator" />
                    </MDBCol>
                    <MDBCol md="12" class="mt-2">
                      <MDBInput size="sm" type="text" label="採購編號" v-model="nowCaseData.case.data.base.purchasecode" />
                    </MDBCol>
                    <MDBCol md="6" class="mt-2">
                      <MDBDatepicker 
                        size="sm" v-model="nowCaseData.case.data.base.startdate" 
                        format="YYYY-MM-DD" label="起始日"
                        :monthsFull = "monthsFull"
                        :monthsShort = "monthsShort"
                        :weekdaysFull = "weekdaysFull"
                        :weekdaysShort = "weekdaysShort"
                        :weekdaysNarrow = "weekdaysNarrow"
                        confirmDateOnSelect
                        removeCancelBtn
                        removeOkBtn/>
                    </MDBCol>
                    <MDBCol md="6" class="mt-2">
                      <MDBDatepicker 
                        size="sm" v-model="nowCaseData.case.data.base.enddate" 
                        format="YYYY-MM-DD" label="結束日"
                        :monthsFull = "monthsFull"
                        :monthsShort = "monthsShort"
                        :weekdaysFull = "weekdaysFull"
                        :weekdaysShort = "weekdaysShort"
                        :weekdaysNarrow = "weekdaysNarrow"
                        confirmDateOnSelect
                        removeCancelBtn
                        removeOkBtn/>
                    </MDBCol>
                    <MDBCol md="6" class="mt-2">
                      <MDBDatepicker 
                        size="sm" v-model="nowCaseData.case.data.base.guarantee" 
                        format="YYYY-MM-DD" label="保固期限"
                        :monthsFull = "monthsFull"
                        :monthsShort = "monthsShort"
                        :weekdaysFull = "weekdaysFull"
                        :weekdaysShort = "weekdaysShort"
                        :weekdaysNarrow = "weekdaysNarrow"
                        confirmDateOnSelect
                        removeCancelBtn
                        removeOkBtn/>
                    </MDBCol>
                    <MDBCol md="12" class="mt-2">
                      <MDBInput 
                        size="sm" 
                        type="text" 
                        label="採購金額" 
                        v-model:model-value="purchaseAM"
                        @update:model-value="dataFromCurrency('purchase_am',$event)"/>
                    </MDBCol>
                    <MDBCol md="12" class="mt-2">
                      <MDBInput 
                        size="sm" 
                        type="text" 
                        label="預算金額" 
                        v-model:model-value="budgetAM"
                        @update:model-value="dataFromCurrency('budget_am',$event)"/>
                    </MDBCol>
                    <MDBCol md="12" class="mt-2">
                      <MDBInput 
                        size="sm" 
                        type="text" 
                        label="擴充金額" 
                        v-model:model-value="additionAM"
                        @update:model-value="dataFromCurrency('addition_am',$event)"/>
                    </MDBCol>
                    <MDBCol md="12" class="mt-2">
                      <MDBInput 
                        size="sm" 
                        type="text" 
                        label="決標金額" 
                        v-model:model-value="awardPrice"
                        @update:model-value="dataFromCurrency('award_price',$event)"/>
                    </MDBCol>
                    
                  </MDBRow>
                </MDBAccordionItem>
                <MDBAccordionItem v-for="(item,idx) in nowCaseData.case.data.items"
                  :headerTitle="item.name"
                  :collapseId="'item-' + idx">
                  <MDBRow>
                    <MDBCol md="12" class="mt-2">
                      <MDBInput size="sm" type="text" label="項目名稱" v-model="item.name" />
                    </MDBCol>
                    <MDBCol md="12" class="mt-2">
                      <MDBInput size="sm" type="text" label="項目類型" v-model="item.type" />
                    </MDBCol>
                    <MDBCol md="6" class="mt-2">
                      <MDBDatepicker 
                        size="sm" v-model="item.date" 
                        format="YYYY-MM-DD" label="規劃日期"
                        :monthsFull = "monthsFull"
                        :monthsShort = "monthsShort"
                        :weekdaysFull = "weekdaysFull"
                        :weekdaysShort = "weekdaysShort"
                        :weekdaysNarrow = "weekdaysNarrow"
                        confirmDateOnSelect
                        removeCancelBtn
                        removeOkBtn/>
                    </MDBCol>
                    <MDBCol md="6" class="mt-2">
                      <MDBDatepicker 
                        size="sm" v-model="item.finisheddate" 
                        format="YYYY-MM-DD" label="完成日期"
                        :monthsFull = "monthsFull"
                        :monthsShort = "monthsShort"
                        :weekdaysFull = "weekdaysFull"
                        :weekdaysShort = "weekdaysShort"
                        :weekdaysNarrow = "weekdaysNarrow"
                        confirmDateOnSelect
                        removeCancelBtn
                        removeOkBtn/>
                    </MDBCol>
                    <div></div>
                  </MDBRow>
                </MDBAccordionItem>
              </MDBAccordion>
            </MDBCol>
          </MDBRow>
        </MDBContainer>
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
#timepointer, #timepointerNow{
  pointer-events: none;
  z-index: 10;
  position: absolute;
  top:0;
  border-left: 1px solid red;
}
#timepointerNow{
  border-left: 1px solid blue;
}

.boxline{
  pointer-events: none;
}
/* 選擇案件時顯示外框 */
.case-selected {
  /* border: 5px solid blue; */
  box-shadow: 0 0 10px 5px blue inset;
}
/* 基本資料頁收合時樣式 */
.accordion-button[aria-controls="base"]{
	color: white;
	background-color: rgba(var(--mdb-danger-rgb),var(--mdb-bg-opacity))
}
/* Items展開時樣式 */
.accordion-button:not(.collapsed){
  color:white;
  background-color: rgba(var(--mdb-warning-rgb),var(--mdb-bg-opacity));
}
/* 其餘Itemg收何時樣式 */
.accordion-button{
  color:white;
  background-color: rgba(var(--mdb-info-rgb),var(--mdb-bg-opacity));
}

/* item 標示樣式 */
.item-mark{
  position:relative;
}
.item-mark:hover{
  z-index: 10;
  filter: drop-shadow(0px 0px 5px rgba(0, 0, 0, 0.7))
}

.item-line{
  position: absolute;
  height: 1rem; width:1px;
  border-left: 1px solid;
  border-color: #dc4c64;
}

.item-tri::before,.item-tri::after{
  content: "";
  position: absolute;
  width: 0;
  height: 0;
  border: solid transparent;
}
.item-tri::after{
  border-width: 6px 2.5px 0 2.5px;
  border-top-color: #ff9800;
  top: -6px;
  left: -2px;
}
.item-tri::before{
  border-width: 9px 5.5px 0 5.5px;
  border-top-color: #dc4c64;
  top: -7.5px;
  left: -5px;
}

/* item 上方標註名稱樣式 */
.item-label{
  position: absolute;
  font-size: 12px;
  top: -2rem;
  border: 1px solid #ff9800;
  border-radius: 6px;
  padding: 1px 2px;
  background-color: white;
  user-select:none;
  white-space:nowrap;
}
/* item 下方標註日期樣式 */
.item-date{
  position: absolute;
  font-size: 12px;
  top: 1rem;
  border: 1px solid #ff9800;
  border-radius: 6px;
  padding: 1px 2px;
  background-color: white;
  user-select:none;
}

.item-finished .item-line,
.item-finished .item-date,
.item-finished .item-label{
  border-color:#69cb5c;
}

.item-finished .item-tri::before{
  border-color:#69cb5c transparent transparent transparent;
}

.item-finished .item-tri::after{
  border-color:#dafbe8 transparent transparent transparent;
}

</style>