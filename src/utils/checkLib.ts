export const checkLib = (importPath: string, aliases: string[]): boolean => {
  const aliasPattern = aliases.map((alias) => alias.replace("*", "(.*)"));
  const match = importPath.match(new RegExp(`^${aliasPattern}$`));

  const isSourceFile = importPath.startsWith("./") || importPath.startsWith("../") || match;

  return !isSourceFile;
};
