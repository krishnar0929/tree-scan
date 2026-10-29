"use client";

import type { Answers, Distance, Owner } from "@/lib/types";
import { Chip, Header, PrimaryButton } from "./ui";

const DISTANCES: { value: Distance; label: string }[] = [
  { value: "<25", label: "< 25 ft" },
  { value: "25-50", label: "25–50" },
  { value: "50-100", label: "50–100" },
  { value: "100+", label: "100+" },
];
const TARGETS = ["House", "Car / driveway", "Fence", "Play area", "Power lines", "Nothing"];
const CHANGES = ["New lean", "Cracks", "Roots lifting", "Dead branches", "Construction nearby"];
const OWNERS: { value: Owner; label: string }[] = [
  { value: "mine", label: "My yard" },
  { value: "neighbor", label: "Neighbor" },
  { value: "common", label: "Common area" },
];

function toggle(list: string[], item: string) {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

export function Questions({
  answers,
  setAnswers,
  onBack,
  onAnalyze,
}: {
  answers: Answers;
  setAnswers: (a: Answers) => void;
  onBack: () => void;
  onAnalyze: () => void;
}) {
  const set = (patch: Partial<Answers>) => setAnswers({ ...answers, ...patch });

  return (
    <div className="flex min-h-dvh flex-col">
      <Header title="A few quick taps" subtitle="Helps judge what the tree could hit" onBack={onBack} />
      <div className="flex flex-1 flex-col gap-5 px-4 pb-4">
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-sm font-bold">How far is it from your house?</legend>
          <div className="grid grid-cols-4 gap-1.5">
            {DISTANCES.map((d) => (
              <Chip key={d.value} block selected={answers.distance === d.value} onClick={() => set({ distance: d.value })}>
                {d.label}
              </Chip>
            ))}
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-sm font-bold">What could it fall on?</legend>
          <div className="flex flex-wrap gap-1.5">
            {TARGETS.map((t) => (
              <Chip
                key={t}
                selected={answers.targets.includes(t)}
                onClick={() =>
                  set({
                    targets:
                      t === "Nothing"
                        ? answers.targets.includes("Nothing") ? [] : ["Nothing"]
                        : toggle(answers.targets.filter((x) => x !== "Nothing"), t),
                  })
                }
              >
                {t}
              </Chip>
            ))}
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-sm font-bold">Noticed any recent changes?</legend>
          <div className="flex flex-wrap gap-1.5">
            {CHANGES.map((c) => (
              <Chip key={c} selected={answers.changes.includes(c)} onClick={() => set({ changes: toggle(answers.changes, c) })}>
                {c}
              </Chip>
            ))}
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-sm font-bold">Whose tree is it?</legend>
          <div className="grid grid-cols-3 gap-1.5">
            {OWNERS.map((o) => (
              <Chip key={o.value} block selected={answers.owner === o.value} onClick={() => set({ owner: o.value })}>
                {o.label}
              </Chip>
            ))}
          </div>
        </fieldset>

        <div className="flex items-center gap-3 rounded-2xl border border-line bg-white px-3 py-2.5">
          <label htmlFor="girth" className="flex-1 text-[13px] font-semibold">
            Trunk circumference at chest height <span className="font-medium text-muted">(optional, inches)</span>
          </label>
          <input
            id="girth"
            type="number"
            inputMode="decimal"
            min={1}
            max={600}
            value={answers.circumferenceIn ?? ""}
            onChange={(e) => {
              const n = parseFloat(e.target.value);
              set({ circumferenceIn: Number.isFinite(n) && n > 0 ? n : null });
            }}
            className="h-11 w-20 rounded-xl border border-field px-2.5 text-right text-[15px]"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="notes" className="text-sm font-bold">
            Anything else? <span className="font-medium text-muted">(optional)</span>
          </label>
          <textarea
            id="notes"
            rows={2}
            maxLength={500}
            value={answers.notes}
            onChange={(e) => set({ notes: e.target.value })}
            placeholder="e.g. lost a big branch in the last storm"
            className="rounded-2xl border border-field bg-white p-3 text-[15px]"
          />
        </div>

        <p className="rounded-2xl bg-soft px-3 py-2.5 text-[13px] leading-relaxed text-[#2e3b31]">
          <span className="block text-xs font-bold uppercase tracking-wider text-[#3f4e43]">Added automatically</span>
          Today&apos;s date (for the season) and your approximate location, if you allow it.
        </p>
      </div>
      <div className="sticky bottom-0 bg-ground px-4 pb-6 pt-3">
        <PrimaryButton onClick={onAnalyze}>Analyze tree</PrimaryButton>
      </div>
    </div>
  );
}
