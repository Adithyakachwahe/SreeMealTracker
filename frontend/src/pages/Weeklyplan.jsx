import { useState } from "react";

const MEAL_META = {
  detox:  { label: "Detox",   emoji: "🍋", color: "var(--accent)",  border: "#b8e0b5", bg: "var(--accent-light)" },
  meal1:  { label: "Meal 1",  emoji: "🥣", color: "var(--accent2)", border: "#f0b89a", bg: "var(--accent2-light)" },
  meal2:  { label: "Meal 2",  emoji: "🍽️", color: "var(--accent3)", border: "#9dc0f0", bg: "var(--accent3-light)" },
  meal3:  { label: "Meal 3",  emoji: "🥘", color: "var(--yellow)",  border: "#e8c97a", bg: "var(--yellow-light)" },
  snack1: { label: "Snack 1", emoji: "🍎", color: "var(--purple)",  border: "#c4a0e8", bg: "var(--purple-light)" },
  snack2: { label: "Snack 2", emoji: "🥜", color: "var(--pink)",    border: "#e8a0c4", bg: "var(--pink-light)" },
};

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const TODAY = new Date().toLocaleDateString("en-US", { weekday: "long" });

export default function WeeklyPlan({ mealPlan }) {
  const [selectedDay, setSelectedDay] = useState(TODAY);
  const plan = mealPlan.weekly_plan;
  const dayPlan = plan[selectedDay] || plan["Monday"];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Weekly Meal Plan</h1>
        <p style={{ color: "var(--text3)", marginTop: 3, fontSize: 13 }}>7-day North Indian Non-Veg · 1400 kcal/day</p>
      </div>

      {/* Day Tabs - scrollable on mobile */}
      <div style={{ display: "flex", gap: 7, marginBottom: 20, overflowX: "auto", paddingBottom: 4, WebkitOverflowScrolling: "touch" }}>
        {DAYS.map(day => {
          const isToday = day === TODAY;
          const isSelected = day === selectedDay;
          return (
            <button key={day} className="btn" onClick={() => setSelectedDay(day)}
              style={{
                padding: "7px 14px", flexShrink: 0,
                background: isSelected ? "var(--accent-light)" : "var(--bg2)",
                color: isSelected ? "var(--accent)" : isToday ? "var(--accent)" : "var(--text2)",
                border: isSelected ? "1.5px solid #b8e0b5" : isToday ? "1.5px solid #b8e0b540" : "1.5px solid var(--border)",
                fontSize: 13, fontWeight: isSelected ? 600 : 400, borderRadius: 20,
                boxShadow: isSelected ? "none" : "var(--shadow)",
              }}>
              {day.slice(0, 3)}{isToday ? " ●" : ""}
            </button>
          );
        })}
      </div>

      {/* Day header */}
      <h2 style={{ fontSize: 18, fontFamily: "'Inter', sans-serif", fontWeight: 700, marginBottom: 14, color: "var(--text)", letterSpacing: "-0.03em" }}>
        {selectedDay}{selectedDay === TODAY ? <span style={{ fontSize: 13, color: "var(--accent)", marginLeft: 8, fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>Today</span> : ""}
      </h2>

      <div className="grid-meals" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {Object.entries(dayPlan).map(([mealKey, items]) => {
          const { label, emoji, color, bg, border } = MEAL_META[mealKey];
          const itemList = typeof items === "string" ? [items] : items;
          return (
            <div key={mealKey} style={{
              background: "var(--bg2)", borderRadius: 14,
              padding: "14px 16px", boxShadow: "var(--shadow)",
              border: "1.5px solid var(--border)",
              borderTop: `3px solid ${color}`,
            }}>
              <div style={{ fontWeight: 600, fontSize: 13, color, marginBottom: 10 }}>
                {emoji} {label}
              </div>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                {itemList.map((item, i) => (
                  <li key={i} style={{ fontSize: 12.5, color: "var(--text2)", display: "flex", gap: 7, lineHeight: 1.4 }}>
                    <span style={{ color, flexShrink: 0, marginTop: 1 }}>–</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Tips */}
      <div style={{ marginTop: 20, background: "var(--bg2)", border: "1.5px solid var(--border)", borderRadius: 14, padding: "16px 18px", boxShadow: "var(--shadow)" }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 14 }}>✦ Do's & Don'ts</h3>
        <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div>
            <div style={{ color: "var(--accent)", fontWeight: 700, fontSize: 12, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.8 }}>Do's</div>
            {["Eat mindfully, chew slowly", "Balance protein, fats & carbs", "Prioritize protein at breakfast", "Drink 8 glasses of water"].map(t => (
              <div key={t} style={{ fontSize: 12, color: "var(--text2)", marginBottom: 6, display: "flex", gap: 7, lineHeight: 1.4 }}>
                <span style={{ color: "var(--accent)", flexShrink: 0 }}>✓</span>{t}
              </div>
            ))}
          </div>
          <div>
            <div style={{ color: "var(--accent2)", fontWeight: 700, fontSize: 12, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.8 }}>Don'ts</div>
            {["Skip breakfast", "Eat ultra-processed foods", "Chips, instant noodles, packaged snacks"].map(t => (
              <div key={t} style={{ fontSize: 12, color: "var(--text2)", marginBottom: 6, display: "flex", gap: 7, lineHeight: 1.4 }}>
                <span style={{ color: "var(--accent2)", flexShrink: 0 }}>✗</span>{t}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}