import { createHash, randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import XLSX from "xlsx";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = resolve(root, ".env.local");
const guestListPath = resolve(root, "outputs/wedding-rsvp/lista-de-invitados.xlsx");
const savedLinksPath = resolve(root, "data/invitation-links.json");
const csvPath = resolve(root, "data/invitation-links.csv");

function loadLocalEnv() {
  if (!existsSync(envPath)) return;

  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
  }
}

function required(name) {
  if (!process.env[name]) throw new Error(`Missing ${name} in .env.local`);
  return process.env[name].replace(/\/$/, "");
}

function codeHash(code) {
  return createHash("sha256").update(code).digest("hex");
}

function csvCell(value) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

function validateGuest(entry, index) {
  if (!entry.displayName) {
    throw new Error(`La fila ${index + 2} necesita el nombre de la invitación.`);
  }

  if (!Number.isInteger(entry.maxAdults) || entry.maxAdults < 0 || entry.maxAdults > 20) {
    throw new Error(`${entry.displayName}: adultos debe ser un número de 0 a 20.`);
  }

  if (!Number.isInteger(entry.maxChildren) || entry.maxChildren < 0 || entry.maxChildren > 20) {
    throw new Error(`${entry.displayName}: niños debe ser un número de 0 a 20.`);
  }

  if (entry.maxAdults + entry.maxChildren < 1) {
    throw new Error(`${entry.displayName}: agrega por lo menos una invitación.`);
  }

  if (entry.invitationType === "personal" && entry.maxAdults !== 1) {
    throw new Error(`${entry.displayName}: una invitación personal debe tener exactamente 1 adulto.`);
  }
}

function slugify(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

loadLocalEnv();

if (!existsSync(guestListPath)) {
  throw new Error(
    "No encontramos outputs/wedding-rsvp/lista-de-invitados.xlsx.",
  );
}

const workbook = XLSX.readFile(guestListPath);
const worksheet = workbook.Sheets[workbook.SheetNames[0]];
const spreadsheetRows = XLSX.utils.sheet_to_json(worksheet, {
  defval: "",
  range: 3,
});
const guests = spreadsheetRows
  .map((row) => ({
    displayName: String(row["Nombre en la invitación"] || "").trim(),
    maxAdults: Number(row["Invitaciones adultos"]),
    maxChildren: Number(row["Invitaciones niños"]),
    invitationType: String(row["Tipo de invitación"] || "Familia").trim().toLowerCase() === "personal"
      ? "personal"
      : "family",
  }))
  .filter((entry) => entry.displayName);
const ids = guests.map((guest) => slugify(guest.displayName));

if (new Set(ids).size !== ids.length) {
  throw new Error("Hay nombres repetidos. Cada invitación debe tener un nombre diferente.");
}

guests.forEach((guest, index) => {
  guest.id = ids[index];
});
const existingLinks = existsSync(savedLinksPath)
  ? JSON.parse(readFileSync(savedLinksPath, "utf8"))
  : [];
const existingCodeById = new Map(existingLinks.map((item) => [item.id, item.code]));

guests.forEach(validateGuest);

if (process.argv.includes("--check-only")) {
  console.log(`La lista está lista: ${guests.length} invitaciones.`);
  process.exit(0);
}

const supabaseUrl = required("SUPABASE_URL");
const serviceRoleKey = required("SUPABASE_SERVICE_ROLE_KEY");
const siteUrl = required("WEDDING_SITE_URL");

const links = guests.map((guest) => {
  const code = existingCodeById.get(guest.id) || randomBytes(6).toString("hex").toUpperCase();
  return {
    id: guest.id,
    displayName: guest.displayName,
    maxAdults: guest.maxAdults,
    maxChildren: guest.maxChildren,
    invitationType: guest.invitationType,
    code,
    url: `${siteUrl}/invite/${code}`,
  };
});

const rows = guests.map((guest, index) => ({
  external_id: guest.id,
  code_hash: codeHash(links[index].code),
  display_name: guest.displayName,
  max_adults: guest.maxAdults,
  max_children: guest.maxChildren,
  invitation_type: guest.invitationType,
}));

const response = await fetch(`${supabaseUrl}/rest/v1/invitations?on_conflict=external_id`, {
  method: "POST",
  headers: {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    "Content-Type": "application/json",
    Prefer: "resolution=merge-duplicates,return=minimal",
  },
  body: JSON.stringify(rows),
});

if (!response.ok) {
  throw new Error(`Supabase import failed (${response.status}): ${await response.text()}`);
}

writeFileSync(savedLinksPath, `${JSON.stringify(links, null, 2)}\n`);
const linkColumn = "Enlace de invitación";
spreadsheetRows.forEach((row) => {
  const id = slugify(row["Nombre en la invitación"]);
  const link = links.find((item) => item.id === id);
  if (link) row[linkColumn] = link.url;
});
const updatedWorksheet = XLSX.utils.json_to_sheet(spreadsheetRows, {
  header: [
    "Nombre en la invitación",
    "Invitaciones adultos",
    "Invitaciones niños",
    "Tipo de invitación",
    linkColumn,
  ],
  origin: "A4",
});
XLSX.utils.sheet_add_aoa(updatedWorksheet, [
  ["Lista de invitaciones"],
  ["Cada enlace es único. Envía solamente el enlace de la familia o persona correspondiente."],
], { origin: "A1" });
workbook.Sheets[workbook.SheetNames[0]] = updatedWorksheet;
XLSX.writeFile(workbook, guestListPath);
writeFileSync(
  csvPath,
  [
    ["invitación", "tipo", "adultos", "niños", "código", "enlace_de_invitación"].map(csvCell).join(","),
    ...links.map((link) =>
      [link.displayName, link.invitationType, link.maxAdults, link.maxChildren, link.code, link.url]
        .map(csvCell)
        .join(","),
    ),
  ].join("\n") + "\n",
);

console.log(`Se crearon ${links.length} invitaciones.`);
console.log(`Enlaces personales: ${csvPath}`);
