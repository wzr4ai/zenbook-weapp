import { request } from './request'

export const fetchProfile = () =>
  request({
    url: '/users/me'
  })

export const updateProfile = (payload) =>
  request({
    url: '/users/me',
    method: 'PATCH',
    data: payload
  })
