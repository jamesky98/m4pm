<script setup>
import { ref, watch , onMounted ,inject } from "vue";
import {
  MDBCol, MDBRow, MDBContainer,
  MDBBtn,
} from 'mdb-vue-ui-kit';
import { computed } from "@vue/reactivity";

const props = defineProps({
  isSubCase: {type: Boolean, default:false},
  showSub: {type: Boolean, default:false},
  leftCaseWidth: {type: Number, default: 12},
  leftCaseHeight: {type: Number, default: 10},
  leftCasePaddingLeft: {type: Number, default: 0.5},
  timeScaleHeight: {type: Number, default: 6},
  caseData: {type: Object},
  itemsClick: {type: Function},
  date2shortStr: {type: Function},
  getNowCaseBtn: {type: Function},
  toCurrency: {type: Function},
});
const emit = defineEmits(['showsubcase','moveitemup','moveitemdown']);
const timebarToDayLeft = inject('timebarToDayLeft');
const activeItem = inject('activeItem');
const splitSign = inject('splitSign');
const checkShow = ref(false);
// 進度值
const actPercent = ref(0);
const estPercent = ref(0);
// 付款相關
const totalPay = ref(0);
const actPayPercent = ref(0);
const actPay = ref(0);

watch(() => props.caseData,(newCaseData)=>{
  findSchedule(newCaseData);
  computePay(newCaseData);
})

// 找尋目前進度
function findSchedule(newCaseData){
  let schedule = newCaseData.data.schedule;
  let nowDate = new Date()
  let nowDateNum = new Date(nowDate.getFullYear(),nowDate.getMonth(),nowDate.getDate()).getTime();
  // 找日期最接近現在且小於等於現在的紀錄
  let maxDateNum = 0;
  let maxAct = 0;
  let scheduleId = -1;
  for(let i=0;i<schedule.length;i++){
    if(schedule[i].date){
      if(schedule[i].date.trim()!==''){
        // 轉換成dateNum
        let checkDateNum = new Date(schedule[i].date).getTime();
        // 判斷小於等於今日且大於等於max
        if((nowDateNum - checkDateNum)>=0 && (checkDateNum-maxDateNum)>=0){
          maxDateNum = checkDateNum;
          scheduleId = i;
          if(parseFloat(schedule[i].actual)>=maxAct){
            maxAct = parseFloat(schedule[i].actual);
          }
        }
      }
    }
  }
  // 搜尋完畢，填入進度值
  if(scheduleId>-1){
    actPercent.value = (maxAct)?parseFloat(maxAct).toFixed(1):0;
    estPercent.value = (schedule[scheduleId].estimated)?parseFloat(schedule[scheduleId].estimated).toFixed(1):0;
  }else{
    actPercent.value = 0;
    estPercent.value = 0;
  }
}
// 計算目前付款
function computePay(newCaseData){
  let pays = newCaseData.data.pay;
  let changes = newCaseData.data.changes;
  let total_price = (newCaseData.data.base.award_price)?parseInt(newCaseData.data.base.award_price):0;
  let sumPay = 0;

  if(pays){
    // console.log('pays',pays);
    // 計算最終總價金 查看是否有契變
    if(changes && changes.length>0){
      for(let i=0;i<changes.length;i++){
        total_price=total_price + parseInt(changes[i].diff_price);
      }
    }
    // 查看有付款日期才算付款 加總所有日期的付款
    for(let j=0;j<pays.length;j++){
      if(pays[j].date && pays[j].date.trim()!==''){
        sumPay = sumPay + parseInt(pays[j].actual);
      }
    }
  }
  totalPay.value = props.toCurrency(total_price);
  actPay.value =  props.toCurrency(sumPay);
  actPayPercent.value = (sumPay===0 || total_price===0)?0:(sumPay / total_price * 100).toFixed(1);
  // console.log('actPayPercent',actPayPercent.value)
}

function checkchange(e){
  let changeshow = checkShow.value
  emit('showsubcase', changeshow)
}
function moveSubCaseEvent(direct){
  if(direct<0){
    emit('moveitemup',props.caseData)
  }else{
    emit('moveitemdown',props.caseData)
  }
}
onMounted(()=>{
  checkShow.value = props.showSub;
  findSchedule(props.caseData);
  computePay(props.caseData);
})

</script>
<template>
  <div 
    :id="props.caseData.id + splitSign + 'casebox'"
    :class="['d-flex w-100 casebox-content', props.isSubCase?'subcase':'']" 
    :style="{
      position:'relative',
      // height: leftCaseHeight + 'rem',
    }"
    @click.stop="getNowCaseBtn($event,props.caseData.id)" 
    >
    <!-- 左方標題 -->
    <div 
      :style="{
        width: props.leftCaseWidth + 'rem',
        padding: '0.5rem 1.5rem 0.5rem ' + props.leftCasePaddingLeft + 'rem',
      }" 
      class="h-100 border-end pos-relative"
      >
      <!-- 案件簡稱 -->
      <div class="d-flex mt-1 w-100">
        <div :class="['w-100 rounded px-1 text-white bg-gradient user-select-all', props.isSubCase?'bg-secondary':'bg-primary']">{{ props.caseData.code }}</div>
        <!-- <div class="case-label-content bg-primary-light border rounded-end border-primary px-1">{{ props.caseData.code }}</div> -->
      </div>
      <!-- 廠商資料 -->
      <div class="d-flex mt-1">
        <div class="case-label-title bg-danger rounded-start px-1 fs-7 text-white bg-gradient">廠商</div>
        <div class="case-label-content bg-danger-light border rounded-end border-danger px-1 fs-7 user-select-all">{{ props.caseData.data.base.weinningtenderer }}</div>
      </div>
      <!-- 承辦資料 -->
      <div class="d-flex mt-1">
        <div class="case-label-title bg-warning rounded-start px-1 fs-7 text-white bg-gradient">承辦</div>
        <div class="case-label-content bg-warning-light border rounded-end border-warning px-1 fs-7 user-select-all">{{ props.caseData.data.base.operator }}</div>
      </div>
      <!-- 進度資料 -->
      <div class="d-flex mt-1">
        <div class="case-label-title bg-info rounded-start px-1 fs-7 text-white bg-gradient">進度</div>
        <div class="case-label-content bg-info-light border rounded-end border-info px-1 fs-7 user-select-all">
          <span class="">
            預定 {{actPercent}}% </span><br>
          <span class="">
            實際 {{estPercent}}% </span>
          <span :class="['schedule-diff',(parseFloat(actPercent) - parseFloat(estPercent))>=0?'text-success':'text-danger']">
            {{ (parseFloat(actPercent) - parseFloat(estPercent))>=0?'+':'' }}{{ (parseFloat(actPercent) - parseFloat(estPercent)).toFixed(1) }}%
          </span>  
        </div>
      </div>
      
      <!-- 展開符號 -->
      <label v-show="!props.isSubCase && props.caseData.other_m4case.length>0"
        style="right: 0.3rem; top:0.25rem"
        :class="['pos-absolute','curser-pointer']"
        @change="checkchange($event)">
        <input type="checkbox" class="sr-only" v-model="checkShow"/>
        <i :class="['fas fa-chevron-down',checkShow && 'item-open','transtition-all']"></i>
      </label>
      <!-- 上移 -->
      <MDBBtn v-if="props.isSubCase"
        style="right: 0.15rem; top:1.75rem"
        :class="['pos-absolute','curser-pointer','move-btn']"
        @click.stop="moveSubCaseEvent(-1)"
        ><i class="fas fa-long-arrow-alt-up"></i></MDBBtn>
      <!-- 下移 -->
      <MDBBtn v-if="props.isSubCase"
        style="right: 0.15rem; top:3.5rem"
        :class="['pos-absolute','curser-pointer','move-btn']"
        @click.stop="moveSubCaseEvent(1)"
        ><i class="fas fa-long-arrow-alt-down"></i></MDBBtn>
    </div>
    <!-- 右方時間列表 -->
    <div 
      :style="'position: relative; width: calc(100% - ' + props.leftCaseWidth + 'rem);min-width: 4rem'" 
      class="h-100 overflow-hidden d-flex flex-column">
      <!-- 時程表 -->
      <div :style="'position: relative;height:' + props.timeScaleHeight + 'rem;'" class="w-100">
        <!-- 執行期間 -->
        <!-- 過去 -->
        <div v-show="props.caseData.tbarSize.width>0"
          :style="'position: absolute;height: 1rem;top:calc((100% / 2) - 0.5rem); left:' + 
            props.caseData.tbarSize.left + 
            'px;background-color: #90f1ef; width:' + 
            props.caseData.tbarSize.passWidth + 'px;'" 
          :class="'border-top border-bottom'"></div>
        <!-- 未來 -->
          <div v-show="props.caseData.tbarSize.width>0"
          :style="'position: absolute;height: 1rem;top:calc((100% / 2) - 0.5rem); left:' + 
            timebarToDayLeft + 'px;background-color: #f7d5df; width:' + 
            props.caseData.tbarSize.featureWidth + 'px;'" 
          :class="'border-top border-bottom'"></div>
        <!-- 保固期間 -->
        <div v-show="props.caseData.guarSize.width>0"
          :style="'position: absolute;height: 1rem;top:calc((100% / 2) - 0.5rem); left:' + 
            props.caseData.guarSize.left + 'px;background-color: #ffef9f; width:' + 
            props.caseData.guarSize.width + 'px;'" 
          :class="'border-top border-bottom'"></div>
        <!-- Items -->
        <div v-for="(item, idx) in props.caseData.data.items" :key="idx" v-show="item.position.left>=0"
          :style="'position: absolute;top:calc((100% / 2) - 0.5rem);left:' + 
            item.position.left + 'px;'">
          <div 
            v-if="((item.date && item.date !== ' ') || (item.finisheddate && item.finisheddate !== ' '))" 
            :class="['item-mark',(item.finisheddate && item.finisheddate !== ' ')?'item-finished':'',(activeItem===props.caseData.id + splitSign +item.name + splitSign + item.id) && 'item-mark-selected']"
            @click.stop="props.itemsClick($event,props.caseData.id,props.caseData.id + splitSign +item.name + splitSign + item.id)">
            <div class="item-line"></div>
            <div class="item-tri"></div>
            <div class="item-label">{{ item.name }}</div>
            <div class="item-date">{{ props.date2shortStr((item.finisheddate && item.finisheddate !== ' ')?item.finisheddate:item.date)}}</div>
          </div>
        </div>
      </div>
      <MDBContainer class="border-top">
        <MDBRow>
        <!-- 執行進度 -->
        <MDBCol col="6" style="position:relative; height: 2rem;" class="">
          <!-- 總長 -->
          <div class="back-bar"></div>
          <!-- 預計進度 -->
          <div :style="'width: calc('+ estPercent + '% - 1rem);'" class="est-bar"></div>
          <!-- 實際進度 -->
          <div :style="'width: calc('+ actPercent + '% - 1rem);'" class="act-bar"></div>
          <!-- 數字 -->
          <div style="position:absolute; bottom:0.4rem;right: 10%;">
            <span class="schedule-text">
              <span :class="['schedule-title-text',(parseFloat(actPercent) - parseFloat(estPercent))>=0?'text-success':'text-danger']">
                {{actPercent}}% </span>
              <span><i style="transform:rotate(85deg)" class="fas fa-slash"></i></span>
              <span class="schedule-title-text">
                {{estPercent}}% </span>
              <!-- <span :class="['schedule-diff',(parseFloat(actPercent) - parseFloat(estPercent))>=0?'text-success':'text-danger']">
                {{ (parseFloat(actPercent) - parseFloat(estPercent))>=0?'+':'' }}{{ (parseFloat(actPercent) - parseFloat(estPercent)).toFixed(1) }}%
              </span> -->
            </span>
          </div>
          <div 
            style="position:absolute; bottom:0.6rem;left: 1rem;"
            class="fs-7 schedule-title-text">
            進度
          </div>
        </MDBCol>
        <!-- 經費使用 -->
        <MDBCol col="6" style="position:relative; height: 2rem;" class="">
          <!-- 總長 -->
          <div class="back-bar"></div>
          <!-- 實際進度 -->
          <div :style="'width: calc('+ actPayPercent + '% - 1rem);'" class="act-pay-bar"></div>
          <!-- 數字 -->
          <div style="position:absolute; bottom:0.4rem;right: 10%;">
            <span class="schedule-text">
              <span class="schedule-est">
                {{actPay}}</span>
              <span class="pay-percent">
                ({{ actPayPercent }}%)</span>
              <span><i style="transform:rotate(85deg)" class="fas fa-slash"></i></span>
              <span class="schedule-title-text">
                {{totalPay}}</span>
              <!-- <span :class="['schedule-diff',(parseFloat(actPercent) - parseFloat(estPercent))>=0?'text-success':'text-danger']">
                {{ (parseFloat(actPercent) - parseFloat(estPercent))>=0?'+':'' }}{{ (parseFloat(actPercent) - parseFloat(estPercent)).toFixed(1) }}%
              </span> -->
            </span>
          </div>
          <div 
            style="position:absolute; bottom:0.6rem;left: 1rem;"
            class="fs-7 schedule-title-text">
            付款
          </div>
        </MDBCol>
      </MDBRow>
      </MDBContainer>
    </div>
    <!-- 框線 -->
    <div style="position:absolute; top:0;lef:0;" class="h-100 w-100 boxline"></div>
  </div>
  
</template>
<style scoped>
.act-pay-bar {
  position:absolute;
  height: 0.6rem;
  left: 0;
  bottom: 0.75rem;
  background: 
    linear-gradient(135deg, transparent 0.424rem, hsl(120, 80%, 40%) 0, hsl(120, 80%, 80%) calc(100% - 0.424rem),transparent calc(100% - 0.424rem)) top left;
  background-size: 100% 100%;
  background-repeat: no-repeat;
  /* filter: drop-shadow(0.25rem 0.25rem 0.2rem hsl(0, 0%, 60%)); */
}
.act-bar {
  position:absolute;
  height: 0.6rem;
  left: 0;
  bottom: 0.75rem;
  background: 
    linear-gradient(135deg, transparent 0.424rem, hsl(60, 100%, 60%) 0, hsl(60, 100%, 40%) calc(100% - 0.424rem),transparent calc(100% - 0.424rem)) top left;
  background-size: 100% 100%;
  background-repeat: no-repeat;
  /* filter: drop-shadow(0.25rem 0.25rem 0.2rem hsl(0, 0%, 60%)); */
}
.est-bar {
  position:absolute;
  height: 0.6rem;
  left: 0;
  bottom: 0.75rem;
  background: 
    linear-gradient(135deg, transparent 0.424rem, hwb(205 40% 20%) 0, hsl(205, 100%, 80%) calc(100% - 0.424rem),transparent calc(100% - 0.424rem)) top left;
  background-size: 100% 100%;
  background-repeat: no-repeat;
  filter: drop-shadow(0.25rem 0.25rem 0.2rem hsl(0, 0%, 60%));
}
.back-bar {
  position:absolute;
  width: calc(100% - 1rem);
  height: 0.6rem;
  left: 0;
  bottom: 0.5rem;
  background: 
    linear-gradient(135deg, transparent 0.424rem, rgba(0, 0, 0, 0.1) 0, rgba(0, 0, 0, 0.4) calc(100% - 0.424rem),transparent calc(100% - 0.424rem)) top left;
  background-size: 100% 100%;
  background-repeat: no-repeat;
}
.schedule-title-text{
  color: rgb(0, 0, 0); 
  text-shadow: white 0 0 0.3rem,white 0 0 0.3rem,white 0 0 0.3rem;
}
.schedule-text{
  font-size: 13px;
}
.schedule-act{
  color: rgb(0, 0, 0); 
  text-shadow: rgb(255, 255, 0) 0 0 0.1rem,rgb(151, 151, 2) 0 0 0.1rem;
}
.schedule-est{
  color: rgb(0, 0, 0); 
  text-shadow: rgb(0, 255, 255) 0 0 0.1rem;
}
.schedule-diff{
  font-size: 13px;
  text-shadow: none;
}
.pay-percent{
  color: rgb(55, 0, 0); 
  text-shadow: 
    rgb(55, 0, 0) 0.5px 0 0rem,
    rgb(55, 0, 0) -0.5px 0 0rem,
    rgb(55, 0, 0) 0 -0.5px 0rem,
    rgb(55, 0, 0) 0 0.5px 0rem;
}
.case-label-title{
  width: 2.5rem;
}
.case-label-content{
  width: calc(100% - 2.5rem);
}
.bg-primary-light{
  background-color: hwb(217 90% 0%);
}
.bg-danger-light{
  background-color: hwb(350 90% 0%);
}
.bg-warning-light{
  background-color: hwb(40 90% 0%);
}
.bg-info-light{
  background-color: hwb(195 90% 0%);
}
.move-btn{
  width: 1rem;
  height: 1.5rem;
  line-height: 1.2rem;
  padding: 0.15rem;
  color: white;
  background-color: #28c213;
}
</style>