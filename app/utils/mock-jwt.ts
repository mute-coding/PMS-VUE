export const MOCK_JWT_LIFETIME_SECONDS = 6 * 60 * 60

const DEMO_USERNAME = 'admin'
const DEMO_PASSWORD = 'administrator'
const DEMO_AUDIENCE = 'pms-demo'

interface MockJwtHeader {
  alg: 'none'
  typ: 'JWT'
}

interface MockJwtPayload {
  sub: string
  aud: string
  iat: number
  exp: number
}

function encodePart(value: MockJwtHeader | MockJwtPayload): string {
  return btoa(JSON.stringify(value)).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '')
}

function decodePart(value: string): unknown {
  const padded = value.replaceAll('-', '+').replaceAll('_', '/')
  return JSON.parse(atob(padded)) as unknown
}

export function createMockJwt(username: string, password: string, now = Date.now()): string | null {
  if (username !== DEMO_USERNAME || password !== DEMO_PASSWORD) return null

  const issuedAt = Math.floor(now / 1000)
  const header: MockJwtHeader = { alg: 'none', typ: 'JWT' }
  const payload: MockJwtPayload = {
    sub: DEMO_USERNAME,
    aud: DEMO_AUDIENCE,
    iat: issuedAt,
    exp: issuedAt + MOCK_JWT_LIFETIME_SECONDS
  }

  return `${encodePart(header)}.${encodePart(payload)}.`
}

export function getMockJwtExpiry(token: string, now = Date.now()): number | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3 || !parts[0] || !parts[1] || parts[2] !== '') return null

    const header = decodePart(parts[0])
    const payload = decodePart(parts[1])
    if (!header || typeof header !== 'object' || !payload || typeof payload !== 'object') return null

    const jwtHeader = header as Partial<MockJwtHeader>
    const jwtPayload = payload as Partial<MockJwtPayload>
    if (jwtHeader.alg !== 'none' || jwtHeader.typ !== 'JWT') return null
    if (jwtPayload.sub !== DEMO_USERNAME || jwtPayload.aud !== DEMO_AUDIENCE) return null
    if (!Number.isInteger(jwtPayload.iat) || !Number.isInteger(jwtPayload.exp)) return null
    if (jwtPayload.exp !== jwtPayload.iat! + MOCK_JWT_LIFETIME_SECONDS) return null
    if (jwtPayload.iat! > Math.floor(now / 1000)) return null

    const expiresAt = jwtPayload.exp! * 1000
    return expiresAt > now ? expiresAt : null
  } catch {
    return null
  }
}
