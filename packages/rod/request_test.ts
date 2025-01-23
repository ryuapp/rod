import { RodRequest } from "./request.ts";
import { assertEquals } from "@std/assert";

Deno.test("RodRequest - params", () => {
  const request = new Request("http://localhost/hello");
  const req = new RodRequest("/:name", request);
  assertEquals(req.params, { name: "hello" });
});

Deno.test("RodRequest - searchParams", () => {
  const request = new Request("http://localhost/search?q=hello");
  const req = new RodRequest("/search", request);
  assertEquals(req.searchParams, { q: "hello" });
});
