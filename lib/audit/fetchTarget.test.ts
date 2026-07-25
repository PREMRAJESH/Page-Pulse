import { describe, it, expect, vi, beforeEach } from 'vitest'
import { isPrivateIp } from './fetchTarget'

const dnsMock = vi.hoisted(() => ({ address: '93.184.216.34', family: 4 }))

vi.mock('node:dns/promises', () => ({
  lookup: vi.fn(() => Promise.resolve(dnsMock)),
}))

describe('isPrivateIp', () => {
  it('loopback IPv4', () => {
    expect(isPrivateIp('127.0.0.1')).toBe(true)
  })

  it('loopback IPv6', () => {
    expect(isPrivateIp('::1')).toBe(true)
  })

  it('private 10.x.x.x', () => {
    expect(isPrivateIp('10.0.0.1')).toBe(true)
  })

  it('private 192.168.x.x', () => {
    expect(isPrivateIp('192.168.1.1')).toBe(true)
  })

  it('private 172.16-31.x.x', () => {
    expect(isPrivateIp('172.16.0.1')).toBe(true)
    expect(isPrivateIp('172.31.255.255')).toBe(true)
  })

  it('public IP returns false', () => {
    expect(isPrivateIp('8.8.8.8')).toBe(false)
  })

  it('non-IP string returns false', () => {
    expect(isPrivateIp('example.com')).toBe(false)
  })

  it('link-local 169.254.x.x', () => {
    expect(isPrivateIp('169.254.1.1')).toBe(true)
  })

  it('172.15.x.x is not private', () => {
    expect(isPrivateIp('172.15.0.1')).toBe(false)
  })

  it('172.32.x.x is not private', () => {
    expect(isPrivateIp('172.32.0.1')).toBe(false)
  })
})

describe('fetchTarget SSRF and redirect safety', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    dnsMock.address = '93.184.216.34'
  })

  it('rejects a hostname that resolves to a private IP', async () => {
    dnsMock.address = '192.168.1.1'
    const { fetchTarget, FetchError } = await import('./fetchTarget')

    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('should not reach fetch'))

    await expect(fetchTarget('https://innocent-looking-domain.example')).rejects.toThrow(FetchError)
  })

  it('rejects a redirect to a private IP', async () => {
    const { fetchTarget, FetchError } = await import('./fetchTarget')

    const redirectResponse = new Response(null, {
      status: 302,
      headers: { location: 'https://192.168.1.1/admin' },
    })

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(redirectResponse)

    await expect(fetchTarget('https://example.com')).rejects.toThrow(FetchError)
  })

  it('rejects a file:// URL outright without attempting any fetch', async () => {
    const { fetchTarget, FetchError } = await import('./fetchTarget')

    const spy = vi.spyOn(globalThis, 'fetch')
    await expect(fetchTarget('file:///C:/Users/test/something.pdf')).rejects.toThrow(FetchError)
    expect(spy).not.toHaveBeenCalled()
  })

  it('rejects more than 3 redirects', async () => {
    const { fetchTarget, FetchError } = await import('./fetchTarget')

    function makeRedirect(n: number): Response {
      return new Response(null, {
        status: 302,
        headers: { location: `https://hop${n}.example` },
      })
    }

    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(makeRedirect(1))
      .mockResolvedValueOnce(makeRedirect(2))
      .mockResolvedValueOnce(makeRedirect(3))
      .mockResolvedValueOnce(makeRedirect(4))

    await expect(fetchTarget('https://example.com')).rejects.toThrow(FetchError)
  })
})
