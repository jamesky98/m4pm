import { createApp, provide, h } from 'vue'
import apolloClient from './apolloclient'
import { DefaultApolloClient } from "@vue/apollo-composable";
import "mdb-vue-ui-kit/css/mdb.min.css";
import App from './App.vue'
import router from './router'

const app = createApp({
  setup() {
    provide(DefaultApolloClient, apolloClient);
  },

  render: () => h(App),
});

app.use(router);
app.mount('#app');

