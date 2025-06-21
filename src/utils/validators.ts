import ts from "typescript";

import { DiagnosticInfo } from "@appTypes/diagnostic";

export const validateNamedImports = (
  node: ts.ImportDeclaration,
  sourceFile: ts.SourceFile,
  importPath: string,
  exports: ts.Symbol[],
) => {
  const diagnostics: DiagnosticInfo[] = [];

  const named = node.importClause?.namedBindings;
  if (named && ts.isNamedImports(named)) {
    for (const element of named.elements) {
      const importedName = element.propertyName?.text ?? element.name.text;
      const match = exports.find((e) => e.name === importedName);

      if (!match) {
        const pos = sourceFile.getLineAndCharacterOfPosition(element.getStart());
        const code =
          importedName !== element.name.text
            ? `import { ${importedName} as ${element.name.text} } from "${importPath}"`
            : `import { ${importedName} } from "${importPath}"`;
        diagnostics.push({
          file: sourceFile.fileName,
          code,
          line: pos.line + 1,
          char: pos.character + 1,
        });
      }
    }
  }

  return diagnostics;
};

export const validateDefaultImport = (
  node: ts.ImportDeclaration,
  sourceFile: ts.SourceFile,
  importPath: string,
  exports: ts.Symbol[],
) => {
  const diagnostics: DiagnosticInfo[] = [];

  const defaultImport = node.importClause?.name;
  if (defaultImport) {
    const match = exports.find((e) => e.name === "default");
    if (!match) {
      const pos = sourceFile.getLineAndCharacterOfPosition(defaultImport.getStart());
      const code = `import ${defaultImport.text} from "${importPath}"`;
      diagnostics.push({
        file: sourceFile.fileName,
        code,
        line: pos.line + 1,
        char: pos.character + 1,
      });
    }
  }

  return diagnostics;
};

export const validateNamespaceImport = (
  node: ts.ImportDeclaration,
  sourceFile: ts.SourceFile,
  importPath: string,
  moduleSymbol: ts.Symbol,
) => {
  const diagnostics: DiagnosticInfo[] = [];

  const named = node.importClause?.namedBindings;
  if (named && ts.isNamespaceImport(named)) {
    if (!moduleSymbol) {
      const pos = sourceFile.getLineAndCharacterOfPosition(named.getStart());
      const code = `import * as ${named.name.text} from "${importPath}"`;
      diagnostics.push({
        file: sourceFile.fileName,
        code,
        line: pos.line + 1,
        char: pos.character + 1,
      });
    }
  }

  return diagnostics;
};
