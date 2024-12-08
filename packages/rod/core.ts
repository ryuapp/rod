import { RodContext } from "./context.ts";
import type { Handler, HTTPMethod } from "./type.ts";

export class RawRod {
  protected routes: Array<{
    pathname: string;
    pattern: URLPattern;
    method: "ALL" | Array<HTTPMethod>;
    handler: Handler<string>;
  }> = [];
  protected addRoute<Path extends string>(
    method: "ALL" | Array<HTTPMethod>,
    path: Path,
    handler: Handler<Path>,
  ) {
    this.routes.push({
      pathname: path,
      pattern: new URLPattern({ pathname: path }),
      method,
      handler: handler as Handler<string>,
    });
  }
  /**
   * Register GET method route
   * @param path
   * @param handler
   */
  get<Path extends string>(path: Path, handler: Handler<Path>) {
    this.addRoute(["GET"], path, handler);
  }
  /**
   * Register POST method route
   * @param path
   * @param handler
   */
  post<Path extends string>(path: Path, handler: Handler<Path>) {
    this.addRoute(["POST"], path, handler);
  }
  /**
   * Register PUT method route
   * @param path
   * @param handler
   */
  put<Path extends string>(path: Path, handler: Handler<Path>) {
    this.addRoute(["PUT"], path, handler);
  }
  /**
   * Register DELETE method route
   * @param path
   * @param handler
   */
  delete<Path extends string>(path: Path, handler: Handler<Path>) {
    this.addRoute(["DELETE"], path, handler);
  }
  /**
   * Register PATCH method route
   * @param path
   * @param handler
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
   * @param path
   * @param handler
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
   * @param path
   * @param handler
   */
  all<Path extends string>(path: Path, handler: Handler<Path>) {
    this.addRoute("ALL", path, handler);
  }
  /**
   * Convert Request to Response
   *
   * @param request
   *
   * @example Usage
   * ```ts
   * const r = new Rod();
   * r.get("/", () => new Response("Hello World!"));
   *
   * Deno.serve(r.fetch);
   * ```
   *
   * @example Default export
   * ```ts
   * const r = new Rod();
   * r.get("/", () => new Response("Hello World!"));
   *
   * export default r;
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
          const result = route.pattern.exec(request.url);
          if (result) {
            const context = new RodContext(route.pathname, request);
            const res = await route.handler(context, next);
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
