// Lưu trữ và quản lý state của extension
const STORAGE_KEYS = {
  DOMAINS: 'blockedDomains',
  IS_BLOCKING: 'isBlocking',
}

export const getStorage = async () => {
  return await chrome.storage.local.get()
}

export const updateStorage = async (data) => {
  await chrome.storage.local.set(data)
}

export const getBlockedDomains = async () => {
  const { blockedDomains } = await chrome.storage.local.get([STORAGE_KEYS.DOMAINS])
  return blockedDomains?.domains || {}
}

export const getIsBlocking = async () => {
  const { isBlocking } = await chrome.storage.local.get([STORAGE_KEYS.IS_BLOCKING])
  return isBlocking || false
}
