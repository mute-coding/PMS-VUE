<script setup lang="ts">
import { getMockJwtExpiry } from '~/utils/mock-jwt'

useHead({ htmlAttrs: { lang: 'zh-Hant' }, meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }] })

const route = useRoute()
const { token, restore, logout } = useMockAuth()
let expiryTimer: ReturnType<typeof setTimeout> | undefined

function scheduleExpiry() {
  if (expiryTimer) clearTimeout(expiryTimer)
  if (!token.value) return

  const expiresAt = getMockJwtExpiry(token.value)
  if (expiresAt === null) {
    logout()
    if (route.path !== '/login') navigateTo('/login?expired=1')
    return
  }

  expiryTimer = setTimeout(() => {
    logout()
    if (route.path !== '/login') navigateTo('/login?expired=1')
  }, expiresAt - Date.now())
}

function syncStorage() {
  const authenticated = restore()
  if (authenticated && route.path === '/login') navigateTo('/')
  else if (!authenticated && route.path !== '/login') navigateTo('/login')
}

onMounted(() => {
  syncStorage()
  window.addEventListener('storage', syncStorage)
})
onUnmounted(() => {
  if (expiryTimer) clearTimeout(expiryTimer)
  window.removeEventListener('storage', syncStorage)
})
watch(token, scheduleExpiry, { immediate: true })
</script>

<template>
  <UApp><NuxtPage /></UApp>
</template>
