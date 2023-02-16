<script setup>
import Footer1 from "../components/Footer.vue";
import Navbar1 from "../components/Navbar.vue";
import { ref, reactive, onMounted, provide,inject } from "vue";
import path, { join } from "path-browserify";
import {
  MDBInput,
  MDBCol,
  MDBRow,
  MDBContainer,
  MDBSelect,
  MDBBtn,
  MDBAlert,
  MDBSwitch,
} from 'mdb-vue-ui-kit';
import DataTable from 'datatables.net-vue3';
import DataTableBs5 from 'datatables.net-bs5';
import Select from 'datatables.net-select';
import { computed } from "@vue/reactivity";

// 判斷token狀況
import { useQuery, useMutation } from '@vue/apollo-composable';
import UsersGQL from "../graphql/Users";
import { errorHandle, logIn, logOut, toTWDate } from '../methods/User';

const { mutate: getchecktoken } = useMutation(UsersGQL.CHECKTOKEN);

DataTable.use(DataTableBs5);
DataTable.use(Select);
//#region 取得權限==========Start
// const myUserId = ref("");
const myUserName = ref("");
// const myUserName2 = ref("");
// const myUserEmail = ref("");
// const myUserActive = ref(false);
const myUserRole = ref("");

const { onResult: getNowUser, refetch: refgetNowUser} = useQuery(UsersGQL.GETNOWUSER);
getNowUser(result=>{
  if (!result.loading && result && result.data.getNowUser) {
    let getData = result.data.getNowUser;
    // myUserId.value = getData.user_id;
    myUserName.value = getData.user_name;
    // myUserName2.value = getData.user_name2;
    // myUserEmail.value = getData.user_mail;
    // myUserActive.value = (getData.active===1)?true:false;
    myUserRole.value = getData.role;    
  }
});
refgetNowUser();

const rGroupSetting = inject("rGroupSetting");
const rGroup =computed(()=>{
  let opt1=false;
  if (parseInt(myUserName.value) === parseInt(nowUserName.value)){
    opt1=true;
  }
  return rGroupSetting(myUserRole.value,opt1)
});

//#endregion 取得權限==========End

//#region 參數==========Start
// 引入案件編號
const props = defineProps({
  userName: String,
});

// Information
const NavItem = ref("users");
provide("NavItem", NavItem);
const infomsg = ref("");
const alert1 = ref(false);
const alertColor = ref("primary");
const updateKey = ref(0);

const nowUserId = ref("");
const nowUserName = ref("");
const nowUserName2 = ref("");
const nowUserEmail = ref("");
const nowUserActive = ref(false);
const selectUserRole = ref("");
const nowUserRoleMU = ref([
  {text:"",value:""},
  {text:"訪客",value:0},
  {text:"技術人員",value:1},
  {text:"技術主管",value:2},
  {text:"系統負責人",value:3},
]);
const nowUserRoleDOM = ref();

const oldPassWord = ref("");
const newPassWord = ref("");
const chkPassWord = ref("");

// 人員表格
let dt1;
const table1 = ref(); 
const data1 = ref([]);
const columns1 = [
  {title:"序號", data:"user_id",width:"2rem"},
  {title:"啟用", data:"active",width:"1rem",className: 'dt-center',render: (data,type,row) => {
    if(data===1){
      return '<i class="fas fa-lg fa-check-circle text-success"></i>'
    }else{
      return '<i class="fas fa-lg fa-times-circle text-danger"></i>'
    }
  }},
  {title:"員工編號", data:"user_name", className: 'dt-center',width:"6rem"},
  {title:"姓名", data:"user_name2",width:"6rem"},
  {title:"E-mail", data:"user_mail"},
  {title:"權限", data:"role",render: (data,type,row) => {
    switch(data){
      case 0:
        return "訪客";
      case 1:
        return "技術人員";
      case 2:
        return "技術主管";
      case 3:
        return "系統負責人";
    }
  }},
  {title:"更新日期", data:"user_updated_time"},
];
const tboption1 = {
  dom: 'fti',
  select: {style: 'single',info: false},
  order: [[0, 'asc']],
  scrollY: '63vh',
  scrollX: true,
  lengthChange: false,
  searching: true,
  paging: false,
  responsive: true,
};
//#endregion 參數==========End

// 查詢AllUser
const { onDone: getAllUseronDone, mutate: refgetAllUser, onError: getAllUseronError } = useMutation(UsersGQL.GETALLUSERs);
getAllUseronDone(result=>{
  if (!result.loading && result && result.data.allusers) {
    data1.value = result.data.allusers;
    dt1.columns.adjust();
  }
});
getAllUseronError(e=>{errorHandle(e,infomsg,alert1)});

// 查詢User
const { onDone: getUserbyNameonDone, mutate: refgetUserbyName, onError: getUserbyNameonError } = useMutation(
  UsersGQL.GETUSERBYNAME, 
  () => ({
    variables: {
      userName: props.userName,
    }
}));
getUserbyNameonDone(result=>{
  if (!result.loading && result && result.data.getUserByName) {
    let getData = result.data.getUserByName;
    nowUserId.value = getData.user_id;
    nowUserName.value = getData.user_name;
    nowUserName2.value = getData.user_name2;
    nowUserEmail.value = getData.user_mail;
    nowUserActive.value = (getData.active===1)?true:false;
    selectUserRole.value = getData.role;
    nowUserRoleDOM.value.setValue(getData.role);
  }
});
getUserbyNameonError(e=>{errorHandle(e,infomsg,alert1)});

// 儲存使用者
const { mutate: saveUser, onDone: saveUserOnDone, onError: saveUserError } = useMutation(
  UsersGQL.UPDATEUSER,
  () => ({
    variables: {
      userId: parseInt(nowUserId.value),
      userName2: nowUserName2.value,
      userMail: nowUserEmail.value,
      active: (nowUserActive.value)?1:0,
      role:selectUserRole.value,
    }
  })
);
saveUserOnDone(result=>{
  refgetAllUser();
});
saveUserError(e=>{errorHandle(e,infomsg,alert1)});

// 變更密碼
function changePassWord(enforce){
  if(enforce){
    changePass({enforce: true});
  }else{
    changePass({enforce: false});
  }
}

const { mutate: changePass, onDone: changePassOnDone, onError: changePassError } = useMutation(
  UsersGQL.CHANGEPASSWORD,
  () => ({
    variables: {
      userId: parseInt(nowUserId.value),
      oldpass: oldPassWord.value,
      newpass: newPassWord.value,
      chkpass: chkPassWord.value,
    }
  })
);
changePassOnDone(result=>{
  oldPassWord.value = "";
  newPassWord.value = "";
  chkPassWord.value = "";
  infomsg.value = result.data.changePASSWord;
});
changePassError(e=>{errorHandle(e,infomsg,alert1)});

// 刪除使用者
const { mutate: delUser, onDone: delUserOnDone, onError: delUserError } = useMutation(
  UsersGQL.DELUSER,
  () => ({
    variables: {
      userId: parseInt(nowUserId.value),
    }
  })
);
delUserOnDone(result=>{
  infomsg.value = "刪除使用者 " + nowUserId.value;
  refgetAllUser();
});
delUserError(e=>{errorHandle(e,infomsg,alert1)});

// 確認登入狀況
getchecktoken().then(res=>{
  refgetAllUser();
  refgetUserbyName();

  return 
}).catch(e=>{
  errorHandle(e,infomsg,alert1);
});

// 加載表格選取事件
onMounted(function () {
  dt1 = table1.value.dt();
  dt1.on('select', function (e, dt, type, indexes) {
    nowUserId.value = dt.rows(indexes).data()[0].user_id;
    nowUserName.value = dt.rows(indexes).data()[0].user_name;
    nowUserName2.value = dt.rows(indexes).data()[0].user_name2;
    nowUserEmail.value = dt.rows(indexes).data()[0].user_mail;
    nowUserActive.value = (dt.rows(indexes).data()[0].active===1)?true:false;
    selectUserRole.value = dt.rows(indexes).data()[0].role;
    nowUserRoleDOM.value.setValue(dt.rows(indexes).data()[0].role);
  });
});
</script>
<template>
  <MDBAlert dismiss v-model="alert1" id="alert-primary" :color="alertColor" position="top-right" stacking width="535px"
    autohide :delay="2000.0">
    {{ infomsg }}
  </MDBAlert>
  <MDBContainer fluid class="h-100 overflow-hidden">
    <MDBRow class="h-100 flex-column flex-nowrap">
      <!-- 導覽列 -->
      <Navbar1 />
      <div style="height: calc(100% - 6.5em);">
        <MDBRow style="margin-left:0;margin-right:0;" class="h-100 justify-content-between flex-md-nowrap overflow-visible">
          <!-- 左 -->
          <MDBCol md="4" class="h-100 ps-0 pe-1">
            <MDBRow style="margin-left:0;margin-right:0;height: calc(100% - 1em);" class="px-2 my-2 align-content-start overflow-auto border border-5 rounded-8 shadow-4">
              <!-- 使用者內容 -->
              <MDBCol col="8" class="my-3">
                序號：{{nowUserId}}
              </MDBCol>
              <MDBCol col="12" class="rounded-top-5 bg-info text-white">
                基本資訊
              </MDBCol>
              <MDBCol col="12" class="mb-3 border border-1 rounded-bottom-5">
                <MDBRow>
                  <MDBCol col="12" class="my-3">
                    <MDBSwitch label="啟用狀態" v-model="nowUserActive"/>
                  </MDBCol>
                  <MDBCol col="12" class="mb-3">
                    <MDBInput readonly size="sm" type="number" label="員工編號" v-model="nowUserName"/>
                  </MDBCol>
                  <MDBCol col="12" class="mb-3">
                    <MDBInput :readonly="!rGroup[4]" size="sm" type="text" label="姓名" v-model="nowUserName2"/>
                  </MDBCol>
                  <MDBCol col="12" class="mb-3">
                    <MDBInput :readonly="!rGroup[4]" size="sm" type="email" label="E-mail" v-model="nowUserEmail"/>
                  </MDBCol>
                  <MDBSelect :disabled="!rGroup[1]" size="sm" class="mb-3 col-12" label="權限" v-model:options="nowUserRoleMU"
                    v-model:selected="selectUserRole" ref="nowUserRoleDOM"/>
                  <MDBCol col="12" class="mb-3">
                    <MDBBtn size="sm" color="primary" @click="saveUser">
                      儲存
                    </MDBBtn>
                    <MDBBtn v-if="rGroup[0]" size="sm" color="primary" @click="delUser">
                      刪除
                    </MDBBtn>
                  </MDBCol>
                </MDBRow>
              </MDBCol>
              <MDBCol col="12" class="rounded-top-5 bg-info text-white">
                變更密碼
              </MDBCol>
              <MDBCol col="12" class="mb-3 border border-1 rounded-bottom-5">
                <MDBRow>
                  <MDBCol v-if="!rGroup[0]" col="12" class="mt-3">
                    <MDBInput size="sm" type="password" label="舊密碼" v-model="oldPassWord"/>
                  </MDBCol>
                  <MDBCol col="12" class="mt-3">
                    <MDBInput size="sm" type="password" label="變更密碼" v-model="newPassWord"/>
                  </MDBCol>
                  <MDBCol col="12" class="mt-3">
                    <MDBInput size="sm" type="password" label="再次確認密碼" v-model="chkPassWord"/>
                  </MDBCol>
                  <MDBCol col="12" class="my-3">
                    <MDBBtn v-if="!rGroup[0]" size="sm" color="primary" @click="changePassWord(false)">
                      變更密碼
                    </MDBBtn>
                    <MDBBtn v-if="rGroup[0]" size="sm" color="primary" @click="changePassWord(true)">
                      逕行變更
                    </MDBBtn>
                  </MDBCol>
                </MDBRow>
              </MDBCol>
            </MDBRow>
          </MDBCol>
          <!-- 右 -->
          <MDBCol md="8" class="h-100 ps-1 pe-0">
            <MDBRow style="margin-left:0;margin-right:0;height: calc(100% - 1em);" class="px-2 my-2 align-content-start overflow-auto border border-5 rounded-8 shadow-4">
              <!-- 進階管理內容 -->
              <MDBCol col="12" class="mt-3 rounded-top-5 bg-info text-white">
                進階管理
              </MDBCol>
              <MDBCol col="12" class="mb-3 border border-1 rounded-bottom-5">
                <MDBRow>
                  <MDBCol v-show="rGroup[0]" md="12" class="my-3">
                    <DataTable :data="data1" :columns="columns1" :options="tboption1" ref="table1"
                      class="display w-100 compact" />
                  </MDBCol>
                </MDBRow>
              </MDBCol>
            </MDBRow>
          </MDBCol>
        </MDBRow>
      </div>
      <!-- 頁腳 -->
      <Footer1 :msg="infomsg" />
    </MDBRow>
  </MDBContainer>
</template>
<style>
.datatable tbody tr:last-child {
  border-bottom: rgba(0,0,0,0);
  height: auto;
}
.rounded-top-5 {
  border-top-right-radius: 0.5rem !important;
  border-top-left-radius: 0.5rem !important;
}

.rounded-top-7 {
  border-top-right-radius: 1rem !important;
  border-top-left-radius: 1rem !important;
}

.rounded-bottom-5 {
  border-bottom-right-radius: 0.5rem !important;
  border-bottom-left-radius: 0.5rem !important;
}

.rounded-bottom-7 {
  border-bottom-right-radius: 1rem !important;
  border-bottom-left-radius: 1rem !important;
}

.addParamBtn{
  width: 100%;
  line-height: 0.5;
}
</style>