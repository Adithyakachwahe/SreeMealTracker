const NAV = [
  { key: "dashboard", label: "Dashboard",     icon: "⊞" },
  { key: "today",     label: "Today's Tracker", icon: "✦" },
  { key: "weekly",    label: "Weekly Plan",   icon: "◫" },
  { key: "history",   label: "History",       icon: "◷" },
  { key: "profile",   label: "Profile",       icon: "◉" },
];

export default function Sidebar({ page, setPage, user, darkMode, toggleDark }) {
  return (
    <aside className="sidebar">
      {/* Logo */}
      <div style={{ padding: "20px 18px 16px", borderBottom: "1.5px solid var(--border)" }}>
        <div style={{ fontSize: 17, color: "var(--accent)", fontWeight: 700, letterSpacing: "-0.04em" }}>Sree's</div>
        <div style={{ fontSize: 11, color: "var(--text3)", fontWeight: 500, letterSpacing: "0.02em", marginTop: 1 }}>MEAL TRACKER</div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV.map(n => (
          <button key={n.key} className="btn" onClick={() => setPage(n.key)}
            style={{
              background: page === n.key ? "var(--accent-light)" : "transparent",
              color: page === n.key ? "var(--accent)" : "var(--text2)",
              border: page === n.key ? "1.5px solid var(--border2)" : "1.5px solid transparent",
              padding: "9px 12px", borderRadius: 9,
              display: "flex", alignItems: "center", gap: 9,
              fontSize: 13, textAlign: "left", width: "100%",
              fontWeight: page === n.key ? 600 : 400,
            }}>
            <span style={{ fontSize: 14 }}>{n.icon}</span>
            {n.label}
          </button>
        ))}
      </nav>

      {/* Dark mode toggle */}
      <div style={{ padding: "12px 14px", borderTop: "1.5px solid var(--border)", borderBottom: "1.5px solid var(--border)" }}>
        <button className="btn" onClick={toggleDark}
          style={{
            width: "100%", padding: "9px 12px", borderRadius: 9,
            background: "var(--bg3)", border: "1.5px solid var(--border)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            fontSize: 13, color: "var(--text2)",
          }}>
          <span>{darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}</span>
          <div style={{
            width: 36, height: 20, borderRadius: 10,
            background: darkMode ? "var(--accent)" : "var(--border2)",
            position: "relative", transition: "background 0.2s", flexShrink: 0,
          }}>
            <div style={{
              position: "absolute", top: 2, left: darkMode ? 18 : 2,
              width: 16, height: 16, borderRadius: "50%",
              background: "#fff", transition: "left 0.2s",
              boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
            }} />
          </div>
        </button>
      </div>

      {/* Footer */}
      <div style={{ padding: "12px 18px 16px" }}>
        <div style={{ fontSize: 10, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>Goal</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--accent)", letterSpacing: "-0.02em" }}>
          {user.current_weight} kg → {user.target_weight} kg
        </div>
        <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>{user.calories} kcal / day</div>
      </div>
    </aside>
  );
}