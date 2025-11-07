<template>
  <view class="container">
    <view v-for="patient in patients" :key="patient.patient_id" class="card">
      <view class="name">{{ patient.full_name }}</view>
      <view class="phone">{{ patient.phone_number || '-' }}</view>
    </view>

    <button type="primary" class="cta" @click="refresh">刷新列表</button>
  </view>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import usersApi from '../../api/users';

const patients = ref([]);

onMounted(refresh);

async function refresh() {
  patients.value = await usersApi.listPatients();
}
</script>

<style scoped>
.container {
  padding: 24rpx;
}
.card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
}
.name {
  font-size: 32rpx;
  font-weight: bold;
}
.phone {
  color: #999;
}
.cta {
  margin-top: 24rpx;
}
</style>
