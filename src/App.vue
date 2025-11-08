<script setup lang="ts">
import { onLaunch } from "@dcloudio/uni-app";
import { useUserStore } from "@/store/user";

const userStore = useUserStore();

onLaunch(() => {
  if (userStore.token) {
    userStore.fetchProfile();
  }
});
</script>

<style lang="scss">
@import "@/uni.scss";

page {
  background: #f5f5f5;
}
</style>
