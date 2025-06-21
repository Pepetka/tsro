import ts from "typescript";
import { dirname, resolve } from "node:path";

export const loadTSConfig = async (projectRoot: string, configFile: string, system: ts.System) => {
  const configPath = resolve(projectRoot, configFile);

  const { config, error } = configPath
    ? ts.readConfigFile(configPath, system.readFile)
    : { config: {}, error: undefined };

  const { options, fileNames } = ts.parseJsonConfigFileContent(config, system, dirname(configPath));
  return { options, fileNames, configPath, error };
};
