<script setup>
import { ref,onMounted, inject } from "vue";

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
// const showSubCase = ref(true);

function checkchange(e){
  let changeshow = checkShow.value

  emit('showsubcase', changeshow)
}

onMounted(()=>{
  checkShow.value = props.showSub;
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
  
</template>
<style scoped>
.fs-7{
  font-size: smaller;
}
</style>