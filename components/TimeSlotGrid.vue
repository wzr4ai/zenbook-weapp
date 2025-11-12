<template>
  <view class="slot-grid">
    <view
      v-for="section in sections"
      :key="section.label"
      v-show="section.slots.length"
      class="slot-grid__section"
    >
      <view class="slot-grid__section-title">
        <text>{{ section.label }}</text>
        <view class="slot-grid__section-divider" />
      </view>
      <view class="slot-grid__group">
        <view
          v-for="slot in section.slots"
          :key="slot.start"
          class="slot-grid__item"
          :class="{
            'slot-grid__item--disabled': slot.disabled,
            'slot-grid__item--active': modelValue?.start === slot.start
          }"
          @tap="handleSelect(slot)"
        >
          <view class="slot-grid__item-header">
            <text class="slot-grid__time">
              {{ formatTime(slot.start) }} - {{ formatTime(slot.end) }}
            </text>
            <text v-if="slot.disabled" class="slot-grid__badge">不可用</text>
          </view>
          <text v-if="slot.statusText" class="slot-grid__reason">{{ slot.statusText }}</text>
        </view>
      </view>
    </view>
    <view v-if="!slots.length" class="slot-grid__empty">
      暂无可用时段，请更换日期或服务
    </view>
  </view>
</template>

<script setup lang="ts">
interface SlotMeta {
  start: string
  end: string
  disabled?: boolean
  reason?: string | null
  statusText?: string
}

import { computed } from 'vue'

const props = defineProps<{
  slots: SlotMeta[]
  modelValue?: SlotMeta | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: SlotMeta): void
  (e: 'select', value: SlotMeta): void
}>()

const formatTime = (value: string) => {
  if (!value) return ''
  const time = value.split('T')[1] ?? value
  return time.slice(0, 5)
}

const isMorning = (value: string) => {
  const time = value.split('T')[1] ?? value
  const hour = Number(time.slice(0, 2))
  return hour < 12
}

const sections = computed(() => [
  { label: '上午', slots: props.slots.filter((slot) => isMorning(slot.start)) },
  { label: '下午', slots: props.slots.filter((slot) => !isMorning(slot.start)) }
])

const handleSelect = (slot: SlotMeta) => {
  if (slot.disabled) {
    return
  }
  emit('update:modelValue', slot)
  emit('select', slot)
}
</script>

<style scoped lang="scss">
.slot-grid {
  display: flex;
  flex-direction: column;
  gap: 24rpx;

  &__section-title {
    display: flex;
    align-items: center;
    gap: 16rpx;
    font-size: 26rpx;
    font-weight: 600;
    color: #111;
    margin-bottom: 12rpx;
  }

  &__section-divider {
    flex: 1;
    height: 2rpx;
    background: #e2e8f0;
  }

  &__group {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16rpx;
  }

  &__item {
    padding: 20rpx;
    border-radius: 12rpx;
    background: #f4f6fb;
    border: 2rpx solid transparent;
    display: flex;
    flex-direction: column;
    gap: 8rpx;

    &--active {
      border-color: #007aff;
      background: rgba(0, 122, 255, 0.12);
    }

    &--disabled {
      background: #f8fafc;
      border-color: #e2e8f0;
    }
  }

  &__item--disabled &__time {
    color: #94a3b8;
  }

  &__time {
    display: block;
    font-size: 28rpx;
    color: #111;
  }

  &__item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12rpx;
  }

  &__badge {
    font-size: 22rpx;
    color: #6b7280;
    background: #e5e7eb;
    padding: 2rpx 14rpx;
    border-radius: 999px;
  }

  &__reason {
    display: block;
    font-size: 24rpx;
    color: #999;
    margin-top: 8rpx;
  }

  &__empty {
    grid-column: 1 / -1;
    text-align: center;
    color: #777;
    padding: 32rpx 0;
  }
}
</style>
