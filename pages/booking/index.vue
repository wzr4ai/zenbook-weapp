<template>
  <view class="container">
    <view class="section">
      <picker mode="date" :value="selectedDate" @change="onDateChange">
        <view class="picker">预约日期：{{ selectedDate || '请选择日期' }}</view>
      </picker>
    </view>

    <view class="slots">
      <view v-for="slot in availability" :key="slot.start" class="slot" :class="{ active: isSlotSelected(slot) }" @click="selectSlot(slot)">
        {{ format(slot.start) }} - {{ format(slot.end) }}
      </view>
    </view>

    <button type="primary" class="cta" :disabled="!canConfirm" @click="toConfirm">下一步</button>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue';
import dayjs from 'dayjs';
import scheduleApi from '../../api/schedule';
import { useBookingStore } from '../../store/booking';

const bookingStore = useBookingStore();
const loading = ref(false);

const selectedDate = computed({
  get: () => bookingStore.selectedDate,
  set: (value) => {
    bookingStore.selectedDate = value;
  },
});

const availability = computed(() => bookingStore.availability);
const canConfirm = computed(() => Boolean(bookingStore.selectedSlot));

async function onDateChange(e) {
  selectedDate.value = e.detail.value;
  await fetchAvailability();
}

async function fetchAvailability() {
  if (!bookingStore.selectedTechnician || !bookingStore.selectedService || !bookingStore.selectedLocation) {
    uni.showToast({ title: '请先选择地点/技师/服务', icon: 'none' });
    return;
  }
  bookingStore.setAvailability([]);
  loading.value = true;
  try {
    const slots = await scheduleApi.getAvailability({
      date: selectedDate.value,
      technician_id: bookingStore.selectedTechnician.technician_id,
      service_id: bookingStore.selectedService.service_id,
      location_id: bookingStore.selectedLocation.location_id,
    });
    bookingStore.setAvailability(slots);
  } finally {
    loading.value = false;
  }
}

function selectSlot(slot) {
  bookingStore.selectedSlot = slot;
}

function isSlotSelected(slot) {
  return Boolean(bookingStore.selectedSlot && bookingStore.selectedSlot.start === slot.start);
}

function format(value) {
  return dayjs(value).format('HH:mm');
}

function toConfirm() {
  if (!canConfirm.value) return;
  uni.navigateTo({ url: '/pages/confirm/index' });
}
</script>

<style scoped>
.container {
  padding: 24rpx;
}
.section {
  background: #fff;
  padding: 24rpx;
  border-radius: 16rpx;
  margin-bottom: 24rpx;
}
.slots {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}
.slot {
  flex: 1 0 45%;
  text-align: center;
  padding: 24rpx;
  background: #fff;
  border-radius: 16rpx;
  border: 2rpx solid #eee;
}
.slot.active {
  border-color: #007aff;
  color: #007aff;
}
.cta {
  margin-top: 40rpx;
}
</style>
