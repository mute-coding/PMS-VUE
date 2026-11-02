import assert from 'node:assert/strict'
import test from 'node:test'
import { createMockJwt, getMockJwtExpiry, MOCK_JWT_LIFETIME_SECONDS } from '../app/utils/mock-jwt.ts'

const issuedAt = 1_800_000_000_000

test('only the demo credentials create a token', () => {
  assert.equal(createMockJwt('admin', 'wrong-password', issuedAt), null)
  assert.equal(createMockJwt('someone', 'administrator', issuedAt), null)
  assert.ok(createMockJwt('admin', 'administrator', issuedAt))
})

test('the mock JWT expires after exactly six hours', () => {
  const token = createMockJwt('admin', 'administrator', issuedAt)
  assert.ok(token)

  const payload = JSON.parse(atob(token.split('.')[1]!)) as { iat: number, exp: number }
  assert.equal(payload.exp - payload.iat, MOCK_JWT_LIFETIME_SECONDS)
  assert.equal(getMockJwtExpiry(token, issuedAt + MOCK_JWT_LIFETIME_SECONDS * 1000 - 1), payload.exp * 1000)
  assert.equal(getMockJwtExpiry(token, issuedAt + MOCK_JWT_LIFETIME_SECONDS * 1000), null)
})

test('malformed tokens are rejected', () => {
  assert.equal(getMockJwtExpiry('invalid', issuedAt), null)
  assert.equal(getMockJwtExpiry('a.b.c', issuedAt), null)
})
