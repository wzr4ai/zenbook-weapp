import { useUserStore } from "@/store/user";

type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "PATCH"
  | "OPTIONS"
  | "HEAD";

interface RequestOptions<TData = unknown> {
  url: string;
  method?: HttpMethod;
  data?: TData;
  params?: Record<string, string | number | boolean | undefined>;
  header?: Record<string, string>;
  auth?: boolean;
}

const DEFAULT_BASE_URL = "http://localhost:8000/api/v1";
const BASE_URL =
  (import.meta.env?.VITE_API_BASE_URL as string | undefined) || DEFAULT_BASE_URL;

function buildUrl(url: string, params?: Record<string, unknown>): string {
  if (!params || Object.keys(params).length === 0) {
    return `${BASE_URL}${url}`;
  }

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    searchParams.append(key, String(value));
  });
  const queryString = searchParams.toString();
  return queryString ? `${BASE_URL}${url}?${queryString}` : `${BASE_URL}${url}`;
}

export function request<TResponse = unknown, TBody = unknown>(
  options: RequestOptions<TBody>,
): Promise<TResponse> {
  const {
    url,
    method = "GET",
    data,
    params,
    header = {},
    auth = true,
  } = options;
  const userStore = useUserStore();
  const finalHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...header,
  };

  if (auth && userStore.token) {
    finalHeaders.Authorization = `Bearer ${userStore.token}`;
  }

  return new Promise<TResponse>((resolve, reject) => {
    uni.request({
      url: buildUrl(url, params),
      method,
      data,
      header: finalHeaders,
      success(res) {
        if (res.statusCode === 401) {
          userStore.logout();
          uni.reLaunch({ url: "/pages_sub/profile/index" });
          uni.showToast({ title: "请重新登录", icon: "none" });
          return reject(new Error("Unauthorized"));
        }

        if (res.statusCode === 403) {
          uni.showToast({ title: "无访问权限", icon: "none" });
          return reject(new Error("Forbidden"));
        }

        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          return resolve(res.data as TResponse);
        }

        uni.showToast({
          title: "请求失败，请稍后再试",
          icon: "none",
        });
        return reject(res);
      },
      fail(err) {
        uni.showToast({
          title: "网络异常",
          icon: "none",
        });
        reject(err);
      },
    });
  });
}
