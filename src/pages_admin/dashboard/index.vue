<template>
  <scroll-view class="page" scroll-y>
    <view class="card filters">
      <view class="filters__row">
        <text>日期</text>
        <picker mode="date" :value="filterDate" @change="onDateChange">
          <view class="picker-field">{{ filterDate }}</view>
        </picker>
      </view>
      <button class="primary-btn" @tap="loadAppointments">刷新数据</button>
      <button class="ghost-btn" @tap="goCreate">手动创建预约</button>
    </view>

    <view v-if="loading" class="empty">加载中...</view>
    <view v-else-if="appointments.length === 0" class="empty">
      暂无预约
    </view>

    <booking-card
      v-for="appointment in appointments"
      :key="appointment.id"
      :appointment="appointment"
    >
      <view class="badge">由 {{ appointment.booked_by_role || "customer" }}</view>
    </booking-card>
  </scroll-view>
</template>

<script setup lang="ts">
import dayjs from "dayjs";
import { ref } from "vue";
import BookingCard from "@/components/BookingCard.vue";
import { appointmentsApi, type Appointment } from "@/api/appointments";

const appointments = ref<Appointment[]>([]);
const loading = ref(false);
const filterDate = ref(dayjs().format("YYYY-MM-DD"));

async function loadAppointments() {
  loading.value = true;
  try {
    appointments.value = await appointmentsApi.listAdmin({
      date: filterDate.value,
    });
  } finally {
    loading.value = false;
  }
}

function onDateChange(event: { detail: { value: string } }) {
  filterDate.value = event.detail.value;
  loadAppointments();
}

function goCreate() {
  uni.navigateTo({ url: "/pages_admin/appt_create/index" });
}

loadAppointments();
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

.filters__row {
  margin-bottom: 16rpx;
}

.picker-field {
  border: 2rpx solid #e5e5e5;
  border-radius: 24rpx;
  padding: 20rpx;
}

.primary-btn,
.ghost-btn {
  width: 100%;
  border-radius: 24rpx;
  padding: 18rpx 0;
  font-size: 28rpx;
  margin-top: 16rpx;
}

.primary-btn {
  background: #1677ff;
  color: #fff;
}

.ghost-btn {
  border: 2rpx solid #1677ff;
  color: #1677ff;
  background: #fff;
}

.badge {
  margin-top: 12rpx;
  font-size: 24rpx;
  color: #999;
}

.empty {
  text-align: center;
  padding: 40rpx 0;
  color: #888;
}
</style>
