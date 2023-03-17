<script setup>
  import { ref,onMounted, inject, watch, computed } from "vue";
  import {
    MDBInput, MDBPopconfirm,
    MDBBtn, MDBBtnClose,
    MDBCol, MDBRow,
  } from 'mdb-vue-ui-kit';
  // uploadKey:Array中第幾個，非ID
  // uploadBtn:要用ID當key
  // removeUploadFile:用uploadKey即Array中第幾個，非ID
  const props = defineProps({
    label: {type: String, default:''},
    labelId: {type: String, default:''},
    modelValue: {type:String},
    dlPath: {type:String},
    dlFilename: {type:String},
    uploadId: {type:Number},
    uploadKey: {type:Number, default:0},
    readonly: {type: Boolean, default:false},
    hasclose: {type: Boolean, default:false},
    rGroup: {type: Boolean},
    uploadBtn: {type: Function},
    downloadFile: {type: Function},
    removeUploadFile: {type: Function},
  });
  const emit = defineEmits(['update:modelValue']);

  function downloadBtn(e){
    props.downloadFile(props.dlPath + props.dlFilename, props.modelValue)
  }

  function removeBtn(e){
    props.removeUploadFile(e, props.uploadKey);
  }
  function updateValue(e){
    emit('update:modelValue',e);
  }
</script>
<template>

<MDBRow>
  <MDBCol v-if="props.labelId==='baseTable'" col="8">
    <MDBRow>
      <MDBCol col="12" class="">
        <MDBInput 
          :readonly="props.readonly" 
          size="sm" type="text"
          :label="props.label" 
          :model-value="props.modelValue"
          @update:model-value="updateValue($event)">
          <MDBBtnClose v-if="props.hasclose" :disabled="!props.rGroup" @click.prevent="this.value = ''"
            class="btn-upload-close" />
        </MDBInput>
      </MDBCol>
    </MDBRow>
  </MDBCol>
  <MDBCol v-else col="7">
    <MDBRow>
      <MDBCol col="2" class="pe-0 fs-7">
        <div class="w-100 h-100 border border-end-0 rounded-start bg-secondary d-flex align-items-center">
          <div class="px-1 text-white">{{ uploadKey }}</div>
        </div>
      </MDBCol>
      <MDBCol col="10" class="px-0">
        <MDBInput 
          :readonly="props.readonly" 
          size="sm" type="text"
          :label="props.label" 
          :model-value="props.modelValue"
          @update:model-value="updateValue($event)">
          <MDBBtnClose v-if="props.hasclose" :disabled="!props.rGroup" @click.prevent="this.value = ''"
            class="btn-upload-close" />
        </MDBInput>
      </MDBCol>
    </MDBRow>
  </MDBCol>
  <MDBCol :col="(props.labelId==='baseTable')?'4':'5'" class="d-flex ps-0">
      <MDBBtn 
        :disabled="!props.rGroup" 
        size="sm" 
        color="primary" 
        class="px-1 flex-fill"
        @click="props.uploadBtn(props.labelId,props.uploadId)">
        <i class="fas fa-upload"></i>
      </MDBBtn>
      <!-- 下載 -->
      <MDBBtn 
        :disabled="!props.dlFilename || props.dlFilename===''"
        size="sm" 
        color="secondary"
        class="px-1 flex-fill"
        @click.stop="downloadBtn($event)">
        <i class="fas fa-download"></i>
      </MDBBtn>
      <!-- 檢視 -->
      <MDBBtn v-if="props.labelId!=='baseTable'"
        :disabled="!props.dlFilename || props.dlFilename===''"
        size="sm" 
        color="secondary"
        class="px-1 flex-fill">
        <a target=_blank :href="props.dlPath + props.dlFilename + '?t=' + new Date().getTime()">
          <i class="fas fa-search"></i>
        </a>
      </MDBBtn>
      <!-- 刪除 -->
      <MDBPopconfirm v-if="props.labelId!=='baseTable'"
        modal
        class="btn-sm btn-secondary px-2 flex-fill text-danger"
        message="刪除後無法恢復，確定刪除嗎？" 
        cancelText="取消" 
        confirmText="確定" @confirm="removeBtn($event)">
        <i class="far fa-trash-alt"></i>
      </MDBPopconfirm>
  </MDBCol>
</MDBRow>
  
</template>
<style scoped>
.btn-upload-close {
  position: absolute;
  top: 0.25em;
  right: 0.25em;
}

</style>