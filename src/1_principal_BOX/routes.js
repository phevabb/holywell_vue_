
import DefaultLayout from '@/layouts/DefaultLayout.vue'

export const principalRoutes = {
  path: '/app-principal', // separate base to avoid name/path clashes
  component: DefaultLayout,
  meta: { requiresAuth: true, roles: ['principal'] },
  redirect: { name: 'PrincipalDashboard' },
  children: [
    {
      path: 'dashboard',
      name: 'PrincipalDashboard',
      component: () =>
        import('@/1_principal_BOX/views/dashboard/dashboard.vue'),
      meta: { roles: ['principal'] },
    },
    {
      path: 'fees/student-fee-records',
      name: 'student_fee_records_principal',
      component: () =>
        import('@/1_principal_BOX/views/theme/student_fee_records.vue'),
      meta: { roles: ['principal'] },
    },
    // Add more principal routes here...
  ],
}
