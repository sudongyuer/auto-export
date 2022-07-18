import path from 'node:path'
import { cwd } from 'process'
import fs from 'fs'
import jiti from 'jiti'
import chalk from 'chalk'
import { loadConfig } from 'unconfig'
import { pascalCase } from 'pascal-case'
export function tryRequire(id: string, rootDir: string = process.cwd()) {
  const _require = jiti(rootDir, {
    interopDefault: true,
    cache: false,
    requireCache: false,
    v8cache: false,
    esmResolve: true,
  })
  try {
    return _require(id)
  }
  catch (err: any) {
    if (err.code !== 'MODULE_NOT_FOUND')
      console.error(`Error trying import ${id} from ${rootDir}`, err)

    return {}
  }
}

export function tryResolve(id: string, rootDir: string = process.cwd()) {
  const _require = jiti(rootDir, {
    interopDefault: true,
    cache: false,
    requireCache: false,
    v8cache: false,
    esmResolve: true,
  })
  try {
    return _require.resolve(id)
  }
  catch (err: any) {
    if (err.code !== 'MODULE_NOT_FOUND')
      console.error(`Error trying import ${id} from ${rootDir}`, err)
    return id
  }
}

export async function tryImport(id: string, rootDir: string = process.cwd()): Promise<ExportConfig> {
  const { default: exportConfig } = await import(path.resolve(rootDir, id))
  return exportConfig
}

async function main() {
  const { config: configArray } = await loadConfig<ExportConfig>({
    sources: [
      {
        files: 'export.config',
        extensions: ['ts', 'mts', 'cts', 'js', 'mjs', 'cjs', 'json', ''],
      },
    ],
  })

  if (Array.isArray(configArray?.configs)) {
    for (let i = 0; i < configArray?.configs.length; i++) {
      const { targetDir, outputDir = targetDir, customImport, depth = true, autoPrefix = false } = configArray?.configs[i]
      if (!targetDir) {
        console.error(chalk.bgRedBright('Please check the export.config.ts'))
        process.exit(-1)
      }
      const absoluteOutputDirPath = path.resolve(cwd(), outputDir)
      // { fileName: string, file: string , fileType: string}[]
      const fileData = await findFile(targetDir, absoluteOutputDirPath, depth)
      if (fileData)
        await generated(fileData, customImport, outputDir, autoPrefix)
    }
  }
}

async function findFile(
  filePath: string,
  outputDir: string,
  depth: boolean,
): Promise<{ fileName: string; file: string; fileType: string }[]> {
  const absolutePath = path.resolve(cwd(), filePath)
  const files = fs.readdirSync(absolutePath)
  // Todo: any is not a good type
  // if (files.length === 0) return undefined as any
  const result = []
  for (const index in files) {
    const file = files[index]
    const fileAbsolutePath = path.resolve(absolutePath, file)
    if (fs.statSync(fileAbsolutePath)?.isDirectory()) {
      if (depth)
        result.push(await findFile(fileAbsolutePath, outputDir, depth))
    }
    else {
      if (file !== 'index.ts' && file !== '.DS_Store') {
        const { fileName, fileType } = transformFileName(file)
        const pathName = path.relative(outputDir, fileAbsolutePath)
        result.push({
          fileName,
          file: pathName,
          fileType,
        })
      }
    }
  }
  return result.flat()
}

async function generated(
  fileData: FileData,
  customImport: CustomImport | undefined,
  outputDir: string,
  autoPrefix: boolean,
) {
  let generatedContext = ''
  if (typeof customImport === 'function')
    generatedContext = customImportGenerated(fileData, customImport)

  else
    generatedContext = importGenerated(fileData, autoPrefix)

  fs.writeFileSync(
    path.resolve(cwd(), `${outputDir}/index.ts`),
    generatedContext,
  )
  console.warn(chalk.bgBlue(`${path.resolve(cwd(), `${outputDir}/index.ts`)}生成完毕，小弟撤退了🚗~`))
}

function customImportGenerated(fileData: FileData, customImport: CustomImport): string {
  let customImportStr = ''
  const exportNames: string[] = []
  fileData.forEach((item) => {
    const customImportResult = `${customImport(item.fileName, item.file, item.fileType)}\n`
    customImportStr += customImportResult
    exportNames.push(handleCustomImportExport(customImportResult))
  })
  const exportStr = `
export {
${exportNames.length !== 0
      ? exportNames.map(item => `  ${item}`).join(',\n')
      : ''
    }
}`
  return customImportStr + exportStr
}

function handleCustomImportExport(str: string) {
  // import { a as xx } from
  // import xx from
  // get xx
  let importName = ''
  const result = str.match(/import\s*{?\s*(\w+)\s+\s*(?:as\s+(\w*))?\s*}?/) || []
  if (result[2])
    importName = result[2]
  else importName = result[1]
  return importName
}

function importGenerated(fileData: FileData, autoPrefix: boolean) {
  let generatedContext = ''
  fileData.forEach((item) => {
    if (autoPrefix)
      item.fileName = `${pascalCase(item.fileType)}${item.fileName}`
    const importStr = `import ${item.fileName} from './${item.file}'\n`
    generatedContext += importStr
  })
  generatedContext += `
export {
${fileData.length !== 0
      ? fileData.map(item => `  ${item.fileName}`).join(',\n')
      : ''
    }
}`
  return generatedContext
}

export function transformFileName(file: string) {
  let fileName = file.slice(0, file.lastIndexOf('.'))
  const fileType = file.slice(file.lastIndexOf('.') + 1)
  fileName = pascalCase(fileName)
  return { fileName, fileType }
}

type FileData = { fileName: string; file: string; fileType: string }[]
type CustomImport = (fileName: string, file: string, fileType: string) => string
interface Config {
  targetDir: string
  outputDir?: string
  customImport?: CustomImport
  depth?: boolean
  autoPrefix?: boolean
}

export interface ExportConfig {
  configs: Array<Config>
}

function defineExportConfig(config: ExportConfig): ExportConfig {
  return config
}

export { defineExportConfig, main }
