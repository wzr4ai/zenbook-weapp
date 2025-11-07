<template>
  <view class="container">
    <view class="card">
      <text class="name">{{ (userStore.userInfo && userStore.userInfo.display_name) || '未登录' }}</text>
      <text class="role">{{ userStore.role || '-' }}</text>
    </view>

    <button type="primary" @click="handleLogin" v-if="!userStore.token">微信一键登录</button>
    <button type="default" @click="userStore.logout" v-else>退出登录</button>

    <button v-if="userStore.isAdmin" class="admin" @click="goAdmin">进入管理后台</button>
  </view>
</template>

<script setup>
import { useUserStore } from '../../store/user';

const userStore = useUserStore();

async function handleLogin() {
  try {
    await userStore.login();
  } catch (error) {
    const message = (error && error.message) || '登录失败';
    uni.showToast({ title: message, icon: 'none' });
  }
}

function goAdmin() {
  uni.navigateTo({ url: '/pages_admin/dashboard/index' });
}
</script>

<style scoped>
.container {
  padding: 24rpx;
}
.card {
  background: #fff;
  padding: 32rpx;
  border-radius: 16rpx;
  margin-bottom: 24rpx;
}
.name {
  font-size: 36rpx;
  font-weight: bold;
}
.role {
  display: block;
  margin-top: 12rpx;
  color: #999;
}
.admin {
  margin-top: 24rpx;
}
</style>
