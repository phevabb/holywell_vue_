import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api/',
});

export const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";



export const st = () => api.get("students");
export const create_student = (payload) => api.post("students", payload);
export const update_student = (id, payload) => api.put(`students/${id}`, payload);
export const delete_student = (id) => api.delete(`students/${id}`);






export default api;