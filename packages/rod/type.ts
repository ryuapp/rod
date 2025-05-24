export type HTTPMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "PATCH"
  | "OPTIONS"
  | "HEAD"
  | "TRACE"
  | "CONNECT";

export type PathSegments<Path extends string> = Path extends
  `${infer SegmentA}/${infer SegmentB}`
  ? ParamOnly<SegmentA> | PathSegments<SegmentB>
  : Path extends `${infer Segment}*` ? ParamOnly<Segment> | "0"
  : ParamOnly<Path>;
type ParamOnly<Segment extends string> = Segment extends `:${infer Param}`
  ? Param
  : never;

export type Handler<Path extends string> = (
  context: RodContext<Path>,
) => Response | Promise<Response> | Promise<void>;

export type RodContext<Path extends string> = {
  request: Request;
  response: Response;
  /**
   * Get path parameters
   *
   * @example Usage
   * ```ts
   * import { Rod } from "@rod/rod";
   *
   * const router = new Rod();
   *
   * router.get("/:name", (c) => {
   *   return new Response(`Hello ${c.params.name}!`);
   * });
   * ```
   */
  params: { [Key in PathSegments<Path>]: string };

  /**
   * Get search parameters
   *
   * @example Usage
   * ```ts
   * import { Rod } from "@rod/rod";
   *
   * const router = new Rod();
   *
   * router.get("/search", (c) => {
   *   return new Response(`Search query: ${c.searchParams.q}`);
   * });
   */
  searchParams: { [key: string]: string | string[] | undefined };

  /**
   * Call next handler
   *
   * @example Usage
   * ```ts
   * import { Rod } from "@rod/rod";
   *
   * const router = new Rod();
   *
   * router.get("*", (c) => {
   *   console.log("Before Middleware");
   *   await c.next();
   *   console.log("After Middleware");
   * });
   *
   * router.get("/", () => {
   *  return new Response("Hello World!");
   * });
   *
   * // Output:
   * //   Before Middleware
   * //     Hello World!
   * //   After Middleware
   * ```
   */
  next: () => Promise<void>;
};
