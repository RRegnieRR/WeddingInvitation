import { MapPin } from "lucide-react";
import { SectionHeading } from "../components/SectionHeading";

export function VenueSection({ page }) {
  return (
    <section id="venue" className="section-space">
      <div className="section-shell grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="glass-panel p-8 md:p-12">
          <SectionHeading
            eyebrow={page.venue.title}
            title={page.venue.subtitle}
            align="left"
          />

          <div className="mt-8 space-y-5 text-left">
            <div>
              <div className="text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-taupe/70">
                Venue
              </div>
              <div className="mt-2 font-serif text-5xl leading-none text-mocha">
                {page.venue.name}
              </div>
            </div>

            <div className="editorial-divider h-px w-full" />

            <div className="grid gap-6 sm:grid-cols-3">
              <div>
                <div className="text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-taupe/70">
                  Date
                </div>
                <div className="mt-2 text-lg text-mocha/80">{page.venue.date}</div>
              </div>
              <div>
                <div className="text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-taupe/70">
                  Time
                </div>
                <div className="mt-2 text-lg text-mocha/80">{page.venue.time}</div>
              </div>
              <div>
                <div className="text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-taupe/70">
                  Address
                </div>
                <div className="mt-2 text-lg text-mocha/80">
                  {page.venue.addressLine1}
                </div>
              </div>
            </div>

            <div className="space-y-1 text-base text-mocha/72">
              <p>{page.venue.addressLine1}</p>
              <p>{page.venue.addressLine2}</p>
            </div>

            <a
              href={page.venue.mapsHref}
              target="_blank"
              rel="noreferrer"
              className="editorial-button-primary mt-4"
            >
              <MapPin size={16} className="mr-2" />
              {page.venue.mapsLabel}
            </a>
          </div>
        </div>

        <div className="overflow-hidden rounded-[34px] border border-white/70 bg-white/92 p-4 shadow-editorial">
          <img
            src={page.venue.image}
            alt={page.venue.name}
            className="h-[28rem] w-full rounded-[26px] object-cover md:h-[38rem]"
          />
        </div>
      </div>
    </section>
  );
}
