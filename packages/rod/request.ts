import type { PathSegments } from "./type.ts";

export class RodRequest<Path extends string> {
  private path: string;
  private request: Request;

  constructor(path: Path, request: Request) {
    this.path = path;
    this.request = request;
  }
  /**
   * Get path parameters
   *
   * @example Usage
   * ```ts
   * const r = new Rod();
   *
   * r.get("/:name", (c) => {
   *   return new Response(`Hello ${c.req.params.name}!`);
   * });
   * ```
   */
  get params(): { [Key in PathSegments<Path>]: string } {
    const pattern = new URLPattern({ pathname: this.path });
    const params = pattern.exec(new URL(this.request.url))!.pathname.groups as {
      [Key in PathSegments<Path>]: string;
    };
    return params;
  }

  /**
   * Get search parameters
   *
   * @example Usage
   * ```ts
   * const r = new Rod();
   *
   * r.get("/search", (c) => {
   *   return new Response(`Search query: ${c.req.searchParams.q}`);
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
