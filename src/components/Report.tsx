"use client";

import type { Assessment, RiskLevel, Severity, Urgency } from "@/lib/types";
import { Card, Header, PrimaryButton } from "./ui";

const RISK: Record<RiskLevel, { label: string; text: string; bar: number }> = {
  low: { label: "Low", text: "text-[#1e5a2b]", bar: 0 },
  moderate: { label: "Moderate", text: "text-[#8a3c08]", bar: 1 },
  high: { label: "High", text: "text-[#9b1c12]", bar: 2 },
};
const BAR_COLORS = ["bg-[#8cc79a]", "bg-[#d97706]", "bg-[#c0392b]"];

const SEVERITY: Record<Severity, { label: string; dot: string; text: string }> = {
  high: { label: "High", dot: "bg-[#b42318]", text: "text-[#9b1c12]" },
  moderate: { label: "Moderate", dot: "bg-[#b45309]", text: "text-[#8a3c08]" },
  low: { label: "Low", dot: "bg-[#6b7a6f]", text: "text-muted" },
  good: { label: "Good", dot: "bg-[#2f7a3e]", text: "text-[#1e5a2b]" },
};

const URGENCY: Record<Urgency, string> = { now: "Now", soon: "Soon", routine: "Routine" };

const CONDITION: Record<Assessment["condition"], string> = {
  good: "Good",
  fair: "Fair",
  poor: "Poor",
  dead: "Dead or dying",
};

function fmt(r: { min: number; max: number }, unit: string) {
  return r.min === r.max ? `~${r.min} ${unit}` : `${r.min}–${r.max} ${unit}`;
}

export function Report({
  assessment: a,
  demo,
  photo,
  onAddPhotos,
  onNewScan,
}: {
  assessment: Assessment;
  demo: boolean;
  photo?: string;
  onAddPhotos: () => void;
  onNewScan: () => void;
}) {
  if (!a.is_tree) {
    return (
      <div className="flex min-h-dvh flex-col">
        <Header title="Couldn't find a tree" onBack={onAddPhotos} />
        <div className="flex flex-col gap-4 px-4">
          <Card>
            <p className="text-[15px] leading-relaxed">The photos don&apos;t seem to show a tree clearly.</p>
            {a.photo_issues.length > 0 && (
              <ul className="mt-2 list-disc pl-5 text-sm text-muted">
                {a.photo_issues.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            )}
          </Card>
          <PrimaryButton onClick={onAddPhotos}>Retake photos</PrimaryButton>
        </div>
      </div>
    );
  }

  const risk = RISK[a.storm_risk];

  return (
    <div className="flex min-h-dvh flex-col pb-8">
      <Header title="Assessment" onBack={onNewScan} />
      <div className="flex flex-col gap-3.5 px-4">
        {demo && (
          <p role="status" className="rounded-2xl bg-[#fce7cf] p-3 text-sm font-semibold text-[#6b2f06]">
            Demo mode: this is a sample report. Add ANTHROPIC_API_KEY to .env.local to analyze your photos.
          </p>
        )}

        {photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt="The scanned tree" className="h-56 w-full rounded-3xl object-cover" />
        )}

        <Card className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted">Storm risk</h2>
            <span className="text-xs font-semibold text-muted">Confidence {a.confidence}%</span>
          </div>
          <p className={`text-3xl font-extrabold tracking-tight ${risk.text}`}>{risk.label}</p>
          <div className="grid grid-cols-3 gap-1" aria-hidden="true">
            {BAR_COLORS.map((c, i) => (
              <div
                key={c}
                className={`h-2.5 rounded-full ${c} ${i === risk.bar ? "outline-2 outline-offset-2 outline-ink" : "opacity-35"}`}
              />
            ))}
          </div>
          <div className="grid grid-cols-3 text-xs text-muted" aria-hidden="true">
            <span>Low</span>
            <span className="text-center">Moderate</span>
            <span className="text-right">High</span>
          </div>
          <p className="text-sm leading-relaxed text-[#2e3b31]">{a.risk_summary}</p>
        </Card>

        <dl className="grid grid-cols-2 gap-2">
          {[
            ["Species", a.species.common_name, a.species.scientific_name ? `${a.species.scientific_name} · ${a.species.confidence}%` : `${a.species.confidence}% match`],
            ["Height", fmt(a.height_ft, "ft"), "Estimated from scale"],
            ["Trunk diameter", fmt(a.trunk_diameter_in, "in"), "Measure to refine"],
            ["Estimated age", fmt(a.age_years, "yrs"), "Rough range"],
          ].map(([label, value, sub]) => (
            <div key={label} className="flex flex-col gap-1 rounded-2xl border border-line bg-white p-3">
              <dt className="text-xs font-semibold text-muted">{label}</dt>
              <dd className="text-base font-extrabold leading-tight">{value}</dd>
              <dd className="text-xs text-muted">{sub}</dd>
            </div>
          ))}
        </dl>

        <Card className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold">Condition: {CONDITION[a.condition]}</h2>
            <span className="text-xs text-muted">{a.findings.length} findings</span>
          </div>
          <ul className="flex flex-col gap-3">
            {a.findings.map((f, i) => {
              const s = SEVERITY[f.severity];
              return (
                <li key={i} className="flex items-start gap-2.5">
                  <span className={`mt-1 h-3 w-3 shrink-0 rounded-full ${s.dot}`} aria-hidden="true" />
                  <div>
                    <p className="text-sm font-bold">
                      {f.title} <span className={s.text}>· {s.label}</span>
                    </p>
                    <p className="text-[13px] leading-snug text-muted">{f.detail}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card className="flex flex-col gap-3">
          <h2 className="text-base font-extrabold">What to do</h2>
          <ol className="flex flex-col gap-3">
            {a.actions.map((x, i) => (
              <li key={i} className="flex gap-2.5">
                <span className="text-sm font-extrabold text-forest">{i + 1}</span>
                <div>
                  <p className="text-sm font-bold">
                    {x.title} <span className="text-xs font-semibold text-muted">· {URGENCY[x.urgency]}</span>
                  </p>
                  {x.detail && <p className="text-[13px] leading-snug text-muted">{x.detail}</p>}
                </div>
              </li>
            ))}
          </ol>
        </Card>

        {a.improve_confidence.length > 0 && (
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-soft px-3.5 py-3">
            <div className="text-[13px] leading-snug text-[#2e3b31]">
              <p className="font-bold">Raise confidence</p>
              <ul className="list-disc pl-4">
                {a.improve_confidence.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
            <button type="button" onClick={onAddPhotos} className="h-11 shrink-0 rounded-xl px-3 text-sm font-bold text-forest hover:bg-white">
              Add
            </button>
          </div>
        )}

        {a.needs_arborist && (
          <a
            href="https://www.treesaregood.org/findanarborist"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-14 items-center justify-center rounded-2xl bg-forest text-base font-bold text-white hover:bg-forest-dark"
          >
            Find a certified arborist
          </a>
        )}
        <button
          type="button"
          onClick={onNewScan}
          className="flex h-12 items-center justify-center rounded-2xl border border-field bg-white text-[15px] font-bold hover:border-forest"
        >
          Scan another tree
        </button>
        <p className="px-2 text-center text-xs leading-relaxed text-muted">
          Estimates from photos only. Not a substitute for an in-person inspection by a certified arborist.
        </p>
      </div>
    </div>
  );
}
