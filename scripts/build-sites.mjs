import { copyFile, cp, mkdir, rm } from "node:fs/promises";

await rm("dist", { recursive: true, force: true });
await mkdir("dist/client/scripts", { recursive: true });
await mkdir("dist/client/styles", { recursive: true });
await mkdir("dist/server", { recursive: true });
await mkdir("dist/.openai", { recursive: true });
await mkdir("dist/.openai/drizzle", { recursive: true });
await copyFile("index.html", "dist/client/index.html");
await copyFile("scripts/main.js", "dist/client/scripts/main.js");
await copyFile("styles/main.css", "dist/client/styles/main.css");
await copyFile("Joy in the Little Things.mp3", "dist/client/Joy in the Little Things.mp3");
await cp("assets", "dist/client/assets", { recursive: true });
await copyFile("worker/index.js", "dist/server/index.js");
await copyFile("worker/invitations.generated.js", "dist/server/invitations.generated.js");
await copyFile(".openai/hosting.json", "dist/.openai/hosting.json");
await cp("drizzle", "dist/.openai/drizzle", { recursive: true });
