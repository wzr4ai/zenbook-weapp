<template>
  <scroll-view class="page" scroll-y>
    <view class="panel">
      <text class="panel__title">营业时间</text>
      <view v-for="item in businessHours" :key="item.id" class="list-item">
        <text>周{{ weekdayLabel(item.weekday) }} {{ item.start }} - {{ item.end }}</text>
        <button size="mini" type="warn" @tap="removeHour(item.id)">删除</button>
      </view>
      <view class="form-item">
        <text>新增/更新</text>
        <picker mode="selector" :range="weekdayOptions" range-key="label" @change="onWeekdayChange">
          <view class="picker-value">周{{ weekdayLabel(hourForm.weekday) }}</view>
        </picker>
        <picker mode="time" :value="hourForm.start" @change="(e) => (hourForm.start = e.detail.value)">
          <view class="picker-value">开始 {{ hourForm.start }}</view>
        </picker>
        <picker mode="time" :value="hourForm.end" @change="(e) => (hourForm.end = e.detail.value)">
          <view class="picker-value">结束 {{ hourForm.end }}</view>
        </picker>
        <button size="mini" type="primary" @tap="saveHour">保存</button>
      </view>
    </view>

    <view class="panel">
      <text class="panel__title">排班例外</text>
      <view v-for="item in exceptions" :key="item.id" class="list-item">
        <text>{{ item.date }} {{ item.start }} - {{ item.end }} {{ item.reason }}</text>
        <button size="mini" type="warn" @tap="removeException(item.id)">删除</button>
      </view>
      <view class="form-item">
        <text>新增例外</text>
        <picker mode="date" :value="exceptionForm.date" @change="(e) => (exceptionForm.date = e.detail.value)">
          <view class="picker-value">{{ exceptionForm.date }}</view>
        </picker>
        <picker mode="time" :value="exceptionForm.start" @change="(e) => (exceptionForm.start = e.detail.value)">
          <view class="picker-value">开始 {{ exceptionForm.start }}</view>
        </picker>
        <picker mode="time" :value="exceptionForm.end" @change="(e) => (exceptionForm.end = e.detail.value)">
          <view class="picker-value">结束 {{ exceptionForm.end }}</view>
        </picker>
        <input v-model="exceptionForm.reason" placeholder="原因" class="input" />
        <button size="mini" type="primary" @tap="saveExceptionItem">保存</button>
      </view>
    </view>
  </scroll-view>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import {
  listBusinessHours,
  listExceptions,
  saveBusinessHour,
  saveException,
  deleteBusinessHour,
  deleteException
} from '../../api/schedule'

const businessHours = ref<any[]>([])
const exceptions = ref<any[]>([])

const weekdayOptions = [
  { value: 1, label: '一' },
  { value: 2, label: '二' },
  { value: 3, label: '三' },
  { value: 4, label: '四' },
  { value: 5, label: '五' },
  { value: 6, label: '六' },
  { value: 7, label: '日' }
]

const hourForm = reactive({
  weekday: 1,
  start: '09:00',
  end: '18:00'
})

const exceptionForm = reactive({
  date: new Date().toISOString().split('T')[0],
  start: '09:00',
  end: '18:00',
  reason: ''
})

const weekdayLabel = (value: number) =>
  weekdayOptions.find((item) => item.value === value)?.label ?? value

type PickerChangeEvent = { detail: { value: number } }

const onWeekdayChange = (event: PickerChangeEvent) => {
  const option = weekdayOptions[Number(event.detail.value)]
  hourForm.weekday = option.value
}

const fetchData = async () => {
  const [hours, exs] = await Promise.all([listBusinessHours(), listExceptions()])
  businessHours.value = hours
  exceptions.value = exs
}

const saveHour = async () => {
  await saveBusinessHour(hourForm)
  uni.showToast({ title: '已保存', icon: 'success' })
  fetchData()
}

const removeHour = async (id: string) => {
  await deleteBusinessHour(id)
  fetchData()
}

const saveExceptionItem = async () => {
  await saveException(exceptionForm)
  uni.showToast({ title: '已保存', icon: 'success' })
  fetchData()
}

const removeException = async (id: string) => {
  await deleteException(id)
  fetchData()
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

.list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.form-item {
  margin-top: 16rpx;
}

.picker-value {
  padding: 16rpx;
  background: #f5f6fb;
  border-radius: 12rpx;
  margin-bottom: 12rpx;
}

.input {
  width: 100%;
  background: #f5f6fb;
  border-radius: 12rpx;
  padding: 16rpx;
  margin-bottom: 12rpx;
}
</style>
