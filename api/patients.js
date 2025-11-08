import { request } from './request'

export const listPatients = () =>
  request({
    url: '/users/patients'
  })

export const createPatient = (payload) =>
  request({
    url: '/users/patients',
    method: 'POST',
    data: payload
  })

export const updatePatient = (id, payload) =>
  request({
    url: `/users/patients/${id}`,
    method: 'PUT',
    data: payload
  })

export const deletePatient = (id) =>
  request({
    url: `/users/patients/${id}`,
    method: 'DELETE'
  })
