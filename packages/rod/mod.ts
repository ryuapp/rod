import { RawRod } from "./core.ts";

/**
 * Rod class
 *
 * @example Usage
 * ```ts
 * import { Rod } from "@rod/rod";
 *
 * const r = new Rod();
 *
 * r.get("/", () => {
 *  return new Response("Hello, World!");
 * });
 * export default r;
 * ```
 */
export class Rod extends RawRod {
}
