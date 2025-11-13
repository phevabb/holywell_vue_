import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api/',
});

export const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";


// Student APIs

export const st = () => api.get("students");
export const create_student = (payload) => api.post("students", payload);
export const update_student = (id, payload) => api.put(`students/${id}`, payload);
export const delete_student = (id) => api.delete(`students/${id}`);

// Classes APIs

export const get_classes = () => api.get("classes");
export const create_class = (payload) => api.post("classes", payload);
export const update_class = (id, payload) => api.put(`classes/${id}`, payload); 
export const delete_class = (id) => api.delete(`classes/${id}`);  

// staff APIs

export const get_staff = () => api.get("staff");
export const create_staff = (payload) => api.post("staff", payload);  
export const update_staff = (id, payload) => api.put(`staff/${id}`, payload);
export const delete_staff = (id) => api.delete(`staff/${id}`);

// academic year APIs

export const get_academic_years = () => api.get("academic-year");
export const create_academic_year = (payload) => api.post("academic-year", payload);
export const update_academic_year = (id, payload) => api.put(`academic-year/${id}`, payload);
export const delete_academic_year = (id) => api.delete(`academic-year/${id}`);

// term APIs

export const get_terms = () => api.get("term"); 
export const create_term = (payload) => api.post("term", payload);
export const update_term = (id, payload) => api.put(`term/${id}`, payload);
export const delete_term = (id) => api.delete(`term/${id}`);  


// fee structure APIs 

export const get_fee_structures = () => api.get("fee-structure");
export const create_fee_structure = (payload) => api.post("fee-structure", payload);
export const update_fee_structure = (id, payload) => api.put(`fee-structure/${id}`, payload); 
export const delete_fee_structure = (id) => api.delete(`fee-structure/${id}`);  


// student fee records APIs
export const get_student_fee_record = () => api.get("student-fee-record");
export const create_student_fee_record = (payload) => api.post("student-fee-record", payload);
export const update_student_fee_record = (id, payload) => api.put(`student-fee-record/${id}`, payload);
export const delete_student_fee_record = (id) => api.delete(`student-fee-record/${id}`); 



















export default api;