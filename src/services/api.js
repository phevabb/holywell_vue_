import axios from 'axios';

const api = axios.create({
  

  baseURL: 'http://127.0.0.1:8000/api/',
  
  

  /* */

  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

export const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

// AUTH APIs

export const login = (payload) => api.post("login/", payload);

// fee structure APIs 
export const get_fee_structures = () => api.get("fees/fee-structures"); // APPLIED
export const create_fee_structure = (payload) => api.post("fees/fee-structures/", payload); // APPLIED
export const update_fee_structure = (id, payload) => api.put(`fees/fee-structures/${id}/`, payload);  // APPLIED
export const delete_fee_structure = (id) => api.delete(`fees/fee-structures/${id}/`);  // APPLIED

// PAYMENTS APIs
export const get_payments = () => api.get("fees/payments");  
export const create_payment = (payload) => api.post("fees/payments/", payload);
export const delete_payment = (id) => api.delete(`fees/payments/${id}/`); 

// Student APIs
export const st = () => api.get("student/students");
export const create_student = (payload) => api.post("student/create/", payload);
export const update_student = (id, payload) => api.put(`student/create/${id}/`, payload);
export const delete_student = (id) => api.delete(`student/students/${id}/`);

// student fee records APIs
export const get_student_fee_record = () => api.get("fees/student-fee-records");
export const create_student_fee_record = (payload) => api.post("fees/student-fee-records/", payload);
export const update_student_fee_record = (id, payload) => api.put(`fees/student-fee-records/${id}/`, payload);
export const delete_student_fee_record = (id) => api.delete(`fees/student-fee-records/${id}/`); 

// FAMILY APIs
export const get_families = () => api.get("family-fees/families");
export const create_family = (payload) => api.post("family-fees/families/", payload);  
export const update_family = (id, payload) => api.put(`family-fees/families/${id}/`, payload); 
export const delete_family = (id) => api.delete(`family-fees/families/${id}/`);  

// FAMILY FEES RECS APIs
export const get_family_fee_rec = () => api.get("family-fees/family-fee-records");
export const create_family_fee_rec = (payload) => api.post("family-fees/family-fee-records/", payload); 
export const delete_family_fee_rec = (id) => api.delete(`family-fees/family-fee-records/${id}/`);  

// FAMILY PAYMENTS APIs
export const get_family_payments = () => api.get("family-fees/family-payments");
export const create_family_payment = (payload) => api.post("family-fees/family-payments/", payload);
export const delete_family_payment = (id) => api.delete(`family-fees/family-payments/${id}/`);

// Classes APIs
export const get_classes = () => api.get("student/classes"); 
export const create_class = (payload) => api.post("student/classes/", payload);
export const update_class = (id, payload) => api.put(`student/classes/${id}/`, payload); 
export const delete_class = (id) => api.delete(`student/classes/${id}/`);  

// staff APIs
export const get_staff = () => api.get("staff/staff-profiles");
export const create_staff = (payload) => api.post("staff/staff-profiles/", payload);  
export const update_staff = (id, payload) => api.patch(`staff/staff-profiles/${id}/`, payload);
export const delete_staff = (id) => api.delete(`staff/staff-profiles/${id}/`);

// academic year APIs
export const get_academic_years = () => api.get("student/academic-years");
export const create_academic_year = (payload) => api.post("student/academic-years/", payload);
export const update_academic_year = (id, payload) => api.put(`student/academic-years/${id}/`, payload);
export const delete_academic_year = (id) => api.delete(`student/academic-years/${id}/`);

// term APIs
export const get_terms = () => api.get("student/terms"); 
export const create_term = (payload) => api.post("student/terms/", payload);
export const update_term = (id, payload) => api.put(`student/terms/${id}/`, payload);
export const delete_term = (id) => api.delete(`student/terms/${id}/`);  
























export default api;