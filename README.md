# tsro

TypeScript Remove Orphaned (tsro) is a CLI utility and library for TypeScript projects that scans source files to detect files containing unused imports (so-called “orphaned files”). It enables identifying and removing such imports to streamline code cleanup.

## Features

###  🕵️  Find unused code

The utility scans the entire project using information from `tsconfig.json` and the TypeScript Compiler API to identify files containing unused imports. These files are considered “orphaned” because they do not affect the codebase and occupy space unnecessarily.

### 🗑️ Remove unused code automatically

When the corresponding option (`--write` flag) is enabled, tsro deletes the detected orphan files from the project, helping keep the codebase clean and reducing technical debt.

### 🚀 Works out of the box

The tool requires no separate configuration file or complex setup. A valid `tsconfig.json` is sufficient, simplifying integration into existing projects and speeding up adoption.

## Installation

```bash
npm install -g tsro
```

TypeScript is a peer dependency.

## Quick Start

1. **🔍 Check your `tsconfig.json`** – Make sure `include` and `exclude` are configured thoroughly so that tsro can correctly detect orphan files.

2. **🚀 Execute** – Run `tsro`. Use `--write` to delete orphaned files.

```bash
tsro
```

## Usage

### CLI

```

Usage: tsro [options]

Options:
  -v, --version          output the version number
  -p, --project <file>   path to tsconfig file
  -w, --write            delete orphaned files
  --no-ignoreLibImports  no ignore lib imports
  -h, --help             display help for command

Examples:
  # Write changes in place
  tsro --write

  # Check orphan files for a project with a custom tsconfig.json
  tsro --project tsconfig.test.json

  # Check orphan files without ignoring lib imports
  tsro --no-ignoreLibImports

```

#### `-p`, `--project`

Specifies the `tsconfig.json` that is used to analyze your codebase. Defaults to `tsconfig.json` in your project root.

```bash
tsro --project tsconfig.test.json
```

#### `-w`, `--write`

By default, tsro does not delete anything, it only reports orphan files.
The `--write` flag enables actual deletion of these files from the project.

> [!WARNING]
> This will delete files. Using it in a git controlled environment is highly recommended.

#### `--no-ignoreLibImports`

By default, tsro skips imports from libraries (node_modules) to avoid resolution errors — in some cases, the tool may incorrectly determine that a library doesn’t exist or doesn’t export the used entity.
The `--no-ignoreLibImports` flag disables this behavior and enables analysis of library imports.

> [!WARNING]
> May cause valid imports to be mistakenly flagged as unresolved or missing.

### JavaScript API

Alternatively, you can use the JavaScript API to execute tsr.

```typescript
import { tsro } from 'tsro';

await tsro({
  mode: 'check',
  ignoreLibImports: false,
}).catch(() => {
  process.exitCode = 1;
});
```

The project path and/or the custom `tsconfig.json` can be manually specified.

```typescript
await tsr({
  mode: 'check',
  configFile: 'tsconfig.sample.json',
  projectRoot: '/path/to/project',
});
```

Check the type definition `import type { Config } from 'tsro` for all of the available options.

## Examples

tsro is useful for cleaning up test, spec, and story files that remain after removing the tested files or entities using other tools (e.g., knip --production or tsr).

A common use case is running tsro with a separate config that includes only test and story files to delete unused test files:

```bash
tsro -p tsconfig.test.json -w
```

Example tsconfig.test.json:

```json
{
  "include": [
    "**/*.test.ts",
    "**/*.spec.ts",
    "**/*.stories.ts"
  ]
}
```

## License

MIT © Pepetka. See the [LICENSE](./LICENSE) file for details.
