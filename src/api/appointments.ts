import { request } from "./request";

interface BaseAppointmentPayload {
  offering_id: string;
  start_time: string;
  notes?: string;
}

export interface CustomerAppointmentPayload extends BaseAppointmentPayload {
  patient_id: string;
}

export interface AdminAppointmentPayload extends BaseAppointmentPayload {
  patient_id?: string;
  patient_name?: string;
}

export interface Appointment {
  id: string;
  offering_id: string;
  patient_id: string;
  start_time: string;
  end_time: string;
  status: "scheduled" | "completed" | "cancelled";
  technician_name?: string;
  service_name?: string;
  location_name?: string;
  price_at_booking?: number;
  notes?: string;
  booked_by_role?: string;
}

export interface AppointmentFilters {
  status?: string;
}

export const appointmentsApi = {
  create(payload: CustomerAppointmentPayload) {
    return request<
      { appointment_id: string; status: string },
      CustomerAppointmentPayload
    >({
      {
        url: "/appointments",
        method: "POST",
        data: payload,
      },
    );
  },
  createAdmin(payload: AdminAppointmentPayload) {
    return request<{ appointment_id: string }, AdminAppointmentPayload>({
      url: "/admin/appointments",
      method: "POST",
      data: payload,
    });
  },
  getDetail(id: string) {
    return request<Appointment>({
      url: `/appointments/${id}`,
      method: "GET",
    });
  },
  listMine(filters?: AppointmentFilters) {
    return request<Appointment[]>({
      url: "/appointments/me",
      method: "GET",
      params: filters,
    });
  },
  cancel(id: string) {
    return request<{ status: string }>({
      url: `/appointments/${id}/cancel`,
      method: "POST",
    });
  },
  listAdmin(filters?: Record<string, string>) {
    return request<Appointment[]>({
      url: "/admin/appointments",
      method: "GET",
      params: filters,
    });
  },
};
