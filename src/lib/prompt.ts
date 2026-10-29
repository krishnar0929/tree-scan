import type { Answers, Context, PhotoSlot } from "./types";

export const SLOT_LABELS: Record<PhotoSlot, string> = {
  full: "Full tree, top to bottom",
  base: "Trunk base and root flare",
  bark: "Bark close-up at chest height",
  leaves: "Leaves, needles or cones",
  otherSide: "Opposite side of the tree",
  crown: "Crown, looking up from below",
  problem: "Close-up of a problem area",
};

export const SYSTEM_PROMPT = `You are a careful ISA-style tree risk screener working from smartphone photos.
You give APPROXIMATE estimates to homeowners and you are honest about uncertainty.

Rules:
- Every number is a range (min/max), never a single value. Keep ranges realistic, not falsely tight.
- Estimate height from scale references in the photo (people, doors, fences ~6 ft, cars, house stories ~10 ft). If there is no reference, widen the range and say so in improve_confidence.
- Estimate trunk diameter from the bark/hand/coin photo or the user's circumference (diameter = circumference / pi). Prefer the measurement when given.
- Estimate age from diameter and the species' typical growth rate. Say growth varies with site; keep the range wide.
- Storm risk combines: visible defects (lean, cracks, cavities, fungal bodies, dead or hung-up limbs, root plate lifting, co-dominant stems with included bark, dieback), what is within reach (tree height vs. distance to targets), recent changes reported by the user, species tendencies (e.g. brittle wood), and season. If the tree is taller than its distance to a house or occupied area AND has any significant defect, risk is at least "moderate".
- Do not mistake normal seasonal leaf color or winter dormancy for decline. Use the date provided.
- Photos cannot show internal decay or root rot. Never claim a tree is "safe". When risk is moderate or high, or a high-severity finding exists, set needs_arborist true and make "have a certified arborist inspect" the first action.
- Findings must be specific to what is visible. Include positive findings (severity "good") when the evidence supports them. 2–6 findings.
- Actions: 1–5 practical steps, most urgent first.
- If the photos do not show a tree, set is_tree false and explain in photo_issues; fill other fields with zeros and empty strings/lists.
- Write in plain, calm language for a homeowner. No jargon without a short explanation.
Always respond by calling the submit_assessment tool.`;

const DISTANCE_TEXT: Record<string, string> = {
  "<25": "under 25 ft",
  "25-50": "25 to 50 ft",
  "50-100": "50 to 100 ft",
  "100+": "more than 100 ft",
};

const OWNER_TEXT: Record<string, string> = {
  mine: "on the user's own property",
  neighbor: "on a neighbor's property",
  common: "in a common/HOA area",
};

export function describeAnswers(a: Answers, c: Context): string {
  const lines = [
    `Date: ${c.date}`,
    c.lat != null && c.lon != null
      ? `Approximate location: ${c.lat.toFixed(2)}, ${c.lon.toFixed(2)}`
      : "Location: not shared",
    `Distance to house: ${a.distance ? DISTANCE_TEXT[a.distance] : "not given"}`,
    `Could fall on: ${a.targets.length ? a.targets.join(", ") : "not given"}`,
    `Recent changes noticed: ${a.changes.length ? a.changes.join(", ") : "none reported"}`,
    `Ownership: ${a.owner ? OWNER_TEXT[a.owner] : "not given"}`,
    `Trunk circumference: ${a.circumferenceIn ? `${a.circumferenceIn} in` : "not measured"}`,
  ];
  if (a.notes.trim()) lines.push(`User notes: ${a.notes.trim().slice(0, 500)}`);
  return lines.join("\n");
}

const range = {
  type: "object",
  properties: { min: { type: "number" }, max: { type: "number" } },
  required: ["min", "max"],
};

export const ASSESSMENT_TOOL = {
  name: "submit_assessment",
  description: "Submit the tree assessment.",
  input_schema: {
    type: "object",
    properties: {
      is_tree: { type: "boolean" },
      species: {
        type: "object",
        properties: {
          common_name: { type: "string" },
          scientific_name: { type: "string" },
          confidence: { type: "number", description: "0-100" },
        },
        required: ["common_name", "scientific_name", "confidence"],
      },
      height_ft: range,
      trunk_diameter_in: range,
      age_years: range,
      condition: { type: "string", enum: ["good", "fair", "poor", "dead"] },
      storm_risk: { type: "string", enum: ["low", "moderate", "high"] },
      risk_summary: {
        type: "string",
        description: "1-2 sentences explaining the risk level.",
      },
      findings: {
        type: "array",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            detail: { type: "string" },
            severity: { type: "string", enum: ["high", "moderate", "low", "good"] },
          },
          required: ["title", "detail", "severity"],
        },
      },
      actions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            detail: { type: "string" },
            urgency: { type: "string", enum: ["now", "soon", "routine"] },
          },
          required: ["title", "detail", "urgency"],
        },
      },
      needs_arborist: { type: "boolean" },
      confidence: { type: "number", description: "Overall confidence 0-100." },
      improve_confidence: {
        type: "array",
        items: { type: "string" },
        description: "Specific extra photos or measurements that would help.",
      },
      photo_issues: { type: "array", items: { type: "string" } },
    },
    required: [
      "is_tree",
      "species",
      "height_ft",
      "trunk_diameter_in",
      "age_years",
      "condition",
      "storm_risk",
      "risk_summary",
      "findings",
      "actions",
      "needs_arborist",
      "confidence",
      "improve_confidence",
      "photo_issues",
    ],
  },
} as const;
