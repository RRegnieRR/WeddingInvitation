import { Stagger, StaggerItem } from "../components/Reveal";
import { SectionHeading } from "../components/SectionHeading";

export function PreWeddingSection({ page }) {
  return (
    <section className="section-space">
      <div className="section-shell">
        <SectionHeading
          eyebrow={page.preWedding.title}
          title={page.preWedding.subtitle}
          subtitle={page.preWedding.intro}
        />

        <Stagger className="mt-12 grid gap-6 lg:grid-cols-2">
          {page.preWedding.events.map((event) => (
            <StaggerItem key={event.title}>
              <article className="glass-panel relative overflow-hidden p-8 md:p-10">
                <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-[radial-gradient(circle,rgba(215,195,167,0.28),rgba(215,195,167,0))]" />
                <h3 className="font-serif text-4xl text-mocha">{event.title}</h3>
                <div className="mt-5 space-y-2 text-base leading-8 text-mocha/72">
                  <p>{event.date}</p>
                  <p>{event.time}</p>
                  <p>{event.location}</p>
                </div>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
