<template>
  <view class="calendar">
    <view class="calendar__header">
      <text class="calendar__title">{{ title }}</text>
    </view>
    <view class="calendar__grid">
      <view
        v-for="day in days"
        :key="day.date"
        class="calendar__cell"
        :class="{
          'calendar__cell--disabled': day.disabled,
          'calendar__cell--active': modelValue === day.date
        }"
        @tap="handleSelect(day)"
      >
        <text class="calendar__weekday">{{ day.label }}</text>
        <text class="calendar__date">{{ formatDate(day.date) }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
interface DayMeta {
  date: string
  label: string
  disabled?: boolean
}

const props = defineProps<{
  days: DayMeta[]
  modelValue: string
  title?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
}>()

const formatDate = (value: string) => {
  if (!value) return ''
  return value.split('-').slice(1).join('/')
}

const handleSelect = (day: DayMeta) => {
  if (day.disabled) {
    return
  }
  emit('update:modelValue', day.date)
  emit('change', day.date)
}
</script>

<style scoped lang="scss">
.calendar {
  padding: 24rpx;
  background: #fff;
  border-radius: 16rpx;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;
  }

  &__title {
    font-size: 32rpx;
    font-weight: 600;
    color: #111;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12rpx;
  }

  &__cell {
    padding: 16rpx;
    border-radius: 12rpx;
    text-align: center;
    background: #f5f7fb;
    color: #333;

    &--disabled {
      opacity: 0.4;
    }

    &--active {
      background: #007aff;
      color: #fff;
    }
  }

  &__weekday {
    display: block;
    font-size: 24rpx;
  }

  &__date {
    display: block;
    font-size: 32rpx;
    font-weight: 500;
  }
}
</style>
