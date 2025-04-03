import { Rod } from "@rod/rod";

const r = new Rod();

r.get("*", async (c) => {
  console.log("Before Middleware");
  await c.next();
  console.log("After Middleware");
});

r.get("/", () => {
  return new Response("Hello World!");
});

r.get("/:name", (c) => {
  return new Response(`Hello ${c.params.name}!`);
});

r.get("/search", (c) => {
  return new Response(`Search query: ${c.searchParams.q}`);
});

Deno.serve(r.fetch);
