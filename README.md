# Rod

Rod is a routing library for Web-standard [Request](https://developer.mozilla.org/en-US/docs/Web/API/Request).

```ts
const r = new Rod();
r.get("/", () => new Response("Hello World"));

export default r;
```
