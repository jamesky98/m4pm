<script setup>
  import { ref, onMounted, watch } from "vue";
  import {
    MDBInput,
  } from 'mdb-vue-ui-kit';
  const props = defineProps({
    size:{type: String, default:''},
    modelClass:{type: String, default:''},
    label:{type: String, default:''},
    modelValue:[Number, String],
  });
  const emit = defineEmits(['update:modelValue']);
  const showValue = ref('');

  function updateValue(event){
    // console.log('event',event)
    // 先反轉
    let res = parseInt(fromCurrency(event));
    // console.log('res',res)
    // 再更新modelValue(非貨幣格式)
    emit('update:modelValue',res);
    // 回存showValue(貨幣格式)
    showValue.value = toCurrency(res);
  }
  // 轉成貨幣格式
  function toCurrency(num){
    // console.log('num',num)
    if(!num){return}
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

  onMounted(()=>{
    // console.log(props.modelValue)
    showValue.value = toCurrency(props.modelValue);
  })
</script>
<template>
  <MDBInput 
    :size="props.size" 
    type="text" 
    :class="props.modelClass"
    :label="props.label" 
    :model-value="showValue"
    @update:model-value="updateValue($event)"/>
</template>