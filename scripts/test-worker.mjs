import assert from "node:assert/strict";
import worker from "../worker/index.js";

class MockStatement {
  constructor(db, sql, bindings = []) {
    this.db = db;
    this.sql = sql;
    this.bindings = bindings;
  }

  bind(...bindings) {
    return new MockStatement(this.db, this.sql, bindings);
  }

  async run() {
    if (this.sql.startsWith("INSERT INTO invitations")) {
      const [id, externalId, codeHash, displayName, invitationType, maxAdults, maxChildren] = this.bindings;
      this.db.invitations.set(externalId, {
        id,
        external_id: externalId,
        code_hash: codeHash,
        display_name: displayName,
        invitation_type: invitationType,
        max_adults: maxAdults,
        max_children: maxChildren,
      });
    } else if (this.sql.startsWith("INSERT INTO gift_preferences")) {
      const [invitationId, preference, giftNote, updatedAt] = this.bindings;
      this.db.giftPreferences.set(invitationId, {
        invitation_id: invitationId,
        preference,
        gift_note: giftNote,
        updated_at: updatedAt,
      });
    } else if (this.sql.startsWith("DELETE FROM gift_preferences")) {
      this.db.giftPreferences.delete(this.bindings[0]);
    } else if (this.sql.startsWith("INSERT INTO rsvps")) {
      const [invitationId, attendance, adultCount, childCount, guests, message, updatedAt] = this.bindings;
      this.db.rsvps.set(invitationId, {
        invitation_id: invitationId,
        attendance,
        adult_count: adultCount,
        child_count: childCount,
        guests,
        message,
        updated_at: updatedAt,
      });
    }
    return { success: true };
  }

  async first() {
    if (this.sql.startsWith("SELECT * FROM invitations")) {
      return [...this.db.invitations.values()].find((item) => item.code_hash === this.bindings[0]) || null;
    }
    if (this.sql.startsWith("SELECT * FROM gift_preferences")) {
      return this.db.giftPreferences.get(this.bindings[0]) || null;
    }
    if (this.sql.startsWith("SELECT * FROM rsvps")) {
      return this.db.rsvps.get(this.bindings[0]) || null;
    }
    return null;
  }
}

class MockD1 {
  constructor() {
    this.invitations = new Map();
    this.giftPreferences = new Map();
    this.rsvps = new Map();
  }

  prepare(sql) {
    return new MockStatement(this, sql);
  }

  async batch(statements) {
    return Promise.all(statements.map((statement) => statement.run()));
  }
}

const env = {
  DB: new MockD1(),
  ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
};

async function jsonResponse(request) {
  const response = await worker.fetch(request, env);
  return { response, body: await response.json() };
}

const brideLookup = await jsonResponse(new Request(
  "https://wedding.test/api/rsvp?code=B25BF43BF3DF",
));
assert.equal(brideLookup.response.status, 200);
assert.equal(brideLookup.body.invitation.displayName, "Magdalena & Daniel");
assert.equal(brideLookup.body.invitation.guestGroup, "bride_family");
assert.equal(brideLookup.body.invitation.giftPreference, null);

const savePreference = await jsonResponse(new Request(
  "https://wedding.test/api/gift-preference",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code: "B25BF43BF3DF",
      preference: "both",
      giftNote: "Una sorpresa para su hogar",
      website: "",
    }),
  },
));
assert.equal(savePreference.response.status, 200);
assert.equal(savePreference.body.giftPreference.preference, "both");
assert.equal(savePreference.body.giftPreference.giftNote, "Una sorpresa para su hogar");

const savedLookup = await jsonResponse(new Request(
  "https://wedding.test/api/rsvp?code=B25BF43BF3DF",
));
assert.equal(savedLookup.body.invitation.giftPreference.preference, "both");

const combinedSave = await jsonResponse(new Request(
  "https://wedding.test/api/rsvp",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code: "B25BF43BF3DF",
      attendance: "yes",
      guests: [{ type: "adult", slot: 0, name: "Magdalena" }],
      message: "Ahí estaremos",
      giftPreference: "money",
      giftNote: "Esta nota debe limpiarse",
      website: "",
    }),
  },
));
assert.equal(combinedSave.response.status, 200);
assert.equal(combinedSave.body.invitation.rsvp.attendance, "yes");
assert.equal(combinedSave.body.invitation.giftPreference.preference, "money");
assert.equal(combinedSave.body.invitation.giftPreference.giftNote, "");

const regularLookup = await jsonResponse(new Request(
  "https://wedding.test/api/rsvp?code=STACEY123",
));
assert.equal(regularLookup.body.invitation.guestGroup, "other");

const forbiddenPreference = await jsonResponse(new Request(
  "https://wedding.test/api/gift-preference",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code: "STACEY123", preference: "money" }),
  },
));
assert.equal(forbiddenPreference.response.status, 403);

console.log("Worker gift preference checks passed.");
