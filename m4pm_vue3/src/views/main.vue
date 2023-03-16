<script setup>
import Footer1 from "../components/Footer.vue";
import Navbar1 from "../components/Navbar.vue";
import AccordionItem from "../components/AccordionItem.vue"
import CaseBar from "../components/CaseBar.vue"
import uploadtool from "../components/uploadtool.vue"
import path from "path-browserify";
import {
  MDBCol, MDBRow, MDBContainer,
  MDBInput, MDBTextarea, MDBSelect, 
  MDBDatepicker, MDBSwitch, MDBCheckbox, 
  MDBBtn, MDBPopconfirm, MDBBtnClose,
  MDBAccordion, MDBAccordionItem,
  MDBSpinner,
  MDBAnimation, MDBTooltip,
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
import ToolsGQL from "../graphql/Tools";
import { errorHandle, logIn, logOut, toTWDate } from '../methods/User';
import jQuery from "jquery";
Object.assign(window, { $: jQuery, jQuery });

const { mutate: getchecktoken } = useMutation(UsersGQL.CHECKTOKEN);
getchecktoken().then(res=>{

}).catch(e=>{
  errorHandle(e,infomsg,alert1);
});

//#region 取得權限==========Start
  const myUserId = ref("");
  const myUserName = ref("");
  const myUserRole = ref("");
  const usersetting= ref({});

  const { onResult: getNowUser, refetch: refgetNowUser } = useQuery(UsersGQL.GETNOWUSER);
  getNowUser(result => {
    if (!result.loading && result && result.data.getNowUser) {
      let getData = result.data.getNowUser;
      // console.log('user-getData',getData);
      myUserId.value = parseInt(getData.user_id);
      myUserName.value = getData.user_name;
      myUserRole.value = getData.role;
      if(getData.setting){
        usersetting.value = getData.setting;
        timebarType.value = (getData.setting.timetype)?parseInt(getData.setting.timetype):0;
      }else{
        usersetting.value = {};
        timebarType.value = 0;
      }
      // console.log('user-usersetting',usersetting.value);
    }
  });

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
  provide('activeItem',activeItem);
  const splitSign = ref('#');
  provide('splitSign',splitSign);
  const dragkey = ref(0);
  const showJson = ref(false);
  const jsonChErr = ref('');

  const tips01 = ref(false);
  const tips02 = ref(false);
  const tips03 = ref(false);
  const tips04 = ref(false);
  const tips05 = ref(false);
  const tips06 = ref(false);
  const tips07 = ref(false);
  const tips08 = ref(false);

  // 版型參數
  const rightToolWidth = ref(25); // 25rem
  const leftCaseWidth = ref(14); // 12rem
  const leftCaseHeight = ref(10); // 8rem
  const topTimeToolH = ref(4); // 2rem
  const topTBarHeight = ref(2.5); // 2rem
  const timeScaleHeight = ref(7); // 3rem
  const caseDataToolHeight = ref(5); // 3rem

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
  provide('timebarToDayLeft',timebarToDayLeft);

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

  // 日曆元件設定
  const monthsFull =['一月,','二月,','三月,','四月,','五月,','六月,','七月,','八月,','九月,','十月,','十一月,','十二月,'];
  const monthsShort= monthsFull;
  const weekdaysFull=['星期日','星期一','星期二','星期三','星期四','星期五','星期六'];
  const weekdaysShort=['星期日','星期一','星期二','星期三','星期四','星期五','星期六'];
  const weekdaysNarrow=['日', '一', '二', '三', '四', '五', '六'];

  // Case參數==============Start
  const allCases = ref([]); // 全案件資料
  const nowItemULidx = ref('');
  const newCase = {
    id: '',
    code: '',
    finished: 0,
    data: {
      base: {
        startdate: ' ',
        enddate: ' ',
        guarantee: ' ',
        baseTable: '',
      },
      schedule:[],
      items: [],
    },
    parent_id: null,
  }; // 案件初始化資料
  const newItem = {
    id: -1,
    name: '未命名',
    type: -1,
    date: ' ',
    finisheddate: ' ',
  }; // 項目初始化資料
  const newSchedule = {
    date: ' ',
    estimated: '',
    actual: '',
  }; // 進度表初始化資料
  const nowCaseData = reactive({case: JSON.parse(JSON.stringify(newCase))});
  const nowCaseOperator = ref(""); // 承辦人
  const nowCaseFinished = ref(false); // 是否結案

  const purchaseAM = ref(""); // 採購金額
  const budgetAM = ref(""); // 預算金額
  const additionAM = ref(""); // 增購金額
  const awardPrice = ref(""); // 決標金額

  const jsonChecked = ref(null);
  const scheduleDateTemp = ref(' ');
  const scheduleDateDOM = ref();
  const nowSchId = ref('');
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
    let firstDateObj;
    if(usersetting.value.firstDateNum){
      firstDateObj = new Date(usersetting.value.firstDateNum);
    }else{
      let nowDate = new Date();
      firstDateObj = new Date(nowDate.getFullYear(),0,1);
    }
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

    usersetting.value ={ ...usersetting.value ,timetype:parseInt(timebarType.value)};
    updateTBar().then(res=>{
      return saveUserSet({
        userId: myUserId.value,
        setting: usersetting.value
      });
    });
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
  // 跳到今日
  function goToDay(toDayNum){
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
  function chekItemID(caseData){
    let items = caseData.data.items
    let maxid = -1;
    // console.log('items',items)
    if(items){
      for(let i=0;i<items.length;i++){
        // console.log('items[i].id',items[i].id)
        if(!items[i].id && items[i].id!==0){
          for(let j=0;j<items.length;j++){
            if(items[j].id>maxid){
              maxid=items[j].id;
            }
          }
          items[i].id=maxid+1;
        }
      }
    }
  }

  // 查詢目前案件
  const { mutate: getCaseById, onDone: getCaseByIdonDone, onError: getCaseByIdonError } = useMutation(CaseGQL.GETCASEBYID);
  getCaseByIdonDone(result => {
    // 載入目前案件資料
    chekItemID(result.data.getCaseById)
  });
  getCaseByIdonError(e=>{errorHandle(e,infomsg,alert1)});

  // 選擇案件按鈕事件
  function getNowCaseBtn(e,id){
    return new Promise((res,rej)=>{
      if(id){
        jsonChecked.value = null;
        jsonChErr.value = '';
        // console.log('e.target',e.target);
        $('.case-selected').removeClass('case-selected');
        if($(e.target).hasClass( "casebox-content" )){
          $(e.target).addClass('case-selected');
        }else{
          $('.casebox-content').has(e.target).addClass('case-selected');
        }
        getCaseById({getCaseByIdId: parseInt(id)}).then(res=>{
          // console.log('CaseById',res.data.getCaseById);
          let getCase = res.data.getCaseById;
          nowCaseData.case = getCase;
          nowCaseFinished.value = (nowCaseData.case.finished===1)?true:false;
          // console.log('nowCaseData',nowCaseData);
          purchaseAM.value = (nowCaseData.case.data.base.purchase_am)?toCurrency(nowCaseData.case.data.base.purchase_am):'';
          budgetAM.value = (nowCaseData.case.data.base.budget_am)?toCurrency(nowCaseData.case.data.base.budget_am):'';
          additionAM.value = (nowCaseData.case.data.base.addition_am)?toCurrency(nowCaseData.case.data.base.addition_am):'';
          awardPrice.value = (nowCaseData.case.data.base.award_price)?toCurrency(nowCaseData.case.data.base.award_price):'';
          
          if(!nowCaseData.case.data.schedule){
            nowCaseData.case.data.schedule ={
              startdate: ' ',
              enddate: ' ',
              list:[],
            }
          }

          if(activeItem.value.split(splitSign.value)[0] !== id){
            activeItem.value = id + splitSign.value +'base';
          }
          
          // 更新時間軸item
          for(let i=0;i<allCases.value.length;i++){
            if(allCases.value[i].id===getCase.id){
              allCases.value[i].data.items = getCase.data.items;
              break;
            }else{
              if(allCases.value[i].other_m4case){
                let subCases = allCases.value[i].other_m4case;
                for(let j=0;j<subCases.length;j++){
                  if(subCases[j].id===getCase.id){
                    subCases[j].data.items = getCase.data.items;
                    break;
                  }
                }
              }
            }
          }
          
          updateCaseTimeBar(allCases.value)
          // console.log(nowCaseData.case);
          return getCase
        }).then(getCase=>{
          res(getCase)
        })
      }else{
        rej();
      }
    })
  }

  // 儲存目前案件
  const { mutate: saveCase, onDone: saveCaseonDone, onError: saveCaseonError } = useMutation(CaseGQL.SAVECASEBYID);
  saveCaseonDone(result => {
    // 載入目前案件資料
  });
  saveCaseonError(e=>{errorHandle(e,infomsg,alert1)});
  // 儲存案件按鈕事件
  function saveCaseBtn(){
    // 處理空日期
    nowCaseData.case.data.base.startdate = (nowCaseData.case.data.base.startdate)?(nowCaseData.case.data.base.startdate):' '; 
    nowCaseData.case.data.base.enddate = (nowCaseData.case.data.base.enddate)?(nowCaseData.case.data.base.enddate):' ';
    nowCaseData.case.data.base.guarantee = (nowCaseData.case.data.base.guarantee)?(nowCaseData.case.data.base.guarantee):' ';
    for(let i=0;i<nowCaseData.case.data.items.length;i++){
      // 處理items內之空日期
      nowCaseData.case.data.items[i].date = (nowCaseData.case.data.items[i].date)?nowCaseData.case.data.items[i].date:' ';
      nowCaseData.case.data.items[i].finisheddate = (nowCaseData.case.data.items[i].finisheddate)?nowCaseData.case.data.items[i].finisheddate:' ';
    }
    // 處理schedule資料依日期排序
    

    new Promise((res,rej)=>{
      let mySchedule = toRaw(nowCaseData.case.data.schedule);
      mySchedule.sort((a,b)=>{
        let aDateNum = new Date(a.date).getTime();
        let bDateNum = new Date(b.date).getTime();
        return (aDateNum - bDateNum)
      });
      nowCaseData.case.data.schedule = mySchedule;
      res(mySchedule)
    }).then(res=>{
      return saveCase({
        saveCaseByIdId: (nowCaseData.case.id)?parseInt(nowCaseData.case.id):-1,
        code: (nowCaseData.case.code)?nowCaseData.case.code:null,
        active: (nowCaseData.case.active)?nowCaseData.case.active:1,
        data: (nowCaseData.case.data)?(nowCaseData.case.data):null,
        parentId: (nowCaseData.case.parent_id)?parseInt(nowCaseData.case.parent_id):null
      });
    }).then(res=>{
      // 更新Allcase及時間軸
      return updateAllCase();
    }).then(res=>{
      // 更新右側資料欄
      return getCaseById({getCaseByIdId: parseInt(nowCaseData.case.id)});
    }).then(res=>{
      // console.log('CaseById',res.data.getCaseById);
      let getCase = res.data.getCaseById;
      nowCaseData.case = getCase;
      nowCaseFinished.value = (nowCaseData.case.finished===1)?true:false;
      // console.log('nowCaseData',nowCaseData);
      purchaseAM.value = (nowCaseData.case.data.base.purchase_am)?toCurrency(nowCaseData.case.data.base.purchase_am):'';
      budgetAM.value = (nowCaseData.case.data.base.budget_am)?toCurrency(nowCaseData.case.data.base.budget_am):'';
      additionAM.value = (nowCaseData.case.data.base.addition_am)?toCurrency(nowCaseData.case.data.base.addition_am):'';
      awardPrice.value = (nowCaseData.case.data.base.award_price)?toCurrency(nowCaseData.case.data.base.award_price):'';
      
      if(!nowCaseData.case.data.schedule){
        nowCaseData.case.data.schedule ={
          startdate: ' ',
          enddate: ' ',
          list:[],
        }
      }
    })
  }
  // 更新總案件列表
  function updateAllCase(){
    return new Promise((resolve,rej)=>{
      getAllCase().then(res=>{
        // 依照使用者設定排序
        let inputArray = res.data.getAllCase;
        let result;
        if(usersetting.value.casesort){
          result = sortCaseByUser(inputArray,usersetting.value.casesort);
        }else{
          result = inputArray;
        }
        console.log('result',result)
        return result
      }).then(res=>{
        for(let i=0;i<allCases.value.length; i++){
          let nowId = allCases.value[i].id;
          let resId = res.findIndex(x=>x.id===nowId);
          // console.log('nowId',nowId,'resId',resId)
          if(resId>=0){
            // console.log('res[resId]',res[resId])
            // console.log('allCases.value[i]',allCases.value[i])
            if(allCases.value[i].subshow){
              res[resId].subshow = allCases.value[i].subshow;
            }
          }
        }
        allCases.value = res;
        updateCaseTimeBar(allCases.value);
        return allCases.value
      }).then(res=>{
        if(nowCaseData.case.id){
          let mydom = document.getElementById(nowCaseData.case.id + splitSign.value +'casebox');
          // console.log(mydom)
          mydom.classList.add('case-selected');
        }
      }).then(res=>{
        resolve(res);
      });
    })
    
  }
  // 更新案件值間軸物件
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
          // 增加附屬案件各子項目(item)時間位置
          if(myData[i].other_m4case){
            // console.log('other_m4case==========')
            let subCases = myData[i].other_m4case;
            // console.log('subCases',subCases)
            // 對每個附屬案件
            for(let k=0; k<subCases.length ;k++){
              let subStartDateNum = new Date(subCases[k].data.base.startdate + 'T00:00:00.000').valueOf();
              let subEndDateNum = new Date(subCases[k].data.base.enddate + 'T23:59:59.000').valueOf();
              let subGuaranteeDateNum = new Date(subCases[k].data.base.guarantee + 'T23:59:59.000').valueOf();
              // 執行期間
              subCases[k].tbarSize = dateNum2LeftWidth(subStartDateNum,subEndDateNum,timebarToDayNum.value,timebarFirstDateNum.value,timebarLastDateNum.value,timebarWidth.value);
              // 保固期間
              subCases[k].guarSize = dateNum2LeftWidth(subEndDateNum,subGuaranteeDateNum,timebarToDayNum.value,timebarFirstDateNum.value,timebarLastDateNum.value,timebarWidth.value);

              // 各子項目(item)時間位置
              let subCaseItems = subCases[k].data.items;
              for(let l=0;l<subCaseItems.length;l++){
                if(subCaseItems[l].date){
                  let itemDate = (subCaseItems[l].finisheddate && subCaseItems[l].finisheddate!==' ')?subCaseItems[l].finisheddate:subCaseItems[l].date;
                  let itemDateNum = new Date(itemDate + 'T00:00:00.000').valueOf();
                  subCaseItems[l].position = dateNum2LeftWidth(itemDateNum,null,timebarToDayNum.value,timebarFirstDateNum.value,timebarLastDateNum.value,timebarWidth.value);
                }else{
                  subCaseItems[l].position = -1;
                }
              }
            }
          }
        }
      }
      // console.log(myData);
      // console.log('allCases',allCases.value);
  }
  // 依照使用者設定排序
  function sortCaseByUser(orgArray, setting){
    // console.log('before',orgArray)
    // console.log('setting',setting)
    let result;
    for(let i=0;i<orgArray.length;i++){
      if(orgArray[i].other_m4case.length>0){
        let subCases = orgArray[i].other_m4case;
        subCases.sort((a,b)=>{
          let ai = setting.indexOf(parseInt(a.id));
          let bi = setting.indexOf(parseInt(b.id));
          return ai - bi;
        })
      }
    }
    result = orgArray.sort((a,b)=>{
      // console.log('a.id',a.id,'b.id',b.id)
      let ai = setting.indexOf(parseInt(a.id));
      let bi = setting.indexOf(parseInt(b.id));
      // console.log('ai',ai,'bi',bi,ai>bi)
      return ai - bi;
    })
    // console.log('userSort',setting)
    return result;
  }
  // 記錄使用者排序
  function recordCaseSort(orgArray){
    let result=[];
    // console.log('orgArray',orgArray)
    for(let i=0;i<orgArray.length;i++){
      result.push(parseInt(orgArray[i].id));
      // console.log('result-'+i,result)
      if(orgArray[i].other_m4case.length>0){
        // console.log('sub')
        let subCases = orgArray[i].other_m4case;
        // console.log('subCases',subCases)
        for(let j=0;j<subCases.length;j++){
          // console.log('subCases-'+'j',subCases[j].id)
          result.push(parseInt(subCases[j].id));
        }
      }
    }
    // console.log('sort-result',result)
    return result
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
    let idmax=-1;
    if(nowCaseData.case.data.items.length>0){
      for(let i=0;i<nowCaseData.case.data.items.length;i++){
        if(parseInt(nowCaseData.case.data.items[i].id)>idmax){
          idmax=parseInt(nowCaseData.case.data.items[i].id);
        }
      } 
      newItemContent.id=idmax+1;
    }else{
      newItemContent.id=0;
    }
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
  // 時間軸item點擊事件
  function itemsClick(e,caseId,itemId){
    // 點選的案件不是目前案件時，先切換為目前案件，再設定目前item
    // console.log('caseId',caseId,'itemId',itemId);
    // console.log('nowId',nowCaseData.case.id);
    if (nowCaseData.case.id === caseId){
      activeItem.value = itemId;
    }else{
      getNowCaseBtn(e,caseId).then(res=>{
        activeItem.value = itemId;
      })
    }
  }
  // 監聽activeItem
  watch(activeItem,(getActiveItem)=>{
    // console.log('getActiveItem',getActiveItem);
    if(getActiveItem!==''){
      let idInfo = getActiveItem.split(splitSign.value);
      let itemId = idInfo[2];
      let item = nowCaseData.case.data.items[itemId];
      // console.log(item)
      if(item){
        if((item.date && item.date !== ' ') || (item.finisheddate && item.finisheddate !== ' ')){
          let usedDate = (item.finisheddate && item.finisheddate !== ' ')?item.finisheddate:item.date;
          let itemDateNum = new Date(usedDate+ 'T00:00:00.000').valueOf();
          // console.log('itemDateNum',itemDateNum);
          if(itemDateNum<timebarFirstDateNum.value || itemDateNum>timebarLastDateNum.value){
            // console.log('Out Tbar');
            goToDay(itemDateNum);
          }
          // else{
          //   console.log('In Tbar');
          // }
        }
      }
    }else{
      // 清空被選擇之item
      // console.log($('.item-mark-selected'));
      $('.item-mark-selected').removeClass('item-mark-selected');
    }
  })

  watch(timebarFirstDateNum,(newFirstDateNum)=>{
    usersetting.value ={ ...usersetting.value ,firstDateNum:newFirstDateNum};
    // console.log('usersetting',usersetting.value)
    saveUserSet({
      userId: myUserId.value,
      setting: usersetting.value
    });
  })
  // 移動Array內容
  function moveArray(array,from,to){
    // console.log('from',from);
    let moveitem = array.splice(from,1)[0];
    // console.log('moveitem',moveitem);
    array.splice(to,0,moveitem);
    // console.log('array',array);
    return array
  }
  // item移動
  function itemMove(e,delta){
    console.log('itemMove')
    // console.log(e)
    let itemData = e.split(splitSign.value);
    let caseId = itemData[0];
    let itemOder = itemData[2];
    let itemArrey = nowCaseData.case.data.items
    let caseOder = allCases.value.findIndex(x=>parseInt(x.id)===parseInt(caseId));
    let caseArray = allCases.value[caseOder].data.items;
    let beforActiveItem = activeItem.value;
    // console.log(itemOder+delta)
    // 未達頂
    if((parseInt(itemOder)+parseInt(delta))>-1 && (parseInt(itemOder)+parseInt(delta))< itemArrey.length){
      new Promise((resolve,rej)=>{
        let newArray = moveArray(itemArrey,parseInt(itemOder),parseInt(itemOder)+delta);
        // console.log('now-Caseitem:',newArray)
        resolve(newArray)
      }).then(res=>{
        // 同步時間軸上的items
        // let newArray = moveArray(caseArray,parseInt(itemOder),parseInt(itemOder)+delta);
        allCases.value[caseOder].data.items = res;
        // console.log('all-Caseitem:',res)
        return res
      }).then(res=>{
        // 更新時間軸
        dragkey.value=(dragkey.value+1>10)?0:dragkey.value+1;
        // console.log('targetItem',e,'nowItem',beforActiveItem)
        if(beforActiveItem!==''){
          if(e===beforActiveItem){
            // 目前item與觸發item相同
            // console.log('same')
            activeItem.value = itemData[0] +  splitSign.value + itemData[1] +  splitSign.value + (parseInt(itemOder)+delta);
          }else{
            // 目前item與觸發item不同
            // console.log('diffrent')
          }
        }
        // console.log('activeItem',activeItem.value)
      }).then(res=>{
        if(nowCaseData.case.id){
          let mydom = document.getElementById(nowCaseData.case.id + splitSign.value +'casebox');
          // console.log(mydom)
          mydom.classList.add('case-selected');
        }
      })
    }
  }
  // 紀錄使用者案件排序
  const { mutate: saveUserSet, onDone: saveUserSetOnDone, onError: saveUserSetError } = useMutation(
    UsersGQL.UPDATEUSER);

  // item增加上傳檔案
  function addUploadFile(e,caseItem){
    let maxId = -1;
    // console.log('caseItem',caseItem)
    if(!caseItem.uploads){
      caseItem.uploads=[];
    }
    for(let i=0;i<caseItem.uploads.length;i++){
      if(parseInt(caseItem.uploads[i].id)>maxId){
        maxId=parseInt(caseItem.uploads[i].id);
      }
    }

    caseItem.uploads.push({
      id: maxId+1,
      title:'',
      filename:'',
    })
  }
  // item移除上傳檔案
  function removeUploadFile(e, index){
    // console.log('index',index);
    let actId = activeItem.value.split(splitSign.value);
    // console.log('actId',actId);
    let itemId = actId[2];
    nowCaseData.case.data.items[itemId].uploads.splice(index,1)
  }

  // 文字模式更新
  function textJsonChange(e){
    try{
      jsonChecked.value = true;
      jsonChErr.value = '';
      nowCaseData.case = JSON.parse(e.target.value);
    }catch (err){
      jsonChecked.value = false;
      jsonChErr.value = 'name: '+ err.name + '\n'+'message: ' + err.message;
    }
  }

  // 增加進度紀錄
  function addSchedule(e){
    if(!nowCaseData.case.data.schedule){
      nowCaseData.case.data.schedule=[];  
    }
    nowCaseData.case.data.schedule.push(newSchedule);
  }
  // 刪除進度紀錄
  function removeSchedule(e,sid){
    nowCaseData.case.data.schedule.splice(sid,1);
  }
  // 開啟進度日期選擇器
  function openSchDatePicker(e,sid){
    nowSchId.value = sid;
    scheduleDateDOM.value.open();
  }
  // 更新進度日期欄
  function updateSchDate(e){
    nowCaseData.case.data.schedule[parseInt(nowSchId.value)].date = scheduleDateTemp.value;
  }
  // 取得進度列表民國年
  function getSchYear(dateStr,sid){
    let mydateObj = new Date(dateStr);
    if(sid>0){
      let predateObj = new Date(nowCaseData.case.data.schedule[sid-1].date);
      if(!isNaN(predateObj.getTime()) && predateObj.getTime()!==0){
        // 判斷是否相同
        if(predateObj.getFullYear()===mydateObj.getFullYear()){
          return ''
        }
      }
    }
    return (mydateObj.getFullYear())?mydateObj.getFullYear()-1911:''
  }
  // 取得進度列表日期
  function getSchMD(dateStr){
    let mydateObj = new Date(dateStr);
    if(!isNaN(mydateObj.getTime()) && mydateObj.getTime()!==0){
      return (mydateObj.getMonth()+1) + '/' + mydateObj.getDate()
    }else{
      return ''
    }
  }
//#endregion 案件操作==========End

//#region 拖曳操作==========Start
  let nowDragLocation = null;
  let nowDragSource = null;
  // 被拖曳者
  function caseBoxDragstart(e){
    // console.log('dragging')
    e.target.classList.add("dragging");
    nowDragSource=e.target;
    // console.log('nowDragSource',nowDragSource)
  }
  function caseBoxDragend(e){
    // console.log('dragend')
    e.target.classList.remove("dragging");
  }
  // 被放置者
  function caseBoxDragenter(e){
    if($(e.currentTarget).hasClass('casebox')){
      if(nowDragLocation===e.currentTarget){
        $(nowDragLocation).addClass("dhover");
        // console.log('add red');
      }else{
        $(nowDragLocation).removeClass("dhover");
        $(e.currentTarget).addClass("dhover");
        // console.log('remove red');
        nowDragLocation=e.currentTarget;
      }
    }
  }
  function caseBoxDragover(e){3
    e.preventDefault();
  }
  function caseBoxDrop(e){
    // console.log('drop');
    if($(e.currentTarget).hasClass('casebox')){
      $(e.currentTarget).removeClass("dhover");
      // console.log('nowDragSource',nowDragSource.id); // from
      // console.log('e.currentTarget',e.currentTarget.id); // to
      let fromId = nowDragSource.id.split(splitSign.value)[0];
      let toId = e.currentTarget.id.split(splitSign.value)[0];
      // console.log('fromId',fromId);
      // console.log('nowDragSource.id',nowDragSource.id);
      // console.log('e.currentTarget.id',e.currentTarget.id);
      new Promise((resolve,rej)=>{
        resolve(toRaw(allCases.value))
      }).then(res=>{
        let fromOrder = res.findIndex(x=>parseInt(x.id)===parseInt(fromId));
        let toOrder = res.findIndex(x=>parseInt(x.id)===parseInt(toId));
        let newArray = moveArray(res,fromOrder,toOrder);
        // console.log('newArray',newArray)
        allCases.value = newArray;
        // console.log(allCases.value)
        return newArray
      }).then(res=>{
        usersetting.value ={ ...usersetting.value ,casesort:recordCaseSort(res)};
        console.log('usersetting',usersetting.value)
        return usersetting.value
      }).then(res=>{
        return saveUserSet({
          userId: myUserId.value,
          setting: usersetting.value
        });
      }).then(res=>{
        dragkey.value=(dragkey.value+1>10)?0:dragkey.value+1;
      });
      
    }
  }


//#endregion 拖曳操作==========End

//#region 檔案上傳==========Start
  const uploadType = ref("");
  function uploadBtn(inputId,uploadId) {
    // 由按鈕啟動檔案選擇器
    uploadType.value = inputId;
    nowItemULidx.value = uploadId;
    const inputDOM = document.getElementById("AllUpload");
    inputDOM.setAttribute("accept","");
    // console.log('inputId',inputId)
    switch (inputId) {
      case "baseTable":
        inputDOM.setAttribute("accept",".docx");
        break;
      case "itemUpload":
        inputDOM.setAttribute("accept","");
        break;
    }
    inputDOM.click();
  }
  // 檔案選擇器選擇事件
  const upFile = ref();
  async function uploadChenge(e) {
    upFile.value = e.target.files[0];
    let subpath = "01_Case/" + nowCaseData.case.id;
    let newName = "";
    if (!uploadType.value) {
      return;
    }
    switch (uploadType.value) {
      case "baseTable":
        newName = "baseTable" + path.extname(e.target.value);
        break;
      case "itemUpload":
        let nowCaseOrder = activeItem.value.split(splitSign.value);
        let nowCaseId = nowCaseOrder[0];
        let nowItemId = parseInt(nowCaseOrder[2]);
        subpath = "01_Case/" + nowCaseId + "/" + nowItemId;
        newName = 'file_' + nowItemULidx.value + path.extname(e.target.value);
        let upIndex = nowCaseData.case.data.items[nowItemId].uploads.findIndex(x=>parseInt(x.id)===parseInt(nowItemULidx.value))
        let myUploadsId = nowCaseData.case.data.items[nowItemId].uploads[upIndex].id;
        nowCaseData.case.data.items[nowItemId].uploads[upIndex]={
          id: myUploadsId,
          title: e.target.files[0].name,
          filename: newName,
        }
        console.log('newName',e.target.files[0].name)
        break;
    }
    await uploadFile({
      file: upFile.value,
      subpath: subpath,
      newfilename: newName,
    });
  }
  // 上傳檔案
  const { mutate: uploadFile, onDone: uploadFileOnDone, onError: uploadFileonError } = useMutation(
    ToolsGQL.UPLOADFILE
  );
  uploadFileOnDone((result) => {
    // console.log("uploadFile")
    // 儲存(更新)上傳紀錄資料
    if (!uploadType.value) {
      return;
    }
    switch (uploadType.value) {
      case "baseTable":
        nowCaseData.case.data.base.baseTable = result.data.uploadFile.filename;
        saveCaseBtn();
        break;
      case "itemUpload":
        // nowCaseData.case.data.base.baseTable = result.data.uploadFile.filename;
        saveCaseBtn();
        break;
    }
    let inputDOM;
    inputDOM = document.getElementById("AllUpload");
    inputDOM.value = "";
  });
  uploadFileonError(e=>{errorHandle(e,infomsg,alert1)});

//#endregion 檔案上傳==========End

//#region 檔案下載==========Start
  function downloadFile(fileUrl,fileName){
    let x = new XMLHttpRequest();
    // console.log(fileUrl);
    x.open("GET", fileUrl+'?t=' + new Date().getTime(), true);
    x.responseType = 'blob';
    x.onload = function(e){
      //建構blob的URL
      let href = URL.createObjectURL(x.response);
      //建立下載元素
      let link = document.createElement("a");
      document.body.appendChild(link);
      // console.log(href);
      link.href = href;
      link.download = fileName;
      // console.log(fileName);
      link.click();
      // 完成後刪除元素
      document.body.removeChild(link);
    };
    x.send();
  }
//#endregion 檔案下載==========End
function checkEvent(src){
  console.log(src)
}

onMounted(()=>{
  // 視窗調整大小事件
  window.addEventListener('resize',updateTBar);

  // 游標移動事件==>時間軸游標變化
  document.onmousemove = movetimepointer;
  refgetNowUser().then(res=>{
    // 設定初始時間軸起始點
    initFirstDate();
    updateAllCase();
  });
  
});

</script>
<template>
  <!-- 檔案上傳用 -->
  <input type="file" id="AllUpload" @change="uploadChenge($event)" style="display: none" />
  <!-- 主體 -->
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
              <div :style="'height: '+ topTimeToolH +'rem;'" class="d-flex justify-content-center align-items-center p-2 border-bottom">
                <!-- 篩選區 -->
                <MDBInput size="sm" type="text" class=""/>
              </div>
              <div :style="'height: '+ topTBarHeight +'rem;'" class="d-flex justify-content-end align-items-center">
                <!-- 增加案件 -->
                <div>
                  <MDBTooltip v-model="tips01">
                    <template #reference>
                      <MDBBtn 
                        :disabled="!rGroup[3]" 
                        size="sm" color="primary" @click.stop="createNewCase">
                        <i class="fas fa-plus"></i>
                      </MDBBtn>
                    </template>
                    <template #tip>
                      增加案件
                    </template>
                  </MDBTooltip>
                </div>
                <!-- 刪除案件 -->
                <div>
                  <MDBTooltip v-model="tips02">
                    <template #reference>
                      <MDBBtn class="mytooltip" size="sm" color="primary" @click.stop="">
                        <i class="fas fa-minus"></i>
                      </MDBBtn>
                    </template>
                    <template #tip>
                      刪除案件
                    </template>
                  </MDBTooltip>
                </div>
              </div>
            </div>
            <!-- 右上 時間控制 變動寬度 -->
            <div :style="'width: calc(100% - ' + leftCaseWidth + 'rem);'" class="h-100 border-start">
              <div :style="'height: ' + topTimeToolH + 'rem;'" class="d-flex justify-content-between border-bottom overflow-hidden">
                <!-- 向前 -->
                <div class="h-100 d-flex align-items-center">
                  <MDBBtn size="sm" color="info" class="w-100 h-100 bg-gradient" @click.stop="moveTBar(-1)">
                    <div class="d-flex align-items-center justify-content-center">
                      <div class="me-2"><i class="fas fa-angle-double-left"></i></div>
                      <div>
                        {{ timebarFirstDateStr.split('-')[0] }}
                        <br>
                        {{ timebarFirstDateStr.split('-')[1] + '/' + timebarFirstDateStr.split('-')[2] }}
                      </div>
                    </div>
                  </MDBBtn>
                </div>
                <div style="position:relative;" class="d-flex justify-content-center align-items-center flex-grow-1">
                  <div class="d-flex flex-column">
                    <div class="align-items-center">今日：{{timebarToDayStr}}</div>
                    <div v-show="isPointerShow" class="align-items-center">游標：{{timebarPtDateStr}}</div>
                  </div>
                  <div style="position:absolute;top:0.25rem; right: 1rem">
                    <MDBTooltip v-model="tips03" direction="bottom">
                      <template #reference>
                        <MDBBtn size="sm" color="primary" @click.stop="goToDay(timebarToDayNum)">
                          今日
                        </MDBBtn>
                      </template>
                      <template #tip>
                        跳到今日位置
                      </template>
                    </MDBTooltip>
                    <MDBTooltip v-model="tips04" direction="bottom">
                      <template #reference>
                        <MDBBtn size="sm" color="primary" @click.stop="changeTimeBarType()">
                          {{timebarStepList[timebarType]}}
                        </MDBBtn>
                      </template>
                      <template #tip>
                        切換時間尺度
                      </template>
                    </MDBTooltip>
                    <MDBTooltip v-model="tips05" direction="bottom">
                      <template #reference>
                        <MDBBtn size="sm" color="primary" class="mytooltip" @click.stop="useTimePointer()">
                          ＋
                        </MDBBtn>
                      </template>
                      <template #tip>
                        顯示時間游標
                      </template>
                    </MDBTooltip>
                  </div>
                </div>
                <!-- 向後 -->
                <div class="d-flex align-items-center">
                  <MDBBtn size="sm" color="info" class="w-100 h-100 bg-gradient" @click.stop="moveTBar(1)">
                    <div class="d-flex align-items-center justify-content-center">
                      <div>
                        {{ timebarLastDateStr.split('-')[0] }}
                        <br>
                        {{ timebarLastDateStr.split('-')[1] + '/' + timebarLastDateStr.split('-')[2] }}
                      </div>
                      <div class="ms-2"><i class="fas fa-angle-double-right"></i></div>
                    </div>
                  </MDBBtn>
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
            :style="'height: calc(100% - ' + (topTimeToolH + topTBarHeight) + 'rem);'" 
            class="pos-relative w-100 overflow-auto border-top"
            :key="dragkey"
            @dblclick.stop="isPointerFix=true">
                        
            <!-- 列表 -->
            <div v-for="(x, i) in allCases" 
              :id="x.id + splitSign + 'maincase'"
              class="w-100 casebox"
              :key="i"
              @dblclick.stop="isPointerFix=true"
              draggable="true"
              @dragstart="caseBoxDragstart($event)"
              @dragend="caseBoxDragend($event)"
              @dragenter.stop="caseBoxDragenter($event)"
              @dragover="caseBoxDragover($event)"
              @drop.prevent="caseBoxDrop($event)"
              >
              <div
                v-if="!x.parent_id"
                :class="['pos-relative d-flex flex-wrap w-100 border-start border-end']" 
                >
                <!-- 主案件 -->
                <CaseBar
                  :left-case-width="leftCaseWidth"
                  :left-case-height="leftCaseHeight"
                  :time-scale-height="timeScaleHeight"
                  :case-data="x"
                  :items-click="itemsClick"
                  :date2short-str="date2shortStr"
                  :get-now-case-btn="getNowCaseBtn"
                  :split-sign="splitSign"
                  :show-sub="x.subshow?true:false"
                  @showsubcase="x.subshow=$event"
                  >
                </CaseBar>
                <!-- 子案件 -->
                <div v-show="x.subshow" class="w-100">
                  <CaseBar v-for="(xsub, isub) in x.other_m4case"
                    :is-sub-case="true"
                    :left-case-width="leftCaseWidth"
                    :left-case-height="leftCaseHeight"
                    :left-case-padding-left="1"
                    :time-scale-height="timeScaleHeight"
                    :case-data="xsub"
                    :items-click="itemsClick"
                    :date2short-str="date2shortStr"
                    :get-now-case-btn="getNowCaseBtn"
                    :split-sign="splitSign"
                    >
                  </CaseBar>
                </div>
              </div>
            </div>
            <!-- @drop.self="caseBoxDrop($event)" -->
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
        <MDBContainer :style="{width: rightToolWidth +'rem'}" class="h-100">
          <MDBRow class="h-100 align-content-start">
<!-- 功能按鈕========================= -->           
            <MDBCol col="12" :style="{height: caseDataToolHeight +'rem'}">
              <MDBRow>
                <MDBCol col="12">功能按鈕</MDBCol>
                <MDBCol col="12" >
                  <MDBRow class="justify-content-start">
                    <MDBCol>
                      <!-- 儲存 -->
                      <MDBBtn 
                        :disabled="!rGroup[3] || (nowCaseData.case.id==='')" 
                        size="sm" color="primary" 
                        @click.stop="saveCaseBtn">
                        儲存
                      </MDBBtn>
                      <!-- 增加項目 -->
                      <MDBTooltip v-model="tips06">
                        <template #reference>
                          <MDBBtn 
                            :disabled="!rGroup[3]" 
                            class="" size="sm" color="primary" 
                            @click.stop="addItem">
                            <i class="fas fa-plus"></i>
                          </MDBBtn>
                        </template>
                        <template #tip>
                          增加項目
                        </template>
                      </MDBTooltip>
                      <!-- 刪除項目 -->
                      <MDBTooltip v-model="tips07">
                        <template #reference>
                          <MDBBtn class="" size="sm" color="primary" @click.stop="">
                            <i class="fas fa-minus"></i>
                          </MDBBtn>
                        </template>
                        <template #tip>
                          刪除項目
                        </template>
                      </MDBTooltip>
                      <!-- 顯示模式 -->
                      <MDBTooltip v-model="tips08">
                        <template #reference>
                          <MDBBtn class="" size="sm" color="primary" @click.stop="showJson=!showJson">
                            <i v-if="!showJson" class="fas fa-table"></i>
                            <i v-else class="fas fa-align-justify"></i>
                          </MDBBtn>
                        </template>
                        <template #tip>
                          顯示模式切換
                        </template>
                      </MDBTooltip>
                    </MDBCol>
                    <MDBCol class="col-12">
                      目前案件：{{nowCaseData.case.id}}-{{nowCaseData.case.code}} 
                    </MDBCol>
                  </MDBRow>
                </MDBCol>
              </MDBRow>
            </MDBCol>
            <!-- 右側資訊欄 -->
<!-- 圖形顯示模式===================== -->
            <MDBCol v-show="!showJson" col="12" :style="'height: calc(100% - ' + caseDataToolHeight + 'rem);'" class="px-0 overflow-auto">
  <!-- 基本資料========================= -->
              <AccordionItem 
                v-model="activeItem" :item-id="nowCaseData.case.id + splitSign + 'base'" 
                item-name="基本資料" label-bg-color="#dc4c64">
                <template v-slot:itemText>
                  <MDBRow>
                    <MDBCol md="12" class="">
                      案件編號：{{nowCaseData.case.id}}
                      <MDBCheckbox label="已結案" v-model="nowCaseFinished" />
                    </MDBCol>
                    <!-- 案件名 -->
                    <MDBCol md="12" class="border rounded-3 border-mblue py-2">
                      <MDBRow>
                        <MDBCol md="6" class="">
                          <MDBInput size="sm" type="text" label="案件縮寫" counter :maxlength="20" v-model="nowCaseData.case.code" />
                        </MDBCol>
                        <MDBCol md="6" class="">
                          <MDBInput size="sm" type="text" label="主案件" v-model="nowCaseData.case.parent_id" />
                        </MDBCol>
                        <div></div>
                        <MDBCol md="12" class="mt-4">
                          <MDBTextarea size="sm" label="案件名稱" rows="2" v-model="nowCaseData.case.data.base.name" />
                        </MDBCol>
                        <MDBCol md="12" class="mt-2">
                          <MDBInput size="sm" type="text" label="採購編號" v-model="nowCaseData.case.data.base.purchasecode" />
                        </MDBCol>
                      </MDBRow>
                    </MDBCol>
                    <!-- 承辦及廠商 -->
                    <MDBCol md="12" class="border rounded-3 border-mpink mt-2 py-2">
                      <MDBRow>
                        <MDBCol md="12" class="">
                          <MDBInput size="sm" type="text" label="承辦人" v-model="nowCaseData.case.data.base.operator" />
                        </MDBCol>
                        <MDBCol md="12" class="mt-2">
                          <MDBInput size="sm" type="text" label="得標廠商" v-model="nowCaseData.case.data.base.weinningtenderer" />
                        </MDBCol>
                        <!-- 上傳檔案===Start -->
                        <MDBCol col="12" class="mt-2">
                          <uploadtool
                            label="基本資料表"
                            label-id="baseTable"
                            :readonly="true"
                            :hasclose="true"
                            :model-value="nowCaseData.case.data.base.baseTable"
                            :dl-path="publicPath + '01_Case/' + nowCaseData.case.id + '/'"
                            :dl-filename="nowCaseData.case.data.base.baseTable"
                            :r-group="rGroup[2]"
                            :upload-btn="uploadBtn"
                            :download-file="downloadFile"
                          ></uploadtool>
                        </MDBCol>
                        <!-- 上傳檔案===End -->
                      </MDBRow>
                    </MDBCol>
                    <!-- 期程 -->
                    <MDBCol md="12" class="border rounded-3 border-myellow mt-2 py-2">
                      <MDBRow>
                        <MDBCol md="6" class="">
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
                        <MDBCol md="6" class="">
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
                      </MDBRow>
                    </MDBCol>
                    <!-- 金額 -->
                    <MDBCol md="12" class="border rounded-3 border-mlightgreen mt-2 py-2">
                      <MDBRow>
                        <MDBCol md="12" class="mt-2">
                          <MDBInput 
                            size="sm" 
                            type="text" 
                            label="採購金額" 
                            class="text-end"
                            v-model:model-value="purchaseAM"
                            @update:model-value="dataFromCurrency('purchase_am',$event)"/>
                        </MDBCol>
                        <MDBCol md="6" class="mt-2">
                          <MDBInput 
                            size="sm" 
                            type="text" 
                            class="text-end"
                            label="預算金額" 
                            v-model:model-value="budgetAM"
                            @update:model-value="dataFromCurrency('budget_am',$event)"/>
                        </MDBCol>
                        <MDBCol md="6" class="mt-2">
                          <MDBInput 
                            size="sm" 
                            type="text" 
                            class="text-end"
                            label="擴充金額" 
                            v-model:model-value="additionAM"
                            @update:model-value="dataFromCurrency('addition_am',$event)"/>
                        </MDBCol>
                        <MDBCol md="12" class="mt-2">
                          <MDBInput 
                            size="sm" 
                            type="text" 
                            class="text-end border-danger"
                            label="決標金額" 
                            v-model:model-value="awardPrice"
                            @update:model-value="dataFromCurrency('award_price',$event)"/>
                        </MDBCol>
                      </MDBRow>
                    </MDBCol>
                  </MDBRow>
                </template>
              </AccordionItem>
  <!-- 進度表=========================== -->
              <AccordionItem 
                v-model="activeItem" :item-id="nowCaseData.case.id + splitSign + 'schedule'" 
                item-name="進度" label-bg-color="#dc4c64">
                <template v-slot:itemText>
                  <MDBRow class="align-items-stretch">
                    <div class="d-flex mt-2">
                      <!-- 增加檔案 -->
                      <MDBBtn 
                        :class="['curser-pointer','up-btn']"
                        @click.stop="addSchedule($event)"
                        ><i class="fas fa-plus"></i></MDBBtn>
                      <div class="fs-7">增加進度紀錄</div>
                    </div>
                    <!-- 進度列表 -->
                    <!-- 標題 -->
                    <MDBCol col="11" class="mt-2 fs-7 border-bottom">
                      <MDBRow class="h-100 align-items-stretch">
                        <MDBCol col="3" class="d-flex justify-content-center align-items-center">
                          <div>日期</div>
                        </MDBCol>
                        <MDBCol col="3" class="d-flex justify-content-center align-items-center">
                          <div>預估進度</div>
                        </MDBCol>
                        <MDBCol col="3" class="d-flex justify-content-center align-items-center">
                          <div>實際進度</div>
                        </MDBCol>
                        <MDBCol col="3" class="d-flex justify-content-center align-items-center">
                          <div>差異</div>
                        </MDBCol>
                      </MDBRow>
                    </MDBCol>
                    <!-- 刪除 -->
                    <MDBCol col="1" class="mt-2p-0">
                    </MDBCol>
                  </MDBRow>
                  <!-- 列表 -->
                  <MDBDatepicker v-show="false"
                    id="scheduleDatePicker"
                    size="sm" v-model="scheduleDateTemp" 
                    ref="scheduleDateDOM"
                    format="YYYY-MM-DD"
                    class="px-1 py-0"
                    :monthsFull = "monthsFull"
                    :monthsShort = "monthsShort"
                    :weekdaysFull = "weekdaysFull"
                    :weekdaysShort = "weekdaysShort"
                    :weekdaysNarrow = "weekdaysNarrow"
                    confirmDateOnSelect
                    removeCancelBtn
                    removeOkBtn
                    @update:model-value="updateSchDate(e)"/>
                  <MDBRow v-for="(sitem, sid) in nowCaseData.case.data.schedule" 
                    class="align-items-stretch my-0">
                    <!-- 進度內容 -->
                    <MDBCol col="11" class="fs-7">
                      <MDBRow class="h-100 align-items-stretch">
                        <!-- 日期 -->
                        <MDBCol col="3" class="d-flex justify-content-center align-items-center">
                          <div class="d-flex w-100 h-100" @click="openSchDatePicker($event,sid)">
                            <!-- 年 -->
                            <div class="w-50 h-100">
                              {{ getSchYear(sitem.date, sid) }}
                            </div>
                            <!-- 日期 -->
                            <div class="ms-1 w-50 h-100">
                              {{ getSchMD(sitem.date) }}
                            </div>
                          </div>
                        </MDBCol>
                        <!-- 預估進度 -->
                        <MDBCol col="3" class="d-flex justify-content-center align-items-center">
                          <MDBInput 
                            size="sm"
                            class="px-1 py-0 text-end"
                            v-model="sitem.estimated"/>%
                        </MDBCol>
                        <!-- 實際進度 -->
                        <MDBCol col="3" class="d-flex justify-content-center align-items-center">
                          <MDBInput 
                            size="sm"
                            class="px-1 py-0 text-end"
                            v-model="sitem.actual"/>%
                        </MDBCol>
                        <!-- 差異 -->
                        <MDBCol col="3" class="d-flex justify-content-center align-items-center">
                          <div v-if="!sitem.actual"></div>
                          <div v-else
                            :class="['text-end',(parseFloat(sitem.actual) - parseFloat(sitem.estimated))>=0?'text-success':'text-danger']"
                            >{{ (parseFloat(sitem.actual) - parseFloat(sitem.estimated))>=0?'+':'' }}{{  (parseFloat(sitem.actual) - parseFloat(sitem.estimated)).toFixed(2) }}%
                          </div>
                        </MDBCol>
                      </MDBRow>
                    </MDBCol>
                    <!-- 刪除按鈕 -->
                    <MDBCol col="1" class="p-0">
                      <MDBPopconfirm
                        modal
                        class="btn-sm btn-secondary px-2 flex-fill text-danger"
                        message="刪除後無法恢復，確定刪除嗎？" 
                        cancelText="取消" 
                        confirmText="確定" @confirm="removeSchedule($event,sid)">
                        <i class="far fa-trash-alt"></i>
                      </MDBPopconfirm>
                    </MDBCol>
                  </MDBRow>
                </template>
              </AccordionItem>
  <!-- 其他項目========================= -->
              <AccordionItem
                v-for="(item,idx) in nowCaseData.case.data.items"
                :item-name="item.name" 
                :label-bg-color="(item.finisheddate && item.finisheddate!==' ')?'#69CB5C':'#54b4d3'"
                :item-id="nowCaseData.case.id + splitSign + item.name + splitSign + item.id"
                :is-items="true"
                :key="idx"
                v-model="activeItem"
                @moveitemup="itemMove($event,-1)"
                @moveitemdown="itemMove($event,1)"
                >
                <template v-slot:itemText>
                  <MDBRow>
                    <MDBCol md="12" class="mt-2">
                      <MDBInput size="sm" type="text" label="項目名稱" v-model="item.name" />
                    </MDBCol>
                    <MDBCol md="12" class="mt-2">
                      <MDBInput size="sm" type="text" label="項目類型" v-model="item.type" />
                    </MDBCol>
                    <!-- 規劃日期 -->
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
                    <!-- 完成日期 -->
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
                    <!-- 上傳資料 -->
                    <MDBCol md="12" class="mt-2 pb-2 border">
                      <MDBRow>
                        <div class="d-flex mt-2">
                          <!-- 增加檔案 -->
                          <MDBBtn 
                            :class="['curser-pointer','up-btn']"
                            @click.stop="addUploadFile($event,item)"
                            ><i class="fas fa-plus"></i></MDBBtn>
                          <div class="fs-7">上傳資料</div>
                          
                        </div>
                        <!-- 上傳檔案===Start -->
                        <MDBCol v-for="(upload, iup) in item.uploads" col="12" class="mt-2">
                          <uploadtool
                            label-id="itemUpload"
                            v-model:model-value="upload.title"
                            :dl-path="publicPath + '01_Case/' + nowCaseData.case.id + '/' + item.id + '/'"
                            :dl-filename="upload.filename"
                            :upload-key="parseInt(iup)"
                            :upload-id="parseInt(upload.id)"
                            :r-group="rGroup[2]"
                            :upload-btn="uploadBtn"
                            :download-file="downloadFile"
                            :remove-upload-file="removeUploadFile"
                          ></uploadtool>
                        </MDBCol>
                        <!-- 上傳檔案===End -->
                      </MDBRow>
                      
                    </MDBCol>
                  </MDBRow>
                </template>
              </AccordionItem>
            </MDBCol>
<!-- 文字顯示模式===================== -->
            <MDBCol v-show="showJson" col="12" :style="'height: calc(100% - ' + caseDataToolHeight + 'rem);'" class="overflow-auto">
              <MDBRow class="h-100 align-content-start">
                <MDBCol col="12" style="height: calc(80% - 3rem);">
                  <textarea
                    class="fs-7 w-100 h-100 textarea-noresize" 
                    wrap="off"
                    spellcheck="false"
                    :value = "JSON.stringify(nowCaseData.case,null,2)"
                    @input="textJsonChange($event)"
                  ></textarea>
                </MDBCol>
                <MDBCol col="12">
                  格式檢查：<i :class="['fas fa-circle',jsonChecked?'text-success':'text-danger',jsonChecked===null?'text-black-50':'']"></i>
                </MDBCol>
                <MDBCol col="12" style="height: 20%;">
                  <textarea
                    class = 'fs-7 w-100 h-100 textarea-noresize'
                    spellcheck="false"
                    readonly
                    :value = "jsonChErr"
                    ></textarea>
                </MDBCol>
              </MDBRow>
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
.case-selected .boxline{
  /* border: 5px solid blue; */
  box-shadow: 0 0 5px 3px blue inset;
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
.case-selected .item-mark-selected,.item-mark:hover{
  z-index: 10;
  filter: drop-shadow(0px 0px 5px rgba(0, 0, 0, 0.7));
}

.case-selected .item-mark-selected .item-label{
  background-color:#dc4c64;
  color: white;
}

.item-mark:hover .item-label{
  background-color:#76ee55;
  color: rgb(2, 14, 249);
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

/* .caselistbox{
  background: white;
} */

.casebox.dragging {
  background: lightgreen;
  cursor:move;
}

.casebox.dhover {
  opacity: 0.8;
}
.dhover *{
  pointer-events: none;
}
.casebox{
  border-top:solid;
  border-image:linear-gradient(90deg,rgba(200, 0, 0,1),rgba(90,90,90,0.2),rgba(0,0,200,1)) 100% 0;
  /* border-color: white; */
  border-width:4px;
}
.casebox:last-child{
  border-bottom: solid;
  border-width:4px;
}
.casebox-content.subcase{
  /* border-top: 1px solid blue; */
  border:none;
  background-image:linear-gradient(to right, #009ac9 33%, rgba(255,255,255,0) 0%);
  background-position:top;
  background-size:6px 2px;
  background-repeat:repeat-x;
  border-image:none;
}
.pos-relative{
  position: relative;
}
.pos-absolute{
  position: absolute;
}
.curser-pointer{
  cursor: pointer;
}
.transtition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
.item-open{
  transform: rotate(-180deg)
}
.btn-upload-close {
  position: absolute;
  top: 0.25em;
  right: 0.25em;
}

/* 馬卡龍色系 */
.bg-mblue{
  background-color: #90f1ef !important;
}
.border-mblue{
  border-color: #90f1ef !important;
  background-color: rgba(144, 241, 239, 0.2);
}
.bg-mpink{
  background-color: #f7d5df !important;
}
.border-mpink{
  border-color: #f7d5df !important;
  background-color: rgba(247, 213, 223,0.4);
}
.bg-myellow{
  background-color: yellow !important;
}
.border-myellow{
  border-color: yellow !important;
  background-color: rgba(255, 239, 159,0.4);
}
.bg-mmintgreen{
  background-color: #c0f7a4 !important;
}
.border-mmintgreen{
  border-color: #c0f7a4 !important;
  background-color: rgba(192, 247, 164,0.3);
}
.bg-mlightgreen{
  background-color: #7bf1a8 !important;
}
.border-mlightgreen{
  border-color: #7bf1a8 !important;
  background-color: rgba(123, 241, 168,0.2);
}
/* 馬卡龍色系 */

input.border-danger + label + div>div{
  border-color: #dc4c64 !important;
}
.up-btn{
  width: 1.4rem;
  height: 1.4rem;
  line-height: 1rem;
  padding: 0.1rem 0.25rem;
  color: white;
  background-color: #00ADC1;
}
.fs-7{
  font-size: smaller;
}
.textarea-noresize{
  resize: none;
}

</style>