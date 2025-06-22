import { Command } from "commander";

import { CliArgs } from "@appTypes/args";
import { getVersion } from "@utils/getVersion";

const program = new Command();

export const getArgs = async (): Promise<CliArgs> => {
  const version = await getVersion();

  program
    .name("tsro")
    .description(
      "TypeScript Remove Orphaned (tsro) is a CLI utility and library for TypeScript projects that scans source files to detect files containing unused imports (so-called “orphaned files”). It enables identifying and removing such imports to streamline code cleanup.",
    )
    .version(version, "-v, --version")
    .option("-p, --project <file>", "path to tsconfig file")
    .option("-w, --write", "delete orphaned files")
    .option("--no-ignoreLibImports", "no ignore lib imports");

  return program.parse().opts();
};
