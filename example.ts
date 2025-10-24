import { createRouter, Rod } from "@rod/rod";

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

const subRouter = createRouter({ mergePrefix: "/posts/:id" });
subRouter.get("/posts/:id", (c) => {
  return new Response(`Post details for ${c.params.id}`);
});
subRouter.get("/posts/:id/comments", (c) => {
  return new Response(`Comments for post ${c.params.id}`);
});

app.merge("/posts/:id", subRouter);

Deno.serve(app.fetch);
