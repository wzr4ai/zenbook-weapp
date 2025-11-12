<template>
  <scroll-view class="page" scroll-y>
    <view class="page-header">
      <view>
        <text class="page-title">服务配置中心</text>
        <text class="page-subtitle">维护门店、技师、服务及组合，确保前台体验一致</text>
      </view>
    </view>
    <view class="panel">
      <text class="panel__title">地点</text>
      <view v-for="loc in locations" :key="loc.id" class="list-item">
        <view class="list-item__info">
          <text class="list-item__title">{{ loc.name }}</text>
          <text class="list-item__desc">{{ loc.address || '未填写地址' }}</text>
          <text class="list-item__meta" v-if="loc.city">城市：{{ loc.city }}</text>
        </view>
        <view class="list-item__actions">
          <button size="mini" plain type="primary" @tap="editLocation(loc)">编辑</button>
          <button size="mini" type="warn" @tap="deleteLocation(loc.id)">删除</button>
        </view>
      </view>
      <view class="form-item">
        <view class="form-field">
          <text class="form-field__label">地点名称</text>
          <input v-model="locationForm.name" placeholder="示例：静安旗舰店" class="input" />
        </view>
        <view class="form-field">
          <text class="form-field__label">城市 (可选)</text>
          <input v-model="locationForm.city" placeholder="示例：上海" class="input" />
        </view>
        <view class="form-field">
          <text class="form-field__label">详细地址</text>
          <input v-model="locationForm.address" placeholder="路名、楼层等" class="input" />
        </view>
        <view class="form-actions">
          <button size="mini" type="primary" @tap="saveLocation">
            {{ editingLocationId ? '保存修改' : '新增地点' }}
          </button>
          <button v-if="editingLocationId" size="mini" @tap="cancelLocationEdit">取消编辑</button>
        </view>
      </view>
    </view>

    <view class="panel">
      <text class="panel__title">技师</text>
      <view v-for="tech in technicians" :key="tech.id" class="list-item list-item--tech">
        <view class="list-item__info">
          <text class="list-item__title">{{ tech.display_name }}</text>
          <text class="list-item__desc">{{ tech.bio || '暂无简介' }}</text>
          <view class="badge-group">
            <text class="tag tag--soft">上午配额：{{ formatQuotaLabel(tech.morning_quota_limit, tech.restricted_by_quota) }}</text>
            <text class="tag tag--soft">下午配额：{{ formatQuotaLabel(tech.afternoon_quota_limit, tech.restricted_by_quota) }}</text>
            <text class="tag tag--soft">权重：{{ tech.weight ?? 0 }}</text>
          </view>
        </view>
        <view class="list-item__actions">
          <button size="mini" plain type="primary" @tap="editTechnician(tech)">编辑</button>
          <button size="mini" type="warn" @tap="deleteTechnician(tech.id)">删除</button>
        </view>
      </view>
      <view class="form-item">
        <view class="form-field">
          <text class="form-field__label">姓名</text>
          <input v-model="technicianForm.display_name" placeholder="示例：李大师" class="input" />
        </view>
        <view class="form-field">
          <text class="form-field__label">简介 (可选)</text>
          <textarea v-model="technicianForm.bio" placeholder="擅长项目、年限等" class="textarea" />
        </view>
        <view class="form-field">
          <text class="form-field__label">头像链接 (可选)</text>
          <input v-model="technicianForm.avatar_url" placeholder="https://..." class="input" />
        </view>
        <view class="form-field">
          <text class="form-field__label">上午配额 (0 表示不限)</text>
          <input v-model="technicianForm.morning_quota_limit" type="number" placeholder="0" class="input" />
        </view>
        <view class="form-field">
          <text class="form-field__label">下午配额 (0 表示不限)</text>
          <input v-model="technicianForm.afternoon_quota_limit" type="number" placeholder="0" class="input" />
        </view>
        <view class="form-field">
          <text class="form-field__label">展示权重 (数字越大排序越靠前)</text>
          <input v-model.number="technicianForm.weight" type="number" placeholder="0" class="input" />
        </view>
        <text class="hint-text">留空表示沿用系统默认配额，0 表示不限制，>0 为自定义限制。</text>
        <view class="inline-actions">
          <button size="mini" plain class="ghost-btn" @tap="applyDefaultQuota">沿用系统默认限额</button>
        </view>
        <view class="form-actions">
          <button size="mini" type="primary" @tap="saveTechnician">
            {{ editingTechnicianId ? '保存修改' : '新增技师' }}
          </button>
          <button v-if="editingTechnicianId" size="mini" @tap="cancelTechnicianEdit">取消编辑</button>
        </view>
      </view>
    </view>

    <view class="panel">
      <text class="panel__title">服务</text>
      <view v-for="svc in services" :key="svc.id" class="list-item">
        <view class="list-item__info">
          <text class="list-item__title">{{ svc.name }}</text>
          <text class="list-item__desc">{{ svc.description || '暂无描述' }}</text>
          <text class="list-item__meta">
            时长：{{ svc.default_duration_minutes ?? svc.duration }} 分钟 · 并发：{{ svc.concurrency_level ?? svc.concurrency }}
          </text>
          <text class="list-item__meta">权重：{{ svc.weight ?? 0 }}</text>
        </view>
        <view class="list-item__actions">
          <button size="mini" plain type="primary" @tap="editService(svc)">编辑</button>
          <button size="mini" type="warn" @tap="deleteService(svc.id)">删除</button>
        </view>
      </view>
      <view class="form-item">
        <view class="form-field">
          <text class="form-field__label">服务名称</text>
          <input v-model="serviceForm.name" placeholder="示例：肩颈调理" class="input" />
        </view>
        <view class="form-field">
          <text class="form-field__label">服务描述 (可选)</text>
          <textarea v-model="serviceForm.description" placeholder="适用人群、亮点等" class="textarea" />
        </view>
        <view class="form-field">
          <text class="form-field__label">默认时长 (分钟)</text>
          <input v-model.number="serviceForm.duration" type="number" placeholder="60" class="input" />
        </view>
        <view class="form-field">
          <text class="form-field__label">并发数量</text>
          <input v-model.number="serviceForm.concurrency" type="number" placeholder="1" class="input" />
        </view>
        <view class="form-field">
          <text class="form-field__label">排序权重（数字越大越靠前）</text>
          <input v-model.number="serviceForm.weight" type="number" placeholder="0" class="input" />
        </view>
        <view class="form-actions">
          <button size="mini" type="primary" @tap="saveService">
            {{ editingServiceId ? '保存修改' : '新增服务' }}
          </button>
          <button v-if="editingServiceId" size="mini" @tap="cancelServiceEdit">取消编辑</button>
        </view>
      </view>
    </view>

    <view class="panel">
      <text class="panel__title">组合套餐 (Offering)</text>
      <view v-for="item in offerings" :key="item.id" class="list-item">
        <view class="list-item__info">
          <text class="list-item__title">{{ item.service_name }}</text>
          <text class="list-item__desc">{{ item.service_description || '暂无服务简介' }}</text>
          <text class="list-item__meta">
            地点：{{ item.location_name }}<text v-if="item.location_city"> · {{ item.location_city }}</text>
          </text>
          <text class="list-item__meta">技师：{{ item.technician_name }}</text>
          <text class="list-item__meta">
            服务默认：{{ item.service_default_duration ?? '-' }}min · 并发 {{ item.service_concurrency ?? '-' }}
          </text>
          <text class="list-item__meta">组合价：¥{{ item.price }} · {{ item.duration_minutes ?? item.duration }}min</text>
        </view>
        <view class="list-item__actions">
          <button size="mini" plain type="primary" @tap="editOffering(item)">编辑</button>
          <button size="mini" type="warn" @tap="deleteOffering(item.id)">删除</button>
        </view>
      </view>
      <view class="form-item">
        <view class="form-field">
          <text class="form-field__label">地点</text>
          <picker mode="selector" :range="locations" range-key="name" @change="onOfferingLocationChange">
            <view class="picker-value">{{ offeringSelections.location?.name ?? '选择地点' }}</view>
          </picker>
        </view>
        <view class="form-field">
          <text class="form-field__label">技师</text>
          <picker mode="selector" :range="technicians" range-key="display_name" @change="onOfferingTechnicianChange">
            <view class="picker-value">{{ offeringSelections.technician?.display_name ?? '选择技师' }}</view>
          </picker>
        </view>
        <view class="form-field">
          <text class="form-field__label">服务</text>
          <picker mode="selector" :range="services" range-key="name" @change="onOfferingServiceChange">
            <view class="picker-value">{{ offeringSelections.service?.name ?? '选择服务' }}</view>
          </picker>
        </view>
        <view class="form-field">
          <text class="form-field__label">价格 (元)</text>
          <input v-model.number="offeringForm.price" type="number" placeholder="0" class="input" />
        </view>
        <view class="form-field">
          <text class="form-field__label">定制时长 (分钟，可选)</text>
          <input v-model.number="offeringForm.duration" type="number" placeholder="沿用服务默认值" class="input" />
        </view>
        <view class="form-actions">
          <button size="mini" type="primary" @tap="saveOffering">
            {{ editingOfferingId ? '保存修改' : '保存组合' }}
          </button>
          <button v-if="editingOfferingId" size="mini" @tap="cancelOfferingEdit">取消编辑</button>
        </view>
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
  adminUpdateLocation,
  adminUpdateTechnician,
  adminUpdateService,
  adminUpdateOffering,
  adminDeleteLocation,
  adminDeleteTechnician,
  adminDeleteService,
  adminDeleteOffering
} from '../../api/catalog'

type PickerChangeEvent = { detail: { value: number } }
type CatalogEntity = Record<string, any>

const locations = ref<any[]>([])
const technicians = ref<any[]>([])
const services = ref<any[]>([])
const offerings = ref<any[]>([])

const locationForm = reactive({ name: '', address: '', city: '' })
const technicianForm = reactive({
  display_name: '',
  bio: '',
  avatar_url: '',
  morning_quota_limit: '',
  afternoon_quota_limit: '',
  restricted_by_quota: false,
  weight: 0
})
const serviceForm = reactive({ name: '', description: '', duration: 60, concurrency: 1, weight: 0 })
const offeringForm = reactive({ price: 0, duration: 0 })
const offeringSelections = reactive<{ location: any | null; technician: any | null; service: any | null }>({
  location: null,
  technician: null,
  service: null
})
const editingLocationId = ref('')
const editingTechnicianId = ref('')
const editingServiceId = ref('')
const editingOfferingId = ref('')

const formatQuotaLabel = (value: number | null | undefined, usesDefault: boolean): string => {
  if (value === null || value === undefined) {
    return usesDefault ? '默认' : '不限'
  }
  if (Number(value) === 0) {
    return '不限'
  }
  return String(value)
}

const normalizeQuotaInput = (value: string | number | null | undefined): number | null => {
  if (value === '' || value === null || value === undefined) {
    return null
  }
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) {
    return 0
  }
  return Math.max(0, Math.floor(numeric))
}

const toInputValue = (value: number | null | undefined): string => {
  return value === null || value === undefined ? '' : String(value)
}

const normalizeWeight = (value: string | number | null | undefined): number => {
  if (value === '' || value === null || value === undefined) {
    return 0
  }
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) {
    return 0
  }
  return Math.max(0, Math.floor(numeric))
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

const toIndex = (items: CatalogEntity[]) => {
  const map: Record<string, CatalogEntity> = {}
  items.forEach((item) => {
    if (item?.id) {
      map[item.id] = item
    }
  })
  return map
}

const hydrateOfferings = (
  source: CatalogEntity[],
  locs: CatalogEntity[],
  techs: CatalogEntity[],
  svcs: CatalogEntity[]
) => {
  const locationMap = toIndex(locs)
  const technicianMap = toIndex(techs)
  const serviceMap = toIndex(svcs)
  return source.map((item) => {
    const location = locationMap[item.location_id] || {}
    const technician = technicianMap[item.technician_id] || {}
    const service = serviceMap[item.service_id] || {}
    return {
      ...item,
      location_name: location.name ?? '未匹配地点',
      location_city: location.city ?? '',
      location_address: location.address ?? '',
      technician_name: technician.display_name ?? '未匹配技师',
      technician_avatar: technician.avatar_url ?? '',
      service_name: service.name ?? '未匹配服务',
      service_description: service.description ?? '',
      service_default_duration: service.default_duration_minutes ?? null,
      service_concurrency: service.concurrency_level ?? null
    }
  })
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
  offerings.value = hydrateOfferings(off, loc, tech, svc)
}

const resetLocationForm = () => {
  Object.assign(locationForm, { name: '', address: '', city: '' })
  editingLocationId.value = ''
}

const saveLocation = async () => {
  const payload = {
    name: locationForm.name,
    address: locationForm.address,
    city: locationForm.city || undefined
  }
  if (!payload.name.trim()) {
    uni.showToast({ title: '请输入地点名称', icon: 'none' })
    return
  }
  if (editingLocationId.value) {
    await adminUpdateLocation(editingLocationId.value, payload)
  } else {
    await adminUpsertLocation(payload)
  }
  uni.showToast({ title: '已保存', icon: 'success' })
  resetLocationForm()
  loadAll()
}

const editLocation = (location: any) => {
  editingLocationId.value = location.id
  Object.assign(locationForm, {
    name: location.name,
    address: location.address ?? '',
    city: location.city ?? ''
  })
}

const cancelLocationEdit = () => {
  resetLocationForm()
}

const resetTechnicianForm = () => {
  Object.assign(technicianForm, {
    display_name: '',
    bio: '',
    avatar_url: '',
    morning_quota_limit: '',
    afternoon_quota_limit: '',
    restricted_by_quota: false,
    weight: 0
  })
  editingTechnicianId.value = ''
}

const applyDefaultQuota = () => {
  technicianForm.morning_quota_limit = ''
  technicianForm.afternoon_quota_limit = ''
  technicianForm.restricted_by_quota = true
  uni.showToast({ title: '已切换至系统默认配额', icon: 'none' })
}

const saveTechnician = async () => {
  if (!technicianForm.display_name.trim()) {
    uni.showToast({ title: '请填写姓名', icon: 'none' })
    return
  }
  const morningLimit = normalizeQuotaInput(technicianForm.morning_quota_limit)
  const afternoonLimit = normalizeQuotaInput(technicianForm.afternoon_quota_limit)
  const hasPositiveCustom = ((morningLimit ?? 0) > 0) || ((afternoonLimit ?? 0) > 0)
  const hasExplicitValues = morningLimit !== null || afternoonLimit !== null
  let restrictedFlag = technicianForm.restricted_by_quota
  if (hasPositiveCustom) {
    restrictedFlag = true
  } else if (hasExplicitValues) {
    restrictedFlag = false
  }
  const payload = {
    display_name: technicianForm.display_name,
    bio: technicianForm.bio || undefined,
    avatar_url: technicianForm.avatar_url || undefined,
    restricted_by_quota: restrictedFlag,
    morning_quota_limit: morningLimit,
    afternoon_quota_limit: afternoonLimit,
    weight: normalizeWeight(technicianForm.weight)
  }
  if (editingTechnicianId.value) {
    await adminUpdateTechnician(editingTechnicianId.value, payload)
  } else {
    await adminUpsertTechnician(payload)
  }
  uni.showToast({ title: '已保存', icon: 'success' })
  resetTechnicianForm()
  loadAll()
}

const editTechnician = (technician: any) => {
  editingTechnicianId.value = technician.id
  Object.assign(technicianForm, {
    display_name: technician.display_name,
    bio: technician.bio ?? '',
    avatar_url: technician.avatar_url ?? '',
    morning_quota_limit: toInputValue(technician.morning_quota_limit),
    afternoon_quota_limit: toInputValue(technician.afternoon_quota_limit),
    restricted_by_quota: Boolean(technician.restricted_by_quota),
    weight: Number(technician.weight ?? 0)
  })
}

const cancelTechnicianEdit = () => {
  resetTechnicianForm()
}

const resetServiceForm = () => {
  Object.assign(serviceForm, { name: '', description: '', duration: 60, concurrency: 1, weight: 0 })
  editingServiceId.value = ''
}

const saveService = async () => {
  const normalizedWeight = Number(serviceForm.weight)
  const payload = {
    name: serviceForm.name,
    description: serviceForm.description || undefined,
    default_duration_minutes: Number(serviceForm.duration) || 60,
    concurrency_level: Number(serviceForm.concurrency) || 1,
    weight: Number.isFinite(normalizedWeight) ? normalizedWeight : 0
  }
  if (!payload.name.trim()) {
    uni.showToast({ title: '请输入服务名称', icon: 'none' })
    return
  }
  if (payload.default_duration_minutes <= 0 || payload.concurrency_level <= 0) {
    uni.showToast({ title: '时长/并发需大于0', icon: 'none' })
    return
  }
  if (editingServiceId.value) {
    await adminUpdateService(editingServiceId.value, payload)
  } else {
    await adminUpsertService(payload)
  }
  uni.showToast({ title: '已保存', icon: 'success' })
  resetServiceForm()
  loadAll()
}

const editService = (service: any) => {
  editingServiceId.value = service.id
  Object.assign(serviceForm, {
    name: service.name,
    description: service.description ?? '',
    duration: service.default_duration_minutes ?? 60,
    concurrency: service.concurrency_level ?? 1,
    weight: service.weight ?? 0
  })
}

const cancelServiceEdit = () => {
  resetServiceForm()
}

const resetOfferingForm = () => {
  offeringForm.price = 0
  offeringForm.duration = 0
  offeringSelections.location = null
  offeringSelections.technician = null
  offeringSelections.service = null
  editingOfferingId.value = ''
}

const saveOffering = async () => {
  if (!(offeringSelections.location && offeringSelections.technician && offeringSelections.service)) {
    uni.showToast({ title: '请选择地点/技师/服务', icon: 'none' })
    return
  }
  const payload: Record<string, any> = {
    location_id: offeringSelections.location.id,
    technician_id: offeringSelections.technician.id,
    service_id: offeringSelections.service.id,
    price: offeringForm.price
  }
  if (offeringForm.duration) {
    payload.duration_minutes = offeringForm.duration
  }
  if (editingOfferingId.value) {
    await adminUpdateOffering(editingOfferingId.value, payload)
  } else {
    await adminUpsertOffering(payload)
  }
  uni.showToast({ title: '已保存', icon: 'success' })
  resetOfferingForm()
  loadAll()
}

const editOffering = (offering: any) => {
  editingOfferingId.value = offering.id
  offeringForm.price = Number(offering.price) || 0
  offeringForm.duration = Number(offering.duration_minutes) || 0
  offeringSelections.location = locations.value.find((item) => item.id === offering.location_id) ?? null
  offeringSelections.technician = technicians.value.find((item) => item.id === offering.technician_id) ?? null
  offeringSelections.service = services.value.find((item) => item.id === offering.service_id) ?? null
}

const cancelOfferingEdit = () => {
  resetOfferingForm()
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

const deleteLocation = (id: string) =>
  confirmDelete(async () => {
    await adminDeleteLocation(id)
    if (editingLocationId.value === id) {
      resetLocationForm()
    }
  })

const deleteTechnician = (id: string) =>
  confirmDelete(async () => {
    await adminDeleteTechnician(id)
    if (editingTechnicianId.value === id) {
      resetTechnicianForm()
    }
  })

const deleteService = (id: string) =>
  confirmDelete(async () => {
    await adminDeleteService(id)
    if (editingServiceId.value === id) {
      resetServiceForm()
    }
  })

const deleteOffering = (id: string) =>
  confirmDelete(async () => {
    await adminDeleteOffering(id)
    if (editingOfferingId.value === id) {
      resetOfferingForm()
    }
  })

onShow(loadAll)
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  padding: 32rpx;
  background: #f6f7fb;
}

.page-header {
  padding: 12rpx 0 28rpx;
}

.page-title {
  font-size: 42rpx;
  font-weight: 600;
  color: #111827;
}

.page-subtitle {
  display: block;
  margin-top: 8rpx;
  font-size: 26rpx;
  color: #6b7280;
}

.panel {
  background: linear-gradient(135deg, #ffffff 0%, #fbfcff 100%);
  border-radius: 20rpx;
  padding: 28rpx;
  margin-bottom: 28rpx;
  border: 1px solid #e7eaf3;
  box-shadow: 0 16rpx 40rpx rgba(15, 23, 42, 0.08);

  &__title {
    font-size: 32rpx;
    font-weight: 600;
    margin-bottom: 20rpx;
    color: #0f172a;
  }
}

.list-item {
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
  padding: 20rpx;
  border-radius: 16rpx;
  background: #f9fafc;
  border: 1px solid #edf0f7;
  margin-bottom: 16rpx;
}

.list-item--tech {
  align-items: flex-start;
}

.list-item__info {
  flex: 1;
}

.list-item__title {
  display: block;
  font-weight: 600;
  font-size: 30rpx;
  color: #111827;
}

.list-item__desc {
  display: block;
  margin-top: 8rpx;
  font-size: 26rpx;
  color: #6b7280;
}

.list-item__meta {
  display: block;
  margin-top: 6rpx;
  font-size: 24rpx;
  color: #94a3b8;
}

.list-item__actions {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  margin-left: 12rpx;
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

  &--soft {
    background: #edf2ff;
    color: #475569;
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

.form-field {
  margin-bottom: 16rpx;

  &__label {
    display: block;
    margin-bottom: 8rpx;
    font-size: 26rpx;
    color: #666;
  }
}

.form-actions {
  display: flex;
  gap: 12rpx;
  flex-wrap: wrap;
  margin-top: 8rpx;
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

.badge-group {
  display: flex;
  gap: 12rpx;
  flex-wrap: wrap;
  margin-top: 8rpx;
}

.hint-text {
  display: block;
  margin: 8rpx 0;
  font-size: 24rpx;
  color: #9ca3af;
}

.inline-actions {
  display: flex;
  gap: 12rpx;
  flex-wrap: wrap;
  margin-bottom: 8rpx;
}

.ghost-btn {
  border-color: #d5d8e1;
  color: #5c6275;
}
</style>
