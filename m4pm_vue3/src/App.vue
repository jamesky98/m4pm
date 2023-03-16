<script setup>
import { ref, provide, inject } from "vue";

// 設定公開路徑位置
const publicPath = ref(import.meta.env.VITE_GRAPHQL_PUBLIC);
provide("publicPath", publicPath);
// 設定權限
function rGroupSetting(role,opt1){
  let result=[];
  // rGroup[0]最高權限
  // rGroup[1]技術主管以上專用
  // rGroup[2]技術人員專用(非己不可改)
  // rGroup[3]最低權限
  // rGroup[4]完全開放
  switch (role){
    case 0://訪客
        result = [false,false,false,false,true];
      break;
    case 1://校正人員
      if(opt1){
        // 允許校正人員使用
        result = [false, false, true, true, true];
      }else{
        // 不允許校正人員使用
        result = [false,false,false,true,true];
      }
      break;
    case 2://技術主管
      result = [false,true,false,true,true];
      break;
    case 3://系統負責人
      result = [true,true,true,true,true];
    break;
  }
  return result;
}
provide("rGroupSetting", rGroupSetting);
</script>

<template>
  <RouterView />
</template>

<style>
@import 'datatables.net-dt';
@import 'datatables.net-bs5';
@import "@fortawesome/fontawesome-free/css/all.min.css";

html, body, #app{
  height: 100%;
}

#app {
  /* font-family: Roboto, Helvetica, Arial, sans-serif; */
  font-family: 'Noto Sans TC','cwTeXYen', Roboto, Helvetica, Arial, sans-serif;
}
.hiddenSpinner {
  display: none;
}
table.dataTable {
  font-size: smaller;
}

/* Tooltip container */
.mytooltip {
  position: relative;
  display: inline-block;
}

/* Tooltip text */
.mytooltip .mytooltiptext {
  visibility: visible;
  width: 120px;
  background-color: #555;
  color: #fff;
  text-align: center;
  padding: 5px 0;
  border-radius: 6px;

  /* Position the tooltip text */
  position: absolute;
  z-index: 10;
  bottom: 125%;
  left: 50%;
  margin-left: -60px;

  /* Fade in tooltip */
  opacity: 1;
  transition: opacity 0.3s;
}

/* Tooltip arrow */
.mytooltip .mytooltiptext::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: #555 transparent transparent transparent;
}

/* Show the tooltip text when you mouse over the tooltip container */
.mytooltip:hover .mytooltiptext {
  visibility: visible;
  opacity: 1;
}
</style>
