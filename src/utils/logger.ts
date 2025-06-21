import { stdout } from "node:process";

import { Logger } from "@appTypes/logger";

export const createNodeJsLogger = (): Logger =>
  "isTTY" in stdout && stdout.isTTY
    ? {
        write: stdout.write.bind(stdout),
        clearLine: stdout.clearLine.bind(stdout),
        cursorTo: stdout.cursorTo.bind(stdout),
        isTTY: true,
      }
    : {
        write: stdout.write.bind(stdout),
        isTTY: false,
      };
