<template>
  <view class="container">
    <view class="card">
      <text class="title">管理快捷入口</text>
      <button class="btn" @click="go('/pages_sub/appointments/index')">预约列表</button>
      <button class="btn" @click="go('/pages_sub/patients/index')">客户管理</button>
    </view>
  </view>
</template>

<script setup>
function go(url) {
  uni.navigateTo({ url });
}
</script>

<style scoped>
.container {
  padding: 24rpx;
}
.card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
}
.title {
  font-size: 34rpx;
  font-weight: bold;
  margin-bottom: 24rpx;
}
.btn {
  margin-bottom: 16rpx;
}
</style>
