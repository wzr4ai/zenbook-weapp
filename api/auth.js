import http from './request';

export default {
  login(payload) {
    return http.post('/api/v1/auth/login', payload);
  },
};
