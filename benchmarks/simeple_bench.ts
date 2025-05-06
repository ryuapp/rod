import { Hono } from "@hono/hono";
import { Hono as Quick } from "@hono/hono/quick";
import { Hono as Tiny } from "@hono/hono/tiny";
import { Rod } from "@rod/rod";
import { RawRod } from "../packages/rod/core.ts";

const frameworks = [
  { name: "Hono", instance: () => new Hono() },
  { name: "Hono - quick preset", instance: () => new Quick() },
  { name: "Hono - tiny preset", instance: () => new Tiny() },
  { name: "Rod", instance: () => new Rod() },
  { name: "RawRod", instance: () => new RawRod() },
];

frameworks.forEach(({ name, instance }) => {
  Deno.bench({ name, group: "simple-run" }, () => {
    const app = instance();
    // @ts-ignore: Unreachable code error
    app.get("/", () => new Response("Hello World"));
    app.fetch(new Request("http://localhost"));
  });
});

frameworks.forEach(({ name, instance }) => {
  const app = instance();
  // @ts-ignore: Unreachable code error
  app.get("/", () => new Response("Hello World"));
  Deno.bench({ name, group: "simple-just-routing" }, () => {
    app.fetch(new Request("http://localhost"));
  });
});
