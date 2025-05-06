import { joinPath } from "./path.ts";
import { assertEquals } from "@std/assert";

Deno.test("joinPath", () => {
  assertEquals(joinPath("/", "/"), "/");
  assertEquals(joinPath("/", "/*"), "/*");
  assertEquals(joinPath("/api", "/"), "/api");
  assertEquals(joinPath("/api", "/v1"), "/api/v1");
  assertEquals(joinPath("/api/", "/v1"), "/api/v1");
  assertEquals(joinPath("/api", "v1"), "/api/v1");
  assertEquals(joinPath("/api/", "v1"), "/api/v1");
});
