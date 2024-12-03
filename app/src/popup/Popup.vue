<script setup lang="js">
import Timer from './Timer.vue'
import { ref, onMounted, computed } from 'vue'
import { getDomain, isValidDomain, isDomainExisted } from '@/utils/domain'
import { updateBlockRules } from '@/background/blockDomain.js'
import {
  updateStorage,
  getBlockedDomains,
  getIsBlocking,
  getMinutes,
} from '@/background/storage.js'
import { startBlockTimer, stopBlockTimer } from '@/background/timer.js'

const domain = ref('')
const domains = ref([])
const minutes = ref(5)
const isBlocking = ref(false)

const addDomain = () => {
  if (!domain.value) return

  const cleanedDomain = getDomain(domain.value)
  if (!isValidDomain(cleanedDomain)) {
    // TODO: display message to user
    domain.value = ''
    return
  }

  const newDomains = Object.values(domains.value) || []
  if (isDomainExisted(newDomains, cleanedDomain)) {
    // TODO: display message to user
    domain.value = ''
    return
  }

  const newDomain = {
    id: Date.now(),
    domain: cleanedDomain,
    timestamp: Date.now(),
  }

  domains.value = [newDomain, ...(Object.values(domains.value) || [])]
  updateStorage({
    blockedDomains: {
      domains: domains.value,
      lastUpdated: Date.now(),
    },
  })
  domain.value = ''
}

const deleteDomain = (id) => {
  if (!Number.isInteger(id)) return

  domains.value = (Object.values(domains.value) || []).filter((d) => d.id !== id)
  updateStorage({
    blockedDomains: {
      domains: domains.value,
      lastUpdated: Date.now(),
    },
  })
}

const startTimer = () => {
  updateBlockRules()
  updateStorage({minutes: minutes.value})
  startBlockTimer(minutes.value)
}

const stopTimer = () => {
  stopBlockTimer()
}

const saveMinutes = () => {
  updateStorage({minutes: minutes.value})
}

onMounted(async () => {
  minutes.value = await getMinutes()
  domains.value = await getBlockedDomains()
  isBlocking.value = await getIsBlocking()

  chrome.storage.onChanged.addListener((changes) => {
    if (changes.isBlocking) {
      isBlocking.value = changes.isBlocking.newValue
    }
  })
})

const computedValues = computed(() => ({
  limit: (Object.values(domains.value) || []).slice(0, 5),
  count: domains.value?.length || 0,
}))
</script>

<template>
  <main>
    <h3>Block Timer</h3>
    <span>{{ minutes }} minutes</span>
    <input type="range" v-model="minutes" min="1" max="60" step="1" @change="saveMinutes" />

    <button v-if="!isBlocking" @click="startTimer">Start</button>
    <button v-else @click="stopTimer" class="stop-btn">Stop</button>

    <Timer />

    <h3>Blocked Domains</h3>
    <input v-model="domain" @keyup.enter="addDomain" placeholder="Enter domain" />
    <button @click="addDomain">+</button>

    <div v-for="item in computedValues.limit" :key="item.timestamp">
      {{ item.domain }}
      <button @click="deleteDomain(item.id)">-</button>
    </div>
  </main>
</template>

<style>
:root {
  font-family:
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    Oxygen,
    Ubuntu,
    Cantarell,
    'Open Sans',
    'Helvetica Neue',
    sans-serif;

  color-scheme: light dark;
  background-color: #242424;
}

@media (prefers-color-scheme: light) {
  :root {
    background-color: #fafafa;
  }

  a:hover {
    color: #42b983;
  }
}

body {
  min-width: 20rem;
  color-scheme: light dark;
}

main {
  text-align: center;
  padding: 1em;
  margin: 0 auto;
}

li {
  color: #42b983;
}

h3 {
  color: #42b983;
  text-transform: uppercase;
  font-size: 1.5rem;
  font-weight: 200;
  line-height: 1.2rem;
  margin: 2rem auto;
}

.calc {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 2rem;

  > button {
    font-size: 1rem;
    padding: 0.5rem 1rem;
    border: 1px solid #42b983;
    border-radius: 0.25rem;
    background-color: transparent;
    color: #42b983;
    cursor: pointer;
    outline: none;

    width: 3rem;
    margin: 0 a;
  }

  > label {
    font-size: 1.5rem;
    margin: 0 1rem;
  }
}

a {
  font-size: 0.5rem;
  margin: 0.5rem;
  color: #cccccc;
  text-decoration: none;
}

.stop-btn {
  color: red;
}
</style>
