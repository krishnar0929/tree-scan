"use client";

import { useState } from "react";
import { Capture, SLOT_DEFS, type PhotoMap } from "@/components/Capture";
import { Home } from "@/components/Home";
import { Questions } from "@/components/Questions";
import { Report } from "@/components/Report";
import { TreeIcon } from "@/components/ui";
import type { Answers, AssessRequest, AssessResponse, Context, PhotoInput } from "@/lib/types";

type Step = "home" | "capture" | "questions" | "analyzing" | "report";

const EMPTY_ANSWERS: Answers = {
  distance: null,
  targets: [],
  changes: [],
  owner: null,
  circumferenceIn: null,
  notes: "",
};

function getLocation(): Promise<{ lat: number; lon: number } | null> {
  if (typeof navigator === "undefined" || !navigator.geolocation) return Promise.resolve(null);
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 600_000 },
    );
  });
}

export default function Page() {
  const [step, setStep] = useState<Step>("home");
  const [photos, setPhotos] = useState<PhotoMap>({});
  const [answers, setAnswers] = useState<Answers>(EMPTY_ANSWERS);
  const [result, setResult] = useState<AssessResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setPhotos({});
    setAnswers(EMPTY_ANSWERS);
    setResult(null);
    setError(null);
    setStep("home");
  }

  async function analyze() {
    setError(null);
    setStep("analyzing");
    try {
      const loc = await getLocation();
      const context: Context = {
        date: new Date().toISOString().slice(0, 10),
        lat: loc?.lat ?? null,
        lon: loc?.lon ?? null,
      };
      const photoInputs: PhotoInput[] = SLOT_DEFS.flatMap((d) => {
        const dataUrl = photos[d.slot];
        return dataUrl ? [{ slot: d.slot, dataUrl }] : [];
      });
      const body: AssessRequest = { photos: photoInputs, answers, context };
      const res = await fetch("/api/assess", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.status === 413) throw new Error("Photos are too large to send together. Remove an optional photo and try again.");
      const json = (await res.json().catch(() => ({}))) as Partial<AssessResponse> & { error?: string };
      if (!res.ok || !json.assessment) throw new Error(json.error || "Something went wrong.");
      setResult({ assessment: json.assessment, demo: Boolean(json.demo) });
      setStep("report");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setStep("questions");
    }
  }

  if (step === "home") return <Home onStart={() => setStep("capture")} />;

  if (step === "capture")
    return <Capture photos={photos} setPhotos={setPhotos} onBack={() => setStep("home")} onNext={() => setStep("questions")} />;

  if (step === "questions")
    return (
      <>
        {error && (
          <p role="alert" className="mx-4 mt-4 rounded-xl bg-[#fde8e6] p-3 text-sm text-[#8f1d13]">
            {error}
          </p>
        )}
        <Questions answers={answers} setAnswers={setAnswers} onBack={() => setStep("capture")} onAnalyze={analyze} />
      </>
    );

  if (step === "analyzing")
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-8 text-center" role="status" aria-live="polite">
        <div className="flex h-16 w-16 animate-pulse items-center justify-center rounded-2xl bg-forest text-white">
          <TreeIcon className="h-8 w-8" />
        </div>
        <p className="text-lg font-bold">Looking at your tree…</p>
        <p className="text-sm text-muted">Checking species, size, lean and visible defects. This takes about 20–40 seconds.</p>
      </div>
    );

  return result ? (
    <Report
      assessment={result.assessment}
      demo={result.demo}
      photo={photos.full}
      onAddPhotos={() => setStep("capture")}
      onNewScan={reset}
    />
  ) : null;
}
