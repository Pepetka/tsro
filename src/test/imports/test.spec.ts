// ✅ Local Named Imports
import {
  namedConst,
  namedConst1 as namedConst1Alias,
  namedFunction,
  NamedClass,
} from "../exports/basic";

// ✅ Default import
import basicDefault from "../exports/basic";

// ✅ Import with renaming
import { renamedConst } from "../exports/reexports";

// ✅ Namespace import
import * as AllBasic from "../exports/basic";

// ✅ Import for typing only
import type { SomeType, SomeInterface } from "../exports/basic";

// ✅ Named import with typing
import { namedConst1, type SomeType1 } from "../exports/basic";

// ✅ Import without use (side-effect)
import "../exports/basic";

// ❌ There is no such entity in the file
import { nonExistent } from "../exports/basic";

// ❌ The file does not exist
import { something } from "../exports/non-existent-file";

// ✅ External library
import ts from "typescript";

// ✅ External library, named import
import { textSpanIntersectsWith } from "typescript";

// ✅ Node.js module
import fs from "node:fs";

// ✅ Node.js module, named import
import { readFile } from "node:fs";

// ❌ Alias. File does not exist.
import { something2 } from "@test/exports/non-existent-file-2";

// ✅ Alias. Local Named Imports
import { namedConst3 } from "@test/exports/basic";

// ✅ Full re-export
import {
  namedConstB2,
  namedFunctionB2,
  NamedClassB2,
  sleep as sleepB2,
  type SomeTypeB2,
  SomeType1B2,
  SomeInterfaceB2,
  MyNamespaceB2,
  constItem1B2,
  nonExistenB2,
} from "../exports/reexports";
