import { Rod } from "@rod/rod";

const router = new Rod();

router.get("*", async (c) => {
  console.log("Before Middleware");
  await c.next();
  console.log("After Middleware");
});

router.get("/", () => {
  return new Response("Hello World!");
});

router.get("/:name", (c) => {
  return new Response(`Hello ${c.params.name}!`);
});

router.get("/search", (c) => {
  return new Response(`Search query: ${c.searchParams.q}`);
});

Deno.serve(router.fetch);
