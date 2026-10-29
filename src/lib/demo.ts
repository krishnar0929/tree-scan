import type { Assessment } from "./types";

/** Returned when ANTHROPIC_API_KEY is not set, so the UI can be tried without a key. */
export const DEMO_ASSESSMENT: Assessment = {
  is_tree: true,
  species: { common_name: "Loblolly pine", scientific_name: "Pinus taeda", confidence: 80 },
  height_ft: { min: 65, max: 85 },
  trunk_diameter_in: { min: 14, max: 18 },
  age_years: { min: 30, max: 45 },
  condition: "fair",
  storm_risk: "moderate",
  risk_summary:
    "SAMPLE REPORT: one trunk leans and appears to rest on a neighboring tree, and the tree is taller than its distance to the fence line.",
  findings: [
    {
      title: "Trunk leaning on another tree",
      detail: "Roughly 20–25° lean toward the yard. Hung-up trees can drop suddenly in wind.",
      severity: "high",
    },
    {
      title: "Dead lower limbs",
      detail: "Small falling-branch hazard over the fence.",
      severity: "moderate",
    },
    {
      title: "Crown looks healthy",
      detail: "Green needles with normal density for the season.",
      severity: "good",
    },
  ],
  actions: [
    {
      title: "Have a certified arborist inspect the leaning trunk",
      detail: "Ideally before the next storm.",
      urgency: "now",
    },
    { title: "Prune dead lower limbs", detail: "Especially over the fence.", urgency: "soon" },
    { title: "Re-scan after heavy wind or rain", detail: "Watch for new lean or soil lifting.", urgency: "routine" },
  ],
  needs_arborist: true,
  confidence: 60,
  improve_confidence: ["Add a close-up of needles or cones", "Measure trunk circumference at chest height"],
  photo_issues: [],
};
