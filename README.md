# ZenBook WeApp Client

基于 Uni-App (Vue 3) 构建的 ZenBook 移动端客户。目前针对微信小程序进行了深度优化，提供流畅的“用完即走”预约体验。

### 🎨 特性

* **双角色彩蛋**：同一个小程序，普通客户看到的是清爽的预约界面；管理员登录后自动解锁强大的排班管理看板。
* **极简预约流程**：三步完成预约（选择服务/技师 -> 选择时间 -> 确认信息）。
* **实时状态同步**：基于 Pinia 的状态管理，确保预约状态在多页面间的实时一致性。

### 📦 开发要求

* Node.js >= 18（仅在配合 `hbx-cli` 时需要）
* HBuilderX（推荐）或 VS Code + Uni-App CLI
* 微信开发者工具用于真机调试

## 🚀 快速开始

```bash
cd zenbook-weapp
# 启动微信小程序预览
hbx-cli dev
# 或打包成小程序
hbx-cli build mp-weixin --minimize
```

依照 `docs/FRONTEND.md` 与 `docs/PROJECT_PLAN.md`，每个阶段先执行 `hbx-cli build` 验证，再提交。

## 🔐 配置文件

1. 将 `manifest.json.example` 复制为 `manifest.json`，填写 AppID、权限等微信端敏感字段。
2. 将 `.env.local.example` 复制为 `.env.local`，设置 `VITE_API_BASE` 等后端地址。`.env*` 与 `manifest.json` 已加入 `.gitignore`，避免将私密信息提交到仓库。

## 🗂️ 目录概览

```
├─ api/            # REST 调用封装（auth/catalog/schedule/appointments/patients）
├─ components/     # Calendar、TimeSlotGrid、BookingCard 等复用组件
├─ pages/          # 客户主流程：index -> booking -> confirm
├─ pages_sub/      # 低频能力：profile/patients/appointments/appointment_detail
├─ pages_admin/    # 管理端分包：dashboard/appt_create/schedule_mgmt/catalog_mgmt
├─ store/          # Pinia (user / booking)
├─ router/guards.js# 路由守卫（管理员专属页面拦截）
└─ App.vue / main.js / uni.scss
```

## 🔑 核心页面

| 页面 | 说明 |
| --- | --- |
| `pages/index` | 级联选择地点/技师/服务，跳转可用时间 |
| `pages/booking` | 展示日历与时间槽，选槽后进入确认页 |
| `pages/confirm` | 选择就诊人、填写备注并提交预约 |
| `pages_sub/profile` | 登录、账户信息、入口到就诊人与预约列表 |
| `pages_sub/appointments` | 个人预约列表，点击到详情并允许取消 |
| `pages_admin/dashboard` | 管理员预约总览，可跳转手动预约 |

## 🧱 状态与请求

- Pinia + 自研 `store/plugins/persist` 按 store 维度落盘，满足 docs 要求的 “token & role 持久化”。
- `api/request.js` 统一注入 `Authorization`，并对 401/403 做退出/提示。
- 客户预约流程的级联筛选、Offerings/Availability 均走 `store/booking` 的 action；页面只关心展示交互。
- 管理页入口通过 `router/guards` 做 run-time 校验，额外在 `pages_sub/profile` 中渲染“进入管理后台”按钮。

更多交互规范请参考 `docs/FRONTEND.md`；接口契约参考 `docs/API.md`；场景说明见 `docs/PROJECT_PLAN.md`。
