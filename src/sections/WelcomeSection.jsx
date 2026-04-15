import { Stagger, StaggerItem } from "../components/Reveal";
import { SectionHeading } from "../components/SectionHeading";

export function WelcomeSection({ page }) {
  return (
    <section id="welcome" className="section-space pt-8 md:pt-14">
      <div className="section-shell">
        <SectionHeading title={page.welcome.title} subtitle={page.welcome.text} />

        <Stagger className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {page.welcome.gallery.map((item, index) => (
            <StaggerItem key={item.title}>
              <figure
                className={`group overflow-hidden rounded-[28px] border border-white/70 bg-white/82 shadow-editorial ${
                  index % 3 === 1 ? "md:translate-y-8" : ""
                }`}
              >
                <div className="overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-72 w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                  />
                </div>
                <figcaption className="px-6 py-6 transition duration-300 group-hover:-translate-y-1">
                  <h3 className="font-serif text-3xl text-mocha">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-mocha/70">{item.text}</p>
                </figcaption>
              </figure>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
