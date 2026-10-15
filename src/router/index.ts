import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { public: true },
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/employee-profile',
    children: [
      {
        path: '/employee-profile',
        name: 'EmployeeProfile',
        component: () => import('@/views/employee-profile/index.vue'),
        meta: {
          title: '员工档案',
          icon: 'icon-user',
        },
      },
      {
        path: '/employee-profile/:id',
        name: 'EmployeeProfileDetail',
        component: () => import('@/views/employee-profile/detail.vue'),
        meta: {
          title: '员工详情',
          hideInMenu: true,
        },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
  },
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

// Navigation Guard
router.beforeEach((to, _from, next) => {
  const userStore = useUserStore()

  if (to.meta.public) {
    next()
    return
  }

  if (!userStore.token) {
    next('/login')
    return
  }

  next()
})

export default router
