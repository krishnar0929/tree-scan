# tree-scan

Photo-based tree screening. Take 3 guided photos of a tree, answer 4 quick questions, and get an
**approximate** report: species, height, trunk diameter, age, visible condition, storm/fall risk,
and what to do next.

> Estimates from photos only. Photos can't show internal decay or root rot. Any tree with a
> moderate or high risk should be checked in person by a certified arborist.

## How it works

1. **Capture** — 3 required photos (full tree, trunk base, bark close-up) plus up to 4 optional
   ones (leaves, opposite side, crown, problem spot). Each slot can use the camera directly or
   upload from the photo library. Photos are resized in the browser to
   ~1280 px JPEG before upload.
2. **Questions** — distance to the house, what it could fall on, recent changes, ownership,
   optional trunk circumference and notes. Date and approximate location are added automatically
   (location only if the user allows it).
3. **Assess** — `POST /api/assess` sends the photos and answers to Claude's vision model, which
   must answer by calling a `submit_assessment` tool, so the response is always structured JSON.
   The route validates input and normalizes the output before it reaches the UI.
4. **Report** — risk meter, size/age ranges, findings by severity, actions, and tips to raise
   confidence.

Nothing is stored: no database, no accounts. Photos live only in the browser tab and the single
API request.

## Run locally

```bash
npm install
cp .env.example .env.local   # add your ANTHROPIC_API_KEY
npm run dev
```

Open http://localhost:3000. With no API key set, the app runs in **demo mode** and returns a
sample report, so you can try the flow without a key.

To test on your phone, run `npm run dev -- -H 0.0.0.0` and open `http://<your-mac-ip>:3000`
(the camera picker works over plain HTTP on most phones; location needs HTTPS or localhost).

## Environment

| Variable            | Required | Notes                                   |
| ------------------- | -------- | --------------------------------------- |
| `ANTHROPIC_API_KEY` | No\*     | \*Without it the app runs in demo mode. |
| `ANTHROPIC_MODEL`   | No       | Defaults to `claude-sonnet-5-5`.        |

## Deploy

Works on Vercel as-is: import the repo, add `ANTHROPIC_API_KEY` in Project → Settings →
Environment Variables, deploy. The assess route allows up to 60 s.

## Project layout

```
src/
  app/
    page.tsx              step flow: home → capture → questions → analyzing → report
    api/assess/route.ts   validation, Claude call, output normalization
  components/             Home, Capture, Questions, Report, shared UI
  lib/
    prompt.ts             system prompt + tool schema
    types.ts              shared request/response types
    image.ts              in-browser resize
    demo.ts               sample report for demo mode
```
