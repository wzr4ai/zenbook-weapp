
<template>
  <view class="page" v-if="userStore.isStaffView">
    <view class="hero hero--staff">
      <view>
        <text class="hero__subtitle">管理视角</text>
        <text class="hero__title">
          {{ userStore.userInfo?.display_name || '管理员' }}
        </text>
        <text class="hero__hint">预约一览 · 快速操作</text>
      </view>
    </view>
    <view class="admin-panel">
      <AdminDashboardPanel
        :appointments="appointments"
        :today-count="todayCount"
        :pending-count="pendingCount"
        :no-show-count="noShowCount"
        @create="goApptCreate"
        @schedule="goSchedule"
        @catalog="goCatalog"
        @users="goUsers"
        @edit="editAppointment"
      />
    </view>
  </view>
  <view class="page" v-else>
    <view class="hero">
      <view>
        <text class="hero__subtitle">中医推拿 · 线上预约</text>
        <text class="hero__title">ZenBook 养生馆</text>
        <text class="hero__hint">三步完成预约，技师日程实时同步</text>
      </view>
    </view>

    <view class="card">
      <text class="card__title">① 选择地点</text>
      <picker mode="selector" :range="locations" range-key="name" @change="onLocationChange">
        <view class="picker-value">
          {{ bookingStore.selectedLocation?.name ?? '请选择' }}
        </view>
      </picker>
    </view>

    <view class="card">
      <text class="card__title">② 选择技师</text>
      <picker mode="selector" :range="technicians" range-key="display_name" @change="onTechnicianChange">
        <view class="picker-value">
          {{ bookingStore.selectedTechnician?.display_name ?? '请选择' }}
        </view>
      </picker>
    </view>

    <view class="card">
      <text class="card__title">③ 选择服务</text>
      <picker mode="selector" :range="services" range-key="name" @change="onServiceChange">
        <view class="picker-value">
          {{ bookingStore.selectedService?.name ?? '请选择' }}
        </view>
      </picker>
    </view>

    <view class="card card--summary" v-if="selectedOffering">
      <text>{{ selectedOffering.service_name }} · {{ selectedOffering.duration }}min</text>
      <text class="card__price">¥{{ selectedOffering.price }}</text>
    </view>

    <button
      class="primary-btn"
      type="primary"
      :disabled="!canProceed || loading"
      @tap="goBooking"
    >
      {{ loading ? '加载中...' : '查看可预约时间' }}
    </button>

    <view class="links">
      <button size="mini" @tap="goAppointments">我的预约</button>
      <button size="mini" @tap="goPatients">就诊人管理</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import {
  fetchLocations,
  fetchTechnicians,
  fetchServices
} from '../../api/catalog'
import { useBookingStore } from '../../store/booking'
import { useUserStore } from '../../store/user'
import AdminDashboardPanel from '../../components/AdminDashboardPanel.vue'
import { useAdminDashboard } from '../../composables/useAdminDashboard'

type PickerChangeEvent = { detail: { value: number } }

const bookingStore = useBookingStore()
const userStore = useUserStore()

const loading = ref(false)
const catalogLoaded = ref(false)
const locations = ref<any[]>([])
const technicians = ref<any[]>([])
const services = ref<any[]>([])
const selectedOffering = computed(() => bookingStore.offerings[0] ?? null)
const isStaffView = computed(() => userStore.isStaffView)

const {
  appointments,
  todayCount,
  pendingCount,
  noShowCount,
  fetchAppointments
} = useAdminDashboard(false)

const canProceed = computed(() => {
  return (
    Boolean(bookingStore.selectedLocation) &&
    Boolean(bookingStore.selectedTechnician) &&
    Boolean(bookingStore.selectedService)
  )
})

const ensureSelectionsValid = () => {
  if (
    bookingStore.selectedLocation &&
    !locations.value.some((item) => item.id === bookingStore.selectedLocation?.id)
  ) {
    bookingStore.setLocation(null)
  }
  if (
    bookingStore.selectedService &&
    !services.value.some((item) => item.id === bookingStore.selectedService?.id)
  ) {
    bookingStore.setService(null)
  }
}

const findPreferredLocation = () => {
  const preferredId = userStore.userInfo?.default_location_id
  if (!preferredId) return null
  return locations.value.find((item) => item.id === preferredId) ?? null
}

const findTopWeightedService = () => {
  if (!services.value.length) {
    return null
  }
  const sorted = [...services.value].sort((a, b) => {
    const weightDiff = Number(b.weight ?? 0) - Number(a.weight ?? 0)
    if (weightDiff !== 0) {
      return weightDiff
    }
    return (a.name || '').localeCompare(b.name || '')
  })
  return sorted[0] ?? null
}

const applyCustomerDefaults = () => {
  if (isStaffView.value) {
    return
  }
  ensureSelectionsValid()
  if (!bookingStore.selectedLocation) {
    const preferred = findPreferredLocation()
    if (preferred) {
      bookingStore.setLocation(preferred)
    }
  }
  if (!bookingStore.selectedService) {
    const weighted = findTopWeightedService()
    if (weighted) {
      bookingStore.setService(weighted)
    }
  }
}

const goAppointments = () => {
  uni.navigateTo({ url: '/pages_sub/appointments/index' })
}

const goPatients = () => {
  uni.navigateTo({ url: '/pages_sub/patients/index' })
}

const goApptCreate = (date?: string) => {
  const query = date ? `?date=${date}` : ''
  uni.navigateTo({ url: `/pages_admin/appt_create/index${query}` })
}
const goSchedule = () => {
  uni.navigateTo({ url: '/pages_admin/schedule_mgmt/index' })
}
const goCatalog = () => {
  uni.navigateTo({ url: '/pages_admin/catalog_mgmt/index' })
}
const goUsers = () => {
  uni.navigateTo({ url: '/pages_admin/user_mgmt/index' })
}
const editAppointment = (id: string) => {
  uni.navigateTo({ url: `/pages_admin/appt_create/index?id=${id}` })
}

const goBooking = async () => {
  if (!canProceed.value) {
    uni.showToast({ title: '请先完成选择', icon: 'none' })
    return
  }
  await loadOfferings()
  uni.navigateTo({ url: '/pages/booking/index' })
}

const onLocationChange = (event: PickerChangeEvent) => {
  const item = locations.value?.[Number(event.detail.value)]
  bookingStore.setLocation(item)
  loadOfferings()
}

const onTechnicianChange = (event: PickerChangeEvent) => {
  const item = technicians.value?.[Number(event.detail.value)]
  bookingStore.setTechnician(item)
  loadOfferings()
}

const onServiceChange = (event: PickerChangeEvent) => {
  const item = services.value?.[Number(event.detail.value)]
  bookingStore.setService(item)
  loadOfferings()
}

const loadOfferings = async () => {
  if (!canProceed.value) {
    return
  }
  loading.value = true
  try {
    await bookingStore.loadOfferings({
      location_id: bookingStore.selectedLocation?.id,
      technician_id: bookingStore.selectedTechnician?.id,
      service_id: bookingStore.selectedService?.id
    })
  } finally {
    loading.value = false
  }
}

const loadCatalog = async () => {
  if (catalogLoaded.value) {
    return
  }
  loading.value = true
  try {
    const [loc, tech, svc] = await Promise.all([
      fetchLocations(),
      fetchTechnicians(),
      fetchServices()
    ])
    locations.value = loc
    technicians.value = tech
    services.value = svc
    catalogLoaded.value = true
    applyCustomerDefaults()
  } catch (error) {
    console.error('failed to load catalog', error)
  } finally {
    loading.value = false
  }
}

const ensureViewData = () => {
  if (isStaffView.value) {
    fetchAppointments()
  } else {
    loadCatalog()
  }
}

onMounted(() => {
  ensureViewData()
})

onShow(() => {
  ensureViewData()
  applyCustomerDefaults()
})

watch(isStaffView, () => {
  if (isStaffView.value) {
    fetchAppointments()
  } else {
    loadCatalog()
    applyCustomerDefaults()
  }
})

watch(
  () => userStore.userInfo?.default_location_id,
  () => {
    if (!isStaffView.value && !bookingStore.selectedLocation) {
      applyCustomerDefaults()
    }
  }
)
</script>

<style scoped lang="scss">
.page {
  padding: 40rpx 32rpx 80rpx;
}

.hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 32rpx;

  &__subtitle {
    font-size: 24rpx;
    color: #7b7f8d;
  }

  &__title {
    display: block;
    font-size: 48rpx;
    font-weight: 700;
    color: #111;
  }

  &__hint {
    display: block;
    font-size: 24rpx;
    color: #7b7f8d;
  }

}

.hero--staff {
  margin-bottom: 8rpx;

  .hero__title {
    font-size: 28rpx;
    color: #4b5563;
  }
}

.admin-panel {
  margin-top: 24rpx;
}

.card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 10rpx 40rpx rgba(17, 17, 17, 0.05);

  &__title {
    display: block;
    font-size: 28rpx;
    margin-bottom: 12rpx;
  }

  &__price {
    font-size: 32rpx;
    color: #111;
    font-weight: 600;
  }

  &--summary {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

.picker-value {
  padding: 20rpx;
  background: #f5f6fb;
  border-radius: 12rpx;
}

.primary-btn {
  width: 100%;
  margin: 16rpx 0 24rpx;
  border-radius: 999px;
}

.links {
  display: flex;
  gap: 16rpx;
  justify-content: center;
}
</style>
