<template>
  <view class="calendar">
    <view
      v-for="day in daysToRender"
      :key="day.date"
      class="calendar__item"
      :class="{ 'calendar__item--active': day.date === modelValue }"
      @tap="handleSelect(day.date)"
    >
      <text class="calendar__weekday">{{ day.weekday }}</text>
      <text class="calendar__date">{{ day.label }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import dayjs from "dayjs";
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    modelValue: string;
    days?: number;
    startDate?: string;
  }>(),
  {
    days: 7,
    startDate: dayjs().format("YYYY-MM-DD"),
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const daysToRender = computed(() => {
  const start = dayjs(props.startDate);
  return Array.from({ length: props.days }, (_, index) => {
    const date = start.add(index, "day");
    return {
      date: date.format("YYYY-MM-DD"),
      label: date.format("MM/DD"),
      weekday: ["日", "一", "二", "三", "四", "五", "六"][date.day()],
    };
  });
});

function handleSelect(date: string) {
  emit("update:modelValue", date);
}
</script>

<style scoped>
.calendar {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16rpx;
  padding: 24rpx 32rpx;
  background: #fff;
  border-radius: 24rpx;
}

.calendar__item {
  padding: 16rpx;
  border: 2rpx solid #f0f0f0;
  border-radius: 16rpx;
  text-align: center;
  color: #666;
}

.calendar__item--active {
  border-color: #04c1a1;
  background: #e6fffb;
  color: #04a38a;
}

.calendar__weekday {
  display: block;
  font-size: 24rpx;
}

.calendar__date {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
}
</style>
