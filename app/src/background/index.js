console.log('background is running')

// TODO: get blocked urls

export const updateBlockRules = () => {
  // Get current rules
  chrome.declarativeNetRequest.getDynamicRules().then((rules) => {
    const maxRules = 50
    if (rules.length >= maxRules) {
      console.error('Reached max dynamic rules limit')
      return
    }
    
    // Get current rule IDs to remove
    const ruleIds = rules.map(rule => rule.id)
 
    // Get blocked domains from storage
    chrome.storage.local.get(["blockedDomains"]).then(result => {
      const domains = result.blockedDomains?.domains || []
 
      // Create block rules for each domain
      const blockRules = Object.values(domains).map((d, id) => ({
        id: id + 1,
        priority: 1,
        action: {
          type: 'block',
        },
        condition: {
          urlFilter: `||${d.domain}`,
          resourceTypes: ['main_frame'],
        }
      }))
 
      // Update rules by removing old and adding new
      chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: ruleIds,
        addRules: blockRules,
      })
    })
  })
 }

// Get all rule IDs
export const getAllRuleIds = async () => {
  const rules = await chrome.declarativeNetRequest.getDynamicRules()
  return rules.map(rule => rule.id)
}

// Delete rules
export const deleteRules = async (ruleIds) => {
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: ruleIds 
  })
}

export const clearBlockRules = async () => {
  const ruleIds = await getAllRuleIds()
  await deleteRules(ruleIds)
}

export const startBlockTimer = (minutes) => {
  chrome.alarms.clear('blockRulesTimer').then(() => {
    chrome.alarms.create('blockRulesTimer', {
      delayInMinutes: minutes
    })
  })
}

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'blockRulesTimer') {
    await clearBlockRules() 
  }
})