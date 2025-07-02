import ts from "typescript";

import { checkLib } from "@utils/checkLib";
import { getTsAliases } from "@utils/getTsAliases";
import { DiagnosticInfo } from "@appTypes/diagnostic";
import {
  validateDefaultImport,
  validateNamedImports,
  validateNamespaceImport,
} from "@utils/validators";

export const validateImportsInFile = (
  sourceFile: ts.SourceFile,
  program: ts.Program,
  ignoreLibImports?: boolean,
): DiagnosticInfo[] => {
  const checker = program.getTypeChecker();
  const aliases = getTsAliases(program);

  const diagnostics: DiagnosticInfo[] = [];

  ts.forEachChild(sourceFile, (node) => {
    if (!ts.isImportDeclaration(node) || !ts.isStringLiteral(node.moduleSpecifier)) return;

    const moduleSymbol = checker.getSymbolAtLocation(node.moduleSpecifier);
    const importPath = node.moduleSpecifier.text;

    const start = node.moduleSpecifier.getStart();
    const { line, character } = sourceFile.getLineAndCharacterOfPosition(start);

    const isLib = checkLib(importPath, aliases);

    if (isLib && ignoreLibImports) {
      return;
    }

    if (!moduleSymbol) {
      diagnostics.push({
        file: sourceFile.fileName,
        code: `"${importPath}" not resolved`,
        line: line + 1,
        char: character + 1,
      });
      return;
    }

    const exports = checker.getExportsOfModule(moduleSymbol);

    // Named imports
    diagnostics.push(...validateNamedImports(node, sourceFile, importPath, exports));

    // Default import
    diagnostics.push(...validateDefaultImport(node, sourceFile, importPath, exports));

    // Namespace import (import * as X from ...)
    diagnostics.push(...validateNamespaceImport(node, sourceFile, importPath, moduleSymbol));
  });

  return diagnostics;
};
