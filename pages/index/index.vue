<template>
  <view class="container">
    <view class="section">
      <text class="label">地点</text>
      <picker :value="locationIndex" :range="locations" range-key="name" @change="onLocationChange">
        <view class="picker">{{ (selectedLocation && selectedLocation.name) || '请选择地点' }}</view>
      </picker>
    </view>

    <view class="section">
      <text class="label">技师</text>
      <picker :value="technicianIndex" :range="technicians" range-key="display_name" @change="onTechnicianChange">
        <view class="picker">{{ (selectedTechnician && selectedTechnician.display_name) || '请选择技师' }}</view>
      </picker>
    </view>

    <view class="section">
      <text class="label">服务</text>
      <picker :value="serviceIndex" :range="services" range-key="name" @change="onServiceChange">
        <view class="picker">{{ (selectedService && selectedService.name) || '请选择服务' }}</view>
      </picker>
    </view>

    <button type="primary" class="cta" :disabled="!canProceed" @click="toBooking">选择时间</button>
  </view>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import catalogApi from '../../api/catalog';
import { useBookingStore } from '../../store/booking';

const bookingStore = useBookingStore();
const locations = ref([]);
const technicians = ref([]);
const services = ref([]);

const selectedLocation = computed(() => bookingStore.selectedLocation);
const selectedTechnician = computed(() => bookingStore.selectedTechnician);
const selectedService = computed(() => bookingStore.selectedService);

const locationIndex = ref(0);
const technicianIndex = ref(0);
const serviceIndex = ref(0);

const canProceed = computed(() => selectedLocation.value && selectedTechnician.value && selectedService.value);

onMounted(async () => {
  const [locs, techs, svcs, offs] = await Promise.all([
    catalogApi.getLocations(),
    catalogApi.getTechnicians(),
    catalogApi.getServices(),
    catalogApi.getOfferings(),
  ]);
  locations.value = locs;
  technicians.value = techs;
  services.value = svcs;
  bookingStore.setOfferings(offs);
  bookingStore.resolveOffering();
});

function onLocationChange(e) {
  const idx = Number(e.detail.value);
  bookingStore.selectedLocation = locations.value[idx];
  locationIndex.value = idx;
  bookingStore.resolveOffering();
}

function onTechnicianChange(e) {
  const idx = Number(e.detail.value);
  bookingStore.selectedTechnician = technicians.value[idx];
  technicianIndex.value = idx;
  bookingStore.resolveOffering();
}

function onServiceChange(e) {
  const idx = Number(e.detail.value);
  bookingStore.selectedService = services.value[idx];
  serviceIndex.value = idx;
  bookingStore.resolveOffering();
}

function toBooking() {
  uni.navigateTo({ url: '/pages/booking/index' });
}
</script>

<style scoped>
.container {
  padding: 24rpx;
}
.section {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
}
.label {
  font-size: 28rpx;
  color: #666;
}
.picker {
  margin-top: 12rpx;
  font-size: 32rpx;
}
.cta {
  margin-top: 40rpx;
}
</style>
