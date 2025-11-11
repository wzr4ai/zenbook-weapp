import { request } from './request'

export const getAvailability = (params) =>
  request({
    url: '/schedule/availability',
    data: params
  })

export const listBusinessHours = () =>
  request({
    url: '/admin/schedule/business-hours'
  })

export const saveBusinessHour = (payload) =>
  request({
    url: '/admin/schedule/business-hours',
    method: 'POST',
    data: Array.isArray(payload) ? payload : [payload]
  })

export const updateBusinessHour = (id, payload) =>
  request({
    url: `/admin/schedule/business-hours/${id}`,
    method: 'PUT',
    data: payload
  })

export const deleteBusinessHour = (id) =>
  request({
    url: `/admin/schedule/business-hours/${id}`,
    method: 'DELETE'
  })
