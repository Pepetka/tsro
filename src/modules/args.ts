import { Command } from "commander";

import { CliArgs } from "@appTypes/args";
import { getVersion } from "@utils/getVersion";

const program = new Command();

export const getArgs = async (): Promise<CliArgs> => {
  const version = await getVersion();

  program
    .name("tsro")
    .description(
      "TypeScript Remove Orphaned (tsro) is a CLI utility and library for TypeScript projects that detects and removes files containing invalid imports — imports that refer to nonexistent entities or nonexistent modules.",
    )
    .version(version, "-v, --version")
    .option("-p, --project <file>", "path to tsconfig file")
    .option("-w, --write", "delete orphaned files")
    .option("--no-ignoreLibImports", "no ignore lib imports");

  return program.parse().opts();
};
