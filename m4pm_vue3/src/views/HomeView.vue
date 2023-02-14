<script setup>
import {
  MDBSpinner,
} from 'mdb-vue-ui-kit';
import { ref } from "vue";
// 判斷token狀況
import { useQuery, useMutation } from '@vue/apollo-composable';
import UsersGQL from "../graphql/Users";
import { errorHandle, logIn, logOut, toTWDate } from '../methods/User';
import router from '../router';

const { mutate: getchecktoken, onDone: getchecktokenOnDone, onError: getchecktokenError } = useMutation(UsersGQL.CHECKTOKEN);
getchecktokenOnDone(result => {
  if (result.data.checktoken) {
    // console.log("goto main");
    router.push("/main");
  }else{
    logOut();
  }
});
getchecktokenError(e=>{
  // console.log('1-getchecktokenError');
  errorHandle(e,infomsg,alert1);
})
getchecktoken();

const infomsg =ref('');
const alert1 =ref('');

</script>
<template>
  <MDBSpinner size="md" color="primary" />Loading...
</template>