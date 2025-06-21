// Export via export statement
export const sleep = () => new Promise((res) => setTimeout(res, 100));

// Re-export from another file
export { namedConst as renamedConst } from "./basic";

// Re-export * from
export * from "./forFullReexport";

// Reexport * from non-existent file
export * from "./empty";

// Реэкспорт по цепочке
export { MyNamespace } from "./basic";
