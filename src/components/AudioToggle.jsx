import { Music2, Pause } from "lucide-react";

export function AudioToggle({ enabled, onToggle, labels }) {
  return (
    <div className="flex items-center gap-3">
      <div className="hidden rounded-full border border-white/70 bg-white/92 px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-mocha/70 shadow-soft sm:block">
        {enabled ? labels.on : labels.off} · {labels.helper}
      </div>

      <button
        type="button"
        onClick={onToggle}
        aria-pressed={enabled}
        aria-label={enabled ? labels.on : labels.off}
        className={`grid h-14 w-14 place-items-center rounded-full border border-white/70 shadow-soft transition duration-200 hover:-translate-y-0.5 ${
          enabled ? "bg-mocha text-white" : "bg-white/92 text-mocha"
        }`}
      >
        {enabled ? <Pause size={20} /> : <Music2 size={20} />}
      </button>
    </div>
  );
}
