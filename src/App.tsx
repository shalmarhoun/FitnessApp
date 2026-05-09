import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Download,
  Dumbbell,
  Flame,
  Heart,
  Home,
  Play,
  Plus,
  RotateCcw,
  Ruler,
  Save,
  Settings,
  Sparkles,
  Timer,
  Trophy,
  Upload,
  X,
} from "lucide-react";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type * as React from "react";
import {
  activeSessionKey,
  achievementCatalog,
  createDefaultData,
  dateKey,
  formatDuration,
  latestPreviousSession,
  loadData,
  sameWeekSessions,
  saveData,
  sessionVolume,
  storageKey,
  weekdayName,
  weekdays,
} from "./data";
import type { ActiveSession, AppData, LoggedExercise, MeasurementEntry, ProgramDay, ProgramExercise, Weekday, WorkoutSession } from "./types";

type View = "home" | "workout" | "progress" | "measurements" | "settings";

const pageMotion = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] as const },
};

const uid = () => crypto.randomUUID();
const brandIconSrc = `${import.meta.env.BASE_URL}icons/icon-192.png`;
const isSameDate = (a: Date, b: Date) => dateKey(a) === dateKey(b);
const formatDisplayDate = (date: Date) => date.toLocaleDateString("en", { weekday: "long", month: "short", day: "numeric" });
const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
const addMonths = (date: Date, amount: number) => new Date(date.getFullYear(), date.getMonth() + amount, 1);
const findWorkoutForDate = (programDays: ProgramDay[], date: Date) => programDays.find((day) => day.weekday === weekdayName(date));
const nextWorkoutFromDate = (programDays: ProgramDay[], date: Date) => {
  for (let offset = 1; offset <= 7; offset += 1) {
    const candidate = new Date(date);
    candidate.setDate(candidate.getDate() + offset);
    const workout = findWorkoutForDate(programDays, candidate);
    if (workout) return { date: candidate, workout };
  }
  return null;
};

const loadActiveSession = (): ActiveSession | null => {
  try {
    const raw = localStorage.getItem(activeSessionKey);
    return raw ? (JSON.parse(raw) as ActiveSession) : null;
  } catch {
    return null;
  }
};

const Button = ({
  children,
  onClick,
  variant = "primary",
  className = "",
  type = "button",
  disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "soft" | "ghost" | "danger";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}) => {
  const styles = {
    primary: "bg-lavender text-white shadow-glow hover:bg-[#7d5fe0]",
    soft: "bg-white/80 text-plum ring-1 ring-silk hover:bg-white",
    ghost: "bg-transparent text-plum hover:bg-white/60",
    danger: "bg-[#fff0f4] text-[#a93f5b] ring-1 ring-[#ffd2de]",
  };
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
    >
      {children}
    </motion.button>
  );
};

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <motion.section layout className={`soft-card rounded-[22px] p-5 ${className}`}>
    {children}
  </motion.section>
);

const Stat = ({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) => (
  <div className="overflow-hidden rounded-[24px] border border-white/80 bg-white/72 p-5 shadow-lavender">
    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-mist text-lavender">{icon}</div>
    <p className="text-sm font-semibold text-ink">{label}</p>
    <p className="mt-1 text-3xl font-black text-ink">{value}</p>
    <p className="mt-1 text-sm font-semibold text-lavender">This Week</p>
    <div className="soft-wave mt-2 text-lavender" />
  </div>
);

const NumberField = ({
  value,
  onChange,
  step = 1,
  min = 0,
  label,
  unit,
}: {
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  label: string;
  unit?: string;
}) => (
  <label className="block min-w-0">
    <span className="mb-1 block text-[10px] font-black uppercase tracking-[0.12em] text-[#75677f]">{label}</span>
    <div className="flex h-12 min-w-0 items-center rounded-2xl border border-silk bg-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
      <button aria-label={`Decrease ${label}`} className="flex h-full w-9 shrink-0 items-center justify-center text-plum" onClick={() => onChange(Math.max(min, Number((value - step).toFixed(1))))} type="button">
        <ChevronDown size={17} />
      </button>
      <input
        className="h-full min-w-0 flex-1 bg-transparent text-center text-base font-black text-ink outline-none"
        value={value}
        type="number"
        min={min}
        step={step}
        aria-label={label}
        inputMode="decimal"
        onChange={(event) => onChange(Number(event.target.value))}
      />
      {unit && <span className="pr-2 text-[11px] font-black uppercase text-lavender">{unit}</span>}
      <button aria-label={`Increase ${label}`} className="flex h-full w-9 shrink-0 items-center justify-center text-plum" onClick={() => onChange(Number((value + step).toFixed(1)))} type="button">
        <ChevronUp size={17} />
      </button>
    </div>
  </label>
);

function App() {
  const [data, setData] = useState<AppData>(() => loadData());
  const [view, setView] = useState<View>("home");
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(() => loadActiveSession());
  const [completedSession, setCompletedSession] = useState<WorkoutSession | null>(null);
  const [showSplash, setShowSplash] = useState(() => !sessionStorage.getItem("fitnessSmSplashSeen"));

  useEffect(() => saveData(data), [data]);

  useEffect(() => {
    if (!showSplash) return;
    const timer = window.setTimeout(() => {
      sessionStorage.setItem("fitnessSmSplashSeen", "true");
      setShowSplash(false);
    }, 2200);
    return () => window.clearTimeout(timer);
  }, [showSplash]);

  useEffect(() => {
    try {
      if (activeSession) localStorage.setItem(activeSessionKey, JSON.stringify(activeSession));
      else localStorage.removeItem(activeSessionKey);
    } catch (error) {
      console.error("Unable to save workout draft", error);
    }
  }, [activeSession]);

  const selectedWeekday = weekdayName(selectedDate);
  const selectedWorkout = useMemo(
    () => data.program.days.find((day) => day.weekday === selectedWeekday),
    [data.program.days, selectedWeekday],
  );
  const defaultWorkout = data.program.days[0];
  const today = weekdayName();
  const actualTodayWorkout = useMemo(() => data.program.days.find((day) => day.weekday === today), [data.program.days, today]);

  const updateData = (updater: (data: AppData) => AppData) => {
    setData((current) => updater({ ...current, meta: { ...current.meta, updatedAt: new Date().toISOString() } }));
  };

  const startWorkout = (day = selectedWorkout ?? defaultWorkout) => {
    if (!day) return;
    const previous = latestPreviousSession(data.sessions, day.id);
    if (activeSession) {
      setView("workout");
      return;
    }
    const exercises: LoggedExercise[] = day.exercises.map((exercise) => {
      const previousExercise = previous?.exercises.find((item) => item.sourceExerciseId === exercise.id);
      return {
        id: uid(),
        sourceExerciseId: exercise.id,
        name: exercise.name,
        targetReps: exercise.targetReps,
        sets: Array.from({ length: exercise.targetSets }).map((_, index) => {
          const previousSet = previousExercise?.sets[index];
          return {
            id: uid(),
            setNumber: index + 1,
            reps: typeof exercise.targetReps === "number" ? exercise.targetReps : previousSet?.reps ?? 30,
            weight: previousSet?.weight ?? exercise.defaultWeight,
            unit: exercise.unit,
            completed: false,
          };
        }),
      };
    });
    setActiveSession({ id: uid(), programDayId: day.id, title: day.title, scheduledWeekday: day.weekday, startedAt: new Date().toISOString(), exercises });
    setCompletedSession(null);
    setView("workout");
  };

  const finishWorkout = () => {
    if (!activeSession) return;
    const durationSeconds = Math.max(60, Math.round((Date.now() - new Date(activeSession.startedAt).getTime()) / 1000));
    const draft = {
      ...activeSession,
      completedAt: new Date().toISOString(),
      durationSeconds,
      totalVolume: sessionVolume(activeSession),
      estimatedCalories: Math.round((durationSeconds / 60) * 6),
      achievementsEarned: [],
    };
    const earned = evaluateAchievements(data, draft);
    const session: WorkoutSession = { ...draft, achievementsEarned: earned };
    updateData((current) => ({
      ...current,
      sessions: [session, ...current.sessions],
      achievements: current.achievements.map((achievement) => (earned.includes(achievement.id) && !achievement.earnedAt ? { ...achievement, earnedAt: session.completedAt } : achievement)),
    }));
    setCompletedSession(session);
    setActiveSession(null);
    localStorage.removeItem(activeSessionKey);
  };

  return (
    <div className="min-h-screen pb-28 text-[#241b2f] md:pb-10">
      <AnimatePresence>{showSplash && <SplashScreen />}</AnimatePresence>
      <div className="mx-auto w-full max-w-5xl px-4 py-5 md:px-8 md:py-6">
        <main className="min-w-0 flex-1">
          <AnimatePresence mode="wait">
            {view === "home" && <Dashboard key="home" data={data} selectedDate={selectedDate} selectedWorkout={selectedWorkout} startWorkout={startWorkout} setView={setView} openCalendar={() => setCalendarOpen(true)} />}
            {view === "workout" && (
              <Workout
                key="workout"
                data={data}
                activeSession={activeSession}
                completedSession={completedSession}
                setActiveSession={setActiveSession}
                startWorkout={startWorkout}
                finishWorkout={finishWorkout}
                setCompletedSession={setCompletedSession}
                updateData={updateData}
                setView={setView}
              />
            )}
            {view === "progress" && <Progress key="progress" data={data} />}
            {view === "measurements" && <Measurements key="measurements" data={data} updateData={updateData} />}
            {view === "settings" && <SettingsScreen key="settings" data={data} updateData={updateData} setData={setData} />}
          </AnimatePresence>
        </main>
      </div>
      <MobileNav view={view} setView={setView} startWorkout={() => actualTodayWorkout ? startWorkout(actualTodayWorkout) : setView("measurements")} hasActiveSession={Boolean(activeSession)} hasTodayWorkout={Boolean(actualTodayWorkout)} />
      <AnimatePresence>
        {calendarOpen && (
          <CalendarSheet
            data={data}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onClose={() => setCalendarOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

const navItems: { view: View; label: string; icon: React.ReactNode }[] = [
  { view: "home", label: "Home", icon: <Home size={20} /> },
  { view: "workout", label: "Workout", icon: <Dumbbell size={20} /> },
  { view: "progress", label: "Progress", icon: <BarChart3 size={20} /> },
  { view: "measurements", label: "Measure", icon: <Ruler size={20} /> },
  { view: "settings", label: "Settings", icon: <Settings size={20} /> },
];

const MobileNav = ({
  view,
  setView,
  startWorkout,
  hasActiveSession,
  hasTodayWorkout,
}: {
  view: View;
  setView: (view: View) => void;
  startWorkout: () => void;
  hasActiveSession: boolean;
  hasTodayWorkout: boolean;
}) => (
  <nav className="glass fixed bottom-3 left-4 right-4 z-40 mx-auto grid max-w-xl grid-cols-6 items-center rounded-[30px] p-2 md:-bottom-5">
    {navItems.slice(0, 2).map((item) => (
      <button
        aria-label={item.label}
        className={`relative flex flex-col items-center gap-1 rounded-2xl py-2 text-[11px] font-bold transition ${view === item.view ? "text-lavender" : "text-[#75677f]"}`}
        key={item.view}
        onClick={() => setView(item.view)}
        type="button"
      >
        {item.icon}
        {item.label}
      </button>
    ))}
    <button aria-label={hasActiveSession ? "Resume Workout" : hasTodayWorkout ? "Start Workout" : "Open Measurements"} className="flex flex-col items-center gap-1 rounded-2xl py-2 text-[11px] font-bold text-white" onClick={hasActiveSession ? () => setView("workout") : startWorkout} type="button">
      <span className="-mt-7 mb-1 flex h-14 w-14 items-center justify-center rounded-full bg-lavender shadow-glow ring-8 ring-white/70">
        {hasActiveSession ? <Timer size={25} /> : hasTodayWorkout ? <Plus size={28} /> : <Ruler size={25} />}
      </span>
      {hasActiveSession ? "Live" : hasTodayWorkout ? "Start" : "Measure"}
    </button>
    {navItems.slice(2).map((item) => (
      <button
        aria-label={item.label}
        className={`relative flex flex-col items-center gap-1 rounded-2xl py-2 text-[11px] font-bold transition ${view === item.view ? "text-lavender" : "text-[#75677f]"}`}
        key={item.view}
        onClick={() => setView(item.view)}
        type="button"
      >
        {item.icon}
        {item.label}
      </button>
    ))}
  </nav>
);

const BrandMark = ({ size = "md", showName = false }: { size?: "sm" | "md" | "lg"; showName?: boolean }) => {
  const sizes = { sm: "h-10 w-10", md: "h-16 w-16", lg: "h-28 w-28" };
  return (
    <div className="flex items-center gap-3">
      <span className={`brand-mark-shell ${sizes[size]}`}>
        <img aria-hidden className="h-full w-full rounded-[28%]" src={brandIconSrc} alt="" />
        <span className="brand-mark-fallback">SM</span>
      </span>
      {showName && (
        <div>
          <p className="brand-wordmark text-sm font-black uppercase text-plum">FITNESS SM</p>
          <p className="font-serif text-xs italic tracking-[0.14em] text-[#75677f]">Strength in rhythm</p>
        </div>
      )}
    </div>
  );
};

const SplashScreen = () => (
  <motion.div
    className="splash-glow fixed inset-0 z-[80] flex flex-col items-center justify-center px-8 text-center"
    initial={{ opacity: 1 }}
    exit={{ opacity: 0, scale: 1.02 }}
    transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
  >
    <span className="splash-arc one" />
    <span className="splash-arc two" />
    <span className="splash-ribbon" />
    {[18, 34, 55, 68, 82].map((left, index) => (
      <span className="splash-particle" style={{ left: `${left}%`, top: `${18 + (index % 3) * 20}%` }} key={left} />
    ))}
    <motion.div className="splash-logo-wrap" initial={{ scale: 0.88, y: 16, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 190, damping: 26 }}>
      <BrandMark size="lg" />
    </motion.div>
    <motion.p className="brand-wordmark mt-8 text-lg font-black uppercase text-plum" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
      FITNESS SM
    </motion.p>
    <motion.div className="mt-3 h-px w-48 bg-gradient-to-r from-transparent via-lilac to-transparent" initial={{ opacity: 0, scaleX: 0.65 }} animate={{ opacity: 1, scaleX: 1 }} transition={{ delay: 0.3, duration: 0.6 }} />
    <motion.p className="mt-3 font-serif text-base italic tracking-[0.18em] text-[#75677f]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.38 }}>
      Strength in rhythm
    </motion.p>
  </motion.div>
);

const DesktopNav = ({ view, setView }: { view: View; setView: (view: View) => void }) => (
  <aside className="glass sticky top-8 hidden h-[calc(100vh-4rem)] w-64 shrink-0 rounded-[28px] p-5 md:block">
    <div className="mb-8">
      <BrandMark size="md" showName />
    </div>
    <div className="space-y-2">
      {navItems.map((item) => (
        <button
          className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold transition ${view === item.view ? "bg-lavender text-white shadow-glow" : "text-plum hover:bg-white/70"}`}
          key={item.view}
          onClick={() => setView(item.view)}
          type="button"
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </div>
  </aside>
);

const Header = ({ eyebrow, title, action }: { eyebrow: string; title: string; action?: React.ReactNode }) => (
  <header className="mb-5 flex items-start justify-between gap-4">
    <div>
      <p className="mb-1 text-lg font-semibold text-[#75677f]">{eyebrow}</p>
      <h1 className="lavender-script text-5xl font-black leading-none text-ink md:text-[58px]">{title}</h1>
    </div>
    {action}
  </header>
);

function Dashboard({
  data,
  selectedDate,
  selectedWorkout,
  startWorkout,
  setView,
  openCalendar,
}: {
  data: AppData;
  selectedDate: Date;
  selectedWorkout?: ProgramDay;
  startWorkout: (day?: ProgramDay) => void;
  setView: (view: View) => void;
  openCalendar: () => void;
}) {
  const weekSessions = sameWeekSessions(data.sessions, selectedDate);
  const weeklyDone = new Set(weekSessions.map((session) => session.scheduledWeekday));
  const weeklyGoal = data.preferences.trainingDays.length;
  const weeklyVolume = weekSessions.reduce((total, session) => total + session.totalVolume, 0);
  const consistency = weeklyGoal ? Math.round((weeklyDone.size / weeklyGoal) * 100) : 0;
  const bestStreak = calculateWeeklyStreak(data.sessions, data.preferences.trainingDays);
  const isToday = isSameDate(selectedDate, new Date());
  const isSaturday = weekdayName(selectedDate) === "Saturday";
  const nextWorkout = nextWorkoutFromDate(data.program.days, selectedDate);

  return (
    <motion.div {...pageMotion}>
      <TopGreeting openCalendar={openCalendar} />
      <Header eyebrow={isToday ? "Good morning" : formatDisplayDate(selectedDate)} title={isToday ? "Today" : selectedDate.toLocaleDateString("en", { month: "short", day: "numeric" })} />
      <div className="grid gap-5">
        {selectedWorkout ? (
        <Card className="relative overflow-hidden rounded-[34px] bg-gradient-to-br from-white via-[#fffaff] to-[#f4edff] p-6 md:p-7">
          <div className="absolute right-0 top-10 hidden h-64 w-64 rounded-full bg-lilac/20 md:block" />
          <div className="relative grid gap-6 md:grid-cols-[1fr_240px] md:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-silk bg-white/55 px-4 py-2 text-xs font-black uppercase text-lavender">
                <img aria-hidden className="h-5 w-5 rounded-[28%]" src={brandIconSrc} alt="" /> {isToday ? "Today's Workout" : "Scheduled Workout"}
              </span>
              <h2 className="lavender-script mt-5 max-w-lg text-5xl font-black leading-tight text-ink md:text-[56px]">{selectedWorkout.title}</h2>
              <div className="mt-5 grid gap-3 text-base font-semibold text-[#75677f]">
                <span className="flex items-center gap-3"><Timer className="text-lavender" size={20} /> Est. 60 min</span>
                <span className="flex items-center gap-3"><Dumbbell className="text-lavender" size={20} /> {selectedWorkout.exercises.length} Exercises</span>
                <span className="flex items-center gap-3"><Heart className="text-lavender" size={20} /> Focus: Strength</span>
              </div>
              <Button className="mt-6 h-14 w-full rounded-[24px] text-base md:max-w-md" onClick={() => startWorkout(selectedWorkout)}>
                Start Workout <ArrowRight className="ml-auto" size={24} />
              </Button>
            </div>
            <div className="hidden justify-self-end md:block">
              <div className="kettlebell-art">
                <span className="lavender-stem" />
              </div>
            </div>
          </div>
        </Card>
        ) : (
        <Card className="relative overflow-hidden rounded-[34px] bg-gradient-to-br from-white via-[#fff7fb] to-[#f1ebff] p-6 md:p-7">
          <span className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-lilac/25 blur-2xl" />
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-silk bg-white/60 px-4 py-2 text-xs font-black uppercase text-lavender">
              <Sparkles size={16} /> {isSaturday ? "Measurement Day" : "Recovery Day"}
            </span>
            <h2 className="lavender-script mt-5 max-w-2xl text-5xl font-black leading-tight text-ink md:text-[56px]">
              {isSaturday ? "Soft check-in, strong rhythm." : "Recovery protects the progress."}
            </h2>
            <p className="mt-4 max-w-xl text-base font-semibold leading-7 text-[#75677f]">
              {isSaturday
                ? "No workout is scheduled today. Save measurements, review the week, and let your body absorb the work."
                : nextWorkout
                  ? `No workout is scheduled today. Your next ritual is ${nextWorkout.workout.title} on ${nextWorkout.date.toLocaleDateString("en", { weekday: "long" })}.`
                  : "No workout is scheduled today. Keep the rhythm calm and intentional."}
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Button className="h-14 rounded-[24px] text-base" onClick={() => setView(isSaturday ? "measurements" : "progress")}>
                {isSaturday ? "Save Measurements" : "View Progress"} <ArrowRight className="ml-auto" size={22} />
              </Button>
              <Button variant="soft" className="h-14 rounded-[24px] text-base" onClick={openCalendar}>
                Open Calendar <Calendar size={20} />
              </Button>
            </div>
          </div>
        </Card>
        )}

        <Card className="rounded-[30px] p-6">
          <div className="mb-5 flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-black uppercase text-lavender"><Trophy size={18} /> Weekly Goal</span>
            <button className="inline-flex items-center gap-1 text-sm font-bold text-[#75677f]" type="button" onClick={() => setView("progress")}>View Details <ArrowRight size={15} /></button>
          </div>
          <div className="grid gap-6 md:grid-cols-[220px_1fr] md:items-center">
            <div className="relative mx-auto flex h-44 w-44 items-center justify-center rounded-full bg-[conic-gradient(from_0deg,#b889ee_var(--goal),#f0eafd_0)] p-3" style={{ "--goal": `${consistency}%` } as React.CSSProperties}>
              <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-white/90 text-center">
                <span className="text-5xl font-black text-ink">{weeklyDone.size}</span>
                <span className="text-lg font-semibold text-[#75677f]">of {weeklyGoal}</span>
                <span className="text-sm font-bold text-[#75677f]">Workouts</span>
              </div>
            </div>
            <div>
              <p className="mb-5 text-xl font-semibold text-[#75677f]">{selectedWorkout ? "Keep going. You're on track." : "Rest days still count toward the rhythm."}</p>
              <div className="grid grid-cols-3 gap-4">
                {data.preferences.trainingDays.map((day) => (
                  <div className="text-center" key={day}>
                    <div className={`mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full text-xl font-black ${weeklyDone.has(day) ? "bg-mist text-lavender" : "border-2 border-dashed border-lilac/80 text-lavender"}`}>
                      {weeklyDone.has(day) ? <Check size={22} /> : <Dumbbell size={19} />}
                    </div>
                    <p className="text-sm font-bold text-[#75677f]">{day.slice(0, 3)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <Stat label="Weekly Streak" value={`${bestStreak} weeks`} icon={<Flame size={19} />} />
        <Stat label="Consistency" value={`${consistency}%`} icon={<Calendar size={19} />} />
        <Stat label="Volume" value={`${Math.round(weeklyVolume).toLocaleString()} kg`} icon={<Activity size={19} />} />
      </div>

      <Card className="mt-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase text-[#75677f]">Quick Performance</p>
            <h2 className="mt-1 text-xl font-black text-ink">Calm proof that the work is adding up.</h2>
          </div>
          <Button variant="soft" onClick={() => setView("progress")}>View</Button>
        </div>
        <MiniVolumeChart sessions={data.sessions} />
      </Card>
    </motion.div>
  );
}

const TopGreeting = ({ openCalendar }: { openCalendar: () => void }) => (
  <div className="mb-4 flex items-center justify-between">
    <BrandMark size="md" showName />
    <div className="flex gap-3">
      <button className="flex h-16 w-16 items-center justify-center rounded-full bg-white/70 text-[#75677f] shadow-lavender ring-1 ring-white/80" type="button" aria-label="Open calendar" onClick={openCalendar}>
        <Calendar size={25} />
      </button>
      <button className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white/70 text-[#75677f] shadow-lavender ring-1 ring-white/80" type="button" aria-label="Motivation">
        <Sparkles size={25} />
        <span className="absolute right-3 top-3 h-3 w-3 rounded-full bg-blush" />
      </button>
    </div>
  </div>
);

function Workout({
  data,
  activeSession,
  completedSession,
  setActiveSession,
  startWorkout,
  finishWorkout,
  setCompletedSession,
  updateData,
  setView,
}: {
  data: AppData;
  activeSession: ActiveSession | null;
  completedSession: WorkoutSession | null;
  setActiveSession: React.Dispatch<React.SetStateAction<ActiveSession | null>>;
  startWorkout: (day?: ProgramDay) => void;
  finishWorkout: () => void;
  setCompletedSession: (session: WorkoutSession | null) => void;
  updateData: (updater: (data: AppData) => AppData) => void;
  setView: (view: View) => void;
}) {
  if (completedSession) {
    return <WorkoutSummary session={completedSession} previous={latestPreviousSession(data.sessions.filter((item) => item.id !== completedSession.id), completedSession.programDayId)} updateData={updateData} setCompletedSession={setCompletedSession} />;
  }

  if (!activeSession) {
    return (
      <motion.div {...pageMotion}>
        <Header eyebrow="FITNESS SM" title="Choose a ritual to begin." action={<BrandMark size="md" />} />
        <div className="grid gap-4 md:grid-cols-3">
          {data.program.days.map((day) => (
            <Card key={day.id}>
              <p className="text-xs font-black uppercase text-lavender">{day.weekday}</p>
              <h2 className="mt-1 text-xl font-black text-ink">{day.title}</h2>
              <p className="mt-2 text-sm font-semibold text-[#75677f]">{day.exercises.length} exercises</p>
              <Button className="mt-5 w-full" onClick={() => startWorkout(day)}>
                <Play size={17} /> Start
              </Button>
            </Card>
          ))}
        </div>
      </motion.div>
    );
  }

  return <ActiveWorkout data={data} activeSession={activeSession} setActiveSession={setActiveSession} finishWorkout={finishWorkout} onBack={() => setView("home")} />;
}

function ActiveWorkout({
  data,
  activeSession,
  setActiveSession,
  finishWorkout,
  onBack,
}: {
  data: AppData;
  activeSession: ActiveSession;
  setActiveSession: React.Dispatch<React.SetStateAction<ActiveSession | null>>;
  finishWorkout: () => void;
  onBack: () => void;
}) {
  const [elapsed, setElapsed] = useState(0);
  const [restSeconds, setRestSeconds] = useState(0);
  const previous = latestPreviousSession(data.sessions, activeSession.programDayId);
  const completedSets = activeSession.exercises.reduce((sum, exercise) => sum + exercise.sets.filter((set) => set.completed).length, 0);
  const totalSets = activeSession.exercises.reduce((sum, exercise) => sum + exercise.sets.length, 0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setElapsed(Math.round((Date.now() - new Date(activeSession.startedAt).getTime()) / 1000));
      setRestSeconds((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [activeSession.startedAt]);

  const updateSet = (exerciseId: string, setId: string, patch: Partial<ActiveSession["exercises"][number]["sets"][number]>) => {
    setActiveSession((current) =>
      current
        ? {
            ...current,
            exercises: current.exercises.map((exercise) =>
              exercise.id === exerciseId
                ? { ...exercise, sets: exercise.sets.map((set) => (set.id === setId ? { ...set, ...patch } : set)) }
                : exercise,
            ),
          }
        : current,
    );
  };

  return (
    <motion.div className="mx-auto max-w-3xl" {...pageMotion}>
      <div className="mb-5 flex items-center justify-between px-1">
        <button className="flex h-12 w-12 items-center justify-center rounded-full bg-white/70 text-plum shadow-lavender" onClick={onBack} type="button" aria-label="Return to dashboard">
          <ArrowLeft size={22} />
        </button>
        <div className="text-center">
          <h1 className="text-3xl font-black text-ink">Workout</h1>
          <p className="brand-wordmark mt-1 text-[10px] font-black uppercase text-lavender">FITNESS SM</p>
        </div>
        <button className="flex h-12 w-12 items-center justify-center rounded-full bg-white/70 text-plum shadow-lavender" onClick={() => setRestSeconds(data.preferences.defaultRestSeconds)} type="button" aria-label="Start rest timer">
          <Timer size={22} />
        </button>
      </div>

      <div className="glass sticky top-3 z-20 mb-5 rounded-[30px] p-5">
        <div className="grid gap-4 sm:grid-cols-[1fr_1px_1fr] sm:items-center sm:gap-5">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-mist text-lavender">
              <Dumbbell size={25} />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#75677f]">Workout Time</p>
              <p className="text-3xl font-black text-ink sm:text-4xl">{formatDuration(elapsed)}</p>
            </div>
          </div>
          <div className="hidden h-16 bg-silk sm:block" />
          <div>
            <p className="text-sm font-semibold text-[#75677f]">Rest</p>
            <p className="text-3xl font-black text-ink sm:text-4xl">{formatDuration(restSeconds)}</p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-mist">
            <motion.div className="h-full bg-gradient-to-r from-lavender to-sage" animate={{ width: `${(completedSets / totalSets) * 100}%` }} />
          </div>
          <p className="text-xs font-black text-[#75677f]">{completedSets}/{totalSets}</p>
        </div>
        <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar">
          <Button variant={restSeconds > 0 ? "primary" : "soft"} onClick={() => setRestSeconds(data.preferences.defaultRestSeconds)}>
            <Timer size={17} /> {restSeconds > 0 ? formatDuration(restSeconds) : "Rest 90s"}
          </Button>
          <Button variant="soft" onClick={() => setRestSeconds(60)}>60s</Button>
          <Button variant="soft" onClick={() => setRestSeconds(120)}>120s</Button>
        </div>
      </div>

      <div className="space-y-5">
        {activeSession.exercises.map((exercise) => (
          <ExerciseLogger key={exercise.id} exercise={exercise} previous={previous?.exercises.find((item) => item.sourceExerciseId === exercise.sourceExerciseId)} updateSet={updateSet} />
        ))}
      </div>

      <div className="sticky bottom-24 z-30 mt-5 md:bottom-20">
        <Button className="h-16 w-full rounded-[26px] text-lg" onClick={finishWorkout} disabled={completedSets === 0}>
          Finish Workout <ArrowRight className="ml-auto" size={24} />
        </Button>
      </div>
    </motion.div>
  );
}

const ExerciseLogger = ({
  exercise,
  previous,
  updateSet,
}: {
  exercise: LoggedExercise;
  previous?: LoggedExercise;
  updateSet: (exerciseId: string, setId: string, patch: Partial<LoggedExercise["sets"][number]>) => void;
}) => {
  const completed = exercise.sets.filter((set) => set.completed).length;
  const previousVolume = previous?.sets.reduce((total, set) => total + set.weight * set.reps, 0) ?? 0;
  return (
    <Card className="rounded-[32px] p-6">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black leading-snug text-ink">{exercise.name}</h2>
          <p className="mt-2 text-base font-bold text-[#75677f]">
            Target {exercise.sets.length} x {exercise.targetReps === "failure" ? "failure" : exercise.targetReps}
          </p>
        </div>
        <div className="rounded-full bg-mist px-4 py-3 text-sm font-black text-lavender">{completed}/{exercise.sets.length}</div>
      </div>
      <p className="mb-4 rounded-[22px] bg-[#fbf7ff] px-4 py-4 text-sm font-bold text-[#75677f]">
        Previous: {previous ? `${Math.round(previousVolume).toLocaleString()} total volume` : "No previous session yet"}
      </p>
      <div className="space-y-3">
        {exercise.sets.map((set) => (
          <div className={`grid grid-cols-[44px_minmax(0,1fr)_50px] gap-2 rounded-[22px] border p-3 sm:grid-cols-[54px_minmax(0,1fr)_minmax(0,1fr)_52px] sm:items-end ${set.completed ? "border-[#c9eadb] bg-[#f1fff8]" : "border-silk bg-white/70"}`} key={set.id}>
            <div className="flex h-full min-h-12 flex-col items-center justify-center rounded-2xl bg-white/75 text-center">
              <span className="text-[9px] font-black uppercase tracking-[0.1em] text-[#75677f]">Set</span>
              <span className="text-base font-black text-plum">{set.setNumber}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:contents">
              <NumberField label={`Weight (${set.unit})`} unit={set.unit} value={set.weight} step={set.unit === "lb" ? 5 : 1} onChange={(value) => updateSet(exercise.id, set.id, { weight: value })} />
              <NumberField label="Reps" value={set.reps} onChange={(value) => updateSet(exercise.id, set.id, { reps: value })} />
            </div>
            <motion.button
              whileTap={{ scale: 0.92 }}
              aria-label={`Complete set ${set.setNumber}`}
              className={`flex h-12 w-12 items-center justify-center self-end rounded-2xl ${set.completed ? "bg-sage text-white" : "bg-mist text-lavender"}`}
              onClick={() => updateSet(exercise.id, set.id, { completed: !set.completed, completedAt: !set.completed ? new Date().toISOString() : undefined })}
              type="button"
            >
              <Check size={18} />
            </motion.button>
          </div>
        ))}
      </div>
    </Card>
  );
};

function WorkoutSummary({
  session,
  previous,
  updateData,
  setCompletedSession,
}: {
  session: WorkoutSession;
  previous?: WorkoutSession;
  updateData: (updater: (data: AppData) => AppData) => void;
  setCompletedSession: (session: WorkoutSession | null) => void;
}) {
  const [mood, setMood] = useState(session.mood ?? "Strong");
  const [energy, setEnergy] = useState(session.energy ?? 4);
  const [notes, setNotes] = useState(session.notes ?? "");
  const volumeDelta = previous ? session.totalVolume - previous.totalVolume : session.totalVolume;

  const saveSummary = () => {
    updateData((data) => ({
      ...data,
      sessions: data.sessions.map((item) => (item.id === session.id ? { ...item, mood, energy, notes } : item)),
    }));
    setCompletedSession(null);
  };

  return (
    <motion.div {...pageMotion}>
      <Card className="overflow-hidden bg-gradient-to-br from-white via-mist to-[#fff4f8]">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-[22px] bg-lavender text-white shadow-glow">
          <Sparkles size={25} />
        </div>
        <h1 className="text-3xl font-black text-ink">Beautiful work. Session complete.</h1>
        <p className="mt-2 text-sm font-semibold text-[#75677f]">You showed up, logged the work, and gave your progress another reason to exist.</p>
        <div className="mt-5 grid grid-cols-3 gap-3">
          <Stat label="Duration" value={formatDuration(session.durationSeconds)} icon={<Timer size={18} />} />
          <Stat label="Volume" value={`${Math.round(session.totalVolume).toLocaleString()}`} icon={<Activity size={18} />} />
          <Stat label="Calories" value={`${session.estimatedCalories}`} icon={<Flame size={18} />} />
        </div>
      </Card>

      <Card className="mt-5">
        <p className="text-xs font-black uppercase text-[#75677f]">Strength Insight</p>
        <h2 className="mt-1 text-xl font-black text-ink">
          {volumeDelta > 0 ? `Volume improved by ${Math.round(volumeDelta).toLocaleString()}.` : "You completed the ritual and protected the rhythm."}
        </h2>
        <p className="mt-2 text-sm font-semibold text-[#75677f]">Progressive overload is tracked from completed sets, reps, and weight.</p>
      </Card>

      <Card className="mt-5">
        <p className="text-xs font-black uppercase text-[#75677f]">Achievements Earned</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {session.achievementsEarned.length ? (
            session.achievementsEarned.map((id) => <Badge key={id} achievement={achievementCatalog.find((item) => item.id === id)!} />)
          ) : (
            <span className="rounded-full bg-mist px-3 py-2 text-sm font-bold text-[#75677f]">Consistency banked</span>
          )}
        </div>
      </Card>

      <Card className="mt-5">
        <p className="text-xs font-black uppercase text-[#75677f]">Check-in</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-black text-ink">Mood</p>
            <div className="flex flex-wrap gap-2">
              {["Calm", "Strong", "Tired", "Energized", "Focused"].map((item) => (
                <button className={`rounded-2xl px-3 py-2 text-sm font-bold ${mood === item ? "bg-lavender text-white" : "bg-mist text-plum"}`} key={item} onClick={() => setMood(item)} type="button">
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-black text-ink">Energy</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((item) => (
                <button className={`h-11 w-11 rounded-2xl text-sm font-black ${energy === item ? "bg-lavender text-white" : "bg-mist text-plum"}`} key={item} onClick={() => setEnergy(item)} type="button">
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
        <textarea className="mt-4 min-h-28 w-full rounded-2xl border border-silk bg-white/80 p-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-lilac" placeholder="Workout notes" value={notes} onChange={(event) => setNotes(event.target.value)} />
        <Button className="mt-4 w-full" onClick={saveSummary}>
          <Save size={17} /> Save Summary
        </Button>
      </Card>
    </motion.div>
  );
}

function Progress({ data }: { data: AppData }) {
  const chartData = useMemo(() => [...data.sessions].reverse().slice(-8).map((session) => ({
    name: new Date(session.completedAt).toLocaleDateString("en", { month: "short", day: "numeric" }),
    volume: Math.round(session.totalVolume),
    duration: Math.round(session.durationSeconds / 60),
  })), [data.sessions]);
  const measurementData = [...data.measurements].reverse().map((item) => ({
    name: new Date(item.date).toLocaleDateString("en", { month: "short", day: "numeric" }),
    weight: item.bodyWeight,
    waist: item.waist,
  }));

  return (
    <motion.div {...pageMotion}>
      <Header eyebrow="FITNESS SM Progress" title="Calm proof that your work is adding up." action={<BrandMark size="md" />} />
      <div className="grid gap-5 xl:grid-cols-2">
        <ChartCard title="Strength & Volume" subtitle="Total volume per completed session.">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="volumeGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#8F6FE8" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#8F6FE8" stopOpacity={0.04} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#E9E1F5" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "#75677f", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#75677f", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 16, borderColor: "#E8DEFF" }} />
              <Area dataKey="volume" stroke="#8F6FE8" fill="url(#volumeGradient)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Duration Trends" subtitle="Workout length in minutes.">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData}>
              <CartesianGrid stroke="#E9E1F5" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "#75677f", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#75677f", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 16, borderColor: "#E8DEFF" }} />
              <Line dataKey="duration" stroke="#A8C7B5" strokeWidth={3} dot={{ r: 4, fill: "#A8C7B5" }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Workout Consistency" subtitle="Recent session volume, shown simply.">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData}>
              <CartesianGrid stroke="#E9E1F5" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "#75677f", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#75677f", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 16, borderColor: "#E8DEFF" }} />
              <Bar dataKey="volume" fill="#D8A7C5" radius={[12, 12, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Body Trends" subtitle="Body weight and waist measurements.">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={measurementData}>
              <CartesianGrid stroke="#E9E1F5" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "#75677f", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#75677f", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 16, borderColor: "#E8DEFF" }} />
              <Line dataKey="weight" stroke="#8F6FE8" strokeWidth={3} />
              <Line dataKey="waist" stroke="#F5C8D7" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </motion.div>
  );
}

const ChartCard = ({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) => (
  <Card>
    <p className="text-xs font-black uppercase text-[#75677f]">{title}</p>
    <p className="mt-1 text-sm font-semibold text-[#75677f]">{subtitle}</p>
    <div className="mt-4">{children}</div>
  </Card>
);

function Measurements({ data, updateData }: { data: AppData; updateData: (updater: (data: AppData) => AppData) => void }) {
  const isSaturday = weekdayName() === "Saturday";
  const [entry, setEntry] = useState<MeasurementEntry>({
    id: uid(),
    date: dateKey(new Date()),
    bodyWeight: undefined,
    waist: undefined,
    hips: undefined,
    thighs: undefined,
    arms: undefined,
    custom: [],
  });

  const saveMeasurements = () => {
    updateData((current) => {
      const earnedSaturday = isSaturday && !current.achievements.find((item) => item.id === "saturday-ritual")?.earnedAt;
      return {
        ...current,
        measurements: [entry, ...current.measurements.filter((item) => item.date !== entry.date)],
        achievements: current.achievements.map((achievement) => (earnedSaturday && achievement.id === "saturday-ritual" ? { ...achievement, earnedAt: new Date().toISOString() } : achievement)),
      };
    });
  };

  return (
    <motion.div {...pageMotion}>
      <Header eyebrow="FITNESS SM" title="Saturday check-in, soft and simple." action={<BrandMark size="md" />} />
      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <div className={`mb-5 rounded-2xl p-4 ${isSaturday ? "bg-[#ecfff6] text-[#3f8d70]" : "bg-mist text-plum"}`}>
            <p className="text-sm font-black">{isSaturday ? "Today is the measurement ritual." : "Saturday is the ideal update day."}</p>
          </div>
          <div className="grid gap-3">
            {[
              ["bodyWeight", "Body Weight"],
              ["waist", "Waist"],
              ["hips", "Hips"],
              ["thighs", "Thighs"],
              ["arms", "Arms"],
            ].map(([key, label]) => (
              <label className="grid gap-2 text-sm font-black text-ink" key={key}>
                {label}
                <input aria-label={label} className="h-12 rounded-2xl border border-silk bg-white/85 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-lilac" type="number" value={(entry as any)[key] ?? ""} onChange={(event) => setEntry({ ...entry, [key]: Number(event.target.value) || undefined })} />
              </label>
            ))}
          </div>
          <Button className="mt-5 w-full" onClick={saveMeasurements}>
            <Save size={17} /> Save Measurements
          </Button>
        </Card>
        <ChartCard title="Measurement Trends" subtitle="Weekly progress over time.">
          <ResponsiveContainer width="100%" height={340}>
            <LineChart data={[...data.measurements].reverse().map((item) => ({ name: new Date(item.date).toLocaleDateString("en", { month: "short", day: "numeric" }), weight: item.bodyWeight, waist: item.waist, hips: item.hips }))}>
              <CartesianGrid stroke="#E9E1F5" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "#75677f", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#75677f", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 16, borderColor: "#E8DEFF" }} />
              <Line dataKey="weight" stroke="#8F6FE8" strokeWidth={3} />
              <Line dataKey="waist" stroke="#F5C8D7" strokeWidth={3} />
              <Line dataKey="hips" stroke="#A8C7B5" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </motion.div>
  );
}

function SettingsScreen({
  data,
  updateData,
  setData,
}: {
  data: AppData;
  updateData: (updater: (data: AppData) => AppData) => void;
  setData: (data: AppData) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  const exportBackup = () => {
    const backup = {
      backupMeta: { appName: "FITNESS SM", schemaVersion: 1, exportedAt: new Date().toISOString() },
      data,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `feminine-fitness-backup-${dateKey(new Date())}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const importBackup = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    try {
      const parsed = JSON.parse(text);
      const imported = parsed.data as AppData;
      if (!imported?.meta || imported.meta.schemaVersion !== 1 || !Array.isArray(imported.program?.days) || !Array.isArray(imported.sessions)) {
        window.alert("This backup file is not valid.");
        return;
      }
      if (!window.confirm("Restore this backup? It will replace the local data currently stored in this browser.")) return;
      localStorage.setItem(storageKey, JSON.stringify(imported));
      localStorage.removeItem(activeSessionKey);
      setData(imported);
      window.alert("Backup restored.");
    } catch {
      window.alert("This backup file could not be read.");
    } finally {
      event.target.value = "";
    }
  };

  const resetData = () => {
    if (!window.confirm("Reset all local app data? This cannot be undone unless you exported a backup.")) return;
    const next = createDefaultData();
    localStorage.setItem(storageKey, JSON.stringify(next));
    setData(next);
  };

  return (
    <motion.div {...pageMotion}>
      <Header eyebrow="FITNESS SM" title="Program, backups, and preferences." action={<BrandMark size="md" />} />
      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <ProgramEditor data={data} updateData={updateData} />
        <div className="space-y-5">
          <Card>
            <p className="text-xs font-black uppercase text-[#75677f]">Backup</p>
            <h2 className="mt-1 text-xl font-black text-ink">Your data stays yours.</h2>
            <p className="mt-2 text-sm font-semibold text-[#75677f]">Export or restore every workout, set, measurement, preference, and achievement through JSON.</p>
            <div className="mt-5 grid gap-3">
              <Button onClick={exportBackup}>
                <Download size={17} /> Export JSON Backup
              </Button>
              <Button variant="soft" onClick={() => fileRef.current?.click()}>
                <Upload size={17} /> Import JSON Backup
              </Button>
              <input ref={fileRef} className="hidden" type="file" accept="application/json" onChange={importBackup} />
            </div>
          </Card>
          <Card>
            <p className="text-xs font-black uppercase text-[#75677f]">Achievements</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {data.achievements.map((achievement) => <Badge key={achievement.id} achievement={achievement} />)}
            </div>
          </Card>
          <Card>
            <Button variant="danger" className="w-full" onClick={resetData}>
              <RotateCcw size={17} /> Reset Local Data
            </Button>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}

function ProgramEditor({ data, updateData }: { data: AppData; updateData: (updater: (data: AppData) => AppData) => void }) {
  const updateDay = (dayId: string, patch: Partial<ProgramDay>) =>
    updateData((current) => ({
      ...current,
      preferences: patch.weekday
        ? {
            ...current.preferences,
            trainingDays: current.program.days.map((day) => (day.id === dayId ? patch.weekday! : day.weekday)),
          }
        : current.preferences,
      program: { ...current.program, days: current.program.days.map((day) => (day.id === dayId ? { ...day, ...patch } : day)) },
    }));

  const updateExercise = (dayId: string, exerciseId: string, patch: Partial<ProgramExercise>) =>
    updateData((current) => ({
      ...current,
      program: {
        ...current.program,
        days: current.program.days.map((day) =>
          day.id === dayId ? { ...day, exercises: day.exercises.map((exercise) => (exercise.id === exerciseId ? { ...exercise, ...patch } : exercise)) } : day,
        ),
      },
    }));

  const addExercise = (dayId: string) =>
    updateData((current) => ({
      ...current,
      program: {
        ...current.program,
        days: current.program.days.map((day) =>
          day.id === dayId
            ? {
                ...day,
                exercises: [
                  ...day.exercises,
                  { id: uid(), name: "New Exercise", targetSets: 3, targetReps: 10, defaultWeight: 0, unit: "kg" },
                ],
              }
            : day,
        ),
      },
    }));

  const removeExercise = (dayId: string, exerciseId: string) =>
    updateData((current) => ({
      ...current,
      program: {
        ...current.program,
        days: current.program.days.map((day) =>
          day.id === dayId ? { ...day, exercises: day.exercises.filter((exercise) => exercise.id !== exerciseId) } : day,
        ),
      },
    }));

  const moveExercise = (dayId: string, exerciseId: string, direction: -1 | 1) =>
    updateData((current) => ({
      ...current,
      program: {
        ...current.program,
        days: current.program.days.map((day) => {
          if (day.id !== dayId) return day;
          const index = day.exercises.findIndex((exercise) => exercise.id === exerciseId);
          const nextIndex = index + direction;
          if (index < 0 || nextIndex < 0 || nextIndex >= day.exercises.length) return day;
          const exercises = [...day.exercises];
          const [moved] = exercises.splice(index, 1);
          exercises.splice(nextIndex, 0, moved);
          return { ...day, exercises };
        }),
      },
    }));

  return (
    <Card>
      <p className="text-xs font-black uppercase text-[#75677f]">Editable Program</p>
      <div className="mt-4 space-y-5">
        {data.program.days.map((day) => (
          <div className="rounded-[20px] border border-silk bg-white/65 p-4" key={day.id}>
            <div className="grid gap-3 md:grid-cols-[1fr_160px]">
              <input className="h-12 rounded-2xl border border-silk bg-white px-4 text-sm font-black outline-none focus:ring-2 focus:ring-lilac" value={day.title} onChange={(event) => updateDay(day.id, { title: event.target.value })} />
              <select className="h-12 rounded-2xl border border-silk bg-white px-4 text-sm font-black outline-none" value={day.weekday} onChange={(event) => updateDay(day.id, { weekday: event.target.value as Weekday })}>
                {weekdays.map((weekday) => <option key={weekday}>{weekday}</option>)}
              </select>
            </div>
            <div className="mt-3 space-y-3">
              {day.exercises.map((exercise) => (
                <div className="grid gap-2 rounded-2xl bg-mist/60 p-3 md:grid-cols-[1fr_80px_80px_90px_160px]" key={exercise.id}>
                  <input className="h-11 rounded-xl border border-silk bg-white px-3 text-sm font-bold outline-none" value={exercise.name} onChange={(event) => updateExercise(day.id, exercise.id, { name: event.target.value })} />
                  <input className="h-11 rounded-xl border border-silk bg-white px-3 text-sm font-bold outline-none" type="number" value={exercise.targetSets} onChange={(event) => updateExercise(day.id, exercise.id, { targetSets: Number(event.target.value) })} />
                  <input className="h-11 rounded-xl border border-silk bg-white px-3 text-sm font-bold outline-none" value={exercise.targetReps} onChange={(event) => updateExercise(day.id, exercise.id, { targetReps: event.target.value === "failure" ? "failure" : Number(event.target.value) })} />
                  <input className="h-11 rounded-xl border border-silk bg-white px-3 text-sm font-bold outline-none" type="number" value={exercise.defaultWeight} onChange={(event) => updateExercise(day.id, exercise.id, { defaultWeight: Number(event.target.value) })} />
                  <div className="grid grid-cols-3 gap-2">
                    <button aria-label="Move exercise up" className="rounded-xl bg-white text-plum ring-1 ring-silk" onClick={() => moveExercise(day.id, exercise.id, -1)} type="button">
                      <ChevronUp className="mx-auto" size={17} />
                    </button>
                    <button aria-label="Move exercise down" className="rounded-xl bg-white text-plum ring-1 ring-silk" onClick={() => moveExercise(day.id, exercise.id, 1)} type="button">
                      <ChevronDown className="mx-auto" size={17} />
                    </button>
                    <button aria-label="Remove exercise" className="rounded-xl bg-[#fff0f4] text-[#a93f5b] ring-1 ring-[#ffd2de]" onClick={() => removeExercise(day.id, exercise.id)} type="button">
                      <X className="mx-auto" size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <Button className="mt-3" variant="soft" onClick={() => addExercise(day.id)}>
              <Plus size={17} /> Add Exercise
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}

const Badge = ({ achievement }: { achievement: { title: string; tier: string; earnedAt?: string } }) => (
  <span className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-black ${achievement.earnedAt ? "bg-gradient-to-r from-lavender to-mauve text-white shadow-glow" : "bg-mist text-[#75677f]"}`}>
    <Trophy size={14} /> {achievement.title}
  </span>
);

const MiniVolumeChart = ({ sessions }: { sessions: WorkoutSession[] }) => {
  const chartData = [...sessions].reverse().slice(-7).map((session) => ({
    name: new Date(session.completedAt).toLocaleDateString("en", { weekday: "short" }),
    volume: Math.round(session.totalVolume),
  }));
  return (
    <div className="mt-4 h-40">
      {chartData.length ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <Bar dataKey="volume" fill="#8F6FE8" radius={[10, 10, 0, 0]} />
            <XAxis dataKey="name" tick={{ fill: "#75677f", fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 16, borderColor: "#E8DEFF" }} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-full items-center justify-center rounded-2xl bg-mist text-sm font-bold text-[#75677f]">Your first chart appears after a completed workout.</div>
      )}
    </div>
  );
};

function CalendarSheet({
  data,
  selectedDate,
  onSelectDate,
  onClose,
}: {
  data: AppData;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onClose: () => void;
}) {
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(selectedDate));
  const monthLabel = visibleMonth.toLocaleDateString("en", { month: "long", year: "numeric" });
  const first = startOfMonth(visibleMonth);
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - first.getDay());
  const days = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    return date;
  });
  const completedDates = new Set(data.sessions.map((session) => dateKey(new Date(session.completedAt))));

  const chooseDate = (date: Date) => {
    onSelectDate(date);
    setVisibleMonth(startOfMonth(date));
    onClose();
  };

  return (
    <motion.div className="fixed inset-0 z-[70] flex items-end bg-[#241b2f]/28 px-3 pb-3 backdrop-blur-sm md:items-center md:justify-center md:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div
        className="glass max-h-[88vh] w-full max-w-lg overflow-hidden rounded-[34px] p-5"
        initial={{ y: 34, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 24, opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-lavender">Calendar</p>
            <h2 className="mt-1 text-2xl font-black text-ink">{monthLabel}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/75 text-plum ring-1 ring-silk" type="button" aria-label="Previous month" onClick={() => setVisibleMonth((date) => addMonths(date, -1))}>
              <ChevronLeft size={20} />
            </button>
            <button className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/75 text-plum ring-1 ring-silk" type="button" aria-label="Next month" onClick={() => setVisibleMonth((date) => addMonths(date, 1))}>
              <ChevronRight size={20} />
            </button>
            <button className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/75 text-plum ring-1 ring-silk" type="button" aria-label="Close calendar" onClick={onClose}>
              <X size={19} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 pb-2 text-center text-[11px] font-black uppercase text-[#75677f]">
          {weekdays.map((weekday) => <span key={weekday}>{weekday.slice(0, 3)}</span>)}
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            className="grid grid-cols-7 gap-1.5"
            key={dateKey(visibleMonth)}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            {days.map((date) => {
              const key = dateKey(date);
              const workout = findWorkoutForDate(data.program.days, date);
              const selected = isSameDate(date, selectedDate);
              const currentMonth = date.getMonth() === visibleMonth.getMonth();
              const completed = completedDates.has(key);
              const saturday = weekdayName(date) === "Saturday";
              return (
                <button
                  className={`min-h-[58px] rounded-[18px] p-1.5 text-left transition ${selected ? "bg-lavender text-white shadow-glow" : currentMonth ? "bg-white/72 text-ink ring-1 ring-white/80" : "bg-white/35 text-[#aa9fb7]"} ${isSameDate(date, new Date()) && !selected ? "ring-2 ring-lilac" : ""}`}
                  key={key}
                  type="button"
                  onClick={() => chooseDate(date)}
                  aria-label={`${formatDisplayDate(date)}${workout ? `, ${workout.title}` : saturday ? ", measurement day" : ", recovery day"}`}
                >
                  <span className="block text-sm font-black">{date.getDate()}</span>
                  <span className={`mt-1 block h-1.5 w-1.5 rounded-full ${completed ? "bg-sage" : workout ? selected ? "bg-white" : "bg-lavender" : saturday ? "bg-blush" : "bg-transparent"}`} />
                  <span className={`mt-1 block truncate text-[9px] font-black uppercase ${selected ? "text-white/90" : "text-[#75677f]"}`}>
                    {completed ? "Done" : workout ? "Lift" : saturday ? "Measure" : ""}
                  </span>
                </button>
              );
            })}
          </motion.div>
        </AnimatePresence>
        <div className="mt-5 grid grid-cols-3 gap-2 text-center text-[11px] font-black uppercase text-[#75677f]">
          <span className="rounded-full bg-white/65 px-2 py-2"><span className="mr-1 inline-block h-2 w-2 rounded-full bg-lavender" />Workout</span>
          <span className="rounded-full bg-white/65 px-2 py-2"><span className="mr-1 inline-block h-2 w-2 rounded-full bg-blush" />Measure</span>
          <span className="rounded-full bg-white/65 px-2 py-2"><span className="mr-1 inline-block h-2 w-2 rounded-full bg-sage" />Done</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

const evaluateAchievements = (data: AppData, session: WorkoutSession) => {
  const earned = new Set<string>();
  const alreadyEarned = new Set(data.achievements.filter((item) => item.earnedAt).map((item) => item.id));
  if (!data.sessions.length && !alreadyEarned.has("first-ritual")) earned.add("first-ritual");
  if (data.sessions.length + 1 >= 5 && !alreadyEarned.has("steady-builder")) earned.add("steady-builder");
  const previous = latestPreviousSession(data.sessions, session.programDayId);
  if (previous && session.totalVolume > previous.totalVolume && !alreadyEarned.has("volume-pr")) earned.add("volume-pr");
  const improvedExercises = session.exercises.filter((exercise) => {
    const prior = previous?.exercises.find((item) => item.sourceExerciseId === exercise.sourceExerciseId);
    const currentVolume = exercise.sets.reduce((total, set) => total + set.weight * set.reps, 0);
    const priorVolume = prior?.sets.reduce((total, set) => total + set.weight * set.reps, 0) ?? 0;
    return currentVolume > priorVolume && priorVolume > 0;
  }).length;
  if (improvedExercises >= 3 && !alreadyEarned.has("progressive-overload")) earned.add("progressive-overload");
  const weekSessions = sameWeekSessions([...data.sessions, session]);
  const completedDays = new Set(weekSessions.map((item) => item.scheduledWeekday));
  if (data.preferences.trainingDays.every((day) => completedDays.has(day)) && !alreadyEarned.has("weekly-grace")) earned.add("weekly-grace");
  return [...earned];
};

const calculateWeeklyStreak = (sessions: WorkoutSession[], trainingDays: Weekday[]) => {
  if (!sessions.length) return 0;
  let streak = 0;
  const cursor = new Date();
  for (let i = 0; i < 20; i += 1) {
    const week = sameWeekSessions(sessions, cursor);
    const days = new Set(week.map((session) => session.scheduledWeekday));
    if (trainingDays.every((day) => days.has(day))) streak += 1;
    else if (i > 0) break;
    cursor.setDate(cursor.getDate() - 7);
  }
  return streak;
};

export default App;

