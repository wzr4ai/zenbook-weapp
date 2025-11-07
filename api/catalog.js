import http from './request';

export default {
  getLocations() {
    return http.get('/api/v1/catalog/locations');
  },
  getTechnicians() {
    return http.get('/api/v1/catalog/technicians');
  },
  getServices() {
    return http.get('/api/v1/catalog/services');
  },
  getOfferings() {
    return http.get('/api/v1/catalog/offerings');
  },
};
