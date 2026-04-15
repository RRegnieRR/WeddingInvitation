import { Stagger, StaggerItem } from "../components/Reveal";
import { SectionHeading } from "../components/SectionHeading";

export function ProgrammeSection({ page }) {
  return (
    <section id="programme" className="section-space">
      <div className="section-shell">
        <SectionHeading title={page.programme.title} />

        <div className="mx-auto mt-12 max-w-3xl">
          <div className="glass-panel px-8 py-8 md:px-14 md:py-12">
            <Stagger className="space-y-7">
              {page.programme.items.map(([time, label], index) => (
                <StaggerItem key={`${time}-${label}`}>
                  <div className="flex items-baseline justify-between gap-6">
                    <div className="font-serif text-3xl text-mocha md:text-4xl">{time}</div>
                    <div className="flex-1 editorial-divider h-px" />
                    <div className="font-body text-base uppercase tracking-[0.24em] text-taupe md:text-lg">
                      {label}
                    </div>
                  </div>
                  {index < page.programme.items.length - 1 ? (
                    <div className="mt-7 h-px bg-[#ddcfbf]/55" />
                  ) : null}
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </div>
      </div>
    </section>
  );
}
