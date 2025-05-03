import { assertEquals } from "@std/assert";
import { RodPattern } from "./pattern.ts";

Deno.test("RodPattern - static", () => {
  const pattern = new RodPattern({ pathname: "/hello" });
  assertEquals(pattern.exec("/hello"), { params: {} });

  const urlPattern = new URLPattern({ pathname: "/hello" });
  const params = urlPattern.exec({ pathname: "/hello" })?.pathname.groups;
  assertEquals(pattern.exec("/hello"), { params });
});

Deno.test("RodPattern - params", () => {
  const pattern = new RodPattern({ pathname: "/:name" });
  assertEquals(pattern.exec("/rod"), {
    params: { name: "rod" },
  });

  const urlPattern = new URLPattern({ pathname: "/:name" });
  const params = urlPattern.exec({ pathname: "/rod" })?.pathname.groups;
  assertEquals(pattern.exec("/rod"), { params });
});

Deno.test("RodPattern - multiple params", () => {
  const pattern = new RodPattern({ pathname: "/:name/:id/:oa/:di" });
  assertEquals(pattern.exec("/hello/1/2/3"), {
    params: { name: "hello", id: "1", oa: "2", di: "3" },
  });

  const urlPattern = new URLPattern({ pathname: "/:name/:id/:oa/:di" });
  const params = urlPattern.exec({ pathname: "/hello/1/2/3" })?.pathname.groups;
  assertEquals(pattern.exec("/hello/1/2/3"), { params });
});

Deno.test("RodPattern - wildcard", () => {
  const pattern = new RodPattern({ pathname: "/:name/*" });
  assertEquals(pattern.exec("/hello/world"), {
    params: { name: "hello", 0: "world" },
  });

  const urlPattern = new URLPattern({ pathname: "/:name/*" });
  const params = urlPattern.exec({ pathname: "/hello/world" })?.pathname.groups;
  assertEquals(pattern.exec("/hello/world"), { params });
});

Deno.test("RodPattern - url", () => {
  const pattern = new RodPattern({ pathname: "/hello" });
  assertEquals(pattern.exec("http://localhost/hello"), {
    params: {},
  });

  const urlPattern = new URLPattern({ pathname: "/hello" });
  const params = urlPattern.exec("http://localhost/hello")?.pathname.groups;
  assertEquals(pattern.exec("http://localhost/hello"), { params });
});

Deno.test("RodPattern - query", () => {
  const pattern = new RodPattern({ pathname: "/hello" });
  assertEquals(pattern.exec("http://localhost/hello?name=world"), {
    params: {},
  });

  const urlPattern = new URLPattern({ pathname: "/hello" });
  const params = urlPattern.exec("http://localhost/hello?name=world")?.pathname
    .groups;
  assertEquals(pattern.exec("http://localhost/hello?name=world"), { params });
});
