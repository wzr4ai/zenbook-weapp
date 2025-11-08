<template>
  <scroll-view class="page" scroll-y>
    <view class="card">
      <view class="card__header">选择服务</view>
      <picker
        mode="selector"
        :range="offeringLabels"
        :value="selectedOfferingIndex"
        @change="onOfferingChange"
      >
        <view class="picker-field">
          {{ offeringLabel }}
        </view>
      </picker>
      <view class="form-group">
        <text>日期</text>
        <picker mode="date" :value="date" @change="onDateChange">
          <view class="picker-field">{{ date }}</view>
        </picker>
      </view>
      <view class="form-group">
        <text>时间</text>
        <picker mode="time" :value="time" @change="onTimeChange">
          <view class="picker-field">{{ time }}</view>
        </picker>
      </view>
    </view>

    <view class="card">
      <view class="card__header">就诊人</view>
      <view class="form-group">
        <text>就诊人 ID</text>
        <input v-model="patientId" placeholder="已有就诊人ID（可选）" />
      </view>
      <view class="form-group">
        <text>临时姓名</text>
        <input v-model="patientName" placeholder="无ID时填写，用于手动预约" />
      </view>
      <view class="form-group">
        <text>备注</text>
        <textarea v-model="notes" placeholder="可选" />
      </view>
    </view>

    <button class="primary-btn" :loading="submitting" @tap="createAppointment">
      提交预约
    </button>
  </scroll-view>
</template>

<script setup lang="ts">
import dayjs from "dayjs";
import { computed, onMounted, ref } from "vue";
import { useBookingStore } from "@/store/booking";
import { appointmentsApi } from "@/api/appointments";

const bookingStore = useBookingStore();
const date = ref(dayjs().format("YYYY-MM-DD"));
const time = ref("09:00");
const selectedOfferingId = ref<string | null>(null);
const patientId = ref("");
const patientName = ref("");
const notes = ref("");
const submitting = ref(false);

onMounted(async () => {
  if (!bookingStore.offerings.length) {
    await bookingStore.loadCatalog();
  }
  selectedOfferingId.value = bookingStore.offerings[0]?.id ?? null;
});

const offeringLabels = computed(() =>
  bookingStore.offerings.map((offering) => {
    const serviceName =
      bookingStore.services.find((s) => s.id === offering.service_id)?.name ??
      "服务";
    const technicianName =
      bookingStore.technicians.find((t) => t.id === offering.technician_id)
        ?.name ?? "技师";
    const locationName =
      bookingStore.locations.find((l) => l.id === offering.location_id)?.name ??
      "地点";
    return `${serviceName} · ${technicianName} @ ${locationName}`;
  }),
);

const selectedOfferingIndex = computed(() =>
  bookingStore.offerings.findIndex((item) => item.id === selectedOfferingId.value),
);

const offeringLabel = computed(() => {
  const index = selectedOfferingIndex.value;
  return offeringLabels.value[index] ?? "请选择服务";
});

function onOfferingChange(event: { detail: { value: string } }) {
  const index = Number(event.detail.value ?? 0);
  selectedOfferingId.value = bookingStore.offerings[index]?.id ?? null;
}

function onDateChange(event: { detail: { value: string } }) {
  date.value = event.detail.value;
}

function onTimeChange(event: { detail: { value: string } }) {
  time.value = event.detail.value;
}

async function createAppointment() {
  if (!selectedOfferingId.value) {
    uni.showToast({ title: "请选择服务", icon: "none" });
    return;
  }

  const startTime = dayjs(`${date.value} ${time.value}`).toISOString();
  submitting.value = true;
  try {
    await appointmentsApi.createAdmin({
      offering_id: selectedOfferingId.value,
      patient_id: patientId.value || undefined,
      patient_name: patientName.value || undefined,
      start_time: startTime,
      notes: notes.value || undefined,
    });
    uni.showToast({ title: "创建成功", icon: "success" });
    uni.navigateBack();
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 32rpx;
  background: #f0f2f5;
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
  margin-bottom: 20rpx;
}

.picker-field {
  border: 2rpx solid #e5e5e5;
  border-radius: 24rpx;
  padding: 20rpx;
  margin-bottom: 12rpx;
}

.form-group {
  margin-bottom: 20rpx;
}

.form-group text {
  display: block;
  margin-bottom: 8rpx;
  color: #555;
}

input,
textarea {
  border: 2rpx solid #e4e4e4;
  border-radius: 24rpx;
  padding: 20rpx;
  font-size: 28rpx;
}

textarea {
  min-height: 140rpx;
}

.primary-btn {
  background: #1677ff;
  color: #fff;
  border-radius: 999rpx;
  padding: 26rpx 0;
  font-size: 30rpx;
}
</style>
