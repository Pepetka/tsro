import assert from "node:assert";
import { describe, it } from "node:test";

import { tsro } from "./tsro";

const stripAnsi = (str: string): string => str.replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, "");

interface ParsedMessage {
  path: string;
  position: string;
  message: string;
}

const parseMessage = (message: string): ParsedMessage | null => {
  const regex = /^import\s+(.+?):(\d+):(\d+)\s+(.*)$/;
  const match = message.trim().match(regex);

  if (!match) {
    return null;
  }

  return {
    path: match[1],
    position: `${match[2]}:${match[3]}`,
    message: match[4],
  };
};

const TEST_MESSAGES: ParsedMessage[] = [
  {
    path: "test/imports/test.spec.ts",
    position: "28:10",
    message: `'import { nonExistent } from "../exports/basic"'`,
  },
  {
    path: "test/imports/test.spec.ts",
    position: "31:27",
    message: `'"../exports/non-existent-file" not resolved'`,
  },
  {
    path: "test/imports/test.spec.ts",
    position: "46:28",
    message: `'"@test/exports/non-existent-file-2" not resolved'`,
  },
  {
    path: "test/imports/test.spec.ts",
    position: "49:29",
    message: `'"@test/exports/basic" not resolved'`,
  },
  {
    path: "test/imports/test.spec.ts",
    position: "62:3",
    message: `'import { nonExistenB2 } from "../exports/reexports"'`,
  },
];

describe("tsro", () => {
  it("should work", async () => {
    const result: string[] = [];

    await tsro({
      configFile: "tsconfig.test.json",
      mode: "check",
      logger: {
        write: (text: string) => {
          result.push(stripAnsi(text));
        },
        isTTY: false,
      },
    }).catch(() => {});

    const parsed = result.reduce<ParsedMessage[]>((acc, text) => {
      const message = parseMessage(text);
      return message ? [...acc, message] : acc;
    }, []);

    assert.deepStrictEqual(parsed, TEST_MESSAGES);
  });
});
