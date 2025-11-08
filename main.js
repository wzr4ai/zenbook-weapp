import App from './App'
import './uni.promisify.adaptor'
import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'
import { setupNavigationGuards } from './router/guards'
import { createPersistPlugin } from './store/plugins/persist'

export function createApp() {
  const app = createSSRApp(App)
  const pinia = createPinia()
  pinia.use(createPersistPlugin())
  app.use(pinia)

  setupNavigationGuards(pinia)

  return {
    app
  }
}
