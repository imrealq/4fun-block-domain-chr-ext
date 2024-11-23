console.log('background is running')

// TODO: get blocked urls

chrome.declarativeNetRequest.getDynamicRules().then((rules) => {
  const ruleIds = rules.map((rule) => rule.id)

  // Docs: https://developer.chrome.com/docs/extensions/reference/api/declarativeNetRequest#limits
  const numOfRules = 50
  if (rules.length >= numOfRules) {
    console.error('Reached max dynamic rules limit')
    return
  }

  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: ruleIds,
    addRules: [{
      "id": 1,
      "priority": 1,
      "action": {
        "type": "block"
      },
      "condition": {
        "urlFilter": "||example.com",
        "resourceTypes": ["main_frame"]
      }
    }]
  })
})