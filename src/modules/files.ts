import fg from "fast-glob";

interface Args {
  patterns: string[];
  exclude: string[];
  projectRoot: string;
  regex: boolean;
}

const getBlobFiles = async (args: Args) => {
  const patterns = [...args.patterns, ...args.exclude.map((pattern) => `!${pattern}`)];
  return await fg(patterns, { cwd: args.projectRoot, absolute: true, onlyFiles: true });
};

const getRegexFiles = async (args: Args) => {
  const patterns = ["**/*.*"];

  const allFiles = await fg(patterns, { cwd: args.projectRoot, absolute: true, onlyFiles: true });
  return allFiles.filter(
    (file) =>
      args.patterns.some((pattern) => file.match(pattern)) &&
      !args.exclude.some((pattern) => file.match(pattern)),
  );
};

export const getFiles = async (args: Args) => {
  let files: string[] = [];
  if (!args.regex) {
    files = await getBlobFiles(args);
  } else {
    files = await getRegexFiles(args);
  }

  return files;
};
