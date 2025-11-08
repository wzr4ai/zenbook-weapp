<template>
  <view class="slot-grid">
    <view v-if="loading" class="slot-grid__empty">加载可用时段...</view>
    <view v-else-if="slots.length === 0" class="slot-grid__empty">
      暂无可预约时间，请更换日期
    </view>
    <view
      v-else
      v-for="slot in slots"
      :key="slot.start"
      class="slot-grid__item"
      :class="{
        'slot-grid__item--disabled': Boolean(slot.reason),
        'slot-grid__item--active': slot.start === selectedSlot?.start,
      }"
      @tap="() => !slot.reason && emit('select', slot)"
    >
      <text class="slot-grid__time">{{ formatTime(slot.start) }}</text>
      <text v-if="slot.reason" class="slot-grid__reason">{{ slot.reason }}</text>
      <text
        v-else-if="slot.remaining_capacity !== undefined"
        class="slot-grid__capacity"
      >
        剩余 {{ slot.remaining_capacity }}
      </text>
    </view>
  </view>
</template>

<script setup lang="ts">
import dayjs from "dayjs";
import type { AvailabilitySlot } from "@/api/schedule";

defineProps<{
  slots: AvailabilitySlot[];
  loading?: boolean;
  selectedSlot: AvailabilitySlot | null;
}>();

const emit = defineEmits<{
  select: [slot: AvailabilitySlot];
}>();

function formatTime(value: string) {
  return dayjs(value).format("HH:mm");
}
</script>

<style scoped>
.slot-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
  padding: 32rpx;
}

.slot-grid__item {
  border: 2rpx solid #e8e8e8;
  border-radius: 16rpx;
  padding: 20rpx;
  background: #fff;
}

.slot-grid__item--active {
  border-color: #04c1a1;
  box-shadow: 0 8rpx 20rpx rgba(4, 193, 161, 0.1);
}

.slot-grid__item--disabled {
  color: #bbb;
  background: #fafafa;
}

.slot-grid__time {
  font-size: 32rpx;
  font-weight: 600;
}

.slot-grid__capacity,
.slot-grid__reason {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #999;
}

.slot-grid__empty {
  grid-column: 1 / -1;
  text-align: center;
  padding: 48rpx 0;
  color: #999;
}
</style>
