import { request } from './request'

export const createAppointment = (payload) =>
  request({
    url: '/appointments',
    method: 'POST',
    data: payload
  })

export const listMyAppointments = (params = {}) =>
  request({
    url: '/appointments/me',
    data: params
  })

export const cancelAppointment = (id) =>
  request({
    url: `/appointments/${id}/cancel`,
    method: 'POST'
  })

// Admin endpoints
export const listAllAppointments = (params = {}) =>
  request({
    url: '/admin/appointments',
    data: params
  })

export const adminCreateAppointment = (payload) =>
  request({
    url: '/admin/appointments',
    method: 'POST',
    data: payload
  })

export const adminUpdateAppointment = (id, payload) =>
  request({
    url: `/admin/appointments/${id}`,
    method: 'PUT',
    data: payload
  })
