import http from './request';

export default {
  getMe() {
    return http.get('/api/v1/users/me');
  },
  listPatients() {
    return http.get('/api/v1/users/patients');
  },
};
