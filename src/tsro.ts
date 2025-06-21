import pc from "picocolors";
import ts from "typescript";
import { cwd } from "node:process";
import { relative } from "node:path";

import { Logger } from "./types/logger";
import { CliOutput } from "./utils/cliOutput";
import { formatCount } from "./utils/formatCount";
import { loadTSConfig } from "./utils/loadTsConfig";
import { createNodeJsLogger } from "./utils/logger";
import { CliError, CliResultError } from "./utils/error";
import { collectDiagnostics } from "./modules/diagnostics";

const relativeToCwd = (fileName: string) => relative(cwd(), fileName).replaceAll("\\", "/");

export interface Config {
  mode: "check" | "write";
  system?: ts.System;
  configFile?: string;
  projectRoot?: string;
  logger?: Logger;
  ignoreLibImports?: boolean;
}

export const tsro = async (config: Config) => {
  const {
    mode,
    configFile = "tsconfig.json",
    projectRoot = cwd(),
    system = ts.sys,
    logger = createNodeJsLogger(),
    ignoreLibImports = true,
  } = config;

  const { options, fileNames, configPath, error } = await loadTSConfig(
    projectRoot,
    configFile,
    system,
  );

  if (fileNames.length === 0) {
    logger.write(pc.red(pc.bold("There are no files in the project\n")));

    throw new CliError();
  }

  logger.write(
    `${pc.blue("tsconfig")} ${error ? "using default options" : relativeToCwd(configPath)}\n`,
  );

  logger.write(pc.gray(`Project has ${formatCount(fileNames.length, "file")}\n`));

  const output = new CliOutput({ logger, mode, projectRoot });

  const diagnostics = collectDiagnostics({
    fileNames,
    options,
    ignoreLibImports,
  });

  for (const diagnostic of diagnostics) {
    if (mode == "write") {
      system.deleteFile?.(diagnostic.file);
    }
    output.deleteFile(diagnostic);
  }

  const { code } = output.done();

  if (code !== 0) {
    throw new CliResultError();
  }
};
