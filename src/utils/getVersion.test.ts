import mockFs from "mock-fs";
import assert from "node:assert";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import { describe, it, afterEach } from "node:test";

import { getVersion } from "./getVersion";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("getVersion", () => {
  afterEach(() => {
    mockFs.restore();
  });

  it("returns version from package.json", async () => {
    const packageJsonPath = join(__dirname, "../../package.json");

    mockFs({
      [packageJsonPath]: JSON.stringify({
        name: "test-package",
        version: "1.2.3",
        description: "Test package",
      }),
    });

    const result = await getVersion();

    assert.strictEqual(result, "1.2.3");
  });

  it("handles semantic version format", async () => {
    const packageJsonPath = join(__dirname, "../../package.json");

    mockFs({
      [packageJsonPath]: JSON.stringify({
        version: "2.0.0-beta.1",
      }),
    });

    const result = await getVersion();

    assert.strictEqual(result, "2.0.0-beta.1");
  });

  it("handles pre-release version", async () => {
    const packageJsonPath = join(__dirname, "../../package.json");

    mockFs({
      [packageJsonPath]: JSON.stringify({
        version: "1.0.0-alpha.2",
      }),
    });

    const result = await getVersion();

    assert.strictEqual(result, "1.0.0-alpha.2");
  });

  it("throws error when package.json not found", async () => {
    mockFs({});

    await assert.rejects(async () => await getVersion(), { code: "ENOENT" });
  });

  it("throws error for invalid json", async () => {
    const packageJsonPath = join(__dirname, "../../package.json");

    mockFs({
      [packageJsonPath]: "invalid json content",
    });

    await assert.rejects(async () => await getVersion(), SyntaxError);
  });

  it("returns undefined when version field missing", async () => {
    const packageJsonPath = join(__dirname, "../../package.json");

    mockFs({
      [packageJsonPath]: JSON.stringify({
        name: "test-package",
        description: "No version field",
      }),
    });

    const result = await getVersion();

    assert.strictEqual(result, undefined);
  });

  it("handles version with build metadata", async () => {
    const packageJsonPath = join(__dirname, "../../package.json");

    mockFs({
      [packageJsonPath]: JSON.stringify({
        version: "1.0.0+20230101",
      }),
    });

    const result = await getVersion();

    assert.strictEqual(result, "1.0.0+20230101");
  });

  it("handles empty string version", async () => {
    const packageJsonPath = join(__dirname, "../../package.json");

    mockFs({
      [packageJsonPath]: JSON.stringify({
        version: "",
      }),
    });

    const result = await getVersion();

    assert.strictEqual(result, "");
  });

  it("handles numeric version", async () => {
    const packageJsonPath = join(__dirname, "../../package.json");

    mockFs({
      [packageJsonPath]: JSON.stringify({
        version: 123,
      }),
    });

    const result = await getVersion();

    assert.strictEqual(result, 123);
  });
});
