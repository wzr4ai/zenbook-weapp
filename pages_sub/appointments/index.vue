<template>
  <view class="container">
    <view v-for="item in appointments" :key="item.id" class="card">
      <view class="row">
        <text>{{ format(item.start_time) }}</text>
        <text class="status">{{ item.status }}</text>
      </view>
      <view>{{ item.notes || '无备注' }}</view>
    </view>

    <button type="primary" class="cta" @click="refresh">刷新</button>
  </view>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import dayjs from 'dayjs';
import appointmentsApi from '../../api/appointments';

const appointments = ref([]);

onMounted(refresh);

async function refresh() {
  appointments.value = await appointmentsApi.listMine();
}

function format(value) {
  return dayjs(value).format('MM-DD HH:mm');
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
.row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8rpx;
}
.status {
  color: #007aff;
}
.cta {
  margin-top: 24rpx;
}
</style>
