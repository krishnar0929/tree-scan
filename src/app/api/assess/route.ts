import { NextResponse } from "next/server";
import { ASSESSMENT_TOOL, SLOT_LABELS, SYSTEM_PROMPT, describeAnswers } from "@/lib/prompt";
import { DEMO_ASSESSMENT } from "@/lib/demo";
import type { AssessRequest, Assessment, AssessResponse, PhotoSlot } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_PHOTOS = 8;
const MAX_PHOTO_BYTES = 4 * 1024 * 1024; // per photo, after base64 decode
const DATA_URL = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/;
const SLOTS = Object.keys(SLOT_LABELS) as PhotoSlot[];

function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(req: Request) {
  let body: AssessRequest;
  try {
    body = (await req.json()) as AssessRequest;
  } catch {
    return bad("Request body must be JSON.");
  }

  const photos = Array.isArray(body?.photos) ? body.photos : [];
  if (photos.length === 0) return bad("Add at least one photo.");
  if (photos.length > MAX_PHOTOS) return bad(`Up to ${MAX_PHOTOS} photos.`);
  if (!photos.some((p) => p.slot === "full")) return bad("A full-tree photo is required.");

  const imageBlocks: unknown[] = [];
  for (const p of photos) {
    if (!SLOTS.includes(p.slot)) return bad(`Unknown photo slot: ${String(p.slot)}`);
    const m = typeof p.dataUrl === "string" ? DATA_URL.exec(p.dataUrl) : null;
    if (!m) return bad(`Photo "${p.slot}" is not a valid image.`);
    if ((m[2].length * 3) / 4 > MAX_PHOTO_BYTES) return bad(`Photo "${p.slot}" is too large.`);
    imageBlocks.push(
      { type: "text", text: `Photo: ${SLOT_LABELS[p.slot]}` },
      { type: "image", source: { type: "base64", media_type: m[1], data: m[2] } },
    );
  }

  const answers = body.answers ?? {
    distance: null,
    targets: [],
    changes: [],
    owner: null,
    circumferenceIn: null,
    notes: "",
  };
  const context = body.context ?? { date: new Date().toISOString().slice(0, 10), lat: null, lon: null };

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    const res: AssessResponse = { assessment: DEMO_ASSESSMENT, demo: true };
    return NextResponse.json(res);
  }

  const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5";

  let apiRes: Response;
  try {
    apiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 2500,
        system: SYSTEM_PROMPT,
        tools: [ASSESSMENT_TOOL],
        tool_choice: { type: "tool", name: ASSESSMENT_TOOL.name },
        messages: [
          {
            role: "user",
            content: [
              ...imageBlocks,
              {
                type: "text",
                text: `Homeowner's answers and context:\n${describeAnswers(answers, context)}\n\nAssess this tree.`,
              },
            ],
          },
        ],
      }),
      signal: AbortSignal.timeout(55_000),
    });
  } catch (err) {
    console.error("Anthropic request failed", err);
    return bad("Couldn't reach the analysis service. Try again.", 502);
  }

  if (!apiRes.ok) {
    const text = await apiRes.text();
    console.error("Anthropic API error", apiRes.status, text.slice(0, 500));
    return bad(explainApiError(apiRes.status, text), 502);
  }

  const data = (await apiRes.json()) as {
    content?: { type: string; name?: string; input?: unknown }[];
  };
  const tool = data.content?.find((b) => b.type === "tool_use" && b.name === ASSESSMENT_TOOL.name);
  if (!tool?.input) return bad("The analysis came back empty. Try again.", 502);

  const res: AssessResponse = { assessment: normalize(tool.input as Partial<Assessment>), demo: false };
  return NextResponse.json(res);
}

/** Turn an Anthropic API error into a message that says what to fix. */
function explainApiError(status: number, body: string): string {
  let type = "";
  let message = "";
  try {
    const j = JSON.parse(body) as { error?: { type?: string; message?: string } };
    type = j.error?.type ?? "";
    message = j.error?.message ?? "";
  } catch {
    // not JSON
  }
  const m = message.toLowerCase();
  if (status === 401 || type === "authentication_error")
    return "API key was rejected. Check ANTHROPIC_API_KEY in your Vercel environment variables, then redeploy.";
  if (status === 403 || type === "permission_error")
    return "This API key doesn't have permission to use the model. Check the key's workspace in the Claude Console.";
  if (m.includes("credit") || m.includes("billing"))
    return "Your Claude API account is out of credits. Add credits under Billing in the Claude Console, then try again.";
  if (status === 404 || type === "not_found_error")
    return `Model not found (${process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5"}). Check ANTHROPIC_MODEL.`;
  if (status === 413 || type === "request_too_large")
    return "Photos are too large to send together. Remove an optional photo and try again.";
  if (status === 429 || type === "rate_limit_error")
    return "Too many requests right now. Wait a minute and try again.";
  if (status === 529 || type === "overloaded_error")
    return "The analysis service is busy. Try again in a minute.";
  const detail = message ? `: ${message.slice(0, 200)}` : "";
  return `The analysis service returned an error (${status}${detail}). Try again.`;
}

/** Defensive cleanup so the UI never crashes on a slightly-off model response. */
function normalize(a: Partial<Assessment>): Assessment {
  const num = (v: unknown, lo = 0, hi = 10_000) => {
    const n = typeof v === "number" && Number.isFinite(v) ? v : 0;
    return Math.min(hi, Math.max(lo, Math.round(n)));
  };
  const rng = (r: unknown, hi: number) => {
    const o = (r ?? {}) as { min?: unknown; max?: unknown };
    const min = num(o.min, 0, hi);
    const max = num(o.max, 0, hi);
    return { min: Math.min(min, max), max: Math.max(min, max) };
  };
  const pick = <T extends string>(v: unknown, allowed: readonly T[], fallback: T): T =>
    allowed.includes(v as T) ? (v as T) : fallback;
  const strs = (v: unknown) => (Array.isArray(v) ? v.filter((s): s is string => typeof s === "string") : []);

  return {
    is_tree: a.is_tree !== false,
    species: {
      common_name: String(a.species?.common_name ?? "Unknown"),
      scientific_name: String(a.species?.scientific_name ?? ""),
      confidence: num(a.species?.confidence, 0, 100),
    },
    height_ft: rng(a.height_ft, 400),
    trunk_diameter_in: rng(a.trunk_diameter_in, 400),
    age_years: rng(a.age_years, 3000),
    condition: pick(a.condition, ["good", "fair", "poor", "dead"] as const, "fair"),
    storm_risk: pick(a.storm_risk, ["low", "moderate", "high"] as const, "moderate"),
    risk_summary: String(a.risk_summary ?? ""),
    findings: (Array.isArray(a.findings) ? a.findings : []).slice(0, 8).map((f) => ({
      title: String(f?.title ?? ""),
      detail: String(f?.detail ?? ""),
      severity: pick(f?.severity, ["high", "moderate", "low", "good"] as const, "low"),
    })),
    actions: (Array.isArray(a.actions) ? a.actions : []).slice(0, 6).map((x) => ({
      title: String(x?.title ?? ""),
      detail: String(x?.detail ?? ""),
      urgency: pick(x?.urgency, ["now", "soon", "routine"] as const, "routine"),
    })),
    needs_arborist: Boolean(a.needs_arborist),
    confidence: num(a.confidence, 0, 100),
    improve_confidence: strs(a.improve_confidence),
    photo_issues: strs(a.photo_issues),
  };
}
