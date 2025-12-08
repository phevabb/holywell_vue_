
// principal.js
export default [
  {
    component: 'CNavItem',
    name: 'Dashboard',
    to: { name: 'PrincipalDashboard' }, // name-based
    icon: 'cil-speedometer',
    badge: { color: 'primary', text: ' PRINCIPAL' },
  },

  { component: 'CNavTitle', name: ' Demographics' },


  
  {
    component: 'CNavItem',
    name: 'Pupils per Class',
    to: { name: 'students_per_class' }, // removed trailing space
    icon: 'cil-pencil',
  },

  { component: 'CNavTitle', name: 'Fee Analysis' },

  {
    component: 'CNavItem',
    name: 'Expected Fees',
    to: { name: 'expected_fee' },
    icon: 'cil-chart-pie',
  },
  {
    component: 'CNavItem',
    name: 'Fee Collections',
    to: { name: 'fee_collections' },
    icon: 'cil-chart-pie',
  },
  {
    component: 'CNavItem',
    name: 'Family Payments',
    to: { name: 'family_fee_payments' },
    icon: 'cil-chart-pie',
  },

  { component: 'CNavTitle', name: 'Staff / Student' },

  {
    component: 'CNavItem',
    name: 'Staff Profiles',
    to: { name: 'staffProfile' },
    icon: 'cil-chart-pie',
  },
  {
    component: 'CNavItem',
    name: 'Student Profiles',
    to: { name: 'studentProfile' },
    icon: 'cil-chart-pie',
  },

  { component: 'CNavTitle', name: 'Others' },

  {
    component: 'CNavItem',
    name: 'Academic Years',
    to: { name: 'academicYears' },
    icon: 'cil-chart-pie',
  },
  {
    component: 'CNavItem',
    name: 'Classes',
    to: { name: 'classes' },
    icon: 'cil-chart-pie',
  },
  {
    component: 'CNavItem',
    name: 'Terms',
    to: { name: 'terms' },
    icon: 'cil-chart-pie',
  },
]
