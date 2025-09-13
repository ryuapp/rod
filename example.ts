import { Rod } from "@rod/rod";

const app = new Rod();

app.get("*", async (c) => {
  console.log("Before Middleware");
  await c.next();
  console.log("After Middleware");
});

app.all("*", async (c) => {
  await c.next();
  c.response.headers.set("X-Test-Id", "Test");
});

app.get("/", () => {
  return new Response("Hello World!");
});

app.get("/users/:name", (c) => {
  return new Response(`Hello ${c.params.name}!`);
});

app.get("/search", (c) => {
  return new Response(`Search query: ${c.searchParams.q}`);
});

const subRouter = new Rod();
subRouter.get("/", () => {
  return new Response("Hello World from sub app!");
});

app.route("/sub", subRouter);

Deno.serve(app.fetch);
