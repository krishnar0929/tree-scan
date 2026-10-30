// Shared types between the browser and the /api/assess route.

export type PhotoSlot =
  | "full"
  | "base"
  | "bark"
  | "leaves"
  | "otherSide"
  | "crown"
  | "problem";

export interface PhotoInput {
  slot: PhotoSlot;
  /** JPEG data URL, already resized in the browser. */
  dataUrl: string;
}

export type Distance = "<25" | "25-50" | "50-100" | "100+";
export type Owner = "mine" | "neighbor" | "common";

export interface Answers {
  distance: Distance | null;
  targets: string[];
  changes: string[];
  owner: Owner | null;
  /** Trunk circumference in inches, if the user measured it. */
  circumferenceIn: number | null;
  notes: string;
}

export interface Context {
  /** ISO date from the user's device. */
  date: string;
  lat: number | null;
  lon: number | null;
}

export interface AssessRequest {
  photos: PhotoInput[];
  answers: Answers;
  context: Context;
}

export type Severity = "high" | "moderate" | "low" | "good";
export type RiskLevel = "low" | "moderate" | "high";
export type Condition = "good" | "fair" | "poor" | "dead";
export type Urgency = "now" | "soon" | "routine";

export interface Range {
  min: number;
  max: number;
}

export interface Assessment {
  is_tree: boolean;
  species: { common_name: string; scientific_name: string; confidence: number };
  height_ft: Range;
  trunk_diameter_in: Range;
  age_years: Range;
  condition: Condition;
  storm_risk: RiskLevel;
  risk_summary: string;
  findings: { title: string; detail: string; severity: Severity }[];
  actions: { title: string; detail: string; urgency: Urgency }[];
  needs_arborist: boolean;
  confidence: number;
  improve_confidence: string[];
  photo_issues: string[];
}

export interface AssessResponse {
  assessment: Assessment;
  /** true when no API key is set and a sample report was returned. */
  demo: boolean;
}
