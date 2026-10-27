# Your Workout

A local-first workout planner that builds explainable, equipment-aware weekly plans and guides each session. The MVP runs entirely in the browser: there are no accounts, analytics, or cloud profiles.

## Run locally

Requires Node.js 20.19 or newer.

```bash
npm install
npm run dev
```

## Quality checks

```bash
npm run typecheck
npm test
npm run build
```

The production output is written to `dist/` and uses hash routing, so it can be hosted on GitHub Pages or any static HTTPS host.

## Product boundaries

Your Workout provides general fitness planning and educational information, not medical advice, diagnosis, rehabilitation, or treatment. Weather and exercise guidance can be incomplete. Users should assess their condition and actual surroundings and seek qualified help when appropriate.

Product requirements live in `PRD.md`; implementation invariants live in `AGENT.md`.

## Data and privacy

Profile, plan, and session progress are stored in IndexedDB in the current browser. Clearing browser data or changing devices can remove them. Settings includes a transactional erase-all-data action.

## Third-party material

See `THIRD_PARTY_NOTICES.md` for the open-source projects and public-domain data that informed this implementation.
