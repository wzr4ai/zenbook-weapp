import { createSSRApp } from 'vue';

import App from './App.vue';
import { createPinia } from './store/pinia-lite';
import { useUserStore } from './store/user';

export function createApp() {
  const app = createSSRApp(App);
  app.use(createPinia());

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
