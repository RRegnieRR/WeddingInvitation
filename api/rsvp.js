import XLSX from "xlsx";

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

function json(response, statusCode, body) {
  response.status(statusCode).json(body);
}

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

function parseCookies(cookieHeader) {
  return String(cookieHeader || "")
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((accumulator, part) => {
      const separatorIndex = part.indexOf("=");

      if (separatorIndex === -1) {
        return accumulator;
      }

      const key = part.slice(0, separatorIndex).trim();
      const value = part.slice(separatorIndex + 1).trim();
      accumulator[key] = decodeURIComponent(value);
      return accumulator;
    }, {});
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

function parseWorkbookContent(base64Content) {
  if (!base64Content) {
    return [];
  }

  const buffer = Buffer.from(base64Content, "base64");
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const worksheet = workbook.Sheets[SHEET_NAME];

  if (!worksheet) {
    return [];
  }

  return XLSX.utils.sheet_to_json(worksheet, { defval: "" });
}

function workbookRowsToBase64(rows) {
  const workbook = createWorkbook(rows);
  const output = XLSX.write(workbook, {
    type: "buffer",
    bookType: "xlsx",
  });
  return Buffer.from(output).toString("base64");
}

function getRequiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function buildGitHubHeaders() {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${getRequiredEnv("GITHUB_TOKEN")}`,
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "wedding-rsvp-server",
  };
}

function getRepoConfig() {
  return {
    owner: getRequiredEnv("GITHUB_OWNER"),
    repo: getRequiredEnv("GITHUB_REPO"),
    branch: process.env.GITHUB_BRANCH || "main",
    path: process.env.RSVP_FILE_PATH || "data/rsvp-confirmations.xlsx",
    committerName:
      process.env.RSVP_COMMITTER_NAME || "Wedding RSVP Bot",
    committerEmail:
      process.env.RSVP_COMMITTER_EMAIL || "bot@example.com",
  };
}

async function fetchWorkbookFromGitHub(config) {
  const fileUrl = new URL(
    `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.path}`,
  );
  fileUrl.searchParams.set("ref", config.branch);

  const response = await fetch(fileUrl, {
    headers: buildGitHubHeaders(),
  });

  if (response.status === 404) {
    return {
      sha: null,
      rows: [],
    };
  }

  if (!response.ok) {
    throw new Error(`GitHub read failed with status ${response.status}`);
  }

  const payload = await response.json();

  return {
    sha: payload.sha,
    rows: parseWorkbookContent(payload.content),
  };
}

async function saveWorkbookToGitHub(config, rows, sha) {
  const response = await fetch(
    `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.path}`,
    {
      method: "PUT",
      headers: {
        ...buildGitHubHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Save RSVP for ${rows[rows.length - 1]?.Nombre || "guest"}`,
        content: workbookRowsToBase64(rows),
        branch: config.branch,
        sha: sha || undefined,
        committer: {
          name: config.committerName,
          email: config.committerEmail,
        },
      }),
    },
  );

  if (response.status === 409) {
    return {
      conflict: true,
    };
  }

  if (!response.ok) {
    const details = await response.text();
    throw new Error(
      `GitHub write failed with status ${response.status}: ${details}`,
    );
  }

  return {
    conflict: false,
  };
}

function findDuplicate(rows, normalizedName, deviceId, cookieDeviceId) {
  const duplicateByName = rows.find(
    (row) =>
      normalizeName(row["Nombre normalizado"] || row["Nombre"]) === normalizedName,
  );

  if (duplicateByName) {
    return {
      reason: "name",
      message: "Ya existe una confirmación registrada con ese nombre.",
    };
  }

  const duplicateByDevice = rows.find(
    (row) => normalizeDeviceId(row["Dispositivo"]) === deviceId,
  );

  if (duplicateByDevice) {
    return {
      reason: "device",
      message: "Este dispositivo ya envió una confirmación anteriormente.",
    };
  }

  if (cookieDeviceId && cookieDeviceId === deviceId) {
    return {
      reason: "device",
      message: "Este navegador ya había enviado una confirmación.",
    };
  }

  return null;
}

function readRequestBody(request) {
  if (!request.body) {
    return {};
  }

  if (typeof request.body === "string") {
    try {
      return JSON.parse(request.body);
    } catch (error) {
      return {};
    }
  }

  return request.body;
}

function setSubmissionCookie(request, response, deviceId) {
  const isSecure =
    request.headers["x-forwarded-proto"] === "https" ||
    process.env.NODE_ENV === "production";
  const parts = [
    `wedding_rsvp_device=${encodeURIComponent(deviceId)}`,
    "Path=/",
    "Max-Age=31536000",
    "SameSite=Lax",
  ];

  if (isSecure) {
    parts.push("Secure");
  }

  response.setHeader("Set-Cookie", parts.join("; "));
}

export default async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");

  if (request.method === "OPTIONS") {
    response.status(204).end();
    return;
  }

  if (request.method === "GET") {
    json(response, 200, {
      ok: true,
      mode: "github",
    });
    return;
  }

  if (request.method !== "POST") {
    json(response, 405, {
      ok: false,
      message: "Método no permitido.",
    });
    return;
  }

  try {
    const payload = readRequestBody(request);
    const cookies = parseCookies(request.headers.cookie);
    const honeypot = String(payload.website || "").trim();
    const name = String(payload.name || "").trim();
    const normalizedName = normalizeName(name);
    const attendance = String(payload.attendance || "").trim();
    const children = String(payload.children || "").trim();
    const message = String(payload.message || "").trim();
    const deviceId = normalizeDeviceId(payload.deviceId);
    const cookieDeviceId = normalizeDeviceId(cookies.wedding_rsvp_device);

    if (honeypot) {
      json(response, 400, {
        ok: false,
        message: "Solicitud inválida.",
      });
      return;
    }

    if (!normalizedName || name.length < 2) {
      json(response, 400, {
        ok: false,
        message: "Escribe un nombre válido para guardar la confirmación.",
      });
      return;
    }

    if (!["yes", "no"].includes(attendance)) {
      json(response, 400, {
        ok: false,
        message: "Selecciona si asistirás o no asistirás.",
      });
      return;
    }

    if (!["yes", "no"].includes(children)) {
      json(response, 400, {
        ok: false,
        message: "Selecciona si asistirán niños.",
      });
      return;
    }

    if (!deviceId || deviceId.length < 10) {
      json(response, 400, {
        ok: false,
        message: "No se pudo identificar este dispositivo.",
      });
      return;
    }

    const config = getRepoConfig();

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const { rows, sha } = await fetchWorkbookFromGitHub(config);
      const duplicate = findDuplicate(
        rows,
        normalizedName,
        deviceId,
        cookieDeviceId,
      );

      if (duplicate) {
        json(response, 409, {
          ok: false,
          duplicate: true,
          reason: duplicate.reason,
          message: duplicate.message,
        });
        return;
      }

      const timestamp = new Date().toISOString();
      const nextRows = rows.concat({
        ID: `RSVP-${rows.length + 1}`,
        "Fecha ISO": timestamp,
        Nombre: name,
        "Nombre normalizado": normalizedName,
        Asistencia: attendance === "yes" ? "Sí, asistiré" : "No asistiré",
        Niños: children === "yes" ? "Sí" : "No",
        Mensaje: message,
        Dispositivo: deviceId,
      });

      const result = await saveWorkbookToGitHub(config, nextRows, sha);

      if (!result.conflict) {
        setSubmissionCookie(request, response, deviceId);
        json(response, 201, {
          ok: true,
          message:
            "La confirmación se guardó correctamente y ya quedó actualizada en GitHub.",
        });
        return;
      }
    }

    json(response, 409, {
      ok: false,
      message:
        "Se cruzó otra confirmación al mismo tiempo. Intenta enviarla nuevamente.",
    });
  } catch (error) {
    console.error(error);
    json(response, 500, {
      ok: false,
      message:
        "No se pudo guardar la confirmación en GitHub. Revisa las variables de entorno del backend.",
    });
  }
}
