import { assertEquals, assertThrows } from "@std/assert";
import { createRouter, Rod } from "./mod.ts";

Deno.test("merge - basic functionality", async () => {
  const users = createRouter({ mergePrefix: "/users" });
  users.get("/users", () => new Response("User list"));
  users.get("/users/:id", (c) => new Response(`User ${c.params.id}`));

  const app = new Rod();
  app.get("/", () => new Response("Home"));
  app.merge("/users", users);

  // Test home route
  const homeRes = await app.fetch(new Request("http://localhost/"));
  assertEquals(await homeRes.text(), "Home");

  // Test merged routes
  const usersRes = await app.fetch(new Request("http://localhost/users"));
  assertEquals(await usersRes.text(), "User list");

  const userRes = await app.fetch(new Request("http://localhost/users/123"));
  assertEquals(await userRes.text(), "User 123");
});

Deno.test("merge - prefix mismatch throws error", () => {
  const users = createRouter({ mergePrefix: "/users" });
  users.get("/users", () => new Response("User list"));

  const app = new Rod();

  assertThrows(
    () => {
      // Type error: prefix mismatch, but we test runtime error too
      app.merge("/api" as "/users", users);
    },
    Error,
    'mergePrefix mismatch: expected "/api" but got "/users"',
  );
});

Deno.test("merge - multiple HTTP methods", async () => {
  const posts = createRouter({ mergePrefix: "/posts" });
  posts.get("/posts", () => new Response("Get posts"));
  posts.post("/posts", () => new Response("Create post"));
  posts.put("/posts/:id", (c) => new Response(`Update post ${c.params.id}`));
  posts.delete("/posts/:id", (c) => new Response(`Delete post ${c.params.id}`));

  const app = new Rod();
  app.merge("/posts", posts);

  // Test GET
  const getRes = await app.fetch(new Request("http://localhost/posts"));
  assertEquals(await getRes.text(), "Get posts");

  // Test POST
  const postRes = await app.fetch(
    new Request("http://localhost/posts", { method: "POST" }),
  );
  assertEquals(await postRes.text(), "Create post");

  // Test PUT
  const putRes = await app.fetch(
    new Request("http://localhost/posts/123", { method: "PUT" }),
  );
  assertEquals(await putRes.text(), "Update post 123");

  // Test DELETE
  const deleteRes = await app.fetch(
    new Request("http://localhost/posts/123", { method: "DELETE" }),
  );
  assertEquals(await deleteRes.text(), "Delete post 123");
});

Deno.test("merge - nested path parameters", async () => {
  const comments = createRouter({ mergePrefix: "/posts/:postId/comments" });
  comments.get(
    "/posts/:postId/comments",
    (c) => new Response(`Comments for post ${c.params.postId}`),
  );
  comments.get(
    "/posts/:postId/comments/:commentId",
    (c) =>
      new Response(`Post ${c.params.postId}, Comment ${c.params.commentId}`),
  );

  const app = new Rod();
  app.merge("/posts/:postId/comments", comments);

  const res1 = await app.fetch(
    new Request("http://localhost/posts/123/comments"),
  );
  assertEquals(await res1.text(), "Comments for post 123");

  const res2 = await app.fetch(
    new Request("http://localhost/posts/123/comments/456"),
  );
  assertEquals(await res2.text(), "Post 123, Comment 456");
});

Deno.test("merge - multiple apps with different prefixes", async () => {
  const users = createRouter({ mergePrefix: "/users" });
  users.get("/users", () => new Response("Users"));

  const posts = createRouter({ mergePrefix: "/posts" });
  posts.get("/posts", () => new Response("Posts"));

  const comments = createRouter({ mergePrefix: "/comments" });
  comments.get("/comments", () => new Response("Comments"));

  const app = new Rod();
  app.merge("/users", users);
  app.merge("/posts", posts);
  app.merge("/comments", comments);

  const usersRes = await app.fetch(new Request("http://localhost/users"));
  assertEquals(await usersRes.text(), "Users");

  const postsRes = await app.fetch(new Request("http://localhost/posts"));
  assertEquals(await postsRes.text(), "Posts");

  const commentsRes = await app.fetch(
    new Request("http://localhost/comments"),
  );
  assertEquals(await commentsRes.text(), "Comments");
});

Deno.test("merge - wildcard routes", async () => {
  const api = createRouter({ mergePrefix: "/api" });
  // Register more specific routes first
  api.get("/api/users", () => new Response("API users"));
  api.get("/api/*", () => new Response("API wildcard"));

  const app = new Rod();
  app.merge("/api", api);

  const res1 = await app.fetch(new Request("http://localhost/api/users"));
  assertEquals(await res1.text(), "API users");

  const res2 = await app.fetch(new Request("http://localhost/api/something"));
  assertEquals(await res2.text(), "API wildcard");
});

// Type-safety tests (these should cause TypeScript errors if uncommented)
Deno.test("merge - type safety demonstration", () => {
  const users = createRouter({ mergePrefix: "/users" });

  // This should work - path starts with /users
  users.get("/users", () => new Response("OK"));
  users.get("/users/:id", () => new Response("OK"));

  // These would cause TypeScript errors if uncommented:
  // @ts-expect-error: path doesn't start with /users
  users.get("/posts", () => new Response("Error"));
  // @ts-expect-error: path doesn't start with /users
  users.get("/api/users", () => new Response("Error"));

  const app = new Rod();

  // This should work - prefix matches
  app.merge("/users", users);

  // This would cause a TypeScript error if uncommented:
  // @ts-expect-error: prefix doesn't match mergePrefix
  assertThrows(() => app.merge("/api", users));
});
