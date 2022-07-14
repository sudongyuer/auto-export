export default {
  configs: [
    {
      targetDir: "./src/images",
      customImport: (fileName: string, file: string) => {
        return `import {${fileName} as ${fileName}a} from '${file}'`
      }
    },
  ],
};
