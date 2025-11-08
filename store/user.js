import { defineStore } from 'pinia'
import { login as loginApi } from '../api/auth'
import { fetchProfile } from '../api/users'

const getLoginCode = () =>
  new Promise((resolve, reject) => {
    if (typeof uni.login !== 'function') {
      resolve(`dev-${Date.now()}`)
      return
    }
    uni.login({
      provider: 'weixin',
      success: ({ code }) => resolve(code || `dev-${Date.now()}`),
      fail: reject
    })
  })

export const useUserStore = defineStore('user', {
  state: () => ({
    token: '',
    userInfo: null,
    loading: false,
    impersonateRole: ''
  }),
  getters: {
    isLoggedIn: (state) => Boolean(state.token),
    actualRole: (state) => state.userInfo?.role ?? '',
    viewRole: (state) => state.impersonateRole || state.userInfo?.role || '',
    isCustomerView: (state, getters) => getters.viewRole === 'customer',
    isStaffView: (state, getters) =>
      ['admin', 'technician'].includes(getters.viewRole),
    hasStaffAccess: (state) =>
      ['admin', 'technician'].includes(state.userInfo?.role ?? '')
  },
  actions: {
    async login() {
      if (this.loading) {
        return
      }
      this.loading = true
      try {
        const code = await getLoginCode()
        const data = await loginApi({ code })
        this.token = data.token
        this.userInfo = data.userInfo
        this.impersonateRole = ''
        uni.showToast({ title: '登录成功', icon: 'success' })
      } catch (error) {
        console.error('Login failed', error)
        uni.showToast({ title: '登录失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    },
    async hydrateProfile() {
      if (!this.token) {
        return
      }
      try {
        const profile = await fetchProfile()
        this.userInfo = profile
        this.impersonateRole = ''
      } catch (error) {
        console.warn('Failed to hydrate profile', error)
      }
    },
    setToken(token) {
      this.token = token
    },
    setUserInfo(userInfo) {
      this.userInfo = userInfo
    },
    logout() {
      this.$reset()
      try {
        uni.removeStorageSync('zenbook__user')
      } catch (error) {
        console.warn('Failed to clean storage', error)
      }
    },
    setImpersonateRole(role) {
      if (this.userInfo?.role !== 'admin') {
        return
      }
      this.impersonateRole = role
    },
    resetImpersonation() {
      this.impersonateRole = ''
    }
  }
})
