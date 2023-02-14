import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("../views/HomeView.vue"),
    },
    {
      path: "/login",
      name: "login",
      component: () => import("../views/LoginUser.vue"),
    },
    {
      path: "/main",
      name: "main",
      component: () => import("../views/main.vue"),
      props: true,
    },
    {
      path: "/signup",
      name: "signup",
      component: () => import("../views/SignUpUser.vue"),
    },
  ],
});

router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title;
  }
  next();
});

export default router
