import { RawRod } from "./core.ts";
import { RodPattern } from "./pattern.ts";

/**
 * Rod class
 *
 * @example Usage
 * ```ts
 * import { Rod } from "@rod/rod";
 *
 * const app = new Rod();
 *
 * app.get("/", () => {
 *  return new Response("Hello, World!");
 * });
 *
 * export default app;
 * ```
 */
export class Rod extends RawRod {
  constructor(options?: { basePath?: string }) {
    super();
    if (options?.basePath) {
      // @ts-ignore assign to readonly property
      this.basePath = options.basePath;
    }
    // @ts-ignore assign to readonly property
    this.UrlPattern = RodPattern;
  }
}
