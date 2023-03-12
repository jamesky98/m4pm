<script setup>
  import { ref,onMounted, inject,watch } from "vue";
  import {
    MDBInput, 
    MDBBtn, MDBBtnClose,
  } from 'mdb-vue-ui-kit';
  const props = defineProps({
    label: {type: String, default:''},
    labelId: {type: String, default:''},
    modelValue: {type:String},
    dlPath: {type:String},
    uploadKey: {type:Number, default:0},
    readonly: {type: Boolean, default:false},
    hasclose: {type: Boolean, default:false},
    rGroup: {type: Boolean},
    uploadBtn: {type: Function},
    downloadFile: {type: Function},
  });
  const fileName = ref('');
  watch(() => props.modelValue,(newVal)=>{
    // console.log('newVal',newVal)
    fileName.value = newVal;
  })
  onMounted(()=>{
    fileName.value = props.modelValue
  })
  // console.log(props.uploadKey,props.labelId,props.modelValue)
</script>
<template>
<div class="d-flex">
  <MDBInput 
    :readonly="props.readonly" 
    style="padding-right: 2.2em" 
    size="sm" type="text"
    :label="props.label" 
    v-model:model-value="fileName">
    <MDBBtnClose v-if="props.hasclose" :disabled="!props.rGroup" @click.prevent="fileName = ''"
      class="btn-upload-close" />
  </MDBInput>
  <MDBBtn 
    :disabled="!props.rGroup" 
    size="sm" 
    color="primary" 
    style="width: 4rem; padding-left: 0.25rem;padding-right: 0.25rem;"
    @click="props.uploadBtn(props.labelId,props.uploadKey)">
    上傳
  </MDBBtn>
  <MDBBtn 
    size="sm" 
    color="secondary"
    style="width: 4rem; padding-left: 0.25rem;padding-right: 0.25rem;"
    @click.stop="props.downloadFile(props.dlPath, fileName)">
    下載
  </MDBBtn>
</div>
</template>
<style scoped>
.btn-upload-close {
  position: absolute;
  top: 0.25em;
  right: 0.25em;
}
</style>