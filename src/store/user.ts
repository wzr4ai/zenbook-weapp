import { defineStore } from "pinia";
import { authApi, UserInfo } from "@/api/auth";

interface UserState {
  token: string;
  userInfo: UserInfo | null;
  loading: boolean;
}

function loginWithWeixin(): Promise<string> {
  return new Promise((resolve, reject) => {
    uni.login({
      provider: "weixin",
      success(res) {
        if (res.code) {
          resolve(res.code);
        } else {
          reject(new Error("登录失败，请重试"));
        }
      },
      fail(err) {
        reject(err);
      },
    });
  });
}

export const useUserStore = defineStore("user", {
  state: (): UserState => ({
    token: "",
    userInfo: null,
    loading: false,
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token),
    isAdmin: (state) => state.userInfo?.role === "admin",
  },
  actions: {
    async login() {
      this.loading = true;
      try {
        const code = await loginWithWeixin();
        const data = await authApi.login({ code });
        this.token = data.token;
        this.userInfo = data.userInfo;
        uni.showToast({ title: "登录成功", icon: "success" });
        return data.userInfo;
      } finally {
        this.loading = false;
      }
    },
    async fetchProfile() {
      if (!this.token) return;
      this.userInfo = await authApi.profile();
    },
    logout() {
      this.token = "";
      this.userInfo = null;
    },
  },
  persist: {
    paths: ["token", "userInfo"],
  },
});
