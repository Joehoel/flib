import { describe, expect, it } from "vitest";
import { Flow } from "../src";

describe("'query' event", () => {
  it("gets the correct parameters", () => {
    const plugin = new Flow({
      args: JSON.stringify({ method: "query", parameters: ["hello world"] }),
    });

    plugin.on("query", ([query]) => {
      expect(query).toBe("hello world");
    });
    plugin.run();
  });
});

describe("custom event", () => {
  it("gets the correct parameters", () => {
    const plugin = new Flow<{ custom: [query: string] }>({
      args: JSON.stringify({ method: "custom", parameters: ["hello world"] }),
    });

    plugin.on("custom", ([query]) => {
      expect(query).toBe("hello world");
    });

    plugin.run();
  });

  it("emits the correct parameters", () => {
    const plugin = new Flow<{ custom: [query: string] }>({
      args: JSON.stringify({ method: "custom", parameters: ["hello world"] }),
    });

    plugin.on("custom", ([query]) => {
      expect(query).toBe("hello world");
    });

    plugin.emit("custom", ["testing"]);

    plugin.on("custom", ([query]) => {
      expect(query).toBe("testing");
    });

    plugin.run();
  });
});
