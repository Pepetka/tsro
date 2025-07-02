import ts from "typescript";
import assert from "node:assert";
import { describe, it } from "node:test";

import { validateNamedImports, validateDefaultImport, validateNamespaceImport } from "./validators";

describe("validators", () => {
  const createMockSourceFile = (content: string): ts.SourceFile => {
    return ts.createSourceFile("test.ts", content, ts.ScriptTarget.Latest, true);
  };

  const createMockImportNode = (sourceFile: ts.SourceFile): ts.ImportDeclaration => {
    const importNode = sourceFile.statements[0] as ts.ImportDeclaration;
    return importNode;
  };

  it("returns empty diagnostics for valid named imports", () => {
    const source = `import { validExport } from "./module";`;
    const sourceFile = createMockSourceFile(source);
    const importNode = createMockImportNode(sourceFile);
    const exports = [{ name: "validExport" } as ts.Symbol];

    const result = validateNamedImports(importNode, sourceFile, "./module", exports);

    assert.strictEqual(result.length, 0);
  });

  it("returns diagnostic for invalid named import", () => {
    const source = `import { invalidExport } from "./module";`;
    const sourceFile = createMockSourceFile(source);
    const importNode = createMockImportNode(sourceFile);
    const exports = [{ name: "validExport" } as ts.Symbol];

    const result = validateNamedImports(importNode, sourceFile, "./module", exports);

    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].code, `import { invalidExport } from "./module"`);
  });

  it("handles aliased imports correctly", () => {
    const source = `import { originalName as alias } from "./module";`;
    const sourceFile = createMockSourceFile(source);
    const importNode = createMockImportNode(sourceFile);
    const exports = [{ name: "wrongName" } as ts.Symbol];

    const result = validateNamedImports(importNode, sourceFile, "./module", exports);

    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].code, `import { originalName as alias } from "./module"`);
  });

  it("handles multiple named imports", () => {
    const source = `import { valid, invalid } from "./module";`;
    const sourceFile = createMockSourceFile(source);
    const importNode = createMockImportNode(sourceFile);
    const exports = [{ name: "valid" } as ts.Symbol];

    const result = validateNamedImports(importNode, sourceFile, "./module", exports);

    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].code, `import { invalid } from "./module"`);
  });

  it("handles no named bindings", () => {
    const source = `import "./module";`;
    const sourceFile = createMockSourceFile(source);
    const importNode = createMockImportNode(sourceFile);
    const exports = [{ name: "someExport" } as ts.Symbol];

    const result = validateNamedImports(importNode, sourceFile, "./module", exports);

    assert.strictEqual(result.length, 0);
  });
});

describe("validateDefaultImport", () => {
  const createMockSourceFile = (content: string): ts.SourceFile => {
    return ts.createSourceFile("test.ts", content, ts.ScriptTarget.Latest, true);
  };

  const createMockImportNode = (sourceFile: ts.SourceFile): ts.ImportDeclaration => {
    return sourceFile.statements[0] as ts.ImportDeclaration;
  };

  it("returns empty diagnostics for valid default import", () => {
    const source = `import Component from "./module";`;
    const sourceFile = createMockSourceFile(source);
    const importNode = createMockImportNode(sourceFile);
    const exports = [{ name: "default" } as ts.Symbol];

    const result = validateDefaultImport(importNode, sourceFile, "./module", exports);

    assert.strictEqual(result.length, 0);
  });

  it("returns diagnostic for invalid default import", () => {
    const source = `import Component from "./module";`;
    const sourceFile = createMockSourceFile(source);
    const importNode = createMockImportNode(sourceFile);
    const exports = [{ name: "namedExport" } as ts.Symbol];

    const result = validateDefaultImport(importNode, sourceFile, "./module", exports);

    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].code, `import Component from "./module"`);
  });

  it("returns empty diagnostics when no default import", () => {
    const source = `import { named } from "./module";`;
    const sourceFile = createMockSourceFile(source);
    const importNode = createMockImportNode(sourceFile);
    const exports = [{ name: "named" } as ts.Symbol];

    const result = validateDefaultImport(importNode, sourceFile, "./module", exports);

    assert.strictEqual(result.length, 0);
  });

  it("includes correct position info in diagnostic", () => {
    const source = `import DefaultExport from "./module";`;
    const sourceFile = createMockSourceFile(source);
    const importNode = createMockImportNode(sourceFile);
    const exports = [{ name: "other" } as ts.Symbol];

    const result = validateDefaultImport(importNode, sourceFile, "./module", exports);

    assert.strictEqual(result[0].line, 1);
    assert.strictEqual(result[0].char, 8);
  });
});

describe("validateNamespaceImport", () => {
  const createMockSourceFile = (content: string): ts.SourceFile => {
    return ts.createSourceFile("test.ts", content, ts.ScriptTarget.Latest, true);
  };

  const createMockImportNode = (sourceFile: ts.SourceFile): ts.ImportDeclaration => {
    return sourceFile.statements[0] as ts.ImportDeclaration;
  };

  it("returns empty diagnostics for valid namespace import", () => {
    const source = `import * as Module from "./module";`;
    const sourceFile = createMockSourceFile(source);
    const importNode = createMockImportNode(sourceFile);
    const moduleSymbol = { name: "module" } as ts.Symbol;

    const result = validateNamespaceImport(importNode, sourceFile, "./module", moduleSymbol);

    assert.strictEqual(result.length, 0);
  });

  it("returns diagnostic when module symbol missing", () => {
    const source = `import * as Module from "./module";`;
    const sourceFile = createMockSourceFile(source);
    const importNode = createMockImportNode(sourceFile);
    const moduleSymbol = null as unknown as ts.Symbol;

    const result = validateNamespaceImport(importNode, sourceFile, "./module", moduleSymbol);

    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].code, `import * as Module from "./module"`);
  });

  it("returns empty diagnostics for named imports", () => {
    const source = `import { named } from "./module";`;
    const sourceFile = createMockSourceFile(source);
    const importNode = createMockImportNode(sourceFile);
    const moduleSymbol = null as unknown as ts.Symbol;

    const result = validateNamespaceImport(importNode, sourceFile, "./module", moduleSymbol);

    assert.strictEqual(result.length, 0);
  });

  it("includes correct file info in diagnostic", () => {
    const source = `import * as TestModule from "./test-module";`;
    const sourceFile = createMockSourceFile(source);
    const importNode = createMockImportNode(sourceFile);
    const moduleSymbol = undefined as unknown as ts.Symbol;

    const result = validateNamespaceImport(importNode, sourceFile, "./test-module", moduleSymbol);

    assert.strictEqual(result[0].file, "test.ts");
    assert.strictEqual(result[0].line, 1);
  });
});
