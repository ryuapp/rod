# Rod

Rod is a routing library for [Request](https://developer.mozilla.org/en-US/docs/Web/API/Request).

```ts
import { Rod } from "@rod/rod";

const router = new Rod();
router.get("/", () => new Response("Hello World"));

export default router;
```
