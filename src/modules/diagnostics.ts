import ts from "typescript";

import { DiagnosticInfo } from "@appTypes/diagnostic";

import { validateImportsInFile } from "./imports";

interface IParams {
  fileNames: string[];
  options?: ts.CompilerOptions;
  ignoreLibImports?: boolean;
}

export const collectDiagnostics = (params: IParams): DiagnosticInfo[] => {
  const { fileNames, options = {}, ignoreLibImports } = params;

  const program = ts.createProgram(fileNames, options);

  const diagnostics: DiagnosticInfo[] = [];
  for (const file of fileNames) {
    const sourceFile = program.getSourceFile(file);

    if (!sourceFile) {
      throw new Error(`"${file}" not found`);
    }

    diagnostics.push(...validateImportsInFile(sourceFile, program, ignoreLibImports));
  }
  return diagnostics;
};
