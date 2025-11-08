import { request } from './request'

export const listUsers = () =>
  request({
    url: '/admin/users'
  })

export const listAllPatients = () =>
  request({
    url: '/admin/patients'
  })
