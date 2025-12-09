
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
    name: 'Debt Percentage by Class',
    to: { name: 'class_debt' },
    icon: 'cil-chart-pie',
  },

  { component: 'CNavTitle', name: 'Add Admin' },

  {
    component: 'CNavItem',
    name: 'Add Administrator',
    to: { name: 'add_admin' },
    icon: 'cil-chart-pie',
  },
  



  
  
  
]
