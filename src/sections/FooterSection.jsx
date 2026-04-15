export function FooterSection({ page }) {
  return (
    <footer className="relative overflow-hidden pb-16 pt-4">
      <div className="section-shell">
        <div className="relative overflow-hidden rounded-[34px] border border-white/70 bg-white/92 px-8 py-12 shadow-editorial md:px-12">
          <img
            src="assets/watermark-floral.svg"
            alt=""
            className="pointer-events-none absolute bottom-0 right-0 h-40 w-40 opacity-35 md:h-60 md:w-60"
          />

          <div className="relative text-center">
            <div className="font-script text-[4.6rem] leading-none text-mocha md:text-[6.5rem]">
              {page.couple.partnerOne} &amp; {page.couple.partnerTwo}
            </div>
            <p className="mt-4 text-[0.72rem] font-semibold uppercase tracking-[0.4em] text-taupe/80">
              {page.hero.date}
            </p>
            <p className="mt-8 text-sm leading-8 text-mocha/68">{page.footer.credit}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
