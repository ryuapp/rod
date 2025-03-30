import { assertEquals } from "@std/assert";
import { RodPattern } from "./pattern.ts";

Deno.test("RodPattern - static", () => {
  const pattern = new RodPattern({ pathname: "/hello" });
  assertEquals(pattern.exec("/hello"), { params: {} });
});
Deno.test("RodPattern - params", () => {
  const pattern = new RodPattern({ pathname: "/:name" });
  assertEquals(pattern.exec("/hello"), {
    params: { name: "hello" },
  });
});

Deno.test("RodPattern - params", () => {
  const pattern = new RodPattern({ pathname: "/:name/:id/:oa/:di" });
  assertEquals(pattern.exec("/hello/1/2/3"), {
    params: { name: "hello", id: "1", oa: "2", di: "3" },
  });
});

Deno.test("RodPattern - wildcard", () => {
  const pattern = new RodPattern({ pathname: "/:name/*" });
  assertEquals(pattern.exec("/hello/world"), {
    params: { name: "hello", "0": "world" },
  });
});

Deno.test("RodPattern - url", () => {
  const pattern = new RodPattern({ pathname: "/hello" });
  assertEquals(pattern.exec("http://localhost/hello"), {
    params: {},
  });
});

Deno.test("RodPattern - query", () => {
  const pattern = new RodPattern({ pathname: "/hello" });
  assertEquals(pattern.exec("http://localhost/hello?name=world"), {
    params: {},
  });
});
