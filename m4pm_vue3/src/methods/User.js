import router from "../router";

function errorHandle(e,infomsg,alert1){
  console.log('errorHandle',e.message);
  switch (e.message) {
    case "No such user found":
      infomsg.value = "查無此帳號";
      alert1.value = true;
      break;
    case "Invalid password":
      infomsg.value = "密碼錯誤";
      alert1.value = true;
      break;
    case "Not active":
      infomsg.value = "帳號尚未啟用";
      alert1.value = true;
      break;
    case "No token found":
        infomsg.value = "未登入";
        alert1.value = true;
        logOut();
        break;
    case "Foreign key constraint failed":
      infomsg.value = "本資料不可變更，因含有其他連結資料，請刪除連結資料後再試";
      alert1.value = true;
      break;
    case "Token expired":
      infomsg.value = "授權過期";
      logOut();
      break;
  }
}

function logOut() {
  console.log("logOut")
  localStorage.removeItem("AUTH_TOKEN");
  localStorage.removeItem("USER_ID");
  localStorage.removeItem("USER_NAME");
  localStorage.removeItem("USER_NAME2");
  localStorage.removeItem("USER_ROLE");
  localStorage.removeItem("USER_AC");
  router.push("/login");
}

function logIn(result) {
  let getData = result.data.login;
  if (getData.user.active === 1) {
    localStorage.setItem("AUTH_TOKEN", result.data.login.token);
    localStorage.setItem("USER_ID", result.data.login.user.user_id);
    localStorage.setItem("USER_NAME", result.data.login.user.user_name);
    localStorage.setItem("USER_NAME2", result.data.login.user.user_name2);
    localStorage.setItem("USER_ROLE", result.data.login.user.role);
    localStorage.setItem("USER_AC", result.data.login.user.active);
    // console.log("localStorage In")
    router.push("/main");
  } else {
    logOut();
  }
}

function toTWDate(data) {
  let ttdate = "";
  if (data) {
    ttdate = data.split("T")[0];
    let dateObj = new Date(ttdate);
    let year = dateObj.getFullYear() - 1911;
    let month =
      dateObj.getMonth() + 1 < 10
        ? "0" + (dateObj.getMonth() + 1)
        : dateObj.getMonth() + 1;
    let date =
      dateObj.getDate() < 10 ? "0" + dateObj.getDate() : dateObj.getDate();
    // console.log(dateObj.getMonth());
    ttdate = year + "/" + month + "/" + date;
  }
  return ttdate;
}

export { errorHandle, logIn, logOut, toTWDate };
