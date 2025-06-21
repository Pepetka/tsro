import pc from "picocolors";
import { relative } from "node:path";

import { Output } from "@appTypes/output";
import { Logger } from "@appTypes/logger";
import { DiagnosticInfo } from "@appTypes/diagnostic";

import { formatCount } from "./formatCount";

export class CliOutput implements Output {
  #deletedFileCount = 0;
  #projectRoot: string;
  #logger: Logger;
  #mode: "check" | "write";
  #previousFile: string | undefined;

  constructor({
    logger,
    projectRoot,
    mode,
  }: {
    logger: Logger;
    projectRoot: string;
    mode: "check" | "write";
  }) {
    this.#logger = logger;
    this.#mode = mode;
    this.#projectRoot = projectRoot;
  }

  deleteFile(diagnostic: DiagnosticInfo): void {
    const { file, code, line, char } = diagnostic;
    this.#logger.write(
      `${pc.yellow("import")} ${this.#relativePath(file)}:${pc.gray(
        `${line}:${char}`.padEnd(7),
      )} ${pc.gray(`'${code}'`)}\n`,
    );
    if (this.#previousFile !== file) {
      this.#deletedFileCount++;
    }
    this.#previousFile = file;
  }

  done() {
    const result =
      this.#deletedFileCount > 0
        ? `${this.#mode === "check" ? "delete" : "deleted"} ${formatCount(this.#deletedFileCount, "file")}`
        : "";

    if (this.#mode === "check" && result.length > 0) {
      this.#logger.write(pc.red(pc.bold(`✖ ${result}\n`)));
      return {
        code: 1,
      };
    }

    this.#logger.write(pc.green(pc.bold(`✔ ${result.length > 0 ? result : "all good!"}\n`)));
    return { code: 0 };
  }

  #relativePath(file: string) {
    return relative(this.#projectRoot, file).replaceAll("\\", "/");
  }
}
