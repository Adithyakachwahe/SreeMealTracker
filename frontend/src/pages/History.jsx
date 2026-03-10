import { useState, useEffect } from "react";
import { api } from "../api";

const MEAL_COLORS = {
  detox: "var(--accent)", meal1: "var(--accent2)", meal2: "var(--accent3)",
  meal3: "var(--yellow)", snack1: "var(--purple)", snack2: "var(--pink)"
};

export default function History({ today }) {
  const [history, setHistory] = useState([]);
  const [selectedDate, setSelectedDate] = useState(today);
  const [dayLogs, setDayLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getHistory().then(setHistory).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedDate) return;
    setLoading(true);
    api.getLogs(selectedDate).then(logs => { setDayLogs(logs); setLoading(false); }).catch(() => setLoading(false));
  }, [selectedDate]);

  const histMap = {};
  history.forEach(h => { histMap[h.date] = h.count; });

  const days = [];
  for (let i = 27; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }

  const getColor = (count) => {
    if (!count) return "var(--bg3)";
    if (count <= 3) return "#b8ddb5";
    if (count <= 7) return "#6abb66";
    return "var(--accent)";
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>History</h1>
        <p style={{ color: "var(--text3)", marginTop: 3, fontSize: 13 }}>Your intake consistency — last 28 days</p>
      </div>

      {/* Heatmap */}
      <div style={{ background: "var(--bg2)", border: "1.5px solid var(--border)", borderRadius: 14, padding: "16px 18px", marginBottom: 16, boxShadow: "var(--shadow)" }}>
        <div style={{ fontWeight: 600, color: "var(--accent)", fontSize: 13, marginBottom: 12 }}>Activity Heatmap</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 5 }}>
          {days.map(d => {
            const count = histMap[d] || 0;
            const isSelected = d === selectedDate;
            const isToday = d === today;
            return (
              <div key={d} onClick={() => setSelectedDate(d)} title={`${d}: ${count}`}
                style={{
                  aspectRatio: "1", background: isSelected ? "var(--accent)" : getColor(count),
                  borderRadius: 5, cursor: "pointer",
                  border: isToday && !isSelected ? "2px solid var(--accent)" : "2px solid transparent",
                  transition: "all 0.15s",
                  boxShadow: isSelected ? "0 2px 8px rgba(61,139,55,0.3)" : "none",
                }} />
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 10, alignItems: "center" }}>
          <span style={{ fontSize: 10, color: "var(--text3)" }}>Less</span>
          {["var(--bg3)", "#b8ddb5", "#6abb66", "var(--accent)"].map(c => (
            <div key={c} style={{ width: 12, height: 12, background: c, borderRadius: 3, border: "1px solid var(--border)" }} />
          ))}
          <span style={{ fontSize: 10, color: "var(--text3)" }}>More</span>
        </div>
      </div>

      {/* Day Detail */}
      <div style={{ background: "var(--bg2)", border: "1.5px solid var(--border)", borderRadius: 14, padding: "16px 18px", boxShadow: "var(--shadow)" }}>
        <div style={{ fontWeight: 600, color: "var(--text)", fontSize: 14, marginBottom: 14 }}>
          {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          <span style={{ marginLeft: 8, fontSize: 11, color: "var(--text3)", fontWeight: 400 }}>{dayLogs.length} items</span>
        </div>

        {loading ? (
          <div style={{ color: "var(--text3)", fontSize: 13 }}>Loading…</div>
        ) : dayLogs.length === 0 ? (
          <div style={{ color: "var(--text3)", fontSize: 13, padding: "12px 0" }}>No logs for this day. Tap a day on the heatmap above.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {dayLogs.map((log, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 12px", background: "var(--bg3)",
                borderRadius: 9, border: "1px solid var(--border)",
                borderLeft: `3px solid ${MEAL_COLORS[log.meal_type] || "var(--border2)"}`,
              }}>
                <span style={{ fontSize: 11, color: MEAL_COLORS[log.meal_type] || "var(--text3)", minWidth: 52, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  {log.meal_type?.replace(/([a-z])(\d)/, "$1 $2")}
                </span>
                <span style={{ fontSize: 13, color: "var(--text)", flex: 1 }}>{log.item}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}