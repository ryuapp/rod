import type { PathSegments, RodContext as RodContextType } from "./type.ts";

type RodContextInit<Path extends string> = {
  params: { [Key in PathSegments<Path>]: string };
  request: Request;
  next?: () => Promise<void>;
};

export class RodContext<Path extends string> implements RodContextType<Path> {
  public request: Request;

  /**
   * Get path parameters
   *
   * @example Usage
   * ```ts
   * import { Rod } from "@rod/rod";
   *
   * const r = new Rod();
   *
   * r.get("/:name", (c) => {
   *   return new Response(`Hello ${c.params.name}!`);
   * });
   * ```
   */
  public readonly params: { [Key in PathSegments<Path>]: string };
  public next: () => Promise<void>;

  constructor({ params, request, next }: RodContextInit<Path>) {
    this.params = params;
    this.request = request;
    this.next = next ?? (() => Promise.resolve());
  }

  /**
   * Get search parameters
   *
   * @example Usage
   * ```ts
   * import { Rod } from "@rod/rod";
   *
   * const r = new Rod();
   *
   * r.get("/search", (c) => {
   *   return new Response(`Search query: ${c.searchParams.q}`);
   * });
   */
  get searchParams(): { [key: string]: string | string[] | undefined } {
    const url = new URL(this.request.url);
    const searchParams: { [key: string]: string | string[] | undefined } = {};
    for (const [key, value] of url.searchParams) {
      if (searchParams[key] !== undefined) {
        if (Array.isArray(searchParams[key])) {
          searchParams[key].push(value);
        } else {
          searchParams[key] = [searchParams[key], value];
        }
        continue;
      }
      searchParams[key] = value;
    }
    return searchParams;
  }
}
