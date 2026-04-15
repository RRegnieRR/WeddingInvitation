import { Countdown } from "../components/Countdown";
import { SectionHeading } from "../components/SectionHeading";
import { eventDate } from "../data/content";

export function CountdownSection({ page }) {
  return (
    <section id="countdown" className="section-space">
      <div className="section-shell">
        <div className="glass-panel relative overflow-hidden px-6 py-12 md:px-12 md:py-16">
          <div className="absolute inset-0 watercolor-edge" />
          <div className="relative">
            <SectionHeading eyebrow="" title={page.countdown.title} />
            <div className="mt-10">
              <Countdown targetDate={eventDate} units={page.countdown.units} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
