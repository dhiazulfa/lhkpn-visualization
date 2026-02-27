import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import OfficialView from '../views/OfficialView.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: HomeView },
    { path: '/official/:name', component: OfficialView },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

export default router
