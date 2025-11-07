import http from './request';

export default {
  create(payload) {
    return http.post('/api/v1/appointments', payload);
  },
  listMine() {
    return http.get('/api/v1/appointments/me');
  },
  cancel(id) {
    return http.post(`/api/v1/appointments/${id}/cancel`);
  },
};
