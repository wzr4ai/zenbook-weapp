import { useUserStore } from "@/store/user";

const adminPages = new Set<string>([
  "/pages_admin/dashboard/index",
  "/pages_admin/appt_create/index",
  "/pages_admin/schedule_mgmt/index",
  "/pages_admin/catalog_mgmt/index",
]);

function extractPath(url: string | undefined) {
  if (!url) return "";
  return url.split("?")[0] ?? "";
}

function registerGuard(api: "navigateTo" | "redirectTo" | "reLaunch") {
  uni.addInterceptor(api, {
    invoke(args) {
      const targetPath = extractPath(args.url);
      if (!targetPath) return args;

      if (adminPages.has(targetPath)) {
        const userStore = useUserStore();
        if (!userStore.isAdmin) {
          uni.showToast({ title: "仅管理员可进入", icon: "none" });
          return false;
        }
      }
      return args;
    },
  });
}

export function setupNavigationGuards() {
  registerGuard("navigateTo");
  registerGuard("redirectTo");
  registerGuard("reLaunch");
}
