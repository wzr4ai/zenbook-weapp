<template>
  <view class="page">
    <Calendar
      :days="days"
      v-model="selectedDate"
      title="选择日期"
    />

    <view class="panel">
      <text class="panel__title">可用时间</text>
      <TimeSlotGrid
        :slots="bookingStore.availability"
        v-model="selectedSlot"
      />
    </view>

    <view class="panel" v-if="selectedOffering">
      <text class="panel__title">预约摘要</text>
      <view class="summary">
        <text>{{ selectedOffering.service_name }}</text>
        <text>技师：{{ bookingStore.selectedTechnician?.name }}</text>
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
import { computed, onMounted, ref, watch } from 'vue'
import Calendar from '../../components/Calendar.vue'
import TimeSlotGrid from '../../components/TimeSlotGrid.vue'
import { useBookingStore } from '../../store/booking'

const bookingStore = useBookingStore()
const days = ref(generateDays())
const selectedDate = ref(bookingStore.selectedDate || days.value[0]?.date)
const selectedSlot = computed({
  get: () => bookingStore.selectedSlot,
  set: (slot) => bookingStore.setSlot(slot)
})
const selectedOffering = computed(() => bookingStore.offerings[0])

function generateDays(count = 7) {
  const today = new Date()
  return Array.from({ length: count }).map((_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() + index)
    return {
      date: date.toISOString().split('T')[0],
      label: index === 0 ? '今天' : `+${index}天`,
      disabled: false
    }
  })
}

const loadAvailability = async (date: string) => {
  if (!date) return
  bookingStore.setDate(date)
  await bookingStore.loadAvailability({
    date,
    technician_id: bookingStore.selectedTechnician?.id,
    service_id: bookingStore.selectedService?.id,
    location_id: bookingStore.selectedLocation?.id
  })
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

onMounted(() => {
  if (!bookingStore.selectedLocation) {
    uni.navigateBack()
  }
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
}

.summary {
  color: #666;
  font-size: 26rpx;
  line-height: 1.6;
}

.primary-btn {
  width: 100%;
  margin-top: 40rpx;
  border-radius: 999px;
}
</style>
