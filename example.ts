import { Rod } from "@rod/rod";

const r = new Rod();

r.get("*", async (_c, next) => {
  console.log("Before Middleware");
  await next();
  console.log("After Middleware");
});

r.get("/", () => {
  return new Response("Hello World!");
});

r.get("/:name", (c) => {
  return new Response(`Hello ${c.req.params.name}!`);
});

r.get("/search", (c) => {
  return new Response(`Search query: ${c.req.searchParams.q}`);
});

Deno.serve(r.fetch);
