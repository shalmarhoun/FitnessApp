# Design System

## Design Direction

Style:
- Soft lavender feminine performance UI.
- Premium, calm, polished, and responsive.
- Minimal luxury aesthetic.
- Apple-quality motion and spacing.

Avoid:
- Masculine dark gym aesthetics.
- Heavy black/red palettes.
- Loud bodybuilding imagery.
- Cluttered widgets.
- Overly playful gamification.

## Color Palette

Core colors:

```txt
Lavender Mist       #F4F0FF
Lavender Silk       #E8DEFF
Soft Lilac          #C9B6FF
Royal Lavender      #8F6FE8
Deep Plum           #49335F
Ink Plum            #22172E
White Pearl         #FFFFFF
Warm Cloud          #FAF8FC
Blush Rose          #F5C8D7
Soft Mauve          #D8A7C5
Sage Accent         #A8C7B5
Champagne Accent    #E8D8AE
Success             #77BFA3
Warning             #D9A441
Danger              #D96C86
Text Primary        #241B2F
Text Secondary      #75677F
Border Soft         #E9E1F5
Shadow Lavender     rgba(91, 64, 132, 0.14)
```

Recommended usage:
- Background: Lavender Mist to Warm Cloud.
- Cards: White Pearl with subtle transparency.
- Primary buttons: Royal Lavender.
- Positive states: Success.
- Premium reward accents: Champagne Accent.
- Charts: Royal Lavender, Blush Rose, Sage Accent, Soft Mauve.

## Typography

Recommended font stack:

```css
font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

Optional premium display font:
- Use `Playfair Display` only for rare celebratory headings if loaded locally or through normal web-safe fallback. Otherwise keep Inter for performance.

Type scale:

```txt
Display: 32px / 40px / 700
Page title: 26px / 34px / 700
Section title: 20px / 28px / 700
Card title: 17px / 24px / 700
Body: 15px / 22px / 500
Small: 13px / 18px / 500
Micro: 11px / 14px / 600
```

Rules:
- Letter spacing: 0.
- No viewport-based font scaling.
- Compact panels use compact headings.
- Buttons must never overflow text.

## Spacing

Base spacing:

```txt
4, 8, 12, 16, 20, 24, 32, 40, 56
```

Mobile page padding:
- 16px.

Desktop constrained content:
- Max width 1120px.
- Centered with 24px to 32px side padding.

## Shape

Cards:
- 8px to 20px radius depending on size.
- Keep repeated item cards around 14px to 18px.
- Avoid nested card visuals.

Buttons:
- 14px to 18px radius.
- Minimum height 44px for touch comfort.

Inputs:
- Minimum height 44px.
- Rounded but precise.

## Shadows

Primary card shadow:

```css
0 18px 50px rgba(91, 64, 132, 0.12)
```

Soft floating action shadow:

```css
0 12px 28px rgba(143, 111, 232, 0.26)
```

Use shadows sparingly. Premium means restraint.

## Glassmorphism

Use only for:
- Bottom navigation.
- Header overlays.
- Completion summary accents.

Recommended style:

```css
background: rgba(255, 255, 255, 0.72);
backdrop-filter: blur(18px);
border: 1px solid rgba(255, 255, 255, 0.55);
```

## Motion System

Use Framer Motion for:
- Page transitions.
- Workout card entry.
- Set completion feedback.
- Summary celebration.
- Modal transitions.

Motion rules:
- Duration: 160ms to 320ms for normal UI.
- Spring transitions for taps and completion.
- Avoid bouncy childish motion.
- Prefer ease-out.

Recommended:

```ts
const softSpring = { type: "spring", stiffness: 280, damping: 26 };
const pageFade = { duration: 0.22, ease: "easeOut" };
```

## Component Library

Core UI:
- AppShell.
- BottomNav.
- PageHeader.
- PrimaryButton.
- IconButton.
- Card.
- StatPill.
- Input.
- NumberStepper.
- SegmentedControl.
- Modal.
- Toast.
- TimerRing.
- ProgressRing.
- EmptyState.

Workout components:
- TodayWorkoutCard.
- StartWorkoutButton.
- WorkoutTimerBar.
- ExerciseCard.
- SetLoggerRow.
- RestTimerSheet.
- PreviousPerformancePill.
- FinishWorkoutBar.
- WorkoutSummaryPanel.

Analytics components:
- LavenderLineChart.
- SoftBarChart.
- WeeklyConsistencyChart.
- MeasurementTrendChart.
- StrengthProgressCard.

Achievement components:
- AchievementShelf.
- AchievementBadge.
- CelebrationPanel.

## Icon Strategy

Use lucide-react icons:
- Play.
- Dumbbell.
- Timer.
- Check.
- Plus.
- Minus.
- Edit3.
- Save.
- Download.
- Upload.
- Trophy.
- Sparkles.
- Calendar.
- TrendingUp.
- Activity.
- Scale.
- Ruler.
- Settings.

Icon buttons should include accessible labels and tooltips where useful.

