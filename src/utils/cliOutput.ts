import pc from "picocolors";
import { relative } from "node:path";

import { Output } from "@src/types/Output.js";
import { Logger } from "@src/types/logger.js";

import { formatCount } from "./formatCount";

export class CliOutput implements Output {
  #deletedFileCount = 0;
  #projectRoot: string;
  #logger: Logger;
  #mode: "check" | "write";

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

  deleteFile(file: string): void {
    this.#logger.write(`${pc.yellow("file")}   ${this.#relativePath(file)}\n`);
    this.#deletedFileCount++;
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
