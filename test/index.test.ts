import { describe, expect, it } from 'vitest'

describe('should', () => {
  it('exported', () => {
    expect(1).toEqual(1)
  })
})

it('transfromFileName', () => {
  const p = 'abc-Def-g'
  // moz-transform
  function transformFileName(str: string) {
    let result = ''
    const characterArray = str.split('-')
    characterArray.forEach((c) => {
      console.warn(c)
      result += `${c[0].toUpperCase()}${c.slice(1)}`
    })
    return result
  }
  const result = transformFileName(p)
  expect(result).equal('AbcDefG')
})

