<script setup>
import { ref, watch, inject } from "vue";
import { computed } from "@vue/reactivity";
import {
  MDBBtn, 
} from 'mdb-vue-ui-kit';
const checked = ref(false)
const itemContextH = ref('600px');

const props = defineProps({
  itemName: {type: String, default: '未命名'},
  labelBgColor: {type: String, default: 'white'},
  labelTextColor: {type: String, default: 'white'},
  isItems: {type: Boolean, default: false},
  itemId: {type: String},
  modelValue: {type:String},
});
const emit = defineEmits(['update:modelValue','moveitemup','moveitemdown']);

const splitSign=inject('splitSign');

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
  // console.log('itemId',props.itemId);
  emit('update:modelValue', (checked.value)?props.itemId:'')
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
      <!-- 上移 -->
      <MDBBtn v-if="props.isItems"
        style="right: 5.2rem; "
        :class="['pos-absolute','curser-pointer','move-btn']"
        @click.stop="emit('moveitemup',props.itemId)"
        ><i class="fas fa-long-arrow-alt-up"></i></MDBBtn>
      <!-- 下移 -->
      <MDBBtn v-if="props.isItems"
        style="right: 3.5rem; "
        :class="['pos-absolute','curser-pointer','move-btn']"
        @click.stop="emit('moveitemdown',props.itemId)"
        ><i class="fas fa-long-arrow-alt-down"></i></MDBBtn>
      <!-- 展開符號 -->
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

.text-green-500{
  color: yellow;
}

.move-btn{
  width: 1.6rem;
  height: 1.6rem;
  line-height: 1rem;
  padding: 0.1rem 0.25rem;
  color: white;
  background-color: #3b71ca;
}
</style>