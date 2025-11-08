import { request } from "./request";

export interface AvailabilityParams {
  date: string;
  location_id: string;
  technician_id: string;
  service_id: string;
}

export interface AvailabilitySlot {
  start: string;
  end: string;
  reason?: string | null;
  remaining_capacity?: number;
}

export const scheduleApi = {
  getAvailability(params: Partial<AvailabilityParams>) {
    return request<AvailabilitySlot[]>({
      url: "/schedule/availability",
      method: "GET",
      params,
      auth: false,
    });
  },
};
