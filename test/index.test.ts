import { loadConfig } from 'unconfig'
import { describe, expect, it } from 'vitest'
import type { ExportConfig } from '../src'

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
      // console.warn(c)
      result += `${c[0].toUpperCase()}${c.slice(1)}`
    })
    return result
  }
  const result = transformFileName(p)
  expect(result).equal('AbcDefG')
})

it('path resolve', () => {
  // console.log('==============', path.resolve('/a', '../b', './c'))
  // const config = tryRequire('./export.config', cwd())
  // console.log(config, '123113231110010o0o011')
})

it('import', async () => {
  const { config: configArray } = await loadConfig<ExportConfig>({
    sources: [
      {
        files: 'export.config',
        extensions: ['ts', 'mts', 'cts', 'js', 'mjs', 'cjs', 'json', ''],
      },
    ],
  })
  console.warn(configArray)
})
