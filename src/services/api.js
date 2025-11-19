import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
});

export const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";


// Student APIs



// export const st = () => api.get("students");
  export const st = () => api.get("student/students");


export const create_student = (payload) => api.post("students", payload);
export const update_student = (id, payload) => api.put(`students/${id}`, payload);
export const delete_student = (id) => api.delete(`students/${id}`);

// Classes APIs

// export const get_classes = () => api.get("classes");
export const get_classes = () => api.get("student/classes"); ////

export const create_class = (payload) => api.post("classes", payload);
export const update_class = (id, payload) => api.put(`classes/${id}`, payload); 
export const delete_class = (id) => api.delete(`classes/${id}`);  

// staff APIs

// export const get_staff = () => api.get("staff");
export const get_staff = () => api.get("staff/staff-profiles");


export const create_staff = (payload) => api.post("staff", payload);  
export const update_staff = (id, payload) => api.put(`staff/${id}`, payload);
export const delete_staff = (id) => api.delete(`staff/${id}`);

// academic year APIs

// export const get_academic_years = () => api.get("academic-year");
export const get_academic_years = () => api.get("student/academic-years");



export const create_academic_year = (payload) => api.post("academic-year", payload);
export const update_academic_year = (id, payload) => api.put(`academic-year/${id}`, payload);
export const delete_academic_year = (id) => api.delete(`academic-year/${id}`);

// term APIs

// export const get_terms = () => api.get("term"); 
export const get_terms = () => api.get("student/terms"); 


export const create_term = (payload) => api.post("term", payload);
export const update_term = (id, payload) => api.put(`term/${id}`, payload);
export const delete_term = (id) => api.delete(`term/${id}`);  


// fee structure APIs 

// export const get_fee_structures = () => api.get("fee-structure");
export const get_fee_structures = () => api.get("fees/fee-structures");



export const create_fee_structure = (payload) => api.post("fee-structure", payload);
export const update_fee_structure = (id, payload) => api.put(`fee-structure/${id}`, payload); 
export const delete_fee_structure = (id) => api.delete(`fee-structure/${id}`);  


// student fee records APIs
// export const get_student_fee_record = () => api.get("student-fee-record");
export const get_student_fee_record = () => api.get("fees/student-fee-records");




export const create_student_fee_record = (payload) => api.post("student-fee-record", payload);
export const update_student_fee_record = (id, payload) => api.put(`student-fee-record/${id}`, payload);
export const delete_student_fee_record = (id) => api.delete(`student-fee-record/${id}`); 





// PAYMENTS APIs

// export const get_payments = () => api.get("payments");  
export const get_payments = () => api.get("fees/payments");  



export const create_payment = (payload) => api.post("payments", payload);
export const delete_payment = (id) => api.delete(`payments/delete/${id}`); 


// FAMILY APIs

// export const get_families = () => api.get("families");
export const get_families = () => api.get("family-fees/families");

export const create_family = (payload) => api.post("families", payload);  
export const update_family = (id, payload) => api.put(`families/${id}`, payload); 
export const delete_family = (id) => api.delete(`families/${id}`);  



// FAMILY FEES RECS APIs
// export const get_family_fee_rec = () => api.get("family-fees");
export const get_family_fee_rec = () => api.get("family-fees/family-fee-records");

export const create_family_fee_rec = (payload) => api.post("family-fees", payload); 
export const delete_family_fee_rec = (id) => api.delete(`family-fees/${id}`);  




// FAMILY PAYMENTS APIs


// export const get_family_payments = () => api.get("family-payments");
export const get_family_payments = () => api.get("family-fees/family-payments");

export const create_family_payment = (payload) => api.post("family-payments", payload);
export const delete_family_payment = (id) => api.delete(`family-payments/${id}`);





















export default api;