
// admin_nav.js
import { cilCreditCard, cilLibrary, cilSchool, cilCalendar, cilAddressBook, cilPeople, cilList, cilSpreadsheet, cilCalculator, cilMoney } from '@coreui/icons'


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
    icon: cilList,
  },
  {
    component: 'CNavItem',
    name: 'Payments',
    to: { name: 'student_fee_payments' },
    icon: cilCreditCard,
  },
  {
    component: 'CNavItem',
    name: 'Student Fee Records',
    to: { name: 'student_fee_records_admin' }, // removed trailing space
    icon: cilSpreadsheet,
  },

  { component: 'CNavTitle', name: 'Family Fees' },

  {
    component: 'CNavItem',
    name: 'Families',
    to: { name: 'families' },
    icon: cilPeople,
  },
  {
    component: 'CNavItem',
    name: 'Family Fee Records',
    to: { name: 'family_fee_records' },
    icon: cilCalculator,
  },
  {
    component: 'CNavItem',
    name: 'Family Payments',
    to: { name: 'family_fee_payments' },
    icon: cilMoney,
  },

  { component: 'CNavTitle', name: 'Staff / Student' },

  {
    component: 'CNavItem',
    name: 'Staff Profiles',
    to: { name: 'staffProfile' },
    icon: cilAddressBook,
  },
  {
    component: 'CNavItem',
    name: 'Student Profiles',
    to: { name: 'studentProfile' },
    icon: 'cil-user',
  },

  { component: 'CNavTitle', name: 'Others' },

  {
    component: 'CNavItem',
    name: 'Academic Years',
    to: { name: 'academicYears' },
    icon: cilCalendar,
  },
  {
    component: 'CNavItem',
    name: 'Classes',
    to: { name: 'classes' },
    icon: cilSchool,
  },
  {
    component: 'CNavItem',
    name: 'Terms',
    to: { name: 'terms' },
    icon: cilLibrary,
  },
 
]
