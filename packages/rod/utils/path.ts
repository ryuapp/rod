export function joinPath(
  basePath: string,
  nextPath: string,
): string {
  if (nextPath === "/") {
    return basePath;
  }
  if (basePath.endsWith("/")) {
    return basePath + nextPath.replace(/^\//, "");
  } else {
    return basePath + "/" + nextPath.replace(/^\//, "");
  }
}
