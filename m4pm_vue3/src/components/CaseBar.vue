<script setup>
import { ref, watch , onMounted ,inject } from "vue";
import {
  MDBCol, MDBRow, MDBContainer
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
});
const emit = defineEmits(['showsubcase']);
const timebarToDayLeft = inject('timebarToDayLeft');
const activeItem = inject('activeItem');
const splitSign = inject('splitSign');
const checkShow = ref(false);

const actPercent = ref(0);
const estPercent = ref(0);

watch(() => props.caseData,(newCaseData)=>{
  findSchedule(newCaseData);
})

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
    actPercent.value = (maxAct)?parseFloat(maxAct).toFixed(2):0;
    estPercent.value = (schedule[scheduleId].estimated)?parseFloat(schedule[scheduleId].estimated).toFixed(2):0;
  }else{
    actPercent.value = 0;
    estPercent.value = 0;
  }
}

function checkchange(e){
  let changeshow = checkShow.value

  emit('showsubcase', changeshow)
}

onMounted(()=>{
  checkShow.value = props.showSub;
  findSchedule(props.caseData);
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
      <div class="d-flex mt-1">
        <div class="bg-mmintgreen rounded-start px-1">案件</div>
        <div class="border rounded-end border-mmintgreen px-1">{{ props.caseData.code }}</div>
      </div>
      <div class="d-flex mt-1">
        <div class="bg-mpink rounded-start px-1 fs-7">廠商</div>
        <div class="border rounded-end border-mpink px-1 fs-7">{{ props.caseData.data.base.weinningtenderer }}</div>
      </div>
      <div class="d-flex mt-1">
        <div class="bg-mblue rounded-start px-1 fs-7">承辦</div>
        <div class="border rounded-end border-mblue px-1 fs-7">{{ props.caseData.data.base.operator }}</div>
      </div>
      
      <!-- 展開符號 -->
      <label v-show="!props.isSubCase && props.caseData.other_m4case.length>0"
        style="right: 0.5rem; top:0.25rem"
        :class="['pos-absolute','curser-pointer']"
        @change="checkchange($event)">
        <input type="checkbox" class="sr-only" v-model="checkShow"/>
        <i :class="['fas fa-chevron-down',checkShow && 'item-open','transtition-all']"></i>
      </label>
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
            :class="['item-mark',(item.finisheddate && item.finisheddate !== ' ')?'item-finished':'',(activeItem===props.caseData.id + splitSign +item.name + splitSign + idx) && 'item-mark-selected']"
            @click.stop="props.itemsClick($event,props.caseData.id,props.caseData.id + splitSign +item.name + splitSign + idx)">
            <div class="item-line"></div>
            <div class="item-tri"></div>
            <div class="item-label">{{ item.name }}</div>
            <div class="item-date">{{ props.date2shortStr((item.finisheddate && item.finisheddate !== ' ')?item.finisheddate:item.date)}}</div>
          </div>
        </div>
      </div>
      <MDBContainer>
        <MDBRow>
        <!-- 執行進度 -->
        <MDBCol col="6" style="position:relative; height: 3rem;" class="">
          <!-- 總長 -->
          <div class="back-bar"></div>
          <!-- 預計進度 -->
          <div :style="'width: calc('+ estPercent + '% - 1rem);'" class="est-bar"></div>
          <!-- 實際進度 -->
          <div :style="'width: calc('+ actPercent + '% - 1rem);'" class="act-bar"></div>
          <!-- 數字 -->
          <div style="position:absolute; bottom:1.1rem;right: 10%;">
            <span class="schedule-text">
              進度 {{actPercent}}% 
              <span class="schedule-est">
                / {{estPercent}}% 
              </span>
              <span :class="['schedule-diff',(parseFloat(actPercent) - parseFloat(estPercent))>=0?'text-success':'text-danger']">
                {{ (parseFloat(actPercent) - parseFloat(estPercent))>=0?'+':'' }}{{ (parseFloat(actPercent) - parseFloat(estPercent)).toFixed(2) }}%
              </span>
            </span>
          </div>
        </MDBCol>
        <!-- 經費使用 -->
        <MDBCol col="6" class="border">
          經費
        </MDBCol>
      </MDBRow>
      </MDBContainer>
    </div>
    <!-- 框線 -->
    <div style="position:absolute; top:0;lef:0;" class="h-100 w-100 boxline"></div>
  </div>
  
</template>
<style scoped>
.act-bar {
  position:absolute;
  width: calc(100% - 1rem);
  height: 0.5rem;
  left: 0;
  bottom: 0.75rem;
  background: 
    linear-gradient(135deg, transparent 0.75rem, hsl(60, 100%, 60%) 0, hsl(60, 100%, 40%) calc(100% - 0.75rem),transparent calc(100% - 0.75rem)) top left;
  background-size: 100% 100%;
  background-repeat: no-repeat;
  /* filter: drop-shadow(0.25rem 0.25rem 0.2rem hsl(0, 0%, 60%)); */
}
.est-bar {
  position:absolute;
  width: calc(100% - 1rem);
  height: 0.5rem;
  left: 0;
  bottom: 0.75rem;
  background: 
    linear-gradient(135deg, transparent 0.75rem, hsl(205, 100%, 40%) 0, hsl(205, 100%, 80%) calc(100% - 0.75rem),transparent calc(100% - 0.75rem)) top left;
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
    linear-gradient(135deg, transparent 0.75rem, rgba(0, 0, 0, 0.1) 0, rgba(0, 0, 0, 0.4) calc(100% - 0.75rem),transparent calc(100% - 0.75rem)) top left;
  background-size: 100% 100%;
  background-repeat: no-repeat;
}
.schedule-text{
  font-size: 13px;
  color: yellow; 
  text-shadow: black 0 0 0.2rem,black 0 0 0.2rem,black 0 0 0.2rem;
}
.schedule-est{
  color: blue; 
  text-shadow: black 0 0 0.2rem;
}
.schedule-diff{
  font-size: 13px;
  text-shadow: none;
}
</style>