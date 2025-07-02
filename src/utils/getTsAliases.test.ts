import ts from "typescript";
import assert from "node:assert";
import { describe, it, mock } from "node:test";

import { getTsAliases } from "./getTsAliases";

describe("getTsAliases", () => {
  it("returns empty array when no paths configured", () => {
    const mockProgram = {
      getCompilerOptions: mock.fn(() => ({})),
    } as unknown as ts.Program;

    const result = getTsAliases(mockProgram);

    assert.deepStrictEqual(result, []);
  });

  it("returns empty array when paths is undefined", () => {
    const mockProgram = {
      getCompilerOptions: mock.fn(() => ({ paths: undefined })),
    } as unknown as ts.Program;

    const result = getTsAliases(mockProgram);

    assert.deepStrictEqual(result, []);
  });

  it("extracts single alias from paths", () => {
    const mockProgram = {
      getCompilerOptions: mock.fn(() => ({
        paths: {
          "@components/*": ["./src/components/*"],
        },
      })),
    } as unknown as ts.Program;

    const result = getTsAliases(mockProgram);

    assert.deepStrictEqual(result, ["@components/*"]);
  });

  it("extracts multiple aliases from paths", () => {
    const mockProgram = {
      getCompilerOptions: mock.fn(() => ({
        paths: {
          "@components/*": ["./src/components/*"],
          "@utils/*": ["./src/utils/*"],
          "@types/*": ["./src/types/*"],
        },
      })),
    } as unknown as ts.Program;

    const result = getTsAliases(mockProgram);

    assert.deepStrictEqual(result, ["@components/*", "@utils/*", "@types/*"]);
  });

  it("handles alias with multiple path mappings", () => {
    const mockProgram = {
      getCompilerOptions: mock.fn(() => ({
        paths: {
          "@shared/*": ["./src/shared/*", "./lib/shared/*"],
        },
      })),
    } as unknown as ts.Program;

    const result = getTsAliases(mockProgram);

    assert.deepStrictEqual(result, ["@shared/*"]);
  });

  it("handles exact path aliases without wildcards", () => {
    const mockProgram = {
      getCompilerOptions: mock.fn(() => ({
        paths: {
          "@config": ["./src/config/index.ts"],
          "@constants": ["./src/constants.ts"],
        },
      })),
    } as unknown as ts.Program;

    const result = getTsAliases(mockProgram);

    assert.deepStrictEqual(result, ["@config", "@constants"]);
  });

  it("handles mixed alias patterns", () => {
    const mockProgram = {
      getCompilerOptions: mock.fn(() => ({
        paths: {
          "@/*": ["./src/*"],
          "@app/*": ["./src/app/*"],
          "@shared": ["./src/shared/index.ts"],
          "~/*": ["./public/*"],
        },
      })),
    } as unknown as ts.Program;

    const result = getTsAliases(mockProgram);

    assert.deepStrictEqual(result, ["@/*", "@app/*", "@shared", "~/*"]);
  });

  it("calls getCompilerOptions once", () => {
    const getCompilerOptionsMock = mock.fn(() => ({
      paths: { "@test/*": ["./test/*"] },
    }));

    const mockProgram = {
      getCompilerOptions: getCompilerOptionsMock,
    } as unknown as ts.Program;

    getTsAliases(mockProgram);

    assert.strictEqual(getCompilerOptionsMock.mock.callCount(), 1);
  });

  it("handles empty paths object", () => {
    const mockProgram = {
      getCompilerOptions: mock.fn(() => ({ paths: {} })),
    } as unknown as ts.Program;

    const result = getTsAliases(mockProgram);

    assert.deepStrictEqual(result, []);
  });
});
