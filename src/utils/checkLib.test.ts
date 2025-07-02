import assert from "node:assert";
import { describe, it } from "node:test";

import { checkLib } from "./checkLib";

describe("checkLib", () => {
  it("returns false for relative imports", () => {
    const result = checkLib("./module", []);

    assert.strictEqual(result, false);
  });

  it("returns false for parent relative imports", () => {
    const result = checkLib("../utils/helper", []);

    assert.strictEqual(result, false);
  });

  it("returns true for node modules", () => {
    const result = checkLib("react", []);

    assert.strictEqual(result, true);
  });

  it("returns true for scoped packages", () => {
    const result = checkLib("@types/node", []);

    assert.strictEqual(result, true);
  });

  it("returns false for alias match", () => {
    const aliases = ["@components/*", "@utils/*"];
    const result = checkLib("@components/Button", aliases);

    assert.strictEqual(result, false);
  });

  it("returns false for partial alias match", () => {
    const aliases = ["@lib/*"];
    const result = checkLib("@lib/deep/nested/module", aliases);

    assert.strictEqual(result, false);
  });

  it("returns true when no alias matches", () => {
    const aliases = ["@components/*"];
    const result = checkLib("@utils/helper", aliases);

    assert.strictEqual(result, true);
  });

  it("handles multiple aliases", () => {
    const aliases = ["@app/*", "@shared/*", "@types/*"];
    const result = checkLib("@shared/constants", aliases);

    assert.strictEqual(result, false);
  });

  it("returns true for empty alias array with lib import", () => {
    const result = checkLib("lodash", []);

    assert.strictEqual(result, true);
  });

  it("handles complex alias patterns", () => {
    const aliases = ["@src/components/*", "@assets/*"];
    const result = checkLib("@src/components/ui/Button", aliases);

    assert.strictEqual(result, false);
  });

  it("returns true for non-matching complex patterns", () => {
    const aliases = ["@components/ui/*"];
    const result = checkLib("@components/forms/Input", aliases);

    assert.strictEqual(result, true);
  });
});
