<template>
  <scroll-view class="page" scroll-y>
    <view class="card">
      <view class="card__header">我的就诊人</view>
      <view v-if="patients.length === 0" class="empty">暂无就诊人，请添加</view>
      <view
        v-for="patient in patients"
        :key="patient.id"
        class="patient-item"
      >
        <view>
          <text class="patient-item__name">{{ patient.name }}</text>
          <text class="patient-item__meta">
            {{ patient.relation || "关系未填" }} · {{ patient.phone || "电话未填" }}
          </text>
        </view>
        <view class="patient-item__actions">
          <button size="mini" @tap="() => startEdit(patient)">编辑</button>
          <button
            size="mini"
            type="warn"
            @tap="() => removePatient(patient.id)"
          >
            删除
          </button>
        </view>
      </view>
    </view>

    <view class="card">
      <view class="card__header">
        {{ editingId ? "编辑就诊人" : "新增就诊人" }}
      </view>
      <view class="form-group">
        <text>姓名</text>
        <input v-model="form.name" placeholder="必填" />
      </view>
      <view class="form-group">
        <text>关系</text>
        <input v-model="form.relation" placeholder="可选，如父亲/本人" />
      </view>
      <view class="form-group">
        <text>联系电话</text>
        <input v-model="form.phone" placeholder="可选" />
      </view>
      <button class="primary-btn" :loading="saving" @tap="submit">
        {{ editingId ? "保存修改" : "添加就诊人" }}
      </button>
      <button v-if="editingId" class="ghost-btn" @tap="resetForm">取消编辑</button>
    </view>
  </scroll-view>
</template>

<script setup lang="ts">
import { onShow } from "@dcloudio/uni-app";
import { reactive, ref } from "vue";
import { patientsApi, type Patient } from "@/api/patients";

const patients = ref<Patient[]>([]);
const saving = ref(false);
const editingId = ref<string | null>(null);
const form = reactive({
  name: "",
  relation: "",
  phone: "",
});

onShow(() => {
  fetchPatients();
});

async function fetchPatients() {
  patients.value = await patientsApi.list();
}

function startEdit(patient: Patient) {
  editingId.value = patient.id;
  form.name = patient.name;
  form.relation = patient.relation ?? "";
  form.phone = patient.phone ?? "";
}

function resetForm() {
  editingId.value = null;
  form.name = "";
  form.relation = "";
  form.phone = "";
}

async function submit() {
  if (!form.name.trim()) {
    uni.showToast({ title: "请填写姓名", icon: "none" });
    return;
  }
  saving.value = true;
  try {
    if (editingId.value) {
      await patientsApi.update(editingId.value, {
        name: form.name.trim(),
        relation: form.relation || undefined,
        phone: form.phone || undefined,
      });
    } else {
      await patientsApi.create({
        name: form.name.trim(),
        relation: form.relation || undefined,
        phone: form.phone || undefined,
      });
    }
    await fetchPatients();
    resetForm();
    uni.showToast({ title: "已保存", icon: "success" });
  } finally {
    saving.value = false;
  }
}

async function removePatient(id: string) {
  const confirmRes = await new Promise<UniApp.ShowModalRes>((resolve) => {
    uni.showModal({
      title: "确认删除",
      content: "删除后将无法预约该就诊人",
      success: resolve,
    });
  });
  if (!confirmRes.confirm) return;
  await patientsApi.remove(id);
  await fetchPatients();
  uni.showToast({ title: "已删除", icon: "success" });
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 32rpx;
  background: #f5f6fa;
}

.card {
  background: #fff;
  border-radius: 32rpx;
  padding: 24rpx 32rpx;
  margin-bottom: 24rpx;
}

.card__header {
  font-size: 30rpx;
  font-weight: 600;
  margin-bottom: 20rpx;
}

.patient-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 2rpx solid #f5f5f5;
}

.patient-item:last-child {
  border-bottom: none;
}

.patient-item__name {
  font-size: 32rpx;
  font-weight: 600;
}

.patient-item__meta {
  display: block;
  color: #888;
  font-size: 26rpx;
  margin-top: 8rpx;
}

.patient-item__actions button {
  margin-left: 12rpx;
}

.empty {
  text-align: center;
  padding: 40rpx 0;
  color: #888;
}

.form-group {
  margin-bottom: 24rpx;
}

.form-group text {
  display: block;
  margin-bottom: 12rpx;
  color: #555;
}

input {
  border: 2rpx solid #e5e5e5;
  border-radius: 24rpx;
  padding: 20rpx;
  font-size: 28rpx;
}

.primary-btn,
.ghost-btn {
  width: 100%;
  border-radius: 999rpx;
  padding: 24rpx 0;
  font-size: 30rpx;
}

.primary-btn {
  background: #04c1a1;
  color: #fff;
  margin-top: 8rpx;
}

.ghost-btn {
  border: 2rpx solid #04c1a1;
  color: #04c1a1;
  background: #fff;
  margin-top: 16rpx;
}
</style>
