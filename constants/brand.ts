const DEFAULT_CLINIC_NAME = 'ZenBook'

const envName = (import.meta.env?.VITE_CLINIC_NAME ?? '').toString().trim()

export const CLINIC_NAME = envName || DEFAULT_CLINIC_NAME

export { DEFAULT_CLINIC_NAME }
