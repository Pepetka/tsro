// Named exports
export const namedConst = "const";
export const namedConst1 = "const1";
export const namedConst3 = "const3";
export function namedFunction() {}
export class NamedClass {}

// Default export
const defaultExport = "default";
export default defaultExport;

// Export with assignment
export let exportedLet = "let";

// Re-export from another file (relative)
export { sleep } from "./reexports";

// Export type
export type SomeType = string;
export type SomeType1 = string;

// Export interface
export interface SomeInterface {
  id: number;
}

// Export namespace
export namespace MyNamespace {
  export const value = 42;
}

// Combine exports
const constItem = "const";
const constItem1 = "const1";

export { constItem, constItem1 };
