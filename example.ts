import { Rod } from "@rod/rod";

const router = new Rod();

router.get("*", async (c) => {
  console.log("Before Middleware");
  await c.next();
  console.log("After Middleware");
});

router.all("*", async (c) => {
  await c.next();
  c.response.headers.set("X-Test-Id", "Test");
});

router.get("/", () => {
  return new Response("Hello World!");
});

router.get("/users/:name", (c) => {
  return new Response(`Hello ${c.params.name}!`);
});

router.get("/search", (c) => {
  return new Response(`Search query: ${c.searchParams.q}`);
});

const subRouter = new Rod();
subRouter.get("/", () => {
  return new Response("Hello World from sub router!");
});

router.route("/sub", subRouter);

Deno.serve(router.fetch);
