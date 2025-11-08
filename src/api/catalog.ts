import { request } from "./request";

export interface Location {
  id: string;
  name: string;
  address?: string;
}

export interface Technician {
  id: string;
  name: string;
  bio?: string;
  avatar_url?: string;
}

export interface Service {
  id: string;
  name: string;
  duration_minutes: number;
  concurrency_limit?: number;
}

export interface Offering {
  id: string;
  technician_id: string;
  service_id: string;
  location_id: string;
  price: number;
  duration_minutes: number;
  technician?: Technician;
  service?: Service;
  location?: Location;
}

export const catalogApi = {
  listLocations() {
    return request<Location[]>({ url: "/catalog/locations" });
  },
  listTechnicians() {
    return request<Technician[]>({
      url: "/catalog/technicians",
    });
  },
  listServices() {
    return request<Service[]>({
      url: "/catalog/services",
    });
  },
  listOfferings() {
    return request<Offering[]>({
      url: "/catalog/offerings",
    });
  },
};
