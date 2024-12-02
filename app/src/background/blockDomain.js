import { getBlockedDomains } from './storage.js'

const createBlockRule = (domain, id) => ({
 id: id + 1,
 priority: 1,
 action: { type: 'block' },
 condition: {
   urlFilter: `||${domain}`,
   resourceTypes: ['main_frame'] 
 }
})

export const getAllRuleIds = async () => {
 const rules = await chrome.declarativeNetRequest.getDynamicRules()
 return rules.map(rule => rule.id)
}

export const deleteRules = async (ruleIds) => {
 await chrome.declarativeNetRequest.updateDynamicRules({
   removeRuleIds: ruleIds
 })
}

export const updateBlockRules = async () => {
 const rules = await chrome.declarativeNetRequest.getDynamicRules()
 if (rules.length >= 50) {
   console.error('Đã đạt giới hạn 50 rules')
   return 
 }

 await deleteRules(await getAllRuleIds())
 const domains = await getBlockedDomains()
 
 const blockRules = Object.values(domains).map((d, idx) => 
   createBlockRule(d.domain, idx)
 )
 
 chrome.declarativeNetRequest.updateDynamicRules({
   addRules: blockRules
 })
}

export const clearBlockRules = async () => {
 const ruleIds = await getAllRuleIds()
 await deleteRules(ruleIds)
}