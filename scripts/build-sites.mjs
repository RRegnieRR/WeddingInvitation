import { copyFile, mkdir, readdir, rename } from "node:fs/promises";

await mkdir("dist/client", { recursive: true });
for (const entry of await readdir("dist")) {
  if (["client", "server", ".openai"].includes(entry)) continue;
  await rename(`dist/${entry}`, `dist/client/${entry}`);
}
await mkdir("dist/server", { recursive: true });
await mkdir("dist/.openai", { recursive: true });
await copyFile("worker/index.js", "dist/server/index.js");
await copyFile(".openai/hosting.json", "dist/.openai/hosting.json");
