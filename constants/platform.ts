const resolveUniPlatform = () => {
  const envPlatform = import.meta.env?.UNI_PLATFORM
  if (envPlatform) {
    return envPlatform
  }
  if (typeof process !== 'undefined' && process.env?.UNI_PLATFORM) {
    return process.env.UNI_PLATFORM
  }
  return ''
}

export const UNI_PLATFORM = resolveUniPlatform().toLowerCase()
export const isH5Platform = UNI_PLATFORM === 'h5'
