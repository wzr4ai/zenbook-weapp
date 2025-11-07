<template>
  <view class="container">
    <view class="section">
      <text class="title">预约信息</text>
      <view>地点：{{ bookingStore.selectedLocation?.name }}</view>
      <view>技师：{{ bookingStore.selectedTechnician?.display_name }}</view>
      <view>服务：{{ bookingStore.selectedService?.name }}</view>
      <view>时间：{{ slotText }}</view>
    </view>

    <view class="section">
      <text class="title">就诊人</text>
      <picker :value="patientIndex" :range="patients" range-key="full_name" @change="onPatientChange">
        <view class="picker">{{ currentPatient?.full_name || '请选择就诊人' }}</view>
      </picker>
    </view>

    <button type="primary" class="cta" :disabled="!currentPatient" @click="submit">提交预约</button>
  </view>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import dayjs from '../../shared/dayjs-lite';
import appointmentsApi from '../../api/appointments';
import usersApi from '../../api/users';
import { useBookingStore } from '../../store/booking';

const bookingStore = useBookingStore();
const patients = ref([]);
const patientIndex = ref(0);

const slotText = computed(() => {
  if (!bookingStore.selectedSlot) return '';
  return `${dayjs(bookingStore.selectedSlot.start).format('MM-DD HH:mm')} - ${dayjs(bookingStore.selectedSlot.end).format(
    'HH:mm',
  )}`;
});

const currentPatient = computed(() => patients.value[patientIndex.value]);

onMounted(async () => {
  const list = await usersApi.listPatients();
  patients.value = list;
  if (list.length) {
    bookingStore.selectedPatientId = list[0].patient_id;
  }
});

function onPatientChange(e) {
  patientIndex.value = Number(e.detail.value);
  bookingStore.selectedPatientId = patients.value[patientIndex.value]?.patient_id;
}

async function submit() {
  if (!bookingStore.selectedSlot || !bookingStore.selectedPatientId || !bookingStore.selectedOffering) {
    uni.showToast({ title: '缺少必要信息', icon: 'none' });
    return;
  }
  await appointmentsApi.create({
    offering_id: bookingStore.selectedOffering?.offering_id,
    patient_id: bookingStore.selectedPatientId,
    start_time: bookingStore.selectedSlot.start,
    notes: '',
  });
  uni.showToast({ title: '预约成功' });
  bookingStore.resetSelections();
  uni.reLaunch({ url: '/pages/index/index' });
}
</script>

<style scoped>
.container {
  padding: 24rpx;
}
.section {
  background: #fff;
  padding: 24rpx;
  border-radius: 16rpx;
  margin-bottom: 24rpx;
}
.title {
  font-size: 32rpx;
  margin-bottom: 12rpx;
  display: block;
}
.cta {
  margin-top: 40rpx;
}
</style>
