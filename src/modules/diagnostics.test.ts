import mockFs from "mock-fs";
import assert from "node:assert";
import { it, describe, beforeEach, afterEach } from "node:test";

import { collectDiagnostics } from "./diagnostics";

describe("diagnostics", () => {
  beforeEach(() => {
    mockFs({
      "/project": {
        "valid.ts": `
          import { readFileSync } from "fs";
          export const helper = () => {};
        `,
        "invalid.ts": `
          import { nonExistent } from "./missing-file";
          import { invalidExport } from "./valid";
        `,
        "empty.ts": "// empty file",
        "tsconfig.json": JSON.stringify({
          compilerOptions: {
            target: "ES2021",
            module: "ESNext",
            moduleResolution: "node",
          },
        }),
      },
    });
  });

  afterEach(() => {
    mockFs.restore();
  });

  it("returns empty array for files with valid imports", () => {
    const diagnostics = collectDiagnostics({
      fileNames: ["/project/valid.ts"],
      options: {
        target: 99,
        module: 99,
        moduleResolution: 2,
      },
      ignoreLibImports: true,
    });

    assert.strictEqual(diagnostics.length, 0);
  });

  it("collects diagnostics from single file with invalid imports", () => {
    const diagnostics = collectDiagnostics({
      fileNames: ["/project/invalid.ts"],
      options: {
        target: 99,
        module: 99,
        moduleResolution: 2,
      },
    });

    assert(diagnostics.length > 0, "Should find import errors");

    // Should have error for missing file
    const missingFileError = diagnostics.find(
      (d) => d.code.includes("missing-file") && d.code.includes("not resolved"),
    );
    assert(missingFileError, "Should detect missing file import");

    // Check diagnostic structure
    assert.strictEqual(missingFileError.file, "/project/invalid.ts");
    assert(typeof missingFileError.line === "number");
    assert(typeof missingFileError.char === "number");
  });

  it("collects diagnostics from multiple files", () => {
    const diagnostics = collectDiagnostics({
      fileNames: ["/project/valid.ts", "/project/invalid.ts"],
      options: {
        target: 99,
        module: 99,
        moduleResolution: 2,
      },
      ignoreLibImports: true,
    });

    // Should only have errors from invalid.ts
    assert(diagnostics.length > 0);

    const filesWithErrors = [...new Set(diagnostics.map((d) => d.file))];
    assert(filesWithErrors.includes("/project/invalid.ts"));
    assert(!filesWithErrors.includes("/project/valid.ts"));
  });

  it("throws error when file not found", () => {
    assert.throws(
      () =>
        collectDiagnostics({
          fileNames: ["/project/nonexistent.ts"],
          options: {
            target: 99,
            module: 99,
            moduleResolution: 2,
          },
        }),
      {
        message: '"/project/nonexistent.ts" not found',
      },
    );
  });

  it("uses default compiler options when not provided", () => {
    const diagnostics = collectDiagnostics({
      fileNames: ["/project/empty.ts"],
    });

    // Should not throw, should handle empty file
    assert.strictEqual(diagnostics.length, 0);
  });

  it("passes ignoreLibImports flag to validation", () => {
    mockFs({
      "/project": {
        "with-lib.ts": `import { readFileSync } from "fs";`,
      },
    });

    const withIgnore = collectDiagnostics({
      fileNames: ["/project/with-lib.ts"],
      ignoreLibImports: true,
    });

    const withoutIgnore = collectDiagnostics({
      fileNames: ["/project/with-lib.ts"],
      ignoreLibImports: false,
    });

    // With ignore should have fewer/no errors
    assert(withIgnore.length <= withoutIgnore.length);
  });

  it("handles empty file list", () => {
    const diagnostics = collectDiagnostics({
      fileNames: [],
    });

    assert.strictEqual(diagnostics.length, 0);
  });

  it("aggregates diagnostics from all files correctly", () => {
    mockFs({
      "/project": {
        "file1.ts": `import { missing1 } from "./nonexistent1";`,
        "file2.ts": `import { missing2 } from "./nonexistent2";`,
        "file3.ts": `export const valid = true;`,
      },
    });

    const diagnostics = collectDiagnostics({
      fileNames: ["/project/file1.ts", "/project/file2.ts", "/project/file3.ts"],
    });

    // Should have errors from file1 and file2, but not file3
    assert(diagnostics.length >= 2);

    const errorFiles = diagnostics.map((d) => d.file);
    assert(errorFiles.includes("/project/file1.ts"));
    assert(errorFiles.includes("/project/file2.ts"));
    assert(!errorFiles.includes("/project/file3.ts"));
  });

  it("preserves diagnostic details from validateImportsInFile", () => {
    const diagnostics = collectDiagnostics({
      fileNames: ["/project/invalid.ts"],
    });

    const diagnostic = diagnostics[0];

    // Should have all required fields
    assert(typeof diagnostic.file === "string");
    assert(typeof diagnostic.code === "string");
    assert(typeof diagnostic.line === "number");
    assert(typeof diagnostic.char === "number");

    // Line and char should be positive (1-based)
    assert(diagnostic.line > 0);
    assert(diagnostic.char > 0);
  });
});
