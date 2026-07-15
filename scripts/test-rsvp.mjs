import assert from "node:assert/strict";
import handler from "../api/rsvp.js";

process.env.SUPABASE_URL = "https://example.supabase.co";
process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";

const invitation = {
  id: "11111111-1111-1111-1111-111111111111",
  display_name: "Familia García",
  invitation_type: "family",
  max_adults: 2,
  max_children: 1,
};

let savedPayload = null;

global.fetch = async function (url, options = {}) {
  if (url.includes("/invitations?")) {
    return new Response(JSON.stringify([invitation]), { status: 200 });
  }

  if (url.includes("/rsvps?") && options.method === "POST") {
    savedPayload = JSON.parse(options.body);
    return new Response(JSON.stringify([savedPayload]), { status: 200 });
  }

  if (url.includes("/rsvps?")) {
    return new Response(JSON.stringify([]), { status: 200 });
  }

  return new Response("Not found", { status: 404 });
};

function createResponse() {
  return {
    body: null,
    statusCode: null,
    setHeader() {},
    status(value) {
      this.statusCode = value;
      return this;
    },
    json(value) {
      this.body = value;
      return this;
    },
    end() {},
  };
}

const lookupResponse = createResponse();
await handler(
  { method: "GET", query: { code: "ABCDEF123456" }, headers: {} },
  lookupResponse,
);
assert.equal(lookupResponse.statusCode, 200);
assert.equal(lookupResponse.body.invitation.maxAdults, 2);
assert.equal(lookupResponse.body.invitation.maxChildren, 1);
assert.equal(lookupResponse.body.invitation.invitationType, "family");

const tooManyResponse = createResponse();
await handler(
  {
    method: "POST",
    headers: {},
    body: {
      code: "ABCDEF123456",
      attendance: "yes",
      guests: [
        { type: "adult", slot: 0, name: "Ana" },
        { type: "adult", slot: 1, name: "Luis" },
        { type: "adult", slot: 2, name: "Extra" },
      ],
    },
  },
  tooManyResponse,
);
assert.equal(tooManyResponse.statusCode, 400);

const saveResponse = createResponse();
await handler(
  {
    method: "POST",
    headers: {},
    body: {
      code: "ABCDEF123456",
      attendance: "yes",
      guests: [
        { type: "adult", slot: 0, name: "Ana" },
        { type: "adult", slot: 1, name: "Luis" },
        { type: "child", slot: 0, name: "Sofía" },
      ],
      email: "ana@example.com",
      message: "Nos vemos",
    },
  },
  saveResponse,
);
assert.equal(saveResponse.statusCode, 200);
assert.equal(savedPayload.adult_count, 2);
assert.equal(savedPayload.child_count, 1);
assert.equal(savedPayload.guests[0].name, "Ana");
assert.equal(savedPayload.guests[1].name, "Luis");

invitation.display_name = "McKay Stacey";
invitation.invitation_type = "personal";
invitation.max_adults = 1;
invitation.max_children = 0;

const personalResponse = createResponse();
await handler(
  {
    method: "POST",
    headers: {},
    body: {
      code: "STACEY123",
      attendance: "yes",
      guests: [],
      message: "Ahí estaré",
    },
  },
  personalResponse,
);
assert.equal(personalResponse.statusCode, 200);
assert.equal(savedPayload.adult_count, 1);
assert.deepEqual(savedPayload.guests, [
  { type: "adult", slot: 0, name: "McKay Stacey" },
]);

console.log("RSVP API checks passed.");
