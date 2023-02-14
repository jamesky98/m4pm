<script setup>
import { ref, provide, inject } from "vue";

const publicPath = ref(import.meta.env.VITE_GRAPHQL_PUBLIC);
provide("publicPath", publicPath);

</script>

<template>
  <RouterView />
</template>

<style scoped>
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
</style>
