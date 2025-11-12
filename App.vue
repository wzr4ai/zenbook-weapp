<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app'
import { useUserStore } from './store/user'
import { CLINIC_NAME } from './constants/brand'

const userStore = useUserStore()

onLaunch(() => {
  console.log(`${CLINIC_NAME} WeApp Launch`)
  userStore.autoLogin()
})
</script>

<style lang="scss">
page {
  background: #f5f6fb;
  font-family: 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
}
</style>
