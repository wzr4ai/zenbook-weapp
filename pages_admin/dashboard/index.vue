<template>
  <view class="page">
    <AdminDashboardPanel
      :appointments="appointments"
      :today-count="todayCount"
      :pending-count="pendingCount"
      :cancelled-count="cancelledCount"
      @create="goApptCreate"
      @schedule="goSchedule"
      @catalog="goCatalog"
      @users="goUsers"
      @edit="edit"
    />
  </view>
</template>

<script setup lang="ts">
import AdminDashboardPanel from '../../components/AdminDashboardPanel.vue'
import { useAdminDashboard } from '../../composables/useAdminDashboard'

const {
  appointments,
  todayCount,
  pendingCount,
  cancelledCount
} = useAdminDashboard()

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

const edit = (id: string) => {
  uni.navigateTo({ url: `/pages_admin/appt_create/index?id=${id}` })
}
</script>

<style scoped lang="scss">
.page {
  padding: 32rpx;
}
</style>
