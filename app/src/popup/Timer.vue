<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { getTimeLeft } from '@/background/timer.js'
import {getIsBlocking} from '@/background/storage.js'

const timeLeft = ref(0)
let timer

const formatTime = (ms) => {
 const minutes = Math.floor(ms / 60000)
 const seconds = Math.floor((ms % 60000) / 1000)
 return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

const updateTimer = async () => {
 timeLeft.value = await getTimeLeft()
 chrome.storage.local.set({ timeLeft: timeLeft.value })
}

onMounted(async () => {
 const { isBlocking } = await getIsBlocking()
 if (isBlocking) {
   updateTimer()
   timer = setInterval(updateTimer, 1000)
 }

 chrome.storage.onChanged.addListener((changes) => {
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