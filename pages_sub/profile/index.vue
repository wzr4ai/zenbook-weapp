<template>
  <view class="page">
    <view class="card">
      <text class="card__title">账户</text>
      <view v-if="userStore.isLoggedIn">
        <text class="card__row">姓名：{{ userStore.userInfo?.name }}</text>
        <text class="card__row">角色：{{ userStore.userInfo?.role }}</text>
      </view>
      <view class="actions">
        <button
          type="primary"
          class="primary-btn"
          @tap="handleAuth"
        >
          {{ userStore.isLoggedIn ? '退出登录' : '微信授权登录' }}
        </button>
      </view>
    </view>

    <view class="card" v-if="userStore.isLoggedIn">
      <text class="card__title">快捷入口</text>
      <button class="link-btn" @tap="goPatients">就诊人管理</button>
      <button class="link-btn" @tap="goAppointments">我的预约</button>
      <button
        class="link-btn"
        v-if="userStore.isAdmin"
        @tap="goAdmin"
      >
        进入管理后台
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useUserStore } from '../../store/user'

const userStore = useUserStore()

const handleAuth = async () => {
  if (userStore.isLoggedIn) {
    userStore.logout()
    uni.showToast({ title: '已退出', icon: 'none' })
    return
  }
  await userStore.login()
}

const goPatients = () => {
  uni.navigateTo({ url: '/pages_sub/patients/index' })
}

const goAppointments = () => {
  uni.navigateTo({ url: '/pages_sub/appointments/index' })
}

const goAdmin = () => {
  uni.navigateTo({ url: '/pages_admin/dashboard/index' })
}
</script>

<style scoped lang="scss">
.page {
  padding: 32rpx;
}

.card {
  padding: 24rpx;
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 24rpx;

  &__title {
    font-size: 32rpx;
    font-weight: 600;
    margin-bottom: 12rpx;
  }

  &__row {
    display: block;
    color: #666;
    margin-bottom: 8rpx;
  }
}

.primary-btn {
  width: 100%;
  border-radius: 999px;
}

.link-btn {
  width: 100%;
  margin-top: 12rpx;
}
</style>
