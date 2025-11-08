import { request } from "./request";

export type UserRole = "customer" | "admin" | "technician";

export interface UserInfo {
  id: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatar_url?: string;
}

export interface LoginPayload {
  code: string;
}

export interface LoginResponse {
  token: string;
  userInfo: UserInfo;
}

export const authApi = {
  login(payload: LoginPayload) {
    return request<LoginResponse, LoginPayload>({
      url: "/auth/login",
      method: "POST",
      data: payload,
      auth: false,
    });
  },
  profile() {
    return request<UserInfo>({
      url: "/users/me",
      method: "GET",
    });
  },
};
