import path from 'node:path'
import { loadConfig } from 'unconfig'
import { describe, expect, it } from 'vitest'
import { pascalCase } from 'pascal-case'
import type { ExportConfig } from '../src'
import { transformFileName } from '../src'
describe('should', () => {
  it('exported', () => {
    expect(1).toEqual(1)
  })
})

it.skip('transfromFileName', () => {
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

it.skip('path resolve', () => {
  // console.log('==============', path.resolve('/a', '../b', './c'))
  // const config = tryRequire('./export.config', cwd())
  // console.log(config, '123113231110010o0o011')
})

it.skip('import', async () => {
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

it.skip('transformFileName use Pascal Case', () => {
  const fileName = 'abcc'
  const outOutFileName = pascalCase(fileName)
  expect(outOutFileName).equal('Abcc')
})

it('transformFileName use Pascal Case', () => {
  const fileName = 'abcdefg.svg'
  let outPutFileName = fileName.slice(0, fileName.lastIndexOf('.'))
  const fileType = fileName.slice(fileName.lastIndexOf('.') + 1)
  outPutFileName = pascalCase(outPutFileName)
  expect(outPutFileName).equal('Abcdefg')
  expect(fileType).equal('svg')
})

it('regex test', () => {
  const regex = /import\s*{?\s*(\w+)\s+\s*(?:as\s+(\w*))?\s*}?/
  // const str = 'import { ReactComponent as HellWorld } from \'./a/Hourglass.svg\'\n'
  const str = 'import HellWorld  from \'./a/Hourglass.svg\'\n'
  const result = str.match(regex) || []
  let fileName = ''
  if (result[2])
    fileName = result[2]
  else fileName = result[1]
  expect(fileName).equal('HellWorld')
})

it('compatibility windows slash', () => {
  const importStr = `import PngA from '${path.join('a.png')}'\n`
  console.warn(importStr)
})
