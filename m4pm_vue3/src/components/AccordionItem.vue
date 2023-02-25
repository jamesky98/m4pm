<script setup>
import { ref, watch } from "vue";
import { computed } from "@vue/reactivity";
const checked = ref(false)
const itemContextH = ref('300px');

const props = defineProps({
  itemName: {type: String, default: '未命名'},
  labelBgColor :{type: String, default: 'white'},
  labelTextColor :{type: String, default: 'white'},
  itemId: {type: String},
  modelValue: {type:String},
});
const emit = defineEmits(['update:modelValue']);

watch(() => props.modelValue,(newVal)=>{
  if(newVal===props.itemId){
    checked.value = true
  }else{
    checked.value = false
  }
})
// console.log('modelValue',props.modelValue);
// console.log('itemId',props.itemId);
function checkchange(e){
  // console.log((e.target.value==='on')?props.itemId:'');
  emit('update:modelValue', (e.target.value==='on')?props.itemId:'')
}

</script>
<template>
  <div class="w-100 px-1">
    <!-- 標題列 -->
    <div :class="[
      'pos-relative px-4 py-1 border',
      checked?'radius-label-2':'radius-label-4',
      'd-flex align-item-center',
      'label-bg bg-grey-hover',
      'transtition-all']"
      >
      <!-- 文字部分 -->
      <div :class="[
        checked && 'text-green-500',
        'text-noselect',
        'transtition-all'
      ]">
        {{ props.itemName }}
      </div>
      <!-- 符號部分 -->
      <label 
        style="right: 2rem;"
        :class="['pos-absolute','curser-pointer']">
        <input type="checkbox" class="sr-only" v-model="checked" 
        @change="checkchange($event)"/>
        <i :class="['fas fa-chevron-down',checked && 'item-open','transtition-all']"></i>
      </label>
    </div>
    <!-- 內容 -->
    <div :class="[
      'border radius-content',
      checked ? 'max-h-x' : 'max-h-0',
      'overflow-auto transtition-all'
      ]">
      <div :class="['px-4 py-1']">
        <slot name="itemText">
          內容
        </slot>
      </div>
    </div>
  </div>
</template>
<style scoped>
.max-h-0{
  display: none;
  max-height: 0;
}
.max-h-x{
  max-height: v-bind('itemContextH');
}
.text-noselect{
  user-select:none;
}
.pos-relative{
  position: relative;
}
.pos-absolute{
  position: absolute;
}
.radius-label-2 {
  border-radius: 0.5rem 0.5rem 0 0;
}
.radius-label-4 {
  border-radius: 0.5rem;
}
.radius-content{
  border-radius: 0 0 0.5rem 0.5rem;
}
.label-bg{
  color: v-bind('props.labelTextColor');
  background-color: v-bind('props.labelBgColor');
}
.bg-grey-hover:hover{
  color: white;
  background-color: #999999;
}
.curser-pointer{
  cursor: pointer;
}
.transtition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
.text-green-500{
  color: yellow;
}
.item-open{
  transform: rotate(-180deg)
}
</style>