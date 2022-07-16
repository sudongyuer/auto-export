import { defineExportConfig } from './src'

export default defineExportConfig({
  configs: [
    {
      targetDir: './src/images/',
      depth: true,
      autoPrefix: true,
    },
    {
      targetDir: './src/icon/',
      depth: true,
      autoPrefix: true,
    },
    {
      targetDir: './src/svgs/',
      depth: true,
      autoPrefix: true,
      customImport: (fileName, file, fileType) => {
        return `import { ReactComponent as ${fileType}${fileName} } from '${file}'`
      },
    },
  ],
})

