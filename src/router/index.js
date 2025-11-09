import { h, resolveComponent } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'

import DefaultLayout from '@/layouts/DefaultLayout'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: DefaultLayout,
    redirect: '/dashboard',
    children: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () =>
          import(
            /* webpackChunkName: "dashboard" */ '@/views/dashboard/Dashboard.vue'
          ),
      },
      {
        path: '/theme',
        name: 'Theme',
        redirect: '/theme/typography',
      },
      {
        path: '/fees/student-fee-structure',
        name: 'student_fee_structure',
        component: () => import('@/views/base/student_fee_structure.vue'), 
      },
      {
        path: '/fees/student-fee-payments',
        name: 'student_fee_payments',   
        component: () => import('@/views/theme/student_fee_payments.vue'),
      },
      {
        path: '/fees/student-fee-records',
        name: 'studenet_fee_records',   
        component: () => import('@/views/theme/student_fee_records.vue'),
      },

      {
        path: '/fees/family',
        name: 'Families',
        component: () => import('@/views/charts/Family.vue'),
      },
      {
        path: '/fees/family-fee-records',
        name: 'Family Fee Records',
        component: () => import('@/views/charts/FamilyRecords.vue'),
      },
      {
        path: '/fees/family-fee-payments',
        name: 'Family Fee Payments',
        component: () => import('@/views/charts/FamilyPayments.vue'),
      },

      {
        path: '/staff',
        name: 'staff profile',
        component: () => import('@/views/charts/StaffProfile.vue'),
      },

      {
        path: '/student',
        name: 'student profile',
        component: () => import('@/views/charts/StudentProfile.vue'),
      },

      {
        path: '/academic-years',
        name: 'academic years',
        component: () => import('@/views/charts/AcademicYear.vue'),
      },

      {
        path: '/classes',
        name: 'Classes',
        component: () => import('@/views/charts/Classes.vue'),
      },
      {
        path: '/terms',
        name: 'Terms',
        component: () => import('@/views/charts/Terms.vue'),
      },

      
      



      


      {
        path: '/widgets',
        name: 'Widgets',
        component: () => import('@/views/widgets/Widgets.vue'),
      },
    ],
  },


  {
    path: '/pages',
    redirect: '/pages/404',
    name: 'Pages',
    component: {
      render() {
        return h(resolveComponent('router-view'))
      },
    },
    children: [
      {
        path: '404',
        name: 'Page404',
        component: () => import('@/views/pages/Page404'),
      },
      {
        path: '500',
        name: 'Page500',
        component: () => import('@/views/pages/Page500'),
      },
      {
        path: 'login',
        name: 'Login',
        component: () => import('@/views/pages/Login'),
      },
      {
        path: 'register',
        name: 'Register',
        component: () => import('@/views/pages/Register'),
      },
    ],
  },
]



const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    // always scroll to top
    return { top: 0 }
  },
})

export default router
