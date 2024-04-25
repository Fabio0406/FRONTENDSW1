import axios from 'axios';

const api = axios.create({
  baseURL: 'backendsw1-production.up.railway.app', // URL del backend
});

export default api;
