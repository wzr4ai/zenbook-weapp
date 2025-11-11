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
                {{ formatRuleLabel(item.rule_date, item.day_of_week) }}
              </text>
              <view class="badge-group">
                <text
                  class="tag tag--soft"
                  v-if="item.start_time_am && item.end_time_am"
                >上午 {{ formatTime(item.start_time_am) }} - {{ formatTime(item.end_time_am) }}</text>
                <text
                  class="tag tag--soft"
                  v-if="item.start_time_pm && item.end_time_pm"
                >下午 {{ formatTime(item.start_time_pm) }} - {{ formatTime(item.end_time_pm) }}</text>
              </view>
            </view>
            <button size="mini" type="warn" @tap="removeHour(item.id)">删除</button>
          </view>
        </view>
        <view v-else class="empty">当前组合暂无班次</view>

        <view class="form-item">
          <text class="form-block-title">批量添加班次</text>
          <view class="form-field">
            <text class="form-field__label">选择日期（未来 7 天，可多选）</text>
            <view class="chip-group">
              <view
                v-for="option in dayOptions"
                :key="option.value"
                class="chip"
                :class="{ 'chip--active': isDateSelected(option.value) }"
                @tap="toggleDate(option.value)"
              >
                {{ option.value }} · {{ option.label }}
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

  </scroll-view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { listBusinessHours, saveBusinessHour, updateBusinessHour, deleteBusinessHour } from '../../api/schedule'
import { fetchLocations, fetchTechnicians } from '../../api/catalog'

const periodOptions = [
  { value: 'morning', label: '上午', range: '08:30 - 12:30', defaults: { start: '08:30', end: '12:30' } },
  { value: 'afternoon', label: '下午', range: '14:00 - 18:00', defaults: { start: '14:00', end: '18:00' } }
]

const periodDefaults = periodOptions.reduce<Record<string, { start: string; end: string }>>((acc, option) => {
  acc[option.value] = option.defaults
  return acc
}, {})

type WeekdayValue = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
type DayOption = { value: string; label: string; weekday: WeekdayValue }

const weekdayOrder: WeekdayValue[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const weekdayTextMap: Record<WeekdayValue, string> = {
  monday: '一',
  tuesday: '二',
  wednesday: '三',
  thursday: '四',
  friday: '五',
  saturday: '六',
  sunday: '日'
}
const weekdayOrderMap: Record<WeekdayValue, number> = weekdayOrder.reduce(
  (acc, value, index) => {
    acc[value] = index
    return acc
  },
  {} as Record<WeekdayValue, number>
)

const businessHours = ref<any[]>([])
const dayOptions = ref<DayOption[]>([])
const locationOptions = ref<any[]>([])
const technicianOptions = ref<any[]>([])
const selectedLocationId = ref('')
const selectedTechnicianId = ref('')
const selectedDates = ref<string[]>([])
const selectedPeriods = ref<string[]>([periodOptions[0].value])

const toISODate = (value: Date) => value.toISOString().split('T')[0]
const weekdayFromDate = (value: Date): WeekdayValue => weekdayOrder[(value.getDay() + 6) % 7]

const createDayOption = (offset: number): DayOption => {
  const base = new Date()
  base.setHours(0, 0, 0, 0)
  base.setDate(base.getDate() + offset)
  const iso = toISODate(base)
  const weekday = weekdayFromDate(base)
  return {
    value: iso,
    label: `周${weekdayTextMap[weekday]}`,
    weekday
  }
}

const refreshDayOptions = () => {
  const options = Array.from({ length: 7 }, (_, index) => createDayOption(index))
  dayOptions.value = options
  const validSelections = selectedDates.value.filter((item) => options.some((option) => option.value === item))
  if (validSelections.length) {
    selectedDates.value = validSelections
  } else if (options.length) {
    selectedDates.value = [options[0].value]
  } else {
    selectedDates.value = []
  }
}

refreshDayOptions()

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

const formatTime = (value?: string | null) => {
  if (!value) return '--'
  return value.slice(0, 5)
}

const hasSlot = (start?: string | null, end?: string | null) => Boolean(start && end)

const weekdayLabel = (value?: WeekdayValue | null) => (value ? weekdayTextMap[value] ?? value : '-')

const weekdayFromIsoDate = (value?: string | null): WeekdayValue | null => {
  if (!value) return null
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) {
    return null
  }
  return weekdayFromDate(date)
}

const formatRuleLabel = (ruleDate?: string | null, weekday?: WeekdayValue) => {
  if (!ruleDate) {
    return '未设置日期'
  }
  const resolvedWeekday = weekday ?? weekdayFromIsoDate(ruleDate)
  return `周${weekdayLabel(resolvedWeekday)}（${ruleDate}）`
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

const isDateSelected = (value: string) => selectedDates.value.includes(value)

const toggleDate = (value: string) => {
  if (isDateSelected(value)) {
    if (selectedDates.value.length === 1) {
      uni.showToast({ title: '至少选择一天', icon: 'none' })
      return
    }
    selectedDates.value = selectedDates.value.filter((item) => item !== value)
  } else {
    selectedDates.value = [...selectedDates.value, value]
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

const mapBusinessHour = (item: any) => ({
  id: item.rule_id,
  location_id: item.location_id,
  technician_id: item.technician_id,
  day_of_week: item.day_of_week as WeekdayValue,
  rule_date: item.rule_date,
  start_time_am: item.start_time_am,
  end_time_am: item.end_time_am,
  start_time_pm: item.start_time_pm,
  end_time_pm: item.end_time_pm
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
  const hours = await listBusinessHours()
  businessHours.value = hours.map(mapBusinessHour).sort((a, b) => {
    if (a.rule_date && b.rule_date) {
      return a.rule_date.localeCompare(b.rule_date)
    }
    return weekdayOrderMap[a.day_of_week] - weekdayOrderMap[b.day_of_week]
  })
}

const saveHour = async () => {
  if (!ensureSelection()) return
  if (!selectedDates.value.length) {
    uni.showToast({ title: '请选择日期', icon: 'none' })
    return
  }
  const toCreate: any[] = []
  const toUpdate: { id: string; payload: Record<string, string> }[] = []
  let skipped = 0
  const periodField = { morning: 'am', afternoon: 'pm' } as const

  for (const targetDate of selectedDates.value) {
    const existing = filteredBusinessHours.value.find((hour) => hour.rule_date === targetDate)
    if (!existing) {
      const payload: Record<string, any> = {
        technician_id: selectedTechnicianId.value,
        location_id: selectedLocationId.value,
        rule_date: targetDate
      }
      for (const period of selectedPeriods.value) {
        const defaults = periodDefaults[period]
        const suffix = periodField[period as keyof typeof periodField]
        if (!defaults || !suffix) continue
        payload[`start_time_${suffix}`] = defaults.start
        payload[`end_time_${suffix}`] = defaults.end
      }
      toCreate.push(payload)
    } else {
      const updatePayload: Record<string, string> = {}
      for (const period of selectedPeriods.value) {
        const defaults = periodDefaults[period]
        const suffix = periodField[period as keyof typeof periodField]
        if (!defaults || !suffix) continue
        const hasExisting =
          suffix === 'am'
            ? hasSlot(existing.start_time_am, existing.end_time_am)
            : hasSlot(existing.start_time_pm, existing.end_time_pm)
        if (hasExisting) {
          skipped += 1
          continue
        }
        updatePayload[`start_time_${suffix}`] = defaults.start
        updatePayload[`end_time_${suffix}`] = defaults.end
      }
      if (Object.keys(updatePayload).length) {
        toUpdate.push({ id: existing.id, payload: updatePayload })
      }
    }
  }

  if (!toCreate.length && !toUpdate.length) {
    uni.showToast({ title: skipped ? '选择的班次已存在' : '请选择班次', icon: 'none' })
    return
  }

  if (toCreate.length) {
    await saveBusinessHour(toCreate)
  }
  if (toUpdate.length) {
    await Promise.all(toUpdate.map(({ id, payload }) => updateBusinessHour(id, payload)))
  }
  uni.showToast({ title: '已保存', icon: 'success' })
  await fetchData()
  if (skipped) {
    uni.showToast({ title: `${skipped} 个班次已存在，已跳过`, icon: 'none' })
  }
}

const removeHour = async (id: string) => {
  await deleteBusinessHour(id)
  await fetchData()
}

onShow(async () => {
  refreshDayOptions()
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

.badge-group {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  margin-top: 8rpx;
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
