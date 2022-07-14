import { cwd } from "process";
import fs from "fs";
import path from "path";
import chalk from "chalk";
import { loadConfig } from "unconfig";

async function main() {
  const { config: configArray } = await loadConfig<ExportConfig>({
    sources: [
      {
        files: "export.config",
        extensions: ["ts", "mts", "cts", "js", "mjs", "cjs", "json", ""],
      },
    ],
  });

  if (Array.isArray(configArray?.configs)) {
    configArray?.configs.forEach(async (config: Config) => {
      let { targetDir, outputDir = targetDir, customImport, depth = true } = config;
      if (!targetDir) {
        console.error(chalk.bgRedBright("Please check the export.config.ts"));
        process.exit(-1);
      }
      const absoluteOutputDirPath = path.resolve(cwd(), outputDir);
      // { fileName: string, file: string }[]
      let fileData = await findFile(targetDir, absoluteOutputDirPath, depth);
      if (fileData) {
        await generated(fileData, customImport, outputDir);
      }
      process.exit(0)
    });
  } else {
    process.exit(0)
  }

}


async function findFile(
  filePath: string,
  outputDir: string,
  depth: boolean
): Promise<{ fileName: string, file: string }[]> {
  let absolutePath = path.resolve(cwd(), filePath);
  let files = fs.readdirSync(absolutePath);
  // Todo: any is not a good type
  if (files.length === 0) return undefined as any;
  let result = [];
  for (let index in files) {
    let file = files[index];
    let fileAbsolutePath = path.resolve(absolutePath, file);
    if (fs.statSync(fileAbsolutePath)?.isDirectory()) {
      if (depth) {
        result.push(await findFile(fileAbsolutePath, outputDir, depth));
      }
    } else {
      if (file !== "index.ts" && file !== ".DS_Store") {
        let fileName = transformFileName(file);
        let pathName = path.relative(outputDir, fileAbsolutePath);
        result.push({
          fileName,
          file: pathName,
        });
      }
    }
  }
  return result.flat();
}

async function generated(
  fileData: FileData,
  customImport: CustomImport | undefined,
  outputDir: string
) {
  let generatedContext = "";
  if (typeof customImport === "function") {
    generatedContext = customImportGenerated(fileData, customImport)
  } else {
    generatedContext = importGenerated(fileData)
  }

  fs.writeFileSync(
    path.resolve(cwd(), `${outputDir}/index.ts`),
    generatedContext
  );
  console.warn(chalk.bgBlue(`${path.resolve(cwd(), `${outputDir}/index.ts`)}生成完毕，小弟撤退了🚗~`))
}

function customImportGenerated(fileData: FileData, customImport: CustomImport): string {
  let customImportStr: string = "";
  let exportNames: string[] = [];
  fileData.forEach(item => {
    let customImportResult = customImport(item.fileName, item.file) + "\n";
    customImportStr += customImportResult
    exportNames.push(handleCustomImportExport(customImportResult))
  })
  let exportStr = `
export {
${exportNames.length !== 0
      ? exportNames.map((item) => `  ${item}`).join(",\n")
      : ""
    }
}`
  return customImportStr + exportStr
}

function handleCustomImportExport(str: string) {
  // import { a as xx } from 
  // import xx from 
  // get xx
  let [_, importName = ""] = str.match(/import\s*\{?(?:.*as\s*)?([^}]*)\}?\s*from/) || [];
  return importName.trim()
}

function importGenerated(fileData: FileData) {
  let generatedContext = ""
  fileData.forEach((item) => {
    generatedContext += `import ${item.fileName} from './${item.file}'\n`;
  });
  generatedContext += `
  export {
  ${fileData.length !== 0
      ? fileData.map((item) => `  ${item.fileName}`).join(",\n")
      : ""
    }
  }`;
  return generatedContext
}

main();

function transformFileName(str: string) {
  str = str.slice(0, str.indexOf("."));
  let result = "";
  const characterArray = str.split("-");
  characterArray.forEach((c) => {
    result += `${c[0].toUpperCase()}${c.slice(1)}`;
  });
  return result;
}

type FileData = { fileName: string, file: string }[]
type CustomImport = (fileName: string, file: string) => string;
interface Config {
  targetDir: string;
  outputDir?: string;
  customImport?: CustomImport;
  depth?: boolean;
}

export interface ExportConfig {
  configs: Array<Config>;
}

function defineExportConfig(config: ExportConfig): ExportConfig {
  return config;
}

export { defineExportConfig };
