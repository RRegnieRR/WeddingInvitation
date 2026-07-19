import { invitationSeeds } from "./invitations.generated.js";

const brideFamilyStartIndex = invitationSeeds.findIndex((seed) => seed[1] === "magdalena-daniel");
const brideFamilyInvitationIds = new Set(
  brideFamilyStartIndex >= 0
    ? invitationSeeds.slice(brideFamilyStartIndex).map((seed) => seed[1])
    : [],
);

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

function cleanText(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength);
}

function normalizeCode(value) {
  return String(value || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

async function hashCode(code) {
  const bytes = new TextEncoder().encode(code);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function ensureDatabase(db) {
  await db.batch([
    db.prepare("CREATE TABLE IF NOT EXISTS invitations (id TEXT PRIMARY KEY NOT NULL, external_id TEXT NOT NULL UNIQUE, code_hash TEXT NOT NULL UNIQUE, display_name TEXT NOT NULL, invitation_type TEXT NOT NULL DEFAULT 'family', max_adults INTEGER NOT NULL DEFAULT 1, max_children INTEGER NOT NULL DEFAULT 0)"),
    db.prepare("CREATE TABLE IF NOT EXISTS rsvps (invitation_id TEXT PRIMARY KEY NOT NULL, attendance INTEGER NOT NULL, adult_count INTEGER NOT NULL DEFAULT 0, child_count INTEGER NOT NULL DEFAULT 0, guests TEXT NOT NULL DEFAULT '[]', message TEXT NOT NULL DEFAULT '', updated_at TEXT NOT NULL)"),
    db.prepare("CREATE TABLE IF NOT EXISTS gift_preferences (invitation_id TEXT PRIMARY KEY NOT NULL REFERENCES invitations(id) ON DELETE CASCADE, preference TEXT NOT NULL CHECK (preference IN ('money', 'gift', 'both')), gift_note TEXT NOT NULL DEFAULT '', updated_at TEXT NOT NULL)"),
    db.prepare("CREATE INDEX IF NOT EXISTS invitations_code_hash_idx ON invitations (code_hash)"),
  ]);

  await db.batch(invitationSeeds.map((seed) => db.prepare(
    "INSERT INTO invitations (id, external_id, code_hash, display_name, invitation_type, max_adults, max_children) VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT(external_id) DO UPDATE SET display_name=excluded.display_name, invitation_type=excluded.invitation_type, max_adults=excluded.max_adults, max_children=excluded.max_children",
  ).bind(...seed)));
}

function isBrideFamily(invitation) {
  return brideFamilyInvitationIds.has(invitation.external_id);
}

function publicGiftPreference(giftPreference) {
  return giftPreference ? {
    preference: giftPreference.preference,
    giftNote: giftPreference.gift_note || "",
    updatedAt: giftPreference.updated_at,
  } : null;
}

function publicInvitation(invitation, rsvp, giftPreference) {
  let guests = [];
  try { guests = rsvp ? JSON.parse(rsvp.guests || "[]") : []; } catch {}
  return {
    displayName: invitation.display_name,
    invitationType: invitationKind(invitation),
    guestGroup: isBrideFamily(invitation) ? "bride_family" : "other",
    guestNames: invitedNames(invitation),
    maxAdults: invitation.max_adults,
    maxChildren: invitation.max_children,
    giftPreference: publicGiftPreference(giftPreference),
    rsvp: rsvp ? {
      attendance: rsvp.attendance ? "yes" : "no",
      guests,
      message: rsvp.message || "",
      updatedAt: rsvp.updated_at,
    } : null,
  };
}

async function findInvitation(db, code) {
  return db.prepare("SELECT * FROM invitations WHERE code_hash = ? LIMIT 1").bind(await hashCode(code)).first();
}

async function findGiftPreference(db, invitationId) {
  return db.prepare("SELECT * FROM gift_preferences WHERE invitation_id = ? LIMIT 1").bind(invitationId).first();
}

function invitationKind(invitation) {
  if (invitation.invitation_type === "personal") return "personal";
  if (invitation.invitation_type === "couple") return "couple";
  const names = String(invitation.display_name || "").split(/\s*(?:&|\by\b)\s*/i).map((name) => name.trim()).filter(Boolean);
  return invitation.max_adults === 2 && invitation.max_children === 0 && names.length === 2
    ? "couple"
    : "family";
}

function invitedNames(invitation) {
  if (invitation.invitation_type === "personal") return [invitation.display_name];
  if (invitationKind(invitation) !== "couple") return [];
  const names = String(invitation.display_name || "").split(/\s*(?:&|\by\b)\s*/i).map((name) => name.trim()).filter(Boolean);
  return names.length === 2 ? names : [];
}

function validateGuests(payload, invitation, attendance) {
  if (!Array.isArray(payload.guests)) return { error: "Agrega los nombres de las personas que asistirán." };
  let guests = payload.guests.map((guest, index) => ({
    slot: Number.isInteger(guest?.slot) ? guest.slot : index,
    type: guest?.type === "child" ? "child" : "adult",
    name: cleanText(guest?.name, 100),
  }));
  if (invitation.invitation_type === "personal" && attendance === "yes") {
    guests = [{ slot: 0, type: "adult", name: cleanText(invitation.display_name, 100) }, ...guests.filter((guest) => guest.type === "child")];
  }
  if (invitationKind(invitation) === "couple" && attendance === "yes") {
    const names = invitedNames(invitation);
    const selectedSlots = [...new Set(guests.filter((guest) => guest.type === "adult").map((guest) => guest.slot))];
    guests = selectedSlots.filter((slot) => slot >= 0 && slot < names.length).map((slot) => ({ slot, type: "adult", name: names[slot] }));
  }
  if (attendance === "yes" && guests.length === 0) return { error: "Selecciona al menos una persona que asistirá." };
  if (attendance === "no" && guests.length > 0) return { error: "Una confirmación de no asistencia no puede incluir asistentes." };
  if (guests.some((guest) => guest.name.length < 2)) return { error: "Escribe el nombre de cada persona que asistirá." };
  const adults = guests.filter((guest) => guest.type === "adult");
  const children = guests.filter((guest) => guest.type === "child");
  if (adults.length > invitation.max_adults) return { error: `Esta invitación incluye un máximo de ${invitation.max_adults} adultos.` };
  if (children.length > invitation.max_children) return { error: `Esta invitación incluye un máximo de ${invitation.max_children} niños.` };
  const slots = guests.map((guest) => `${guest.type}:${guest.slot}`);
  if (guests.some((guest) => guest.slot < 0 || guest.slot >= (guest.type === "child" ? invitation.max_children : invitation.max_adults)) || new Set(slots).size !== slots.length) {
    return { error: "Los lugares seleccionados no son válidos." };
  }
  return { guests, adultCount: adults.length, childCount: children.length };
}

async function handleRsvp(request, env) {
  await ensureDatabase(env.DB);
  const url = new URL(request.url);
  const payload = request.method === "POST" ? await request.json().catch(() => ({})) : {};
  const code = normalizeCode(request.method === "GET" ? url.searchParams.get("code") : payload.code);
  if (code.length < 8 || code.length > 32) return json({ ok: false, message: "El código de invitación no es válido." }, 400);
  const invitation = await findInvitation(env.DB, code);
  if (!invitation) return json({ ok: false, message: "No encontramos esta invitación. Revisa el enlace que recibiste." }, 404);
  const rsvp = await env.DB.prepare("SELECT * FROM rsvps WHERE invitation_id = ? LIMIT 1").bind(invitation.id).first();
  const giftPreference = isBrideFamily(invitation)
    ? await findGiftPreference(env.DB, invitation.id)
    : null;
  if (request.method === "GET") return json({ ok: true, invitation: publicInvitation(invitation, rsvp, giftPreference) });
  if (cleanText(payload.website, 200)) return json({ ok: false, message: "Solicitud inválida." }, 400);
  const attendance = cleanText(payload.attendance, 3);
  if (!['yes', 'no'].includes(attendance)) return json({ ok: false, message: "Selecciona si podrán acompañarnos." }, 400);
  const guestResult = validateGuests(payload, invitation, attendance);
  if (guestResult.error) return json({ ok: false, message: guestResult.error }, 400);
  const updatedAt = new Date().toISOString();
  await env.DB.prepare("INSERT INTO rsvps (invitation_id, attendance, adult_count, child_count, guests, message, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT(invitation_id) DO UPDATE SET attendance=excluded.attendance, adult_count=excluded.adult_count, child_count=excluded.child_count, guests=excluded.guests, message=excluded.message, updated_at=excluded.updated_at")
    .bind(invitation.id, attendance === "yes" ? 1 : 0, guestResult.adultCount, guestResult.childCount, JSON.stringify(guestResult.guests), cleanText(payload.message, 1000), updatedAt).run();
  const saved = await env.DB.prepare("SELECT * FROM rsvps WHERE invitation_id = ? LIMIT 1").bind(invitation.id).first();
  return json({ ok: true, message: "Su confirmación se guardó correctamente.", invitation: publicInvitation(invitation, saved, giftPreference) });
}

async function handleGiftPreference(request, env) {
  await ensureDatabase(env.DB);
  const url = new URL(request.url);
  const payload = request.method === "POST" ? await request.json().catch(() => ({})) : {};
  const code = normalizeCode(request.method === "GET" ? url.searchParams.get("code") : payload.code);
  if (code.length < 8 || code.length > 32) return json({ ok: false, message: "El código de invitación no es válido." }, 400);
  const invitation = await findInvitation(env.DB, code);
  if (!invitation) return json({ ok: false, message: "No encontramos esta invitación. Revisa el enlace que recibiste." }, 404);
  if (!isBrideFamily(invitation)) return json({ ok: false, message: "Esta opción está reservada para la familia de la novia." }, 403);

  if (request.method === "GET") {
    return json({ ok: true, giftPreference: publicGiftPreference(await findGiftPreference(env.DB, invitation.id)) });
  }

  if (cleanText(payload.website, 200)) return json({ ok: false, message: "Solicitud inválida." }, 400);
  const preference = cleanText(payload.preference, 12);
  if (!["money", "gift", "both"].includes(preference)) {
    return json({ ok: false, message: "Seleccionen dinero, regalo o ambas opciones." }, 400);
  }
  const giftNote = preference === "gift" || preference === "both"
    ? cleanText(payload.giftNote, 500)
    : "";
  const updatedAt = new Date().toISOString();
  await env.DB.prepare("INSERT INTO gift_preferences (invitation_id, preference, gift_note, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(invitation_id) DO UPDATE SET preference=excluded.preference, gift_note=excluded.gift_note, updated_at=excluded.updated_at")
    .bind(invitation.id, preference, giftNote, updatedAt).run();
  const saved = await findGiftPreference(env.DB, invitation.id);
  return json({ ok: true, message: "Su elección de regalo quedó guardada.", giftPreference: publicGiftPreference(saved) });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/rsvp" && ["GET", "POST"].includes(request.method)) return handleRsvp(request, env);
    if (url.pathname === "/api/rsvp") return json({ ok: false, message: "Método no permitido." }, 405);
    if (url.pathname === "/api/gift-preference" && ["GET", "POST"].includes(request.method)) return handleGiftPreference(request, env);
    if (url.pathname === "/api/gift-preference") return json({ ok: false, message: "Método no permitido." }, 405);
    if (url.pathname.startsWith("/invite/")) {
      const page = await env.ASSETS.fetch(new Request(new URL("/", request.url), request));
      const headers = new Headers(page.headers);
      headers.set("Cache-Control", "no-store");
      return new Response(page.body, { status: page.status, statusText: page.statusText, headers });
    }
    return env.ASSETS.fetch(request);
  },
};
