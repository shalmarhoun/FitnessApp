# UX Flow and Wireframes

## User Journey

### Daily Workout Journey

1. User opens app.
2. Dashboard shows today's workout as the main card.
3. User taps Start Workout.
4. Workout timer starts immediately.
5. User logs each set quickly.
6. User uses rest timer when needed.
7. User finishes workout.
8. Summary celebrates progress, streak, volume, and achievements.
9. User adds mood, energy, and notes.
10. Session is saved locally.

### Weekly Journey

1. Week starts Sunday.
2. Goal is three workouts: Sunday, Tuesday, Thursday.
3. Dashboard shows completed workouts this week.
4. Streak updates after each completed scheduled session.
5. Saturday prompts measurements.
6. Progress charts update from logged data.

## Primary Navigation

Mobile bottom tabs:
- Home.
- Workout.
- Progress.
- Measure.
- Settings.

Desktop:
- Left rail or top navigation.
- Content remains constrained and readable.

## Dashboard Wireframe

```txt
+------------------------------------------------+
| Good evening                         Settings  |
| Your strength ritual is ready.                 |
+------------------------------------------------+
| TODAY'S WORKOUT                                |
| Day 1 - Inner Thighs / Quads                   |
| Sunday                                         |
| 4 exercises  |  23 target sets                 |
|                                                |
| [Start Workout]                 [Edit]         |
+------------------------------------------------+
| WEEKLY GOAL                                    |
| 2 of 3 sessions completed                      |
| [ lavender progress bar ]                      |
| Sun complete  Tue complete  Thu pending        |
+------------------------------------------------+
| Streak      Consistency      Volume            |
| 4 weeks     86 percent       +12 percent       |
+------------------------------------------------+
| Performance Preview                            |
| Strength trending up                           |
| Small chart                                    |
+------------------------------------------------+
| Bottom Navigation                              |
+------------------------------------------------+
```

Dashboard rules:
- Today's workout dominates.
- Weekly goal is second.
- Everything else is compact.
- No overloaded analytics grid.

## Workout Screen Wireframe

```txt
+------------------------------------------------+
| Day 1 - Inner Thighs / Quads          00:18:42 |
| Warmup: Lateral Step Down, Jog 1KM, Hip Opener |
+------------------------------------------------+
| Rest timer                     [Start 90s]     |
+------------------------------------------------+
| Exercise 1                                      |
| Sumo stance swing to squat to shoulder press   |
| Target: 6 x 10       Previous: 8kg x 10        |
|                                                |
| Set   Weight        Reps          Done         |
| 1     [-] 8 [+]     [-] 10 [+]    [check]      |
| 2     [-] 8 [+]     [-] 10 [+]    [check]      |
| 3     [-] 8 [+]     [-] 10 [+]    [check]      |
| ...                                            |
+------------------------------------------------+
| Exercise 2                                      |
| Side lunge super set sumo squat                |
+------------------------------------------------+
| [Finish Workout]                               |
+------------------------------------------------+
```

Workout UX rules:
- Keep timer visible.
- Use large touch targets.
- Complete set with one tap.
- Number stepper controls for weight and reps.
- Previous performance shown as a quiet comparison.
- Finish workout button fixed near bottom after progress starts.

## Post-Workout Summary Wireframe

```txt
+------------------------------------------------+
| Beautiful work. Session complete.              |
| 54 min     9,840 kg volume     +8 percent      |
+------------------------------------------------+
| Strength insight                               |
| You lifted more total volume than last time.   |
+------------------------------------------------+
| Achievements                                   |
| Weekly Momentum      Volume PR                 |
+------------------------------------------------+
| Mood                                           |
| [Calm] [Strong] [Tired] [Energized]            |
+------------------------------------------------+
| Energy                                         |
| [1] [2] [3] [4] [5]                            |
+------------------------------------------------+
| Notes                                          |
| [text area]                                    |
+------------------------------------------------+
| [Save Summary]                                 |
+------------------------------------------------+
```

## Progress Screen Wireframe

```txt
+------------------------------------------------+
| Progress                                       |
| Calm proof that your work is adding up.        |
+------------------------------------------------+
| Strength Progress                              |
| [line chart by exercise]                       |
+------------------------------------------------+
| Weekly Volume                                  |
| [bar chart]                                    |
+------------------------------------------------+
| Duration Trends                                |
| [line chart]                                   |
+------------------------------------------------+
| Consistency                                    |
| [weekly pattern]                               |
+------------------------------------------------+
```

Progress rules:
- Use tabs or segmented controls for Strength, Volume, Duration, Consistency.
- Avoid showing too many charts at once on mobile.
- Default to the most motivating chart.

## Measurements Screen Wireframe

```txt
+------------------------------------------------+
| Measurements                                   |
| Saturday check-in                              |
+------------------------------------------------+
| This week's update                             |
| Body weight      [ input ]                     |
| Waist            [ input ]                     |
| Hips             [ input ]                     |
| Thighs           [ input ]                     |
| Arms             [ input ]                     |
| [Add custom]                                   |
| [Save Measurements]                            |
+------------------------------------------------+
| Trends                                         |
| [measurement selector]                         |
| [line chart]                                   |
+------------------------------------------------+
```

Measurement rules:
- Saturday gets highlighted as the ideal update day.
- Other days can allow save but show a softer note.
- Custom measurements should be simple key/value entries.

## Settings Screen

Must include:
- Edit program.
- Export backup.
- Import backup.
- Reset app data with confirmation.
- App preferences.

Backup controls should feel trustworthy and clear.

## Mobile Responsive Strategy

Mobile first:
- Single-column layout.
- Bottom navigation.
- Fixed action bar during workout.
- Touch targets at least 44px.
- Avoid dense tables; use row cards.

Tablet:
- Wider cards.
- Dashboard can use a two-column supporting grid below primary cards.
- Workout remains single-column for focus.

Desktop:
- Constrained center content.
- Optional side navigation.
- Analytics can use two-column chart layout.

