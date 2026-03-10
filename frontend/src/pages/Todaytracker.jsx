import { useState } from "react";

const MEAL_META = {
  detox:  { label: "Detox Drink", emoji: "🍋", color: "var(--accent)",  bg: "var(--accent-light)",  border: "var(--border2)" },
  meal1:  { label: "Meal 1",      emoji: "🥣", color: "var(--accent2)", bg: "var(--accent2-light)", border: "var(--border2)" },
  meal2:  { label: "Meal 2",      emoji: "🍽️", color: "var(--accent3)", bg: "var(--accent3-light)", border: "var(--border2)" },
  meal3:  { label: "Meal 3",      emoji: "🥘", color: "var(--yellow)",  bg: "var(--yellow-light)",  border: "var(--border2)" },
  snack1: { label: "Snack 1",     emoji: "🍎", color: "var(--purple)",  bg: "var(--purple-light)",  border: "var(--border2)" },
  snack2: { label: "Snack 2",     emoji: "🥜", color: "var(--pink)",    bg: "var(--pink-light)",    border: "var(--border2)" },
};

/* ── Toast ─────────────────────────────────────────────────────── */
function Toast({ onUndo }) {
  return (
    <div style={{
      position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)",
      background: "var(--toast-bg)", color: "var(--toast-text)",
      padding: "10px 16px", borderRadius: 24, fontSize: 13, fontWeight: 500,
      zIndex: 999, display: "flex", alignItems: "center", gap: 10,
      boxShadow: "0 4px 20px rgba(0,0,0,0.2)", animation: "slideUp 0.2s ease",
      whiteSpace: "nowrap",
    }}>
      ✓ Logged!
      <button onClick={onUndo} style={{
        background: "rgba(128,128,128,0.25)", border: "none",
        color: "var(--toast-text)", padding: "3px 11px", borderRadius: 20,
        cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "inherit",
      }}>↩ Undo</button>
    </div>
  );
}

/* ── Custom Meal Bottom Sheet ───────────────────────────────────── */
function CustomMealSheet({ mealKey, onSave, onClose }) {
  const { label, color } = MEAL_META[mealKey] || {};
  const [text, setText] = useState("");

  const save = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSave(trimmed, mealKey);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        {/* Handle */}
        <div style={{ width: 36, height: 4, borderRadius: 2, background: "var(--border2)", margin: "0 auto 18px" }} />

        <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: "-0.03em", marginBottom: 4 }}>
          Log an alternative
        </div>
        <div style={{ fontSize: 13, color: "var(--text3)", marginBottom: 18 }}>
          Adding to <span style={{ color, fontWeight: 600 }}>{label}</span> — describe what you actually ate
        </div>

        <input
          autoFocus
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === "Enter" && save()}
          placeholder={`e.g. "2 chapatis with dal" or "protein shake"`}
          style={{ width: "100%", marginBottom: 14, fontSize: 15 }}
        />

        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn" onClick={onClose}
            style={{ flex: 1, padding: "11px", borderRadius: 10, background: "var(--bg3)", color: "var(--text2)", border: "1.5px solid var(--border)", fontSize: 14 }}>
            Cancel
          </button>
          <button className="btn" onClick={save}
            style={{ flex: 2, padding: "11px", borderRadius: 10, background: color, color: "#fff", fontSize: 14, fontWeight: 600, opacity: text.trim() ? 1 : 0.5 }}>
            Log Alternative
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Meal Section ───────────────────────────────────────────────── */
function MealSection({ mealKey, items, logs, onLog, onDelete, onOpenCustom }) {
  const { label, emoji, color, bg } = MEAL_META[mealKey];
  const itemList = typeof items === "string" ? [items] : items;
  const allLogs  = logs.filter(l => l.meal_type === mealKey);
  const planLogged = new Set(allLogs.filter(l => !l.is_custom).map(l => l.item));
  const customLogs = allLogs.filter(l => l.is_custom);
  const doneCount  = allLogs.length;
  const allDone    = itemList.every(i => planLogged.has(i));

  return (
    <div style={{
      background: "var(--bg2)", border: `1.5px solid ${allDone ? "color-mix(in srgb, var(--border2) 60%, transparent)" : "var(--border)"}`,
      borderRadius: 16, padding: "14px 15px", boxShadow: "var(--shadow)", transition: "border-color 0.25s",
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 11 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>
            {emoji}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text)", letterSpacing: "-0.02em" }}>{label}</div>
            <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 1 }}>{doneCount}/{itemList.length} logged</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {allDone && <span style={{ fontSize: 10, background: bg, color, padding: "3px 8px", borderRadius: 20, fontWeight: 700 }}>✓ Done</span>}
          {/* + Add alternative */}
          <button className="btn" onClick={() => onOpenCustom(mealKey)}
            title="Log an alternative"
            style={{ width: 26, height: 26, borderRadius: 8, background: "var(--bg3)", border: "1.5px solid var(--border)", color: "var(--text3)", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
            +
          </button>
          {!allDone && itemList.length > 1 && (
            <button className="btn" onClick={() => itemList.forEach(item => !planLogged.has(item) && onLog(item, mealKey))}
              style={{ background: bg, color, border: "none", padding: "4px 10px", fontSize: 11, borderRadius: 20, fontWeight: 600 }}>
              All
            </button>
          )}
        </div>
      </div>

      {/* Plan items */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {itemList.map((item, i) => {
          const done = planLogged.has(item);
          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", padding: "8px 10px",
              background: done ? bg : "var(--bg3)",
              borderRadius: 9, border: `1px solid ${done ? "var(--border2)" : "var(--border)"}`,
              gap: 9, transition: "all 0.2s",
            }}>
              <button className="btn" onClick={() => done ? onDelete(item, mealKey) : onLog(item, mealKey)}
                style={{
                  width: 20, height: 20, borderRadius: 5, flexShrink: 0, padding: 0,
                  background: done ? color : "transparent",
                  border: `2px solid ${done ? color : "var(--border2)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, transition: "all 0.2s",
                }}>
                {done && <span style={{ color: "#fff", fontWeight: 700, lineHeight: 1 }}>✓</span>}
              </button>
              <span style={{ fontSize: 12.5, flex: 1, lineHeight: 1.35, color: done ? "var(--text3)" : "var(--text)", textDecoration: done ? "line-through" : "none" }}>
                {item}
              </span>
              <button className="btn" onClick={() => done ? onDelete(item, mealKey) : onLog(item, mealKey)}
                style={{
                  flexShrink: 0, padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, minWidth: 42,
                  background: done ? "transparent" : color,
                  color: done ? "var(--accent2)" : "#fff",
                  border: done ? `1.5px solid var(--accent2)` : "none",
                }}>
                {done ? "↩" : "Log"}
              </button>
            </div>
          );
        })}

        {/* Custom / alternative items */}
        {customLogs.map((log, i) => (
          <div key={"c" + i} style={{
            display: "flex", alignItems: "center", padding: "8px 10px",
            background: bg, borderRadius: 9,
            border: `1px solid var(--border2)`, gap: 9,
          }}>
            <div style={{ width: 20, height: 20, borderRadius: 5, flexShrink: 0, background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff", fontWeight: 700 }}>✓</div>
            <span style={{ fontSize: 12.5, flex: 1, color: "var(--text3)", lineHeight: 1.35, textDecoration: "line-through" }}>
              {log.item}
            </span>
            <span style={{ fontSize: 10, color, background: bg, padding: "2px 7px", borderRadius: 20, fontWeight: 600, flexShrink: 0, border: "1px solid var(--border2)" }}>Alt</span>
            <button className="btn" onClick={() => onDelete(log.item, mealKey)}
              style={{ flexShrink: 0, padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: "transparent", color: "var(--accent2)", border: `1.5px solid var(--accent2)` }}>
              ↩
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Main Page ──────────────────────────────────────────────────── */
export default function TodayTracker({ mealPlan, todayLogs, water, dayName, handleLog, handleDelete, handleWater, darkMode, toggleDark }) {
  const [notes, setNotes]         = useState("");
  const [toast, setToast]         = useState(null);
  const [customSheet, setCustomSheet] = useState(null); // mealKey or null

  const todayPlan  = mealPlan.weekly_plan[dayName] || mealPlan.weekly_plan["Monday"];
  const totalItems = Object.values(todayPlan).flat().length;
  const loggedCount = todayLogs.filter(l => l.consumed).length;
  const pct = totalItems > 0 ? Math.round((loggedCount / totalItems) * 100) : 0;

  const doLog = async (item, mealKey, isCustom = false) => {
    await handleLog(item, mealKey, isCustom);
    setToast({ item, mealKey });
    setTimeout(() => setToast(null), 4000);
  };

  const doUndo = async () => {
    if (toast) { await handleDelete(toast.item, toast.mealKey); setToast(null); }
  };

  return (
    <div>
      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Today's Tracker</h1>
          <p style={{ color: "var(--text3)", marginTop: 3, fontSize: 13 }}>{dayName} · {loggedCount}/{totalItems} items logged</p>
        </div>
        {/* Dark mode toggle (mobile — only visible on mobile) */}
        <button className="btn" onClick={toggleDark}
          style={{
            display: "none",
            padding: "7px 13px", borderRadius: 20, fontSize: 13,
            background: "var(--bg3)", border: "1.5px solid var(--border)",
            color: "var(--text2)",
          }}
          id="mobile-dark-btn">
          {darkMode ? "☀️" : "🌙"}
        </button>
      </div>

      {/* Progress */}
      <div style={{ background: "var(--bg2)", borderRadius: 14, padding: "13px 15px", marginBottom: 11, border: "1.5px solid var(--border)", boxShadow: "var(--shadow)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
          <span style={{ fontSize: 12, color: "var(--text3)", fontWeight: 500 }}>Daily Progress</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)" }}>{pct}%</span>
        </div>
        <div style={{ background: "var(--bg3)", borderRadius: 6, height: 7 }}>
          <div style={{ width: `${pct}%`, height: "100%", background: "var(--accent)", borderRadius: 6, transition: "width 0.5s ease" }} />
        </div>
        <div style={{ marginTop: 8, fontSize: 11, color: "var(--text3)" }}>
          Tap <strong style={{ color: "var(--accent2)" }}>↩</strong> to undo · Tap <strong style={{ color: "var(--accent)" }}>+</strong> to log an alternative meal
        </div>
      </div>

      {/* Water */}
      <div style={{ background: "var(--bg2)", borderRadius: 14, padding: "13px 15px", marginBottom: 11, border: "1.5px solid var(--border)", boxShadow: "var(--shadow)" }}>
        <div style={{ fontWeight: 600, fontSize: 11, color: "var(--accent3)", marginBottom: 10, letterSpacing: "0.06em", textTransform: "uppercase" }}>💧 Water</div>
        <div style={{ display: "flex", gap: 7, alignItems: "center", flexWrap: "wrap" }}>
          {Array.from({ length: 8 }, (_, i) => (
            <button key={i} className="btn" onClick={() => handleWater(i < water ? i : i + 1)}
              style={{
                width: 34, height: 40, borderRadius: 9,
                background: i < water ? "var(--accent3-light)" : "var(--bg3)",
                border: `1.5px solid ${i < water ? "var(--accent3)" : "var(--border)"}`,
                fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center",
              }}>
              {i < water ? "💧" : ""}
            </button>
          ))}
          <span style={{ color: "var(--text3)", fontSize: 12 }}>{water}/8</span>
        </div>
      </div>

      {/* Meals */}
      <div className="grid-meals" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
        {Object.entries(todayPlan).map(([mealKey, items]) => (
          <MealSection key={mealKey} mealKey={mealKey} items={items}
            logs={todayLogs}
            onLog={(item, mk) => doLog(item, mk)}
            onDelete={handleDelete}
            onOpenCustom={setCustomSheet}
          />
        ))}
      </div>

      {/* Notes */}
      <div style={{ marginTop: 11, background: "var(--bg2)", borderRadius: 14, padding: "13px 15px", border: "1.5px solid var(--border)", boxShadow: "var(--shadow)" }}>
        <div style={{ fontWeight: 600, fontSize: 11, color: "var(--text2)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>📝 Notes</div>
        <textarea value={notes} onChange={e => setNotes(e.target.value)}
          placeholder="How are you feeling? Any cravings, skipped items, energy levels…"
          rows={3} style={{ width: "100%", resize: "vertical", fontSize: 14, lineHeight: 1.5 }} />
      </div>

      {/* Custom meal bottom sheet */}
      {customSheet && (
        <CustomMealSheet
          mealKey={customSheet}
          onSave={(item, mk) => doLog(item, mk, true)}
          onClose={() => setCustomSheet(null)}
        />
      )}

      {/* Toast */}
      {toast && <Toast onUndo={doUndo} />}
    </div>
  );
}