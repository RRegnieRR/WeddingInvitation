import { useEffect, useState } from "react";

function invitationCodeFromUrl() {
  const pathMatch = window.location.pathname.match(/\/invite\/([^/]+)/i);
  const queryCode = new URLSearchParams(window.location.search).get("invite");
  return decodeURIComponent(pathMatch?.[1] || queryCode || "")
    .trim()
    .toUpperCase();
}

function buildSlots(invitation) {
  const savedGuests = invitation.rsvp?.guests || [];
  const hasSavedRsvp = Boolean(invitation.rsvp);

  return Array.from({ length: invitation.maxGuests }, (_, slot) => {
    const savedGuest = savedGuests.find((guest, index) =>
      Number.isInteger(guest.slot) ? guest.slot === slot : index === slot,
    );
    const invitedName = invitation.guestNames[slot] || "";

    return {
      slot,
      invitedName,
      attending: hasSavedRsvp
        ? Boolean(savedGuest)
        : invitedName
          ? true
          : slot === 0,
      name: savedGuest?.name || invitedName,
      dietary: savedGuest?.dietary || "",
      isChild: Boolean(savedGuest?.isChild),
    };
  });
}

export function RsvpForm({ labels }) {
  const [code, setCode] = useState(invitationCodeFromUrl);
  const [codeInput, setCodeInput] = useState(code);
  const [invitation, setInvitation] = useState(null);
  const [slots, setSlots] = useState([]);
  const [attendance, setAttendance] = useState("yes");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState(code ? "loading" : "missing");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (!code) return undefined;

    const controller = new AbortController();

    async function loadInvitation() {
      setStatus("loading");
      setFeedback("");

      try {
        const response = await fetch(`/api/rsvp?code=${encodeURIComponent(code)}`, {
          signal: controller.signal,
        });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || labels.loadError);
        }

        setInvitation(result.invitation);
        setSlots(buildSlots(result.invitation));
        setAttendance(result.invitation.rsvp?.attendance || "yes");
        setEmail(result.invitation.rsvp?.email || "");
        setMessage(result.invitation.rsvp?.message || "");
        setStatus("ready");
      } catch (error) {
        if (error.name === "AbortError") return;
        setInvitation(null);
        setStatus("error");
        setFeedback(error.message);
      }
    }

    loadInvitation();
    return () => controller.abort();
  }, [code, labels.loadError]);

  function updateSlot(slotIndex, field, value) {
    setSlots((current) =>
      current.map((slot) =>
        slot.slot === slotIndex ? { ...slot, [field]: value } : slot,
      ),
    );
  }

  function useInvitationCode(event) {
    event.preventDefault();
    const nextCode = codeInput.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (!nextCode) return;

    window.history.replaceState({}, "", `/invite/${nextCode}`);
    setCode(nextCode);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("saving");
    setFeedback("");

    const attendingGuests = attendance === "yes"
      ? slots
          .filter((slot) => slot.attending)
          .map(({ slot, name, dietary, isChild }) => ({
            slot,
            name,
            dietary,
            isChild,
          }))
      : [];

    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          website,
          attendance,
          guests: attendingGuests,
          email,
          message,
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || labels.saveError);
      }

      setInvitation(result.invitation);
      setSlots(buildSlots(result.invitation));
      setStatus("saved");
      setFeedback(labels.success);
    } catch (error) {
      setStatus("ready");
      setFeedback(error.message);
    }
  }

  if (["missing", "error"].includes(status)) {
    return (
      <form onSubmit={useInvitationCode} className="max-w-xl space-y-5">
        <div className="rounded-[24px] border border-[#e7d6c3]/80 bg-white/70 p-6">
          <h3 className="font-serif text-2xl text-mocha">{labels.codeTitle}</h3>
          <p className="mt-2 font-body text-sm leading-6 text-mocha/70">
            {labels.codeHelp}
          </p>
          <label className="field-label mt-5" htmlFor="invite-code">
            {labels.codeLabel}
          </label>
          <input
            id="invite-code"
            className="field-input mt-2 uppercase tracking-[0.18em]"
            value={codeInput}
            onChange={(event) => setCodeInput(event.target.value)}
            autoComplete="off"
            required
          />
          {feedback ? <p className="mt-3 text-sm text-[#9a4f4f]">{feedback}</p> : null}
          <button type="submit" className="editorial-button-primary mt-5">
            {labels.codeSubmit}
          </button>
        </div>
      </form>
    );
  }

  if (status === "loading") {
    return <p className="font-body text-mocha/70">{labels.loading}</p>;
  }

  const attendingCount = slots.filter((slot) => slot.attending).length;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">{labels.honeypot}</label>
        <input
          id="website"
          name="website"
          type="text"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
          tabIndex="-1"
          autoComplete="off"
        />
      </div>

      <div className="rounded-[24px] border border-mocha/10 bg-champagne/35 p-6 md:p-7">
        <p className="text-xs uppercase tracking-[0.24em] text-mocha/55">
          {labels.invitationFor}
        </p>
        <h3 className="mt-2 font-serif text-3xl text-mocha">
          {invitation.displayName}
        </h3>
        <p className="mt-2 font-body text-sm leading-6 text-mocha/72">
          {labels.spacesReserved.replace("{count}", invitation.maxGuests)}
        </p>
        {invitation.rsvp ? (
          <p className="mt-3 text-sm font-medium text-mocha/75">{labels.editHelp}</p>
        ) : null}
      </div>

      <div className="field-shell">
        <span className="field-label">{labels.attendanceLabel}</span>
        <div className="grid gap-3 md:grid-cols-2">
          {[
            { value: "yes", label: labels.attendanceYes },
            { value: "no", label: labels.attendanceNo },
          ].map((option) => (
            <label
              key={option.value}
              className={`flex cursor-pointer items-center gap-3 rounded-[20px] border px-4 py-4 transition ${
                attendance === option.value
                  ? "border-mocha/30 bg-champagne/55"
                  : "border-[#e7d6c3]/70 bg-white/70"
              }`}
            >
              <input
                className="h-4 w-4 accent-[#6b4d3a]"
                type="radio"
                name="attendance"
                value={option.value}
                checked={attendance === option.value}
                onChange={(event) => setAttendance(event.target.value)}
              />
              <span className="font-body text-sm text-mocha/85">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {attendance === "yes" ? (
        <div className="field-shell space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <span className="field-label mb-0">{labels.whoAttends}</span>
            <span className="text-sm text-mocha/65">
              {labels.spacesUsed
                .replace("{used}", attendingCount)
                .replace("{max}", invitation.maxGuests)}
            </span>
          </div>

          {slots.map((slot, index) => (
            <div
              key={slot.slot}
              className={`rounded-[20px] border p-4 transition ${
                slot.attending
                  ? "border-mocha/25 bg-white/80"
                  : "border-[#e7d6c3]/60 bg-white/45"
              }`}
            >
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  className="h-5 w-5 accent-[#6b4d3a]"
                  checked={slot.attending}
                  onChange={(event) =>
                    updateSlot(slot.slot, "attending", event.target.checked)
                  }
                />
                <span className="font-body font-medium text-mocha/85">
                  {slot.invitedName || `${labels.guest} ${index + 1}`}
                </span>
              </label>

              {slot.attending ? (
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="field-label" htmlFor={`guest-name-${slot.slot}`}>
                      {labels.name}
                    </label>
                    <input
                      id={`guest-name-${slot.slot}`}
                      className="field-input"
                      value={slot.name}
                      onChange={(event) => updateSlot(slot.slot, "name", event.target.value)}
                      readOnly={Boolean(slot.invitedName)}
                      required
                    />
                  </div>
                  <div>
                    <label className="field-label" htmlFor={`dietary-${slot.slot}`}>
                      {labels.dietary}
                    </label>
                    <input
                      id={`dietary-${slot.slot}`}
                      className="field-input"
                      value={slot.dietary}
                      onChange={(event) =>
                        updateSlot(slot.slot, "dietary", event.target.value)
                      }
                      placeholder={labels.dietaryPlaceholder}
                    />
                  </div>
                  {invitation.allowChildren ? (
                    <label className="flex items-center gap-3 md:col-span-2">
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-[#6b4d3a]"
                        checked={slot.isChild}
                        onChange={(event) =>
                          updateSlot(slot.slot, "isChild", event.target.checked)
                        }
                      />
                      <span className="text-sm text-mocha/75">{labels.isChild}</span>
                    </label>
                  ) : null}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <div className="field-shell">
          <label className="field-label" htmlFor="email">{labels.email}</label>
          <input
            id="email"
            className="field-input"
            type="email"
            placeholder={labels.emailPlaceholder}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <div className="field-shell">
          <label className="field-label" htmlFor="message">{labels.message}</label>
          <textarea
            id="message"
            className="field-input min-h-24 resize-none"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col items-start gap-4">
        <button
          type="submit"
          className="editorial-button-primary disabled:cursor-wait disabled:opacity-60"
          disabled={status === "saving"}
        >
          {status === "saving" ? labels.saving : labels.submit}
        </button>
        {feedback ? (
          <p
            className={`rounded-[18px] border px-5 py-3 text-sm ${
              status === "saved"
                ? "border-white/50 bg-white/70 text-mocha/72 shadow-soft"
                : "border-[#d9a8a8] bg-[#fff7f7] text-[#8b4141]"
            }`}
          >
            {feedback}
          </p>
        ) : null}
      </div>
    </form>
  );
}
