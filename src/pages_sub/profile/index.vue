<template>
  <view class="page">
    <view class="card">
      <view class="card__header">账户信息</view>
      <view v-if="userStore.isAuthenticated" class="profile">
        <image
          class="avatar"
          :src="userStore.userInfo?.avatar_url || defaultAvatar"
          mode="aspectFill"
        />
        <view class="profile__info">
          <text class="profile__name">{{ userStore.userInfo?.name }}</text>
          <text class="profile__role">角色：{{ roleLabel }}</text>
        </view>
      </view>
      <view v-else class="empty">尚未登录，请先完成微信授权</view>
      <button class="primary-btn" @tap="handleLogin" v-if="!userStore.isAuthenticated">
        微信一键登录
      </button>
      <button class="ghost-btn" v-else @tap="userStore.logout">
        退出登录
      </button>
    </view>

    <view class="card">
      <view class="card__header">常用操作</view>
      <button class="link-btn" @tap="openAppointments">我的预约</button>
      <button class="link-btn" @tap="openPatients">就诊人管理</button>
      <button
        v-if="userStore.isAdmin"
        class="link-btn link-btn--highlight"
        @tap="openAdmin"
      >
        进入管理后台
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useUserStore } from "@/store/user";

const userStore = useUserStore();
const defaultAvatar =
  "https://static-ryf.s3.aliyuncs.com/zenbook/avatar-placeholder.png";

const roleLabel = computed(() => {
  switch (userStore.userInfo?.role) {
    case "admin":
      return "管理员";
    case "technician":
      return "技师";
    case "customer":
      return "客户";
    default:
      return "未知";
  }
});

async function handleLogin() {
  if (userStore.loading) return;
  try {
    await userStore.login();
  } catch (error) {
    console.error(error);
  }
}

function openAppointments() {
  uni.navigateTo({ url: "/pages_sub/appointments/index" });
}

function openPatients() {
  uni.navigateTo({ url: "/pages_sub/patients/index" });
}

function openAdmin() {
  uni.navigateTo({ url: "/pages_admin/dashboard/index" });
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 32rpx;
  background: #f5f6fa;
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
  margin-bottom: 20rpx;
}

.profile {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
}

.avatar {
  width: 110rpx;
  height: 110rpx;
  border-radius: 50%;
  background: #f3f3f3;
  margin-right: 24rpx;
}

.profile__name {
  font-size: 32rpx;
  font-weight: 600;
}

.profile__role {
  color: #777;
  margin-top: 8rpx;
}

.empty {
  padding: 32rpx 0;
  text-align: center;
  color: #999;
}

.primary-btn,
.ghost-btn {
  width: 100%;
  border-radius: 999rpx;
  padding: 24rpx 0;
  font-size: 30rpx;
}

.primary-btn {
  background: #04c1a1;
  color: #fff;
}

.ghost-btn {
  border: 2rpx solid #04c1a1;
  color: #04c1a1;
  background: #fff;
}

.link-btn {
  width: 100%;
  border-radius: 24rpx;
  padding: 20rpx;
  margin-bottom: 16rpx;
  text-align: left;
  background: #f6f6f6;
  color: #333;
}

.link-btn--highlight {
  background: #fff7e6;
  color: #ad6800;
}
</style>
