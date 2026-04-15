export function SectionHeading({ eyebrow, title, subtitle, align = "center" }) {
  const alignment = align === "left" ? "text-left" : "text-center";
  const subtitleAlign = align === "left" ? "mr-auto" : "mx-auto";

  return (
    <div className={alignment}>
      {eyebrow ? <p className={`eyebrow ${align === "left" ? "!text-left" : ""}`}>{eyebrow}</p> : null}
      <h2 className={`section-title ${align === "left" ? "!text-left" : ""}`}>{title}</h2>
      {subtitle ? <p className={`section-subtitle ${subtitleAlign}`}>{subtitle}</p> : null}
    </div>
  );
}
