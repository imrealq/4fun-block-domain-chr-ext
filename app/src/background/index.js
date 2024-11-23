console.log('background is running')

// TODO: get blocked urls

chrome.declarativeNetRequest.getDynamicRules().then((rules) => {
  const ruleIds = rules.map((rule) => rule.id)
  const maxId = Math.max(ruleIds, 0)

  // TODO: Validate number of rules against MAX_NUMBER_OF_STATIC_RULESETS
  // Docs: https://developer.chrome.com/docs/extensions/reference/api/declarativeNetRequest#limits

  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: ruleIds,
    addRules: [{
      "id": maxId + 1,
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