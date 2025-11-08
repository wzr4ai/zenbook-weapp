const defaultOptions = {
  keyPrefix: 'zenbook__'
}

export const createPersistPlugin = (options = {}) => {
  const { keyPrefix } = { ...defaultOptions, ...options }
  return ({ store }) => {
    const storageKey = `${keyPrefix}${store.$id}`
    try {
      const cache = uni.getStorageSync(storageKey)
      if (cache) {
        store.$patch(JSON.parse(cache))
      }
    } catch (error) {
      console.warn('Failed to hydrate store', error)
    }

    store.$subscribe(
      (_, state) => {
        try {
          uni.setStorageSync(storageKey, JSON.stringify(state))
        } catch (error) {
          console.warn('Failed to persist store', error)
        }
      },
      { detached: true }
    )
  }
}
