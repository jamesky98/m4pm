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
  const pointerWidth = ref("");
  const timebarFirstDateNum = ref("");
  const timebarLastDateNum = ref("");
  const timebarFirstDateStr = ref("");
  const timebarLastDateStr = ref("");
  const timebarType = ref(0); // 0:年 1:季 2:月 3:週

//#endregion 參數==========End


// #region 時間軸==========Start
  // 游標移動處理事件
  function movetimepointer(){
    let div=document.getElementById('timepointer');
    let timebar=document.getElementById('timebar');
    const parentXY = getPosition(timebar);
    
    let boxLeft = parentXY.x;
    let boxWidth = timebar.offsetWidth;
    let boxRight = boxLeft + boxWidth;
    let borderWidth = 1;

    timebarStart.value = boxLeft;
    timebarEnd.value = boxRight;
    timebarWidth.value = boxWidth;
    pointerWidth.value = boxWidth - borderWidth;

    if (!div) {
      return;
    }
    let intX=window.event.clientX;
    mouseX.value = intX;
    let intY=window.event.clientY;
    mouseY.value = intY;
    
    // 要扣除右邊的邊框寬度
    if( intX < boxLeft){
      div.style.left = "0px";
    }else if(intX > (boxRight)){
      div.style.left= (boxWidth - borderWidth) +"px";
    }else{
      div.style.left=(intX-boxLeft)+"px";
    }
    const pointerXY = getPosition(div);
    pointerX.value = pointerXY.x;
    pointerY.value = pointerXY.y;
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
    let firstDateNum = Date.UTC(nowDate.getFullYear(),0,1);
    timebarFirstDateNum.value = firstDateNum;
    timebarFirstDateStr.value = new Date(firstDateNum).toISOString().split('T')[0];

  }
  function setlastDate(){
    let type = timebarType.value;
    let firstDate = new Date(timebarFirstDateNum.value);
    let lastDate;

    if(type===0){
      // 以年顯示
      lastDate = Date.UTC(firstDate.getFullYear(),11,31);
    }else if(type===1){
      // 以季顯示
    }else if(type===2){
      // 以月顯示
    }else if(type===3){
      // 以週顯示
    }
    timebarLastDateNum.value = lastDate;
    timebarLastDateStr.value = new Date(lastDate).toISOString().split('T')[0];
  }
//#endregion 時間軸==========End

onMounted(()=>{
  // 游標移動事件==>時間軸游標變化
  document.onmousemove = movetimepointer;
  // 設定初始時間軸起始點
  new Promise((res,rej)=>{
    res(initFirstDate());
  }).then(res=>{
    setlastDate();
  })
  
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
            </div>
            <!-- 右上 時間控制 變動寬度 -->
            <div style="width: calc(100% - 12rem);" class="h-100">
              <!-- 上部 時間操作列 -->
              <div class="h-50 border-bottom">
                時間操作：滑鼠({{ mouseX }}, {{ mouseY }})，游標({{ pointerX }}, {{ pointerY }})
              </div>
              <!-- 下部 時間顯示列 -->
              <div id="timebar" style="position:relative ;" class="d-flex h-50">
                <div v-for="x in 12" style="width: calc(100% / 12);" :class="(x===12)?'':'border-end'">{{ x }}</div>
                <div id="timepointer" style="position: absolute;color: red;border-left: 1px solid red;" class="h-100"></div>
              </div>
            </div>
          </div>
          <!-- 下方 浮動案件列表 -->
          <div style="height: calc(100% - 4rem);" class="w-100 border">
            <p>下方 浮動案件列表</p>
            <p>時間軸起點：{{timebarStart}}</p>
            <p>時間軸終點：{{timebarEnd}}</p>
            <p>時間軸物件寬度：{{timebarWidth}}</p>
            <p>時間軸內部寬度：{{pointerWidth}}</p>
            <p>時間軸起始日(數)：{{timebarFirstDateNum}}，時間軸起始日(字)：{{timebarFirstDateStr}}</p>
            <p>時間軸結束日(數)：{{timebarLastDateNum}}，時間軸結束日(字)：{{timebarLastDateStr}}</p>
            
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