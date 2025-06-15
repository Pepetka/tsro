import { run } from "node:test";
import { spec } from "node:test/reporters";

run({
  globPatterns: ["src/**/*.test.ts"],
})
  .on("test:fail", () => {
    process.exitCode = 1;
  })
  .compose(spec)
  .pipe(process.stdout);
