export const checkLib = (importPath: string, aliases: string[]): boolean => {
  const aliasPatterns = aliases.map((alias) => alias.replace("*", "(.*)"));
  const match = aliasPatterns.some((pattern) => importPath.match(new RegExp(`^${pattern}$`)));

  const isSourceFile = importPath.startsWith("./") || importPath.startsWith("../") || match;

  return !isSourceFile;
};
