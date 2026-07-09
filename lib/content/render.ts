import "server-only";
import fs from "node:fs";
import path from "node:path";
import Mustache from "mustache";
import type { SiteContent } from "./schema";

// Minimal HTML escaping: enough for XSS safety in text and double-quoted
// attributes, without the noisy /,=,` entity encoding of Mustache's default.
Mustache.escape = (text: string): string =>
  String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const IS_PROD = process.env.NODE_ENV === "production";
const templateCache = new Map<string, string>();
const partialsCache = new Map<string, Record<string, string>>();

function templatesDir(): string {
  return path.join(process.cwd(), "templates");
}

function loadTemplate(name: string): string {
  if (IS_PROD && templateCache.has(name)) return templateCache.get(name)!;
  const tpl = fs.readFileSync(
    path.join(templatesDir(), `${name}.html`),
    "utf8",
  );
  templateCache.set(name, tpl);
  return tpl;
}

/** Load section partials from templates/<name>/*.html keyed by basename. */
function loadPartials(name: string): Record<string, string> {
  if (IS_PROD && partialsCache.has(name)) return partialsCache.get(name)!;
  const dir = path.join(templatesDir(), name);
  const out: Record<string, string> = {};
  if (fs.existsSync(dir)) {
    for (const f of fs.readdirSync(dir)) {
      if (f.endsWith(".html")) {
        out[f.replace(/\.html$/, "")] = fs.readFileSync(
          path.join(dir, f),
          "utf8",
        );
      }
    }
  }
  partialsCache.set(name, out);
  return out;
}

/** Render a page template ("index" | "espace-de-commande" | "reseaux-franchises")
 *  against the content model. Returns the inner HTML for the page body. */
export function renderPage(name: string, content: SiteContent): string {
  const tpl = loadTemplate(name);
  const partials = loadPartials(name);
  return Mustache.render(tpl, content, partials);
}
