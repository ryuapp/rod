import { RawRod } from "./core.ts";

/**
 * Rod class
 *
 * @example Usage
 * ```ts
 * import { Rod } from "@rod/rod";
 *
 * const router = new Rod();
 *
 * router.get("/", () => {
 *  return new Response("Hello, World!");
 * });
 *
 * export default router;
 * ```
 */
export class Rod extends RawRod {
}
