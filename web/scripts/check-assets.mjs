// Verifies that every file in the brand asset registry exists under /public.
// Run: npm run assets:check
import { existsSync, statSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const src = await readFile(new URL("../src/content/assets.ts", import.meta.url), "utf8");
const paths = [...new Set([...src.matchAll(/"(\/assets\/[^"]+\.(?:png|jpg|jpeg|webp|svg|avif))"/g)].map((m) => m[1]))];
const dirRe = /`\/assets\/(riko|books)\/\$\{file\}`/;
// expand the helper-built paths (riko("x.png"), cover("x.png"))
for (const m of src.matchAll(/\b(?:riko|cover)\("([^"]+)"/g)) {
  const folder = m[0].startsWith("riko") ? "riko" : "books";
  paths.push(`/assets/${folder}/${m[1]}`);
}
void dirRe;
const unique = [...new Set(paths)].sort();
let missing = 0;
for (const p of unique) {
  const abs = join(process.cwd(), "public", p);
  const ok = existsSync(abs) && statSync(abs).size > 0;
  if (!ok) missing++;
  console.log(`${ok ? "✓" : "✗ MISSING"}  public${p}`);
}
console.log(missing ? `\n${missing} of ${unique.length} asset files missing.` : `\nAll ${unique.length} asset files present.`);
process.exit(missing ? 1 : 0);
