<template>
  <view class="page">
    <view class="panel">
      <text class="panel__title">就诊人列表</text>
      <view v-for="patient in patients" :key="patient.id" class="patient">
        <view>
          <text class="patient__name">
            {{ patient.name }} ({{ patient.relation }})
          </text>
          <text class="patient__row">电话：{{ patient.phone }}</text>
        </view>
        <view class="patient__actions">
          <button size="mini" @tap="prefill(patient)">编辑</button>
          <button size="mini" type="warn" @tap="remove(patient)">删除</button>
        </view>
      </view>
      <view v-if="!patients.length" class="empty">暂无就诊人，先添加一个</view>
    </view>

    <view class="panel">
      <text class="panel__title">{{ form.id ? '编辑就诊人' : '新增就诊人' }}</text>
      <view class="form-item">
        <text>姓名</text>
        <input v-model="form.name" placeholder="请输入姓名" />
      </view>
      <view class="form-item">
        <text>联系电话</text>
        <input v-model="form.phone" placeholder="11位手机号" />
      </view>
      <view class="form-item">
        <text>关系</text>
        <input v-model="form.relation" placeholder="例如 本人 / 父亲" />
      </view>
      <button class="primary-btn" type="primary" @tap="submit">
        {{ form.id ? '保存' : '添加' }}
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import {
  listPatients,
  createPatient,
  updatePatient,
  deletePatient
} from '../../api/patients'

const patients = ref<any[]>([])
const form = reactive({
  id: '',
  name: '',
  phone: '',
  relation: ''
})

const fetchPatients = async () => {
  patients.value = await listPatients()
}

const resetForm = () => {
  form.id = ''
  form.name = ''
  form.phone = ''
  form.relation = ''
}

const prefill = (patient: any) => {
  Object.assign(form, patient)
}

const remove = (patient: any) => {
  uni.showModal({
    title: '确认删除',
    content: `删除 ${patient.name}?`,
    success: async ({ confirm }) => {
      if (confirm) {
        await deletePatient(patient.id)
        await fetchPatients()
      }
    }
  })
}

const submit = async () => {
  if (!form.name || !form.phone) {
    uni.showToast({ title: '姓名和电话必填', icon: 'none' })
    return
  }
  const payload = {
    name: form.name,
    phone: form.phone,
    relation: form.relation
  }
  if (form.id) {
    await updatePatient(form.id, payload)
  } else {
    await createPatient(payload)
  }
  uni.showToast({ title: '保存成功', icon: 'success' })
  resetForm()
  await fetchPatients()
}

onShow(() => {
  fetchPatients()
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
  margin-bottom: 32rpx;

  &__title {
    font-size: 30rpx;
    font-weight: 600;
    margin-bottom: 20rpx;
  }
}

.patient {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20rpx;
  padding-bottom: 16rpx;
  border-bottom: 1rpx solid #f2f2f2;

  &__name {
    font-size: 30rpx;
    font-weight: 600;
  }

  &__row {
    color: #7a7a7a;
    font-size: 24rpx;
  }
}

.patient__actions button + button {
  margin-left: 12rpx;
}

.empty {
  text-align: center;
  color: #aaa;
}

.form-item {
  margin-bottom: 20rpx;

  text {
    display: block;
    color: #777;
    margin-bottom: 8rpx;
  }

  input {
    background: #f5f6fb;
    border-radius: 12rpx;
    padding: 16rpx;
  }
}

.primary-btn {
  width: 100%;
  border-radius: 999px;
}
</style>
