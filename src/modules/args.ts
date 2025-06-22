import { Command } from "commander";

import { CliArgs } from "@appTypes/args";
import { getVersion } from "@utils/getVersion";

const program = new Command();

export const getArgs = async (): Promise<CliArgs> => {
  const version = await getVersion();

  program
    .name("sweep")
    .description(
      "TypeScript Remove Orphaned (tsro) is a CLI utility for TypeScript projects that scans your source code, detects orphaned files, and removes them. Supports dry runs and custom entry points.",
    )
    .version(version, "-v, --version")
    .option("-p, --project <file>", "Path to tsconfig file")
    .option("-w, --write", "Write changes to files", false)
    .option("--no-ignoreLibImports", "Ignore lib imports");

  return program.parse().opts();
};
