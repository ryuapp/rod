import { frameworks } from "./frameworks.ts";

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
