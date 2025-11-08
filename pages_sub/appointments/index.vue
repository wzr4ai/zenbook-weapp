<template>
  <view class="page">
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
      @tap="goDetail(item.id)"
    >
      <view class="card-actions">
        <button
          size="mini"
          type="warn"
          v-if="item.status === 'scheduled'"
          @tap.stop="cancel(item.id)"
        >
          取消
        </button>
        <button
          size="mini"
          @tap.stop="goDetail(item.id)"
        >
          查看详情
        </button>
      </view>
    </BookingCard>
    <view v-if="!appointments.length" class="empty">
      暂无预约，先去首页试试吧～
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app'
import BookingCard from '../../components/BookingCard.vue'
import { listMyAppointments, cancelAppointment } from '../../api/appointments'

const appointments = ref<any[]>([])

const fetchAppointments = async () => {
  appointments.value = await listMyAppointments()
  uni.stopPullDownRefresh()
}

const goDetail = (id: string) => {
  uni.navigateTo({ url: `/pages_sub/appointment_detail/index?id=${id}` })
}

const cancel = (id: string) => {
  uni.showModal({
    title: '取消预约',
    content: '确定取消该预约吗？',
    success: async ({ confirm }) => {
      if (!confirm) return
      await cancelAppointment(id)
      uni.showToast({ title: '已取消', icon: 'none' })
      fetchAppointments()
    }
  })
}

onShow(fetchAppointments)
onPullDownRefresh(fetchAppointments)
</script>

<style scoped lang="scss">
.page {
  padding: 32rpx;
}

.card-actions {
  margin-top: 12rpx;
  display: flex;
  gap: 12rpx;
}

.empty {
  text-align: center;
  color: #aaa;
  margin-top: 120rpx;
}
</style>
