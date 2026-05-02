import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

export const fetchWorkItems = () => api.get('/work-items');
export const fetchWorkItem = (id: string) => api.get(`/work-items/${id}`);
export const transitionWorkItem = (id: string) => api.patch(`/work-items/${id}/transition`);
export const submitRCA = (id: string, data: any) => api.post(`/work-items/${id}/rca`, data);
export const ingestSignal = (data: any) => api.post('/signals', data);
