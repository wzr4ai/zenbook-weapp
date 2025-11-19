import { request } from './request'

export const login = (payload) =>
  request({
    url: '/auth/login',
    method: 'POST',
    data: payload
  })

export const phoneLogin = (payload) =>
  request({
    url: '/auth/login/phone',
    method: 'POST',
    data: payload
  })

export const sendSmsCode = (payload) =>
  request({
    url: '/auth/sms',
    method: 'POST',
    data: payload
  })
