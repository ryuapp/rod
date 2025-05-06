import { Hono } from "@hono/hono";
import { Hono as Quick } from "@hono/hono/quick";
import { Hono as Tiny } from "@hono/hono/tiny";
import { Rod } from "@rod/rod";
import { RawRod } from "../packages/rod/core.ts";

export const frameworks = [
  { name: "Hono", instance: () => new Hono() },
  { name: "Hono - quick preset", instance: () => new Quick() },
  { name: "Hono - tiny preset", instance: () => new Tiny() },
  { name: "Rod", instance: () => new Rod() },
  { name: "RawRod", instance: () => new RawRod() },
];
