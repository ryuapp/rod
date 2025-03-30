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
  next: () => Promise<void>,
) => Response | Promise<Response> | Promise<void>;

export type RodContext<Path extends string> = {
  request: Request;
  params: { [Key in PathSegments<Path>]: string };
  searchParams: { [key: string]: string | string[] | undefined };
};
