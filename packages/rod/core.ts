import { RodContext } from "./context.ts";
import type { Handler, HTTPMethod, PathWithPrefix } from "./type.ts";
import { joinPath } from "./utils/path.ts";

export type RodOptions = {
  /**
   * Base path for all routes in this app
   */
  basePath?: string;
  /**
   * Merge prefix for type-safe route merging.
   * When set, all routes must start with this prefix.
   *
   * @example
   * ```ts
   * const users = createRouter({ mergePrefix: "/users" });
   * users.get("/users", () => new Response("OK")); // ✓ Valid
   * users.get("/users/:id", () => new Response("OK")); // ✓ Valid
   * users.get("/users/:id/details", () => new Response("OK")); // ✓ Valid
   * users.get("/posts", () => new Response("OK")); // ✗ Type error
   * ```
   */
  mergePrefix?: string;
};

export type ExtractMergePrefix<Options extends RodOptions> = Options extends
  { mergePrefix: infer Prefix extends string } ? Prefix : never;

/**
 * Path type for route methods that enforces mergePrefix constraint
 */
export type ValidatedPath<Options extends RodOptions, Path extends string> =
  ExtractMergePrefix<Options> extends never ? Path
    : PathWithPrefix<ExtractMergePrefix<Options>, Path>;

export class RawRod<Options extends RodOptions = { basePath?: string }> {
  public readonly basePath = "/";
  public readonly mergePrefix!: ExtractMergePrefix<Options> extends never
    ? undefined
    : ExtractMergePrefix<Options>;
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

  constructor(options?: Options) {
    if (options?.basePath) {
      // @ts-ignore assign to readonly property
      this.basePath = options.basePath;
    }
    if (options && "mergePrefix" in options && options.mergePrefix) {
      // @ts-ignore assign to readonly property
      this.mergePrefix = options.mergePrefix;
    }
  }

  /**
   * Register GET method route
   */
  get<Path extends string>(
    path: ValidatedPath<Options, Path>,
    handler: Handler<Path>,
  ) {
    this.addRoute(["GET"], path, handler);
  }
  /**
   * Register POST method route
   */
  post<Path extends string>(
    path: ValidatedPath<Options, Path>,
    handler: Handler<Path>,
  ) {
    this.addRoute(["POST"], path, handler);
  }
  /**
   * Register PUT method route
   */
  put<Path extends string>(
    path: ValidatedPath<Options, Path>,
    handler: Handler<Path>,
  ) {
    this.addRoute(["PUT"], path, handler);
  }
  /**
   * Register DELETE method route
   */
  delete<Path extends string>(
    path: ValidatedPath<Options, Path>,
    handler: Handler<Path>,
  ) {
    this.addRoute(["DELETE"], path, handler);
  }
  /**
   * Register PATCH method route
   */
  patch<Path extends string>(
    path: ValidatedPath<Options, Path>,
    handler: Handler<Path>,
  ) {
    this.addRoute(["PATCH"], path, handler);
  }
  /**
   * Register HEAD method route
   */
  head<Path extends string>(
    path: ValidatedPath<Options, Path>,
    handler: Handler<Path>,
  ) {
    this.addRoute(["HEAD"], path, handler);
  }
  /**
   * Register OPTIONS method route
   */
  options<Path extends string>(
    path: ValidatedPath<Options, Path>,
    handler: Handler<Path>,
  ) {
    this.addRoute(["OPTIONS"], path, handler);
  }
  /**
   * Register CONNECT method route
   */
  connect<Path extends string>(
    path: ValidatedPath<Options, Path>,
    handler: Handler<Path>,
  ) {
    this.addRoute(["CONNECT"], path, handler);
  }
  /**
   * Register TRACE method route
   */
  trace<Path extends string>(
    path: ValidatedPath<Options, Path>,
    handler: Handler<Path>,
  ) {
    this.addRoute(["TRACE"], path, handler);
  }

  /**
   * Register route for any method
   */
  all<Path extends string>(
    path: ValidatedPath<Options, Path>,
    handler: Handler<Path>,
  ) {
    this.addRoute("ALL", path, handler);
  }

  /**
   * Register routes into another app.  \
   * This will add all routes from the given app to the app.
   *
   * ```ts
   * import { Rod } from "@rod/rod";
   *
   * const api = new Rod();
   * api.get("/hello", () => new Response("Hello World!"));
   *
   * const app = new Rod();
   * app.route("/api", api);  // /api/hello
   * ```
   */
  route<Path extends string, AppOptions extends RodOptions>(
    path: Path,
    app: RawRod<AppOptions>,
  ) {
    for (const r of app.routes) {
      const newPathname = joinPath(path, r.pathname);
      this.addRoute(r.method, newPathname, r.handler);
    }
  }

  /**
   * Merge routes from another app with type-safe prefix validation.  \
   * The target app must have a mergePrefix that matches the specified path.
   *
   * ```ts
   * import { createRouter, Rod } from "@rod/rod";
   *
   * const users = createRouter({ mergePrefix: "/users" });
   * users.get("/users", () => new Response("User list"));
   * users.get("/users/:id", () => new Response("User detail"));
   *
   * const app = new Rod();
   * app.merge("/users", users);  // Type-safe: prefix must match
   * ```
   */
  merge<const Path extends string>(
    path: Path,
    app: RawRod<{ mergePrefix: Path }>,
  ): void {
    if (app.mergePrefix !== path) {
      throw new Error(
        `mergePrefix mismatch: expected "${path}" but got "${app.mergePrefix}"`,
      );
    }
    for (const r of app.routes) {
      this.addRoute(r.method, r.pathname, r.handler);
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
   * const app = new Rod();
   * app.get("/", () => new Response("Hello World!"));
   *
   * export default app;
   * ```
   */
  fetch = async (request: Request): Promise<Response> => {
    let hasResponse = false;
    let response = new Response();
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
                response,
                next,
              },
            );
            const res = await route.handler(context);
            if (res) {
              response = new Response(res.body, res);
              hasResponse = true;
              return;
            } else {
              response = new Response(response.body, context.response);
            }
          }
        }
        next();
      }
    };
    await next();
    return hasResponse ? response : new Response("Not Found", { status: 404 });
  };
}
