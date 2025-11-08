<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app'
import { useUserStore } from './store/user'

const userStore = useUserStore()

onLaunch(() => {
  console.log('ZenBook WeApp Launch')
  userStore.hydrateProfile()
})
</script>

<style lang="scss">
page {
  background: #f5f6fb;
  font-family: 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
}
</style>
