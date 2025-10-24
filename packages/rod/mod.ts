import { RawRod, type RodOptions } from "./core.ts";
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
export class Rod<
  Options extends Partial<RodOptions> = {
    basePath?: string;
  },
> extends RawRod<Options> {
  constructor(options?: Options) {
    super(options);
    // @ts-ignore assign to readonly property
    this.UrlPattern = RodPattern;
  }
}

/**
 * Create a Rod instance with type-safe router
 *
 * @example
 * ```ts
 * import { createRouter } from "@rod/rod";
 *
 * const users = createRouter({ mergePrefix: "/users" });
 * users.get("/users", () => new Response("OK"));
 * ```
 */
export function createRouter<const Options extends { mergePrefix: string }>(
  options: Options & {
    /**
     * mergePrefix for type-safe route merging.
     * When set, all routes must start with this prefix.
     */
    mergePrefix: Options["mergePrefix"];
  },
): Rod<Options> {
  return new Rod(options);
}
