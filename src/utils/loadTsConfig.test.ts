import ts from "typescript";
import assert from "node:assert";
import { resolve, dirname } from "node:path";
import { describe, it, mock } from "node:test";

import { loadTSConfig } from "./loadTsConfig";

describe("loadTSConfig", () => {
  it("loads valid tsconfig successfully", async () => {
    const mockSystem = {
      readFile: mock.fn((path: string) => {
        if (path.endsWith("tsconfig.json")) {
          return JSON.stringify({
            compilerOptions: {
              target: "ES2021",
              module: "ESNext",
            },
            include: ["src/**/*"],
          });
        }
        return undefined;
      }),
      readDirectory: mock.fn(() => []),
      directoryExists: mock.fn(() => true),
      fileExists: mock.fn(() => true),
      getDirectories: mock.fn(() => []),
    } as unknown as ts.System;

    const result = await loadTSConfig("/project", "tsconfig.json", mockSystem);

    assert.strictEqual(result.error, undefined);
    assert.strictEqual(typeof result.options, "object");
    assert.strictEqual(Array.isArray(result.fileNames), true);
    assert.strictEqual(result.configPath, resolve("/project", "tsconfig.json"));
  });

  it("handles missing config file", async () => {
    const mockSystem = {
      readFile: mock.fn(() => undefined),
      readDirectory: mock.fn(() => []),
      directoryExists: mock.fn(() => true),
      fileExists: mock.fn(() => false),
      getDirectories: mock.fn(() => []),
    } as unknown as ts.System;

    const result = await loadTSConfig("/project", "missing.json", mockSystem);

    assert.notStrictEqual(result.error, undefined);
    assert.strictEqual(typeof result.options, "object");
    assert.strictEqual(Array.isArray(result.fileNames), true);
  });

  it("returns correct config path", async () => {
    const mockSystem = {
      readFile: mock.fn(() => JSON.stringify({})),
      readDirectory: mock.fn(() => []),
      directoryExists: mock.fn(() => true),
      fileExists: mock.fn(() => true),
      getDirectories: mock.fn(() => []),
    } as unknown as ts.System;

    const result = await loadTSConfig("/my/project", "custom.json", mockSystem);

    assert.strictEqual(result.configPath, resolve("/my/project", "custom.json"));
  });

  it("handles invalid json config", async () => {
    const mockSystem = {
      readFile: mock.fn(() => "invalid json {"),
      readDirectory: mock.fn(() => []),
      directoryExists: mock.fn(() => true),
      fileExists: mock.fn(() => true),
      getDirectories: mock.fn(() => []),
    } as unknown as ts.System;

    const result = await loadTSConfig("/project", "tsconfig.json", mockSystem);

    assert.notStrictEqual(result.error, undefined);
    assert.strictEqual(typeof result.options, "object");
  });

  it("parses compiler options correctly", async () => {
    const mockSystem = {
      readFile: mock.fn(() =>
        JSON.stringify({
          compilerOptions: {
            strict: true,
            target: "ES2021",
            moduleResolution: "node",
          },
        }),
      ),
      readDirectory: mock.fn(() => []),
      directoryExists: mock.fn(() => true),
      fileExists: mock.fn(() => true),
      getDirectories: mock.fn(() => []),
    } as unknown as ts.System;

    const result = await loadTSConfig("/project", "tsconfig.json", mockSystem);

    assert.strictEqual(result.options.strict, true);
    assert.strictEqual(result.options.target, ts.ScriptTarget.ES2021);
  });

  it("processes include patterns", async () => {
    const mockSystem = {
      readFile: mock.fn(() =>
        JSON.stringify({
          include: ["src/**/*.ts", "test/**/*.ts"],
        }),
      ),
      directoryExists: mock.fn(() => true),
      getDirectories: mock.fn(() => []),
      readDirectory: mock.fn(() => []),
    } as unknown as ts.System;

    const result = await loadTSConfig("/project", "tsconfig.json", mockSystem);

    assert.strictEqual(Array.isArray(result.fileNames), true);
  });

  it("uses system.readFile correctly", async () => {
    const readFileMock = mock.fn((_path: string) => JSON.stringify({}));
    const mockSystem = {
      readFile: readFileMock,
      readDirectory: mock.fn(() => []),
      directoryExists: mock.fn(() => true),
      fileExists: mock.fn(() => true),
      getDirectories: mock.fn(() => []),
    } as unknown as ts.System;

    await loadTSConfig("/test", "config.json", mockSystem);

    assert.strictEqual(readFileMock.mock.callCount(), 1);
    assert.strictEqual(readFileMock.mock.calls[0].arguments[0], resolve("/test", "config.json"));
  });

  it("handles empty config object", async () => {
    const mockSystem = {
      readFile: mock.fn(() => JSON.stringify({})),
      readDirectory: mock.fn(() => []),
      directoryExists: mock.fn(() => true),
      fileExists: mock.fn(() => true),
      getDirectories: mock.fn(() => []),
    } as unknown as ts.System;

    const result = await loadTSConfig("/project", "tsconfig.json", mockSystem);

    assert.strictEqual(result.error, undefined);
    assert.strictEqual(typeof result.options, "object");
    assert.strictEqual(Array.isArray(result.fileNames), true);
  });

  it("processes extends configuration", async () => {
    const mockSystem = {
      readFile: mock.fn((path: string) => {
        if (path.includes("base.json")) {
          return JSON.stringify({
            compilerOptions: { strict: true },
          });
        }
        return JSON.stringify({
          extends: "./base.json",
          compilerOptions: { target: "ES2020" },
        });
      }),
      readDirectory: mock.fn(() => []),
      directoryExists: mock.fn(() => true),
      fileExists: mock.fn(() => true),
      getDirectories: mock.fn(() => []),
    } as unknown as ts.System;

    const result = await loadTSConfig("/project", "tsconfig.json", mockSystem);

    assert.strictEqual(typeof result.options, "object");
    assert.strictEqual(result.error, undefined);
  });

  it("returns dirname of config path for parsing context", async () => {
    const mockSystem = {
      readFile: mock.fn(() => JSON.stringify({})),
      readDirectory: mock.fn(() => []),
      directoryExists: mock.fn(() => true),
      fileExists: mock.fn(() => true),
      getDirectories: mock.fn(() => []),
    } as unknown as ts.System;

    await loadTSConfig("/deep/nested/project", "tsconfig.json", mockSystem);

    // Verify the parsing context uses the correct directory
    assert.strictEqual(
      dirname(resolve("/deep/nested/project", "tsconfig.json")),
      "/deep/nested/project",
    );
  });
});
