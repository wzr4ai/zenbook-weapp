import http from './request';

export default {
  getAvailability(params) {
    return http.get('/api/v1/schedule/availability', params);
  },
};
