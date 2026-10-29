"use client";

import { TreeIcon } from "./ui";

export function Home({ onStart }: { onStart: () => void }) {
  const steps = ["Guided photos", "4 quick taps", "Risk report"];
  return (
    <div className="flex flex-col gap-5 px-5 pb-10 pt-8">
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest text-white">
          <TreeIcon />
        </div>
        <span className="text-xl font-extrabold tracking-tight">Tree Scan</span>
      </div>

      <section className="flex flex-col gap-3.5 rounded-3xl bg-forest p-6 text-white">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#d7e8da]">Storm season check</p>
        <h1 className="text-[26px] font-extrabold leading-tight tracking-tight">Is that tree safe near your house?</h1>
        <p className="text-[15px] leading-relaxed text-[#e8f1e9]">
          Snap 3 photos. Get species, size, age, health and storm-risk estimates in about a minute.
        </p>
        <button
          type="button"
          onClick={onStart}
          className="mt-1 flex h-13 items-center justify-center gap-2 rounded-2xl bg-white py-3.5 text-base font-bold text-ink hover:bg-soft"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
            <circle cx="12" cy="13" r="3.5" />
          </svg>
          Scan a tree
        </button>
      </section>

      <section className="flex flex-col gap-2.5">
        <h2 className="text-[15px] font-bold">How it works</h2>
        <ol className="grid grid-cols-3 gap-2">
          {steps.map((s, i) => (
            <li key={s} className="flex flex-col gap-1.5 rounded-2xl border border-line bg-white p-3">
              <span className="text-sm font-extrabold text-forest">0{i + 1}</span>
              <span className="text-sm font-semibold leading-snug">{s}</span>
            </li>
          ))}
        </ol>
      </section>

      <p className="text-center text-xs leading-relaxed text-muted">
        Estimates from photos only. Photos can&apos;t show internal decay or root rot — for any tree near your home,
        a certified arborist has the final word.
      </p>
    </div>
  );
}
