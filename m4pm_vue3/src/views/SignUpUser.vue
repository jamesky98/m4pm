<script setup>
import slogan from "../components/Slogan.vue";
import { useQuery, useLazyQuery, useMutation } from '@vue/apollo-composable'
import UsersGQL from "../graphql/Users";
import { ref } from 'vue';
import router from '../router'
import { MDBCard, 
  MDBCardBody, 
  MDBInput, 
  MDBCol, 
  MDBRow, 
  MDBContainer, 
  MDBBtn } from 'mdb-vue-ui-kit';

// 傳遞參數
const user_name = ref('');
const user_password = ref('');
const user_mail = ref('');
const user_name2 = ref('');

// 防止帳號重複建立
function doSignkup(){
  chkUser();
}

const { mutate: chkUser, onDone: chkUserOnDone } = useMutation(
  UsersGQL.CHKUSERBYNAME,
  () => (
    {
      variables: {
        userName: user_name.value,
      }
    }),
);
chkUserOnDone(result=>{
  if (!result.loading){
    console.log(result.data.chkUserByName);
    if (result.data.chkUserByName){
      // 帳號重複
      console.log("帳號重複");
    }else{
      // 建立帳號
      console.log("建立");
      usersignup();
    }
  }
});

//執行查詢
const { mutate: usersignup, onDone: signupOnDone, onError: usersignuponError } = useMutation(
  UsersGQL.SIGNUPMU,
  () => (
    {
      variables: {
        userName: user_name.value,
        userPassword: user_password.value,
        userMail: user_mail.value,
        userName2: user_name2.value,
      }
    }),
);
signupOnDone(result => {
  router.push("/");
})

</script>

<template>
  <section class="h-100 gradient-form" style="background-color: #eee;">
    <MDBContainer class="py-5 h-100">
      <MDBRow class="d-flex justify-content-center align-items-center h-100">
        <MDBCol xl="10">
          <MDBCard class="rounded-3 text-black">
            <MDBRow class="g-0">
              <MDBCol lg="6">
                <MDBCardBody class="p-md-5 mx-md-4">
                  <div class="text-center">
                    <img src="/LOGO01.png" style="width: 185px;" alt="logo">
                    <h4 class="mt-1 mb-5 pb-1">案件管理系統</h4>
                  </div>
                  <form @submit.prevent="doSignkup">
                    <p>註冊新帳號</p>
                    <div class="form-outline mb-4">
                      <MDBInput required type="text" label="員工編號" id="form2Example11" v-model="user_name"
                        wrapperClass="mb-4" />
                    </div>
                    <div class="form-outline mb-4">
                      <MDBInput required type="text" label="姓名" id="form2Example44" v-model="user_name2"
                        wrapperClass="mb-4" />
                    </div>
                    <div class="form-outline mb-4">
                      <MDBInput required type="password" label="密碼" id="form2Example22" v-model="user_password"
                        wrapperClass="mb-4" />
                    </div>
                    <div class="form-outline mb-4">
                      <MDBInput required type="email" label="電子郵件" id="form2Example33" v-model="user_mail"
                        wrapperClass="mb-4" />
                    </div>
                    <div class="text-center pt-1 mb-5 pb-1">
                      <MDBBtn color="primary" block class="fs-6 gradient-custom-2 col-12" type="submit">註冊
                      </MDBBtn>
                    </div>

                    <div class="d-flex align-items-center justify-content-center pb-4">
                      <MDBBtn outline="primary" @click="router.push('/login')">返回登入</MDBBtn>
                    </div>

                  </form>
                </MDBCardBody>
              </MDBCol>

              <MDBCol lg="6" class="d-flex align-items-center gradient-custom-2">
                <slogan></slogan>
              </MDBCol>

            </MDBRow>
          </MDBCard>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  </section>
</template>
<style>
adient-custom-2 {
  /* fallback for old browsers */
  background: #fccb90;

  /* Chrome 10-25, Safari 5.1-6 */
  background: -webkit-linear-gradient(to right, #0078AA, #3AB4F2,#F2DF3A);

  /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
  background: linear-gradient(to right, #79DAE8,
    #0AA1DD,
    #2155CD);
}

@media (min-width: 768px) {
  .gradient-form {
    height: 100vh !important;
  }
}

@media (min-width: 769px) {
  .gradient-custom-2 {
    border-top-right-radius: .3rem;
    border-bottom-right-radius: .3rem;
  }
}
</style>

