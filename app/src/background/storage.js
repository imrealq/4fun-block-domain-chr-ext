// Lưu trữ và quản lý state của extension
const STORAGE_KEYS = {
  DOMAINS: 'blockedDomains',
  IS_BLOCKING: 'isBlocking',
  MINUTES: 'minutes',
}

export const getStorage = async () => {
  return await chrome.storage.local.get()
}

export const getMinutes = async () => {
  const { minutes } = await chrome.storage.local.get([STORAGE_KEYS.MINUTES])
  return minutes || 5
}

export const getBlockedDomains = async () => {
  const { blockedDomains } = await chrome.storage.local.get([STORAGE_KEYS.DOMAINS])
  return blockedDomains?.domains || {}
}

export const getIsBlocking = async () => {
  const { isBlocking } = await chrome.storage.local.get([STORAGE_KEYS.IS_BLOCKING])
  return isBlocking || false
}

export const setMinutes = async (minutes) => {
  await chrome.storage.local.set({ [STORAGE_KEYS.MINUTES]: minutes })
}

export const updateStorage = async (data) => {
  await chrome.storage.local.set(data)
}
