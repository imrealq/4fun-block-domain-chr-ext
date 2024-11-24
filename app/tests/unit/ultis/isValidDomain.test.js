import { isValidDomain } from '@/utils/domain'

describe('isValidDomain', () => {
  it('returns true for valid domains', () => {
    expect(isValidDomain('example.com')).toBe(true)
    expect(isValidDomain('sub.example.com')).toBe(true)
    expect(isValidDomain('https://example.com')).toBe(true)
  })

  it('returns false for invalid domains', () => {
    expect(isValidDomain('invalid')).toBe(false)
    expect(isValidDomain('-example.com')).toBe(false)
    expect(isValidDomain('example-.com')).toBe(false)
  })
})
