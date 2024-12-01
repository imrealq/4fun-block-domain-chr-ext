<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const timeLeftInSeconds = ref(0)
let intervalId

const getTimeLeftInSeconds = async () => {
  const alarm = await chrome.alarms.get('blockRulesTimer')
  if (!alarm) return 0
  return Math.max(0, alarm.scheduledTime - Date.now())
}

const formatTime = (ms) => {
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

const updateTimer = async () => {
  timeLeftInSeconds.value = await getTimeLeftInSeconds()
  chrome.storage.local.set({ timeLeftInSeconds: timeLeftInSeconds.value })
}

onMounted(async () => {
  const { isBlocking } = await chrome.storage.local.get(['isBlocking'])
  if (isBlocking) {
    updateTimer()
    intervalId = setInterval(updateTimer, 1000)
  }

  chrome.storage.onChanged.addListener((changes) => {
    if (changes.isBlocking) {
      if (changes.isBlocking.newValue) {
        // Start timer khi isBlocking = true
        updateTimer()
        intervalId = setInterval(updateTimer, 1000)
      } else {
        // Stop timer khi isBlocking = false
        clearInterval(intervalId)
        timeLeftInSeconds.value = 0
      }
    }
  })
})

onUnmounted(() => {
  clearInterval(intervalId)
})
</script>

<template>
  <div v-if="timeLeftInSeconds">
    {{ formatTime(timeLeftInSeconds) }}
  </div>
</template>
