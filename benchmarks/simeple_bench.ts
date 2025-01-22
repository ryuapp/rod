import { Hono } from "@hono/hono";
import { Rod } from "@rod/rod";

const frameworks = [
  { name: "Hono", instance: () => new Hono() },
  { name: "Rod", instance: () => new Rod() },
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
