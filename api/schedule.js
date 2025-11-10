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

export const listExceptions = () =>
  request({
    url: '/admin/schedule/exceptions'
  })

export const saveBusinessHour = (payload) =>
  request({
    url: '/admin/schedule/business-hours',
    method: 'POST',
    data: Array.isArray(payload) ? payload : [payload]
  })

export const saveException = (payload) =>
  request({
    url: '/admin/schedule/exceptions',
    method: 'POST',
    data: payload
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

export const deleteException = (id) =>
  request({
    url: `/admin/schedule/exceptions/${id}`,
    method: 'DELETE'
  })
