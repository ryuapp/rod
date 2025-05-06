import { Hono } from "@hono/hono";
import { Hono as Quick } from "@hono/hono/quick";
import { Hono as Tiny } from "@hono/hono/tiny";
import { Rod } from "@rod/rod";
import { RawRod } from "../packages/rod/core.ts";
import file from "./ghes-3.16.json" with { type: "json" };

const data = Object.keys(file.paths).map((path) => {
  // deno-lint-ignore no-explicit-any
  const methods = Object.keys((file.paths as Record<string, any>)[path]);
  return {
    path,
    method: methods,
  };
});
const routes = data.reduce((acc, cur) => {
  return acc + cur.method.length;
}, 0);
console.log("GitHub API Routes:", routes);

const frameworks = [
  { name: "Hono", instance: () => new Hono() },
  { name: "Hono - quick preset", instance: () => new Quick() },
  { name: "Hono - tiny preset", instance: () => new Tiny() },
  { name: "Rod", instance: () => new Rod() },
  { name: "RawRod", instance: () => new RawRod() },
];

frameworks.forEach(({ name, instance }) => {
  const app = instance();

  data.forEach(({ path, method }) => {
    method.forEach((m) => {
      // @ts-ignore: Unreachable code error
      app[m.toLowerCase()](path, () => new Response("Hello World"));
    });
  });

  Deno.bench({ name, group: "GitHub Rest API Pattern - Routing" }, () => {
    app.fetch(new Request("http://localhost/test/test"));
  });
});
