import path from 'node:path'
import jiti from 'jiti'
import type { ExportConfig } from '.'

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
