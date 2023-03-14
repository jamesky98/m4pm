<script setup>
  import { ref,onMounted, inject, watch, computed } from "vue";
  import {
    MDBInput, 
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
    caseId: {type:String, default:''},
    itemId: {type:Number},
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
  const inputBox = ref();

  function downloadBtn(e){
    props.downloadFile(props.dlPath, props.modelValue)
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
          ref="inputBox"
          :readonly="props.readonly" 
          size="sm" type="text"
          :label="props.label" 
          :model-value="props.modelValue"
          @update:model-value="emit('update:modelValue',$event.target.value)">
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
          ref="inputBox"
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
        上傳
      </MDBBtn>
      <MDBBtn 
        size="sm" 
        color="secondary"
        class="px-1 flex-fill"
        @click.stop="downloadBtn($event)">
        下載
      </MDBBtn>
      <MDBBtn v-if="props.labelId!=='baseTable'"
        size="sm" 
        color="secondary"
        class="px-1 flex-fill"
        >
        <i class="far fa-eye"></i>
      </MDBBtn>
      <MDBBtn v-if="props.labelId!=='baseTable'"
        size="sm" 
        color="secondary"
        class="px-2 flex-fill"
        @click.stop="removeBtn($event)">
        <i class="far fa-trash-alt"></i>
      </MDBBtn>
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