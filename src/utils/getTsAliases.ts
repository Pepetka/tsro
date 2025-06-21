import ts from "typescript";

export const getTsAliases = (program: ts.Program) => {
  const { paths } = program.getCompilerOptions();
  const pathsArray = paths ? Object.entries(paths) : [];
  return pathsArray.map(([alias, _paths]) => alias);
};
