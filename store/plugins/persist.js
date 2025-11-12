import { logger } from '../../utils/logger'

const defaultOptions = {
  keyPrefix: 'zenbook__',
  reducers: {}
}

const cloneState = (value) => {
  try {
    return JSON.parse(JSON.stringify(value))
  } catch (error) {
    logger.warn('Failed to clone store state for persistence', error)
    return value
  }
}

export const createPersistPlugin = (options = {}) => {
  const { keyPrefix, reducers } = { ...defaultOptions, ...options }
  return ({ store }) => {
    const storageKey = `${keyPrefix}${store.$id}`
    const reducer = reducers?.[store.$id]
    const applyReducer = (candidate) => {
      if (!candidate) {
        return candidate
      }
      if (typeof reducer !== 'function') {
        return candidate
      }
      try {
        return reducer(candidate)
      } catch (error) {
        logger.warn(`Failed to apply persist reducer for store ${store.$id}`, error)
        return candidate
      }
    }
    try {
      const cache = uni.getStorageSync(storageKey)
      if (cache) {
        const parsed = JSON.parse(cache)
        const hydrated = applyReducer(parsed)
        if (hydrated) {
          store.$patch(hydrated)
        }
      }
    } catch (error) {
      logger.warn(`Failed to hydrate store ${store.$id}`, error)
    }

    store.$subscribe(
      (_, state) => {
        try {
          const snapshot = cloneState(state)
          const persistableState = applyReducer(snapshot)
          if (persistableState === undefined || persistableState === null) {
            uni.removeStorageSync(storageKey)
            return
          }
          uni.setStorageSync(storageKey, JSON.stringify(persistableState))
        } catch (error) {
          logger.warn(`Failed to persist store ${store.$id}`, error)
        }
      },
      { detached: true }
    )
  }
}
