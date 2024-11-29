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
      const blockRules = domains.map((d, id) => ({
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