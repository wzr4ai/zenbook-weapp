<template>
  <view class="page" v-if="detail">
    <view class="panel">
      <text class="panel__title">预约详情</text>
      <text class="row">服务：{{ detail.service_name }}</text>
      <text class="row">技师：{{ detail.technician_name }}</text>
      <text class="row">地点：{{ detail.location_name }}</text>
      <text class="row">
        时间：{{ detail.start_time }} - {{ detail.end_time }}
      </text>
      <text class="row">状态：{{ detail.status }}</text>
      <text class="row">备注：{{ detail.notes || '无' }}</text>
    </view>
    <button
      v-if="detail.status === 'scheduled'"
      class="primary-btn"
      type="warn"
      @tap="handleCancel"
    >
      取消预约
    </button>
  </view>
  <view class="page" v-else>
    <view class="empty">正在加载预约详情</view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { listMyAppointments, cancelAppointment } from '../../api/appointments'

const detail = ref<any | null>(null)
const currentId = ref('')

const fetchDetail = async (id: string) => {
  const items = await listMyAppointments()
  detail.value = items.find((item) => item.id === id) ?? null
}

const handleCancel = () => {
  uni.showModal({
    title: '取消预约',
    content: '确认取消该预约？',
    success: async ({ confirm }) => {
      if (!confirm) return
      await cancelAppointment(currentId.value)
      uni.showToast({ title: '已取消', icon: 'none' })
      fetchDetail(currentId.value)
    }
  })
}

onLoad((options) => {
  const id = (options?.id as string) || ''
  if (!id) {
    uni.showToast({ title: '缺少预约ID', icon: 'none' })
    return
  }
  currentId.value = id
  fetchDetail(id)
})
</script>

<style scoped lang="scss">
.page {
  padding: 32rpx;
}

.panel {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
}

.panel__title {
  font-size: 32rpx;
  font-weight: 600;
  margin-bottom: 16rpx;
}

.row {
  display: block;
  margin-bottom: 12rpx;
  color: #666;
}

.primary-btn {
  width: 100%;
  margin-top: 32rpx;
}

.empty {
  text-align: center;
  margin-top: 120rpx;
  color: #999;
}
</style>
