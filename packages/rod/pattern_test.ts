import { assertEquals } from "@std/assert";
import { RodPattern } from "./pattern.ts";

Deno.test("RodPattern - static", () => {
  const pattern = new RodPattern({ pathname: "/hello" });
  const rodResult = pattern.exec({ pathname: "/hello" });
  assertEquals(rodResult, {
    pathname: {
      groups: {},
    },
  });

  const urlPattern = new URLPattern({ pathname: "/hello" });
  const groups = urlPattern.exec({ pathname: "/hello" })?.pathname.groups;
  assertEquals(rodResult?.pathname.groups, groups);
});

Deno.test("RodPattern - params", () => {
  const pattern = new RodPattern({ pathname: "/:name" });
  const rodResult = pattern.exec({ pathname: "/rod" });
  assertEquals(rodResult, {
    pathname: {
      groups: { name: "rod" },
    },
  });

  const urlPattern = new URLPattern({ pathname: "/:name" });
  const params = urlPattern.exec({ pathname: "/rod" })?.pathname.groups;
  assertEquals(rodResult?.pathname.groups, params);
});

Deno.test("RodPattern - multiple params", () => {
  const pattern = new RodPattern({ pathname: "/:name/:id/:oa/:di" });
  const rodResult = pattern.exec({ pathname: "/hello/1/2/3" });
  assertEquals(rodResult, {
    pathname: {
      groups: { name: "hello", id: "1", oa: "2", di: "3" },
    },
  });

  const urlPattern = new URLPattern({ pathname: "/:name/:id/:oa/:di" });
  const groups = urlPattern.exec({ pathname: "/hello/1/2/3" })?.pathname.groups;
  assertEquals(rodResult?.pathname.groups, groups);
});

Deno.test("RodPattern - wildcard", () => {
  const pattern = new RodPattern({ pathname: "/:name/*" });
  const rodResult = pattern.exec({ pathname: "/hello/world" });
  assertEquals(rodResult, {
    pathname: { groups: { name: "hello", 0: "world" } },
  });

  const urlPattern = new URLPattern({ pathname: "/:name/*" });
  const groups = urlPattern.exec({ pathname: "/hello/world" })?.pathname.groups;
  assertEquals(rodResult?.pathname.groups, groups);
});

Deno.test("RodPattern - url", () => {
  const pattern = new RodPattern({ pathname: "/hello" });
  const rodResult = pattern.exec("http://localhost/hello");
  assertEquals(rodResult, {
    pathname: {
      groups: {},
    },
  });

  const urlPattern = new URLPattern({ pathname: "/hello" });
  const groups = urlPattern.exec("http://localhost/hello")?.pathname.groups;
  assertEquals(rodResult?.pathname.groups, groups);
});

Deno.test("RodPattern - query", () => {
  const pattern = new RodPattern({ pathname: "/hello" });
  const rodResult = pattern.exec("http://localhost/hello?name=world");
  assertEquals(pattern.exec("http://localhost/hello?name=world"), {
    pathname: {
      groups: {},
    },
  });

  const urlPattern = new URLPattern({ pathname: "/hello" });
  const groups = urlPattern.exec("http://localhost/hello?name=world")?.pathname
    .groups;
  assertEquals(rodResult?.pathname.groups, groups);
});
