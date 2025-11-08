<template>
  <scroll-view class="page" scroll-y @refresherrefresh="refresh" :refresher-enabled="true" :refresher-triggered="refreshing">
    <view v-if="appointments.length === 0 && !loading" class="empty">
      暂无预约记录，赶紧去体验吧～
    </view>
    <booking-card
      v-for="appointment in appointments"
      :key="appointment.id"
      :appointment="appointment"
      @tap="() => openDetail(appointment.id)"
    />
  </scroll-view>
</template>

<script setup lang="ts">
import { onShow } from "@dcloudio/uni-app";
import { ref } from "vue";
import BookingCard from "@/components/BookingCard.vue";
import { appointmentsApi, type Appointment } from "@/api/appointments";

const appointments = ref<Appointment[]>([]);
const loading = ref(false);
const refreshing = ref(false);

onShow(() => {
  loadAppointments();
});

async function loadAppointments() {
  loading.value = true;
  try {
    appointments.value = await appointmentsApi.listMine();
  } finally {
    loading.value = false;
  }
}

async function refresh() {
  refreshing.value = true;
  await loadAppointments();
  refreshing.value = false;
}

function openDetail(id: string) {
  uni.navigateTo({ url: `/pages_sub/appointment_detail/index?id=${id}` });
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 32rpx;
  background: #f5f6fa;
}

.empty {
  text-align: center;
  color: #999;
  padding: 80rpx 0;
}
</style>
