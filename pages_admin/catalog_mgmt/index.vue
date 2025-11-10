<template>
  <scroll-view class="page" scroll-y>
    <view class="panel">
      <text class="panel__title">地点</text>
      <view v-for="loc in locations" :key="loc.id" class="list-item">
        <text>{{ loc.name }} · {{ loc.address }}</text>
        <button size="mini" type="warn" @tap="deleteLocation(loc.id)">删除</button>
      </view>
      <view class="form-item">
        <input v-model="locationForm.name" placeholder="地点名称" class="input" />
        <input v-model="locationForm.address" placeholder="详细地址" class="input" />
        <button size="mini" type="primary" @tap="saveLocation">新增地点</button>
      </view>
    </view>

    <view class="panel">
      <text class="panel__title">技师</text>
      <view v-for="tech in technicians" :key="tech.id" class="list-item list-item--tech">
        <view class="list-item__info">
          <text class="list-item__title">{{ tech.display_name }}</text>
          <text class="list-item__desc">{{ tech.bio || '暂无简介' }}</text>
          <text v-if="tech.restricted_by_quota" class="tag tag--warning">父亲限额受控</text>
        </view>
        <button size="mini" type="warn" @tap="deleteTechnician(tech.id)">删除</button>
      </view>
      <view class="form-item">
        <input v-model="technicianForm.display_name" placeholder="姓名" class="input" />
        <textarea v-model="technicianForm.bio" placeholder="简介 (可选)" class="textarea" />
        <input v-model="technicianForm.avatar_url" placeholder="头像链接 (可选)" class="input" />
        <label class="toggle">
          <text>父亲限额限制</text>
          <switch :checked="technicianForm.restricted_by_quota" @change="onQuotaToggle" />
        </label>
        <button size="mini" type="primary" @tap="saveTechnician">新增技师</button>
      </view>
    </view>

    <view class="panel">
      <text class="panel__title">服务</text>
      <view v-for="svc in services" :key="svc.id" class="list-item">
        <text>{{ svc.name }} · {{ svc.duration }}min</text>
        <button size="mini" type="warn" @tap="deleteService(svc.id)">删除</button>
      </view>
      <view class="form-item">
        <input v-model="serviceForm.name" placeholder="服务名称" class="input" />
        <input v-model.number="serviceForm.duration" type="number" placeholder="时长(分钟)" class="input" />
        <input v-model.number="serviceForm.concurrency" type="number" placeholder="并发数" class="input" />
        <button size="mini" type="primary" @tap="saveService">新增服务</button>
      </view>
    </view>

    <view class="panel">
      <text class="panel__title">组合套餐 (Offering)</text>
      <view v-for="item in offerings" :key="item.id" class="list-item">
        <text>{{ item.location_name }} / {{ item.technician_name }} / {{ item.service_name }} · ¥{{ item.price }}</text>
        <button size="mini" type="warn" @tap="deleteOffering(item.id)">删除</button>
      </view>
      <view class="form-item">
        <picker mode="selector" :range="locations" range-key="name" @change="onOfferingLocationChange">
          <view class="picker-value">{{ offeringSelections.location?.name ?? '选择地点' }}</view>
        </picker>
        <picker mode="selector" :range="technicians" range-key="display_name" @change="onOfferingTechnicianChange">
          <view class="picker-value">{{ offeringSelections.technician?.display_name ?? '选择技师' }}</view>
        </picker>
        <picker mode="selector" :range="services" range-key="name" @change="onOfferingServiceChange">
          <view class="picker-value">{{ offeringSelections.service?.name ?? '选择服务' }}</view>
        </picker>
        <input v-model.number="offeringForm.price" type="number" placeholder="价格" class="input" />
        <input v-model.number="offeringForm.duration" type="number" placeholder="定制时长(可选)" class="input" />
        <button size="mini" type="primary" @tap="saveOffering">保存组合</button>
      </view>
    </view>
  </scroll-view>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import {
  fetchLocations,
  fetchTechnicians,
  fetchServices,
  fetchOfferings,
  adminUpsertLocation,
  adminUpsertTechnician,
  adminUpsertService,
  adminUpsertOffering,
  adminDeleteLocation,
  adminDeleteTechnician,
  adminDeleteService,
  adminDeleteOffering
} from '../../api/catalog'

type PickerChangeEvent = { detail: { value: number } }
type SwitchChangeEvent = { detail: { value: boolean } }

const locations = ref<any[]>([])
const technicians = ref<any[]>([])
const services = ref<any[]>([])
const offerings = ref<any[]>([])

const locationForm = reactive({ name: '', address: '' })
const technicianForm = reactive({
  display_name: '',
  bio: '',
  avatar_url: '',
  restricted_by_quota: false
})
const serviceForm = reactive({ name: '', duration: 60, concurrency: 1 })
const offeringForm = reactive({ price: 0, duration: 0 })
const offeringSelections = reactive<{ location: any | null; technician: any | null; service: any | null }>({
  location: null,
  technician: null,
  service: null
})

const onQuotaToggle = (event: SwitchChangeEvent) => {
  technicianForm.restricted_by_quota = Boolean(event.detail?.value)
}

const onOfferingLocationChange = (event: PickerChangeEvent) => {
  offeringSelections.location = locations.value[Number(event.detail.value)]
}

const onOfferingTechnicianChange = (event: PickerChangeEvent) => {
  offeringSelections.technician = technicians.value[Number(event.detail.value)]
}

const onOfferingServiceChange = (event: PickerChangeEvent) => {
  offeringSelections.service = services.value[Number(event.detail.value)]
}

const loadAll = async () => {
  const [loc, tech, svc, off] = await Promise.all([
    fetchLocations(),
    fetchTechnicians(),
    fetchServices(),
    fetchOfferings()
  ])
  locations.value = loc
  technicians.value = tech
  services.value = svc
  offerings.value = off
}

const saveLocation = async () => {
  await adminUpsertLocation(locationForm)
  Object.assign(locationForm, { name: '', address: '' })
  uni.showToast({ title: '已保存', icon: 'success' })
  loadAll()
}

const saveTechnician = async () => {
  if (!technicianForm.display_name.trim()) {
    uni.showToast({ title: '请填写姓名', icon: 'none' })
    return
  }
  await adminUpsertTechnician({
    display_name: technicianForm.display_name,
    bio: technicianForm.bio || undefined,
    avatar_url: technicianForm.avatar_url || undefined,
    restricted_by_quota: technicianForm.restricted_by_quota
  })
  Object.assign(technicianForm, {
    display_name: '',
    bio: '',
    avatar_url: '',
    restricted_by_quota: false
  })
  uni.showToast({ title: '已保存', icon: 'success' })
  loadAll()
}

const saveService = async () => {
  await adminUpsertService(serviceForm)
  Object.assign(serviceForm, { name: '', duration: 60, concurrency: 1 })
  uni.showToast({ title: '已保存', icon: 'success' })
  loadAll()
}

const saveOffering = async () => {
  if (!(offeringSelections.location && offeringSelections.technician && offeringSelections.service)) {
    uni.showToast({ title: '请选择地点/技师/服务', icon: 'none' })
    return
  }
  await adminUpsertOffering({
    location_id: offeringSelections.location.id,
    technician_id: offeringSelections.technician.id,
    service_id: offeringSelections.service.id,
    price: offeringForm.price,
    duration: offeringForm.duration || undefined
  })
  offeringForm.price = 0
  offeringForm.duration = 0
  uni.showToast({ title: '已保存', icon: 'success' })
  loadAll()
}

const confirmDelete = (action: () => Promise<void>) => {
  uni.showModal({
    title: '确认删除',
    success: async ({ confirm }) => {
      if (confirm) {
        await action()
        uni.showToast({ title: '已删除', icon: 'none' })
        loadAll()
      }
    }
  })
}

const deleteLocation = (id: string) => confirmDelete(() => adminDeleteLocation(id))
const deleteTechnician = (id: string) => confirmDelete(() => adminDeleteTechnician(id))
const deleteService = (id: string) => confirmDelete(() => adminDeleteService(id))
const deleteOffering = (id: string) => confirmDelete(() => adminDeleteOffering(id))

onShow(loadAll)
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
  margin-bottom: 12rpx;
}

.list-item--tech {
  align-items: flex-start;
  gap: 16rpx;
}

.list-item__info {
  flex: 1;
}

.list-item__title {
  display: block;
  font-weight: 600;
}

.list-item__desc {
  display: block;
  margin-top: 8rpx;
  font-size: 26rpx;
  color: #777;
}

.tag {
  display: inline-block;
  padding: 4rpx 12rpx;
  border-radius: 999px;
  font-size: 22rpx;
  margin-top: 8rpx;

  &--warning {
    background: rgba(255, 149, 0, 0.1);
    color: #ff9500;
  }
}

.form-item {
  margin-top: 16rpx;
}

.toggle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8rpx 0;
  color: #666;
}

.input,
.textarea {
  width: 100%;
  background: #f5f6fb;
  border-radius: 12rpx;
  padding: 16rpx;
  margin-bottom: 12rpx;
}

.picker-value {
  padding: 16rpx;
  background: #f5f6fb;
  border-radius: 12rpx;
  margin-bottom: 12rpx;
}
</style>
