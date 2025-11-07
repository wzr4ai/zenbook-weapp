import { useUserStore } from '../store/user';

const BASE_URL = process.env.VUE_APP_API_BASE_URL || 'http://localhost:8000';

function request({ url, method = 'GET', data = {}, header = {} }) {
  const userStore = useUserStore();
  const token = userStore.token;
  const finalHeader = {
    'Content-Type': 'application/json',
    ...header,
  };
  if (token) {
    finalHeader.Authorization = `Bearer ${token}`;
  }

  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE_URL + url,
      method,
      data,
      header: finalHeader,
      success: (res) => {
        if (res.statusCode === 401) {
          userStore.logout();
          return;
        }
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          reject(res.data || { message: '请求失败' });
        }
      },
      fail: reject,
    });
  });
}

export default {
  get(url, params = {}) {
    return request({ url, method: 'GET', data: params });
  },
  post(url, data) {
    return request({ url, method: 'POST', data });
  },
  put(url, data) {
    return request({ url, method: 'PUT', data });
  },
  del(url, data) {
    return request({ url, method: 'DELETE', data });
  },
};
