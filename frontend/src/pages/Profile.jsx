import { useState, useEffect } from "react";
import { api } from "../api";

export default function Profile({ mealPlan }) {
  const { user } = mealPlan;
  const bmi       = (user.current_weight / ((user.height / 100) ** 2)).toFixed(1);
  const targetBmi = (user.target_weight  / ((user.height / 100) ** 2)).toFixed(1);
  const [weightHistory, setWeightHistory] = useState([]);

  useEffect(() => {
    api.getWeightHistory().then(setWeightHistory).catch(() => {});
  }, []);

  const Card = ({ children, style = {} }) => (
    <div style={{ background: "var(--bg2)", border: "1.5px solid var(--border)", borderRadius: 14, padding: "15px 17px", boxShadow: "var(--shadow)", ...style }}>
      {children}
    </div>
  );

  const SLabel = ({ children, color = "var(--text3)" }) => (
    <div style={{ fontSize: 10, color, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, marginBottom: 8 }}>{children}</div>
  );

  // Weight chart
  const last30 = weightHistory.slice(-30);
  const W = 300, H = 70;
  const minW = last30.length ? Math.min(...last30.map(d => d.weight)) - 0.5 : 50;
  const maxW = last30.length ? Math.max(...last30.map(d => d.weight)) + 0.5 : 70;
  const pts = last30.map((d, i) => {
    const x = last30.length < 2 ? W / 2 : (i / (last30.length - 1)) * W;
    const y = H - ((d.weight - minW) / (maxW - minW || 1)) * H;
    return `${x},${y}`;
  }).join(" ");

  const latestW = weightHistory.length ? weightHistory[weightHistory.length - 1].weight : null;
  const startW  = weightHistory.length ? weightHistory[0].weight : null;
  const totalChange = latestW && startW ? (latestW - startW).toFixed(1) : null;

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Profile</h1>
        <p style={{ color: "var(--text3)", marginTop: 3, fontSize: 13 }}>Personalized by Cult Transform</p>
      </div>

      {/* Hero */}
      <Card style={{ background: "var(--accent-light)", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center", border: "none" }}>
        <div>
          <div style={{ fontSize: 26, fontWeight: 700, color: "var(--accent)", letterSpacing: "-0.04em" }}>{user.name}</div>
          <div style={{ color: "var(--text2)", fontSize: 13, marginTop: 3 }}>{user.age} yrs · {user.gender} · {user.diet}</div>
          <div style={{ marginTop: 10, display: "flex", gap: 7, flexWrap: "wrap" }}>
            {[user.goal, "1400 kcal/day"].map(tag => (
              <span key={tag} style={{ background: "var(--bg2)", color: "var(--accent)", padding: "3px 11px", borderRadius: 20, fontSize: 11, fontWeight: 700, border: "1px solid var(--border2)" }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
        <span style={{ fontSize: 42 }}>🌿</span>
      </Card>

      {/* Stats Grid */}
      <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 12 }}>
        {[
          { label: "Current",    value: `${user.current_weight}kg`, color: "var(--accent2)", bg: "var(--accent2-light)" },
          { label: "Target",     value: `${user.target_weight}kg`,  color: "var(--accent)",  bg: "var(--accent-light)" },
          { label: "Height",     value: `${user.height}cm`,         color: "var(--accent3)", bg: "var(--accent3-light)" },
          { label: "BMI Now",    value: bmi,                        color: "var(--yellow)",  bg: "var(--yellow-light)" },
          { label: "BMI Target", value: targetBmi,                  color: "var(--accent)",  bg: "var(--accent-light)" },
          { label: "To Lose",    value: `${user.current_weight - user.target_weight}kg`, color: "var(--purple)", bg: "var(--purple-light)" },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: 12, padding: "11px 13px", textAlign: "center" }}>
            <div style={{ fontSize: 10, color: s.color, textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 700, marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 19, fontWeight: 700, color: s.color, letterSpacing: "-0.03em" }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Weight History Chart */}
      {last30.length > 0 && (
        <Card style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <SLabel color="var(--accent2)">⚖️ Weight History</SLabel>
            {totalChange !== null && (
              <span style={{
                fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                background: totalChange > 0 ? "var(--accent2-light)" : "var(--accent-light)",
                color: totalChange > 0 ? "var(--accent2)" : "var(--accent)",
              }}>
                {totalChange > 0 ? "▲" : "▼"} {Math.abs(totalChange)} kg total
              </span>
            )}
          </div>
          <svg width="100%" viewBox={`0 0 ${W} ${H + 10}`} style={{ overflow: "visible" }}>
            {/* Target line */}
            <line
              x1={0} x2={W}
              y1={H - ((user.target_weight - minW) / (maxW - minW || 1)) * H}
              y2={H - ((user.target_weight - minW) / (maxW - minW || 1)) * H}
              stroke="var(--accent)" strokeWidth="1" strokeDasharray="4,4" opacity="0.5"
            />
            <polyline fill="none" stroke="var(--accent2)" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round" points={pts} />
            {last30.map((d, i) => {
              const x = last30.length < 2 ? W / 2 : (i / (last30.length - 1)) * W;
              const y = H - ((d.weight - minW) / (maxW - minW || 1)) * H;
              return <circle key={i} cx={x} cy={y} r="3.5" fill="var(--accent2)" />;
            })}
          </svg>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
            <span style={{ fontSize: 10, color: "var(--text3)" }}>Start: {last30[0]?.weight}kg</span>
            <span style={{ fontSize: 10, color: "var(--accent)", opacity: 0.7 }}>— Target: {user.target_weight}kg</span>
            <span style={{ fontSize: 10, color: "var(--text3)" }}>Latest: {last30[last30.length-1]?.weight}kg</span>
          </div>
          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 5, maxHeight: 140, overflowY: "auto" }}>
            {[...weightHistory].reverse().slice(0, 10).map(d => (
              <div key={d.date} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text2)", padding: "4px 0", borderBottom: "1px solid var(--border)" }}>
                <span>{new Date(d.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
                <span style={{ fontWeight: 700, color: "var(--text)" }}>{d.weight} kg</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {last30.length === 0 && (
        <Card style={{ marginBottom: 12, textAlign: "center", padding: "20px" }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>⚖️</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text2)", marginBottom: 4 }}>No weight logs yet</div>
          <div style={{ fontSize: 12, color: "var(--text3)" }}>Log your daily weight from the Dashboard to see your progress chart here.</div>
        </Card>
      )}

      {/* Macro Sources */}
      <Card style={{ marginBottom: 12 }}>
        <SLabel>📋 Macro Sources Guide</SLabel>
        <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
          {[
            { label: "Grains & Carbs", color: "var(--accent3)", items: "Brown rice, red rice, wheat, millets, quinoa, oats, banana, berries, melons, plums, peaches" },
            { label: "Vegetables",     color: "var(--accent)",  items: "Green leafy vegetables, gourds, beans, cauliflower, broccoli, cabbage, ladies finger, brinjal, cucumber" },
            { label: "Proteins",       color: "var(--accent2)", items: "Pulses, lentils, eggs, lean meat, Greek yogurt, paneer, tofu, whey protein, tempeh, edamame" },
            { label: "Fats",           color: "var(--yellow)",  items: "Almonds, walnuts, pistachios, sunflower seeds, avocado, coconut. Oils: groundnut, sesame, mustard, rice bran" },
          ].map(m => (
            <div key={m.label} style={{ background: "var(--bg3)", borderRadius: 10, padding: "11px 12px", borderLeft: `3px solid ${m.color}` }}>
              <div style={{ color: m.color, fontWeight: 700, fontSize: 11, marginBottom: 4 }}>{m.label}</div>
              <div style={{ color: "var(--text2)", fontSize: 11, lineHeight: 1.55 }}>{m.items}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Measurement Guide */}
      <Card>
        <SLabel>🥄 Measurement Guide</SLabel>
        <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 9 }}>
          {[
            { name: "Katori",      desc: "150 ml — carbs, proteins, veggies", emoji: "🥣" },
            { name: "Scoop",       desc: "60 ml · 30g — protein powder",      emoji: "🥄" },
            { name: "Piece",       desc: "<20g or 2 pcs under 50g",           emoji: "🫓" },
            { name: "Glass",       desc: "150 ml — liquid proteins, milk",    emoji: "🥛" },
            { name: "Cult Plate",  desc: "9 inch — full balanced meal",       emoji: "🍽️" },
            { name: "Kitchen Scale", desc: "Portable — measure all foods",    emoji: "⚖️" },
          ].map(m => (
            <div key={m.name} style={{ background: "var(--bg3)", borderRadius: 10, padding: "10px" }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{m.emoji}</div>
              <div style={{ fontWeight: 700, fontSize: 11, color: "var(--text)", marginBottom: 2 }}>{m.name}</div>
              <div style={{ fontSize: 10, color: "var(--text3)", lineHeight: 1.4 }}>{m.desc}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}