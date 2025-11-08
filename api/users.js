import { request } from './request'

export const fetchProfile = () =>
  request({
    url: '/users/me'
  })
