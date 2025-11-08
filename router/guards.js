import { useUserStore } from '../store/user'

const adminPages = [
  '/pages_admin/dashboard/index',
  '/pages_admin/appt_create/index',
  '/pages_admin/schedule_mgmt/index',
  '/pages_admin/catalog_mgmt/index',
  '/pages_admin/user_mgmt/index'
]

const interceptors = ['navigateTo', 'redirectTo', 'reLaunch', 'switchTab']

const isAdminPage = (url = '') => {
  const cleanUrl = url.split('?')[0]
  return adminPages.includes(cleanUrl)
}

export const setupNavigationGuards = (pinia) => {
  const userStore = useUserStore(pinia)
  interceptors.forEach((name) => {
    uni.addInterceptor(name, {
      invoke(options) {
        if (!isAdminPage(options.url)) {
          return options
        }
        if (userStore.hasStaffAccess) {
          return options
        }
        uni.showToast({
          icon: 'none',
          title: '需要管理员权限'
        })
        return false
      }
    })
  })
}
