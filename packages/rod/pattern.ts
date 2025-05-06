// SPDX-FileCopyrightText: 2023 saltyAom
// SPDX-FileCopyrightText: 2019 Medley
// SPDX-License-Identifier: MIT
// https://github.com/SaltyAom/memoirist

interface MatchRouteResult {
  pathname: {
    groups: Record<string, string | undefined>;
  };
}

type RodPatternInput = string | {
  pathname: string;
};

interface ParamNode<T> {
  name: string;
  store: T | null;
  inert: Node<T> | null;
}

interface Node<T> {
  part: string;
  store: T | null;
  inert: Record<number, Node<T>> | null;
  params: ParamNode<T> | null;
  wildcardStore: T | null;
}

const createNode = <T>(part: string, inert?: Node<T>[]): Node<T> => {
  const inertMap: Record<number, Node<T>> | null = inert?.length ? {} : null;

  if (inertMap) {
    for (const child of inert!) inertMap[child.part.charCodeAt(0)] = child;
  }

  return {
    part,
    store: null,
    inert: inertMap,
    params: null,
    wildcardStore: null,
  };
};

const cloneNode = <T>(node: Node<T>, part: string): Node<T> => ({
  part,
  store: node.store,
  inert: node.inert,
  params: node.params,
  wildcardStore: node.wildcardStore,
});

const createParamNode = <T>(name: string): ParamNode<T> => ({
  name,
  store: null,
  inert: null,
});

export class RodPattern<T> {
  root: Node<T> = createNode("/");

  private static regex = {
    static: /:.+?(?=\/|$)/,
    params: /:.+?(?=\/|$)/g,
    optionalParams: /:.+?\?(?=\/|$)/g,
  };

  constructor(init: { pathname: string }) {
    this.addRoute(init.pathname, {} as T);
  }

  private addRoute(
    path: string,
    store: T,
  ) {
    if (typeof path !== "string") {
      throw new TypeError("Route path must be a string");
    }

    if (path === "") path = "/";
    else if (path.at(0) !== "/") path = `/${path}`;

    const isWildcard = path.at(-1) === "*";
    // End with ? and is param
    const optionalParams = path.match(RodPattern.regex.optionalParams);

    if (optionalParams) {
      const originalPath = path.replaceAll("?", "");
      this.addRoute(originalPath, store);

      for (let i = 0; i < optionalParams.length; i++) {
        const newPath = path.replace("/" + optionalParams.at(i), "");

        this.addRoute(newPath, store);
      }
      return store;
    }

    if (optionalParams) path.replaceAll("?", "");

    if (
      isWildcard ||
      (optionalParams && path.charCodeAt(path.length - 1) === 63)
    ) {
      // Slice off trailing '*'
      path = path.slice(0, -1);
    }

    const inertParts = path.split(RodPattern.regex.static);
    const paramParts = path.match(RodPattern.regex.params) || [];

    if (inertParts.at(-1) === "") inertParts.pop();

    let node: Node<T>;

    if (!this.root) node = this.root = createNode<T>("/");
    else node = this.root;

    let paramPartsIndex = 0;

    const inertPartsLength = inertParts.length;
    for (let i = 0; i < inertPartsLength; ++i) {
      let part = inertParts[i];

      if (i > 0) {
        // Set param on the node
        const param = paramParts[paramPartsIndex++].slice(1);

        if (node.params === null) node.params = createParamNode(param);
        else if (node.params.name !== param) {
          throw new Error(
            `Cannot create route "${path}" with parameter "${param}" ` +
              "because a route already exists with a different parameter name " +
              `("${node.params.name}") in the same location`,
          );
        }

        const params = node.params;

        if (params.inert === null) {
          node = params.inert = createNode(part);
          continue;
        }

        node = params.inert;
      }

      for (let j = 0;;) {
        if (j === part.length) {
          if (j < node.part.length) {
            // Move the current node down
            const childNode = cloneNode(node, node.part.slice(j));
            Object.assign(node, createNode(part, [childNode]));
          }
          break;
        }

        if (j === node.part.length) {
          // Add static child
          if (node.inert === null) node.inert = {};

          const inert = node.inert[part.charCodeAt(j)];

          if (inert) {
            // Re-run loop with existing static node
            node = inert;
            part = part.slice(j);
            j = 0;
            continue;
          }

          // Create new node
          const childNode = createNode<T>(part.slice(j));
          node.inert[part.charCodeAt(j)] = childNode;
          node = childNode;

          break;
        }

        if (part[j] !== node.part[j]) {
          // Split the node
          const existingChild = cloneNode(node, node.part.slice(j));
          const newChild = createNode<T>(part.slice(j));

          Object.assign(
            node,
            createNode(node.part.slice(0, j), [
              existingChild,
              newChild,
            ]),
          );

          node = newChild;

          break;
        }

        ++j;
      }
    }

    if (paramPartsIndex < paramParts.length) {
      // The final part is a parameter
      const param = paramParts[paramPartsIndex];
      const name = param.slice(1);

      if (node.params === null) node.params = createParamNode(name);
      else if (node.params.name !== name) {
        throw new Error(
          `Cannot create route "${path}" with parameter "${name}" ` +
            "because a route already exists with a different parameter name " +
            `("${node.params.name}") in the same location`,
        );
      }

      if (node.params.store === null) node.params.store = store;

      return node.params.store!;
    }

    if (isWildcard) {
      // The final part is a wildcard
      if (node.wildcardStore === null) node.wildcardStore = store;

      return node.wildcardStore;
    }

    // The final part is static
    if (node.store === null) node.store = store;

    return node.store;
  }

  public exec(input: RodPatternInput): MatchRouteResult | null {
    const url = typeof input === "string"
      ? input.startsWith("http") ? new URL(input).pathname : input
      : input.pathname;

    return matchRoute(url, url.length, this.root, 0);
  }
}

const matchRoute = <T>(
  url: string,
  urlLength: number,
  node: Node<T>,
  startIndex: number,
): MatchRouteResult | null => {
  const part = node.part;
  const length = part.length;
  const endIndex = startIndex + length;

  // Only check the pathPart if its length is > 1 since the parent has
  // already checked that the url matches the first character
  if (length > 1) {
    if (endIndex > urlLength) return null;

    // Using a loop is faster for short strings
    if (length < 15) {
      for (let i = 1, j = startIndex + 1; i < length; ++i, ++j) {
        if (part.charCodeAt(i) !== url.charCodeAt(j)) return null;
      }
    } else if (url.slice(startIndex, endIndex) !== part) return null;
  }

  // Reached the end of the URL
  if (endIndex === urlLength) {
    if (node.store !== null) {
      return {
        // store: node.store,
        pathname: {
          groups: {},
        },
      };
    }

    if (node.wildcardStore !== null) {
      return {
        // store: node.wildcardStore,
        pathname: {
          groups: { "0": "" },
        },
      };
    }

    return null;
  }

  // Check for a static leaf
  if (node.inert !== null) {
    const inert = node.inert[url.charCodeAt(endIndex)];

    if (inert !== undefined) {
      const route = matchRoute(url, urlLength, inert, endIndex);

      if (route !== null) return route;
    }
  }

  // Check for dynamic leaf
  if (node.params !== null) {
    const { store, name, inert } = node.params;
    const slashIndex = url.indexOf("/", endIndex);

    if (slashIndex !== endIndex) {
      // Params cannot be empty
      if (slashIndex === -1 || slashIndex >= urlLength) {
        if (store !== null) {
          // This is much faster than using a computed property
          const params: Record<string, string> = {};
          params[name] = url.substring(endIndex, urlLength);

          return {
            // store,
            pathname: {
              groups: params,
            },
          };
        }
      } else if (inert !== null) {
        const route = matchRoute(url, urlLength, inert, slashIndex);

        if (route !== null) {
          route.pathname.groups[name] = url.substring(endIndex, slashIndex);

          return route;
        }
      }
    }
  }

  // Check for wildcard leaf
  if (node.wildcardStore !== null) {
    return {
      // store: node.wildcardStore,
      pathname: {
        groups: {
          "0": url.slice(endIndex),
        },
      },
    };
  }

  return null;
};
