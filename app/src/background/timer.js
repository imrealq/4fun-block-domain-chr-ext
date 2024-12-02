import { updateStorage } from './storage.js'
import { updateBlockRules, clearBlockRules } from './blockDomain.js'

export const startBlockTimer = (minutes) => {
 chrome.alarms.clear('blockTimer')
 chrome.alarms.create('blockTimer', {
   delayInMinutes: minutes 
 })

 updateStorage({
   isBlocking: true,
   timeLeft: minutes * 60 * 1000
 })
}

export const stopBlockTimer = async () => {
 chrome.alarms.clear('blockTimer') 
 await clearBlockRules()
 
 updateStorage({
   isBlocking: false,
   timeLeft: 0
 })
}

export const getTimeLeft = async () => {
    const alarm = await chrome.alarms.get('blockTimer')
    if (!alarm) return 0
    return Math.max(0, alarm.scheduledTime - Date.now())
  }

chrome.alarms.onAlarm.addListener(async (alarm) => {
 if (alarm.name === 'blockTimer') {
   await stopBlockTimer()
   console.log('Time out')
 }
})