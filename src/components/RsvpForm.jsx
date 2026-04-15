import { useState } from "react";

const initialState = {
  website: "",
  attendance: "yes",
  guestCount: 1,
  name: "",
  email: "",
  dietary: "",
  children: "no",
  message: "",
};

export function RsvpForm({ labels }) {
  const [formData, setFormData] = useState(initialState);
  const [submitted, setSubmitted] = useState(false);

  function updateField(field, value) {
    setFormData((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (formData.website) {
      return;
    }
    setSubmitted(true);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">{labels.honeypot}</label>
        <input
          id="website"
          name="website"
          type="text"
          value={formData.website}
          onChange={(event) => updateField("website", event.target.value)}
        />
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
                formData.attendance === option.value
                  ? "border-mocha/30 bg-champagne/55"
                  : "border-[#e7d6c3]/70 bg-white/70"
              }`}
            >
              <input
                className="h-4 w-4 accent-[#6b4d3a]"
                type="radio"
                name="attendance"
                value={option.value}
                checked={formData.attendance === option.value}
                onChange={(event) => updateField("attendance", event.target.value)}
              />
              <span className="font-body text-sm text-mocha/85">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="field-shell">
        <span className="field-label">{labels.guestCount}</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => updateField("guestCount", Math.max(1, formData.guestCount - 1))}
            className="grid h-11 w-11 place-items-center rounded-full border border-mocha/15 bg-white/75 text-xl text-mocha transition hover:bg-white"
            aria-label="Decrease guest count"
          >
            -
          </button>
          <div className="min-w-16 text-center font-serif text-4xl text-mocha">
            {formData.guestCount}
          </div>
          <button
            type="button"
            onClick={() => updateField("guestCount", formData.guestCount + 1)}
            className="grid h-11 w-11 place-items-center rounded-full border border-mocha/15 bg-white/75 text-xl text-mocha transition hover:bg-white"
            aria-label="Increase guest count"
          >
            +
          </button>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="field-shell md:col-span-2">
          <label className="field-label" htmlFor="name">
            {labels.mainContact}
          </label>
          <input
            id="name"
            className="field-input"
            type="text"
            placeholder={labels.name}
            value={formData.name}
            onChange={(event) => updateField("name", event.target.value)}
            required
          />
        </div>

        <div className="field-shell">
          <label className="field-label" htmlFor="email">
            {labels.email}
          </label>
          <input
            id="email"
            className="field-input"
            type="email"
            placeholder={labels.email}
            value={formData.email}
            onChange={(event) => updateField("email", event.target.value)}
            required
          />
        </div>

        <div className="field-shell">
          <label className="field-label" htmlFor="dietary">
            {labels.dietary}
          </label>
          <input
            id="dietary"
            className="field-input"
            type="text"
            placeholder={labels.dietary}
            value={formData.dietary}
            onChange={(event) => updateField("dietary", event.target.value)}
          />
        </div>
      </div>

      <div className="field-shell">
        <span className="field-label">{labels.children}</span>
        <div className="flex flex-wrap gap-3">
          {[
            { value: "yes", label: labels.childrenYes },
            { value: "no", label: labels.childrenNo },
          ].map((option) => (
            <label
              key={option.value}
              className={`flex cursor-pointer items-center gap-3 rounded-full border px-5 py-3 transition ${
                formData.children === option.value
                  ? "border-mocha/30 bg-champagne/55"
                  : "border-[#e7d6c3]/70 bg-white/70"
              }`}
            >
              <input
                className="h-4 w-4 accent-[#6b4d3a]"
                type="radio"
                name="children"
                value={option.value}
                checked={formData.children === option.value}
                onChange={(event) => updateField("children", event.target.value)}
              />
              <span className="font-body text-sm text-mocha/85">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="field-shell">
        <label className="field-label" htmlFor="message">
          {labels.message}
        </label>
        <textarea
          id="message"
          className="field-input min-h-28 resize-none"
          placeholder={labels.message}
          value={formData.message}
          onChange={(event) => updateField("message", event.target.value)}
        />
      </div>

      <div className="flex flex-col items-start gap-4">
        <button type="submit" className="editorial-button-primary">
          {labels.submit}
        </button>
        {submitted ? (
          <p className="rounded-full border border-white/50 bg-white/70 px-5 py-3 text-sm text-mocha/72 shadow-soft">
            {labels.success}
          </p>
        ) : null}
      </div>
    </form>
  );
}
