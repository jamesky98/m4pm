<script setup>
  import { ref, onMounted, watch, computed } from "vue";
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
  const showValue = computed({
    get(){
      // 轉成貨幣
      return toCurrency(props.modelValue);
    },
    set(value){
      // 轉回數字
      value = value?value:0;
      let res = parseInt(fromCurrency(value));
      emit('update:modelValue',res);
    }
  });

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

</script>
<template>
  <MDBInput 
    :size="props.size" 
    type="text" 
    :class="props.modelClass"
    :label="props.label" 
    v-model="showValue"
    />
</template>