import { defineStore } from './pinia-lite';

export const useBookingStore = defineStore('booking', {
  state: () => ({
    selectedLocation: null,
    selectedTechnician: null,
    selectedService: null,
    selectedOffering: null,
    selectedDate: '',
    availability: [],
    selectedSlot: null,
    patients: [],
    selectedPatientId: '',
    offerings: [],
  }),
  actions: {
    resetSelections() {
      this.selectedDate = '';
      this.selectedSlot = null;
      this.selectedOffering = null;
      this.availability = [];
    },
    setAvailability(slots) {
      this.availability = slots;
    },
    setOfferings(list) {
      this.offerings = list;
    },
    resolveOffering() {
      if (!this.selectedLocation || !this.selectedTechnician || !this.selectedService) {
        this.selectedOffering = null;
        return;
      }
      this.selectedOffering =
        this.offerings.find(
          (item) =>
            item.location_id === this.selectedLocation.location_id &&
            item.technician_id === this.selectedTechnician.technician_id &&
            item.service_id === this.selectedService.service_id,
        ) || null;
    },
  },
});
