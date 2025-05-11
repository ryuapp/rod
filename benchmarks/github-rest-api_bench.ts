import { frameworks } from "./frameworks.ts";
import file from "./ghes-3.16.json" with { type: "json" };

const data = Object.keys(file.paths).map((path) => {
  // deno-lint-ignore no-explicit-any
  const methods = Object.keys((file.paths as Record<string, any>)[path]);
  return {
    path: path.replaceAll(/{(\w+)}/g, ":$1"),
    method: methods,
  };
});
const routes = data.reduce((acc, cur) => {
  return acc + cur.method.length;
}, 0);
console.log("GitHub API Routes:", routes);

frameworks.forEach(({ name, instance }) => {
  const app = instance();

  data.forEach(({ path, method }) => {
    method.forEach((m) => {
      // @ts-ignore: Unreachable code error
      app[m.toLowerCase()](path, () => new Response("Hello World"));
    });
  });

  Deno.bench({ name, group: "GitHub Rest API Pattern - /" }, () => {
    app.fetch(new Request("http://localhost/"));
  });
  Deno.bench({
    name,
    group: "GitHub Rest API Pattern - /users/{user}/events/orgs/{org}",
  }, () => {
    app.fetch(new Request("http://localhost/users/test/events/orgs/test"));
  });
});
