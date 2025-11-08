<template>
  <scroll-view class="page" scroll-y>
    <view class="summary">
      <view class="summary__title">已选服务</view>
      <view class="summary__content">
        <text>{{ serviceName }}</text>
        <text>{{ technicianName }}</text>
        <text>{{ locationName }}</text>
      </view>
    </view>

    <calendar
      :model-value="bookingStore.selectedDate"
      @update:model-value="onDateChange"
    />

    <view class="card">
      <view class="card__header">
        <text>可预约时间段</text>
        <text class="card__hint">以实际确认结果为准</text>
      </view>
      <time-slot-grid
        :slots="bookingStore.availability"
        :selected-slot="bookingStore.selectedSlot"
        :loading="bookingStore.loadingAvailability"
        @select="onSlotSelect"
      />
    </view>

    <button class="primary-btn" @tap="goConfirm">下一步 · 填写信息</button>
  </scroll-view>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import { onShow } from "@dcloudio/uni-app";
import Calendar from "@/components/Calendar.vue";
import TimeSlotGrid from "@/components/TimeSlotGrid.vue";
import { useBookingStore } from "@/store/booking";

const bookingStore = useBookingStore();

onShow(() => {
  if (!bookingStore.hasSelection) {
    uni.redirectTo({ url: "/pages/index/index" });
    return;
  }
  bookingStore.fetchAvailability();
});

watch(
  () => bookingStore.selectedDate,
  () => {
    if (bookingStore.hasSelection) {
      bookingStore.fetchAvailability();
    }
  },
);

const serviceName = computed(() => {
  if (!bookingStore.selectedServiceId) return "尚未选择服务";
  return (
    bookingStore.services.find(
      (service) => service.id === bookingStore.selectedServiceId,
    )?.name ?? "未知服务"
  );
});
const technicianName = computed(() => {
  if (!bookingStore.selectedTechnicianId) return "未选技师";
  return (
    bookingStore.technicians.find(
      (tech) => tech.id === bookingStore.selectedTechnicianId,
    )?.name ?? "未知技师"
  );
});
const locationName = computed(() => {
  if (!bookingStore.selectedLocationId) return "未选地点";
  return (
    bookingStore.locations.find(
      (loc) => loc.id === bookingStore.selectedLocationId,
    )?.name ?? "未知地点"
  );
});

function onDateChange(value: string) {
  bookingStore.setDate(value);
}

function onSlotSelect(slot: NonNullable<typeof bookingStore.selectedSlot>) {
  bookingStore.setSlot(slot);
}

function goConfirm() {
  if (!bookingStore.selectedSlot) {
    uni.showToast({ title: "请选择时间段", icon: "none" });
    return;
  }
  uni.navigateTo({ url: "/pages/confirm/index" });
}
</script>

<style scoped>
.page {
  height: 100vh;
  padding: 32rpx;
}

.summary {
  background: #fff;
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
}

.summary__title {
  font-size: 28rpx;
  color: #777;
  margin-bottom: 12rpx;
}

.summary__content text {
  display: block;
  font-size: 30rpx;
  font-weight: 500;
  color: #222;
}

.card {
  background: #fff;
  border-radius: 32rpx;
  margin: 24rpx 0;
}

.card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 32rpx;
  border-bottom: 2rpx solid #f5f5f5;
}

.card__hint {
  font-size: 24rpx;
  color: #999;
}

.primary-btn {
  background: #04c1a1;
  color: #fff;
  border-radius: 999rpx;
  padding: 24rpx 0;
  font-size: 30rpx;
}
</style>
