import type { PathSegments, RodContext as RodContextType } from "./type.ts";

type RodContextInit<Path extends string> = {
  params: { [Key in PathSegments<Path>]: string };
  request: Request;
  response: Response;
  next?: () => Promise<void>;
};

export class RodContext<Path extends string> implements RodContextType<Path> {
  public request: Request;
  public response: Response;
  public readonly params: { [Key in PathSegments<Path>]: string };
  public next: () => Promise<void>;

  constructor({ params, request, response, next }: RodContextInit<Path>) {
    this.params = params;
    this.request = request;
    this.response = response;
    this.next = next ?? (() => Promise.resolve());
  }

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
