<template>
  <view class="page">
    <view class="profile-card">
      <view class="profile-card__info">
        <text
          class="profile-card__name"
          :class="{ 'profile-card__name--editable': userStore.isLoggedIn }"
          @tap="promptDisplayName"
        >
          {{ userStore.userInfo?.display_name || '未登录' }}
        </text>
        <text class="profile-card__role">
          {{ roleLabel }}
        </text>
      </view>
      <button
        v-if="!userStore.isLoggedIn"
        type="primary"
        size="mini"
        class="profile-card__btn"
        @tap="handleAuth"
      >
        微信授权登录
      </button>
    </view>

    <view class="panel">
      <text class="panel__title">常用功能</text>
      <button class="panel-btn" @tap="goAppointments">我的预约</button>
      <button class="panel-btn" @tap="goPatients">就诊人管理</button>
    </view>

    <view class="panel" v-if="userStore.isStaffView">
      <text class="panel__title">管理入口</text>
      <button class="panel-btn" @tap="goDashboard">预约看板</button>
      <button class="panel-btn" @tap="goApptCreate">手动预约</button>
      <button class="panel-btn" @tap="goSchedule">排班管理</button>
      <button class="panel-btn" @tap="goCatalog">服务管理</button>
      <button class="panel-btn" @tap="goUsers">账户/就诊人</button>
    </view>

    <view class="panel" v-if="userStore.actualRole === 'admin'">
      <text class="panel__title">身份切换 (仅前端视图)</text>
      <view class="role-switch">
        <button
          v-for="role in roleOptions"
          :key="role.value"
          class="role-switch__btn"
          :class="{ 'role-switch__btn--active': role.value === userStore.viewRole }"
          size="mini"
          @tap="() => switchRole(role.value)"
        >
          {{ role.label }}
        </button>
      </view>
      <text class="role-switch__hint">
        切换后仅影响前端菜单/体验，接口权限仍按真实身份。
      </text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '../../store/user'

const userStore = useUserStore()

const roleMap: Record<string, string> = {
  admin: '管理员',
  technician: '技师',
  customer: '客户'
}

const roleOptions = [
  { value: 'admin', label: '管理员' },
  { value: 'technician', label: '技师' },
  { value: 'customer', label: '客户' }
]

const roleLabel = computed(() => {
  if (!userStore.isLoggedIn) {
    return '点击授权登录'
  }
  return `${roleMap[userStore.viewRole] || '客户'}视角`
})

const handleAuth = async () => {
  if (!userStore.isLoggedIn) {
    await userStore.login()
  }
}

const promptDisplayName = () => {
  if (!userStore.isLoggedIn) {
    return
  }
  uni.showModal({
    title: '修改昵称',
    editable: true,
    placeholderText: '请输入昵称',
    content: userStore.userInfo?.display_name || '',
    success: async ({ confirm, content }) => {
      if (!confirm) return
      const next = (content || '').trim()
      if (!next) {
        uni.showToast({ title: '昵称不能为空', icon: 'none' })
        return
      }
      await userStore.updateDisplayName(next)
    }
  })
}

const goAppointments = () => {
  uni.navigateTo({ url: '/pages_sub/appointments/index' })
}

const goPatients = () => {
  uni.navigateTo({ url: '/pages_sub/patients/index' })
}

const goDashboard = () => {
  uni.navigateTo({ url: '/pages_admin/dashboard/index' })
}
const goApptCreate = () => {
  uni.navigateTo({ url: '/pages_admin/appt_create/index' })
}
const goSchedule = () => {
  uni.navigateTo({ url: '/pages_admin/schedule_mgmt/index' })
}
const goCatalog = () => {
  uni.navigateTo({ url: '/pages_admin/catalog_mgmt/index' })
}
const goUsers = () => {
  uni.navigateTo({ url: '/pages_admin/user_mgmt/index' })
}

const switchRole = (role: string) => {
  if (role === userStore.viewRole) {
    return
  }
  userStore.setImpersonateRole(role === userStore.actualRole ? '' : role)
  const label = role === userStore.actualRole ? '真实身份' : roleMap[role]
  uni.showToast({ title: `已切换到${label}`, icon: 'none' })
}
</script>

<style scoped lang="scss">
.page {
  padding: 32rpx;
}

.profile-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 28rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
  box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.05);

  &__name {
    font-size: 40rpx;
    font-weight: 600;
  }

  &__role {
    font-size: 26rpx;
    color: #888;
  }

  &__btn {
    border-radius: 999px;
  }
}

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

.panel-btn {
  margin-bottom: 16rpx;
  border-radius: 12rpx;
}

.profile-card__name--editable {
  border-bottom: 2rpx dashed rgba(0, 0, 0, 0.1);
}

.role-switch {
  display: flex;
  gap: 16rpx;
  flex-wrap: wrap;
  margin-top: 8rpx;

  &__btn {
    flex: 1;
    border-radius: 999px;
    border: 2rpx solid #ccc;
    background: #f5f6fb;

    &--active {
      border-color: #007aff;
      color: #007aff;
      background: rgba(0, 122, 255, 0.1);
    }
  }

  &__hint {
    display: block;
    margin-top: 12rpx;
    font-size: 24rpx;
    color: #999;
  }
}
</style>
