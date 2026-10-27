# Your Workout — Product Requirements Document

## 1. Product brief

### Product vision

Your Workout is a responsive web app that creates a practical workout plan around the individual rather than forcing the individual to fit a generic program. It considers the user's physical profile, experience, goal, available time, equipment, health limitations, and local weather. When circumstances change, it explains the impact and offers appropriate alternatives.

The long-term product should behave like an adaptive workout assistant: set preferences once, receive a tailored plan, get guided through each session, and have future sessions adjusted when meaningful changes occur.

### MVP objective

Prove that a user can:

1. Complete a clear fitness and safety setup without creating an account.
2. Receive a sensible weekly plan for a user-selected period.
3. Understand why the plan suits their goal, experience, availability, and equipment.
4. Check in before a session and adapt it when conditions have changed.
5. Choose what to do when weather affects an outdoor run.
6. Complete a guided workout with instructions, timers, rest periods, and reviewed learning resources.

### Target users

The product is designed to support beginners, experienced exercisers, home users, gym users, and runners. The MVP does not implement separate products for these groups; it uses onboarding answers and rules to tailor the same core experience.

### Supported goals in the MVP

The user selects one primary goal:

- General fitness
- Weight loss
- Muscle gain
- Strength
- Endurance
- Running performance

Combining multiple goals is outside the MVP.

### Supported training types in the MVP

- Strength training
- Cardio
- HIIT
- Running

### Product personality

Energetic, friendly, clear, and encouraging. The product should motivate without shaming, exaggerating results, or using medical language it cannot substantiate.

## 2. Product principles

1. **Personal, but explainable.** Every recommendation should be traceable to information the user provided or to a visible planning rule.
2. **Safety before intensity.** Health limitations and reported pain override performance or progression rules.
3. **The user stays in control.** The app recommends weather-related or check-in-related changes; the user confirms them.
4. **Ask once, reuse often.** Persistent preferences should not need to be re-entered for every session.
5. **Distinguish temporary from lasting change.** Weather may affect one session; an injury or changed availability may affect the remaining plan.
6. **Useful with minimal data.** Optional feedback can improve future planning, but the core experience must work without it.
7. **No false precision.** The MVP is a fitness planning tool, not a medical diagnostic or treatment tool.

## 3. Core user journey

### 3.1 Welcome and informed consent

The app briefly explains what it does, that data is stored in the current browser, and that it does not replace medical advice. The user must acknowledge the safety disclaimer before generating a plan.

### 3.2 Initial setup

The setup collects:

#### Physical profile

- Age
- Sex
- Height
- Weight
- Optional physical limitations relevant to exercise

The MVP uses these inputs conservatively. It must not present BMI or similar estimates as a diagnosis.

#### Safety screen

- Existing injuries
- Medical conditions relevant to exercise
- Medication considerations the user wishes to disclose
- Pregnancy, where applicable
- Current pain
- Movements or activities to avoid
- Confirmation that the user understands their own condition and should seek qualified medical advice when appropriate

This screen should be short and understandable rather than an extensive clinical questionnaire. Red-flag answers stop automatic planning for the affected activity and advise the user to seek professional guidance. They must not be bypassed by an intensity preference.

#### Experience survey

- Overall training experience: beginner, intermediate, or advanced
- Recent consistency
- Familiarity with each supported training type
- Typical recent session length
- Self-reported current ability, using simple non-competitive questions

#### Goal

- One primary goal from the supported MVP list
- User-selected plan duration, expressed in whole weeks

#### Availability

- Available days of the week
- Available time windows on each day
- Preferred session length for each window or as a general default

The app does not impose a minimum frequency or session duration. It should explain when limited availability restricts what a plan can reasonably achieve.

#### Workout setting and equipment

The user selects all equipment they can access:

- Bodyweight only
- Dumbbells
- Resistance bands
- Kettlebells
- Barbells and plates
- Strength machines/cable machines
- Treadmill
- Stationary bike

The app does not discover gyms or facilities.

#### Location and weather

The user may either grant browser location permission or manually enter a location. Manual entry remains available if permission is denied. Location is used only to retrieve weather relevant to outdoor running.

#### Session preference

- Guided mode (default): steps, exercise cues, timers, rest periods, completion controls, and substitutions
- Plan-only mode: session outline and instructional resources without active timers

#### Instruction preference

The user can prefer:

- Concise in-app written guidance
- Trusted external video/article links
- Both

### 3.3 Plan generation

After setup, the app generates a week-by-week plan for the selected duration. The plan uses a reusable weekly structure where practical, with progression or recovery changes applied across weeks.

The plan view shows:

- Weekly calendar/list
- Workout type, expected duration, and intensity
- Exercises or running/cardio prescription
- Equipment needed
- The reason each session fits the user's goal and constraints
- Any limitation caused by availability, equipment, or safety information
- A regenerate action after relevant preferences change

### 3.4 Pre-workout check-in

Before a session, the app asks a short question: “Has anything changed since your plan was created?”

The user can choose “Everything is fine” and start immediately, or report:

- Fatigue/readiness change
- Pain
- New or changed injury
- Equipment unavailable
- Less time available
- Weather concern for an outdoor run
- Another relevant change

The rules engine assesses whether the change is session-only or should affect future sessions. The app presents the proposed adjustment and its scope before applying it.

### 3.5 Weather adaptation

Before an outdoor running session, the app retrieves current/near-session weather. When conditions cross a configurable caution threshold, it offers choices rather than silently changing the plan:

- Keep the outdoor session after acknowledging the warning, unless a hard safety rule blocks it
- Replace it with an equipment-appropriate indoor equivalent
- Move it to another user-provided available time/day when one exists

Weather changes affect the relevant session only unless the user changes their broader preferences.

### 3.6 Guided workout

Guided mode includes:

- Warm-up
- Ordered exercises or intervals
- Sets, repetitions or time, target effort, and rest
- Short technique and safety cues
- Exercise completion controls
- Timers for work and rest where relevant
- A reviewed instructional resource where available
- Equipment-appropriate substitutions
- Cool-down
- Pause, resume, and end-session controls

A workout is complete only when the user reaches and confirms the end of the session. Closing the page or ending early records the session locally as interrupted, not completed, and offers resume/restart on return.

### 3.7 Post-workout state

The MVP records session completion automatically. Rich post-workout feedback—effort, pain, enjoyment, difficulty, weights, reps, and detailed duration—is deferred. The data model should leave room for this later.

## 4. Rules-based planning specification

### 4.1 Inputs

The planner receives a normalized profile containing:

- Primary goal
- Experience level and recent consistency
- Supported activity familiarity
- Plan duration
- Weekly availability and session length
- Equipment
- Avoided movements and health constraints
- Current pain/injury restrictions
- Session guidance preference

Weather is not used to generate the entire multi-week plan. It is evaluated near an outdoor session.

### 4.2 Planning stages

1. Validate required input and safety constraints.
2. Select a goal-specific weekly template.
3. Scale frequency to the user's available days without imposing a product minimum.
4. Select session types and distribute stress/recovery sensibly across available days.
5. Select exercises compatible with equipment, experience, session length, and movement restrictions.
6. Scale volume and intensity by experience and recent consistency.
7. Fit warm-up, primary work, rest, and cool-down into the chosen duration.
8. Apply simple week-to-week progression and planned recovery rules.
9. Validate the completed plan for conflicts, duplicate stress, missing resources, and disallowed exercises.
10. Produce human-readable reasons for major selections and constraints.

### 4.3 Template behavior

Each goal has versioned templates for different weekly frequencies and session lengths. Templates define workout balance and progression, while the exercise selector fills slots from the catalog.

If the user's availability is unusually limited, the app produces the best valid plan it can and sets realistic expectations. It must not fabricate availability or add sessions outside provided times.

### 4.4 Exercise selection constraints

An exercise is eligible only when:

- Its training type supports the current session
- Its required equipment is available
- Its difficulty is appropriate for the user's experience or has an appropriate regression
- It does not conflict with a declared restriction
- It fits within the time budget when combined with the rest of the session
- Required instructional content exists in the catalog

### 4.5 Adaptation scope

Changes are classified before replanning:

| Change | Default scope | Example response |
|---|---|---|
| Adverse weather | Current outdoor session | Keep, replace indoors, or reschedule |
| Equipment unavailable today | Current session | Substitute equivalent movements |
| Less time today | Current session | Preserve warm-up/cool-down and reduce accessory volume |
| Fatigue/readiness change | Current session, optionally next session | Reduce intensity/volume or use recovery session |
| New pain | Current and future affected sessions | Stop conflicting movements and request reassessment |
| New/changed injury | Future plan until user updates status | Remove affected movements and regenerate impacted sessions |
| Availability change | Remaining plan | Reschedule remaining sessions |
| Goal change | Remaining plan | Generate a new plan after confirmation |

No proposed change is applied without user confirmation. For pain, injury, or severe weather, the app may block unsafe suggestions while still explaining why.

## 5. Exercise and resource catalog

The MVP ships with a limited, pre-reviewed catalog sufficient to build valid sessions for every supported goal, training type, experience level, and equipment category.

Each exercise record includes:

- Stable ID and name
- Training type and movement pattern
- Primary and secondary muscle groups
- Required equipment
- Difficulty level
- Written setup and execution cues
- Common safety cautions
- Contraindication/restriction tags
- Regression and progression links
- Substitution group
- Default set/rep/time ranges
- Estimated time contribution
- One or more reviewed external resource links where available

Resource links should open in a new tab, identify the source, and be treated as untrusted external navigation. Broken or missing links must not prevent the in-app written guidance from working.

Live web search and automated weekly catalog updates are outside the MVP.

## 6. MVP scope

### In the MVP

- Responsive web app usable on desktop and mobile browsers
- No account required
- Profile and plan stored in the current browser
- Onboarding for physical profile, experience, one goal, health constraints, availability, equipment, and preferences
- Manual weekly availability entry
- Browser geolocation and manual location entry
- Live weather check for outdoor running sessions
- Rules-based plan generation for a user-selected number of weeks
- Weekly plan structure with simple progression
- Strength, cardio, HIIT, and running sessions
- Goals: general fitness, weight loss, muscle gain, strength, endurance, and running performance
- Equipment support listed in this PRD
- Short pre-workout change check-in
- User-confirmed session substitution or rescheduling suggestions
- Guided workout mode as the default
- Plan-only mode as an option
- Timers, rest periods, exercise steps, substitutions, and interrupted-session recovery
- Limited pre-reviewed exercise/resource catalog
- Plain-language recommendation explanations
- Safety disclaimer and conservative blocking rules
- Local completion history sufficient to show completed and interrupted sessions
- Clear option to erase all locally stored data

### Out of the MVP / later

- User accounts, authentication, cloud storage, cross-device sync, or server-side profiles
- Calendar integrations, calendar event creation, or automatic schedule reading
- Browser notifications, email reminders, push notifications, or schedule-change alerts
- AI-generated plans or AI-generated exercise guidance
- Hybrid AI/rules planning
- Multiple simultaneous goals or automatic goal prioritization
- Automatic gym, park, track, class, or facility discovery
- Live web scouting for workout resources
- Automated catalog crawling, link validation, or weekly content updates
- Rich post-workout feedback and automatic progression based on effort, pain, enjoyment, weights, or reps
- Wearable, smartwatch, heart-rate, health-platform, or fitness-device integrations
- Social features, coaching marketplace, leaderboards, challenges, or sharing
- Payments, subscriptions, advertisements, or premium tiers
- Native iOS/Android applications
- Nutrition plans, meal tracking, calorie prescriptions, rehabilitation, diagnosis, or medical treatment
- Localization beyond the initial product language
- Full offline support or installable PWA behavior

## 7. Technical specification

### 7.1 Recommended MVP architecture

A client-side single-page application is sufficient for the MVP.

- **Frontend:** React with TypeScript
- **Build tooling:** Vite or equivalent lightweight bundler
- **Styling:** Responsive component-based CSS with accessible design tokens
- **Routing:** Client-side routing for setup, plan, check-in, session, history, and settings
- **Persistence:** IndexedDB for structured app data, with a small local-storage entry for schema/version flags if needed
- **Planning engine:** Pure, deterministic TypeScript module with versioned templates and rules
- **Catalog:** Versioned static JSON/TypeScript data bundled with the app
- **Weather:** A browser-callable weather and geocoding provider with no secret exposed in client code; the provider must be replaceable behind an adapter
- **Hosting:** Static web hosting over HTTPS, required for reliable geolocation
- **Backend:** None for the MVP

The planner should be independent of UI components so it can later move to a server or be reused by a mobile app.

### 7.2 Major modules

- `profile`: onboarding answers, validation, health constraints, and preferences
- `availability`: manual weekly time windows
- `catalog`: exercises, substitutions, cautions, and resource links
- `planner`: template selection, exercise selection, progression, validation, and explanations
- `adaptation`: check-in classification and session/future-plan impact
- `weather`: location lookup, forecast retrieval, thresholds, and fallbacks
- `session`: guided workout state machine, timers, pause/resume, and completion
- `storage`: schema versioning, migrations, import/export-ready serialization, and erase-all-data
- `safety`: disclaimer state, red-flag rules, contraindication filtering, and safe-copy helpers

### 7.3 Core data entities

#### UserProfile

- `id` (local generated ID)
- `createdAt`, `updatedAt`
- `age`, `sex`, `height`, `weight`
- `experienceLevel`, `recentConsistency`, `activityExperience`
- `primaryGoal`
- `planDurationWeeks`
- `equipment[]`
- `healthConstraints[]`
- `avoidedMovements[]`
- `instructionPreference`
- `sessionMode`
- `disclaimerAcceptedAt`, `disclaimerVersion`

#### AvailabilityWindow

- `dayOfWeek`
- `startTime`, `endTime`
- `preferredDurationMinutes`

#### LocationPreference

- `source` (`browser` or `manual`)
- Approximate coordinates or provider location identifier
- Human-readable label
- `updatedAt`

Exact location should be stored only when required. Prefer reduced precision adequate for weather.

#### Plan

- `id`, `profileSnapshot`, `plannerVersion`, `catalogVersion`
- `startDate`, `durationWeeks`
- `status`
- `weeks[]`
- `generatedAt`
- `generationWarnings[]`

#### PlannedSession

- `id`, `planId`, `scheduledWindow`
- `trainingType`, `goalRole`, `durationMinutes`, `intensity`
- `blocks[]`
- `requiredEquipment[]`
- `rationale[]`
- `weatherSensitive`
- `adaptationHistory[]`
- `status` (`planned`, `in_progress`, `interrupted`, `completed`, `skipped`)

#### SessionRun

- `sessionId`, `startedAt`, `lastActiveAt`, `endedAt`
- Current block/exercise/set position
- Timer state
- Completed steps
- `status`

#### Exercise

Contains the catalog fields defined in Section 5.

### 7.4 Determinism and versioning

Given the same normalized input, planner version, catalog version, and seed, the engine should produce the same plan. Store all four with the plan. This makes unexpected recommendations reproducible and supports safe future migrations.

### 7.5 Weather behavior and failure handling

- Ask for location only when needed or during optional setup.
- Retrieve weather shortly before an outdoor session and display when it was updated.
- Use documented, configurable thresholds for heat, cold, precipitation, wind, and severe conditions.
- Avoid claiming that a threshold guarantees safety.
- If weather data is unavailable, say so clearly and let the user choose an indoor substitute, postpone, or continue using their own judgment.
- Never silently treat failed weather retrieval as safe weather.

### 7.6 Local data and privacy

- Keep profile, plans, location preference, and session history on the user's device.
- Do not add analytics or third-party trackers by default.
- Tell users that clearing browser data or changing devices can remove their plan.
- Provide an “Erase all data” control with confirmation.
- Do not place sensitive profile data in URLs, logs, or external resource-link parameters.
- Request browser permissions in context, not on initial page load.

### 7.7 Accessibility and responsive behavior

- Meet WCAG 2.2 AA as the target.
- Fully usable by keyboard.
- Visible focus states and labeled controls.
- Do not rely on color alone for intensity, safety, or completion state.
- Timers must have accessible text and should not require audio.
- Respect reduced-motion preferences.
- Keep workout controls large enough for use while exercising.
- Prevent screen layout from breaking at common mobile widths.

### 7.8 Reliability requirements

- Save session progress after every meaningful interaction.
- Restore an interrupted in-progress session after reload or browser restart when storage remains available.
- Prevent duplicate plan generation from repeated clicks.
- Validate all generated sessions before showing them.
- Show a usable recovery path for denied location permission, unavailable weather, invalid setup data, or an empty exercise selection.
- Core planning and guided workouts remain usable if external instructional links fail.

### 7.9 Testing strategy

- Unit tests for every planning and safety rule
- Table-driven tests covering goals, experience levels, equipment combinations, restrictions, frequencies, and session lengths
- Invariant tests ensuring no unavailable equipment or restricted movement appears in a plan
- Snapshot/golden tests for representative plan inputs
- Unit tests for adaptation scope classification
- Weather adapter tests for success, caution, severe conditions, stale data, and failure
- Session-state tests for pause, reload, resume, early exit, and completion
- Storage migration and erase-all-data tests
- Accessibility checks and keyboard-only end-to-end tests
- Responsive end-to-end tests for setup, plan creation, check-in, and guided completion

## 8. Safety and disclaimer requirements

The product must prominently communicate:

- Your Workout provides general fitness planning and educational information, not medical advice, diagnosis, rehabilitation, or treatment.
- Exercise involves risk. Users are responsible for deciding whether they are fit to participate and for using equipment safely.
- Users should stop if they experience pain, dizziness, faintness, unusual shortness of breath, or other concerning symptoms and seek qualified help when appropriate.
- Users with injuries, medical conditions, pregnancy, medication concerns, or uncertainty should consult a qualified healthcare professional before exercising.
- Weather information may be delayed, incomplete, or inaccurate; users must assess actual local conditions.

The disclaimer does not replace safe product behavior. The app must still filter contraindicated exercises, avoid medical claims, and block recommendations when its own safety rules identify a red flag.

Final disclaimer language should receive legal review before public release.

## 9. Success criteria and acceptance tests

The MVP is successful when all of the following are demonstrated:

1. A first-time user can complete setup and generate a plan without an account.
2. The plan fits only within supplied availability and does not exceed the selected session length beyond a small documented rounding tolerance.
3. Every exercise uses available equipment and respects declared movement restrictions.
4. All six MVP goals can generate valid plans across supported experience levels.
5. A user can see a plain-language reason for each session.
6. An outdoor running session retrieves weather or clearly reports that weather is unavailable.
7. When weather is unsuitable, the user can choose among valid available alternatives rather than receiving an unexplained automatic change.
8. A reported temporary change updates only the affected session by default.
9. A reported injury or lasting availability change identifies and proposes updates to affected future sessions.
10. The user can complete a guided workout with readable instructions, working timers, rests, substitutions, pause/resume, and completion state.
11. Closing during a workout produces an interrupted state that can be resumed or restarted.
12. Reloading the app restores the profile, plan, and session state from the same browser.
13. The user can erase all stored app data.
14. The main journey is usable on both mobile and desktop widths and by keyboard alone.

## 10. Future product direction

After validating the MVP, the likely next steps are accounts and sync, optional calendar connections, reminders, richer feedback and progression, expanded and routinely maintained content, and eventually a hybrid system in which AI personalizes within hard safety and programming constraints. Native mobile or cross-platform applications can reuse the planning and catalog modules once the underlying rules are proven.
