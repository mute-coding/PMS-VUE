import { createMockJwt, getMockJwtExpiry } from '~/utils/mock-jwt'

const STORAGE_KEY = 'pms-demo-jwt'

export function useMockAuth() {
  const token = useState<string | null>('mock-jwt', () => null)

  function restore(): boolean {
    if (import.meta.server) return false

    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && getMockJwtExpiry(saved) !== null) {
      token.value = saved
      return true
    }

    localStorage.removeItem(STORAGE_KEY)
    token.value = null
    return false
  }

  function login(username: string, password: string): boolean {
    if (import.meta.server) return false

    const value = createMockJwt(username, password)
    if (!value) return false

    localStorage.setItem(STORAGE_KEY, value)
    token.value = value
    return true
  }

  function logout() {
    if (import.meta.client) localStorage.removeItem(STORAGE_KEY)
    token.value = null
  }

  return { token, restore, login, logout }
}
