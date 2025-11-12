<template>
  <view class="page">
    <Calendar
      :days="days"
      v-model="selectedDate"
      title="选择日期"
    />

    <view class="panel">
      <text class="panel__title">选择技师</text>
      <view v-if="techniciansLoading" class="panel__loading">加载技师...</view>
      <picker
        v-else-if="technicians.length"
        mode="selector"
        :range="technicians"
        range-key="display_name"
        @change="onTechnicianChange"
      >
        <view class="picker-value">
          {{ bookingStore.selectedTechnician?.display_name ?? '请选择技师' }}
        </view>
      </picker>
      <view v-else class="empty-hint">暂无可用技师</view>
    </view>

    <view class="panel">
      <text class="panel__title">可用时间</text>
      <view v-if="loadingSlots" class="panel__loading">加载可预约时段...</view>
      <TimeSlotGrid
        v-else
        :slots="displaySlots"
        v-model="selectedSlot"
      />
    </view>

    <view class="panel" v-if="selectedOffering">
      <text class="panel__title">预约摘要</text>
      <view class="summary">
        <text>{{ selectedOffering.service_name }}</text>
        <text>技师：{{ bookingStore.selectedTechnician?.display_name }}</text>
        <text>地点：{{ bookingStore.selectedLocation?.name }}</text>
      </view>
    </view>

    <button
      class="primary-btn"
      type="primary"
      :disabled="!bookingStore.selectedSlot"
      @tap="goConfirm"
    >
      去确认
    </button>
  </view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'
import { computed, onMounted, ref, watch } from 'vue'
import Calendar from '../../components/Calendar.vue'
import TimeSlotGrid from '../../components/TimeSlotGrid.vue'
import { fetchTechnicians } from '../../api/catalog'
import { useBookingStore } from '../../store/booking'

type PickerChangeEvent = { detail: { value: number } }

const bookingStore = useBookingStore()
const days = ref(generateDays())
const selectedDate = ref(bookingStore.selectedDate || days.value[0]?.date)
const loadingSlots = ref(false)
const technicians = ref<any[]>([])
const techniciansLoading = ref(false)
const selectedSlot = computed({
  get: () => bookingStore.selectedSlot,
  set: (slot) => bookingStore.setSlot(slot)
})
const selectedOffering = computed(() => bookingStore.offerings[0])
const displaySlots = computed(() => {
  const slots = bookingStore.availability || []
  const currentDate = selectedDate.value
  if (!currentDate) {
    return slots
  }
  const todayKey = formatDate(new Date())
  const now = Date.now()
  const isToday = currentDate === todayKey
  return slots.map((slot) => {
    const startTime = new Date(slot.start).getTime()
    const isPast = isToday && !Number.isNaN(startTime) && startTime <= now
    return {
      ...slot,
      disabled: Boolean(slot.disabled) || isPast
    }
  })
})

const ensureTechnicianSelection = () => {
  if (!technicians.value.length) {
    if (bookingStore.selectedTechnician) {
      bookingStore.setTechnician(null)
    }
    return
  }
  const currentId = bookingStore.selectedTechnician?.id
  const matched = currentId
    ? technicians.value.find((item) => item.id === currentId)
    : null
  if (matched) {
    // Sync latest fields such as weight/avatar
    bookingStore.setTechnician(matched)
    return
  }
  bookingStore.setTechnician(technicians.value[0])
}

const loadTechnicians = async () => {
  if (techniciansLoading.value) {
    return
  }
  techniciansLoading.value = true
  try {
    const data = await fetchTechnicians()
    technicians.value = Array.isArray(data) ? data : []
    ensureTechnicianSelection()
  } catch (error) {
    console.error('failed to load technicians', error)
    technicians.value = []
    bookingStore.setTechnician(null)
  } finally {
    techniciansLoading.value = false
  }
}

const onTechnicianChange = (event: PickerChangeEvent) => {
  const next = technicians.value?.[Number(event.detail.value)]
  if (next) {
    bookingStore.setTechnician(next)
  }
}

function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatWeekday(date: Date): string {
  const mapping = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return mapping[date.getDay()]
}

function describeOffset(index: number): string {
  if (index === 0) return '今天'
  if (index === 1) return '明天'
  if (index === 2) return '后天'
  return `${index}天后`
}

function generateDays(count = 7) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Array.from({ length: count }).map((_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() + index)
    return {
      date: formatDate(date),
      label: describeOffset(index),
      weekday: formatWeekday(date),
      disabled: false
    }
  })
}

const canLoadAvailability = computed(
  () =>
    Boolean(
      bookingStore.selectedLocation?.id &&
        bookingStore.selectedTechnician?.id &&
        bookingStore.selectedService?.id
    )
)

const refreshOfferingsAndAvailability = async () => {
  if (!canLoadAvailability.value) {
    bookingStore.clearOfferings()
    bookingStore.clearAvailability()
    return
  }
  const filters = {
    location_id: bookingStore.selectedLocation?.id,
    technician_id: bookingStore.selectedTechnician?.id,
    service_id: bookingStore.selectedService?.id
  }
  await bookingStore.loadOfferings(filters)
  if (bookingStore.selectedDate) {
    await loadAvailability(bookingStore.selectedDate)
  }
}

const loadAvailability = async (date: string) => {
  if (!date) return
  bookingStore.setDate(date)
  if (!canLoadAvailability.value) {
    bookingStore.clearAvailability()
    return
  }
  loadingSlots.value = true
  try {
    await bookingStore.loadAvailability({
      date,
      technician_id: bookingStore.selectedTechnician?.id,
      service_id: bookingStore.selectedService?.id,
      location_id: bookingStore.selectedLocation?.id
    })
  } finally {
    loadingSlots.value = false
  }
}

const goConfirm = () => {
  if (!bookingStore.selectedSlot) {
    uni.showToast({ title: '请选择时间', icon: 'none' })
    return
  }
  uni.navigateTo({ url: '/pages/confirm/index' })
}

watch(
  () => selectedDate.value,
  (value) => {
    loadAvailability(value)
  },
  { immediate: true }
)

watch(
  () => [
    bookingStore.selectedLocation?.id,
    bookingStore.selectedTechnician?.id,
    bookingStore.selectedService?.id
  ],
  () => {
    void refreshOfferingsAndAvailability()
  },
  { immediate: true }
)

watch(
  () => displaySlots.value,
  (slots) => {
    if (!bookingStore.selectedSlot) {
      return
    }
    const active = slots.find((slot) => slot.start === bookingStore.selectedSlot?.start)
    if (!active || active.disabled) {
      bookingStore.setSlot(null)
    }
  },
  { deep: true }
)

onMounted(() => {
  if (!bookingStore.selectedLocation || !bookingStore.selectedService) {
    uni.navigateBack()
    return
  }
  loadTechnicians()
})

onShow(() => {
  if (!bookingStore.selectedLocation || !bookingStore.selectedService) {
    uni.navigateBack()
    return
  }
  loadTechnicians()
})
</script>

<style scoped lang="scss">
.page {
  padding: 32rpx;
}

.panel {
  margin-top: 24rpx;
  padding: 24rpx;
  background: #fff;
  border-radius: 16rpx;

  &__title {
    font-size: 30rpx;
    font-weight: 600;
    margin-bottom: 20rpx;
  }

  &__loading {
    padding: 24rpx 0;
    text-align: center;
    color: #888;
    font-size: 26rpx;
  }
}

.summary {
  color: #666;
  font-size: 26rpx;
  line-height: 1.6;
}

.picker-value {
  padding: 20rpx;
  background: #f5f6fb;
  border-radius: 12rpx;
}

.empty-hint {
  padding: 16rpx 0;
  color: #999;
  font-size: 26rpx;
}

.primary-btn {
  width: 100%;
  margin-top: 40rpx;
  border-radius: 999px;
}
</style>
