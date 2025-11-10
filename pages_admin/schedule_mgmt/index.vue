<template>
  <scroll-view class="page" scroll-y>
    <view class="panel">
      <text class="panel__title">排班对象</text>
      <view class="selector-grid">
        <view class="form-field">
          <text class="form-field__label">地点</text>
          <picker
            mode="selector"
            :range="locationOptions"
            range-key="name"
            @change="onLocationChange"
            :disabled="!locationOptions.length"
          >
            <view class="picker-value">
              {{ selectedLocationName || (locationOptions.length ? '请选择地点' : '暂无地点') }}
            </view>
          </picker>
        </view>
        <view class="form-field">
          <text class="form-field__label">技师</text>
          <picker
            mode="selector"
            :range="technicianOptions"
            range-key="display_name"
            @change="onTechnicianChange"
            :disabled="!technicianOptions.length"
          >
            <view class="picker-value">
              {{ selectedTechnicianName || (technicianOptions.length ? '请选择技师' : '暂无技师') }}
            </view>
          </picker>
        </view>
      </view>
      <view class="hint-text" v-if="!locationOptions.length || !technicianOptions.length">
        请先在“服务配置中心”创建地点与技师
      </view>
    </view>

    <view class="panel">
      <text class="panel__title">营业时间</text>
      <view v-if="!selectionReady" class="empty">请选择地点和技师后再设置营业时间</view>
      <template v-else>
        <view v-if="filteredBusinessHours.length">
          <view v-for="item in filteredBusinessHours" :key="item.id" class="list-item">
            <view class="list-item__info">
              <text class="list-item__title">
                周{{ weekdayLabel(item.day_of_week) }} {{ item.start }} - {{ item.end }}
              </text>
              <text class="tag tag--soft">{{ periodLabel(item.start) }}</text>
            </view>
            <button size="mini" type="warn" @tap="removeHour(item.id)">删除</button>
          </view>
        </view>
        <view v-else class="empty">当前组合暂无班次</view>

        <view class="form-item">
          <text class="form-block-title">批量添加班次</text>
          <view class="form-field">
            <text class="form-field__label">选择星期（可多选）</text>
            <view class="chip-group">
              <view
                v-for="option in weekdayOptions"
                :key="option.value"
                class="chip"
                :class="{ 'chip--active': isWeekdaySelected(option.value) }"
                @tap="toggleWeekday(option.value)"
              >
                周{{ option.label }}
              </view>
            </view>
          </view>
          <view class="form-field">
            <text class="form-field__label">选择班次（可多选）</text>
            <view class="chip-group">
              <view
                v-for="option in periodOptions"
                :key="option.value"
                class="chip"
                :class="{ 'chip--active': isPeriodSelected(option.value) }"
                @tap="togglePeriod(option.value)"
              >
                {{ option.label }}
                <text class="chip__time">{{ option.range }}</text>
              </view>
            </view>
          </view>
          <text class="hint-text">将按照默认时段添加班次：上午 08:30-12:30、下午 14:00-18:00</text>
          <button class="w-full" size="mini" type="primary" @tap="saveHour">保存班次</button>
        </view>
      </template>
    </view>

    <view class="panel">
      <text class="panel__title">排班例外</text>
      <view v-if="!selectionReady" class="empty">请选择地点和技师后再设置例外</view>
      <template v-else>
        <view v-if="filteredExceptions.length">
          <view v-for="item in filteredExceptions" :key="item.id" class="list-item">
            <view class="list-item__info">
              <text class="list-item__title">{{ item.date }} {{ item.start }} - {{ item.end }}</text>
              <text class="list-item__desc">{{ item.reason || '无备注' }}</text>
            </view>
            <button size="mini" type="warn" @tap="removeException(item.id)">删除</button>
          </view>
        </view>
        <view v-else class="empty">当前组合暂无例外</view>

        <view class="form-item">
          <text class="form-block-title">新增例外</text>
          <view class="form-field">
            <text class="form-field__label">日期</text>
            <picker mode="date" :value="exceptionForm.date" @change="(e) => (exceptionForm.date = e.detail.value)">
              <view class="picker-value">{{ exceptionForm.date }}</view>
            </picker>
          </view>
          <view class="form-field">
            <text class="form-field__label">开始时间</text>
            <picker mode="time" :value="exceptionForm.start" @change="(e) => (exceptionForm.start = e.detail.value)">
              <view class="picker-value">{{ exceptionForm.start }}</view>
            </picker>
          </view>
          <view class="form-field">
            <text class="form-field__label">结束时间</text>
            <picker mode="time" :value="exceptionForm.end" @change="(e) => (exceptionForm.end = e.detail.value)">
              <view class="picker-value">{{ exceptionForm.end }}</view>
            </picker>
          </view>
          <view class="form-field">
            <text class="form-field__label">原因</text>
            <input v-model="exceptionForm.reason" placeholder="可选" class="input" />
          </view>
          <button class="w-full" size="mini" type="primary" @tap="saveExceptionItem">保存例外</button>
        </view>
      </template>
    </view>
  </scroll-view>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import {
  listBusinessHours,
  listExceptions,
  saveBusinessHour,
  saveException,
  deleteBusinessHour,
  deleteException
} from '../../api/schedule'
import { fetchLocations, fetchTechnicians } from '../../api/catalog'

const weekdayOptions = [
  { value: 0, label: '一' },
  { value: 1, label: '二' },
  { value: 2, label: '三' },
  { value: 3, label: '四' },
  { value: 4, label: '五' },
  { value: 5, label: '六' },
  { value: 6, label: '日' }
]

const periodOptions = [
  { value: 'morning', label: '上午', range: '08:30 - 12:30', defaults: { start: '08:30', end: '12:30' } },
  { value: 'afternoon', label: '下午', range: '14:00 - 18:00', defaults: { start: '14:00', end: '18:00' } }
]

const periodDefaults = periodOptions.reduce<Record<string, { start: string; end: string }>>((acc, option) => {
  acc[option.value] = option.defaults
  return acc
}, {})

const businessHours = ref<any[]>([])
const exceptions = ref<any[]>([])
const locationOptions = ref<any[]>([])
const technicianOptions = ref<any[]>([])
const selectedLocationId = ref('')
const selectedTechnicianId = ref('')
const selectedWeekdays = ref<number[]>([weekdayOptions[0].value])
const selectedPeriods = ref<string[]>([periodOptions[0].value])

const exceptionForm = reactive({
  date: new Date().toISOString().split('T')[0],
  start: periodDefaults['morning'].start,
  end: periodDefaults['afternoon'].end,
  reason: ''
})

const selectedLocationName = computed(
  () => locationOptions.value.find((item) => item.id === selectedLocationId.value)?.name ?? ''
)
const selectedTechnicianName = computed(
  () => technicianOptions.value.find((item) => item.id === selectedTechnicianId.value)?.display_name ?? ''
)
const selectionReady = computed(() => Boolean(selectedLocationId.value && selectedTechnicianId.value))

const filteredBusinessHours = computed(() =>
  businessHours.value.filter(
    (item) => item.location_id === selectedLocationId.value && item.technician_id === selectedTechnicianId.value
  )
)

const filteredExceptions = computed(() =>
  exceptions.value.filter(
    (item) => item.location_id === selectedLocationId.value && item.technician_id === selectedTechnicianId.value
  )
)

const formatTime = (value?: string) => {
  if (!value) return '--'
  return value.slice(0, 5)
}

const weekdayLabel = (value: number) => weekdayOptions.find((item) => item.value === value)?.label ?? value

const periodLabel = (start: string) => {
  if (!start) return '班次'
  return start < '13:00' ? '上午' : '下午'
}

type PickerChangeEvent = { detail: { value: number } }

const onLocationChange = (event: PickerChangeEvent) => {
  const option = locationOptions.value[Number(event.detail.value)]
  selectedLocationId.value = option?.id ?? ''
}

const onTechnicianChange = (event: PickerChangeEvent) => {
  const option = technicianOptions.value[Number(event.detail.value)]
  selectedTechnicianId.value = option?.id ?? ''
}

const isWeekdaySelected = (value: number) => selectedWeekdays.value.includes(value)

const toggleWeekday = (value: number) => {
  if (isWeekdaySelected(value)) {
    if (selectedWeekdays.value.length === 1) {
      uni.showToast({ title: '至少选择一天', icon: 'none' })
      return
    }
    selectedWeekdays.value = selectedWeekdays.value.filter((item) => item !== value)
  } else {
    selectedWeekdays.value = [...selectedWeekdays.value, value]
  }
}

const isPeriodSelected = (value: string) => selectedPeriods.value.includes(value)

const togglePeriod = (value: string) => {
  if (isPeriodSelected(value)) {
    if (selectedPeriods.value.length === 1) {
      uni.showToast({ title: '至少选择一个班次', icon: 'none' })
      return
    }
    selectedPeriods.value = selectedPeriods.value.filter((item) => item !== value)
  } else {
    selectedPeriods.value = [...selectedPeriods.value, value]
  }
}

const ensureSelection = () => {
  if (!selectedLocationId.value) {
    uni.showToast({ title: '请选择地点', icon: 'none' })
    return false
  }
  if (!selectedTechnicianId.value) {
    uni.showToast({ title: '请选择技师', icon: 'none' })
    return false
  }
  return true
}

const mapBusinessHour = (item: any) => {
  const start = formatTime(item.start_time)
  return {
    id: item.rule_id,
    location_id: item.location_id,
    technician_id: item.technician_id,
    day_of_week: item.day_of_week,
    start,
    end: formatTime(item.end_time),
    period: start < '13:00' ? 'morning' : 'afternoon'
  }
}

const mapException = (item: any) => ({
  id: item.exception_id,
  location_id: item.location_id,
  technician_id: item.technician_id,
  date: item.date,
  start: formatTime(item.start_time),
  end: formatTime(item.end_time),
  reason: item.reason || ''
})

const loadSelectors = async () => {
  const [locs, techs] = await Promise.all([fetchLocations(), fetchTechnicians()])
  locationOptions.value = locs
  technicianOptions.value = techs
  if (!selectedLocationId.value && locs.length) {
    selectedLocationId.value = locs[0].id
  }
  if (!selectedTechnicianId.value && techs.length) {
    selectedTechnicianId.value = techs[0].id
  }
}

const fetchData = async () => {
  const [hours, exs] = await Promise.all([listBusinessHours(), listExceptions()])
  businessHours.value = hours.map(mapBusinessHour)
  exceptions.value = exs.map(mapException)
}

const saveHour = async () => {
  if (!ensureSelection()) return
  const entries: any[] = []
  let skipped = 0
  for (const weekday of selectedWeekdays.value) {
    for (const period of selectedPeriods.value) {
      const defaults = periodDefaults[period]
      if (!defaults) continue
      const exists = filteredBusinessHours.value.some(
        (hour) => hour.day_of_week === weekday && hour.period === period
      )
      if (exists) {
        skipped += 1
        continue
      }
      entries.push({
        technician_id: selectedTechnicianId.value,
        location_id: selectedLocationId.value,
        day_of_week: weekday,
        start_time: defaults.start,
        end_time: defaults.end
      })
    }
  }
  if (!entries.length) {
    uni.showToast({ title: skipped ? '选择的班次已存在' : '请选择班次', icon: 'none' })
    return
  }
  await saveBusinessHour(entries)
  uni.showToast({ title: '已保存', icon: 'success' })
  await fetchData()
  if (skipped) {
    uni.showToast({ title: `${skipped} 个已存在，已跳过`, icon: 'none' })
  }
}

const removeHour = async (id: string) => {
  await deleteBusinessHour(id)
  await fetchData()
}

const resetExceptionForm = () => {
  exceptionForm.date = new Date().toISOString().split('T')[0]
  exceptionForm.start = periodDefaults['morning'].start
  exceptionForm.end = periodDefaults['afternoon'].end
  exceptionForm.reason = ''
}

const saveExceptionItem = async () => {
  if (!ensureSelection()) return
  const payload: Record<string, any> = {
    technician_id: selectedTechnicianId.value,
    location_id: selectedLocationId.value,
    date: exceptionForm.date,
    is_available: false,
    reason: exceptionForm.reason || undefined
  }
  if (exceptionForm.start) {
    payload.start_time = exceptionForm.start
  }
  if (exceptionForm.end) {
    payload.end_time = exceptionForm.end
  }
  await saveException(payload)
  uni.showToast({ title: '已保存', icon: 'success' })
  resetExceptionForm()
  await fetchData()
}

const removeException = async (id: string) => {
  await deleteException(id)
  await fetchData()
}

onShow(async () => {
  await loadSelectors()
  await fetchData()
})
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  padding: 32rpx;
  background: #f6f7fb;
}

.panel {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;

  &__title {
    font-size: 32rpx;
    font-weight: 600;
    margin-bottom: 16rpx;
  }
}

.selector-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280rpx, 1fr));
  gap: 16rpx;
}

.list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1px solid #f1f2f6;

  &:last-child {
    border-bottom: none;
  }
}

.list-item__info {
  flex: 1;
  margin-right: 24rpx;
}

.list-item__title {
  font-size: 28rpx;
  font-weight: 600;
}

.list-item__desc {
  display: block;
  margin-top: 6rpx;
  font-size: 24rpx;
  color: #6b7280;
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

.form-item {
  margin-top: 16rpx;
}

.form-block-title {
  display: block;
  font-size: 26rpx;
  font-weight: 600;
  margin-bottom: 12rpx;
}

.picker-value,
.input {
  width: 100%;
  background: #f5f6fb;
  border-radius: 12rpx;
  padding: 16rpx;
}

.hint-text {
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #9ca3af;
}

.chip-group {
  display: flex;
  gap: 16rpx;
  flex-wrap: wrap;
}

.chip {
  padding: 12rpx 20rpx;
  border-radius: 999px;
  border: 1px solid #d4d8e2;
  font-size: 24rpx;
  color: #4b5563;
}

.chip--active {
  background: #eef2ff;
  border-color: #6366f1;
  color: #312e81;
}

.chip__time {
  margin-left: 8rpx;
  font-size: 22rpx;
  color: #94a3b8;
}

.tag {
  display: inline-block;
  padding: 4rpx 12rpx;
  border-radius: 999px;
  font-size: 22rpx;
  margin-top: 8rpx;

  &--soft {
    background: #edf2ff;
    color: #475569;
  }
}

.empty {
  padding: 24rpx 0;
  font-size: 26rpx;
  color: #9ca3af;
  text-align: center;
}

.w-full {
  width: 100%;
}
</style>
