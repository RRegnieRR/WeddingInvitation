import express from "express";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import XLSX from "xlsx";

const app = express();
const HOST = process.env.RSVP_HOST || "127.0.0.1";
const PORT = Number(process.env.RSVP_PORT || 3001);
const DATA_DIR = path.join(process.cwd(), "data");
const WORKBOOK_PATH = path.join(DATA_DIR, "rsvp-confirmations.xlsx");
const SHEET_NAME = "RSVPs";
const RSVP_HEADERS = [
  "ID",
  "Fecha ISO",
  "Nombre",
  "Nombre normalizado",
  "Asistencia",
  "Niños",
  "Mensaje",
  "Dispositivo",
];

let writeQueue = Promise.resolve();

app.use((request, response, next) => {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (request.method === "OPTIONS") {
    response.status(204).end();
    return;
  }

  next();
});

app.use(express.json({ limit: "1mb" }));

function normalizeName(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function normalizeDeviceId(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "")
    .trim();
}

function createWorkbook(rows = []) {
  const sheetRows = [
    RSVP_HEADERS,
    ...rows.map((row) => RSVP_HEADERS.map((header) => row[header] || "")),
  ];
  const worksheet = XLSX.utils.aoa_to_sheet(sheetRows);
  worksheet["!cols"] = [
    { wch: 16 },
    { wch: 24 },
    { wch: 28 },
    { wch: 28 },
    { wch: 18 },
    { wch: 12 },
    { wch: 56 },
    { wch: 28 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, SHEET_NAME);
  return workbook;
}

async function ensureWorkbook() {
  await fs.mkdir(DATA_DIR, { recursive: true });

  try {
    await fs.access(WORKBOOK_PATH);
  } catch (error) {
    const workbook = createWorkbook();
    XLSX.writeFile(workbook, WORKBOOK_PATH);
  }
}

async function readRows() {
  await ensureWorkbook();
  const workbook = XLSX.readFile(WORKBOOK_PATH);
  const worksheet = workbook.Sheets[SHEET_NAME];

  if (!worksheet) {
    return [];
  }

  return XLSX.utils.sheet_to_json(worksheet, { defval: "" });
}

async function saveRows(rows) {
  await ensureWorkbook();
  const workbook = createWorkbook(rows);
  XLSX.writeFile(workbook, WORKBOOK_PATH);
}

function enqueueWrite(task) {
  const nextTask = writeQueue.then(task, task);
  writeQueue = nextTask.then(
    () => undefined,
    () => undefined,
  );
  return nextTask;
}

app.get("/api/rsvp/health", async (_request, response) => {
  await ensureWorkbook();
  response.json({
    ok: true,
    workbook: WORKBOOK_PATH,
  });
});

app.post("/api/rsvp", async (request, response) => {
  const payload = request.body || {};
  const honeypot = String(payload.website || "").trim();
  const name = String(payload.name || "").trim();
  const attendance = String(payload.attendance || "").trim();
  const children = String(payload.children || "").trim();
  const message = String(payload.message || "").trim();
  const deviceId = normalizeDeviceId(payload.deviceId);
  const normalizedName = normalizeName(name);

  if (honeypot) {
    response.status(400).json({
      ok: false,
      message: "Solicitud inválida.",
    });
    return;
  }

  if (!normalizedName || name.length < 2) {
    response.status(400).json({
      ok: false,
      message: "Escribe un nombre válido para guardar la confirmación.",
    });
    return;
  }

  if (!["yes", "no"].includes(attendance)) {
    response.status(400).json({
      ok: false,
      message: "Selecciona si asistirás o no asistirás.",
    });
    return;
  }

  if (!["yes", "no"].includes(children)) {
    response.status(400).json({
      ok: false,
      message: "Selecciona si asistirán niños.",
    });
    return;
  }

  if (!deviceId || deviceId.length < 10) {
    response.status(400).json({
      ok: false,
      message: "No se pudo identificar este dispositivo.",
    });
    return;
  }

  try {
    const result = await enqueueWrite(async () => {
      const rows = await readRows();
      const deviceDuplicate = rows.find(
        (row) => normalizeDeviceId(row["Dispositivo"]) === deviceId,
      );

      if (deviceDuplicate) {
        return {
          ok: false,
          duplicate: true,
          reason: "device",
          message:
            "Ya existe una confirmación enviada desde este dispositivo.",
        };
      }

      const nameDuplicate = rows.find(
        (row) =>
          normalizeName(row["Nombre normalizado"] || row["Nombre"]) ===
          normalizedName,
      );

      if (nameDuplicate) {
        return {
          ok: false,
          duplicate: true,
          reason: "name",
          message: "Ya existe una confirmación registrada con ese nombre.",
        };
      }

      const timestamp = new Date().toISOString();
      rows.push({
        ID: `RSVP-${rows.length + 1}`,
        "Fecha ISO": timestamp,
        Nombre: name,
        "Nombre normalizado": normalizedName,
        Asistencia: attendance === "yes" ? "Sí, asistiré" : "No asistiré",
        Niños: children === "yes" ? "Sí" : "No",
        Mensaje: message,
        Dispositivo: deviceId,
      });

      await saveRows(rows);

      return {
        ok: true,
        message:
          "La confirmación se guardó en el archivo Excel local correctamente.",
      };
    });

    if (!result.ok && result.duplicate) {
      response.status(409).json(result);
      return;
    }

    response.status(201).json(result);
  } catch (error) {
    console.error("No se pudo guardar la confirmación:", error);
    response.status(500).json({
      ok: false,
      message:
        "No se pudo guardar la confirmación en el archivo Excel local.",
    });
  }
});

async function startServer() {
  await ensureWorkbook();

  if (process.argv.includes("--init-only")) {
    console.log(`Workbook listo en ${WORKBOOK_PATH}`);
    return;
  }

  app.listen(PORT, HOST, () => {
    console.log(`RSVP server escuchando en http://${HOST}:${PORT}`);
    console.log(`Excel local: ${WORKBOOK_PATH}`);
  });
}

startServer().catch((error) => {
  console.error(error);
  process.exit(1);
});
