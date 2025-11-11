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
        <text class="calendar__highlight">{{ day.label }}</text>
        <text class="calendar__weekday">{{ day.weekday || formatWeekday(day.date) }}</text>
        <text class="calendar__date">{{ formatDate(day.date) }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
interface DayMeta {
  date: string
  label: string
  weekday?: string
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
  const parts = value.split('-')
  if (parts.length < 3) return value
  return `${parts[1]}/${parts[2]}`
}

const formatWeekday = (value: string) => {
  if (!value) return ''
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) {
    return ''
  }
  const mapping = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return mapping[date.getDay()]
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

  &__highlight {
    display: block;
    font-size: 34rpx;
    font-weight: 600;
    margin-bottom: 6rpx;
  }

  &__weekday {
    display: block;
    font-size: 24rpx;
    color: #6b7280;
    margin-bottom: 2rpx;
  }

  &__date {
    display: block;
    font-size: 28rpx;
    font-weight: 500;
  }

  &__cell--active {
    .calendar__weekday {
      color: rgba(255, 255, 255, 0.9);
    }
  }
}
</style>
