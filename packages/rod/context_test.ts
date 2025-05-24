import { RodContext } from "./context.ts";
import { assertEquals } from "@std/assert";

Deno.test("SearchParams", () => {
  const url = new URL("http://localhost:3000/hello?name=world");
  const context = new RodContext({
    params: {},
    request: new Request(url),
    response: new Response(),
  });
  assertEquals(context.searchParams, { name: "world" });
});

Deno.test("SearchParams - multiple", () => {
  const url = new URL("http://localhost:3000/hello?name=world&name=hello");
  const context = new RodContext({
    params: {},
    request: new Request(url),
    response: new Response(),
  });
  assertEquals(context.searchParams, { name: ["world", "hello"] });
});

Deno.test("SearchParams - multiple with other params", () => {
  const url = new URL(
    "http://localhost:3000/hello?name=world&name=hello&age=20",
  );
  const context = new RodContext({
    params: {},
    request: new Request(url),
    response: new Response(),
  });
  assertEquals(context.searchParams, { name: ["world", "hello"], age: "20" });
});
