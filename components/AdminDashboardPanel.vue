<template>
  <view class="panel stats">
    <view class="stats__item">
      <text class="stats__value">{{ todayCount }}</text>
      <text class="stats__label">今日预约</text>
    </view>
    <view class="stats__item">
      <text class="stats__value">{{ pendingCount }}</text>
      <text class="stats__label">待服务</text>
    </view>
    <view class="stats__item">
      <text class="stats__value">{{ cancelledCount }}</text>
      <text class="stats__label">已取消</text>
    </view>
  </view>

  <view class="panel shortcuts">
    <text class="panel__title">快捷操作</text>
    <view class="shortcut-grid">
      <button class="shortcut" @tap="$emit('create')">手动预约</button>
      <button class="shortcut" @tap="$emit('schedule')">排班管理</button>
      <button class="shortcut" @tap="$emit('catalog')">服务管理</button>
      <button class="shortcut" @tap="$emit('users')">账户/就诊人</button>
    </view>
  </view>

  <view class="panel">
    <text class="panel__title">预约列表</text>
    <BookingCard
      v-for="item in appointments"
      :key="item.id"
      :title="item.patient_name"
      :status="item.status"
      :technician="item.technician_name"
      :service="item.service_name"
      :start-time="item.start_time"
      :end-time="item.end_time"
      :location="item.location_name"
      :price="item.price_at_booking"
      @tap="$emit('edit', item.id)"
    >
      <view class="card-actions">
        <button size="mini" @tap.stop="$emit('edit', item.id)">编辑</button>
      </view>
    </BookingCard>
    <view v-if="!appointments.length" class="empty">
      暂无预约，换个日期试试
    </view>
  </view>
</template>

<script setup lang="ts">
import BookingCard from './BookingCard.vue'

defineProps<{
  appointments: any[]
  todayCount: number
  pendingCount: number
  cancelledCount: number
}>()

defineEmits<{
  (e: 'create'): void
  (e: 'schedule'): void
  (e: 'catalog'): void
  (e: 'users'): void
  (e: 'edit', id: string): void
}>()
</script>

<style scoped lang="scss">
.panel {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;

  &__title {
    font-size: 30rpx;
    font-weight: 600;
    margin-bottom: 16rpx;
  }
}

.stats {
  display: flex;
  justify-content: space-between;

  &__item {
    flex: 1;
    text-align: center;
  }

  &__value {
    display: block;
    font-size: 48rpx;
    font-weight: 700;
  }

  &__label {
    color: #888;
  }
}

.shortcut-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.shortcut {
  background: #f5f6fb;
  border-radius: 12rpx;
}

.card-actions {
  margin-top: 12rpx;
}

.empty {
  text-align: center;
  color: #aaa;
  margin-top: 80rpx;
}
</style>
