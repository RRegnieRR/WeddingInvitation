import { SectionHeading } from "../components/SectionHeading";
import { RsvpForm } from "../components/RsvpForm";

export function RsvpSection({ page }) {
  return (
    <section id="rsvp" className="section-space pb-24">
      <div className="section-shell">
        <div className="mx-auto max-w-5xl glass-panel p-8 md:p-12">
          <SectionHeading
            eyebrow={page.rsvp.title}
            title={page.rsvp.subtitle}
            align="left"
          />

          <div className="mt-10">
            <RsvpForm labels={page.rsvp} />
          </div>
        </div>
      </div>
    </section>
  );
}
