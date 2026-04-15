export function HeroSection({ page }) {
  const heroTone = "#7d6957";
  const heroToneSoft = "rgba(125, 105, 87, 0.38)";
  const heroToneMuted = "rgba(125, 105, 87, 0.78)";

  return (
    <header
      id="top"
      className="relative min-h-screen overflow-hidden"
    >
      <div className="absolute inset-0">
        <picture>
          <source media="(prefers-color-scheme: dark)" srcSet="assets/hero-image-dark.png" />
          <img
            src="assets/hero-image.png"
            alt=""
            className="h-full w-full object-cover object-[72%_center]"
          />
        </picture>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,250,244,0.74)_0%,rgba(247,240,232,0.34)_34%,rgba(255,248,242,0.12)_58%,rgba(251,246,239,0.08)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-ivory" />
      </div>

      <div className="section-shell relative z-10 flex min-h-screen flex-col">
        <div className="relative flex flex-1 items-start pt-24 md:pt-28 lg:pt-32">
          <div className="hero-intro relative max-w-[18rem] text-left sm:max-w-[21rem] md:max-w-[24rem] lg:max-w-[28rem]" style={{ color: heroTone }}>
            <div className="mb-8 h-px w-24 md:w-32" style={{ backgroundColor: heroToneSoft }} />
            <p className="mb-8 text-[0.76rem] font-semibold uppercase tracking-[0.58em] md:text-xs" style={{ color: heroToneMuted }}>
              {page.hero.announcement}
            </p>

            <div className="space-y-5 leading-[0.9]">
              <div className="font-script text-[4.8rem] sm:text-[5.8rem] md:text-[6.8rem] xl:text-[8rem]">
                {page.couple.partnerOne}
              </div>
              <div className="pl-1 font-script text-[2.5rem] sm:text-[2.85rem] md:text-[3.5rem]" style={{ color: heroToneMuted }}>
                &amp;
              </div>
              <div className="font-script text-[4.8rem] sm:text-[5.8rem] md:text-[6.8rem] xl:text-[8rem]">
                {page.couple.partnerTwo}
              </div>
            </div>

            <div className="my-10 flex items-center gap-4">
              <div className="h-px w-10 md:w-14" style={{ backgroundColor: heroToneSoft }} />
              <div className="text-sm" style={{ color: heroToneMuted }}>✦</div>
              <div className="h-px w-10 md:w-14" style={{ backgroundColor: heroToneSoft }} />
            </div>
          </div>
        </div>

        <div className="pb-8 text-center">
          <a
            href="#rsvp"
            className="inline-flex items-center justify-center rounded-full border px-7 py-4 text-[0.72rem] font-semibold uppercase tracking-[0.26em] transition duration-300 hover:-translate-y-0.5"
            style={{
              borderColor: "rgba(125, 105, 87, 0.18)",
              backgroundColor: "rgba(255, 252, 248, 0.76)",
              color: heroTone,
            }}
          >
            <span>{page.hero.cta}</span>
          </a>
        </div>
      </div>
    </header>
  );
}
