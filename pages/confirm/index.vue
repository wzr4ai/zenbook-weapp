<template>
  <view class="page">
    <view class="panel">
      <text class="panel__title">预约信息</text>
      <view class="summary">
        <text>{{ bookingStore.selectedService?.name }}</text>
        <text>技师：{{ bookingStore.selectedTechnician?.display_name }}</text>
        <text>地点：{{ bookingStore.selectedLocation?.name }}</text>
        <text>时间：{{ bookingStore.selectedSlot?.start }}</text>
      </view>
    </view>

    <view class="panel">
      <text class="panel__title">顾客</text>
      <picker
        mode="selector"
        :range="patients"
        range-key="name"
        @change="onPatientChange"
      >
        <view class="picker-value">
          {{ currentPatient?.name ?? '选择顾客' }}
        </view>
      </picker>
      <button class="link-btn" size="mini" @tap="goPatients">
        去管理顾客
      </button>
    </view>

    <view class="panel">
      <text class="panel__title">备注 (可选)</text>
      <textarea
        class="textarea"
        placeholder="身体情况、偏好时间等"
        :value="bookingStore.notes"
        @input="onNotesChange"
        maxlength="120"
      />
    </view>

    <button
      class="primary-btn"
      type="primary"
      :disabled="!bookingStore.selectedSlot || !bookingStore.selectedPatientId || loading"
      @tap="submit"
    >
      {{ loading ? '提交中...' : '提交预约' }}
    </button>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useBookingStore } from '../../store/booking'
import { listPatients } from '../../api/patients'
import { createAppointment } from '../../api/appointments'
import { logger } from '../../utils/logger'

type PickerChangeEvent = { detail: { value: number } }
type TextEvent = { detail: { value: string } }

const bookingStore = useBookingStore()
const patients = ref<any[]>([])
const loading = ref(false)

const currentPatient = computed(() =>
  patients.value.find((item) => item.id === bookingStore.selectedPatientId)
)

const fetchPatients = async () => {
  const data = await listPatients()
  patients.value = data
  if (!bookingStore.selectedPatientId && data.length) {
    bookingStore.setPatient(data[0].id)
  }
}

const onPatientChange = (event: PickerChangeEvent) => {
  const patient = patients.value?.[Number(event.detail.value)]
  if (patient) {
    bookingStore.setPatient(patient.id)
  }
}

const onNotesChange = (event: TextEvent) => {
  bookingStore.setNotes(event.detail.value)
}

const goPatients = () => {
  uni.navigateTo({ url: '/pages_sub/patients/index' })
}

const submit = async () => {
  if (!bookingStore.selectedSlot) {
    uni.showToast({ title: '请选择时间', icon: 'none' })
    return
  }
  const offering = bookingStore.offerings[0]
  if (!offering) {
    uni.showToast({ title: '缺少服务组合，请返回重选', icon: 'none' })
    return
  }
  loading.value = true
  try {
    await createAppointment({
      offering_id: offering.id,
      patient_id: bookingStore.selectedPatientId,
      start_time: bookingStore.selectedSlot.start,
      notes: bookingStore.notes
    })
    uni.showToast({ title: '预约成功', icon: 'success' })
    bookingStore.reset()
    uni.redirectTo({ url: '/pages_sub/appointments/index' })
  } catch (error) {
    logger.error('failed to create appointment', error)
    uni.showToast({ title: '预约提交失败，请稍后重试', icon: 'none' })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (!bookingStore.selectedSlot) {
    uni.navigateBack()
    return
  }
  fetchPatients()
})
</script>

<style scoped lang="scss">
.page {
  padding: 32rpx;
}

.panel {
  padding: 24rpx;
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 24rpx;

  &__title {
    display: block;
    font-size: 30rpx;
    margin-bottom: 16rpx;
  }
}

.summary {
  color: #666;
  font-size: 26rpx;
  line-height: 1.8;
}

.picker-value {
  padding: 20rpx;
  background: #f5f6fb;
  border-radius: 12rpx;
}

.textarea {
  width: 100%;
  min-height: 160rpx;
  background: #f5f6fb;
  border-radius: 12rpx;
  padding: 16rpx;
}

.link-btn {
  margin-top: 16rpx;
}

.primary-btn {
  width: 100%;
  border-radius: 999px;
}
</style>
