import { Stagger, StaggerItem } from "../components/Reveal";
import { SectionHeading } from "../components/SectionHeading";

export function GiftsSection({ page }) {
  return (
    <section className="section-space">
      <div className="section-shell">
        <SectionHeading title={page.gifts.title} subtitle={page.gifts.text} />

        <Stagger className="mx-auto mt-12 grid max-w-5xl gap-6 lg:grid-cols-2">
          {page.gifts.accounts.map((account) => (
            <StaggerItem key={account.bank}>
              <article className="glass-panel p-8 md:p-10">
                <h3 className="font-serif text-4xl text-mocha">{account.bank}</h3>
                <div className="mt-6 space-y-3 text-sm uppercase tracking-[0.22em] text-taupe/80">
                  <p>{account.iban}</p>
                  <p>{account.swift}</p>
                </div>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
