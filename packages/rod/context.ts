import { RodRequest } from "./request.ts";

export class RodContext<Path extends string> {
  public req: RodRequest<Path>;
  public request: Request;

  constructor(path: Path, request: Request) {
    this.req = new RodRequest(path, request);
    this.request = request;
  }
}
