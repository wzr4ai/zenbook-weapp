<template>
  <view class="page">
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
        <button class="shortcut" @tap="goApptCreate">手动预约</button>
        <button class="shortcut" @tap="goSchedule">排班管理</button>
        <button class="shortcut" @tap="goCatalog">服务管理</button>
        <button class="shortcut" @tap="goUsers">账户/就诊人</button>
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
      >
        <view class="card-actions">
          <button size="mini" @tap.stop="edit(item.id)">编辑</button>
        </view>
      </BookingCard>
      <view v-if="!appointments.length" class="empty">
        暂无预约，换个日期试试
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import BookingCard from '../../components/BookingCard.vue'
import { listAllAppointments } from '../../api/appointments'

const appointments = ref<any[]>([])

const fetchAppointments = async () => {
  appointments.value = await listAllAppointments()
}

const todayCount = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return appointments.value.filter(
    (item) => item.start_time?.split('T')[0] === today
  ).length
})
const pendingCount = computed(
  () => appointments.value.filter((item) => item.status === 'scheduled').length
)
const cancelledCount = computed(
  () => appointments.value.filter((item) => item.status === 'cancelled').length
)

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

onShow(fetchAppointments)
</script>

<style scoped lang="scss">
.page {
  padding: 32rpx;
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
