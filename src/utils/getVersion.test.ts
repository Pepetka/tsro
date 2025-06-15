import mock from "mock-fs";
import { equal } from "assert/strict";
import { describe, it, before } from "node:test";

import { getVersion } from "./getVersion";

describe("getVersion", { concurrency: true }, () => {
  before(() => {
    mock({
      "package.json": JSON.stringify({ version: "7.7.7" }),
    });
  });

  it("get version", async () => {
    const version = await getVersion();

    equal(version, "7.7.7");
  });
});
