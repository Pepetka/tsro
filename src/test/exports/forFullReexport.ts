// Named exports
export const namedConstB2 = "const";
export const namedConst1B2 = "const1";
export const namedConst3B2 = "const3";
export function namedFunctionB2() {}
export class NamedClassB2 {}

// Default export
const defaultExportB2 = "default";
export default defaultExportB2;

// Export with assignment
export let exportedLetB2 = "let";

// Re-export from another file (relative)
export { sleep } from "./reexports";

// Export type
export type SomeTypeB2 = string;
export type SomeType1B2 = string;

// Export interface
export interface SomeInterfaceB2 {
  id: number;
}

// Export namespace
export namespace MyNamespaceB2 {
  export const value = 42;
}

// Combine exports
const constItemB2 = "const";
const constItem1B2 = "const1";

export { constItemB2, constItem1B2 };
