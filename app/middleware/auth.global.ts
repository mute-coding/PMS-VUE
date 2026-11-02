export default defineNuxtRouteMiddleware((to) => {
  // The mock token only exists in browser storage; keep static prerendering available.
  if (import.meta.server) return

  const { restore } = useMockAuth()
  const authenticated = restore()

  if (to.path === '/login') {
    if (authenticated) return navigateTo('/')
    return
  }

  if (!authenticated) return navigateTo('/login')
})
