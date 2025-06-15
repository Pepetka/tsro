#!/usr/bin/env node
import { tsro } from "./main";
import { getArgs } from "./modules/args";
import { CliError, CliResultError } from "./utils/error";

const main = async () => {
  const { write, project } = await getArgs();

  await tsro({
    configFile: project || "tsconfig.json",
    mode: write ? "write" : "check",
  }).catch((error) => {
    if (error instanceof CliResultError || error instanceof CliError) {
      process.exitCode = 1;
      return;
    }

    throw error;
  });
};

main();
