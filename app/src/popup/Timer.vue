<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { getTimeLeft } from '@/background/timer.js'
import { getStorage, updateStorage } from '@/background/storage.js'

const timeLeft = ref(0)
let timer

const formatTime = (ms) => {
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

const stopBlocking = async () => {
  clearInterval(timer)
  await updateStorage({
    isBlocking: false,
    timeLeft: 0,
  })
}

const updateTimer = async () => {
  timeLeft.value = await getTimeLeft()
  if (timeLeft.value <= 0) {
    await stopBlocking()
  } else {
    await updateStorage({ timeLeft: timeLeft.value })
  }
}

onMounted(async () => {
  const { isBlocking, timeLeft: storedTime } = await getStorage()
  if (isBlocking) {
    timeLeft.value = storedTime
    updateTimer()
    timer = setInterval(updateTimer, 1000)
  }

  chrome.storage.onChanged.addListener((changes) => {
    if (changes.timeLeft) {
      timeLeft.value = changes.timeLeft.newValue
    }
    if (changes.isBlocking) {
      if (changes.isBlocking.newValue) {
        updateTimer()
        timer = setInterval(updateTimer, 1000)
      } else {
        clearInterval(timer)
        timeLeft.value = 0
      }
    }
  })
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<template>
  <div v-if="timeLeft">{{ formatTime(timeLeft) }}</div>
</template>
