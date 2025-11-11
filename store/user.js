import { defineStore } from 'pinia'
import { login as loginApi } from '../api/auth'
import { fetchProfile, updateProfile } from '../api/users'

const DEV_LOGIN_CODE_KEY = 'zenbook__dev_login_code'

const resolveDevLoginCode = () => {
  const envCode = (import.meta.env && import.meta.env.VITE_DEV_LOGIN_CODE) || ''
  if (envCode) {
    return envCode
  }
  try {
    const cached = uni.getStorageSync(DEV_LOGIN_CODE_KEY)
    if (cached) {
      return cached
    }
    const generated = `dev-openid-${Date.now()}`
    uni.setStorageSync(DEV_LOGIN_CODE_KEY, generated)
    return generated
  } catch (error) {
    console.warn('Failed to persist dev login code', error)
    return 'dev-openid'
  }
}

const getLoginCode = (options = {}) =>
  new Promise((resolve, reject) => {
    const { allowFallback = true } = options
    if (typeof uni.login !== 'function') {
      if (allowFallback) {
        resolve(resolveDevLoginCode())
        return
      }
      reject(new Error('当前环境不支持微信登录'))
      return
    }
    uni.login({
      provider: 'weixin',
      success: ({ code }) => {
        if (!code) {
          reject(new Error('未获取到微信登录凭证'))
          return
        }
        resolve(code)
      },
      fail: reject
    })
  })

const shouldRetryLogin = (error) => {
  const message = (error?.message ?? '').toLowerCase()
  return message.includes('invalid') && message.includes('code')
}

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
    isCustomerView() {
      return this.viewRole === 'customer'
    },
    isStaffView() {
      return ['admin', 'technician'].includes(this.viewRole)
    },
    hasStaffAccess(state) {
      return ['admin', 'technician'].includes(state.userInfo?.role ?? '')
    }
  },
  actions: {
    async login() {
      if (this.loading) {
        return
      }
      this.loading = true
      try {
        await this.exchangeToken()
        uni.showToast({ title: '登录成功', icon: 'success' })
      } catch (error) {
        if (shouldRetryLogin(error)) {
          try {
            await this.exchangeToken({ allowFallback: false })
            uni.showToast({ title: '登录成功', icon: 'success' })
            return
          } catch (retryError) {
            console.error('Login retry failed', retryError)
          }
        }
        console.error('Login failed', error)
        const hint = error?.message || '登录失败'
        uni.showToast({ title: hint, icon: 'none' })
      } finally {
        this.loading = false
      }
    },
    async autoLogin() {
      if (this.loading) {
        return
      }
      if (this.token) {
        await this.hydrateProfile()
        return
      }
      try {
        await this.exchangeToken()
      } catch (error) {
        console.warn('Silent login failed', error)
      }
    },
    async exchangeToken(options = {}) {
      const code = await getLoginCode(options)
      const data = await loginApi({ code })
      this.token = data.token
      this.userInfo = data.userInfo
      this.impersonateRole = ''
      return data
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
    async updateDisplayName(name) {
      if (!this.isLoggedIn) {
        await this.login()
        if (!this.isLoggedIn) {
          return
        }
      }
      const trimmed = (name ?? '').trim()
      if (!trimmed) {
        uni.showToast({ title: '昵称不能为空', icon: 'none' })
        return
      }
      const profile = await updateProfile({ display_name: trimmed })
      this.userInfo = profile
      uni.showToast({ title: '已更新昵称', icon: 'success' })
    },
    setToken(token) {
      this.token = token
    },
    setUserInfo(userInfo) {
      this.userInfo = userInfo
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
