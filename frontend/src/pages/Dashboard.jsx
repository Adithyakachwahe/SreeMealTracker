import { useState, useEffect } from "react";
import { api } from "../api";

const Card = ({ children, style = {} }) => (
  <div style={{
    background: "var(--bg2)", border: "1.5px solid var(--border)",
    borderRadius: 14, padding: "15px 17px", boxShadow: "var(--shadow)",
    transition: "background 0.25s, border-color 0.25s",
    ...style
  }}>{children}</div>
);

const SectionLabel = ({ children, color = "var(--text3)" }) => (
  <div style={{ fontSize: 10, color, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, marginBottom: 8 }}>
    {children}
  </div>
);

/* ── Weight Entry Card ─────────────────────────────────────────── */
function WeightCard({ today }) {
  const [todayWeight, setTodayWeight] = useState(null);
  const [inputVal, setInputVal]       = useState("");
  const [editing, setEditing]         = useState(false);
  const [history, setHistory]         = useState([]);
  const [saving, setSaving]           = useState(false);

  useEffect(() => {
    api.getWeight(today).then(d => {
      if (d.weight) { setTodayWeight(d.weight); setInputVal(String(d.weight)); }
    }).catch(() => {});
    api.getWeightHistory().then(setHistory).catch(() => {});
  }, [today]);

  const save = async () => {
    const val = parseFloat(inputVal);
    if (!val || val < 20 || val > 300) return;
    setSaving(true);
    await api.logWeight(val);
    setTodayWeight(val);
    setEditing(false);
    setSaving(false);
    api.getWeightHistory().then(setHistory).catch(() => {});
  };

  const remove = async () => {
    await api.deleteWeight(today);
    setTodayWeight(null);
    setInputVal("");
    setEditing(false);
    api.getWeightHistory().then(setHistory).catch(() => {});
  };

  // Last 7 entries for mini sparkline
  const last7 = history.slice(-7);
  const minW = last7.length ? Math.min(...last7.map(d => d.weight)) - 1 : 50;
  const maxW = last7.length ? Math.max(...last7.map(d => d.weight)) + 1 : 70;
  const W = 180, H = 50;
  const pts = last7.map((d, i) => {
    const x = last7.length < 2 ? W / 2 : (i / (last7.length - 1)) * W;
    const y = H - ((d.weight - minW) / (maxW - minW || 1)) * H;
    return `${x},${y}`;
  }).join(" ");

  // Diff vs yesterday
  let diff = null;
  if (history.length >= 2 && todayWeight) {
    const yesterday = history[history.length - 2];
    if (yesterday) diff = (todayWeight - yesterday.weight).toFixed(1);
  }

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <SectionLabel color="var(--accent2)">⚖️ Today's Weight</SectionLabel>
        {todayWeight && !editing && (
          <div style={{ display: "flex", gap: 6 }}>
            <button className="btn" onClick={() => setEditing(true)}
              style={{ fontSize: 11, padding: "3px 9px", borderRadius: 20, background: "var(--bg3)", border: "1.5px solid var(--border)", color: "var(--text3)" }}>
              Edit
            </button>
            <button className="btn" onClick={remove}
              style={{ fontSize: 11, padding: "3px 9px", borderRadius: 20, background: "transparent", border: "1.5px solid var(--accent2)", color: "var(--accent2)" }}>
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Current weight display or input */}
      {!editing && todayWeight ? (
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 32, fontWeight: 700, color: "var(--accent2)", letterSpacing: "-0.04em" }}>{todayWeight}</span>
          <span style={{ fontSize: 14, color: "var(--text3)" }}>kg</span>
          {diff !== null && (
            <span style={{
              fontSize: 12, fontWeight: 600, padding: "2px 8px", borderRadius: 20,
              background: diff > 0 ? "var(--accent2-light)" : "var(--accent-light)",
              color: diff > 0 ? "var(--accent2)" : "var(--accent)",
            }}>
              {diff > 0 ? "▲" : "▼"} {Math.abs(diff)} kg
            </span>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <input
            type="number"
            step="0.1" min="20" max="300"
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={e => e.key === "Enter" && save()}
            placeholder="e.g. 63.5"
            style={{ flex: 1, fontSize: 15 }}
            autoFocus={editing}
          />
          <button className="btn" onClick={save} disabled={saving}
            style={{ padding: "9px 16px", borderRadius: 10, background: "var(--accent2)", color: "#fff", fontSize: 13, fontWeight: 600, opacity: saving ? 0.6 : 1 }}>
            {saving ? "…" : "Save"}
          </button>
          {editing && (
            <button className="btn" onClick={() => { setEditing(false); setInputVal(String(todayWeight)); }}
              style={{ padding: "9px 12px", borderRadius: 10, background: "var(--bg3)", border: "1.5px solid var(--border)", color: "var(--text2)", fontSize: 13 }}>
              ✕
            </button>
          )}
        </div>
      )}

      {/* Sparkline */}
      {last7.length >= 2 && (
        <div>
          <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
            <polyline fill="none" stroke="var(--accent2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={pts} />
            {last7.map((d, i) => {
              const x = (i / (last7.length - 1)) * W;
              const y = H - ((d.weight - minW) / (maxW - minW || 1)) * H;
              return <circle key={i} cx={x} cy={y} r="3" fill="var(--accent2)" />;
            })}
          </svg>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
            <span style={{ fontSize: 10, color: "var(--text3)" }}>{last7[0]?.date?.slice(5)}</span>
            <span style={{ fontSize: 10, color: "var(--text3)" }}>{last7[last7.length - 1]?.date?.slice(5)}</span>
          </div>
        </div>
      )}

      {!todayWeight && !editing && (
        <button className="btn" onClick={() => setEditing(true)}
          style={{ width: "100%", padding: "10px", borderRadius: 10, background: "var(--accent2-light)", color: "var(--accent2)", border: "1.5px dashed var(--accent2)", fontSize: 13, fontWeight: 600 }}>
          + Log today's weight (optional)
        </button>
      )}
    </Card>
  );
}

/* ── Dashboard ─────────────────────────────────────────────────── */
export default function Dashboard({ mealPlan, todayLogs, water, dayName, today, darkMode, toggleDark }) {
  const { user, macros } = mealPlan;

  const totalMealTypes = ["detox", "meal1", "meal2", "meal3", "snack1", "snack2"];
  const completedToday = new Set(todayLogs.map(l => l.meal_type));
  const progress       = Math.round((completedToday.size / totalMealTypes.length) * 100);
  const weightToLose   = user.current_weight - user.target_weight;
  const hour           = new Date().getHours();
  const greeting       = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  const dayLabel       = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>{greeting}, {user.name}! 🌿</h1>
          <p style={{ color: "var(--text3)", marginTop: 3, fontSize: 13 }}>{dayLabel}</p>
        </div>
        {/* Dark mode toggle for mobile (shown only on mobile via inline display toggle handled in CSS) */}
        <button className="btn" onClick={toggleDark}
          style={{
            padding: "8px 13px", borderRadius: 20, fontSize: 13,
            background: "var(--bg3)", border: "1.5px solid var(--border)",
            color: "var(--text2)",
          }}>
          {darkMode ? "☀️" : "🌙"}
        </button>
      </div>

      {/* Stats row */}
      <div className="grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 14 }}>
        {[
          { label: "Calories", value: user.calories, unit: "kcal", color: "var(--accent)",  bg: "var(--accent-light)" },
          { label: "Current",  value: user.current_weight, unit: "kg",   color: "var(--accent2)", bg: "var(--accent2-light)" },
          { label: "Target",   value: user.target_weight,  unit: "kg",   color: "var(--accent3)", bg: "var(--accent3-light)" },
          { label: "To Lose",  value: weightToLose,        unit: "kg",   color: "var(--yellow)",  bg: "var(--yellow-light)" },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: 13, padding: "12px 13px", border: "1px solid var(--border)" }}>
            <div style={{ fontSize: 10, color: s.color, textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 700, marginBottom: 5 }}>{s.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: s.color, letterSpacing: "-0.04em", lineHeight: 1 }}>
              {s.value}<span style={{ fontSize: 10, opacity: 0.7, marginLeft: 2 }}>{s.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Progress + Plate */}
      <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 12, marginBottom: 12 }}>
        <Card>
          <SectionLabel>Today's Meals</SectionLabel>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 13 }}>
            <div style={{ position: "relative", width: 68, height: 68, flexShrink: 0 }}>
              <svg width={68} height={68} style={{ transform: "rotate(-90deg)" }}>
                <circle cx={34} cy={34} r={28} fill="none" stroke="var(--bg3)" strokeWidth={7} />
                <circle cx={34} cy={34} r={28} fill="none" stroke="var(--accent)" strokeWidth={7}
                  strokeDasharray={`${2 * Math.PI * 28 * progress / 100} ${2 * Math.PI * 28}`}
                  strokeLinecap="round" style={{ transition: "stroke-dasharray 0.6s ease" }} />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "var(--accent)" }}>
                {progress}%
              </div>
            </div>
            <div>
              <div style={{ fontSize: 19, fontWeight: 700, letterSpacing: "-0.04em" }}>
                {completedToday.size}<span style={{ color: "var(--text3)", fontSize: 13, fontWeight: 400 }}>/{totalMealTypes.length}</span>
              </div>
              <div style={{ color: "var(--text3)", fontSize: 12 }}>meals logged</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {totalMealTypes.map(t => (
              <span key={t} style={{
                padding: "3px 8px", borderRadius: 20, fontSize: 10, fontWeight: 600,
                background: completedToday.has(t) ? "var(--accent-light)" : "var(--bg3)",
                color: completedToday.has(t) ? "var(--accent)" : "var(--text3)",
                border: `1px solid ${completedToday.has(t) ? "var(--border2)" : "var(--border)"}`,
              }}>
                {completedToday.has(t) ? "✓ " : ""}{t.replace(/([a-z])(\d)/, "$1 $2").replace("snack", "S").replace("meal", "M").replace("detox", "Detox")}
              </span>
            ))}
          </div>
        </Card>

        <Card>
          <SectionLabel>Cult Plate</SectionLabel>
          {[
            { label: "Non-Starchy Veggies", pct: 50, color: "var(--accent)" },
            { label: "Protein",             pct: 25, color: "var(--accent2)" },
            { label: "Starchy Grains",      pct: 25, color: "var(--accent3)" },
          ].map(m => (
            <div key={m.label} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ fontSize: 11, color: "var(--text2)" }}>{m.label}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: m.color }}>{m.pct}%</span>
              </div>
              <div style={{ background: "var(--bg3)", borderRadius: 4, height: 5 }}>
                <div style={{ width: `${m.pct}%`, height: "100%", background: m.color, borderRadius: 4 }} />
              </div>
            </div>
          ))}
        </Card>
      </div>

      {/* Weight + Water + Macros */}
      <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <WeightCard today={today} />

        <Card>
          <SectionLabel color="var(--accent3)">Water Intake</SectionLabel>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 4 }}>
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} style={{
                width: 28, height: 36, borderRadius: 6,
                background: i < water ? "var(--accent3-light)" : "var(--bg3)",
                border: `1.5px solid ${i < water ? "var(--accent3)" : "var(--border)"}`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
              }}>
                {i < water ? "💧" : ""}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 8, fontSize: 11, color: "var(--text3)" }}>{water}/8 glasses</div>
        </Card>
      </div>

      {/* Macros */}
      <Card>
        <SectionLabel color="var(--yellow)">Daily Macro Targets</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[
            { label: "Protein",    val: `${macros.protein_katoris} katoris`, color: "var(--accent2)", bg: "var(--accent2-light)" },
            { label: "Carbs",      val: `${macros.carbs_katoris} katoris`,   color: "var(--accent3)", bg: "var(--accent3-light)" },
            { label: "Vegetables", val: `${macros.veggies_katoris} katoris`, color: "var(--accent)",  bg: "var(--accent-light)" },
            { label: "Fats",       val: macros.fats_per_day,                 color: "var(--yellow)",  bg: "var(--yellow-light)" },
          ].map(m => (
            <div key={m.label} style={{ background: m.bg, borderRadius: 9, padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: m.color, fontWeight: 600 }}>{m.label}</span>
              <span style={{ fontSize: 11, color: m.color, fontWeight: 700 }}>{m.val}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}