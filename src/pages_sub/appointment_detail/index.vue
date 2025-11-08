<template>
  <view class="page" v-if="appointment">
    <view class="card">
      <view class="card__header">预约详情</view>
      <view class="row">
        <text>服务</text>
        <text>{{ appointment.service_name }}</text>
      </view>
      <view class="row">
        <text>技师</text>
        <text>{{ appointment.technician_name }}</text>
      </view>
      <view class="row">
        <text>地点</text>
        <text>{{ appointment.location_name }}</text>
      </view>
      <view class="row">
        <text>时间</text>
        <text>{{ timeRange }}</text>
      </view>
      <view class="row">
        <text>备注</text>
        <text>{{ appointment.notes || "无" }}</text>
      </view>
    </view>

    <button
      v-if="appointment.status === 'scheduled'"
      class="ghost-btn"
      @tap="cancelAppointment"
      :loading="cancelling"
    >
      取消预约
    </button>
  </view>
  <view v-else class="empty">正在加载预约详情...</view>
</template>

<script setup lang="ts">
import dayjs from "dayjs";
import { computed, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { appointmentsApi, type Appointment } from "@/api/appointments";

const appointment = ref<Appointment | null>(null);
const cancelling = ref(false);
let appointmentId = "";

const timeRange = computed(() => {
  if (!appointment.value) return "";
  const start = dayjs(appointment.value.start_time).format("YYYY/MM/DD HH:mm");
  const end = dayjs(appointment.value.end_time).format("HH:mm");
  return `${start} - ${end}`;
});

onLoad(async (query) => {
  if (!query?.id) {
    uni.showToast({ title: "缺少预约ID", icon: "none" });
    return;
  }
  appointmentId = String(query.id);
  await loadDetail();
});

async function loadDetail() {
  appointment.value = await appointmentsApi.getDetail(appointmentId);
}

async function cancelAppointment() {
  if (!appointmentId) return;
  const confirmRes = await new Promise<UniApp.ShowModalRes>((resolve) => {
    uni.showModal({
      title: "确认取消",
      content: "取消后该时间将释放给其他用户",
      success: resolve,
    });
  });
  if (!confirmRes.confirm) return;
  cancelling.value = true;
  try {
    await appointmentsApi.cancel(appointmentId);
    await loadDetail();
    uni.showToast({ title: "已取消", icon: "success" });
  } finally {
    cancelling.value = false;
  }
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
  margin-bottom: 12rpx;
}

.row {
  display: flex;
  justify-content: space-between;
  padding: 18rpx 0;
  border-bottom: 2rpx solid #f5f5f5;
  color: #444;
}

.row:last-child {
  border-bottom: none;
}

.ghost-btn {
  border: 2rpx solid #c94b4b;
  color: #c94b4b;
  border-radius: 999rpx;
  padding: 24rpx 0;
  font-size: 30rpx;
  background: #fff;
}

.empty {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #999;
}
</style>
