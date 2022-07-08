import jiti from 'jiti'
export function tryRequire(id: string, rootDir: string = process.cwd()) {
  const _require = jiti(rootDir, { interopDefault: true })
  try {
    return _require(id)
  }
  catch (err: any) {
    if (err.code !== 'MODULE_NOT_FOUND') {
      console.error(`Error trying import ${id} from ${rootDir}`, err)
      console.error('Please make export.config.ts in your rootDir')
    }

    return {}
  }
}
