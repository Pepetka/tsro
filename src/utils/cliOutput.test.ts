import mockFs from "mock-fs";
import assert from "node:assert";
import { it, describe, mock, beforeEach } from "node:test";

import { Logger } from "@appTypes/logger";
import { DiagnosticInfo } from "@appTypes/diagnostic";

import { CliOutput } from "./cliOutput";

describe("CliOutput", () => {
  let mockLogger: Logger;
  let writeMock: ReturnType<typeof mock.fn>;

  beforeEach(() => {
    writeMock = mock.fn();
    mockLogger = {
      write: writeMock as unknown as (text: string) => void,
      isTTY: false,
    };

    mockFs({
      "/project": {
        src: {
          "index.ts": "export const test = 1;",
          "utils.ts": "export const util = 2;",
        },
      },
    });
  });

  it("logs import deletion with relative path", () => {
    const output = new CliOutput({
      logger: mockLogger,
      projectRoot: "/project",
      mode: "write",
    });

    const diagnostic: DiagnosticInfo = {
      file: "/project/src/index.ts",
      code: "unused-import",
      line: 1,
      char: 5,
    };

    output.deleteFile(diagnostic);

    assert.strictEqual(writeMock.mock.callCount(), 1);
    const logCall = writeMock.mock.calls[0].arguments[0] as string;
    assert(logCall.includes("src/index.ts"));
    assert(logCall.includes("1:5"));
    assert(logCall.includes("unused-import"));
  });

  it("increments file count on new files only", () => {
    const output = new CliOutput({
      logger: mockLogger,
      projectRoot: "/project",
      mode: "write",
    });

    const diagnostic1: DiagnosticInfo = {
      file: "/project/src/index.ts",
      code: "unused-import",
      line: 1,
      char: 5,
    };

    const diagnostic2: DiagnosticInfo = {
      file: "/project/src/index.ts",
      code: "another-unused",
      line: 2,
      char: 10,
    };

    const diagnostic3: DiagnosticInfo = {
      file: "/project/src/utils.ts",
      code: "unused-import",
      line: 1,
      char: 5,
    };

    output.deleteFile(diagnostic1);
    output.deleteFile(diagnostic2);
    output.deleteFile(diagnostic3);

    const result = output.done();

    const logCall = writeMock.mock.calls[3].arguments[0] as string;
    assert(logCall.includes("deleted 2 files"));
    assert.strictEqual(result.code, 0);
  });

  it("returns success when no files deleted", () => {
    const output = new CliOutput({
      logger: mockLogger,
      projectRoot: "/project",
      mode: "write",
    });

    const result = output.done();

    assert.strictEqual(result.code, 0);
    const logCall = writeMock.mock.calls[0].arguments[0] as string;
    assert(logCall.includes("all good!"));
  });

  it("returns error code in check mode with deletions", () => {
    const output = new CliOutput({
      logger: mockLogger,
      projectRoot: "/project",
      mode: "check",
    });

    const diagnostic: DiagnosticInfo = {
      file: "/project/src/index.ts",
      code: "unused-import",
      line: 1,
      char: 5,
    };

    output.deleteFile(diagnostic);
    const result = output.done();

    assert.strictEqual(result.code, 1);
    const logCall = writeMock.mock.calls[1].arguments[0] as string;
    assert(logCall.includes("delete 1 file"));
  });

  it("returns success in check mode with no deletions", () => {
    const output = new CliOutput({
      logger: mockLogger,
      projectRoot: "/project",
      mode: "check",
    });

    const result = output.done();

    assert.strictEqual(result.code, 0);
  });

  it("converts backslashes to forward slashes in paths", () => {
    const output = new CliOutput({
      logger: mockLogger,
      projectRoot: "C:\\project",
      mode: "write",
    });

    const diagnostic: DiagnosticInfo = {
      file: "C:\\project\\src\\index.ts",
      code: "unused-import",
      line: 1,
      char: 5,
    };

    output.deleteFile(diagnostic);

    const logCall = writeMock.mock.calls[0].arguments[0] as string;
    assert(logCall.includes("src/index.ts"));
    assert(!logCall.includes("\\"));
  });

  it("pads line and char numbers consistently", () => {
    const output = new CliOutput({
      logger: mockLogger,
      projectRoot: "/project",
      mode: "write",
    });

    const diagnostic: DiagnosticInfo = {
      file: "/project/src/index.ts",
      code: "unused-import",
      line: 1,
      char: 5,
    };

    output.deleteFile(diagnostic);

    const logCall = writeMock.mock.calls[0].arguments[0] as string;
    // Should be padded to 7 characters: "1:5    "
    assert(logCall.includes("1:5    "));
  });

  mockFs.restore();
});
