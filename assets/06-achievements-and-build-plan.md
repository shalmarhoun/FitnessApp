# Achievement System and Build Plan

## Achievement Philosophy

Achievements should feel premium and personal. They should mark consistency, progression, and meaningful effort without becoming childish.

Tone:
- Warm.
- Elegant.
- Motivating.
- Quietly celebratory.

## Achievement Categories

### Consistency

- First Ritual: Complete your first workout.
- Weekly Grace: Complete all 3 planned workouts in a week.
- Three Week Rhythm: Complete the weekly goal for 3 consecutive weeks.
- Unbroken Month: Complete the weekly goal for 4 consecutive weeks.

### Strength

- First Volume PR: Beat your previous total volume.
- Stronger Set: Increase weight on any exercise.
- Rep Reserve: Complete all target reps for a full workout.
- Lower Body Bloom: Progress on a lower-body workout.
- Upper Body Poise: Progress on an upper/core workout.

### Progression

- Progressive Overload: Beat previous performance on 3 exercises in one session.
- Momentum Lift: Improve total volume two sessions in a row.
- Steady Builder: Match or beat target sets for 5 workouts.

### Measurements

- Saturday Ritual: Save measurements on Saturday.
- Four Check-Ins: Save measurements four weeks in a row.
- Trend Keeper: Track at least three measurement fields for a month.

## Badge Tiers

Pearl:
- First-time wins.
- Soft white/champagne accent.

Lavender:
- Consistency and progression.
- Royal lavender accent.

Gold:
- Milestones and streaks.
- Champagne accent.

## Reward Moments

Use celebrations after:
- Completing workout.
- Earning achievement.
- Completing weekly goal.
- Hitting volume PR.
- Saving Saturday measurements.

Animation style:
- Soft scale.
- Subtle shimmer.
- Gentle fade.
- No confetti overload.

## Build Plan

### Phase 1 - Foundation

Deliver:
- Vite React TypeScript setup.
- TailwindCSS.
- App shell.
- Mobile navigation.
- Design tokens.
- Default seeded program.
- LocalStorage provider.

### Phase 2 - Dashboard

Deliver:
- Today's workout card.
- Weekly goal progress.
- Streak and consistency widgets.
- Quick performance preview.

### Phase 3 - Workout Experience

Deliver:
- Start workout.
- Live timer.
- Exercise logging.
- Set rows.
- Weight and rep controls.
- Rest timer.
- Finish workout.
- Draft persistence.

### Phase 4 - Post-Workout Summary

Deliver:
- Duration.
- Total volume.
- Estimated calories.
- Previous comparison.
- Insights.
- Achievements earned.
- Mood and energy check-in.
- Notes.

### Phase 5 - Progress and Measurements

Deliver:
- Strength charts.
- Volume charts.
- Duration trends.
- Consistency graph.
- Saturday measurement form.
- Measurement trends.

### Phase 6 - Program Editing and Backup

Deliver:
- Editable workout days.
- Editable exercises.
- Editable order.
- Export backup.
- Import backup.
- Reset app data with confirmation.

### Phase 7 - Polish

Deliver:
- Framer Motion page transitions.
- Micro-interactions.
- Empty states.
- Mobile refinement.
- Desktop responsiveness.
- Accessibility pass.
- Performance pass.

## Production Quality Checklist

UX:
- App opens directly to useful dashboard.
- Start workout action is obvious.
- Workout logging is fast on mobile.
- No screen feels cluttered.
- Finish screen feels rewarding.

Data:
- Data persists after reload.
- Import and export work.
- Invalid imports are handled.
- Program edits do not corrupt history.

Responsive:
- Mobile layout is primary.
- Tablet and desktop layouts are polished.
- Text does not overflow controls.

Performance:
- No slow chart recalculations during workout logging.
- Smooth transitions.
- Lightweight components.

Accessibility:
- Buttons have labels.
- Inputs have labels.
- Color contrast is readable.
- Motion is subtle.

## Recommended First Build Command Sequence

When moving to implementation:

```txt
npm create vite@latest feminine-fitness-tracker -- --template react-ts
npm install
npm install framer-motion recharts lucide-react
npm install -D tailwindcss postcss autoprefixer
```

Because network access may require approval in the current environment, dependency installation should be confirmed when build work begins.

