# Your Workout — Agent Guide

Read `PRD.md` before making product or architectural decisions. Keep it aligned when requirements change.

## Product invariants

- Personalize workouts around the user's stated goal, experience, availability, equipment, physical condition, and relevant surroundings.
- Make recommendations explainable; users should understand why a session or adjustment was chosen.
- Put safety ahead of intensity or progression. Respect injuries, pain, health constraints, and avoided movements everywhere.
- Treat the product as general fitness guidance, never medical advice, diagnosis, rehabilitation, or treatment.
- Keep the user in control: explain proposed changes and require confirmation before applying them, except when blocking an unsafe recommendation.
- Distinguish temporary changes from lasting ones. Change only the affected session unless the new information has future impact.
- Never schedule outside stated availability, require unavailable equipment, or include a restricted movement.
- Degrade honestly when data or external services are unavailable; never interpret missing weather or health information as safe.
- Preserve core usefulness when optional feedback or external instructional resources are absent.
- Protect sensitive fitness and health data. Collect only what the feature needs, avoid leaking it through URLs or logs, and provide a clear deletion path.
- Keep the experience responsive, keyboard accessible, and understandable during physical activity.

## Engineering invariants

- Keep planning and safety rules deterministic, versioned, testable, and independent of the UI.
- Validate every generated or adapted session before showing it.
- Persist workout progress after meaningful actions and distinguish completed sessions from interrupted ones.
- Add tests for every change to planning, adaptation, safety, persistence, or weather behavior.
