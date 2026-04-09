import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLocalStorage } from '../hooks/useLocalStorage'

beforeEach(() => {
  localStorage.clear()
})

describe('useLocalStorage', () => {
  it('returns the initial value when nothing is stored', () => {
    const { result } = renderHook(() => useLocalStorage('key', 'default'))
    expect(result.current[0]).toBe('default')
  })

  it('reads an existing value from localStorage', () => {
    localStorage.setItem('key', JSON.stringify('stored'))
    const { result } = renderHook(() => useLocalStorage('key', 'default'))
    expect(result.current[0]).toBe('stored')
  })

  it('writes a new value to localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('key', []))
    act(() => result.current[1](['item1']))
    expect(JSON.parse(localStorage.getItem('key'))).toEqual(['item1'])
    expect(result.current[0]).toEqual(['item1'])
  })

  it('supports functional updater', () => {
    const { result } = renderHook(() => useLocalStorage('count', 0))
    act(() => result.current[1](n => n + 1))
    expect(result.current[0]).toBe(1)
  })

  it('returns initial value when localStorage contains invalid JSON', () => {
    localStorage.setItem('key', 'not-json{{{')
    const { result } = renderHook(() => useLocalStorage('key', 42))
    expect(result.current[0]).toBe(42)
  })
})
