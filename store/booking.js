import { defineStore } from 'pinia'
import { fetchOfferings } from '../api/catalog'
import { getAvailability } from '../api/schedule'

export const useBookingStore = defineStore('booking', {
  state: () => ({
    selectedLocation: null,
    selectedTechnician: null,
    selectedService: null,
    selectedDate: '',
    selectedSlot: null,
    selectedPatientId: '',
    notes: '',
    offerings: [],
    availability: [],
    availabilityLoading: false
  }),
  actions: {
    reset() {
      this.$reset()
    },
    setLocation(location) {
      this.selectedLocation = location
    },
    setTechnician(technician) {
      this.selectedTechnician = technician
    },
    setService(service) {
      this.selectedService = service
    },
    setDate(date) {
      this.selectedDate = date
    },
    setSlot(slot) {
      this.selectedSlot = slot
    },
    setPatient(patientId) {
      this.selectedPatientId = patientId
    },
    setNotes(value) {
      this.notes = value
    },
    clearAvailability() {
      this.availability = []
      this.selectedSlot = null
      this.availabilityLoading = false
    },
    clearOfferings() {
      this.offerings = []
    },
    async loadOfferings(filters) {
      if (
        !filters?.location_id ||
        !filters?.service_id ||
        !filters?.technician_id
      ) {
        this.clearOfferings()
        return
      }
      this.clearAvailability()
      const data = await fetchOfferings(filters)
      const matchesSelection =
        this.selectedLocation?.id === filters.location_id &&
        this.selectedTechnician?.id === filters.technician_id &&
        this.selectedService?.id === filters.service_id
      if (!matchesSelection) {
        return
      }
      this.offerings = Array.isArray(data) ? data : []
    },
    async loadAvailability(params) {
      if (
        !params?.date ||
        !params?.technician_id ||
        !params?.service_id ||
        !params?.location_id
      ) {
        this.clearAvailability()
        return
      }
      this.availabilityLoading = true
      try {
        const data = await getAvailability(params)
        this.availability = Array.isArray(data) ? data : []
        this.selectedSlot = null
      } finally {
        this.availabilityLoading = false
      }
    }
  }
})
