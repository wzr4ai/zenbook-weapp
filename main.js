import { createSSRApp } from 'vue';
import { createPinia } from 'pinia';
import piniaPersist from 'pinia-plugin-persistedstate';

import App from './App.vue';
import { useUserStore } from './store/user';

export function createApp() {
  const app = createSSRApp(App);
  const pinia = createPinia();
  pinia.use(piniaPersist);
  app.use(pinia);

  setupGuards();

  return {
    app,
  };
}

function setupGuards() {
  const userStore = useUserStore();
  const adminPages = ['/pages_admin/'];

  uni.addInterceptor('navigateTo', {
    invoke(args) {
      if (adminPages.some((prefix) => args.url.startsWith(prefix))) {
        if (!userStore.isAdmin) {
          uni.showToast({ title: '无权限访问', icon: 'none' });
          return false;
        }
      }
      return true;
    },
  });
}
