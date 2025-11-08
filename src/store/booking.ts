import { defineStore } from "pinia";
import {
  catalogApi,
  Location,
  Offering,
  Service,
  Technician,
} from "@/api/catalog";
import { AvailabilitySlot, scheduleApi } from "@/api/schedule";

interface BookingState {
  locations: Location[];
  technicians: Technician[];
  services: Service[];
  offerings: Offering[];
  selectedLocationId: string | null;
  selectedTechnicianId: string | null;
  selectedServiceId: string | null;
  selectedOfferingId: string | null;
  selectedDate: string;
  selectedSlot: AvailabilitySlot | null;
  availability: AvailabilitySlot[];
  loadingCatalog: boolean;
  loadingAvailability: boolean;
}

export const useBookingStore = defineStore("booking", {
  state: (): BookingState => ({
    locations: [],
    technicians: [],
    services: [],
    offerings: [],
    selectedLocationId: null,
    selectedTechnicianId: null,
    selectedServiceId: null,
    selectedOfferingId: null,
    selectedDate: new Date().toISOString().slice(0, 10),
    selectedSlot: null,
    availability: [],
    loadingCatalog: false,
    loadingAvailability: false,
  }),
  getters: {
    hasSelection(state): boolean {
      return Boolean(
        state.selectedLocationId &&
          state.selectedTechnicianId &&
          state.selectedServiceId,
      );
    },
    selectedOffering(state) {
      return state.offerings.find((o) => o.id === state.selectedOfferingId);
    },
  },
  actions: {
    async loadCatalog() {
      if (this.loadingCatalog) return;
      this.loadingCatalog = true;
      try {
        const [locations, technicians, services, offerings] = await Promise.all(
          [
            catalogApi.listLocations(),
            catalogApi.listTechnicians(),
            catalogApi.listServices(),
            catalogApi.listOfferings(),
          ],
        );
        this.locations = locations;
        this.technicians = technicians;
        this.services = services;
        this.offerings = offerings;
      } finally {
        this.loadingCatalog = false;
      }
    },
    setSelection({
      locationId,
      technicianId,
      serviceId,
      offeringId,
    }: {
      locationId?: string | null;
      technicianId?: string | null;
      serviceId?: string | null;
      offeringId?: string | null;
    }) {
      if (locationId !== undefined) this.selectedLocationId = locationId;
      if (technicianId !== undefined) this.selectedTechnicianId = technicianId;
      if (serviceId !== undefined) this.selectedServiceId = serviceId;
      if (offeringId !== undefined) this.selectedOfferingId = offeringId;
    },
    setDate(date: string) {
      this.selectedDate = date;
    },
    setSlot(slot: AvailabilitySlot | null) {
      this.selectedSlot = slot;
    },
    async fetchAvailability() {
      if (!this.hasSelection) return;
      this.loadingAvailability = true;
      try {
        this.availability = await scheduleApi.getAvailability({
          date: this.selectedDate,
          location_id: this.selectedLocationId ?? undefined,
          technician_id: this.selectedTechnicianId ?? undefined,
          service_id: this.selectedServiceId ?? undefined,
        });
      } finally {
        this.loadingAvailability = false;
      }
    },
    reset() {
      this.selectedSlot = null;
      this.selectedOfferingId = null;
    },
  },
  persist: {
    paths: [
      "selectedLocationId",
      "selectedTechnicianId",
      "selectedServiceId",
      "selectedDate",
    ],
  },
});
