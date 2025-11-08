<template>
  <scroll-view class="page" scroll-y>
    <view class="panel">
      <text class="panel__title">账户列表</text>
      <view v-for="user in users" :key="user.id" class="item">
        <text class="item__title">{{ user.name }} · {{ user.role }}</text>
        <text class="item__sub">{{ user.phone }}</text>
      </view>
      <view v-if="!users.length" class="empty">暂无数据</view>
    </view>

    <view class="panel">
      <text class="panel__title">就诊人</text>
      <view v-for="patient in patients" :key="patient.id" class="item">
        <text class="item__title">{{ patient.name }} · {{ patient.relation }}</text>
        <text class="item__sub">
          绑定账户：{{ patient.user_name || patient.user_id }}
        </text>
      </view>
      <view v-if="!patients.length" class="empty">暂无数据</view>
    </view>
  </scroll-view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { listUsers, listAllPatients } from '../../api/admin'

const users = ref<any[]>([])
const patients = ref<any[]>([])

const fetchData = async () => {
  const [userList, patientList] = await Promise.all([
    listUsers(),
    listAllPatients()
  ])
  users.value = userList
  patients.value = patientList
}

onShow(fetchData)
</script>

<style scoped lang="scss">
.page {
  height: 100vh;
  padding: 32rpx;
}

.panel {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;

  &__title {
    font-size: 30rpx;
    font-weight: 600;
    margin-bottom: 16rpx;
  }
}

.item {
  margin-bottom: 12rpx;
  padding-bottom: 12rpx;
  border-bottom: 1rpx solid #f2f2f2;

  &__title {
    display: block;
    font-weight: 600;
  }

  &__sub {
    color: #999;
    font-size: 24rpx;
  }
}

.empty {
  text-align: center;
  color: #aaa;
}
</style>
