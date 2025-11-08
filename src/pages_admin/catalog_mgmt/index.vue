<template>
  <scroll-view class="page" scroll-y>
    <view class="card">
      <view class="card__header">技师</view>
      <view v-for="technician in technicians" :key="technician.id" class="item">
        <view>
          <text class="item__title">{{ technician.name }}</text>
          <text class="item__desc">{{ technician.specialty }}</text>
        </view>
        <button size="mini" @tap="() => edit('technician')">编辑</button>
      </view>
      <button class="ghost-btn" @tap="() => edit('technician')">新增技师</button>
    </view>

    <view class="card">
      <view class="card__header">服务项目</view>
      <view v-for="service in services" :key="service.id" class="item">
        <view>
          <text class="item__title">{{ service.name }}</text>
          <text class="item__desc">{{ service.duration }} 分钟</text>
        </view>
        <button size="mini" @tap="() => edit('service')">编辑</button>
      </view>
      <button class="ghost-btn" @tap="() => edit('service')">新增服务</button>
    </view>

    <view class="card">
      <view class="card__header">Offerings（地点+技师+服务）</view>
      <view v-for="offering in offerings" :key="offering.id" class="item">
        <view>
          <text class="item__title">{{ offering.label }}</text>
          <text class="item__desc">{{ offering.price }} 元</text>
        </view>
        <button size="mini" @tap="() => edit('offering')">编辑</button>
      </view>
      <button class="primary-btn" @tap="() => edit('offering')">新增 Offering</button>
    </view>
  </scroll-view>
</template>

<script setup lang="ts">
const technicians = [
  { id: 1, name: "魏师傅", specialty: "肩颈调理" },
  { id: 2, name: "李老师", specialty: "经络疏通" },
];

const services = [
  { id: 1, name: "经络调理 60'", duration: 60 },
  { id: 2, name: "拔罐+艾灸 45'", duration: 45 },
];

const offerings = [
  { id: 1, label: "经络调理 · 魏师傅 @ 国贸门店", price: 368 },
  { id: 2, label: "拔罐艾灸 · 李老师 @ 望京门店", price: 268 },
];

function edit(type: string) {
  uni.showToast({ title: `${type} 功能开发中`, icon: "none" });
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

.item__title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
}

.item__desc {
  display: block;
  font-size: 26rpx;
  color: #888;
  margin-top: 8rpx;
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
