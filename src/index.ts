import { cwd } from 'process'
import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import { tryRequire } from './utils'

const configArray = tryRequire('./export.config', cwd())

configArray.forEach((config: config) => {
  const { targetFilesDir, outputFileDir, customImport } = config
  if (!targetFilesDir || !outputFileDir) {
    console.error(chalk.bgRedBright('Please check the export.config.ts'))
    process.exit(-1)
  }
  let generateStr = ''
  if (customImport) {
    let files = fs.readdirSync(path.resolve(cwd(), targetFilesDir))
    files = files.filter((file) => {
      return (file !== 'index.ts' && file !== '.DS_Store')
    })
    const fileNameArray = files.map((file) => {
      return transformFileName(file)
    })
    files.forEach((file) => {
      if (file !== 'index.ts') {
        const fileName = transformFileName(file)
        generateStr += `${customImport(fileName, file)}\n`
      }
    })
    const exportStr = `export {
${fileNameArray.join(',\n')}
    }
    `
    generateStr += exportStr
    fs.writeFileSync(path.resolve(cwd(), `${outputFileDir}/index.ts`), generateStr)
    console.warn(chalk.bgCyan(`🦥 大哥${path.resolve(cwd(), `${outputFileDir}/index.ts`)}生成完毕，小弟撤退了🚗~`))
  }
  else {
    let files = fs.readdirSync(path.resolve(cwd(), targetFilesDir))
    files = files.filter((file) => {
      return (file !== 'index.ts' && file !== '.DS_Store')
    })

    const fileNameArray = files.map((file) => {
      return transformFileName(file)
    })
    files.forEach((file) => {
      if (file !== 'index.ts') {
        const fileName = transformFileName(file)
        generateStr += `import ${fileName} from '${file}'\n`
      }
    })
    const exportStr = `export {
${fileNameArray.join(',\n')}
    }
    `
    generateStr += exportStr
    fs.writeFileSync(path.resolve(cwd(), `${outputFileDir}/index.ts`), generateStr)
    console.warn(chalk.bgCyan(`🦥 大哥${path.resolve(cwd(), `${outputFileDir}/index.ts`)}生成完毕，小弟撤退了🚗~`))
  }
})

function transformFileName(str: string) {
  str = str.slice(0, str.indexOf('.'))
  let result = ''
  const characterArray = str.split('-')
  characterArray.forEach((c) => {
    result += `${c[0].toUpperCase()}${c.slice(1)}`
  })
  return result
}

interface config {
  targetFilesDir: string
  outputFileDir?: string
  customImport?: (fileName: string, file: string) => string
}
interface ExportConfig {
  [index: number]: config
}
function defineExportConfig(config: ExportConfig): ExportConfig {
  return config
}

export {
  defineExportConfig,
}
