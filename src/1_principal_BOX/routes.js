
import DefaultLayout from '@/layouts/DefaultLayout.vue'

export const principalRoutes = {
  path: '/principal', // separate base to avoid name/path clashes
  component: DefaultLayout,
  meta: { requiresAuth: true, roles: ['principal'] },
  redirect: { name: 'PrincipalDashboard' },
  children: [
    {
      path: 'dashboard',
      name: 'PrincipalDashboard',
      component: () =>
        import('@/1_principal_BOX/views/dashboard/Dashboard.vue'),
      meta: { roles: ['principal'] },
    },
    {
      path: 'principal_change_password',
      name: 'principal_change_password',
      component: () =>
        import('@/registration/PrincipalChangePassword.vue'),
      meta: { roles: ['principal'] },
    },
    {
      path: 'students-per-class',
      name: 'students_per_class',
      component: () =>
        import('@/1_principal_BOX/views/theme/students_per_class.vue'),
      meta: { roles: ['principal'] },
    },
    {
      path: 'fees/analysis/expected-fees',
      name: 'expected_fee',
      component: () =>
        import('@/1_principal_BOX/views/theme/expected_fees.vue'),
      meta: { roles: ['principal'] },
    },
    {
      path: 'fees/analysis/fee-collections',
      name: 'fee_collections',
      component: () =>
        import('@/1_principal_BOX/views/theme/fee_collections.vue'),
      meta: { roles: ['principal'] },
    },
    {
      path: 'fees/debt-percentage-by-class',
      name: 'class_debt',
      component: () =>
        import('@/1_principal_BOX/views/theme/class_debt.vue'),
      meta: { roles: ['principal'] },
    },
    {
      path: 'add-administrator',
      name: 'add_admin',
      component: () =>
        import('@/1_principal_BOX/views/theme/add_admin.vue'),
      meta: { roles: ['principal'] },
    },


    // Add more principal routes here...
  ],
}
