import { Stagger, StaggerItem } from "../components/Reveal";
import { SectionHeading } from "../components/SectionHeading";

export function DressCodeSection({ page }) {
  return (
    <section className="section-space">
      <div className="section-shell">
        <SectionHeading title={page.dressCode.title} />

        <Stagger className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-2">
          <StaggerItem>
          <article className="glass-panel p-8 text-center md:p-10">
            <p className="eyebrow !mb-3">Women</p>
            <h3 className="font-serif text-4xl text-mocha md:text-5xl">Women</h3>
            <p className="mt-5 text-base leading-8 text-mocha/72">
              {page.dressCode.women}
            </p>
          </article>
          </StaggerItem>

          <StaggerItem>
          <article className="glass-panel p-8 text-center md:p-10">
            <p className="eyebrow !mb-3">Men</p>
            <h3 className="font-serif text-4xl text-mocha md:text-5xl">Men</h3>
            <p className="mt-5 text-base leading-8 text-mocha/72">
              {page.dressCode.men}
            </p>
          </article>
          </StaggerItem>
        </Stagger>
      </div>
    </section>
  );
}
