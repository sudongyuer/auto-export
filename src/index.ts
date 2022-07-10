import { cwd } from 'process'
import fs from 'fs'
import path from 'path'
import chalk from 'chalk'

import { loadConfig } from 'unconfig'

async function main() {
  const { config: configArray } = await loadConfig<ExportConfig>({
    sources: [
      {
        files: 'export.config',
        extensions: ['ts', 'mts', 'cts', 'js', 'mjs', 'cjs', 'json', ''],
      },
    ],
  })
  configArray?.configs.forEach((config: config) => {
    const { targetDir, outputDir = targetDir, customImport } = config
    if (!targetDir) {
      console.error(chalk.bgRedBright('Please check the export.config.ts'))
      process.exit(-1)
    }
    let generateStr = ''
    if (customImport) {
      let files = fs.readdirSync(path.resolve(cwd(), targetDir))
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
      const exportStr = `
export {
${fileNameArray.map(item => `  ${item}`).join(',\n')},
}
`
      generateStr += exportStr
      fs.writeFileSync(path.resolve(cwd(), `${outputDir}/index.ts`), generateStr)
      console.warn(chalk.bgBlue(`🚀🚀🚀 ${path.resolve(cwd(), `${outputDir}/index.ts`)}生成完毕，小弟撤退了🚗~`))
    }
    else {
      let files = fs.readdirSync(path.resolve(cwd(), targetDir))
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
      const exportStr = `
export {
${fileNameArray.map(item => `  ${item}`).join(',\n')},
}
`
      generateStr += exportStr
      fs.writeFileSync(path.resolve(cwd(), `${outputDir}/index.ts`), generateStr)
      console.warn(chalk.bgBlue(`🚀🚀🚀 ${path.resolve(cwd(), `${outputDir}/index.ts`)}生成完毕，小弟撤退了🚗~`))
    }
  })
  process.exit(0)
}

main()

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
  targetDir: string
  outputDir?: string
  customImport?: (fileName: string, file: string) => string
}

export interface ExportConfig {
  configs: Array<config>
}

function defineExportConfig(config: ExportConfig): ExportConfig {
  return config
}

export {
  defineExportConfig,
}
