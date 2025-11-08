import { request } from "./request";

export interface Patient {
  id: string;
  name: string;
  relation?: string;
  phone?: string;
  preferred_technician_id?: string | null;
}

export interface PatientPayload {
  name: string;
  relation?: string;
  phone?: string;
}

export const patientsApi = {
  list() {
    return request<Patient[]>({
      url: "/users/patients",
    });
  },
  create(payload: PatientPayload) {
    return request<Patient, PatientPayload>({
      url: "/users/patients",
      method: "POST",
      data: payload,
    });
  },
  update(id: string, payload: PatientPayload) {
    return request<Patient, PatientPayload>({
      url: `/users/patients/${id}`,
      method: "PUT",
      data: payload,
    });
  },
  remove(id: string) {
    return request<void>({
      url: `/users/patients/${id}`,
      method: "DELETE",
    });
  },
};
