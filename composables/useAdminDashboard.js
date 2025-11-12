import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { listAllAppointments } from '../api/appointments'
import { logger } from '../utils/logger'

const formatLocalDate = (value) => {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const useAdminDashboard = (autoFetch = true) => {
  const appointments = ref([])
  const loading = ref(false)

  const fetchAppointments = async () => {
    loading.value = true
    try {
      appointments.value = await listAllAppointments()
    } catch (error) {
      logger.error('failed to fetch admin appointments', error)
      uni.showToast({ title: '预约列表加载失败', icon: 'none' })
    } finally {
      loading.value = false
    }
  }

  const todayCount = computed(() => {
    const today = formatLocalDate(new Date())
    return appointments.value.filter(
      (item) => item.start_time?.split('T')[0] === today
    ).length
  })

  const pendingCount = computed(
    () => appointments.value.filter((item) => item.status === 'scheduled').length
  )
  const noShowCount = computed(
    () => appointments.value.filter((item) => item.status === 'no_show').length
  )

  if (autoFetch) {
    onShow(fetchAppointments)
  }

  return {
    appointments,
    loading,
    fetchAppointments,
    todayCount,
    pendingCount,
    noShowCount
  }
}
