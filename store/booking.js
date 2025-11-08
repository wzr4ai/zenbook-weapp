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
    availability: []
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
    async loadOfferings(filters) {
      const data = await fetchOfferings(filters)
      this.offerings = Array.isArray(data) ? data : []
    },
    async loadAvailability(params) {
      const data = await getAvailability(params)
      this.availability = Array.isArray(data) ? data : []
    }
  }
})
