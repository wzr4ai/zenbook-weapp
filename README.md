# ZenBook WeApp Client

基于 Uni-App (Vue 3) 构建的 ZenBook 移动端客户。目前针对微信小程序进行了深度优化，提供流畅的“用完即走”预约体验。

### 🎨 特性

* **双角色彩蛋**：同一个小程序，普通客户看到的是清爽的预约界面；管理员登录后自动解锁强大的排班管理看板。
* **极简预约流程**：三步完成预约（选择服务/技师 -> 选择时间 -> 确认信息）。
* **实时状态同步**：基于 Pinia 的状态管理，确保预约状态在多页面间的实时一致性。

### 📦 开发环境

* Node.js >= 16
* HBuilderX (推荐) 或 VS Code + CLI
* 微信开发者工具

使用typescript

## 🚀 快速开始

```bash
# 安装依赖
cd zenbook-weapp
npm install

# 开发调试（HBuilderX CLI）
npx hbx-cli dev --platform mp-weixin

# 构建微信小程序产物
npx hbx-cli build mp-weixin --minimize
```

## 🗂️ 目录概览

```
src/
├─ api/            # REST 调用封装（auth/catalog/schedule/appointments/patients）
├─ components/     # Calendar、TimeSlotGrid、BookingCard 等复用组件
├─ pages/          # 客户主流程：index -> booking -> confirm
├─ pages_sub/      # 低频能力：profile/patients/appointments/appointment_detail
├─ pages_admin/    # 管理端分包：dashboard/appt_create/schedule_mgmt/catalog_mgmt
├─ store/          # Pinia (user / booking)
├─ router/guards.ts# 路由守卫（管理员专属页面拦截）
└─ App.vue / main.ts / uni.scss
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

- `Pinia` + `pinia-plugin-persistedstate` 管理 token 及预约选择。
- `api/request.ts` 统一注入 `Authorization` 并处理 401/403。
- 预约流程中的地点/技师/服务、可用时段均走 `store/booking` 的 action，页面仅关注展示与交互。

更多交互规范请参考 `docs/FRONTEND.md`、接口契约参考 `docs/API.md`。
