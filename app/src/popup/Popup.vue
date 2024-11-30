<script setup lang="js">
import { ref, onMounted, computed } from 'vue'
import { getDomain, isValidDomain, isDomainExisted } from '@/utils/domain'
import { updateBlockRules, startBlockTimer, getBlockedDomains, stopBlockTimer, deleteRules, getAllRuleIds } from '@/background/index'

const newUrl = ref('')
const domains = ref([])
const timeInMinutes = ref(5)
const isBlocking = ref(false)

const addDomain = () => {
  if (!newUrl.value) {
    // TODO: display message to user
    return
  }

  const domain = getDomain(newUrl.value)
  if (!isValidDomain(domain)) {
    // TODO: display message to user
    newUrl.value = ''
    return
  }
  
  const newDomains = Object.values(domains.value) || []
  if (isDomainExisted(newDomains, domain)) {
    // TODO: display message to user
    newUrl.value = ''
    return
  }

  newDomains.unshift({
    id: Date.now(),
    domain: domain,
    timestamp: Date.now(),
  })
  domains.value = newDomains
  const blockedDomains = {
    domains: domains.value,
    lastUpdated: Date.now(),
  }
  chrome.storage.local.set({ blockedDomains })
  newUrl.value = ''
}

const deleteDomain = (id) => {
  if (!Number.isInteger(id)) return;
  
  let storedDomains = Object.values(domains.value) || []
  storedDomains = storedDomains.filter(d => d.id != id)
  domains.value = storedDomains 
  const blockedDomains = {
    domains: storedDomains,
    lastUpdated: Date.now(),
  }
  chrome.storage.local.set({blockedDomains})
}

const startTimer = () => {
  updateBlockRules()
  startBlockTimer(Number(timeInMinutes.value))
}

const stopTimer = async() => {
  await deleteRules(await getAllRuleIds())
  stopBlockTimer()
}

onMounted(async () => {
  domains.value = await getBlockedDomains()
  chrome.storage.local.get(['isBlocking'], (result) => {
    isBlocking.value = result.isBlocking || false
  })

  chrome.storage.onChanged.addListener((changes) => {
    if(changes.isBlocking) {
      isBlocking.value = changes.isBlocking.newValue
    }
  })
})

const computedValues = computed(() => ({
  limit: (Object.values(domains.value) || []).slice(0,5),
  count: domains.value?.length || 0
}))
</script>

<template>
  <main>
    <h3>Blocked time</h3>
    <span>{{ timeInMinutes }} {{ timeInMinutes === '1' ? 'min' : 'mins' }}</span>
    <br>
    <input type="range" min="1" max="60" :value="timeInMinutes" step="1" v-model="timeInMinutes">
    <button v-if="!isBlocking" @click="startTimer">Start</button>
    <button v-else @click="stopTimer">Stop</button>
    <br>
    <h3>Blocked domains</h3>
    <input v-model="newUrl" @keyup.enter="addDomain" placeholder="Enter domain to block" />
    <button @click="addDomain" :disable="!newUrl.value">+</button>
    <div>
      <div v-for="item in computedValues.limit" :key="item.timestamp">
        {{ item.domain }}
        <button @click="deleteDomain(item.id)">-</button>
      </div>
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
</style>
