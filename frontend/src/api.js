import axios from 'axios';

const api = axios.create({
  baseURL: 'https://quizzverse-cv88.onrender.com',
  withCredentials: true,
});

export default api; 