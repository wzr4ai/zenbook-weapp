<template>
  <view class="booking-card">
    <view class="booking-card__row">
      <text class="booking-card__service">{{ serviceName }}</text>
      <text class="booking-card__status" :class="`status--${appointment.status}`">
        {{ statusText }}
      </text>
    </view>
    <view class="booking-card__row booking-card__row--meta">
      <text>{{ technicianName }}</text>
      <text>{{ locationName }}</text>
    </view>
    <view class="booking-card__row booking-card__row--time">
      <text>{{ timeRange }}</text>
    </view>
    <slot />
  </view>
</template>

<script setup lang="ts">
import dayjs from "dayjs";
import type { Appointment } from "@/api/appointments";
import { computed } from "vue";

const props = defineProps<{
  appointment: Appointment;
}>();

const serviceName = computed(
  () => props.appointment.service_name ?? "未命名服务",
);
const technicianName = computed(
  () => props.appointment.technician_name ?? "未指定技师",
);
const locationName = computed(
  () => props.appointment.location_name ?? "未指定地点",
);
const statusText = computed(() => {
  switch (props.appointment.status) {
    case "completed":
      return "已完成";
    case "cancelled":
      return "已取消";
    default:
      return "已预约";
  }
});
const timeRange = computed(() => {
  const start = dayjs(props.appointment.start_time).format("MM/DD HH:mm");
  const end = dayjs(props.appointment.end_time).format("HH:mm");
  return `${start} - ${end}`;
});
</script>

<style scoped>
.booking-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.05);
}

.booking-card__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
  color: #444;
}

.booking-card__row--meta {
  font-size: 26rpx;
  color: #777;
}

.booking-card__row--time {
  font-weight: 600;
  font-size: 28rpx;
}

.booking-card__service {
  font-size: 32rpx;
  font-weight: 600;
}

.booking-card__status {
  font-size: 26rpx;
}

.status--scheduled {
  color: #04a38a;
}

.status--completed {
  color: #5c6b9c;
}

.status--cancelled {
  color: #c94b4b;
}
</style>
