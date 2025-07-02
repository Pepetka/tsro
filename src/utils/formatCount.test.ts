import assert from "node:assert";
import { describe, it } from "node:test";

import { formatCount } from "./formatCount";

describe("formatCount", () => {
  it("returns singular form for count 1", () => {
    const result = formatCount(1, "error");

    assert.strictEqual(result, "1 error");
  });

  it("returns plural form for count 0", () => {
    const result = formatCount(0, "error");

    assert.strictEqual(result, "0 errors");
  });

  it("returns plural form for count greater than 1", () => {
    const result = formatCount(5, "warning");

    assert.strictEqual(result, "5 warnings");
  });

  it("uses custom plural form when provided", () => {
    const result = formatCount(2, "child", "children");

    assert.strictEqual(result, "2 children");
  });

  it("uses custom plural for singular count", () => {
    const result = formatCount(1, "child", "children");

    assert.strictEqual(result, "1 child");
  });

  it("handles negative numbers as plural", () => {
    const result = formatCount(-1, "item");

    assert.strictEqual(result, "-1 items");
  });

  it("handles large numbers", () => {
    const result = formatCount(1000, "file");

    assert.strictEqual(result, "1000 files");
  });

  it("handles decimal numbers as plural", () => {
    const result = formatCount(1.5, "second");

    assert.strictEqual(result, "1.5 seconds");
  });

  it("uses default plural with 's' suffix", () => {
    const result = formatCount(3, "test");

    assert.strictEqual(result, "3 tests");
  });

  it("handles irregular plurals correctly", () => {
    const result = formatCount(3, "person", "people");

    assert.strictEqual(result, "3 people");
  });

  it("handles zero with custom plural", () => {
    const result = formatCount(0, "mouse", "mice");

    assert.strictEqual(result, "0 mice");
  });
});
