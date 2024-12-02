<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { getTimeLeft, getIsBlocking } from '@/background/storage.js'

const timeLeft = ref(0)
let timer

const formatTime = (ms) => {
 const minutes = Math.floor(ms / 60000)
 const seconds = Math.floor((ms % 60000) / 1000)
 return `${minutes}:${seconds.toString().padStart(2, '0')}` 
}

const startTimer = async () => {
 updateTimer()
 timer = setInterval(updateTimer, 1000)
}

const stopTimer = () => {
 clearInterval(timer)
 timeLeft.value = 0
}

const updateTimer = async () => {
 timeLeft.value = await getTimeLeft()
}

onMounted(async () => {
 const isBlocking = await getIsBlocking()
 if (isBlocking) startTimer()

 chrome.storage.onChanged.addListener((changes) => {
   if (changes.isBlocking?.newValue) {
     startTimer()
   } else {
     stopTimer()
   }
 })
})

onUnmounted(() => stopTimer())
</script>

<template>
 <div v-if="timeLeft">{{ formatTime(timeLeft) }}</div>
</template>