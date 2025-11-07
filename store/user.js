import { defineStore } from 'pinia';
import authApi from '../api/auth';

export const useUserStore = defineStore('user', {
  state: () => ({
    token: '',
    userInfo: null,
  }),
  getters: {
    role(state) {
      return state.userInfo?.role || '';
    },
    isAdmin(state) {
      return ['admin', 'technician'].includes(state.userInfo?.role);
    },
  },
  actions: {
    async login() {
      const { code } = await uni.login();
      const data = await authApi.login({ code });
      this.token = data.token;
      this.userInfo = data.userInfo;
    },
    logout() {
      this.$reset();
      uni.reLaunch({ url: '/pages/index/index' });
    },
  },
  persist: {
    storage: {
      getItem: uni.getStorageSync,
      setItem: uni.setStorageSync,
    },
  },
});
