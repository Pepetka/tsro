import ts from "typescript";
import mockFs from "mock-fs";
import assert from "node:assert";
import { it, describe, beforeEach, afterEach } from "node:test";

import { validateImportsInFile } from "./imports";

describe("imports", () => {
  beforeEach(() => {
    mockFs({
      "/project": {
        "tsconfig.json": JSON.stringify({
          compilerOptions: {
            target: "ES2021",
            module: "ESNext",
            moduleResolution: "node",
            baseUrl: ".",
            paths: {
              "@utils/*": ["src/utils/*"],
              "@types/*": ["src/types/*"],
            },
          },
        }),
        src: {
          utils: {
            "helper.ts": `
              export const helperFunction = () => {};
              export default class Helper {};
            `,
            "math.ts": `
              export const add = (a: number, b: number) => a + b;
              export const subtract = (a: number, b: number) => a - b;
            `,
          },
          types: {
            "user.ts": `
              export interface User {
                id: number;
                name: string;
              }
            `,
          },
          "empty.ts": "// empty file",
        },
      },
    });
  });

  afterEach(() => {
    mockFs.restore();
  });

  const createProgram = (fileName: string, content: string) => {
    const host = ts.createCompilerHost({
      target: ts.ScriptTarget.ES2021,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
      baseUrl: "/project",
      paths: {
        "@utils/*": ["/project/src/utils/*"],
        "@types/*": ["/project/src/types/*"],
      },
    });

    const originalGetSourceFile = host.getSourceFile;
    host.getSourceFile = (name, languageVersion) => {
      if (name === fileName) {
        return ts.createSourceFile(name, content, languageVersion);
      }
      return originalGetSourceFile.call(host, name, languageVersion);
    };

    const program = ts.createProgram(
      [fileName],
      {
        target: ts.ScriptTarget.ES2021,
        module: ts.ModuleKind.ESNext,
        moduleResolution: ts.ModuleResolutionKind.NodeJs,
        baseUrl: "/project",
        paths: {
          "@utils/*": ["/project/src/utils/*"],
          "@types/*": ["/project/src/types/*"],
        },
      },
      host,
    );

    return program;
  };

  it("returns empty array for valid imports", () => {
    const content = `
      import { helperFunction } from "/project/src/utils/helper";
      import Helper from "/project/src/utils/helper";
      import { add } from "/project/src/utils/math";
    `;

    const program = createProgram("/project/test.ts", content);
    const sourceFile = program.getSourceFile("/project/test.ts")!;

    const diagnostics = validateImportsInFile(sourceFile, program);

    assert.strictEqual(diagnostics.length, 0);
  });

  it("detects module not found", () => {
    const content = `import { something } from "./nonexistent";`;

    const program = createProgram("/project/test.ts", content);
    const sourceFile = program.getSourceFile("/project/test.ts")!;

    const diagnostics = validateImportsInFile(sourceFile, program);

    assert.strictEqual(diagnostics.length, 1);
    assert.strictEqual(diagnostics[0].code, '"./nonexistent" not resolved');
    assert.strictEqual(diagnostics[0].line, 1);
    assert.strictEqual(diagnostics[0].file, "/project/test.ts");
  });

  it("detects invalid named imports from existing module", () => {
    const content = `
      import { helperFunction, nonExistentFunction } from "/project/src/utils/helper";
      import { invalidExport } from "/project/src/utils/math";
    `;

    const program = createProgram("/project/test.ts", content);
    const sourceFile = program.getSourceFile("/project/test.ts")!;

    const diagnostics = validateImportsInFile(sourceFile, program);

    // Should detect nonExistentFunction and invalidExport as missing exports
    const namedImportErrors = diagnostics.filter(
      (d) => d.code.includes("nonExistentFunction") || d.code.includes("invalidExport"),
    );

    assert(namedImportErrors.length >= 2, "Should detect missing named exports");
  });

  it("detects missing default export from existing module", () => {
    const content = `import MathDefault from "/project/src/utils/math";`;

    const program = createProgram("/project/test.ts", content);
    const sourceFile = program.getSourceFile("/project/test.ts")!;

    const diagnostics = validateImportsInFile(sourceFile, program);

    const defaultImportError = diagnostics.find(
      (d) => d.code.includes("default") || d.code.includes("MathDefault"),
    );

    assert(defaultImportError, "Should detect missing default export from math module");
  });

  it("validates namespace imports from existing module", () => {
    const content = `import * as HelperUtils from "/project/src/utils/helper";`;

    const program = createProgram("/project/test.ts", content);
    const sourceFile = program.getSourceFile("/project/test.ts")!;

    const diagnostics = validateImportsInFile(sourceFile, program);

    // Namespace import from existing module should be valid
    assert.strictEqual(diagnostics.length, 0);
  });

  it("handles TypeScript path aliases", () => {
    const content = `
      import { helperFunction } from "@utils/helper";
      import { User } from "@types/user";
    `;

    const program = createProgram("/project/test.ts", content);
    const sourceFile = program.getSourceFile("/project/test.ts")!;

    const diagnostics = validateImportsInFile(sourceFile, program);

    assert.strictEqual(diagnostics.length, 0);
  });

  it("ignores lib imports when flag is set", () => {
    const content = `
      import { readFileSync } from "fs";
      import express from "express";
    `;

    const program = createProgram("/project/test.ts", content);
    const sourceFile = program.getSourceFile("/project/test.ts")!;

    const diagnostics = validateImportsInFile(sourceFile, program, true);

    // Should ignore library imports
    const libErrors = diagnostics.filter(
      (d) => d.code.includes("fs") || d.code.includes("express"),
    );

    assert.strictEqual(libErrors.length, 0);
  });

  it("validates lib imports when flag is false", () => {
    const content = `import { nonExistentFunction } from "nonexistent-lib";`;

    const program = createProgram("/project/test.ts", content);
    const sourceFile = program.getSourceFile("/project/test.ts")!;

    const diagnostics = validateImportsInFile(sourceFile, program, false);

    assert(diagnostics.length > 0);
    assert(diagnostics[0].code.includes("not resolved"));
  });

  it("returns correct line and character positions", () => {
    const content = `
// First line
import { something } from "./nonexistent";
// Third line
    `;

    const program = createProgram("/project/test.ts", content);
    const sourceFile = program.getSourceFile("/project/test.ts")!;

    const diagnostics = validateImportsInFile(sourceFile, program);

    assert.strictEqual(diagnostics.length, 1);
    assert.strictEqual(diagnostics[0].line, 3); // 1-based line number
    assert(diagnostics[0].char > 20); // Should be somewhere in the string literal
  });

  it("handles mixed valid and invalid imports", () => {
    const content = `
      import { helperFunction } from "/project/src/utils/helper"; // valid named
      import Helper from "/project/src/utils/helper"; // valid default
      import { invalidFunction } from "/project/src/utils/helper"; // invalid named from existing module
      import InvalidDefault from "/project/src/utils/math"; // invalid default from existing module
      import { add } from "/project/src/utils/math"; // valid named
      import { something } from "/project/nonexistent"; // module not found
    `;

    const program = createProgram("/project/test.ts", content);
    const sourceFile = program.getSourceFile("/project/test.ts")!;

    const diagnostics = validateImportsInFile(sourceFile, program);

    assert(diagnostics.length >= 3, "Should have at least 3 errors");

    // Check we have different types of errors
    const hasModuleNotFound = diagnostics.some((d) => d.code.includes("not resolved"));
    const hasMissingExport = diagnostics.some(
      (d) => d.code.includes("invalidFunction") || d.code.includes("InvalidDefault"),
    );

    assert(hasModuleNotFound, "Should detect module not found");
    assert(hasMissingExport, "Should detect missing exports");
  });
});
