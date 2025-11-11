<template>
  <view class="page">
    <view class="panel">
      <text class="panel__title">{{ editingId ? '编辑预约' : '手动预约' }}</text>
      <view class="form-item">
        <text>患者</text>
        <picker mode="selector" :range="patients" range-key="name" @change="onPatientChange">
          <view class="picker-value">{{ selectedPatient?.name ?? '选择就诊人' }}</view>
        </picker>
      </view>

      <view class="form-item">
        <text>地点</text>
        <picker mode="selector" :range="locations" range-key="name" @change="onLocationChange">
          <view class="picker-value">
            {{ selectedLocation?.name ?? '选择地点' }}
          </view>
        </picker>
      </view>

      <view class="form-item">
        <text>技师</text>
        <picker mode="selector" :range="technicians" range-key="display_name" @change="onTechnicianChange">
          <view class="picker-value">
            {{ selectedTechnician?.display_name ?? '选择技师' }}
          </view>
        </picker>
      </view>

      <view class="form-item">
        <text>服务</text>
        <picker mode="selector" :range="services" range-key="name" @change="onServiceChange">
          <view class="picker-value">
            {{ selectedService?.name ?? '选择服务' }}
          </view>
        </picker>
      </view>

      <view class="form-item">
        <text>时间</text>
        <picker mode="date" :value="form.date" @change="(e) => (form.date = e.detail.value)">
          <view class="picker-value">{{ form.date }}</view>
        </picker>
        <picker mode="time" :value="form.time" @change="(e) => (form.time = e.detail.value)">
          <view class="picker-value">{{ form.time }}</view>
        </picker>
      </view>

      <view class="form-item">
        <text>备注</text>
        <textarea v-model="form.notes" class="textarea" placeholder="内部备注" />
      </view>
    </view>

    <button class="primary-btn" type="primary" :disabled="!canSubmit" @tap="submit">
      {{ editingId ? '保存修改' : '创建预约' }}
    </button>
  </view>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import {
  fetchLocations,
  fetchTechnicians,
  fetchServices,
  fetchOfferings
} from '../../api/catalog'
import {
  adminCreateAppointment,
  adminUpdateAppointment,
  listAllAppointments
} from '../../api/appointments'
import { listAllPatients } from '../../api/admin'

type PickerChangeEvent = { detail: { value: number } }

const formatLocalDate = (value: Date) => {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const locations = ref<any[]>([])
const technicians = ref<any[]>([])
const services = ref<any[]>([])
const offerings = ref<any[]>([])
const patients = ref<any[]>([])

const selectedLocation = ref<any | null>(null)
const selectedTechnician = ref<any | null>(null)
const selectedService = ref<any | null>(null)
const selectedOffering = computed(() => offerings.value[0] ?? null)

const editingId = ref('')
const form = reactive({
  patientId: '',
  date: formatLocalDate(new Date()),
  time: '09:00',
  notes: ''
})

const canSubmit = computed(() => {
  return (
    Boolean(form.patientId) &&
    selectedOffering.value &&
    Boolean(form.date) &&
    Boolean(form.time)
  )
})

const selectedPatient = computed(() =>
  patients.value.find((item) => item.id === form.patientId)
)

const onPatientChange = (event: PickerChangeEvent) => {
  const item = patients.value[Number(event.detail.value)]
  if (item) form.patientId = item.id
}

const onLocationChange = (event: PickerChangeEvent) => {
  selectedLocation.value = locations.value[Number(event.detail.value)]
  loadOfferings()
}

const onTechnicianChange = (event: PickerChangeEvent) => {
  selectedTechnician.value = technicians.value[Number(event.detail.value)]
  loadOfferings()
}

const onServiceChange = (event: PickerChangeEvent) => {
  selectedService.value = services.value[Number(event.detail.value)]
  loadOfferings()
}

const loadOfferings = async () => {
  if (!(selectedLocation.value && selectedTechnician.value && selectedService.value)) {
    return
  }
  offerings.value = await fetchOfferings({
    location_id: selectedLocation.value.id,
    technician_id: selectedTechnician.value.id,
    service_id: selectedService.value.id
  })
}

const submit = async () => {
  if (!canSubmit.value) {
    uni.showToast({ title: '缺少必要字段', icon: 'none' })
    return
  }
  const payload = {
    patient_id: form.patientId,
    offering_id: selectedOffering.value.id,
    start_time: `${form.date}T${form.time}:00`,
    notes: form.notes
  }
  if (editingId.value) {
    await adminUpdateAppointment(editingId.value, payload)
  } else {
    await adminCreateAppointment(payload)
  }
  uni.showToast({ title: '已保存', icon: 'success' })
  uni.navigateBack()
}

const hydrateFromAppointment = async (id: string) => {
  const all = await listAllAppointments()
  const detail = all.find((item) => item.id === id)
  if (!detail) return
  form.patientId = detail.patient_id
  form.notes = detail.notes ?? ''
  form.date = detail.start_time?.split('T')[0] ?? form.date
  form.time = detail.start_time?.split('T')[1]?.slice(0, 5) ?? form.time
  selectedLocation.value =
    locations.value.find((item) => item.id === detail.location_id) ?? null
  selectedTechnician.value =
    technicians.value.find((item) => item.id === detail.technician_id) ?? null
  selectedService.value =
    services.value.find((item) => item.id === detail.service_id) ?? null
  if (selectedLocation.value && selectedTechnician.value && selectedService.value) {
    offerings.value = await fetchOfferings({
      location_id: selectedLocation.value.id,
      technician_id: selectedTechnician.value.id,
      service_id: selectedService.value.id
    })
    const targetIndex = offerings.value.findIndex(
      (item) => item.id === detail.offering_id
    )
    if (targetIndex > 0) {
      const [target] = offerings.value.splice(targetIndex, 1)
      offerings.value.unshift(target)
    }
  }
}

const bootstrap = async () => {
  const [loc, tech, svc, pats] = await Promise.all([
    fetchLocations(),
    fetchTechnicians(),
    fetchServices(),
    listAllPatients()
  ])
  locations.value = loc
  technicians.value = tech
  services.value = svc
  patients.value = pats
  if (!form.patientId && pats.length) {
    form.patientId = pats[0].id
  }
}

onLoad(async (options) => {
  await bootstrap()
  if (options?.id) {
    editingId.value = options.id as string
    await hydrateFromAppointment(editingId.value)
  }
})
</script>

<style scoped lang="scss">
.page {
  padding: 32rpx;
}

.panel {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
}

.panel__title {
  font-size: 32rpx;
  font-weight: 600;
  margin-bottom: 20rpx;
}

.form-item {
  margin-bottom: 20rpx;

  text {
    display: block;
    margin-bottom: 8rpx;
    color: #666;
  }
}

.picker-value {
  padding: 18rpx;
  background: #f5f6fb;
  border-radius: 12rpx;
  margin-bottom: 12rpx;
}

.textarea {
  width: 100%;
  min-height: 160rpx;
  background: #f5f6fb;
  border-radius: 12rpx;
  padding: 16rpx;
}

.primary-btn {
  width: 100%;
  margin-top: 32rpx;
}
</style>
