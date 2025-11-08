<template>
  <scroll-view class="page" scroll-y>
    <view class="card">
      <view class="card__header">营业时间</view>
      <view v-for="slot in businessHours" :key="slot.id" class="item">
        <text>{{ slot.weekday }}</text>
        <text>{{ slot.start }} - {{ slot.end }}</text>
      </view>
      <button class="ghost-btn" @tap="editBusinessHours">编辑营业时间</button>
    </view>

    <view class="card">
      <view class="card__header">排班例外</view>
      <view v-if="exceptions.length === 0" class="empty">暂无例外</view>
      <view v-for="exception in exceptions" :key="exception.id" class="item">
        <text>{{ exception.date }} · {{ exception.technician }}</text>
        <text>{{ exception.reason }}</text>
      </view>
      <button class="primary-btn" @tap="addException">新增例外</button>
    </view>
  </scroll-view>
</template>

<script setup lang="ts">
const businessHours = [
  { id: 1, weekday: "周一 - 周五", start: "08:00", end: "21:00" },
  { id: 2, weekday: "周六 - 周日", start: "09:00", end: "19:00" },
];

const exceptions = [
  {
    id: 1,
    date: "2024-06-12",
    technician: "魏师傅",
    reason: "培训",
  },
];

function editBusinessHours() {
  uni.showToast({ title: "即将开放排班配置", icon: "none" });
}

function addException() {
  uni.showToast({ title: "敬请期待", icon: "none" });
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 32rpx;
  background: #f0f2f5;
}

.card {
  background: #fff;
  border-radius: 32rpx;
  padding: 24rpx 32rpx;
  margin-bottom: 24rpx;
}

.card__header {
  font-size: 30rpx;
  font-weight: 600;
  margin-bottom: 16rpx;
}

.item {
  display: flex;
  justify-content: space-between;
  padding: 16rpx 0;
  border-bottom: 2rpx solid #f5f5f5;
}

.item:last-child {
  border-bottom: none;
}

.empty {
  color: #999;
  padding: 24rpx 0;
  text-align: center;
}

.primary-btn,
.ghost-btn {
  width: 100%;
  border-radius: 24rpx;
  padding: 20rpx 0;
  font-size: 28rpx;
  margin-top: 16rpx;
}

.primary-btn {
  background: #1677ff;
  color: #fff;
}

.ghost-btn {
  border: 2rpx solid #1677ff;
  color: #1677ff;
  background: #fff;
}
</style>
