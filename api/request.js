import { useUserStore } from '../store/user'

const API_PREFIX = '/api/v1'
const API_BASE = (import.meta.env && import.meta.env.VITE_API_BASE) || ''

const buildUrl = (url) => {
  if (!url) {
    return `${API_BASE}${API_PREFIX}`
  }
  if (url.startsWith('http')) {
    return url
  }
  const needsPrefix = !url.startsWith('/api/')
  return `${API_BASE}${needsPrefix ? API_PREFIX : ''}${url}`
}

export const request = ({ url, method = 'GET', data, header = {} }) => {
  const userStore = useUserStore()
  const finalHeader = {
    'Content-Type': 'application/json',
    ...header
  }

  if (userStore.token) {
    finalHeader.Authorization = `Bearer ${userStore.token}`
  }

  return new Promise((resolve, reject) => {
    uni.request({
      url: buildUrl(url),
      method,
      data,
      header: finalHeader,
      success(res) {
        const { statusCode, data: responseData } = res
        if (statusCode >= 200 && statusCode < 300) {
          resolve(responseData?.data ?? responseData)
          return
        }
        if (statusCode === 401) {
          userStore.logout()
          uni.showToast({ title: '请重新登录', icon: 'none' })
          uni.reLaunch({ url: '/pages/index/index' })
          reject(new Error('UNAUTHORIZED'))
          return
        }
        if (statusCode === 403) {
          uni.showToast({ title: '无权限执行该操作', icon: 'none' })
          reject(new Error('FORBIDDEN'))
          return
        }
        const message = responseData?.message ?? '请求失败'
        uni.showToast({ title: message, icon: 'none' })
        reject(new Error(message))
      },
      fail(error) {
        uni.showToast({ title: '网络异常', icon: 'none' })
        reject(error)
      }
    })
  })
}
