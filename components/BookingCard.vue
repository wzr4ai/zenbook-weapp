<template>
  <view class="booking-card">
    <view class="booking-card__header">
      <text class="booking-card__title">{{ title }}</text>
      <text class="booking-card__status" :class="statusClass">{{ statusLabel }}</text>
    </view>
    <view class="booking-card__body">
      <text class="booking-card__row">
        {{ technician }} · {{ service }}
      </text>
      <text class="booking-card__row">
        {{ formatDate(startTime) }} {{ formatTime(startTime) }} - {{ formatTime(endTime) }}
      </text>
      <text class="booking-card__row">
        {{ location }} · ¥{{ price }}
      </text>
    </view>
    <slot />
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  title: string
  status: string
  technician: string
  service: string
  startTime: string
  endTime: string
  location: string
  price: number | string
}>()

const STATUS_CLASS_MAP: Record<string, string> = {
  scheduled: 'booking-card__status--scheduled',
  completed: 'booking-card__status--completed',
  cancelled: 'booking-card__status--cancelled',
  no_show: 'booking-card__status--no_show'
}

const STATUS_LABEL_MAP: Record<string, string> = {
  scheduled: '待服务',
  completed: '已完成',
  cancelled: '已取消',
  no_show: '违约'
}

const statusClass = computed(() => STATUS_CLASS_MAP[props.status] ?? '')
const statusLabel = computed(() => STATUS_LABEL_MAP[props.status] ?? props.status)

const formatDate = (value: string) => value?.split('T')[0] ?? ''
const formatTime = (value: string) => {
  if (!value) {
    return ''
  }
  const time = value.split('T')[1] ?? value
  return time.slice(0, 5)
}
</script>

<style scoped lang="scss">
.booking-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 8rpx 30rpx rgba(17, 17, 17, 0.05);

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

  &__status {
    font-size: 24rpx;
    padding: 6rpx 16rpx;
    border-radius: 999px;
    background: #f1f1f1;
    color: #666;

    &--scheduled {
      background: rgba(0, 122, 255, 0.12);
      color: #006bdb;
    }

    &--completed {
      background: rgba(82, 196, 26, 0.12);
      color: #418f1b;
    }

    &--cancelled {
      background: rgba(255, 71, 87, 0.12);
      color: #c94455;
    }

    &--no_show {
      background: rgba(250, 140, 22, 0.12);
      color: #c46a00;
    }
  }

  &__body {
    color: #555;
    font-size: 26rpx;
  }

  &__row {
    display: block;
    margin-bottom: 10rpx;
  }
}
</style>
