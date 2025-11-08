<template>
  <scroll-view class="page" scroll-y>
    <view class="hero">
      <text class="hero__eyebrow">ZenBook</text>
      <text class="hero__title">选择服务，开启舒缓身心的预约行程</text>
      <text class="hero__subtitle">三步完成预约 · 实时排班同步</text>
    </view>

    <view class="card">
      <view class="card__section">
        <text class="section__title">地点</text>
        <picker
          mode="selector"
          :range="bookingStore.locations"
          range-key="name"
          :value="currentLocationIndex"
          @change="onLocationChange"
        >
          <view class="picker-field">
            {{ locationLabel }}
          </view>
        </picker>
      </view>
      <view class="card__section">
        <text class="section__title">技师</text>
        <picker
          mode="selector"
          :range="bookingStore.technicians"
          range-key="name"
          :value="currentTechnicianIndex"
          @change="onTechnicianChange"
        >
          <view class="picker-field">
            {{ technicianLabel }}
          </view>
        </picker>
      </view>
      <view class="card__section">
        <text class="section__title">服务</text>
        <picker
          mode="selector"
          :range="bookingStore.services"
          range-key="name"
          :value="currentServiceIndex"
          @change="onServiceChange"
        >
          <view class="picker-field">
            {{ serviceLabel }}
          </view>
        </picker>
      </view>
    </view>

    <view class="card card--actions">
      <button
        class="primary-btn"
        :disabled="!bookingStore.hasSelection"
        @tap="goBooking"
      >
        查看可用时间
      </button>
      <button class="ghost-btn" @tap="goProfile">管理预约 / 登录</button>
    </view>
  </scroll-view>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from "vue";
import { useBookingStore } from "@/store/booking";

const bookingStore = useBookingStore();

onMounted(() => {
  bookingStore.loadCatalog();
});

function syncOffering() {
  if (!bookingStore.hasSelection) {
    bookingStore.setSelection({ offeringId: null });
    return;
  }
  const match = bookingStore.offerings.find(
    (offering) =>
      offering.location_id === bookingStore.selectedLocationId &&
      offering.technician_id === bookingStore.selectedTechnicianId &&
      offering.service_id === bookingStore.selectedServiceId,
  );
  bookingStore.setSelection({ offeringId: match?.id ?? null });
}

watch(
  () => [
    bookingStore.selectedLocationId,
    bookingStore.selectedTechnicianId,
    bookingStore.selectedServiceId,
    bookingStore.offerings,
  ],
  () => syncOffering(),
  { deep: true },
);

const locationLabel = computed(() => {
  const location = bookingStore.locations.find(
    (item) => item.id === bookingStore.selectedLocationId,
  );
  return location?.name ?? "请选择地点";
});
const technicianLabel = computed(() => {
  const technician = bookingStore.technicians.find(
    (item) => item.id === bookingStore.selectedTechnicianId,
  );
  return technician?.name ?? "请选择技师";
});
const serviceLabel = computed(() => {
  const service = bookingStore.services.find(
    (item) => item.id === bookingStore.selectedServiceId,
  );
  return service?.name ?? "请选择服务";
});

const currentLocationIndex = computed(() =>
  bookingStore.locations.findIndex(
    (item) => item.id === bookingStore.selectedLocationId,
  ),
);
const currentTechnicianIndex = computed(() =>
  bookingStore.technicians.findIndex(
    (item) => item.id === bookingStore.selectedTechnicianId,
  ),
);
const currentServiceIndex = computed(() =>
  bookingStore.services.findIndex(
    (item) => item.id === bookingStore.selectedServiceId,
  ),
);

type PickerChangeEvent = { detail: { value: number | string } };

function onLocationChange(event: PickerChangeEvent) {
  const index = Number(event.detail.value ?? 0);
  const location = bookingStore.locations[index];
  bookingStore.setSelection({ locationId: location?.id ?? null });
}

function onTechnicianChange(event: PickerChangeEvent) {
  const index = Number(event.detail.value ?? 0);
  const technician = bookingStore.technicians[index];
  bookingStore.setSelection({ technicianId: technician?.id ?? null });
}

function onServiceChange(event: PickerChangeEvent) {
  const index = Number(event.detail.value ?? 0);
  const service = bookingStore.services[index];
  bookingStore.setSelection({ serviceId: service?.id ?? null });
}

function goBooking() {
  if (!bookingStore.hasSelection || !bookingStore.selectedOfferingId) {
    uni.showToast({
      title: "请先完成地点/技师/服务选择",
      icon: "none",
    });
    return;
  }
  uni.navigateTo({ url: "/pages/booking/index" });
}

function goProfile() {
  uni.navigateTo({ url: "/pages_sub/profile/index" });
}
</script>

<style scoped>
.page {
  height: 100vh;
  padding: 32rpx;
  background: linear-gradient(180deg, #ebfffb 0%, #f6f7fb 100%);
}

.hero {
  margin-bottom: 32rpx;
}

.hero__eyebrow {
  font-size: 26rpx;
  color: #04c1a1;
}

.hero__title {
  display: block;
  font-size: 40rpx;
  font-weight: 600;
  color: #1a1a1a;
  margin: 12rpx 0;
}

.hero__subtitle {
  color: #6b6b6b;
  font-size: 28rpx;
}

.card {
  background: #fff;
  border-radius: 32rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 12rpx 24rpx rgba(4, 193, 161, 0.08);
}

.card__section + .card__section {
  margin-top: 28rpx;
}

.section__title {
  font-size: 28rpx;
  font-weight: 500;
  margin-bottom: 12rpx;
  display: block;
}

.picker-field {
  border: 2rpx solid #f0f0f0;
  border-radius: 24rpx;
  padding: 20rpx 24rpx;
  color: #333;
}

.card--actions button + button {
  margin-top: 24rpx;
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
  padding: 24rpx 0;
  background: #fff;
  font-size: 30rpx;
}
</style>
