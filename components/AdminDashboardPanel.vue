<template>
  <view class="panel stats">
    <view class="stats__item">
      <text class="stats__value">{{ todayCount }}</text>
      <text class="stats__label">今日预约</text>
    </view>
    <view class="stats__item">
      <text class="stats__value">{{ pendingCount }}</text>
      <text class="stats__label">待服务</text>
    </view>
  </view>

  <view class="panel">
    <text class="panel__title">未来 7 天预约</text>
    <view
      v-for="day in nextSevenDays"
      :key="day.date"
      class="day"
    >
      <view class="day__header" @tap="expand(day.date)">
        <view>
          <text class="day__label">{{ day.label }}</text>
          <text class="day__sub">{{ day.calendar }}</text>
        </view>
        <view class="day__meta">
          <text class="day__count">{{ day.appointments.length }} 个预约</text>
          <text class="day__chevron" :class="{ 'day__chevron--open': expandedDate === day.date }">⌄</text>
        </view>
      </view>
      <view v-if="expandedDate === day.date" class="day__body">
        <view
          v-for="item in day.appointments"
          :key="item.id"
          class="slot"
          @tap="$emit('edit', item.id)"
        >
          <text class="slot__time">{{ formatRange(item.start_time, item.end_time) }}</text>
          <text class="slot__meta">
            {{ item.patient_name || '未登记客户' }} · {{ item.service_name || '未指定项目' }}
          </text>
        </view>
        <view v-if="!day.appointments.length" class="day__empty">
          <text>暂无预约</text>
          <button size="mini" type="primary" @tap.stop="$emit('create', day.date)">去手动预约</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = defineProps<{
  appointments: any[]
  todayCount: number
  pendingCount: number
}>()

defineEmits<{
  (e: 'create', date?: string): void
  (e: 'schedule'): void
  (e: 'catalog'): void
  (e: 'users'): void
  (e: 'edit', id: string): void
}>()

const expandedDate = ref('')

const formatLocalDate = (value: Date) => {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const buildDays = () => {
  const result: Array<{ date: string; label: string; calendar: string; appointments: any[] }> = []
  const base = new Date()
  base.setHours(0, 0, 0, 0)
  for (let i = 0; i < 7; i += 1) {
    const date = new Date(base)
    date.setDate(base.getDate() + i)
    const iso = formatLocalDate(date)
    result.push({
      date: iso,
      label: buildLabel(i),
      calendar: buildCalendar(date),
      appointments: [],
    })
  }
  return result
}

const buildLabel = (index: number) => {
  if (index === 0) return '今天'
  if (index === 1) return '明天'
  if (index === 2) return '后天'
  return `${index}天后`
}

const buildCalendar = (date: Date) => {
  const mapping = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return `${date.getMonth() + 1}月${date.getDate()}日 ${mapping[date.getDay()]}`
}

const nextSevenDays = computed(() => {
  const days = buildDays()
  const map: Record<string, (typeof days)[number]> = {}
  days.forEach((day) => {
    map[day.date] = day
  })
  ;(props.appointments || []).forEach((item) => {
    if (!item?.start_time) return
    const key = item.start_time.split('T')[0]
    if (map[key]) {
      map[key].appointments.push(item)
    }
  })
  days.forEach((day) => {
    day.appointments.sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''))
  })
  return days
})

watch(
  nextSevenDays,
  (days) => {
    expandedDate.value = days[0]?.date ?? ''
  },
  { immediate: true }
)

const expand = (date: string) => {
  expandedDate.value = date
}

const padTime = (value?: string) => {
  if (!value) return ''
  const [, time] = value.split('T')
  return (time || value).slice(0, 5)
}

const formatRange = (start?: string, end?: string) => {
  const begin = padTime(start)
  const finish = padTime(end)
  if (!begin && !finish) return '未设置'
  return `${begin} - ${finish}`
}
</script>

<style scoped lang="scss">
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

.stats {
  display: flex;
  justify-content: space-between;

  &__item {
    flex: 1;
    text-align: center;
  }

  &__value {
    display: block;
    font-size: 48rpx;
    font-weight: 700;
  }

  &__label {
    color: #888;
  }
}

.day {
  border: 1px solid #eef0f5;
  border-radius: 16rpx;
  margin-top: 16rpx;

  &:first-of-type {
    margin-top: 0;
  }
}

.day__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 24rpx;
  cursor: pointer;
}

.day__label {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
}

.day__sub {
  display: block;
  font-size: 24rpx;
  color: #94a3b8;
}

.day__meta {
  text-align: right;
}

.day__count {
  display: block;
  font-size: 24rpx;
  color: #111;
}

.day__chevron {
  display: inline-block;
  font-size: 28rpx;
  transition: transform 0.2s;

  &--open {
    transform: rotate(180deg);
  }
}

.day__body {
  padding: 0 24rpx 20rpx;
  border-top: 1px solid #eef0f5;
}

.slot {
  padding: 20rpx 0;
  border-bottom: 1px solid #f0f2f8;

  &:last-child {
    border-bottom: none;
  }

  &__time {
    display: block;
    font-size: 28rpx;
    font-weight: 600;
  }

  &__meta {
    display: block;
    margin-top: 6rpx;
    font-size: 24rpx;
    color: #64748b;
  }
}

.day__empty {
  padding: 24rpx 0;
  text-align: center;
  color: #94a3b8;

  button {
    margin-top: 12rpx;
    border-radius: 999px;
  }
}
</style>
