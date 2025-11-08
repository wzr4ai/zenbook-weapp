<template>
  <scroll-view class="page" scroll-y>
    <view class="card">
      <view class="card__header">预约信息</view>
      <view class="card__row">
        <text>服务</text>
        <text>{{ serviceName }}</text>
      </view>
      <view class="card__row">
        <text>技师</text>
        <text>{{ technicianName }}</text>
      </view>
      <view class="card__row">
        <text>时间</text>
        <text>{{ timeRange }}</text>
      </view>
    </view>

    <view class="card">
      <view class="card__header">就诊人</view>
      <picker
        mode="selector"
        :range="patients"
        range-key="name"
        :value="selectedPatientIndex"
        @change="onPatientChange"
      >
        <view class="picker-field">
          {{ patientLabel }}
        </view>
      </picker>
      <button class="ghost-btn" @tap="goPatients">管理就诊人</button>
    </view>

    <view class="card">
      <view class="card__header">备注</view>
      <textarea
        v-model="notes"
        class="textarea"
        placeholder="可选：告知体感/过敏/优惠码等"
      />
    </view>

    <button class="primary-btn" :loading="submitting" @tap="submit">
      提交预约
    </button>
  </scroll-view>
</template>

<script setup lang="ts">
import dayjs from "dayjs";
import { computed, onMounted, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { useBookingStore } from "@/store/booking";
import { useUserStore } from "@/store/user";
import { patientsApi, type Patient } from "@/api/patients";
import { appointmentsApi } from "@/api/appointments";

const bookingStore = useBookingStore();
const userStore = useUserStore();
const patients = ref<Patient[]>([]);
const selectedPatientId = ref<string | null>(null);
const notes = ref("");
const submitting = ref(false);

onShow(() => {
  if (!bookingStore.selectedSlot || !bookingStore.selectedOfferingId) {
    uni.redirectTo({ url: "/pages/index/index" });
    return;
  }
  if (!userStore.isAuthenticated) {
    uni.navigateTo({ url: "/pages_sub/profile/index" });
    return;
  }
});

onMounted(async () => {
  await loadPatients();
});

async function loadPatients() {
  try {
    patients.value = await patientsApi.list();
    if (patients.value.length > 0) {
      selectedPatientId.value = patients.value[0].id;
    }
  } catch (error) {
    console.error(error);
  }
}

const serviceName = computed(() => {
  if (!bookingStore.selectedServiceId) return "未选服务";
  return (
    bookingStore.services.find(
      (service) => service.id === bookingStore.selectedServiceId,
    )?.name ?? "未选服务"
  );
});

const technicianName = computed(() => {
  if (!bookingStore.selectedTechnicianId) return "未选技师";
  return (
    bookingStore.technicians.find(
      (tech) => tech.id === bookingStore.selectedTechnicianId,
    )?.name ?? "未选技师"
  );
});

const timeRange = computed(() => {
  if (!bookingStore.selectedSlot) return "未选时间";
  const start = dayjs(bookingStore.selectedSlot.start).format(
    "YYYY/MM/DD HH:mm",
  );
  const end = dayjs(bookingStore.selectedSlot.end).format("HH:mm");
  return `${start} - ${end}`;
});

const selectedPatientIndex = computed(() =>
  patients.value.findIndex((item) => item.id === selectedPatientId.value),
);

const patientLabel = computed(() => {
  const patient = patients.value.find(
    (item) => item.id === selectedPatientId.value,
  );
  return patient?.name ?? "请选择就诊人";
});

type PickerChangeEvent = { detail: { value: number | string } };

function onPatientChange(event: PickerChangeEvent) {
  const index = Number(event.detail.value ?? 0);
  selectedPatientId.value = patients.value[index]?.id ?? null;
}

async function submit() {
  if (!bookingStore.selectedSlot || !bookingStore.selectedOfferingId) {
    uni.showToast({ title: "请选择预约信息", icon: "none" });
    return;
  }
  if (!selectedPatientId.value) {
    uni.showToast({ title: "请选择就诊人", icon: "none" });
    return;
  }
  submitting.value = true;
  try {
    await appointmentsApi.create({
      offering_id: bookingStore.selectedOfferingId,
      patient_id: selectedPatientId.value,
      start_time: bookingStore.selectedSlot.start,
      notes: notes.value,
    });
    uni.showToast({ title: "预约成功", icon: "success" });
    bookingStore.reset();
    uni.redirectTo({ url: "/pages_sub/appointments/index" });
  } finally {
    submitting.value = false;
  }
}

function goPatients() {
  uni.navigateTo({
    url: "/pages_sub/patients/index",
  });
}
</script>

<style scoped>
.page {
  height: 100vh;
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
  margin-bottom: 16rpx;
}

.card__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 28rpx;
  padding: 16rpx 0;
  border-bottom: 2rpx solid #f7f7f7;
}

.card__row:last-child {
  border-bottom: none;
}

.picker-field {
  border: 2rpx solid #e5e5e5;
  border-radius: 24rpx;
  padding: 20rpx;
  color: #333;
  margin-bottom: 24rpx;
}

.textarea {
  border: 2rpx solid #e5e5e5;
  border-radius: 24rpx;
  padding: 20rpx;
  min-height: 160rpx;
  font-size: 28rpx;
}

.primary-btn {
  background: #04c1a1;
  color: #fff;
  border-radius: 999rpx;
  padding: 24rpx 0;
  font-size: 30rpx;
}

.ghost-btn {
  border-radius: 999rpx;
  border: 2rpx solid #04c1a1;
  color: #04c1a1;
  padding: 20rpx 0;
  margin-top: 12rpx;
}
</style>
