import { MapPinned } from "lucide-react";
import { SectionHeading } from "../components/SectionHeading";

export function LocationSection({ page }) {
  return (
    <section className="section-space">
      <div className="section-shell">
        <div className="glass-panel p-8 md:p-12">
          <SectionHeading title={page.location.title} align="left" />

          <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="max-w-2xl text-base leading-8 text-mocha/74">
                {page.location.address}
              </p>

              <a
                href={page.location.mapsHref}
                target="_blank"
                rel="noreferrer"
                className="editorial-button-secondary mt-6"
              >
                <MapPinned size={16} className="mr-2" />
                {page.location.mapsLabel}
              </a>
            </div>

            <ul className="space-y-4">
              {page.location.routes.map((route) => (
                <li
                  key={route}
                  className="rounded-[22px] border border-[#e2d4c4]/55 bg-white/70 px-5 py-4 text-sm leading-7 text-mocha/72 shadow-soft"
                >
                  {route}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
