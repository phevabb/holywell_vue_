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









export default api;