
// admin_nav.js
export default [

  {
  component: 'CNavItem',
  name: 'Administrator',
  to: '#',                // no real link
  disabled: true,         // disable click
  icon: null,
  badge: { color: 'primary', text: 'ADMINISTRATOR' },
},


  

  { component: 'CNavTitle', name: 'Student Fees' },

  {
    component: 'CNavItem',
    name: 'Fee Structure',
    to: { name: 'student_fee_structure' },
    icon: 'cil-spreadsheet', // fixed typo
  },
  {
    component: 'CNavItem',
    name: 'Payments',
    to: { name: 'student_fee_payments' },
    icon: 'cil-pencil',
  },
  {
    component: 'CNavItem',
    name: 'Student Fee Records',
    to: { name: 'student_fee_records_admin' }, // removed trailing space
    icon: 'cil-pencil',
  },

  { component: 'CNavTitle', name: 'Family Fees' },

  {
    component: 'CNavItem',
    name: 'Families',
    to: { name: 'families' },
    icon: 'cil-chart-pie',
  },
  {
    component: 'CNavItem',
    name: 'Family Fee Records',
    to: { name: 'family_fee_records' },
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
