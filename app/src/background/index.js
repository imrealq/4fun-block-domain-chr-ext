console.log('background is running')

export const getBlockedDomains = async () => {
  const { blockedDomains } = await chrome.storage.local.get(['blockedDomains'])
  return Object.values(blockedDomains?.domains || {})
}

export const updateBlockRules = async () => {
  const rules = await chrome.declarativeNetRequest.getDynamicRules()
  if (rules.length >= 50) {
    console.error('Reached max dynamic rules limit')
    return
  }

  await deleteRules(await getAllRuleIds())

  const domains = await getBlockedDomains()
  const blockRules = domains.map((d, id) => ({
    id: id + 1,
    priority: 1,
    action: { type: 'block' },
    condition: {
      urlFilter: `||${d.domain}`,
      resourceTypes: ['main_frame'],
    },
  }))

  chrome.declarativeNetRequest.updateDynamicRules({
    addRules: blockRules,
  })
}

// Get all rule IDs
export const getAllRuleIds = async () => {
  const rules = await chrome.declarativeNetRequest.getDynamicRules()
  return rules.map((rule) => rule.id)
}

// Delete rules
export const deleteRules = async (ruleIds) => {
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: ruleIds,
  })
}

export const clearBlockRules = async () => {
  const ruleIds = await getAllRuleIds()
  await deleteRules(ruleIds)
}

export const startBlockTimer = (minutes) => {
  chrome.alarms.clear('blockRulesTimer')
  chrome.alarms.create('blockRulesTimer', {
    delayInMinutes: minutes,
  })
  chrome.storage.local.set({
    isBlocking: true,
    timeLeftInSeconds: minutes * 60 * 1000,
  })
}

export const stopBlockTimer = () => {
  chrome.alarms.clear('blockRulesTimer')
  chrome.storage.local.set({ isBlocking: false, timeLeftInSeconds: 0 })
}

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'blockRulesTimer') {
    await clearBlockRules()
    chrome.storage.local.set({ isBlocking: false, timeLeftInSeconds: 0 })
    console.log('blocked time expired')
  }
})
