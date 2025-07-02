import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFile } from "node:fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pathToPackageJson = join(__dirname, "../../package.json");

export const getVersion = async (): Promise<string> => {
  const packageJson = await readFile(pathToPackageJson, "utf8");
  const { version } = JSON.parse(packageJson);
  return version;
};
