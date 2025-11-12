const getEnv = () => {
  const mode = import.meta?.env?.MODE || import.meta?.env?.NODE_ENV || 'development'
  return mode
}

const isDevEnv = () => getEnv() !== 'production'

const sanitize = (value, fallback = '') => {
  if (value === undefined || value === null) {
    return fallback
  }
  if (typeof value === 'string') {
    return value
  }
  try {
    return JSON.stringify(value)
  } catch (_) {
    return String(value)
  }
}

const truncate = (value, max = 200) => {
  if (value.length <= max) {
    return value
  }
  return `${value.slice(0, max - 3)}...`
}

const report = (level, message, error) => {
  if (typeof uni === 'undefined') {
    return
  }

  const safeMessage = truncate(sanitize(message))
  const safeDetail = truncate(sanitize(error?.message || error || ''), 200)
  const payload = {
    level,
    message: safeMessage,
    detail: safeDetail,
    code: error?.code || ''
  }

  try {
    if (typeof uni.reportAnalytics === 'function') {
      uni.reportAnalytics('client_log', payload)
    }
  } catch (_) {
    // Ignore failures to report diagnostics so we never break UX
  }
}

export const logger = {
  error(message, error) {
    if (isDevEnv()) {
      console.error(message, error)
      return
    }
    report('error', message, error)
  },
  warn(message, error) {
    if (isDevEnv()) {
      console.warn(message, error)
      return
    }
    report('warn', message, error)
  }
}
