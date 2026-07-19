import { createHash } from "node:crypto";

const INVITATION_SELECT =
  "id,display_name,invitation_type,max_adults,max_children";

function json(response, statusCode, body) {
  response.status(statusCode).json(body);
}

function readRequestBody(request) {
  if (!request.body) {
    return {};
  }

  if (typeof request.body === "string") {
    try {
      return JSON.parse(request.body);
    } catch {
      return {};
    }
  }

  return request.body;
}

function getRequiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value.replace(/\/$/, "");
}

function supabaseHeaders(extra = {}) {
  const serviceRoleKey = getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");

  return {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

function normalizeCode(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

function hashCode(code) {
  return createHash("sha256").update(code).digest("hex");
}

function cleanText(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength);
}

async function supabaseRequest(path, options = {}) {
  const response = await fetch(
    `${getRequiredEnv("SUPABASE_URL")}/rest/v1/${path}`,
    {
      ...options,
      headers: supabaseHeaders(options.headers),
    },
  );

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Supabase request failed (${response.status}): ${details}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

async function findInvitation(code) {
  const codeHash = hashCode(code);
  const rows = await supabaseRequest(
    `invitations?code_hash=eq.${codeHash}&select=${INVITATION_SELECT}&limit=1`,
  );

  return rows[0] || null;
}

async function findRsvp(invitationId) {
  const rows = await supabaseRequest(
    `rsvps?invitation_id=eq.${encodeURIComponent(invitationId)}&select=attendance,email,guests,message,updated_at&limit=1`,
  );

  return rows[0] || null;
}

function publicInvitation(invitation, rsvp) {
  return {
    displayName: invitation.display_name,
    invitationType: invitation.invitation_type || "family",
    guestNames: invitedNames(invitation),
    maxAdults: invitation.max_adults,
    maxChildren: invitation.max_children,
    rsvp: rsvp
      ? {
          attendance: rsvp.attendance ? "yes" : "no",
          email: rsvp.email || "",
          guests: Array.isArray(rsvp.guests) ? rsvp.guests : [],
          message: rsvp.message || "",
          updatedAt: rsvp.updated_at,
        }
      : null,
  };
}

function invitedNames(invitation) {
  if (invitation.invitation_type === "personal") return [invitation.display_name];
  if (invitation.invitation_type !== "couple") return [];
  const names = String(invitation.display_name || "").split(/\s*(?:&|\by\b)\s*/i).map((name) => name.trim()).filter(Boolean);
  return names.length === 2 ? names : [];
}

function validateGuests(payload, invitation, attendance) {
  if (!Array.isArray(payload.guests)) {
    return { error: "Agrega los nombres de las personas que asistirán." };
  }

  let guests = payload.guests.map((guest, index) => {
    const slot = Number.isInteger(guest?.slot) ? guest.slot : index;
    const type = guest?.type === "child" ? "child" : "adult";

    return {
      slot,
      type,
      name: cleanText(guest?.name, 100),
    };
  });

  if (invitation.invitation_type === "personal" && attendance === "yes") {
    guests = [
      { slot: 0, type: "adult", name: cleanText(invitation.display_name, 100) },
      ...guests.filter((guest) => guest.type === "child"),
    ];
  }

  if (invitation.invitation_type === "couple" && attendance === "yes") {
    const names = invitedNames(invitation);
    const selectedSlots = [...new Set(
      guests.filter((guest) => guest.type === "adult").map((guest) => guest.slot),
    )];
    guests = selectedSlots
      .filter((slot) => slot >= 0 && slot < names.length)
      .map((slot) => ({ slot, type: "adult", name: names[slot] }));
  }

  if (attendance === "yes" && guests.length === 0) {
    return { error: "Selecciona al menos una persona que asistirá." };
  }

  if (attendance === "no" && guests.length > 0) {
    return { error: "Una confirmación de no asistencia no puede incluir asistentes." };
  }

  if (guests.some((guest) => guest.name.length < 2)) {
    return { error: "Escribe el nombre de cada persona que asistirá." };
  }

  const adults = guests.filter((guest) => guest.type === "adult");
  const children = guests.filter((guest) => guest.type === "child");

  if (adults.length > invitation.max_adults) {
    return {
      error: `Esta invitación incluye un máximo de ${invitation.max_adults} adultos.`,
    };
  }

  if (children.length > invitation.max_children) {
    return {
      error: `Esta invitación incluye un máximo de ${invitation.max_children} niños.`,
    };
  }

  const guestSlots = guests.map((guest) => `${guest.type}:${guest.slot}`);
  if (
    guests.some((guest) =>
      guest.slot < 0 ||
      guest.slot >=
        (guest.type === "child" ? invitation.max_children : invitation.max_adults)
    ) ||
    new Set(guestSlots).size !== guestSlots.length
  ) {
    return { error: "Los lugares seleccionados no son válidos." };
  }

  return { guests, adultCount: adults.length, childCount: children.length };
}

export default async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");

  if (request.method === "OPTIONS") {
    response.status(204).end();
    return;
  }

  if (!["GET", "POST"].includes(request.method)) {
    json(response, 405, { ok: false, message: "Método no permitido." });
    return;
  }

  try {
    const payload = request.method === "POST" ? readRequestBody(request) : {};
    const code = normalizeCode(
      request.method === "GET" ? request.query?.code : payload.code,
    );

    if (code.length < 8 || code.length > 32) {
      json(response, 400, {
        ok: false,
        message: "El código de invitación no es válido.",
      });
      return;
    }

    const invitation = await findInvitation(code);

    if (!invitation) {
      json(response, 404, {
        ok: false,
        message: "No encontramos esta invitación. Revisa el enlace que recibiste.",
      });
      return;
    }

    if (request.method === "GET") {
      const rsvp = await findRsvp(invitation.id);
      json(response, 200, {
        ok: true,
        invitation: publicInvitation(invitation, rsvp),
      });
      return;
    }

    if (cleanText(payload.website, 200)) {
      json(response, 400, { ok: false, message: "Solicitud inválida." });
      return;
    }

    const attendance = cleanText(payload.attendance, 3);

    if (!["yes", "no"].includes(attendance)) {
      json(response, 400, {
        ok: false,
        message: "Selecciona si podrán acompañarnos.",
      });
      return;
    }

    const guestResult = validateGuests(payload, invitation, attendance);

    if (guestResult.error) {
      json(response, 400, { ok: false, message: guestResult.error });
      return;
    }

    const email = cleanText(payload.email, 160);

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      json(response, 400, {
        ok: false,
        message: "Escribe un correo válido o deja el campo vacío.",
      });
      return;
    }

    const savedRows = await supabaseRequest("rsvps?on_conflict=invitation_id", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify({
        invitation_id: invitation.id,
        attendance: attendance === "yes",
        adult_count: guestResult.adultCount,
        child_count: guestResult.childCount,
        guests: guestResult.guests,
        email,
        message: cleanText(payload.message, 1000),
        updated_at: new Date().toISOString(),
      }),
    });

    json(response, 200, {
      ok: true,
      message: "Su confirmación se guardó correctamente.",
      invitation: publicInvitation(invitation, savedRows?.[0] || null),
    });
  } catch (error) {
    console.error(error);
    json(response, 500, {
      ok: false,
      message: "No pudimos guardar la confirmación. Inténtalo nuevamente.",
    });
  }
}
