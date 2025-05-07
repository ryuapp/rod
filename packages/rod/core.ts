import { RodContext } from "./context.ts";
import type { Handler, HTTPMethod } from "./type.ts";
import { joinPath } from "./utils/path.ts";

export class RawRod {
  public readonly basePath = "/";
  protected UrlPattern = URLPattern;
  protected routes: Array<{
    pathname: string;
    // deno-lint-ignore no-explicit-any
    pattern: any;
    method: "ALL" | Array<HTTPMethod>;
    handler: Handler<string>;
  }> = [];
  protected addRoute<Path extends string>(
    method: "ALL" | Array<HTTPMethod>,
    path: Path,
    handler: Handler<Path>,
  ) {
    const pathname = joinPath(this.basePath, path);
    this.routes.push({
      pathname,
      pattern: new this.UrlPattern({ pathname }),
      method,
      handler,
    });
  }

  constructor(options?: { basePath?: string }) {
    if (options?.basePath) {
      // @ts-ignore assign to readonly property
      this.basePath = options.basePath;
    }
  }

  /**
   * Register GET method route
   */
  get<Path extends string>(path: Path, handler: Handler<Path>) {
    this.addRoute(["GET"], path, handler);
  }
  /**
   * Register POST method route
   */
  post<Path extends string>(path: Path, handler: Handler<Path>) {
    this.addRoute(["POST"], path, handler);
  }
  /**
   * Register PUT method route
   */
  put<Path extends string>(path: Path, handler: Handler<Path>) {
    this.addRoute(["PUT"], path, handler);
  }
  /**
   * Register DELETE method route
   */
  delete<Path extends string>(path: Path, handler: Handler<Path>) {
    this.addRoute(["DELETE"], path, handler);
  }
  /**
   * Register PATCH method route
   */
  patch<Path extends string>(path: Path, handler: Handler<Path>) {
    this.addRoute(["PATCH"], path, handler);
  }
  /**
   * Register HEAD method route
   */
  head<Path extends string>(path: Path, handler: Handler<Path>) {
    this.addRoute(["HEAD"], path, handler);
  }
  /**
   * Register OPTIONS method route
   */
  options<Path extends string>(path: Path, handler: Handler<Path>) {
    this.addRoute(["OPTIONS"], path, handler);
  }
  /**
   * Register CONNECT method route
   */
  connect<Path extends string>(path: Path, handler: Handler<Path>) {
    this.addRoute(["CONNECT"], path, handler);
  }
  /**
   * Register TRACE method route
   */
  trace<Path extends string>(path: Path, handler: Handler<Path>) {
    this.addRoute(["TRACE"], path, handler);
  }

  /**
   * Register route for any method
   */
  all<Path extends string>(path: Path, handler: Handler<Path>) {
    this.addRoute("ALL", path, handler);
  }

  /**
   * Register routes into another router.  \
   * This will add all routes from the given router to the router.
   *
   * ```ts
   * import { Rod } from "@rod/rod";
   *
   * const api = new Rod();
   * api.get("/hello", () => new Response("Hello World!"));
   *
   * const router = new Rod();
   * router.route("/api", api);  // /api/hello
   * ```
   */
  route<Path extends string>(path: Path, router: RawRod) {
    for (const r of router.routes) {
      const newPathname = joinPath(path, r.pathname);
      this.addRoute(r.method, newPathname, r.handler);
    }
  }

  /**
   * Convert Request to Response
   *
   * @param Request
   *
   * @example
   * ```ts
   * import { Rod } from "@rod/rod";
   *
   * const router = new Rod();
   * router.get("/", () => new Response("Hello World!"));
   *
   * export default router;
   * ```
   */
  fetch = async (request: Request): Promise<Response> => {
    let response: Response | undefined;
    let index = -1;
    const next = async () => {
      index++;
      if (index < this.routes.length) {
        const route = this.routes[index];
        if (
          route.method === "ALL" ||
          route.method.includes(request.method as HTTPMethod)
        ) {
          if (route.pattern.test(request.url)) {
            const result = route.pattern.exec(request.url);
            const context = new RodContext(
              {
                params: result.pathname.groups,
                request,
                next,
              },
            );
            const res = await route.handler(context);
            if (res) {
              response = res;
            }
          }
        }
        if (response) {
          return;
        }
        next();
      }
    };
    await next();
    return response || new Response("Not Found", { status: 404 });
  };
}
