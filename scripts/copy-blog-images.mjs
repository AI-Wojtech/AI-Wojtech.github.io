import { cp, mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const sourceDir = path.join(root, "src", "assets", "blog-images");
const targetDir = path.join(root, "public", "assets", "blog-images");

if (!existsSync(sourceDir)) {
  console.warn(`[copy-blog-images] Missing source: ${sourceDir}`);
  process.exit(0);
}

await rm(targetDir, { recursive: true, force: true });
await mkdir(path.dirname(targetDir), { recursive: true });
await cp(sourceDir, targetDir, { recursive: true });
console.log(`[copy-blog-images] Copied ${sourceDir} -> ${targetDir}`);
