"use client";

import { useState } from "react";
import { resizeImage } from "@/lib/image";
import type { PhotoSlot } from "@/lib/types";
import { Header, PrimaryButton } from "./ui";

export type PhotoMap = Partial<Record<PhotoSlot, string>>;

interface SlotDef {
  slot: PhotoSlot;
  title: string;
  tip: string;
  required: boolean;
}

export const SLOT_DEFS: SlotDef[] = [
  { slot: "full", title: "Full tree", tip: "Step back 30–50 ft. Include a person, door or fence for scale.", required: true },
  { slot: "base", title: "Trunk base & roots", tip: "Where the trunk meets the ground. Show soil, roots and any mushrooms.", required: true },
  { slot: "bark", title: "Bark close-up", tip: "At chest height. Hold a hand or coin against the trunk.", required: true },
  { slot: "leaves", title: "Leaves, needles or cones", tip: "Sharpens species ID.", required: false },
  { slot: "otherSide", title: "Opposite side", tip: "Shows lean and one-sided crowns.", required: false },
  { slot: "crown", title: "Looking up", tip: "From under the tree, to show dead or hanging branches.", required: false },
  { slot: "problem", title: "Problem spot", tip: "A crack, cavity, fungus or broken limb.", required: false },
];

export function Capture({
  photos,
  setPhotos,
  onBack,
  onNext,
}: {
  photos: PhotoMap;
  setPhotos: (p: PhotoMap) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const [busy, setBusy] = useState<PhotoSlot | null>(null);
  const [error, setError] = useState<string | null>(null);

  const requiredDone = SLOT_DEFS.filter((d) => d.required).every((d) => photos[d.slot]);
  const count = Object.values(photos).filter(Boolean).length;

  async function handleFile(slot: PhotoSlot, file: File | undefined) {
    if (!file) return;
    setError(null);
    setBusy(slot);
    try {
      const dataUrl = await resizeImage(file);
      setPhotos({ ...photos, [slot]: dataUrl });
    } catch {
      setError("That photo couldn't be read. Try a JPEG or PNG, or retake it.");
    } finally {
      setBusy(null);
    }
  }

  function remove(slot: PhotoSlot) {
    const next = { ...photos };
    delete next[slot];
    setPhotos(next);
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <Header title="Add photos" subtitle={`Take with camera or upload · ${count} added, 3 required`} onBack={onBack} />
      <div className="flex flex-1 flex-col gap-3 px-4 pb-4">
        {SLOT_DEFS.map((d, i) => {
          const src = photos[d.slot];
          const cameraId = `camera-${d.slot}`;
          const uploadId = `upload-${d.slot}`;
          return (
            <div key={d.slot}>
              {i === 3 && (
                <p className="mb-2 mt-2 text-xs font-bold uppercase tracking-wider text-muted">Optional — each one raises confidence</p>
              )}
              <div className="rounded-2xl border border-line bg-white p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-soft">
                  {src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={src} alt={`${d.title} photo`} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-sm font-extrabold text-forest">{i + 1}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-bold">
                    {d.title}
                    {d.required && !src && <span className="ml-1.5 text-xs font-semibold text-[#8a3c08]">Required</span>}
                  </p>
                  <p className="text-[13px] leading-snug text-muted">{d.tip}</p>
                </div>
                {src && (
                  <button
                    type="button"
                    onClick={() => remove(d.slot)}
                    className="h-11 shrink-0 px-1 text-xs font-semibold text-muted underline"
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <label
                  htmlFor={cameraId}
                  className={[
                    "flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl text-sm font-bold",
                    src ? "border border-field bg-white text-ink" : "bg-forest text-white hover:bg-forest-dark",
                  ].join(" ")}
                >
                  <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
                    <circle cx="12" cy="13" r="3.5" />
                  </svg>
                  {busy === d.slot ? "…" : src ? "Retake" : "Camera"}
                </label>
                <label
                  htmlFor={uploadId}
                  className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-field bg-white text-sm font-bold text-ink hover:border-forest"
                >
                  <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="16" rx="2" />
                    <circle cx="9" cy="10" r="2" />
                    <path d="M21 16l-5-5-8 9" />
                  </svg>
                  {src ? "Replace" : "Upload"}
                </label>
                {/* capture="environment" opens the rear camera directly; the second input opens the photo library. */}
                <input
                  id={cameraId}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="sr-only"
                  onChange={(e) => {
                    void handleFile(d.slot, e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
                <input
                  id={uploadId}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => {
                    void handleFile(d.slot, e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
              </div>
              </div>
            </div>
          );
        })}
        {error && (
          <p role="alert" className="rounded-xl bg-[#fde8e6] p-3 text-sm text-[#8f1d13]">
            {error}
          </p>
        )}
      </div>
      <div className="sticky bottom-0 bg-ground px-4 pb-6 pt-3">
        <PrimaryButton onClick={onNext} disabled={!requiredDone || busy !== null}>
          {requiredDone ? "Next" : "Add the 3 required photos"}
        </PrimaryButton>
      </div>
    </div>
  );
}
