import { request } from './request'

export const fetchLocations = () =>
  request({
    url: '/catalog/locations'
  })

export const fetchTechnicians = () =>
  request({
    url: '/catalog/technicians'
  })

export const fetchServices = () =>
  request({
    url: '/catalog/services'
  })

export const fetchOfferings = (params) =>
  request({
    url: '/catalog/offerings',
    method: 'GET',
    data: params
  })

// Admin catalog endpoints
export const adminUpsertLocation = (payload) =>
  request({
    url: '/admin/catalog/locations',
    method: 'POST',
    data: payload
  })

export const adminUpdateLocation = (id, payload) =>
  request({
    url: `/admin/catalog/locations/${id}`,
    method: 'PUT',
    data: payload
  })

export const adminUpsertTechnician = (payload) =>
  request({
    url: '/admin/catalog/technicians',
    method: 'POST',
    data: payload
  })

export const adminUpdateTechnician = (id, payload) =>
  request({
    url: `/admin/catalog/technicians/${id}`,
    method: 'PUT',
    data: payload
  })

export const adminUpsertService = (payload) =>
  request({
    url: '/admin/catalog/services',
    method: 'POST',
    data: payload
  })

export const adminUpdateService = (id, payload) =>
  request({
    url: `/admin/catalog/services/${id}`,
    method: 'PUT',
    data: payload
  })

export const adminUpsertOffering = (payload) =>
  request({
    url: '/admin/catalog/offerings',
    method: 'POST',
    data: payload
  })

export const adminUpdateOffering = (id, payload) =>
  request({
    url: `/admin/catalog/offerings/${id}`,
    method: 'PUT',
    data: payload
  })

export const adminDeleteLocation = (id) =>
  request({
    url: `/admin/catalog/locations/${id}`,
    method: 'DELETE'
  })

export const adminDeleteTechnician = (id) =>
  request({
    url: `/admin/catalog/technicians/${id}`,
    method: 'DELETE'
  })

export const adminDeleteService = (id) =>
  request({
    url: `/admin/catalog/services/${id}`,
    method: 'DELETE'
  })

export const adminDeleteOffering = (id) =>
  request({
    url: `/admin/catalog/offerings/${id}`,
    method: 'DELETE'
  })
