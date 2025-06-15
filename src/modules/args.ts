import { Command } from "commander";

import { CliArgs } from "@src/types/args";
import { getVersion } from "@src/utils/getVersion";

const program = new Command();

export const getArgs = async (): Promise<CliArgs> => {
  const version = await getVersion();

  program
    .name("sweep")
    .description("CLI tool to find and remove orphaned test/stories files in TypeScript projects.")
    .version(version, "-v, --version")
    .option("-p, --project <file>", "Path to tsconfig file")
    .option("-w, --write", "Write changes to files", false)
    .option("--debug", "Debug mode", false)
    .option("--export <file>", "Export result to json file");

  return program.parse().opts();
};
