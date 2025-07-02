import { run } from "node:test";
import { spec } from "node:test/reporters";

const testName = process.argv.slice(2)[0];
const pattern = testName ? `src/**/*${testName}.test.ts` : "src/**/*.test.ts";

run({
  globPatterns: [pattern],
})
  .on("test:fail", () => {
    process.exitCode = 1;
  })
  .compose(spec)
  .pipe(process.stdout);
