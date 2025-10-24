# Rod

Rod is a routing library for [Request](https://developer.mozilla.org/en-US/docs/Web/API/Request).

```ts
import { Rod } from "@rod/rod";

const app = new Rod();
app.get("/", () => new Response("Hello World"));

export default app;
```

## Features

### Typesafe sub routing

```ts
import { createRouter, Rod } from "@rod/rod";

const users = createRouter({ mergePrefix: "/users" });
users.get("/users/:id", () => new Response("User detail"));

const comments = createRouter({ mergePrefix: "/users/:id/comments" });
comments.get("/users/:id/comments", () => new Response("Comments list"));
comments.get("/users/:id/comments/:commentId", (c) => {
  // c.params.id and c.params.commentId are both typed as string
  return new Response(
    `Comment detail for comment ${c.params.commentId} of user ${c.params.id}`,
  );
});

const app = new Rod();
app.merge("/users", users); // Typesafe!
app.merge("/users/:id/comments", comments); // Typesafe!
```
